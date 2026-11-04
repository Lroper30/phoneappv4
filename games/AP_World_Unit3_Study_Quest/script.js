const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const bank = [
  // Ottoman
  ["Who captured Constantinople in 1453?","Mehmed II","Suleiman","Akbar","Babur","Mehmed II captured Constantinople, ending the Byzantine Empire. It became the Ottoman capital, Istanbul.","Ottoman Empire"],
  ["What was the devshirme system?","Recruiting Christian boys from the Balkans for state service","A tax on non-Muslims","A treaty with Persia","A Protestant movement","The boys were converted to Islam and trained as soldiers or officials.","Ottoman Empire"],
  ["Who were the Janissaries?","Elite Ottoman infantry","Safavid merchants","Mughal tax collectors","Catholic missionaries","Janissaries were elite soldiers recruited through the devshirme system and loyal to the sultan.","Ottoman Empire"],
  ["What did the Ottoman millet system allow?","Religious communities to manage their own internal affairs","Every subject to avoid taxes","Only Muslims to govern","Princes to choose Lutheranism","The system let non-Muslim communities keep their religious leaders and manage internal affairs.","Ottoman Empire"],
  ["What is tax farming?","Selling the right to collect taxes to private individuals","A tax paid only by farmers","A military recruitment system","A religious school system","Tax farmers collected taxes and kept a share, sending the rest to the state.","Ottoman Empire"],
  ["Which ruler led the Ottoman Empire at its height?","Suleiman the Magnificent","Shah Abbas I","Aurangzeb","Martin Luther","Suleiman ruled from 1520 to 1566 and reformed laws while expanding Ottoman power.","Ottoman Empire"],
  // Safavid
  ["Who founded the Safavid Empire in 1501?","Shah Ismail I","Babur","Mehmed II","Henry VIII","Shah Ismail I founded the Safavid Empire and made Shi'a Islam its state religion.","Safavid Empire"],
  ["The Safavid Empire followed which branch of Islam?","Shi'a","Sunni","Catholic","Protestant","The Safavids were Shi'a, unlike the Sunni Ottomans.","Safavid Empire"],
  ["Who were the Qizilbash?","Turkic Shi'a warriors who supported Safavid shahs","Ottoman tax collectors","Mughal artists","English Protestants","The Qizilbash were important military supporters of the Safavid rulers.","Safavid Empire"],
  ["What happened at the Battle of Chaldiran in 1514?","The Ottomans defeated the Safavids","The Safavids conquered India","The Mughals defeated the British","The Byzantine Empire returned","Ottoman cannons and musketeers defeated Safavid cavalry, showing the power of gunpowder weapons.","Safavid Empire"],
  ["What is Shah Abbas I known for?","Modernizing the army and developing Isfahan","Capturing Constantinople","Starting the Reformation","Building the Taj Mahal","Abbas I ruled from 1588 to 1629 and strengthened the Safavid state.","Safavid Empire"],
  // Mughal
  ["Who founded the Mughal Empire in 1526?","Babur","Akbar","Aurangzeb","Shah Jahan","Babur founded the Mughal Empire after the Battle of Panipat.","Mughal Empire"],
  ["Which Mughal ruler was known for religious tolerance?","Akbar","Aurangzeb","Babur","Shah Jahan","Akbar abolished the jizya and included Hindus in government to build loyalty.","Mughal Empire"],
  ["What was the jizya?","A tax paid by non-Muslims in a Muslim state","A type of cannon","A Mughal palace","A Protestant pamphlet","Akbar abolished the tax, while Aurangzeb brought it back.","Mughal Empire"],
  ["What were zamindars?","Local landowners who collected taxes for the Mughal state","Elite Ottoman soldiers","Safavid religious leaders","Jesuit missionaries","Zamindars collected taxes from peasants and kept a share.","Mughal Empire"],
  ["Who built the Taj Mahal?","Shah Jahan","Akbar","Babur","Aurangzeb","The Taj Mahal was a tomb built under Shah Jahan and displayed Mughal wealth and power.","Mughal Empire"],
  ["Which Mughal ruler restored the jizya and fought costly Deccan wars?","Aurangzeb","Akbar","Babur","Shah Jahan","Aurangzeb's strict policies and wars contributed to revolts and decline.","Mughal Empire"],
  ["What was Din-i Ilahi?","Akbar's blended faith, which never spread widely","The Ottoman tax system","A Safavid army","The Anglican Church","It drew on Islam, Hinduism, and other beliefs.","Mughal Empire"],
  // Reformation
  ["Who posted the 95 Theses in 1517?","Martin Luther","John Calvin","Henry VIII","Ignatius of Loyola","Luther challenged Catholic Church practices, especially the sale of indulgences.","Reformation"],
  ["What Church practice did Luther most directly criticize?","The sale of indulgences","The use of printing presses","The building of schools","The millet system","Luther argued that salvation could not be bought through indulgences.","Reformation"],
  ["How did the printing press help Protestant ideas spread?","It made pamphlets and Bibles faster and cheaper to produce","It stopped people reading the Bible","It created the Ottoman army","It collected taxes","Printed materials helped ideas spread more quickly across Europe.","Reformation"],
  ["What did John Calvin teach?","Predestination","The millet system","Tax farming","Shi'a Islam","Calvin taught that God had already determined who would be saved.","Reformation"],
  ["Why did Henry VIII create the Anglican Church?","He wanted to break with Rome and control the English Church","He wanted to support Shah Ismail","He wanted to abolish all taxes","He wanted to start the Jesuits","His motives were mainly political and personal, including wanting an annulment.","Reformation"],
  // Catholic reform/conflict
  ["What was the Catholic Counter-Reformation?","The Catholic Church's effort to reform and respond to Protestantism","A Mughal tax policy","The Safavid conquest of Persia","The Ottoman capture of Vienna","Its goals included addressing abuses, reaffirming Catholic beliefs, and winning followers.","Catholic Reformation"],
  ["What did the Council of Trent do?","Reaffirmed Catholic doctrine and addressed abuses","Created the Mughal Empire","Ended the Ottoman Empire","Made Shi'a Islam the state religion","It reaffirmed Catholic teachings, addressed abuses, and improved priest training.","Catholic Reformation"],
  ["Who founded the Jesuits?","Ignatius of Loyola","Martin Luther","John Calvin","Mehmed II","The Jesuits focused on education and missionary work.","Catholic Reformation"],
  ["What did the Peace of Augsburg (1555) allow?","Each German prince could choose Lutheranism or Catholicism for their territory","All Europe had to become Catholic","The Safavids could choose the Ottoman ruler","The Mughal emperor could choose Hinduism","It strengthened German princes and kept the Holy Roman Empire divided.","Catholic Reformation"],
  ["What ended the Thirty Years' War in 1648?","The Peace of Westphalia","The Peace of Augsburg","The Battle of Chaldiran","The Treaty of Panipat","Westphalia ended the war and strengthened state sovereignty.","Catholic Reformation"],
  // comparisons and decline
  ["Why are the Ottoman, Safavid, and Mughal states called gunpowder empires?","They used cannons and firearms to conquer territory and centralize power","They invented the printing press","They all followed Shi'a Islam","They refused to build armies","Gunpowder weapons gave their armies an advantage in expansion.","Comparison"],
  ["Which statement correctly compares Ottoman and Mughal treatment of non-Muslims?","Both sometimes allowed religious practice, but Akbar abolished jizya while Ottomans retained it","Both forced everyone to convert","Neither collected taxes","The Mughals used the millet system exactly like the Ottomans","The Ottomans used millets and kept jizya; Akbar promoted tolerance and abolished jizya.","Comparison"],
  ["What was one shared way all three empires legitimized their rule?","Religion and monumental architecture","Democracy and elections","Ending all taxes","Rejecting military power","Religious authority and impressive buildings displayed wealth, piety, and power.","Comparison"],
  ["What was one similarity between Ottoman tax farming and Mughal zamindars?","Both used agents to collect taxes for the state","Both were elite infantry","Both spread Protestantism","Both abolished taxes","Local or private agents collected revenue, but could gain power themselves.","Comparison"],
  ["What helped all three gunpowder empires expand in the 1500s?","Centralized armies using cannons and muskets","The printing press","The Peace of Westphalia","The British East India Company","Gunpowder weapons gave them military advantages over some neighbors.","Expansion & Decline"],
  ["Which event marked a major Ottoman setback in 1683?","The failed siege of Vienna","The capture of Constantinople","The Battle of Panipat","The Council of Trent","The failed siege was one sign of growing Ottoman military challenges.","Expansion & Decline"],
  ["What happened to the Safavid capital Isfahan in 1722?","Afghan invaders captured it","The Ottomans made it their capital","The Mughals built the Taj Mahal there","It became the Anglican capital","The Afghan capture was a major blow to the weakened Safavid Empire.","Expansion & Decline"],
  ["Which group of factors contributed to Mughal decline?","Aurangzeb's policies, costly wars, revolts, and British East India Company growth","The Council of Trent and Jesuit schools","The fall of Constantinople","The Peace of Augsburg","These pressures weakened Mughal central authority and resources.","Expansion & Decline"]
];

const flashcards = [
 ["Mehmed II","Ottoman sultan who captured Constantinople in 1453."],
 ["Suleiman the Magnificent","Ottoman ruler during the empire's height (1520–1566)."],
 ["Devshirme","Ottoman system that took Christian boys from the Balkans, converted them, and trained them for state service."],
 ["Janissaries","Elite Ottoman infantry recruited through the devshirme system."],
 ["Millet system","Allowed non-Muslim religious communities to manage their internal affairs."],
 ["Tax farming","Selling the right to collect taxes to private individuals, who kept a share."],
 ["Shah Ismail I","Founded the Safavid Empire in 1501 and made Shi'a Islam the state religion."],
 ["Qizilbash","Turkic Shi'a warriors who supported Safavid shahs."],
 ["Battle of Chaldiran (1514)","Ottoman victory over the Safavids; showed the power of gunpowder weapons."],
 ["Shah Abbas I","Safavid ruler who modernized the army and developed Isfahan."],
 ["Babur","Founded the Mughal Empire after the Battle of Panipat in 1526."],
 ["Akbar","Mughal ruler known for tolerance; abolished the jizya."],
 ["Jizya","Tax paid by non-Muslims in a Muslim state."],
 ["Din-i Ilahi","Akbar's blended faith drawing on Islam, Hinduism, and other religions; never spread widely."],
 ["Zamindars","Local landowners who collected taxes for the Mughal state."],
 ["Taj Mahal","Tomb built under Shah Jahan; showed Mughal wealth and power."],
 ["Aurangzeb","Mughal ruler who restored jizya and fought costly wars; his policies contributed to decline."],
 ["Martin Luther","German monk whose 95 Theses in 1517 helped start the Protestant Reformation."],
 ["Indulgences","Church pardons that reduced punishment for sin; their sale was criticized by Luther."],
 ["John Calvin","Protestant reformer who taught predestination."],
 ["Anglican Church","Church of England, created after Henry VIII broke with Rome in 1534."],
 ["Council of Trent","Catholic meetings (1545–1563) that reaffirmed doctrine and addressed abuses."],
 ["Jesuits","Catholic order founded by Ignatius of Loyola; focused on schools and missions."],
 ["Peace of Augsburg (1555)","Allowed German princes to choose Lutheranism or Catholicism for their territories."],
 ["Thirty Years' War","European religious and political war (1618–1648)."],
 ["Peace of Westphalia (1648)","Ended the Thirty Years' War and strengthened state sovereignty."]
];

const timeline = [
 ["1453","Ottomans capture Constantinople"],
 ["1501","Shah Ismail I founds the Safavid Empire"],
 ["1514","Battle of Chaldiran"],
 ["1517","Martin Luther's 95 Theses"],
 ["1526","Babur establishes the Mughal Empire"],
 ["1534","Henry VIII breaks with Rome; Anglican Church"],
 ["1545–1563","Council of Trent"],
 ["1555","Peace of Augsburg"],
 ["1618–1648","Thirty Years' War"],
 ["1648","Peace of Westphalia"],
 ["1683","Ottoman siege of Vienna fails"],
 ["1722","Afghan invaders capture Isfahan"]
];

const DEFAULT_SET_ID="ap-world-unit3";
let studySets=loadStudySets(), mode="quiz", questions=[], index=0, correct=0, earned=0, missed=[], answered=false, flashIndex=0, flashKnown=0, matchPairs=[], matchSelected=null, matchDone=0, timer=null, seconds=0, activeFlashcards=flashcards, activeSetId=DEFAULT_SET_ID, editingSetId=null, editingQuestionIndex=null;
function loadStudySets(){
 try{
   const saved=JSON.parse(localStorage.getItem("empireQuestStudySets")||"[]");
   if(!Array.isArray(saved))throw new Error("Saved study sets are not a list.");
   return saved.filter(s=>s&&typeof s.id==="string"&&typeof s.name==="string"&&Array.isArray(s.questions));
 }catch(error){console.error("Could not load saved study sets.",error);return[]}
}
function persistStudySets(){
 try{localStorage.setItem("empireQuestStudySets",JSON.stringify(studySets))}
 catch(error){console.error("Could not save study sets.",error);toast("Could not save this set. Check browser storage and try again.")}
}
function allStudySets(){return [{id:DEFAULT_SET_ID,name:"AP World History Unit 3",description:"The original Empire Quest questions, preserved.",questions:bank.map(q=>({prompt:q[0],answer:q[1],wrongAnswers:q.slice(2,5),explanation:q[5],topic:q[6]}))},...studySets]}
function questionToTuple(q){return[q.prompt,q.answer,...q.wrongAnswers,q.explanation||"",q.topic||"Study set"]}
let stats=JSON.parse(localStorage.getItem("empireQuestStats")||'{"xp":0,"best":0,"streak":0}');
const save=()=>{localStorage.setItem("empireQuestStats",JSON.stringify(stats));updateStats()};
function updateStats(){
 $("#xp").textContent=stats.xp;$("#streak").textContent=stats.streak;$("#best").textContent=stats.best;$("#game-xp").textContent=earned;
 $("#progress-xp").textContent=stats.xp+" XP";
 const ranks=[["Recruit",0],["Cadet",100],["Historian",250],["Scholar",450],["Commander",700],["History Legend",1000]];
 let rank=ranks[0],next=ranks[1];for(let i=0;i<ranks.length;i++){if(stats.xp>=ranks[i][1]){rank=ranks[i];next=ranks[i+1]||null}}
 $("#rank-text").textContent=rank[0]+" · "+(next?"Keep training to rise through the ranks.":"You have reached the top rank!");
 const pct=next?Math.min(100,(stats.xp-rank[1])/(next[1]-rank[1])*100):100;
 $("#progress-fill").style.width=pct+"%";$("#next-rank").textContent=next?(next[1]-stats.xp)+" XP to "+next[0]:"MAX RANK UNLOCKED";
}
updateStats();
function showScreen(id){$$(".screen").forEach(s=>s.classList.remove("active"));$("#"+id).classList.add("active");window.scrollTo({top:0,behavior:"smooth"})}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1700)}
function shuffle(a){return [...a].sort(()=>Math.random()-.5)}
function start(m,setId){
 mode=m;index=0;correct=0;earned=0;missed=[];answered=false;clearInterval(timer);
 activeSetId=setId||DEFAULT_SET_ID;
 const selectedSet=allStudySets().find(s=>s.id===activeSetId)||allStudySets()[0];
 const setQuestions=selectedSet.questions.map(questionToTuple);
 activeFlashcards=activeSetId===DEFAULT_SET_ID?flashcards:selectedSet.questions.map(q=>[q.prompt,[q.answer,q.explanation].filter(Boolean).join(" — ")]);
 showScreen("game-screen");$("#game-xp").textContent="0";$("#round-progress").style.width="0%";
 const titles={campaign:"Empire Campaign",quiz:"Quick Battle",flashcards:"Flashcard Forge",timeline:"Timeline Rush",match:"Match the Terms",boss:"Final Boss"};
 const kickers={campaign:"7 TOPICS · YOUR HISTORY JOURNEY",quiz:"RANDOM QUESTION BATTLE",flashcards:"FLIP · LEARN · REMEMBER",timeline:"PUT HISTORY IN ORDER",match:"CONNECT THE CLUES",boss:"FINAL UNIT CHALLENGE"};
 $("#game-heading").textContent=setId?selectedSet.name:titles[m];$("#game-kicker").textContent=setId?"STUDY SET · "+setQuestions.length+" QUESTIONS":kickers[m];
 if(setId&&!setQuestions.length){toast("Add at least one question before studying this set.");showScreen("home-screen");return}
 if(m==="flashcards"){flashIndex=0;flashKnown=0;renderFlash();return}
 if(m==="timeline"){renderTimeline();return}
 if(m==="match"){renderMatch();return}
 const count=m==="campaign"?14:m==="boss"?15:10;
 questions=shuffle(setQuestions).slice(0,count);
 if(m==="campaign"){ // balanced selection across all topics
   questions=setQuestions.filter((q,i)=>i%3===0).slice(0,count);
 }
 renderQuestion();
}
function renderQuestion(){
 const q=questions[index];answered=false;
 $("#round-progress").style.width=(index/questions.length*100)+"%";
 const options=shuffle([q[1],...shuffle(q.slice(2,5)).slice(0,3)]);
 $("#game-content").innerHTML=`<div class="question-card"><div class="question-meta"><span>${escapeHtml(String(q[6]||"Study set").toUpperCase())}</span><span>QUESTION ${index+1} / ${questions.length}</span></div><h3>${escapeHtml(q[0])}</h3><div class="answers">${options.map((o,i)=>`<button class="answer" data-answer="${escapeAttr(o)}"><span class="letter">${"ABCD"[i]}</span>${escapeHtml(o)}</button>`).join("")}</div><div class="feedback" id="feedback"></div><div class="next-row"><button class="primary" id="next-btn" disabled>${index===questions.length-1?"FINISH MISSION":"NEXT QUESTION →"}</button></div></div>`;
 $$(".answer").forEach(b=>b.addEventListener("click",()=>answerQuestion(b,q)));
 $("#next-btn").addEventListener("click",()=>{if(index<questions.length-1){index++;renderQuestion()}else finish()});
}
function answerQuestion(btn,q){
 if(answered)return;answered=true;
 const ok=btn.dataset.answer===q[1];const fb=$("#feedback");
 $$(".answer").forEach(b=>{b.disabled=true;if(b.dataset.answer===q[1])b.classList.add("correct")});
 if(ok){correct++;earned+=10;stats.streak++;fb.className="feedback show";fb.innerHTML=`<b>✓ Correct! +10 XP</b><br>${escapeHtml(q[5])}`;toast("+10 XP — nice work!")}
 else{stats.streak=0;missed.push(q);btn.classList.add("wrong");fb.className="feedback show bad";fb.innerHTML=`<b>Not quite — the answer is ${escapeHtml(q[1])}.</b><br>${escapeHtml(q[5])}`}
 stats.xp+=ok?10:0;stats.best=Math.max(stats.best,correct);save();$("#game-xp").textContent=earned;$("#next-btn").disabled=false;
}
function renderFlash(){
 const c=activeFlashcards[flashIndex];$("#round-progress").style.width=(flashIndex/activeFlashcards.length*100)+"%";
 $("#game-content").innerHTML=`<div class="tool-card"><div class="question-meta"><span>FLASHCARD FORGE</span><span>${flashIndex+1} / ${activeFlashcards.length}</span></div><div class="flashcard" id="flip-card"><div><div class="face-label" id="face-label">TERM</div><h3 id="face-main">${escapeHtml(c[0])}</h3><p id="face-extra">Tap the card to reveal the definition.</p></div></div><div class="flash-controls"><button class="secondary" id="prev-card" ${flashIndex===0?"disabled":""}>← BACK</button><span class="hint">Flip the card, then rate yourself</span><button class="primary" id="flip-next">FLIP CARD</button></div><div class="flash-controls" id="rate-row" style="display:none"><button class="secondary" id="still-learning">STILL LEARNING</button><button class="primary" id="got-it">GOT IT ✓</button></div></div>`;
 let flipped=false;$("#flip-card").addEventListener("click",flip);$("#flip-next").addEventListener("click",flip);
 function flip(){if(flipped)return;flipped=true;$("#face-label").textContent="DEFINITION";$("#face-main").textContent=c[0];$("#face-extra").textContent=c[1];$("#flip-next").style.display="none";$("#rate-row").style.display="flex"}
 $("#prev-card").addEventListener("click",()=>{flashIndex--;renderFlash()});
 $("#still-learning").addEventListener("click",()=>advance(false));$("#got-it").addEventListener("click",()=>advance(true));
 function advance(known){if(known){flashKnown++;earned+=2;stats.xp+=2;save()}if(flashIndex<activeFlashcards.length-1){flashIndex++;renderFlash()}else finishFlash()}
}
function finishFlash(){
 $("#round-progress").style.width="100%";
 $("#game-content").innerHTML=`<div class="tool-card" style="text-align:center"><div class="result-medal">🃏</div><h3>Flashcard set complete!</h3><p>You knew ${flashKnown} out of ${activeFlashcards.length} cards.</p><p>Review the cards you marked “Still Learning” and try again.</p><button class="primary" id="flash-done">FINISH</button></div>`;
 $("#flash-done").onclick=()=>{correct=flashKnown;questions=activeFlashcards.map(c=>[c[0],c[1]]);finish()};
}
function renderTimeline(){
 const sample=shuffle(timeline).slice(0,6);let selected=[];
 $("#game-content").innerHTML=`<div class="tool-card"><div class="question-meta"><span>TIMELINE RUSH</span><span>6 EVENTS</span></div><h3>Put these events in chronological order, earliest to latest.</h3><p class="hint">Tap the events in the order you think they happened.</p><div class="choice-list" id="timeline-list">${sample.map((e,i)=>`<button data-i="${i}">${escapeHtml(e[0])} — ${escapeHtml(e[1])}</button>`).join("")}</div><div class="feedback" id="timeline-feedback"></div><div class="next-row"><button class="primary" id="timeline-check" disabled>CHECK ORDER</button></div></div>`;
 $$("#timeline-list button").forEach(b=>b.onclick=()=>{if(b.classList.contains("selected"))return;b.classList.add("selected");selected.push(sample[Number(b.dataset.i)]);b.textContent=`${selected.length}. ${b.textContent}`;$("#timeline-check").disabled=selected.length!==sample.length});
 $("#timeline-check").onclick=()=>{const right=[...sample].sort((a,b)=>timeline.findIndex(x=>x[0]===a[0])-timeline.findIndex(x=>x[0]===b[0]));let score=selected.filter((e,i)=>e[0]===right[i][0]).length;correct=score;earned=score*8;stats.xp+=earned;stats.streak=score===6?stats.streak+1:0;stats.best=Math.max(stats.best,score);save();$("#timeline-feedback").className="feedback show";$("#timeline-feedback").innerHTML=`You got ${score}/6 in the correct position. Correct order: ${right.map(e=>e[0]).join(" → ")}.`;$("#timeline-check").textContent="FINISH";$("#timeline-check").onclick=finish};
}
function renderMatch(){
 const pairs=shuffle(activeFlashcards).slice(0,6);matchPairs=pairs;matchSelected=null;matchDone=0;
 const left=shuffle(pairs.map((p,i)=>({id:i,text:p[0]})));const right=shuffle(pairs.map((p,i)=>({id:i,text:p[1]})));
 $("#game-content").innerHTML=`<div class="tool-card"><div class="question-meta"><span>MATCH THE TERMS</span><span id="match-count">0 / ${pairs.length} MATCHED</span></div><h3>Choose a term, then choose its matching definition.</h3><div class="match-grid"><div id="match-left">${left.map(x=>`<button class="match-item" data-side="l" data-id="${x.id}">${escapeHtml(x.text)}</button>`).join("")}</div><div id="match-right">${right.map(x=>`<button class="match-item" data-side="r" data-id="${x.id}">${escapeHtml(x.text)}</button>`).join("")}</div></div><div class="feedback show" id="match-feedback">Select one term from the left column.</div><div class="next-row"><button class="primary" id="match-finish" disabled>FINISH MATCH</button></div></div>`;
 $$(".match-item").forEach(b=>b.onclick=()=>matchClick(b));
 $("#match-finish").onclick=()=>{correct=matchDone;earned=matchDone*12;stats.xp+=earned;stats.streak=matchDone===matchPairs.length?stats.streak+1:0;stats.best=Math.max(stats.best,matchDone);save();finish()};
}
function matchClick(b){
 if(b.disabled)return;
 if(!matchSelected){matchSelected=b;b.classList.add("selected");$("#match-feedback").textContent="Now select the matching definition.";return}
 if(matchSelected===b){b.classList.remove("selected");matchSelected=null;return}
 const other=matchSelected;const same=other.dataset.id===b.dataset.id&&other.dataset.side!==b.dataset.side;
 if(same){other.classList.remove("selected");other.classList.add("matched");b.classList.add("matched");other.disabled=true;b.disabled=true;matchDone++;$("#match-count").textContent=matchDone+" / "+matchPairs.length+" MATCHED";$("#match-feedback").textContent="Correct match!";if(matchDone===matchPairs.length)$("#match-finish").disabled=false}
 else{other.classList.remove("selected");$("#match-feedback").textContent="Not a match — try another definition."}
 matchSelected=null;
}
function finish(){
 clearInterval(timer);const total=mode==="timeline"?6:mode==="match"?Math.min(6,activeFlashcards.length):mode==="flashcards"?activeFlashcards.length:questions.length;
 const pct=total?Math.round(correct/total*100):0;
 $("#result-medal").textContent=pct>=85?"🏆":pct>=60?"🥈":"📚";
 $("#result-title").textContent=pct>=85?"History Legend!":pct>=60?"Strong effort!":"Keep training!";
 $("#result-message").textContent=pct>=85?"Your empire of knowledge is growing.":pct>=60?"You're getting stronger. Review what you missed and try again.":"Every attempt helps you learn. The next round can be even better.";
 $("#result-score").textContent=correct+"/"+total;$("#result-earned").textContent="+"+earned;$("#result-accuracy").textContent=pct+"%";
 $("#missed-review").innerHTML=missed.length?`<b>Review these questions:</b><br>`+missed.map(q=>`• ${escapeHtml(q[0])}<br><span style="color:#f4bd59">Answer: ${escapeHtml(q[1])}</span>`).join("<br>"):"<b>Great work — no missed questions in this round!</b>";
 showScreen("result-screen");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s)}
$$(".mode-card").forEach(b=>b.addEventListener("click",()=>start(b.dataset.mode)));
$("#start-btn").onclick=()=>start("campaign");
$("#back-home").onclick=()=>{clearInterval(timer);showScreen("home-screen")};
$("#result-home").onclick=()=>showScreen("home-screen");
$("#play-again").onclick=()=>start(mode,activeSetId===DEFAULT_SET_ID?undefined:activeSetId);

function makeId(){return globalThis.crypto?.randomUUID?.()||`set-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
function renderStudySets(){
 const cards=allStudySets();
 $("#study-sets").innerHTML=cards.map((set,i)=>`<article class="study-set-card"><div class="set-card-top"><span class="mode-icon">${i===0?"🏛️":"📘"}</span>${i===0?'<span class="tag">ORIGINAL</span>':""}</div><h3>${escapeHtml(set.name)}</h3><p>${escapeHtml(set.description||"A custom study set.")}</p><div class="set-card-meta">${set.questions.length} QUESTIONS</div><div class="set-card-actions"><button class="primary" data-study-set="${escapeAttr(set.id)}" ${set.questions.length?"":"disabled"}>STUDY →</button>${i===0?"":`<button class="secondary" data-manage-set="${escapeAttr(set.id)}">MANAGE</button><button class="secondary" data-add-question="${escapeAttr(set.id)}">＋ QUESTION</button><button class="delete-set" data-delete-set="${escapeAttr(set.id)}" aria-label="Delete ${escapeAttr(set.name)}">×</button>`}</div></article>`).join("");
 $("#room-set").innerHTML=cards.map(set=>`<option value="${escapeAttr(set.id)}">${escapeHtml(set.name)} (${set.questions.length})</option>`).join("");
}
renderStudySets();

$("#create-set-btn").onclick=()=>$("#set-dialog").showModal();
$("#import-set-btn").onclick=()=>$("#import-dialog").showModal();
$$("[data-close-dialog]").forEach(button=>button.onclick=()=>button.closest("dialog").close());
$("#set-form").addEventListener("submit",event=>{
 event.preventDefault();
 const name=$("#set-name").value.trim();
 if(!name)return;
 const set={id:makeId(),name,description:$("#set-description").value.trim(),questions:[]};
 studySets.push(set);persistStudySets();renderStudySets();$("#set-form").reset();$("#set-dialog").close();
 editingSetId=set.id;editingQuestionIndex=null;$("#question-form").reset();$("#question-dialog").showModal();
});
$("#study-sets").addEventListener("click",event=>{
 const button=event.target.closest("button");if(!button)return;
 if(button.dataset.studySet){start("quiz",button.dataset.studySet);return}
 if(button.dataset.manageSet){openQuestionList(button.dataset.manageSet);return}
 if(button.dataset.addQuestion){editingSetId=button.dataset.addQuestion;editingQuestionIndex=null;$("#question-form").reset();$("#question-dialog").showModal();return}
 if(button.dataset.deleteSet){
   const set=studySets.find(item=>item.id===button.dataset.deleteSet);
   if(set&&window.confirm(`Delete "${set.name}" and its questions?`)){studySets=studySets.filter(item=>item.id!==set.id);persistStudySets();renderStudySets()}
 }
});
function openQuestionList(setId){
 editingSetId=setId;
 const set=studySets.find(item=>item.id===setId);
 if(!set){toast("That study set could not be found.");return}
 $("#question-list-title").textContent=set.name;
 renderQuestionList(set);
 if(!$("#question-list-dialog").open)$("#question-list-dialog").showModal();
}
function renderQuestionList(set){
 $("#question-list").innerHTML=set.questions.length?set.questions.map((question,index)=>`<article class="question-list-item"><h3>${index+1}. ${escapeHtml(question.prompt)}</h3><p>Answer: ${escapeHtml(question.answer)}</p><div class="room-actions"><button class="secondary" data-edit-question="${index}">EDIT</button><button class="delete-set" data-remove-question="${index}" aria-label="Delete question ${index+1}">×</button></div></article>`).join(""):'<p class="section-note">This set has no questions yet. Add one to start studying.</p>';
}
$("#question-list").addEventListener("click",event=>{
 const button=event.target.closest("button");if(!button)return;
 const set=studySets.find(item=>item.id===editingSetId);if(!set)return;
 if(button.dataset.editQuestion!==undefined){
   editingQuestionIndex=Number(button.dataset.editQuestion);const question=set.questions[editingQuestionIndex];
   if(!question)return;
   $("#question-prompt").value=question.prompt;$("#question-answer").value=question.answer;
   [1,2,3].forEach((i)=>$(`#question-wrong-${i}`).value=question.wrongAnswers[i-1]);
   $("#question-explanation").value=question.explanation||"";$("#question-list-dialog").close();$("#question-dialog").showModal();return;
 }
 if(button.dataset.removeQuestion!==undefined){
   const index=Number(button.dataset.removeQuestion);
   if(window.confirm("Delete this question?")){set.questions.splice(index,1);persistStudySets();renderStudySets();renderQuestionList(set)}
 }
});
$("#list-add-question").onclick=()=>{editingQuestionIndex=null;$("#question-form").reset();$("#question-list-dialog").close();$("#question-dialog").showModal()};
$("#question-form").addEventListener("submit",event=>{
 event.preventDefault();
 const set=studySets.find(item=>item.id===editingSetId);
 if(!set){toast("That study set could not be found.");$("#question-dialog").close();return}
 const wrongAnswers=[1,2,3].map(i=>$(`#question-wrong-${i}`).value.trim());
 const answer=$("#question-answer").value.trim();
 const choices=[answer,...wrongAnswers].map(value=>value.toLocaleLowerCase());
 if(new Set(choices).size!==choices.length){toast("Each answer choice must be different.");return}
 const question={prompt:$("#question-prompt").value.trim(),answer,wrongAnswers,explanation:$("#question-explanation").value.trim(),topic:set.name};
 if(editingQuestionIndex===null)set.questions.push(question);else set.questions[editingQuestionIndex]=question;
 persistStudySets();renderStudySets();$("#question-form").reset();$("#question-dialog").close();openQuestionList(set.id);toast(editingQuestionIndex===null?"Question added to your set.":"Question updated.");
 editingQuestionIndex=null;
});

async function extractGuideText(file){
 if(file.size>25*1024*1024)throw new Error("Please choose a file smaller than 25 MB.");
 const extension=file.name.split(".").pop().toLowerCase();
 let text="";
 if(extension==="txt"||extension==="md")text=await file.text();
 else if(extension==="docx"){
   if(!window.mammoth)throw new Error("The Word document reader did not load. Check your internet connection and refresh.");
   const result=await window.mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});text=result.value;
 }else if(extension==="pdf"){
   if(!window.pdfjsLib)throw new Error("The PDF reader did not load. Check your internet connection and refresh.");
   window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
   const pdf=await window.pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;
   const pages=[];
   for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
     const page=await pdf.getPage(pageNumber);const content=await page.getTextContent();
     pages.push(content.items.map(item=>item.str).join(" "));
   }
   text=pages.join("\n");
 }else throw new Error("Use a PDF, DOCX, TXT, or Markdown file.");
 text=text.replace(/\s+/g," ").trim();
 if(text.length<100)throw new Error("Not enough readable text was found. Scanned PDFs need OCR first; try a text-based PDF or document.");
 if(text.length>80000)throw new Error("This guide is too long to analyze. Please upload a shorter document (80,000 characters maximum).");
 return text;
}
$("#import-form").addEventListener("submit",async event=>{
 event.preventDefault();
 const file=$("#guide-file").files[0],name=$("#import-name").value.trim(),button=$("#generate-set");
 if(!file||!name)return;
 button.disabled=true;$("#import-status").textContent="Reading your study guide…";
 try{
   const sourceText=await extractGuideText(file);
   $("#import-status").textContent="Sending the extracted text to Gemini…";
   if(typeof window.generateStudyQuestions!=="function")throw new Error("The Firebase AI connector did not load. Refresh the page and check your internet connection.");
   const generated=await window.generateStudyQuestions(sourceText,name);
   if(!Array.isArray(generated)||!generated.length)throw new Error("The AI returned no questions. Please try another guide.");
   const questions=generated.map(q=>({prompt:q.prompt,answer:q.answer,wrongAnswers:q.wrongAnswers,explanation:q.explanation,topic:q.topic||name}));
   const set={id:makeId(),name,description:`AI-generated from ${file.name}. Review answers before studying.`,questions};
   studySets.push(set);persistStudySets();renderStudySets();$("#import-form").reset();$("#import-dialog").close();openQuestionList(set.id);toast(`Created "${name}" with ${questions.length} questions.`);
 }catch(error){console.error("Study guide analysis failed.",error);$("#import-status").textContent=error.message||"Could not analyze this guide. Please try again."}
 finally{button.disabled=false}
});

let roomSocket=null,roomCode="",isRoomHost=false,roomPlayers=[],roomQuestions=[],roomRound=0,roomAnswered=false,roomCurrentQuestion=null,roomSetName="";
function roomStatus(message,isError=false){$("#room-status").textContent=message;$("#room-status").classList.toggle("error",isError)}
function sendRoomMessage(message){
 if(!roomSocket||roomSocket.readyState!==WebSocket.OPEN){roomStatus("The room connection is not open.",true);return false}
 roomSocket.send(JSON.stringify(message));return true
}
function roomName(){return $("#player-name").value.trim().slice(0,20)}
function connectRoom(action){
 if(roomSocket&&roomSocket.readyState===WebSocket.OPEN){roomStatus("Leave your current room before connecting to another one.",true);return}
 const url=window.EMPIRE_QUEST_MULTIPLAYER_URL;
 if(typeof url!=="string"||!url){roomStatus("Set the multiplayer server URL in config.js before connecting.",true);return}
 const name=roomName();
 if(!name){roomStatus("Enter your player name first.",true);$("#player-name").focus();return}
 roomCode="";isRoomHost=false;roomPlayers=[];roomCurrentQuestion=null;roomRound=0;
 roomStatus("Connecting to the room server…");$("#room-lobby").hidden=false;$("#room-lobby").textContent="Connecting…";
 try{roomSocket=new WebSocket(url)}catch(error){roomStatus(`Could not connect: ${error.message}`,true);$("#room-lobby").hidden=true;return}
 roomSocket.onopen=()=>sendRoomMessage(action==="host"?{type:"create",name,studySet:$("#room-set").value}:{type:"join",name,code:$("#join-code").value.trim().toUpperCase()});
 roomSocket.onmessage=event=>{
   try{handleRoomMessage(JSON.parse(event.data))}
   catch(error){console.error("Invalid message from multiplayer server.",error);roomStatus("The room server sent an invalid response.",true)}
 };
 roomSocket.onerror=()=>roomStatus("Could not reach the room server. Check its URL and that it is running.",true);
 roomSocket.onclose=()=>{roomSocket=null;roomCode="";if(!$("#room-status").classList.contains("error"))roomStatus("Disconnected from the room.");$("#room-lobby").hidden=true};
}
$("#host-room").onclick=()=>connectRoom("host");
$("#join-room").onclick=()=>connectRoom("join");
function renderRoomLobby(){
 const roster=roomPlayers.map(player=>`<li>${escapeHtml(player.name)}${player.host?" <span class='host-badge'>HOST</span>":""}<b>${player.score||0} pts</b></li>`).join("");
 const controls=isRoomHost&&!roomRound?`<button class="primary" id="room-start" ${roomPlayers.length<1?"disabled":""}>START GAME</button>`:"";
 const leave=`<button class="secondary" id="room-leave">LEAVE ROOM</button>`;
 $("#room-lobby").hidden=false;
 $("#room-lobby").innerHTML=`<div class="room-heading"><div><span class="eyebrow">${isRoomHost?"HOST ROOM":"JOINED ROOM"}</span><h3>Room ${escapeHtml(roomCode)}</h3><p>Share this code with friends.</p></div><div class="room-actions">${controls}${leave}</div></div><h4>Players (${roomPlayers.length})</h4><ul class="player-list">${roster}</ul><div id="room-game"></div>`;
 $("#room-start")?.addEventListener("click",()=>{
   const selected=allStudySets().find(set=>set.id===$("#room-set").value);
   if(!selected||!selected.questions.length){roomStatus("Choose a study set with questions.",true);return}
   roomQuestions=shuffle(selected.questions).slice(0,10);roomRound=0;roomSetName=selected.name;
   const startButton=$("#room-start");startButton.disabled=true;startButton.textContent="STARTING…";
   if(!sendRoomMessage({type:"start"})){startButton.disabled=false;startButton.textContent="START GAME"}
 });
 $("#room-leave").onclick=()=>sendRoomMessage({type:"leave"});
 if(roomCurrentQuestion)renderRoomQuestion(roomCurrentQuestion);
}
function handleRoomMessage(message){
 if(message.type==="error"){roomStatus(message.message||"The room server reported an error.",true);if(!roomCode)roomSocket?.close();return}
 if(message.type==="joined"){
   roomCode=message.code;isRoomHost=message.host;roomPlayers=message.players||[];roomStatus(`Connected to room ${roomCode}.`);renderRoomLobby();return;
 }
 if(message.type==="players"){roomPlayers=message.players||[];renderRoomLobby();return}
 if(message.type==="started"){roomRound=0;roomStatus(`Game started${roomSetName?`: ${roomSetName}`:""}!`);if(isRoomHost)sendNextRoomQuestion();return}
 if(message.type==="question"){roomCurrentQuestion=message.question;roomAnswered=false;renderRoomQuestion(message.question);return}
 if(message.type==="answer-result"){
   roomAnswered=true;roomStatus(message.correct?`Correct! ${message.explanation||""}`:`Not quite. ${message.explanation||""}`,!message.correct);
   $$("#room-game .room-answer").forEach(button=>button.disabled=true);return;
 }
 if(message.type==="round-results"){
   roomPlayers=message.players||roomPlayers;roomStatus("Everyone has answered. Check the scores below.");renderRoomLobby();
   $("#room-game").innerHTML=`<h3>Round ${message.round} results</h3><ul class="player-list">${roomPlayers.map(player=>`<li>${escapeHtml(player.name)}<b>${player.score||0} pts</b></li>`).join("")}</ul>${isRoomHost?'<div class="room-actions"><button class="primary" id="room-next">NEXT QUESTION</button><button class="secondary" id="room-end">END GAME</button></div>':"<p class='section-note'>Waiting for the host to continue…</p>"}`;
   $("#room-next")?.addEventListener("click",sendNextRoomQuestion);$("#room-end")?.addEventListener("click",()=>sendRoomMessage({type:"end"}));return;
 }
 if(message.type==="ended"){roomStatus("Game finished. Thanks for playing!");roomCurrentQuestion=null;roomRound=0;roomPlayers=message.players||roomPlayers;renderRoomLobby();return}
 if(message.type==="left"){roomStatus("You left the room.");roomSocket?.close();return}
}
function sendNextRoomQuestion(){
 if(roomRound>=roomQuestions.length){sendRoomMessage({type:"end"});return}
 const q=roomQuestions[roomRound++],choices=shuffle([q.answer,...q.wrongAnswers]);
 sendRoomMessage({type:"question",question:{prompt:q.prompt,choices,answerIndex:choices.indexOf(q.answer),explanation:q.explanation||"",round:roomRound}});
}
function renderRoomQuestion(question){
 if(!$("#room-game"))return;
 const choices=question.choices||[];
 $("#room-game").innerHTML=`<div class="room-question"><span class="eyebrow">QUESTION ${question.round}</span><h3>${escapeHtml(question.prompt)}</h3><div class="room-answer-grid">${choices.map((choice,i)=>`<button class="secondary room-answer" data-choice="${i}" ${roomAnswered?"disabled":""}>${escapeHtml(choice)}</button>`).join("")}</div></div>`;
 $$("#room-game .room-answer").forEach(button=>button.onclick=()=>{
   if(roomAnswered)return;
   roomAnswered=true;sendRoomMessage({type:"answer",choiceIndex:Number(button.dataset.choice)});
   $$("#room-game .room-answer").forEach(item=>item.disabled=true);roomStatus("Answer submitted. Waiting for the other players…");
 });
}
