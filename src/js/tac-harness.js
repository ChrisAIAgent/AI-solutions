import '../scss/tac-harness.scss';
// Layout reference: https://www.deepseek.com/en/harness/
// Local animations; reference assets originate from /harness/images and /harness/icons/file-types.

const files = [
  ['word', 'Brief.docx', 'Word document'],
  ['excel', 'Data.xlsx', 'Excel spreadsheet'],
  ['html', 'index.html', 'HTML page'],
  ['typescript', 'label.ts', 'TypeScript code'],
  ['python', 'analyze.py', 'Python script'],
  ['pdf', 'Report.pdf', 'PDF document'],
  ['markdown', 'README.md', 'Markdown document']
];
document.querySelector('#hFileTrack').innerHTML = [...files, ...files].map(([icon, name, type]) => '<div class="h-file"><img src="../assets/tac/harness/reference/' + icon + '.svg" alt=""><b>' + name + '</b><small>' + type + '</small></div>').join('');
document.querySelector('#hTimeline').innerHTML = '<i></i>'.repeat(40);

const demos = [...document.querySelectorAll('[data-demo]')];
const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  entry.target.classList.toggle('is-offscreen', !entry.isIntersecting);
}), { threshold: .05 });
demos.forEach(demo => {
  observer.observe(demo);
  const button = demo.querySelector('.h-pause');
  button.addEventListener('click', () => {
    const paused = demo.classList.toggle('is-paused');
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', (paused ? 'Play' : 'Pause') + ' demonstration');
    button.textContent = paused ? '▶' : 'Ⅱ';
  });
});
document.addEventListener('visibilitychange', () => demos.forEach(demo => {
  if (document.hidden) demo.classList.add('is-offscreen');
  else {
    const rect = demo.getBoundingClientRect();
    demo.classList.toggle('is-offscreen', rect.bottom <= 0 || rect.top >= window.innerHeight);
  }
}));
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const timer = document.querySelector('[data-timer]');
let tick = 0;
setInterval(() => {
  const demo = timer.closest('[data-demo]');
  if (reduceMotion.matches || document.hidden || demo.classList.contains('is-paused') || demo.classList.contains('is-offscreen')) return;
  tick = (tick + 1) % 25;
  const remaining = 1500 - tick;
  timer.textContent = Math.floor(remaining / 60) + ':' + String(remaining % 60).padStart(2, '0');
}, 1000);
document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = 'Copy'; }, 1600);
    } catch {
      button.textContent = 'Select command';
    }
  });
});
