firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth(), db = firebase.firestore();
const TS = () => firebase.firestore.FieldValue.serverTimestamp();
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const V = id => $(id).value.trim();
const sg = n => n > 0 ? '+' + n : n;
const TODAY = new Date().toLocaleDateString('en-CA');
const L = {p:'حاضر', a:'غایب', l:'تأخیر'};
const byName = (a, b) => a.name.localeCompare(b.name, 'fa');

// نام کاربری فارسی/غیرلاتین را به یک ایمیل داخلی معتبر تبدیل می‌کند
function toEmail(u) {
  u = u.trim().toLowerCase();
  if (/^[a-z0-9._-]{1,30}$/.test(u)) return u + '@classapp.example';
  const hex = Array.from(new TextEncoder().encode(u)).map(b => b.toString(16).padStart(2, '0')).join('');
  return 'x' + hex + '@classapp.example';
}
async function list(q) { const s = await q.get(); return s.docs.map(d => ({id: d.id, ...d.data()})); }

let CFG, ME, TAB, MSG = '', ERR = '';

function startApp(c) {
  CFG = c; TAB = c.tabs[0][0];
  if (FIREBASE_CONFIG.apiKey.indexOf('PASTE') === 0) {
    $('app').innerHTML = '<div class="card n">ابتدا فایل config.js را با اطلاعات Firebase پر کنید.</div>';
    return;
  }
  auth.onAuthStateChanged(async u => {
    if (!u) { ME = null; return showLogin(); }
    try {
      const d = await db.collection('users').doc(u.uid).get();
      if (!d.exists || d.data().role !== c.role) {
        ERR = 'این حساب برای این برنامه نیست یا هنوز تکمیل نشده است.';
        await auth.signOut(); return;
      }
      ME = {uid: u.uid, ...d.data()};
      render();
    } catch (e) { ERR = 'خطا: ' + e.message; await auth.signOut(); }
  });
}

function showLogin() {
  $('app').innerHTML = `<h1>${esc(CFG.title)}</h1><div class="card">
   <input class="f" id="un" placeholder="نام کاربری" autocomplete="username">
   <input class="f" id="pw" type="password" placeholder="رمز عبور" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()">
   <button class="big" onclick="doLogin()">ورود</button>${ERR ? `<div class="n">${esc(ERR)}</div>` : ''}</div>`;
}
async function doLogin() {
  ERR = '';
  try { await auth.signInWithEmailAndPassword(toEmail(V('un')), $('pw').value); }
  catch (e) {
    ERR = e.code === 'auth/network-request-failed' ? 'اتصال اینترنت را بررسی کنید.' : 'نام کاربری یا رمز عبور اشتباه است.';
    showLogin();
  }
}
function tab(t) { TAB = t; MSG = ''; render(); }
async function act(fn) {
  MSG = '';
  try { await fn(); }
  catch (e) { MSG = 'خطا: ' + (e.code === 'auth/email-already-in-use' ? 'این نام کاربری قبلاً استفاده شده است.' : e.message); }
  render();
}
async function render() {
  $('app').innerHTML = `<div class="row"><h1 class="sp">${esc(CFG.title)} - ${esc(ME.name)}</h1><button class="g" onclick="auth.signOut()">خروج</button></div>
   <div class="tabs">${CFG.tabs.map(t => `<button class="${TAB === t[0] ? 'on' : ''}" onclick="tab('${t[0]}')">${t[1]}</button>`).join('')}</div>
   ${MSG ? `<div class="msg">${esc(MSG)}</div>` : ''}<div id="view" class="mu">در حال بارگذاری...</div>`;
  try { $('view').innerHTML = await CFG.views[TAB](); }
  catch (e) { $('view').innerHTML = `<div class="n">خطا در بارگذاری: ${esc(e.message)}</div>`; }
}
// فهرست نمرات هر دانش‌آموز (مشترک بین معلم و مدیر)
function gradesHtml(ss, gr) {
  return ss.map(s => {
    const g = gr.filter(x => x.studentId === s.id);
    const av = g.length ? (g.reduce((a, x) => a + x.score, 0) / g.length).toFixed(1) : '-';
    return `<div class="card"><div class="row"><b class="sp">${esc(s.name)}</b><span class="mu">میانگین: ${av}</span></div>` +
      g.map(x => `<div class="mu">${esc(x.session)}: ${x.score}</div>`).join('') + '</div>';
  }).join('') || '<p class="mu">هنوز دانش‌آموزی ثبت نشده است.</p>';
}
