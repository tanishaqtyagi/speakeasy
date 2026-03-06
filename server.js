const https = require('https');
const http = require('http');
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SpeakEasy - AI English Coach</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Space+Mono&display=swap" rel="stylesheet">
<style>
:root{--bg:#0a0c10;--card:#161a22;--border:#1e2330;--accent:#00e5ff;--accent2:#7c3aed;--accent3:#10b981;--text:#e8eaf0;--muted:#6b7280;--danger:#ef4444;--warm:#f59e0b;--surface:#111318;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Sora',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
.app{max-width:520px;margin:0 auto;padding:16px;min-height:100vh;display:flex;flex-direction:column;}
header{display:flex;align-items:center;justify-content:space-between;padding-bottom:16px;border-bottom:1px solid var(--border);margin-bottom:16px;}
.logo{display:flex;align-items:center;gap:10px;}
.logo-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#00e5ff);display:flex;align-items:center;justify-content:center;font-size:18px;}
.logo-text{font-size:20px;font-weight:700;}
.logo-text span{color:#00e5ff;}
.pill{display:flex;align-items:center;gap:6px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:100px;padding:4px 12px;font-size:11px;color:#10b981;font-family:'Space Mono',monospace;}
.dot{width:6px;height:6px;border-radius:50%;background:#10b981;animation:pulse 2s infinite;}
.score-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.score-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 8px;text-align:center;}
.score-val{font-size:22px;font-weight:700;color:#00e5ff;font-family:'Space Mono',monospace;}
.score-lbl{font-size:10px;color:var(--muted);margin-top:3px;letter-spacing:1px;text-transform:uppercase;}
.sec-lbl{font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:10px;font-family:'Space Mono',monospace;}
.tutor-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
.tutor-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px 8px;cursor:pointer;text-align:center;transition:all 0.2s;}
.tutor-card.active{border-color:#00e5ff;background:rgba(0,229,255,0.05);box-shadow:0 0 20px rgba(0,229,255,0.1);}
.t-av{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 6px;}
.t-name{font-size:13px;font-weight:600;}
.t-tag{font-size:10px;color:var(--muted);margin-top:2px;}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;}
.chip{background:var(--card);border:1px solid var(--border);border-radius:100px;padding:6px 14px;font-size:12px;cursor:pointer;color:var(--muted);transition:all 0.2s;}
.chip.active{background:rgba(124,58,237,0.15);border-color:#7c3aed;color:var(--text);}
.opts{display:flex;justify-content:flex-end;gap:8px;margin-bottom:14px;}
.tbtn{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:6px 12px;font-size:11px;cursor:pointer;color:var(--muted);font-family:'Space Mono',monospace;transition:all 0.2s;}
.tbtn.on{background:rgba(0,229,255,0.1);border-color:#00e5ff;color:#00e5ff;}
.err{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:10px 14px;font-size:12px;color:#fca5a5;margin-bottom:12px;display:none;}
.err.show{display:block;}
.chat{background:var(--card);border:1px solid var(--border);border-radius:18px;margin-bottom:14px;overflow:hidden;display:flex;flex-direction:column;min-height:280px;max-height:340px;}
.chat-hd{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;}
.c-av{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0;}
.c-name{font-size:14px;font-weight:600;}
.c-status{font-size:11px;color:#10b981;font-family:'Space Mono',monospace;}
.tdots{margin-left:auto;display:none;gap:4px;}
.tdots.show{display:flex;}
.tdots span{width:5px;height:5px;border-radius:50%;background:#00e5ff;animation:bounce 1.2s ease-in-out infinite;}
.tdots span:nth-child(2){animation-delay:0.2s;}
.tdots span:nth-child(3){animation-delay:0.4s;}
.msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:13px;gap:8px;text-align:center;}
.msg{display:flex;gap:8px;animation:fadeIn 0.3s ease;}
.msg.user{flex-direction:row-reverse;}
.m-av{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:2px;}
.bubble{max-width:78%;padding:9px 13px;border-radius:14px;font-size:13px;line-height:1.6;}
.msg.ai .bubble{background:var(--surface);border:1px solid var(--border);border-bottom-left-radius:4px;}
.msg.user .bubble{background:linear-gradient(135deg,#7c3aed,#4f46e5);border-bottom-right-radius:4px;color:#fff;}
.corr{display:block;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:6px;padding:4px 8px;font-size:11px;margin-top:5px;color:#f59e0b;font-family:'Space Mono',monospace;}
.voice{background:var(--card);border:1px solid var(--border);border-radius:18px;padding:20px;}
.vc{display:flex;flex-direction:column;align-items:center;gap:14px;}
.mic{width:72px;height:72px;border-radius:50%;border:none;cursor:pointer;font-size:28px;transition:all 0.3s;background:linear-gradient(135deg,#7c3aed,#00e5ff);box-shadow:0 0 30px rgba(0,229,255,0.2);}
.mic.listening{background:linear-gradient(135deg,#ef4444,#f97316);animation:micPulse 1.5s infinite;box-shadow:0 0 40px rgba(239,68,68,0.4);}
.mic.speaking{background:linear-gradient(135deg,#10b981,#06b6d4);box-shadow:0 0 40px rgba(16,185,129,0.35);}
.mic:disabled{opacity:0.5;cursor:not-allowed;animation:none;}
.vlbl{font-size:12px;color:var(--muted);font-family:'Space Mono',monospace;}
.transcript{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 12px;font-size:13px;min-height:36px;color:var(--muted);font-style:italic;}
.transcript.active{border-color:#ef4444;color:var(--text);font-style:normal;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes bounce{0%,100%{transform:translateY(0);opacity:0.3}50%{transform:translateY(-4px);opacity:1}}
@keyframes fadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes micPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
</style>
</head>
<body>
<div class="app">
  <header>
    <div class="logo"><div class="logo-icon">🎙️</div><div class="logo-text">Speak<span>Easy</span></div></div>
    <div class="pill"><div class="dot"></div>AI ONLINE</div>
  </header>
  <div class="score-row">
    <div class="score-card"><div class="score-val" id="sW">0</div><div class="score-lbl">Words</div></div>
    <div class="score-card"><div class="score-val" id="sE">0</div><div class="score-lbl">Exchanges</div></div>
    <div class="score-card"><div class="score-val" id="sT">0:00</div><div class="score-lbl">Time</div></div>
  </div>
  <div class="sec-lbl">Choose Tutor</div>
  <div class="tutor-grid">
    <div class="tutor-card active" onclick="pickT(this,'sarah','\u{1F469}\u200D\u{1F3EB}','en-US',1.0,'linear-gradient(135deg,#7c3aed,#06b6d4)')">
      <div class="t-av" style="background:linear-gradient(135deg,#7c3aed,#06b6d4)">\u{1F469}\u200D\u{1F3EB}</div>
      <div class="t-name">Sarah</div><div class="t-tag">US · Friendly</div>
    </div>
    <div class="tutor-card" onclick="pickT(this,'james','\u{1F9D1}\u200D\u{1F4BC}','en-GB',0.95,'linear-gradient(135deg,#1d4ed8,#7c3aed)')">
      <div class="t-av" style="background:linear-gradient(135deg,#1d4ed8,#7c3aed)">\u{1F9D1}\u200D\u{1F4BC}</div>
      <div class="t-name">James</div><div class="t-tag">UK · Formal</div>
    </div>
    <div class="tutor-card" onclick="pickT(this,'priya','\u{1F469}\u200D\u{1F4BB}','en-IN',1.05,'linear-gradient(135deg,#db2777,#f59e0b)')">
      <div class="t-av" style="background:linear-gradient(135deg,#db2777,#f59e0b)">\u{1F469}\u200D\u{1F4BB}</div>
      <div class="t-name">Priya</div><div class="t-tag">IN · Modern</div>
    </div>
  </div>
  <div class="sec-lbl">Topic</div>
  <div class="chips">
    <div class="chip active" onclick="pickTopic(this,'casual')">&#9749; Casual</div>
    <div class="chip" onclick="pickTopic(this,'interview')">&#128188; Interview</div>
    <div class="chip" onclick="pickTopic(this,'travel')">&#9992;&#65039; Travel</div>
    <div class="chip" onclick="pickTopic(this,'business')">&#128202; Business</div>
    <div class="chip" onclick="pickTopic(this,'academic')">&#127891; Academic</div>
    <div class="chip" onclick="pickTopic(this,'shopping')">&#128717; Shopping</div>
  </div>
  <div class="opts">
    <button class="tbtn on" id="bC" onclick="tog('corrections','bC')">&#9999;&#65039; Corrections</button>
    <button class="tbtn on" id="bH" onclick="tog('hints','bH')">&#128161; Hints</button>
    <button class="tbtn on" id="bV" onclick="tog('voice','bV')">&#128266; Voice</button>
  </div>
  <div class="err" id="errBox"></div>
  <div class="chat">
    <div class="chat-hd">
      <div class="c-av" id="cAv" style="background:linear-gradient(135deg,#7c3aed,#06b6d4)">\u{1F469}\u200D\u{1F3EB}</div>
      <div><div class="c-name" id="cName">Sarah</div><div class="c-status" id="cSt">Ready to practice</div></div>
      <div class="tdots" id="tDots"><span></span><span></span><span></span></div>
    </div>
    <div class="msgs" id="msgs">
      <div class="empty"><div style="font-size:32px">&#127897;&#65039;</div><div>Press mic and speak in English!</div><div style="font-size:11px;margin-top:4px;color:#374151">Your AI tutor will respond with voice</div></div>
    </div>
  </div>
  <div class="voice">
    <div class="vc">
      <button class="mic" id="micBtn" onclick="toggleMic()">&#127897;&#65039;</button>
      <div class="vlbl" id="vLbl">Tap to speak</div>
      <div class="transcript" id="trans">Your speech will appear here...</div>
    </div>
  </div>
</div>
<script>
let tutor={id:'sarah',emoji:'\u{1F469}\u200D\u{1F3EB}',lang:'en-US',pitch:1.0,bg:'linear-gradient(135deg,#7c3aed,#06b6d4)'};
let topic='casual',opts={corrections:true,hints:true,voice:true},history=[];
let recog=null,st='idle',words=0,exch=0,secs=0,timerInt=null,sessStart=null;
const TP={casual:'friendly casual chat about daily life, hobbies, weather, food',interview:'job interview - ask professional questions about experience and skills',travel:'travel companion - discuss destinations and trip experiences',business:'professional business meeting about projects and strategies',academic:'academic discussion about studies and research',shopping:'shopping scenario about products, prices, recommendations'};
const PE={sarah:'You are Sarah, a warm encouraging American English teacher. Speak naturally, use contractions, be supportive.',james:'You are James, a professional British English tutor. Speak proper British English, polite but friendly.',priya:'You are Priya, a modern Indian English coach. Energetic, relatable, encouraging.'};
function startTimer(){if(sessStart)return;sessStart=Date.now();timerInt=setInterval(()=>{secs=Math.floor((Date.now()-sessStart)/1000);document.getElementById('sT').textContent=Math.floor(secs/60)+':'+(secs%60).toString().padStart(2,'0');},1000);}
function pickT(el,id,emoji,lang,pitch,bg){document.querySelectorAll('.tutor-card').forEach(c=>c.classList.remove('active'));el.classList.add('active');tutor={id,emoji,lang,pitch,bg};document.getElementById('cAv').textContent=emoji;document.getElementById('cAv').style.background=bg;document.getElementById('cName').textContent=id.charAt(0).toUpperCase()+id.slice(1);history=[];clearMsgs();if(window.speechSynthesis)speechSynthesis.cancel();}
function pickTopic(el,t){document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');topic=t;history=[];clearMsgs();}
function tog(k,bid){opts[k]=!opts[k];document.getElementById(bid).classList.toggle('on',opts[k]);}
function clearMsgs(){document.getElementById('msgs').innerHTML='<div class="empty"><div style="font-size:32px">'+tutor.emoji+'</div><div>Press mic and speak in English!</div></div>';}
async function askAI(text){
  const sys=PE[tutor.id]+'\n\nCONTEXT: You are having a '+TP[topic]+'.\n\nRULES:\n1. Keep responses SHORT - 2 to 3 sentences only. This is spoken conversation.\n2. Always end with a question.\n3. Speak NATURALLY like a real human. Use contractions.\n4. Be warm and realistic.\n'+(opts.corrections?'5. Gently correct grammar mistakes: [Correction: wrong -> right]\n':'')+(opts.hints?'6. Suggest better phrasing: [Tip: try saying "..."]\n':'')+'\nNo bullet points. No markdown. Natural spoken sentences only.';
  const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system:sys,messages:history.slice(-12)})});
  if(!r.ok)throw new Error('Server error '+r.status);
  const d=await r.json();
  if(d.error)throw new Error(JSON.stringify(d.error));
  return d.content.map(b=>b.text||'').join('');
}
async function handleSpeech(text){
  if(!text.trim())return;
  hideErr();setSt('thinking');
  document.getElementById('trans').textContent=text;
  words+=text.split(/\s+/).filter(Boolean).length;exch++;
  document.getElementById('sW').textContent=words;document.getElementById('sE').textContent=exch;
  addMsg('user',text,null);history.push({role:'user',content:text});
  try{
    const reply=await askAI(text);
    const cm=reply.match(/\[Correction:\s*([^\]]+)\]/);const tm=reply.match(/\[Tip:\s*([^\]]+)\]/);
    const corr=cm?'✏️ '+cm[1].trim():tm?'💡 '+tm[1].trim():null;
    const msg=reply.replace(/\[(Correction|Tip):[^\]]+\]/g,'').trim();
    addMsg('ai',msg,corr);history.push({role:'assistant',content:reply});
    if(opts.voice)speakIt(msg);else setSt('idle');
  }catch(e){showErr('AI Error: '+e.message);setSt('idle');}
}
function toggleMic(){
  if(st==='speaking'){if(window.speechSynthesis)speechSynthesis.cancel();setSt('idle');return;}
  if(st==='listening'){recog&&recog.stop();setSt('idle');return;}
  if(st==='thinking')return;
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){showErr('Use Chrome or Edge browser for speech recognition.');return;}
  recog=new SR();recog.continuous=false;recog.interimResults=true;recog.lang='en-US';
  recog.onstart=()=>{setSt('listening');document.getElementById('trans').textContent='';document.getElementById('trans').classList.add('active');};
  recog.onresult=(e)=>{let i='',f='';for(let x=e.resultIndex;x<e.results.length;x++){if(e.results[x].isFinal)f+=e.results[x][0].transcript;else i+=e.results[x][0].transcript;}document.getElementById('trans').textContent=f||i;if(f){recog.stop();handleSpeech(f.trim());}};
  recog.onerror=(e)=>{setSt('idle');document.getElementById('trans').classList.remove('active');if(e.error==='not-allowed')showErr('Microphone blocked! Address bar mein lock icon tap karo -> Microphone -> Allow');else if(e.error!=='no-speech'&&e.error!=='aborted')showErr('Mic error: '+e.error);};
  recog.onend=()=>{document.getElementById('trans').classList.remove('active');if(st==='listening')setSt('idle');};
  startTimer();
  try{recog.start();}catch(e){showErr('Cannot start mic: '+e.message);}
}
function speakIt(text){
  if(!opts.voice||!window.speechSynthesis)return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang=tutor.lang;u.rate=0.92;u.pitch=tutor.pitch;u.volume=1;
  const vs=speechSynthesis.getVoices();
  const v=vs.find(x=>x.lang===tutor.lang)||vs.find(x=>x.lang.startsWith('en'));
  if(v)u.voice=v;
  u.onstart=()=>setSt('speaking');
  u.onend=u.onerror=()=>setSt('idle');
  speechSynthesis.speak(u);
}
function setSt(s){
  st=s;
  const btn=document.getElementById('micBtn');
  document.getElementById('cSt').textContent={idle:'Ready to practice',listening:'Listening...',thinking:'Thinking...',speaking:'Speaking...'}[s];
  document.getElementById('cSt').style.color=s==='speaking'?'#10b981':s==='thinking'?'#f59e0b':'#10b981';
  document.getElementById('tDots').classList.toggle('show',s==='thinking');
  btn.className='mic'+(s==='listening'?' listening':s==='speaking'?' speaking':'');
  btn.disabled=(s==='thinking');
  btn.innerHTML={idle:'&#127897;&#65039;',listening:'&#128308;',thinking:'&#9203;',speaking:'&#128266;'}[s];
  document.getElementById('vLbl').textContent={idle:'Tap to speak',listening:'Listening... speak now!',thinking:'AI is thinking...',speaking:'Tap to stop'}[s];
}
function addMsg(role,text,corr){
  const m=document.getElementById('msgs');
  if(m.querySelector('.empty'))m.innerHTML='';
  const d=document.createElement('div');d.className='msg '+role;
  const avBg=role==='ai'?tutor.bg:'linear-gradient(135deg,#374151,#1f2937)';
  const avE=role==='ai'?tutor.emoji:'&#129489;';
  d.innerHTML='<div class="m-av" style="background:'+avBg+'">'+avE+'</div><div><div class="bubble">'+text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>'+(corr?'<span class="corr">'+corr+'</span>':'')+'</div>';
  m.appendChild(d);m.scrollTop=m.scrollHeight;
}
function showErr(msg){const e=document.getElementById('errBox');e.textContent='⚠️ '+msg;e.classList.add('show');}
function hideErr(){document.getElementById('errBox').classList.remove('show');}
if(window.speechSynthesis){speechSynthesis.onvoiceschanged=()=>speechSynthesis.getVoices();speechSynthesis.getVoices();}
</script>
</body>
</html>`;
}

async function callAnthropic(body) {
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

  // Serve HTML for ALL GET requests to root
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getHTML());
    return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        if (!API_KEY) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in environment variables' }));
          return;
        }
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

  // Fallback - still serve HTML
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(getHTML());
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('SpeakEasy running on port ' + PORT);
});
