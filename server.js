const http = require('http');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SpeakEasy — AI English Coach</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#0a0c10;--card:#161a22;--border:#1e2330;--accent:#00e5ff;
    --accent2:#7c3aed;--accent3:#10b981;--text:#e8eaf0;--muted:#6b7280;
    --danger:#ef4444;--warm:#f59e0b;--surface:#111318;
  }
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Sora',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
  .bg-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;z-index:0;}
  .app{position:relative;z-index:1;max-width:520px;margin:0 auto;padding:16px;min-height:100vh;display:flex;flex-direction:column;}
  header{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:1px solid var(--border);margin-bottom:18px;}
  .logo{display:flex;align-items:center;gap:10px;}
  .logo-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--accent2),var(--accent));display:flex;align-items:center;justify-content:center;font-size:18px;}
  .logo-text{font-size:20px;font-weight:700;}
  .logo-text span{color:var(--accent);}
  .status-pill{display:flex;align-items:center;gap:6px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:100px;padding:4px 12px;font-size:11px;color:var(--accent3);font-family:'Space Mono',monospace;}
  .dot{width:6px;height:6px;border-radius:50%;background:var(--accent3);animation:pulse 2s infinite;}
  .score-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:18px;}
  .score-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 8px;text-align:center;}
  .score-val{font-size:22px;font-weight:700;color:var(--accent);font-family:'Space Mono',monospace;}
  .score-lbl{font-size:10px;color:var(--muted);margin-top:3px;letter-spacing:1px;text-transform:uppercase;}
  .section-label{font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;font-family:'Space Mono',monospace;}
  .tutor-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
  .tutor-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 8px;cursor:pointer;text-align:center;transition:all 0.2s;}
  .tutor-card.active{border-color:var(--accent);background:rgba(0,229,255,0.05);box-shadow:0 0 20px rgba(0,229,255,0.12);}
  .tutor-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 6px;}
  .tutor-name{font-size:13px;font-weight:600;}
  .tutor-tag{font-size:10px;color:var(--muted);margin-top:2px;}
  .topic-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}
  .chip{background:var(--card);border:1px solid var(--border);border-radius:100px;padding:6px 14px;font-size:12px;cursor:pointer;color:var(--muted);transition:all 0.2s;}
  .chip.active{background:rgba(124,58,237,0.15);border-color:var(--accent2);color:var(--text);}
  .opts-row{display:flex;justify-content:flex-end;gap:8px;margin-bottom:14px;}
  .toggle-btn{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;color:var(--muted);font-family:'Space Mono',monospace;transition:all 0.2s;}
  .toggle-btn.on{background:rgba(0,229,255,0.1);border-color:var(--accent);color:var(--accent);}
  .error-box{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:10px 14px;font-size:12px;color:#fca5a5;margin-bottom:12px;display:none;}
  .error-box.show{display:block;}
  .chat-wrap{background:var(--card);border:1px solid var(--border);border-radius:18px;margin-bottom:14px;overflow:hidden;display:flex;flex-direction:column;min-height:300px;max-height:360px;}
  .chat-head{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;}
  .chat-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
  .chat-name{font-size:14px;font-weight:600;}
  .chat-status{font-size:11px;color:var(--accent3);font-family:'Space Mono',monospace;}
  .think-dots{margin-left:auto;display:none;gap:4px;}
  .think-dots.show{display:flex;}
  .think-dots span{width:5px;height:5px;border-radius:50%;background:var(--accent);animation:bounce 1.2s ease-in-out infinite;}
  .think-dots span:nth-child(2){animation-delay:0.2s;}
  .think-dots span:nth-child(3){animation-delay:0.4s;}
  .messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;}
  .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:13px;gap:8px;text-align:center;}
  .msg{display:flex;gap:8px;animation:msgIn 0.3s ease;}
  .msg.user{flex-direction:row-reverse;}
  .msg-av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:4px;}
  .bubble{max-width:75%;padding:10px 14px;border-radius:16px;font-size:13px;line-height:1.6;}
  .msg.ai .bubble{background:var(--surface);border:1px solid var(--border);border-bottom-left-radius:4px;}
  .msg.user .bubble{background:linear-gradient(135deg,var(--accent2),#4f46e5);border-bottom-right-radius:4px;color:white;}
  .correction{display:inline-block;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:6px;padding:4px 8px;font-size:11px;margin-top:5px;color:var(--warm);font-family:'Space Mono',monospace;}
  .voice-wrap{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:20px;}
  .voice-center{display:flex;flex-direction:column;align-items:center;gap:14px;}
  .mic-btn{width:72px;height:72px;border-radius:50%;border:none;cursor:pointer;font-size:28px;display:flex;align-items:center;justify-content:center;transition:all 0.3s;background:linear-gradient(135deg,var(--accent2),var(--accent));box-shadow:0 0 30px rgba(0,229,255,0.2);}
  .mic-btn.listening{background:linear-gradient(135deg,var(--danger),#f97316);animation:micPulse 1.5s ease-in-out infinite;box-shadow:0 0 40px rgba(239,68,68,0.4);}
  .mic-btn.speaking{background:linear-gradient(135deg,var(--accent3),#06b6d4);box-shadow:0 0 40px rgba(16,185,129,0.35);}
  .mic-btn:disabled{opacity:0.6;cursor:not-allowed;animation:none;}
  .voice-lbl{font-size:12px;color:var(--muted);font-family:'Space Mono',monospace;}
  .transcript{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 12px;font-size:13px;min-height:36px;color:var(--muted);font-style:italic;transition:border-color 0.3s;}
  .transcript.active{border-color:var(--danger);color:var(--text);font-style:normal;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  @keyframes bounce{0%,100%{transform:translateY(0);opacity:0.3}50%{transform:translateY(-4px);opacity:1}}
  @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes micPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
</style>
</head>
<body>
<div class="bg-grid"></div>
<div class="app">
  <header>
    <div class="logo">
      <div class="logo-icon">🎙️</div>
      <div class="logo-text">Speak<span>Easy</span></div>
    </div>
    <div class="status-pill"><div class="dot"></div>AI ONLINE</div>
  </header>
  <div class="score-row">
    <div class="score-card"><div class="score-val" id="sWords">0</div><div class="score-lbl">Words</div></div>
    <div class="score-card"><div class="score-val" id="sExch">0</div><div class="score-lbl">Exchanges</div></div>
    <div class="score-card"><div class="score-val" id="sTime">0:00</div><div class="score-lbl">Time</div></div>
  </div>
  <div class="section-label">Choose Tutor</div>
  <div class="tutor-grid">
    <div class="tutor-card active" onclick="pickTutor(this,'sarah','👩‍🏫','en-US',1.0,'linear-gradient(135deg,#7c3aed,#06b6d4)')">
      <div class="tutor-avatar" style="background:linear-gradient(135deg,#7c3aed,#06b6d4)">👩‍🏫</div>
      <div class="tutor-name">Sarah</div><div class="tutor-tag">US · Friendly</div>
    </div>
    <div class="tutor-card" onclick="pickTutor(this,'james','🧑‍💼','en-GB',0.95,'linear-gradient(135deg,#1d4ed8,#7c3aed)')">
      <div class="tutor-avatar" style="background:linear-gradient(135deg,#1d4ed8,#7c3aed)">🧑‍💼</div>
      <div class="tutor-name">James</div><div class="tutor-tag">UK · Formal</div>
    </div>
    <div class="tutor-card" onclick="pickTutor(this,'priya','👩‍💻','en-IN',1.05,'linear-gradient(135deg,#db2777,#f59e0b)')">
      <div class="tutor-avatar" style="background:linear-gradient(135deg,#db2777,#f59e0b)">👩‍💻</div>
      <div class="tutor-name">Priya</div><div class="tutor-tag">IN · Modern</div>
    </div>
  </div>
  <div class="section-label">Topic</div>
  <div class="topic-chips">
    <div class="chip active" onclick="pickTopic(this,'casual')">☕ Casual</div>
    <div class="chip" onclick="pickTopic(this,'interview')">💼 Interview</div>
    <div class="chip" onclick="pickTopic(this,'travel')">✈️ Travel</div>
    <div class="chip" onclick="pickTopic(this,'business')">📊 Business</div>
    <div class="chip" onclick="pickTopic(this,'academic')">🎓 Academic</div>
    <div class="chip" onclick="pickTopic(this,'shopping')">🛍️ Shopping</div>
  </div>
  <div class="opts-row">
    <button class="toggle-btn on" id="btnCorr" onclick="tog('corrections','btnCorr')">✏️ Corrections</button>
    <button class="toggle-btn on" id="btnHints" onclick="tog('hints','btnHints')">💡 Hints</button>
    <button class="toggle-btn on" id="btnVoice" onclick="tog('voice','btnVoice')">🔊 Voice</button>
  </div>
  <div class="error-box" id="errBox"></div>
  <div class="chat-wrap">
    <div class="chat-head">
      <div class="chat-avatar" id="chatAv" style="background:linear-gradient(135deg,#7c3aed,#06b6d4)">👩‍🏫</div>
      <div>
        <div class="chat-name" id="chatName">Sarah</div>
        <div class="chat-status" id="chatStatus">Ready to practice</div>
      </div>
      <div class="think-dots" id="thinkDots"><span></span><span></span><span></span></div>
    </div>
    <div class="messages" id="msgs">
      <div class="empty-state"><div style="font-size:32px">🎙️</div><div>Press mic and speak in English!</div><div style="font-size:11px;margin-top:4px;color:#374151">AI tutor will respond with voice</div></div>
    </div>
  </div>
  <div class="voice-wrap">
    <div class="voice-center">
      <button class="mic-btn" id="micBtn" onclick="toggleMic()">🎙️</button>
      <div class="voice-lbl" id="voiceLbl">Tap to speak</div>
      <div class="transcript" id="transcript">Your speech will appear here...</div>
    </div>
  </div>
</div>
<script>
let tutor={id:'sarah',emoji:'👩\\u200d🏫',lang:'en-US',pitch:1.0,bg:'linear-gradient(135deg,#7c3aed,#06b6d4)'};
let topic='casual',opts={corrections:true,hints:true,voice:true},history=[];
let recog=null,appState='idle',words=0,exch=0,secs=0,timerInt=null,sessionStart=null;
const topicPrompts={casual:"friendly casual conversation about daily life, hobbies, weather, food",interview:"job interview — ask professional questions about experience, skills, goals",travel:"travel companion — discuss destinations, trips, travel experiences",business:"professional business meeting discussing projects and strategies",academic:"fellow student or professor discussing studies and research",shopping:"shopping scenario discussing products, prices, recommendations"};
const personas={sarah:"You are Sarah, a warm encouraging American English teacher. Speak naturally with contractions, be supportive.",james:"You are James, a professional British English tutor. Speak proper British English, polite but friendly.",priya:"You are Priya, a modern Indian English coach. Energetic, relatable, mix encouragement with clear teaching."};
function startTimer(){if(sessionStart)return;sessionStart=Date.now();timerInt=setInterval(()=>{secs=Math.floor((Date.now()-sessionStart)/1000);document.getElementById('sTime').textContent=Math.floor(secs/60)+':'+(secs%60).toString().padStart(2,'0');},1000);}
function pickTutor(el,id,emoji,lang,pitch,bg){document.querySelectorAll('.tutor-card').forEach(c=>c.classList.remove('active'));el.classList.add('active');tutor={id,emoji,lang,pitch,bg};document.getElementById('chatAv').textContent=emoji;document.getElementById('chatAv').style.background=bg;document.getElementById('chatName').textContent=id.charAt(0).toUpperCase()+id.slice(1);history=[];clearMsgs();stopSpeech();}
function pickTopic(el,t){document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');topic=t;history=[];clearMsgs();}
function tog(key,btnId){opts[key]=!opts[key];document.getElementById(btnId).classList.toggle('on',opts[key]);}
function clearMsgs(){document.getElementById('msgs').innerHTML='<div class="empty-state"><div style="font-size:32px">'+tutor.emoji+'</div><div>Press mic and speak in English!</div></div>';}
async function askClaude(userText){
  const sys=personas[tutor.id]+'\\n\\nCONTEXT: You are having a '+topicPrompts[topic]+'.\\n\\nRULES:\\n1. Keep responses SHORT — 2 to 3 sentences only. This is spoken conversation.\\n2. Always end with a question.\\n3. Speak NATURALLY like a real human. Use contractions.\\n4. Be warm and realistic.\\n'+(opts.corrections?'5. Gently correct grammar mistakes: [Correction: "wrong" → "right"]\\n':'')+(opts.hints?'6. Suggest better phrasing occasionally: [Tip: try saying "..."]\\n':'')+'\\nIMPORTANT: No bullet points. No markdown. Natural spoken sentences only.';
  const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:sys,messages:history.slice(-12)})});
  if(!res.ok)throw new Error('HTTP '+res.status);
  const data=await res.json();
  return data.content.map(b=>b.text||'').join('');
}
async function handleSpeech(text){
  if(!text.trim())return;
  hideErr();setState('thinking');
  document.getElementById('transcript').textContent=text;
  words+=text.split(/\\s+/).filter(Boolean).length;exch++;
  document.getElementById('sWords').textContent=words;document.getElementById('sExch').textContent=exch;
  addMsg('user',text,null);history.push({role:'user',content:text});
  try{
    const reply=await askClaude(text);
    const cm=reply.match(/\\[Correction:([^\\]]+)\\]/);const tm=reply.match(/\\[Tip:([^\\]]+)\\]/);
    const correction=cm?'✏️ '+cm[1].trim():tm?'💡 '+tm[1].trim():null;
    const message=reply.replace(/\\[(Correction|Tip):[^\\]]+\\]/g,'').trim();
    addMsg('ai',message,correction);history.push({role:'assistant',content:reply});
    if(opts.voice)speakText(message);else setState('idle');
  }catch(e){showErr('Error: '+e.message);setState('idle');}
}
function toggleMic(){if(appState==='speaking'){stopSpeech();return;}if(appState==='listening'){recog?.stop();setState('idle');return;}if(appState==='thinking')return;startListening();}
function startListening(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){showErr('Use Chrome browser for speech recognition.');return;}
  recog=new SR();recog.continuous=false;recog.interimResults=true;recog.lang='en-US';
  recog.onstart=()=>{setState('listening');document.getElementById('transcript').textContent='';document.getElementById('transcript').classList.add('active');};
  recog.onresult=(e)=>{let interim='',final='';for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript;else interim+=e.results[i][0].transcript;}document.getElementById('transcript').textContent=final||interim;if(final){recog.stop();handleSpeech(final.trim());}};
  recog.onerror=(e)=>{setState('idle');document.getElementById('transcript').classList.remove('active');if(e.error==='not-allowed')showErr('Allow microphone: address bar mein 🔒 tap karo → Microphone → Allow');else if(e.error!=='no-speech'&&e.error!=='aborted')showErr('Mic error: '+e.error);};
  recog.onend=()=>{document.getElementById('transcript').classList.remove('active');if(appState==='listening')setState('idle');};
  startTimer();try{recog.start();}catch(e){showErr('Mic start failed: '+e.message);}
}
function speakText(text){if(!opts.voice||!window.speechSynthesis)return;stopSpeech();const utt=new SpeechSynthesisUtterance(text);utt.lang=tutor.lang;utt.rate=0.92;utt.pitch=tutor.pitch;utt.volume=1;const voices=speechSynthesis.getVoices();const v=voices.find(v=>v.lang===tutor.lang)||voices.find(v=>v.lang.startsWith('en'));if(v)utt.voice=v;utt.onstart=()=>setState('speaking');utt.onend=utt.onerror=()=>setState('idle');speechSynthesis.speak(utt);}
function stopSpeech(){speechSynthesis?.cancel();setState('idle');}
function setState(s){appState=s;const btn=document.getElementById('micBtn');const lbl=document.getElementById('voiceLbl');document.getElementById('chatStatus').textContent={idle:'Ready to practice',listening:'Listening...',thinking:'Thinking...',speaking:'Speaking...'}[s];document.getElementById('chatStatus').style.color=s==='speaking'?'#10b981':s==='thinking'?'#f59e0b':'#10b981';document.getElementById('thinkDots').classList.toggle('show',s==='thinking');btn.className='mic-btn'+(s==='listening'?' listening':s==='speaking'?' speaking':'');btn.disabled=(s==='thinking');btn.textContent={idle:'🎙️',listening:'🔴',thinking:'⏳',speaking:'🔊'}[s];lbl.textContent={idle:'Tap to speak',listening:'Listening... speak!',thinking:'Thinking...',speaking:'Tap to stop'}[s];}
function addMsg(role,text,correction){const msgs=document.getElementById('msgs');if(msgs.querySelector('.empty-state'))msgs.innerHTML='';const d=document.createElement('div');d.className='msg '+role;d.innerHTML='<div class="msg-av" style="background:'+(role==='ai'?tutor.bg:'linear-gradient(135deg,#374151,#1f2937)')+'">'+( role==='ai'?tutor.emoji:'🧑')+'</div><div><div class="bubble">'+text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'+(correction?'<div class="correction">'+correction+'</div>':'')+'</div>';msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
function showErr(m){const e=document.getElementById('errBox');e.textContent='⚠️ '+m;e.classList.add('show');}
function hideErr(){document.getElementById('errBox').classList.remove('show');}
if(window.speechSynthesis){speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();speechSynthesis.getVoices();}
</script>
</body>
</html>`;

async function callAnthropic(body) {
  const { createConnection } = require('net');
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: body.system,
      messages: body.messages
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const https = require('https');
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML);
    return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        const result = await callAnthropic(parsed);
        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        res.end(result.body);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => console.log('SpeakEasy running on port ' + PORT));
