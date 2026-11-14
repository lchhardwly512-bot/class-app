const addAn = () => {
  const t = V('at');
  if (!t) { MSG = 'عنوان اطلاعیه را وارد کنید.'; return render(); }
  act(async () => { await db.collection('announcements').add({title: t, body: V('ab'), createdAt: TS()}); MSG = 'اطلاعیه برای دانش‌آموزان ارسال شد ✓'; });
};
const sts = async () => (await list(db.collection('users').where('role', '==', 'student'))).sort(byName);

startApp({title: 'برنامه مدیر', role: 'admin',
  tabs: [['att','حضور و غیاب'], ['gr','نمرات'], ['an','اطلاعیه']],
  views: {
    att: async () => {
      const [ss, at] = await Promise.all([sts(), list(db.collection('attendance').orderBy('date', 'desc').limit(30))]);
      const name = id => (ss.find(s => s.id === id) || {name: '(حذف‌شده)'}).name;
      return at.map(a => { const r = a.records || {}, k = Object.keys(r), c = x => k.filter(i => r[i] === x);
        return `<div class="card"><b>${esc(a.date)}</b><div class="mu">حاضر: ${c('p').length} | غایب: ${c('a').length} | تأخیر: ${c('l').length}</div>` +
          k.filter(i => r[i] !== 'p').map(i => `<div>${esc(name(i))}: ${L[r[i]]}</div>`).join('') + '</div>'; }).join('') || '<p class="mu">هنوز حضور و غیابی ثبت نشده است.</p>';
    },
    gr: async () => { const [ss, gr] = await Promise.all([sts(), list(db.collection('grades'))]); return gradesHtml(ss, gr); },
    an: async () => {
      const an = await list(db.collection('announcements').orderBy('createdAt', 'desc'));
      return `<div class="card"><input class="f" id="at" placeholder="عنوان اطلاعیه"><input class="f" id="ab" placeholder="متن"><button onclick="addAn()">ارسال برای دانش‌آموزان</button></div>` +
        an.map(a => `<div class="card"><b>${esc(a.title)}</b><div class="mu">${esc(a.body)}</div></div>`).join('');
    }
  }});
