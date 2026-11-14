const tgl = (hwId, done) => act(() => {
  const ref = db.collection('hwdone').doc(hwId + '_' + ME.uid);
  return done ? ref.delete() : ref.set({hwId, studentId: ME.uid, createdAt: TS()});
});

startApp({title: 'برنامه دانش‌آموز', role: 'student',
  tabs: [['an','اطلاعیه‌ها'], ['hw','تکالیف'], ['pt','امتیاز من']],
  views: {
    an: async () => (await list(db.collection('announcements').orderBy('createdAt', 'desc')))
      .map(a => `<div class="card"><b>${esc(a.title)}</b><div class="mu">${esc(a.body)}</div></div>`).join('') || '<p class="mu">اطلاعیه‌ای نیست.</p>',
    hw: async () => {
      const [hw, dn] = await Promise.all([list(db.collection('homework').orderBy('createdAt', 'desc')), list(db.collection('hwdone').where('studentId', '==', ME.uid))]);
      return hw.map(h => { const d = dn.some(x => x.hwId === h.id);
        return `<div class="card row"><div class="sp"><b>${esc(h.title)}</b><div class="mu">مهلت: ${esc(h.due || '-')}</div></div><button class="${d ? 'ok' : 'g'}" onclick="tgl('${esc(h.id)}',${d})">${d ? 'انجام شد ✓' : 'انجام دادم'}</button></div>`; }).join('') || '<p class="mu">تکلیفی نیست.</p>';
    },
    pt: async () => {
      const ps = (await list(db.collection('points').where('studentId', '==', ME.uid))).sort((a, b) => ((b.createdAt || {}).seconds || 0) - ((a.createdAt || {}).seconds || 0));
      const t = ps.reduce((a, x) => a + x.value, 0);
      return `<div class="card row"><b class="sp">مجموع امتیاز من</b><span class="sc ${t < 0 ? 'n' : 'p'}">${sg(t)}</span></div>` +
        ps.map(x => `<div class="card row"><span class="sc ${x.value > 0 ? 'p' : 'n'}">${sg(x.value)}</span><span>${esc(x.reason)}</span></div>`).join('');
    }
  }});
