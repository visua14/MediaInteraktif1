// ===== NAVIGASI & TOMBOL KEMBALI =====
const pages = document.querySelectorAll('.page');
let st = ['home'], hist = true;

function show(id){
  pages.forEach(p => p.classList.toggle('active', p.id === id));
  if(id === 'kuis') startQuiz();
  const a = document.getElementById(id); if(a) a.scrollTop = 0;
}
function go(id){
  if(st[st.length-1] === id) return;
  st.push(id); show(id);
  try{ history.pushState({n: st.length}, ''); }catch(e){ hist = false; }
}
function back(){
  if(st.length < 2) return toast('Kamu sudah di halaman awal 🌿');
  if(hist) history.back(); else { st.pop(); show(st[st.length-1]); }
}
window.addEventListener('popstate', () => { if(st.length > 1){ st.pop(); show(st[st.length-1]); } });
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
document.querySelectorAll('[data-back]').forEach(b => b.addEventListener('click', back));

let tt;
function toast(m){
  const t = document.getElementById('toast');
  t.textContent = m; t.classList.add('on');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1800);
}

// ===== SLIDE MATERI =====
const slides = document.querySelectorAll('.slide');
const dotsBox = document.getElementById('dots');
const nextBtn = document.getElementById('next');
let cur = 0;
slides.forEach((_, i) => {
  const d = document.createElement('button');
  d.setAttribute('aria-label', 'Slide ' + (i+1));
  d.onclick = () => slide(i);
  dotsBox.appendChild(d);
});
function slide(i){
  cur = Math.max(0, Math.min(slides.length-1, i));
  slides.forEach((s, k) => s.classList.toggle('active', k === cur));
  [...dotsBox.children].forEach((d, k) => d.classList.toggle('on', k === cur));
  document.getElementById('prev').disabled = cur === 0;
  nextBtn.textContent = cur === slides.length-1 ? 'Ke Kuis 🏆' : 'Selanjutnya ▶';
  document.getElementById('count').textContent = `Slide ${cur+1} dari ${slides.length}`;
}
function next(){ cur === slides.length-1 ? go('kuis') : slide(cur+1); }
document.getElementById('prev').onclick = () => slide(cur-1);
nextBtn.onclick = next;
// geser layar (swipe) di HP
let sx = null;
const mc = document.querySelector('#materi .card');
mc.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
mc.addEventListener('touchend', e => {
  if(sx === null) return;
  const dx = e.changedTouches[0].clientX - sx; sx = null;
  if(dx > 60) slide(cur-1); else if(dx < -60) next();
}, {passive:true});
slide(0);

// ===== KUIS =====
const bank = [
  {q:'Cerita yang tokohnya hewan dan berperilaku seperti manusia disebut ...', o:['Legenda','Fabel','Dongeng sejarah','Biografi'], a:1, e:'Fabel adalah cerita dengan tokoh hewan yang bersikap seperti manusia.'},
  {q:'Pelaku yang mengalami kejadian dalam cerita disebut ...', o:['Tokoh','Latar','Amanat','Alur'], a:0, e:'Pelaku dalam cerita disebut tokoh.'},
  {q:'Siapakah tokoh utama dalam cerita "Persahabatan di Hutan Rimba"?', o:['Rusa dan Gajah','Gajah dan Kura-kura','Kelinci dan Kura-kura','Rusa dan Kelinci'], a:2, e:'Kelinci dan Kura-kura paling sering muncul dan menjadi pusat cerita.'},
  {q:'Sifat atau karakter yang dimiliki tokoh disebut ...', o:['Konflik','Amanat','Watak','Tema'], a:2, e:'Watak adalah sifat atau karakter tokoh.'},
  {q:'Watak Kelinci di awal cerita adalah ...', o:['Sabar','Sombong dan meremehkan','Suka menolong','Pemalu'], a:1, e:'Kelinci merasa bisa sendiri dan meremehkan Kura-kura.'},
  {q:'Watak Kura-kura dalam cerita adalah ...', o:['Pemarah','Penakut','Sabar dan tenang','Pemalas'], a:2, e:'Kura-kura tetap tenang walaupun diremehkan.'},
  {q:'Masalah atau pertentangan yang dialami tokoh disebut ...', o:['Konflik','Amanat','Latar','Tokoh'], a:0, e:'Konflik adalah masalah atau pertentangan dalam cerita.'},
  {q:'Konflik antara Kelinci dan Kura-kura disebabkan oleh ...', o:['Rebutan makanan','Kelinci meremehkan Kura-kura','Gajah marah','Sungai kering'], a:1, e:'Kelinci menganggap Kura-kura lambat dan tidak bisa membantu.'},
  {q:'Siapa yang menengahi perbedaan pendapat dan mengatur pekerjaan?', o:['Gajah','Kelinci','Rusa','Burung'], a:2, e:'Rusa menenangkan keadaan dan mengatur pembagian tugas.'},
  {q:'Pesan moral dalam cerita ini adalah ...', o:['Lebih baik bekerja sendiri','Yang cepat pasti menang','Jangan meremehkan orang lain dan mau bekerja sama','Hewan besar selalu lebih kuat'], a:2, e:'Amanatnya: hargai orang lain, dan kerja sama membuat pekerjaan sulit menjadi ringan.'}
];
const box = document.getElementById('quiz');
let list, idx, score, answered;
const shuffle = a => a.map(v => [Math.random(), v]).sort((x,y) => x[0]-y[0]).map(x => x[1]);

function startQuiz(){ list = shuffle(bank); idx = 0; score = 0; render(); }

function render(){
  if(idx >= list.length) return finish();
  answered = false;
  const it = list[idx];
  box.innerHTML = `
    <div class="q-top"><span>Soal ${idx+1} dari ${list.length}</span><span>⭐ Skor: ${score}</span></div>
    <div class="bar"><i style="width:${idx/list.length*100}%"></i></div>
    <p class="q-text">${it.q}</p><div id="opts"></div><div id="fb"></div>`;
  const opts = box.querySelector('#opts');
  it.o.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.textContent = String.fromCharCode(65+i) + '. ' + t;
    b.onclick = () => pick(i);
    opts.appendChild(b);
  });
}

function pick(i){
  if(answered) return;
  answered = true;
  const it = list[idx];
  const btns = box.querySelectorAll('.opt');
  btns.forEach((b, k) => { b.disabled = true; if(k === it.a) b.classList.add('ok'); });
  const right = i === it.a;
  if(right) score++; else btns[i].classList.add('no');
  const last = idx === list.length-1;
  box.querySelector('#fb').innerHTML = `
    <div class="fb">${right ? '🎉 Benar! ' : '😅 Belum tepat. '}${it.e}</div>
    <button class="btn small sun" id="nx" style="width:100%">${last ? 'Lihat Hasil 🏆' : 'Soal Berikutnya ▶'}</button>`;
  const nx = box.querySelector('#nx');
  nx.onclick = () => { idx++; render(); };
  nx.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function finish(){
  const pct = Math.round(score / list.length * 100);
  const [em, msg] = pct >= 80 ? ['🏆','Hebat! Kamu sudah paham materi fabel.']
                  : pct >= 60 ? ['👍','Bagus! Baca materi sekali lagi agar makin mantap.']
                  : ['🌱','Ayo semangat! Pelajari materinya lagi, lalu coba kuis ini kembali.'];
  box.innerHTML = `<div class="result"><div class="big">${em}</div><h2>Nilai: ${pct}</h2>
    <p>Kamu menjawab ${score} dari ${list.length} soal dengan benar. ${msg}</p>
    <div class="actions"><button class="btn" id="re">🔄 Ulangi Kuis</button>
    <button class="btn alt" id="rd">📖 Baca Materi</button></div></div>`;
  box.querySelector('#re').onclick = startQuiz;
  box.querySelector('#rd').onclick = () => go('materi');
}

show('home');
