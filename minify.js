// One-shot minifier for class/id names + comment/test removal.
// Run: node minify.js
const fs = require('fs');

const idMap = {
  'page': 'A', 'nav': 'B', 'heading1': 'C', 'heading2': 'D',
  'inputvalue': 'E', 'firsthostaddress': 'F', 'lasthostaddress': 'G',
  'subnetslashdropdown': 'H', 'subnetdotdropdown': 'I', 'usableaddressesdropdown': 'J',
  'totaladdresses': 'K', 'networkaddressdiv': 'L', 'expandedaddress': 'M',
  'broadcastaddress': 'N', 'wildcardmask': 'O', 'hexmask': 'P', 'binaryview': 'Q',
  'vlsm-prefix': 'R', 'vlsm-subnets': 'S', 'vlsm-hosts': 'T',
  'vlsm-status': 'U', 'vlsm-count': 'V', 'vlsm-list': 'W',
  'hint': 'X', 'words': 'Y', 'footer': 'Z',
  'toast': 'AA', 'help-overlay': 'AB', 'help-panel': 'AC', 'help-close': 'AD',
};

const classMap = {
  'calc': 'a', 'label': 'b', 'value': 'c',
  'v4-only': 'd', 'v6-only': 'e',
  'copyable': 'f', 'copied': 'g', 'na': 'h',
  'binary': 'i', 'net': 'j', 'host': 'k', 'sep': 'l',
  'bounceup': 'm', 'bouncedown': 'n', 'bounceleft': 'o', 'bounceright': 'p',
  'show': 'q', 'shown': 'r', 'hide': 's',
  'vlsm-status': 't', 'vlsm-range': 'u',
  'v6': 'v',
};

const keyframesMap = {
  'bounceup': 'm', 'bouncedown': 'n', 'bounceleft': 'o', 'bounceright': 'p',
  'typing': 'x', 'blink-caret': 'y',
};

function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

let html = fs.readFileSync('index-minified.html', 'utf8');

// 1. Strip HTML comments.
html = html.replace(/<!--[\s\S]*?-->/g, '');

// 2. Extract <style> and <script> blocks for separate processing.
const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/;
const scriptRe = /<script[^>]*>([\s\S]*?)<\/script>/;

const styleMatch = html.match(styleRe);
const scriptMatch = html.match(scriptRe);
let css = styleMatch[1];
let js = scriptMatch[1];

html = html.replace(styleRe, '<style>__CSS__</style>');
html = html.replace(scriptRe, '<script>__JS__</script>');

// ---- 3. CSS ----
css = css.replace(/\/\*[\s\S]*?\*\//g, '');
for (const [from, to] of Object.entries(classMap)) {
  css = css.replace(new RegExp('\\.' + escRe(from) + '(?![\\w-])', 'g'), '.' + to);
}
for (const [from, to] of Object.entries(idMap)) {
  css = css.replace(new RegExp('#' + escRe(from) + '(?![\\w-])', 'g'), '#' + to);
}
for (const [from, to] of Object.entries(keyframesMap)) {
  css = css.replace(new RegExp('(@keyframes\\s+)' + escRe(from) + '\\b', 'g'), '$1' + to);
  css = css.replace(new RegExp('(animation\\s*:\\s*)' + escRe(from) + '\\b', 'g'), '$1' + to);
}
// Compress whitespace.
css = css.replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').trim();

// ---- 4. JS ----
// Drop the self-tests IIFE block.
js = js.replace(/\/\/\s*----------\s*Self-tests[\s\S]*?\}\)\(\);\s*(?=\}\)\(\);)/, '');
// Strip line and block comments.
js = js.replace(/\/\/[^\n]*/g, '');
js = js.replace(/\/\*[\s\S]*?\*\//g, '');

// Replace 'bounce' + direction concat with an explicit map BEFORE per-name replacement.
js = js.replace(/'bounce'\s*\+\s*direction/g, "({up:'m',down:'n',left:'o',right:'p'}[direction])");

// Replace getElementById/$ id lookups.
for (const [from, to] of Object.entries(idMap)) {
  js = js.replace(
    new RegExp("(getElementById|\\$)\\((['\"])" + escRe(from) + "\\2\\)", 'g'),
    `$1($2${to}$2)`
  );
}

// Replace classList.add/remove/toggle/contains with class names.
for (const [from, to] of Object.entries(classMap)) {
  js = js.replace(
    new RegExp("(classList\\.(?:add|remove|toggle|contains))\\((['\"])" + escRe(from) + "\\2", 'g'),
    `$1($2${to}$2`
  );
}

// Replace `.className = 'a b'` (multi-token).
js = js.replace(/(\.className\s*=\s*)(['"])([^'"]+)\2/g, (m, lhs, q, content) => {
  const replaced = content.split(/\s+/).map(c => classMap[c] || c).join(' ');
  return `${lhs}${q}${replaced}${q}`;
});

// Inside-string `<span class="sep">` literal in setBinary.
js = js.replace(/'<span class="sep">/g, "'<span class=\"l\">");

// 'net'/'host' string literals used as class names in the ternary.
js = js.replace(/'net'(\s*:\s*)'host'/g, "'j'$1'k'");

// 'bounceup' / 'bouncedown' / 'bounceleft' / 'bounceright' string literals
// in the bounce() forEach array.
for (const [from, to] of Object.entries({bounceup:'m',bouncedown:'n',bounceleft:'o',bounceright:'p'})) {
  js = js.replace(new RegExp("'" + from + "'", 'g'), `'${to}'`);
}

// Compress JS whitespace (line collapse only — keep statement spacing).
js = js.split('\n').map(l => l.trim()).filter(l => l).join('\n');

// ---- 5. HTML attributes (both " and ' quoting) ----
html = html.replace(/\sid=(["'])([^"']+)\1/g, (m, q, val) => ` id=${q}${idMap[val] || val}${q}`);
html = html.replace(/\sclass=(["'])([^"']+)\1/g, (m, q, val) => {
  const tokens = val.split(/\s+/);
  return ` class=${q}${tokens.map(t => classMap[t] || t).join(' ')}${q}`;
});

// ---- 6. Reassemble ----
html = html.replace('__CSS__', css);
html = html.replace('__JS__', js);

// Light whitespace compression in the HTML chrome.
html = html.split('\n').map(l => l.trim()).filter(l => l).join('\n');

fs.writeFileSync('index-minified.html', html);
console.log('Done. Size:', html.length, 'chars');
