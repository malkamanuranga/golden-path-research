const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const count = f =>
  fs.readFileSync(path.join(root, f), 'utf8')
    .split(/\r?\n/).filter(l => l.trim() !== '').length;

const baseline = [
  'baseline/app/Dockerfile',
  'baseline/k8s/app.yaml',
  '.github/workflows/baseline-ci.yml',
];
const generated = [
  'generated/orders-demo/app/Dockerfile',
  'generated/orders-demo/k8s/app.yaml',
  'generated/orders-demo/.github/workflows/ci.yml',
];

let out = '# System metrics\n\n| File | Baseline lines | Generated lines |\n|---|---|---|\n';
let b = 0, g = 0;
baseline.forEach((f, i) => {
  const bl = count(f), gl = count(generated[i]);
  b += bl; g += gl;
  out += `| ${path.basename(f)} | ${bl} | ${gl} |\n`;
});
out += `| **Total** | **${b}** | **${g}** |\n\n`;
out += `Config lines the developer must write by hand: baseline = ${b}, template = 0 (one command)\n`;

fs.writeFileSync(path.join(root, 'results', 'system-metrics.md'), out);
console.log(out);