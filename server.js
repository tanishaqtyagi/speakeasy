const https = require('https');
const http = require('http');
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SpeakEasy - AI English Coach</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Sora',sans-serif;background:#0a0c10;color:#e8eaf0;min-height:100vh;}
.app{max-width:500px;margin:0 auto;padding:16px;}
header{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid #1e2330;margin-bottom:16px;}
.logo{font-size:20px;font-weight:700;}
.logo span{color:#00e5ff;}
.pill{background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);border-radius:20px;padding:4px 12px;font-size:11px;color:#10b981;}
.scores{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;}
.sc{background:#161a22;border:1px solid #1e2330;border-radius:10px;padding:10px;text-align:center;}
.sv{font-size:20px;font-weight:700;color:#00e5ff;}
.sl{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;}
.lbl{font-size:10px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#6b7280;margin-bottom:8px;}
.tutors{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;}
.tc{background:#161a22;border:2px solid #1e2330;border-radius:12px;padding:12px 6px;cursor:pointer;text-align:center;transition:all 0.2s;user-select:none;}
.tc:hover{border-color:#00e5ff;}
.tc.on{border-color:#00e5ff;background:rgba(0,229,255,0.06);}
.tav{font-size:28px;margin-bottom:4px;}
.tn{font-size:12px;font-weight:600;}
.tt{font-size:10px;color:#6b7280;}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}
.chip{background:#161a22;border:1px solid #1e2330;border-radius:20px;padding:5px 12px;font-size:12px;cursor:pointer;color:#6b7280;transition:all 0.2s;user-select:none;}
.chip:hover{border-color:#7c3aed;}
.chip.on{background:rgba(124,58,237,0.15);border-color:#7c3aed;color:#e8eaf0;}
.opts{display:flex;justify-content:flex-end;gap:6px;margin-bottom:12px;}
.ob{background:#161a22;border:1px solid #1e2330;border-radius:8px;padding:5px 10px;font-size:11px;cursor:pointer;color:#6b7280;transition:all 0.2s;user-select:none;}
.ob:hover{border-color:#00e5ff;}
.ob.on{background:rgba(0,229,255,0.1);border-color:#00e5ff;color:#00e5ff;}
.errbox{background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.4);border-radius:10px;padding:10px 14px;font-size:12px;color:#fca5a5;margin-bottom:12px;display:none;}
.errbox.on{display:block;}
.chatbox{background:#161a22;border:1px solid #1e2330;border-radius:16px;margin-bottom:12px;overflow:hidden;display:flex;flex-direction:column;}
.chdr{padding:12px 14px;border-bottom:1px solid #1e2330;display:flex;align-items:center;gap:10px;}
.cav{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.cname{font-size:14px;font-weight:600;}
.cstat{font-size:11px;color:#10b981;}
.tdots{margin-left:auto;display:none;align-items:center;gap:3px;}
.tdots.on{display:flex;}
.tdots i{width:5px;height:5px;border-radius:50%;background:#00e5ff;animation:bop 1.2s ease-in-out infinite;display:block;}
.tdots i:nth-child(2){animation-delay:.2s;}
.tdots i:nth-child(3){animation-delay:.4s;}
.msglist{height:260px;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#4b5563;font-size:13px;gap:6px;text-align:center;}
.row{display:flex;gap:8px;}
.row.me{flex-direction:row-reverse;}
.mav{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;margin-top:2px;}
.bbl{max-width:78%;padding:9px 13px;border-radius:14px;font-size:13px;line-height:1.55;}
.row.ai .bbl{background:#111318;border:1px solid #1e2330;border-bottom-left-radius:3px;}
.row.me .bbl{background:linear-gradient(135deg,#7c3aed,#4f46e5);border-bottom-right-radius:3px;color:#fff;}
.note{display:block;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:6px;padding:3px 8px;font-size:11px;margin-top:5px;color:#f59e0b;}
.vbox{background:#161a22;border:1px solid #1e2330;border-radius:16px;padding:20px;}
.vcenter{display:flex;flex-direction:column;align-items:center;gap:12px;}
#micBtn{width:70px;height:70px;border-radius:50%;border:none;cursor:pointer;font-size:30px;background:linear-gradient(135deg,#7c3aed,#00e5ff);box-shadow:0 0 25px rgba(0,229,255,0.2);transition:all 0.3s;line-height:1;}
#micBtn.lis{background:linear-gradient(135deg,#ef4444,#f97316);box-shadow:0 0 35px rgba(239,68,68,0.4);animation:mpulse 1.5s infinite;}
#micBtn.spk{background:linear-gradient(135deg,#10b981,#06b6d4);box-shadow:0 0 35px rgba(16,185,129,0.35);}
#micBtn:disabled{opacity:0.5;cursor:default;animation:none;}
.vlbl{font-size:12px;color:#6b7280;}
.tbox{width:100%;background:#111318;border:1px solid #1e2330;border-radius:10px;padding:8px 12px;font-size:13px;min-height:34px;color:#6b7280;font-style:italic;}
.tbox.on{border-color:#ef4444;color:#e8eaf0;font-style:normal;}
@keyframes bop{0%,100%{transform:translateY(0);opacity:.3}50%{transform:translateY(-4px);opacity:1}}
@keyframes mpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
@keyframes fadein{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<div class="app">
  <header>
    <div class="logo">Speak<span>Easy</span> &#127897;</div>
    <div class="pill">&#9679; AI ONLINE</div>
  </header>

  <div class="scores">
    <div class="sc"><div class="sv" id="sW">0</div><div class="sl">Words</div></div>
    <div class="sc"><div class="sv" id="sE">0</div><div class="sl">Exchanges</div></div>
    <div class="sc"><div class="sv" id="sT">0:00</div><div class="sl">Time</div></div>
  </div>

  <div class="lbl">Choose Tutor</div>
  <div class="tutors">
    <div class="tc on" id="t-sarah">
      <div class="tav">&#128105;&#8205;&#127979;</div>
      <div class="tn">Sarah</div><div class="tt">US &#183; Friendly</div>
    </div>
    <div class="tc" id="t-james">
      <div class="tav">&#129489;&#8205;&#128188;</div>
      <div class="tn">James</div><div class="tt">UK &#183; Formal</div>
    </div>
    <div class="tc" id="t-priya">
      <div class="tav">&#128105;&#8205;&#128187;</div>
      <div class="tn">Priya</div><div class="tt">IN &#183; Modern</div>
    </div>
  </div>

  <div class="lbl">Topic</div>
  <div class="chips">
    <div class="chip on" data-topic="casual">&#9749; Casual</div>
    <div class="chip" data-topic="interview">&#128188; Interview</div>
    <div class="chip" data-topic="travel">&#9992; Travel</div>
    <div class="chip" data-topic="business">&#128202; Business</div>
    <div class="chip" data-topic="academic">&#127891; Academic</div>
    <div class="chip" data-topic="shopping">&#128717; Shopping</div>
  </div>

  <div class="opts">
    <button class="ob on" id="obC">&#9999; Fix Errors</button>
    <button class="ob on" id="obH">&#128161; Hints</button>
    <button class="ob on" id="obV">&#128266; Voice</button>
  </div>

  <div class="errbox" id="errbox"></div>

  <div class="chatbox">
    <div class="chdr">
      <div class="cav" id="cav" style="background:linear-gradient(135deg,#7c3aed,#06b6d4)">&#128105;&#8205;&#127979;</div>
      <div>
        <div class="cname" id="cname">Sarah</div>
        <div class="cstat" id="cstat">Ready to practice</div>
      </div>
      <div class="tdots" id="tdots"><i></i><i></i><i></i></div>
    </div>
    <div class="msglist" id="msglist">
      <div class="empty">&#127897; Press mic below and speak in English!<br><span style="font-size:11px;color:#374151">AI tutor will reply with voice</span></div>
    </div>
  </div>

  <div class="vbox">
    <div class="vcenter">
      <button id="micBtn">&#127897;</button>
      <div class="vlbl" id="vlbl">Tap to speak</div>
      <div class="tbox" id="tbox">Your speech will appear here...</div>
    </div>
  </div>
</div>

<script>
// State
var tutor = {id:'sarah', lang:'en-US', pitch:1.0, bg:'linear-gradient(135deg,#7c3aed,#06b6d4)', av:'&#128105;&#8205;&#127979;'};
var topic = 'casual';
var opts = {corr:true, hints:true, voice:true};
var history = [];
var recog = null;
var appSt = 'idle';
var words=0, exch=0, secs=0, timerInt=null, sessStart=null;

var TUTORS = {
  sarah: {lang:'en-US', pitch:1.0, bg:'linear-gradient(135deg,#7c3aed,#06b6d4)', av:'&#128105;&#8205;&#127979;', persona:'You are Sarah, a warm and encouraging American English teacher. You speak naturally, use contractions, and are very supportive.'},
  james: {lang:'en-GB', pitch:0.95, bg:'linear-gradient(135deg,#1d4ed8,#7c3aed)', av:'&#129489;&#8205;&#128188;', persona:'You are James, a professional British English tutor. You speak with proper British English, polite and formal but friendly.'},
  priya: {lang:'en-IN', pitch:1.05, bg:'linear-gradient(135deg,#db2777,#f59e0b)', av:'&#128105;&#8205;&#128187;', persona:'You are Priya, a modern Indian English coach. You are energetic, relatable, and mix encouragement with clear teaching.'}
};

var TOPICS = {
  casual:'friendly casual conversation about daily life, hobbies, weather, food',
  interview:'job interview - ask professional questions about experience, skills, goals',
  travel:'travel conversation - discuss destinations, trip planning, travel experiences',
  business:'professional business meeting about projects, strategies, presentations',
  academic:'academic discussion about studies, research, learning topics',
  shopping:'shopping scenario discussing products, prices, recommendations'
};

// Timer
function startTimer() {
  if (sessStart) return;
  sessStart = Date.now();
  timerInt = setInterval(function() {
    secs = Math.floor((Date.now()-sessStart)/1000);
    var m = Math.floor(secs/60), s = secs%60;
    document.getElementById('sT').textContent = m+':'+(s<10?'0':'')+s;
  }, 1000);
}

// Tutor selection
document.getElementById('t-sarah').addEventListener('click', function(){ setTutor('sarah'); });
document.getElementById('t-james').addEventListener('click', function(){ setTutor('james'); });
document.getElementById('t-priya').addEventListener('click', function(){ setTutor('priya'); });

function setTutor(id) {
  var t = TUTORS[id];
  tutor = {id:id, lang:t.lang, pitch:t.pitch, bg:t.bg, av:t.av, persona:t.persona};
  document.querySelectorAll('.tc').forEach(function(el){ el.classList.remove('on'); });
  document.getElementById('t-'+id).classList.add('on');
  document.getElementById('cav').style.background = t.bg;
  document.getElementById('cav').innerHTML = t.av;
  document.getElementById('cname').textContent = id.charAt(0).toUpperCase()+id.slice(1);
  history = [];
  clearChat();
  if (window.speechSynthesis) speechSynthesis.cancel();
}

// Topic selection
document.querySelectorAll('.chip').forEach(function(el) {
  el.addEventListener('click', function() {
    document.querySelectorAll('.chip').forEach(function(c){ c.classList.remove('on'); });
    el.classList.add('on');
    topic = el.getAttribute('data-topic');
    history = [];
    clearChat();
  });
});

// Option toggles
document.getElementById('obC').addEventListener('click', function(){ opts.corr=!opts.corr; this.classList.toggle('on',opts.corr); });
document.getElementById('obH').addEventListener('click', function(){ opts.hints=!opts.hints; this.classList.toggle('on',opts.hints); });
document.getElementById('obV').addEventListener('click', function(){ opts.voice=!opts.voice; this.classList.toggle('on',opts.voice); });

// Mic button
document.getElementById('micBtn').addEventListener('click', function() {
  if (appSt === 'speaking') { if(window.speechSynthesis) speechSynthesis.cancel(); setSt('idle'); return; }
  if (appSt === 'listening') { if(recog) recog.stop(); setSt('idle'); return; }
  if (appSt === 'thinking') return;
  startListening();
});

function startListening() {
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { showErr('Use Chrome or Edge browser for speech.'); return; }
  recog = new SR();
  recog.continuous = false;
  recog.interimResults = true;
  recog.lang = 'en-US';
  recog.onstart = function() {
    setSt('listening');
    document.getElementById('tbox').textContent = '';
    document.getElementById('tbox').classList.add('on');
  };
  recog.onresult = function(e) {
    var interim='', final='';
    for (var i=e.resultIndex; i<e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript;
      else interim += e.results[i][0].transcript;
    }
    document.getElementById('tbox').textContent = final || interim;
    if (final) { recog.stop(); handleSpeech(final.trim()); }
  };
  recog.onerror = function(e) {
    setSt('idle');
    document.getElementById('tbox').classList.remove('on');
    if (e.error==='not-allowed') showErr('Mic blocked! Address bar mein lock icon > Microphone > Allow karo');
    else if (e.error!=='no-speech' && e.error!=='aborted') showErr('Mic error: '+e.error);
  };
  recog.onend = function() {
    document.getElementById('tbox').classList.remove('on');
    if (appSt==='listening') setSt('idle');
  };
  startTimer();
  try { recog.start(); } catch(e) { showErr('Cannot start mic: '+e.message); }
}

async function handleSpeech(text) {
  if (!text) return;
  hideErr();
  setSt('thinking');
  words += text.split(/\s+/).filter(Boolean).length;
  exch++;
  document.getElementById('sW').textContent = words;
  document.getElementById('sE').textContent = exch;
  addMsg('me', text, null);
  history.push({role:'user', content:text});
  try {
    var reply = await callAI(text);
    var corr = null;
    var cm = reply.match(/\[Correction:\s*([^\]]+)\]/);
    var tm = reply.match(/\[Tip:\s*([^\]]+)\]/);
    if (cm) corr = 'Correction: '+cm[1].trim();
    else if (tm) corr = 'Tip: '+tm[1].trim();
    var msg = reply.replace(/\[(Correction|Tip):[^\]]+\]/g,'').trim();
    addMsg('ai', msg, corr);
    history.push({role:'assistant', content:reply});
    if (opts.voice) speakIt(msg); else setSt('idle');
  } catch(e) {
    showErr('AI error: '+e.message);
    setSt('idle');
  }
}

async function callAI(text) {
  var sys = tutor.persona + '\\n\\nCONTEXT: You are having a ' + TOPICS[topic] + '.\\n\\nRULES:\\n1. Keep responses SHORT - 2 to 3 sentences only.\\n2. Always end with a question.\\n3. Speak naturally like a real human. Use contractions.\\n4. Be warm and realistic.\\n' +
    (opts.corr ? '5. If user makes a grammar mistake, gently correct: [Correction: wrong -> right]\\n' : '') +
    (opts.hints ? '6. Suggest better phrasing: [Tip: try saying "..."]\\n' : '') +
    '\\nNo bullet points. No markdown. Natural sentences only.';
  var r = await fetch('/api/chat', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({system:sys, messages:history.slice(-12)})
  });
  if (!r.ok) throw new Error('Server error '+r.status);
  var d = await r.json();
  if (d.error) throw new Error(typeof d.error==='object'?d.error.message:d.error);
  return d.content.map(function(b){return b.text||'';}).join('');
}

function speakIt(text) {
  if (!opts.voice || !window.speechSynthesis) { setSt('idle'); return; }
  speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = tutor.lang; u.rate = 0.92; u.pitch = tutor.pitch; u.volume = 1;
  var vs = speechSynthesis.getVoices();
  var v = vs.find(function(x){return x.lang===tutor.lang;}) || vs.find(function(x){return x.lang.startsWith('en');});
  if (v) u.voice = v;
  u.onstart = function(){ setSt('speaking'); };
  u.onend = u.onerror = function(){ setSt('idle'); };
  speechSynthesis.speak(u);
}

function setSt(s) {
  appSt = s;
  var btn = document.getElementById('micBtn');
  var icons = {idle:'&#127897;', listening:'&#128308;', thinking:'&#9203;', speaking:'&#128266;'};
  var lbls = {idle:'Tap to speak', listening:'Listening... speak now!', thinking:'AI is thinking...', speaking:'Tap to stop AI'};
  var stats = {idle:'Ready to practice', listening:'Listening...', thinking:'Thinking...', speaking:'Speaking...'};
  btn.innerHTML = icons[s];
  btn.className = s==='listening'?'lis':s==='speaking'?'spk':'';
  btn.disabled = (s==='thinking');
  document.getElementById('vlbl').textContent = lbls[s];
  document.getElementById('cstat').textContent = stats[s];
  document.getElementById('cstat').style.color = s==='speaking'?'#10b981':s==='thinking'?'#f59e0b':'#10b981';
  document.getElementById('tdots').classList.toggle('on', s==='thinking');
}

function addMsg(role, text, corr) {
  var ml = document.getElementById('msglist');
  if (ml.querySelector('.empty')) ml.innerHTML = '';
  var d = document.createElement('div');
  d.className = 'row '+role;
  d.style.animation = 'fadein 0.3s ease';
  var avBg = role==='ai' ? tutor.bg : 'linear-gradient(135deg,#374151,#1f2937)';
  var avIcon = role==='ai' ? tutor.av : '&#129489;';
  var corrHtml = corr ? '<span class="note">'+corr+'</span>' : '';
  d.innerHTML = '<div class="mav" style="background:'+avBg+'">'+avIcon+'</div><div><div class="bbl">'+esc(text)+'</div>'+corrHtml+'</div>';
  ml.appendChild(d);
  ml.scrollTop = ml.scrollHeight;
}

function clearChat() {
  document.getElementById('msglist').innerHTML = '<div class="empty">&#127897; Press mic and speak in English!</div>';
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function showErr(m) { var e=document.getElementById('errbox'); e.textContent='Warning: '+m; e.classList.add('on'); }
function hideErr() { document.getElementById('errbox').classList.remove('on'); }

if (window.speechSynthesis) {
  speechSynthesis.onvoiceschanged = function(){ speechSynthesis.getVoices(); };
  speechSynthesis.getVoices();
}
</script>
</body>
</html>`;

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
  if (req.method === 'GET') {
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
        if (!API_KEY) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: 'ANTHROPIC_API_KEY not set! Add it in Render Environment Variables.' } }));
          return;
        }
        const result = await callAnthropic(parsed);
        res.writeHead(result.status, { 'Content-Type': 'application/json' });
        res.end(result.body);
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: e.message } }));
      }
    });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('SpeakEasy running on port ' + PORT);
});
