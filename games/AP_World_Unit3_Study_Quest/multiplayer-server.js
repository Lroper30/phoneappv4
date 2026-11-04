const http = require("node:http");
const { randomInt, randomUUID } = require("node:crypto");
const { WebSocketServer, WebSocket } = require("ws");

const port = Number(process.env.PORT || 8787);
const server = http.createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "ok", rooms: rooms.size }));
    return;
  }
  response.writeHead(404);
  response.end("Not found");
});
const sockets = new WebSocketServer({ server, maxPayload: 16 * 1024 });
const rooms = new Map();
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function send(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}

function sendError(socket, message) {
  send(socket, { type: "error", message });
}

function createCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join("");
  } while (rooms.has(code));
  return code;
}

function publicPlayers(room) {
  return [...room.players.values()].map(({ id, name, host, score }) => ({ id, name, host, score }));
}

function broadcast(room, payload) {
  for (const player of room.players.values()) send(player.socket, payload);
}

function joinRoom(socket, room, name, host = false) {
  const player = { id: randomUUID(), name, host, score: 0, socket };
  room.players.set(player.id, player);
  socket.playerId = player.id;
  socket.roomCode = room.code;
  send(socket, { type: "joined", code: room.code, host, players: publicPlayers(room) });
  broadcast(room, { type: "players", players: publicPlayers(room) });
}

function leaveRoom(socket) {
  const room = rooms.get(socket.roomCode);
  if (!room) return;
  const player = room.players.get(socket.playerId);
  if (!player) return;

  if (player.host) {
    broadcast(room, { type: "error", message: "The host left. This room has closed." });
    for (const other of room.players.values()) other.socket.close(1000, "Host left");
    rooms.delete(room.code);
    return;
  }

  room.players.delete(player.id);
  room.answers.delete(player.id);
  if (room.players.size === 0) {
    rooms.delete(room.code);
    return;
  }
  broadcast(room, { type: "players", players: publicPlayers(room) });
  if (room.currentQuestion && room.answers.size === room.players.size) {
    broadcast(room, { type: "round-results", round: room.round, players: publicPlayers(room) });
  }
}

function handleMessage(socket, message) {
  if (!socket.roomCode) {
    if (message.type === "create") {
      const name = typeof message.name === "string" ? message.name.trim().slice(0, 20) : "";
      if (!name) return sendError(socket, "Enter a player name.");
      const room = { code: createCode(), players: new Map(), answers: new Set(), hostId: null, started: false, currentQuestion: null, round: 0 };
      rooms.set(room.code, room);
      joinRoom(socket, room, name, true);
      room.hostId = socket.playerId;
      return;
    }

    if (message.type === "join") {
      const code = typeof message.code === "string" ? message.code.trim().toUpperCase() : "";
      const name = typeof message.name === "string" ? message.name.trim().slice(0, 20) : "";
      const room = rooms.get(code);
      if (!name) return sendError(socket, "Enter a player name.");
      if (!room) return sendError(socket, "That room code was not found.");
      if (room.started) return sendError(socket, "That game has already started.");
      if (room.players.size >= 20) return sendError(socket, "That room is full (20 players maximum).");
      joinRoom(socket, room, name);
      return;
    }

    return sendError(socket, "Create or join a room first.");
  }

  const room = rooms.get(socket.roomCode);
  const player = room?.players.get(socket.playerId);
  if (!room || !player) return sendError(socket, "This room is no longer available.");
  const isHost = player.id === room.hostId;

  if (message.type === "leave") {
    send(socket, { type: "left" });
    leaveRoom(socket);
    socket.close(1000, "Left room");
    return;
  }
  if (message.type === "start") {
    if (!isHost) return sendError(socket, "Only the host can start the game.");
    if (room.started) return sendError(socket, "This game is already running.");
    if (room.players.size < 1) return sendError(socket, "The room has no players.");
    for (const roomPlayer of room.players.values()) roomPlayer.score = 0;
    room.started = true;
    broadcast(room, { type: "started" });
    return;
  }
  if (message.type === "question") {
    if (!isHost || !room.started) return sendError(socket, "Only the host can send questions during a game.");
    const question = message.question;
    if (
      !question ||
      typeof question.prompt !== "string" ||
      question.prompt.length > 240 ||
      !Array.isArray(question.choices) ||
      question.choices.length !== 4 ||
      question.choices.some((choice) => typeof choice !== "string" || !choice.trim() || choice.length > 180) ||
      new Set(question.choices.map((choice) => choice.trim().toLowerCase())).size !== 4 ||
      !Number.isInteger(question.answerIndex) ||
      question.answerIndex < 0 ||
      question.answerIndex > 3 ||
      typeof question.explanation !== "string" ||
      question.explanation.length > 500
    ) return sendError(socket, "The host sent an invalid question.");
    room.currentQuestion = { ...question };
    room.answers.clear();
    room.round = Number.isInteger(question.round) ? question.round : room.round + 1;
    const { answerIndex, explanation, ...publicQuestion } = question;
    broadcast(room, { type: "question", question: publicQuestion });
    return;
  }
  if (message.type === "answer") {
    if (!room.currentQuestion || room.answers.has(player.id)) return sendError(socket, "You cannot submit an answer right now.");
    if (!Number.isInteger(message.choiceIndex) || message.choiceIndex < 0 || message.choiceIndex > 3) {
      return sendError(socket, "Choose one of the answers.");
    }
    room.answers.add(player.id);
    const correct = message.choiceIndex === room.currentQuestion.answerIndex;
    if (correct) player.score += 100;
    send(socket, {
      type: "answer-result",
      correct,
      explanation: room.currentQuestion.explanation
    });
    if (room.answers.size === room.players.size) {
      room.currentQuestion = null;
      broadcast(room, { type: "round-results", round: room.round, players: publicPlayers(room) });
    }
    return;
  }
  if (message.type === "end") {
    if (!isHost) return sendError(socket, "Only the host can end the game.");
    room.started = false;
    room.currentQuestion = null;
    room.answers.clear();
    broadcast(room, { type: "ended", players: publicPlayers(room) });
    return;
  }
  sendError(socket, "Unknown room action.");
}

sockets.on("connection", (socket) => {
  socket.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (error) {
      console.warn("Discarded invalid multiplayer message.", error.message);
      sendError(socket, "The room server received invalid data.");
      return;
    }
    if (!message || typeof message !== "object" || typeof message.type !== "string") {
      sendError(socket, "The room server received an invalid action.");
      return;
    }
    try {
      handleMessage(socket, message);
    } catch (error) {
      console.error("Could not process multiplayer message.", error);
      sendError(socket, "The room server could not process that action.");
    }
  });
  socket.on("close", () => leaveRoom(socket));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Empire Quest multiplayer server listening on port ${port}`);
});
