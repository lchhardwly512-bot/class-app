let REASON = '', CUR = null;
const students = async () => (await list(db.collection('users').where('role', '==', 'student'))).sort(byName);
const sopts = ss => ss.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');

const pt = (id, v) => act(() => db.collection('points').add({
  studentId: id, value: v, reason: REASON || (v > 0 ? 'امتیاز مثبت' : 'امتیاز منفی'),
  teacherId: ME.uid, createdAt: TS()}));
function genPw() { $('np').value = String(100000 + Math.floor(Math.random() * 900000)); }
async function addSt() {
  const n = V('ns'), u = (V('nu') || n.split(' ')[0]).toLowerCase(), p = $('np').value;
  if (!n || !u || p.length < 6) { MSG = 'نام را وارد کنید و رمز حداقل ۶ کاراکتر باشد.'; return render(); }
  await act(async () => {
    const sec = firebase.initializeApp(FIREBASE_CONFIG, 's' + Date.now());
    try {
      const c = await sec.auth().createUserWithEmailAndPassword(toEmail(u), p);
      await db.collection('users').doc(c.user.uid).set({name: n, username: u, role: 'student', createdAt: TS()});
      await sec.auth().signOut();
      MSG = 'دانش‌آموز اضافه شد. به او بگویید: نام کاربری «' + u + '» و رمز «' + p + '»';
    } finally { await sec.delete(); }
  });
}
const delSt = id => confirm('این دانش‌آموز حذف شود؟') && act(() => db.collection('users').doc(id).delete());
function cyc(id) { const o = {p:'a', a:'l', l:'p'}; CUR[id] = o[CUR[id] || 'p']; render(); }
const sendAtt = () => act(async () => {
  const ss = await students(), r = {};
  ss.forEach(s => r[s.id] = CUR[s.id] || 'p');
  await db.collection('attendance').doc(TODAY).set({date: TODAY, records: r, teacherId: ME.uid, updatedAt: TS()});
  MSG = 'حضور و غیاب امروز برای مدیر ارسال شد ✓';
});
function addGr() {
  const j = V('gj'), n = V('gn');
  if (!j || n === '') { MSG = 'جلسه و نمره را وارد کنید.'; return render(); }
  act(() => db.collection('grades').add({studentId: $('gs').value, session: j, score: +n, teacherId: ME.uid, createdAt: TS()}));
}
function addHw() {
  const t = V('ht');
  if (!t) { MSG = 'عنوان تکلیف را وارد کنید.'; return render(); }
  act(() => db.collection('homework').add({title: t, due: V('hd'), createdAt: TS()}));
}

startApp({title: 'برنامه معلم', role: 'teacher',
  tabs: [['stu','دانش‌آموزان'], ['att','حضور'], ['gr','نمرات'], ['hw','تکالیف']],
  views: {
    stu: async () => {
      const [ss, ps] = await Promise.all([students(), list(db.collection('points'))]);
      const sum = {}; ps.forEach(p => sum[p.studentId] = (sum[p.studentId] || 0) + p.value);
      return `<div class="card"><input class="f" placeholder="دلیل امتیاز (اختیاری)" value="${esc(REASON)}" oninput="REASON=this.value"></div>` +
        ss.map(s => { const t = sum[s.id] || 0; return `<div class="card row"><div class="sp">${esc(s.name)}<div class="mu">نام کاربری: ${esc(s.username)}</div></div><span class="sc ${t < 0 ? 'n' : 'p'}">${sg(t)}</span><button class="ok" onclick="pt('${esc(s.id)}',1)">+</button><button class="no" onclick="pt('${esc(s.id)}',-1)">−</button><button class="g" onclick="delSt('${esc(s.id)}')">✕</button></div>`; }).join('') +
        `<div class="card"><b>دانش‌آموز جدید</b><input class="f" id="ns" placeholder="نام و نام خانوادگی"><input class="f" id="nu" placeholder="نام کاربری (خالی = نام کوچک)"><div class="row"><input id="np" class="sp" placeholder="رمز اختصاصی (حداقل ۶ کاراکتر)"><button class="g" onclick="genPw()">ساخت رمز</button></div><button class="big" style="margin-top:8px" onclick="addSt()">افزودن</button></div>`;
    },
    att: async () => {
      const ss = await students();
      if (CUR === null) { const d = await db.collection('attendance').doc(TODAY).get(); CUR = d.exists ? {...d.data().records} : {}; }
      return `<p class="mu">تاریخ امروز: ${TODAY}. برای تغییر وضعیت روی دکمه بزنید.</p>` +
        ss.map(s => { const c = CUR[s.id] || 'p'; return `<div class="card row"><span class="sp">${esc(s.name)}</span><button class="${c === 'p' ? 'ok' : c === 'a' ? 'no' : 'g'}" onclick="cyc('${esc(s.id)}')">${L[c]}</button></div>`; }).join('') +
        `<button class="big" onclick="sendAtt()">ارسال به مدیر</button>`;
    },
    gr: async () => {
      const [ss, gr] = await Promise.all([students(), list(db.collection('grades'))]);
      return `<div class="card"><select class="f" id="gs">${sopts(ss)}</select><input class="f" id="gj" placeholder="جلسه (مثلاً جلسه ۳)"><input class="f" id="gn" type="number" placeholder="نمره"><button onclick="addGr()">ثبت نمره</button></div>` + gradesHtml(ss, gr);
    },
    hw: async () => {
      const [hw, dn] = await Promise.all([list(db.collection('homework').orderBy('createdAt', 'desc')), list(db.collection('hwdone'))]);
      return `<div class="card"><input class="f" id="ht" placeholder="عنوان تکلیف"><input class="f" id="hd" placeholder="مهلت تحویل"><button onclick="addHw()">ثبت تکلیف</button></div>` +
        hw.map(h => `<div class="card"><b>${esc(h.title)}</b><div class="mu">مهلت: ${esc(h.due || '-')} | انجام داده‌اند: ${dn.filter(x => x.hwId === h.id).length}</div></div>`).join('');
    }
  }});
