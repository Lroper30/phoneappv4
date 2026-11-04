AP WORLD: EMPIRE QUEST
======================

RUN THE STUDY GAME
1. Open this folder in Visual Studio Code.
2. Use Live Server to open index.html.
3. Play the original Unit 3 questions or create a study set in the library.

STUDY SETS
- The original AP World Unit 3 questions remain available in the original set.
- Create your own sets and add multiple-choice questions. Sets save in this browser.
- Guide import accepts text-based PDF, DOCX, TXT, and Markdown files.
- PDF/DOCX readers load from a CDN, so document import needs an internet connection.
- Scanned/image-only PDFs need OCR before upload.
- Review AI-generated answers before studying; uploaded text is sent to Gemini.

ENABLE AI QUESTION GENERATION
AI generation uses Firebase Authentication (anonymous sign-in), a Firebase
callable Cloud Function, and Gemini. Do not put a Gemini API key in browser code.
1. Create a Firebase project and register a web app.
2. Enable Authentication > Sign-in method > Anonymous.
3. Register a reCAPTCHA v3 site key for Firebase App Check; enable App Check for
   the web app. Put its site key in window.EMPIRE_QUEST_RECAPTCHA_SITE_KEY in
   config.js. Add the site domain to the reCAPTCHA allowed domains.
4. Copy the public web app configuration into config.js as the value of
   window.EMPIRE_QUEST_FIREBASE_CONFIG (replace null; do not put secrets there).
5. Install the Firebase CLI, sign in, and select your project with
   `firebase use --add`.
6. From this folder, run `cd functions && npm install`.
7. Store the Gemini key as a Firebase secret with
   `firebase functions:secrets:set GEMINI_API_KEY`.
8. Deploy from this folder with `firebase deploy --only functions`.
9. Serve index.html over localhost or HTTPS. Firebase callable functions require
   a valid project configuration and deployed function.
Cloud Functions deployment may require the Firebase Blaze billing plan. Gemini
usage may also incur charges; set billing alerts and quotas before sharing.

ONLINE MULTIPLAYER
The included WebSocket server supports host/join rooms, room codes, live quiz
questions, answer checking, and scoreboards (up to 20 players per room).
1. From this folder, run `npm install`.
2. Run `npm run start:rooms` to start the room server on port 8787.
3. For local play, keep `ws://localhost:8787` in config.js and open the app on
   this computer. Other devices cannot reach localhost on your computer.
4. For online play, deploy multiplayer-server.js to a Node host with WebSocket
   support and set window.EMPIRE_QUEST_MULTIPLAYER_URL in config.js to its
   wss:// URL. Use HTTPS for the app and WSS for the server in production.

FILES
- index.html, style.css, features.css: browser interface
- script.js: original game, study-set library, document import, and room client
- config.js, firebase-client.js: public client settings and Firebase connector
- functions/: secure Gemini callable Cloud Function
- multiplayer-server.js: self-hosted realtime room server

Progress and custom study sets save in localStorage on this device. To reset
progress, run localStorage.removeItem("empireQuestStats") in the browser console.
To reset custom sets, run localStorage.removeItem("empireQuestStudySets").
