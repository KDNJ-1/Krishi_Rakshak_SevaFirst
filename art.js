/* Cartoon art for the four farmers. Pure SVG strings, no external assets. */
(function (root) {
  const SKIN = '#e2a574', INK = '#3b2a1c';
  function face(mood, cx, cy) {
    const m = { happy: `M${cx-8} ${cy+9} q8 8 16 0`, worried: `M${cx-7} ${cy+11} q7 -4 14 0`, sad: `M${cx-8} ${cy+13} q8 -8 16 0` }[mood];
    const brow = mood === 'happy' ? '' : `<path d="M${cx-10} ${cy-9} l7 ${mood==='sad'?-3:-1} M${cx+10} ${cy-9} l-7 ${mood==='sad'?-3:-1}" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
    const tear = mood === 'sad' ? `<path d="M${cx+9} ${cy+3} q3 6 0 8 q-3 -2 0 -8z" fill="#6fb4ee"/>` : mood === 'worried' ? `<path d="M${cx+14} ${cy-8} q3 5 0 7 q-3 -2 0 -7z" fill="#6fb4ee"/>` : '';
    return `<circle cx="${cx-6}" cy="${cy-2}" r="2.2" fill="${INK}"/><circle cx="${cx+6}" cy="${cy-2}" r="2.2" fill="${INK}"/>${brow}<path d="${m}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>${tear}`;
  }
  function sky(kind) {
    if (kind === 'rain') return `<g><ellipse cx="30" cy="20" rx="18" ry="10" fill="#9aa7b4"/><ellipse cx="42" cy="17" rx="12" ry="8" fill="#b4bfca"/><path d="M22 34 l-3 8 M32 34 l-3 8 M42 34 l-3 8" stroke="#4b8fd1" stroke-width="2.4" stroke-linecap="round"/></g>`;
    if (kind === 'hot') return `<g><circle cx="30" cy="22" r="11" fill="#ff7a2f"/><g stroke="#ff7a2f" stroke-width="3" stroke-linecap="round"><path d="M30 4v5M30 35v5M12 22h5M43 22h5M17 9l4 4M43 9l-4 4M17 35l4-4M43 35l-4-4"/></g><path d="M25 22 q2 -3 4 0 M32 22 q2 -3 4 0" stroke="#7a2b00" stroke-width="1.6" fill="none"/></g>`;
    return `<g><circle cx="30" cy="22" r="10" fill="#ffc83d"/><g stroke="#ffc83d" stroke-width="2.6" stroke-linecap="round"><path d="M30 5v4M30 35v4M13 22h4M43 22h4M18 10l3 3M42 10l-3 3M18 34l3-3M42 34l-3-3"/></g></g>`;
  }
  function symbol(s, x, y) {
    const c = { circle: '#2e9d4f', triangle: '#e0a21a', square: '#d6453a' }[s] || '#999';
    const sh = s === 'circle' ? `<circle cx="${x}" cy="${y}" r="7" fill="${c}"/>` : s === 'triangle' ? `<path d="M${x} ${y-8} l8 15 h-16z" fill="${c}"/>` : `<rect x="${x-7}" y="${y-7}" width="14" height="14" rx="1.5" fill="${c}"/>`;
    return `<g><rect x="${x-14}" y="${y-14}" width="28" height="28" rx="8" fill="#fff" stroke="#d9c9ae"/>${sh}</g>`;
  }
  function farmer(tier, mood, skyKind, sym) {
    const body = ['#8a6a3a', '#3b82c4', '#7a56b8', '#c1622f'][tier], cap = ['#a06a2a', '#e8e8e8', '#e8e8e8', '#f4e3c4'][tier];
    let s = `<svg viewBox="0 0 170 160" role="img" aria-label="Cartoon farmer ${tier}">`;
    s += `<rect width="170" height="160" rx="14" fill="${skyKind==='rain'?'#dce6f0':skyKind==='hot'?'#ffe9d2':'#e8f4fb'}"/>`;
    s += sky(skyKind);
    s += `<ellipse cx="85" cy="150" rx="82" ry="14" fill="#8cc070"/><path d="M10 150 q5 -12 10 0 M150 150 q5 -14 10 0 M30 152 q4 -9 8 0" stroke="#5e9a49" stroke-width="2" fill="none"/>`;
    // farmer
    s += `<g transform="translate(-6 0)"><rect x="46" y="84" width="14" height="48" rx="6" fill="#f4efe6"/><rect x="66" y="84" width="14" height="48" rx="6" fill="#f4efe6"/><ellipse cx="53" cy="136" rx="10" ry="5" fill="#5b3a21"/><ellipse cx="73" cy="136" rx="10" ry="5" fill="#5b3a21"/>`;
    s += `<rect x="40" y="58" width="46" height="46" rx="14" fill="${body}"/>`;
    s += `<circle cx="63" cy="44" r="19" fill="${SKIN}"/><path d="M43 40 a20 17 0 0 1 40 0 q-20 6 -40 0z" fill="${cap}"/>${face(mood, 63, 46)}`;
    if (tier === 0) s += `<path d="M84 70 l12 -22" stroke="${SKIN}" stroke-width="9" stroke-linecap="round"/><path d="M40 72 l-8 20" stroke="${SKIN}" stroke-width="9" stroke-linecap="round"/><g><rect x="96" y="14" width="30" height="24" rx="8" fill="#fff" stroke="#d9c9ae"/><text x="111" y="32" text-anchor="middle" font-size="18" font-weight="700" fill="#8a6a3a">?</text></g>`;
    if (tier === 1) s += `<path d="M84 74 l14 0" stroke="${SKIN}" stroke-width="9" stroke-linecap="round"/><rect x="94" y="56" width="18" height="30" rx="4" fill="#222"/><rect x="96.5" y="60" width="13" height="22" rx="2" fill="#bfe3f7"/><circle cx="103" cy="66" r="3.4" fill="#ffc83d"/><ellipse cx="103" cy="73" rx="5" ry="3" fill="#fff"/><path d="M40 72 l-8 20" stroke="${SKIN}" stroke-width="9" stroke-linecap="round"/>`;
    if (tier === 2) s += `<path d="M84 74 l14 0" stroke="${SKIN}" stroke-width="9" stroke-linecap="round"/><rect x="94" y="56" width="18" height="30" rx="4" fill="#222"/><rect x="96.5" y="60" width="13" height="22" rx="2" fill="#d7f2dc"/><path d="M98 78 l3 -6 l3 3 l4 -8" stroke="#2e9d4f" stroke-width="1.8" fill="none"/><path d="M40 72 l-8 20" stroke="${SKIN}" stroke-width="9" stroke-linecap="round"/>`;
    s += `</g>`;
    if (tier === 2) s += `<g><rect x="132" y="70" width="3" height="76" fill="#7b7b7b"/><rect x="122" y="56" width="24" height="18" rx="4" fill="#8f9aa6"/><circle cx="134" cy="65" r="3" fill="#2e9d4f"/><path d="M134 56 v-10" stroke="#7b7b7b" stroke-width="2"/><path d="M126 42 q8 -8 16 0 M122 37 q12 -12 24 0" stroke="#3b82c4" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
    if (tier === 3) {
      s += `<g><rect x="131" y="58" width="5" height="90" fill="#8a5a2a"/><path d="M114 80 h39" stroke="#8a5a2a" stroke-width="5" stroke-linecap="round"/><path d="M118 80 q-4 12 0 22 M149 80 q4 12 0 22" stroke="#b5562b" stroke-width="3" fill="none"/>`;
      s += `<ellipse cx="133" cy="52" rx="14" ry="16" fill="#c1622f"/><path d="M121 40 q12 -6 24 0" stroke="#9a4a20" stroke-width="2" fill="none"/><circle cx="128" cy="50" r="2" fill="#3b2a1c"/><circle cx="139" cy="50" r="2" fill="#3b2a1c"/><path d="M128 58 q5 4 10 0" stroke="#3b2a1c" stroke-width="2" fill="none"/>`;
      s += `<path d="M133 36 v-8" stroke="#555" stroke-width="2"/><g fill="#e8d28a" stroke="#8a6a1a" stroke-width="1"><path d="M133 28 l-10 -4 a6 6 0 0 0 4 8z"/><path d="M133 28 l10 -4 a6 6 0 0 1 -4 8z"/><path d="M133 28 l0 -10 a6 6 0 0 1 4 4z"/></g>`;
      s += `<path d="M104 34 q0 -4 5 -4" stroke="none"/></g>`;
      if (sym) s += symbol(sym, 108, 22);
    }
    return s + `</svg>`;
  }
  function hero() {
    return `<svg viewBox="0 0 320 240" role="img" aria-label="Scarecrow with terracotta head and cup-anemometer hat"><defs><linearGradient id="hg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd9a8"/><stop offset="1" stop-color="#fff3df"/></linearGradient></defs><rect width="320" height="240" rx="22" fill="url(#hg)"/><circle cx="262" cy="52" r="24" fill="#ffb347"/><g stroke="#ffb347" stroke-width="4" stroke-linecap="round"><path d="M262 14v8M262 82v8M224 52h8M292 52h8M236 26l6 6M288 26l-6 6M236 78l6-6M288 78l-6-6"/></g>
    <ellipse cx="70" cy="46" rx="34" ry="16" fill="#fff"/><ellipse cx="96" cy="40" rx="24" ry="14" fill="#fff"/><path d="M50 70 l-4 12 M70 70 l-4 12 M90 70 l-4 12" stroke="#6fb4ee" stroke-width="3" stroke-linecap="round"/>
    <path d="M0 200 q80 -30 160 -8 t160 -6 v54 h-320z" fill="#9ccc72"/><path d="M0 218 q80 -20 160 -4 t160 -4 v30 h-320z" fill="#78b04f"/>
    <rect x="158" y="96" width="8" height="130" fill="#8a5a2a"/><path d="M118 132 h88" stroke="#8a5a2a" stroke-width="8" stroke-linecap="round"/><path d="M126 132 q-6 22 0 40 M198 132 q6 22 0 40" stroke="#b5562b" stroke-width="5" fill="none"/>
    <ellipse cx="162" cy="76" rx="26" ry="30" fill="#c1622f"/><path d="M140 56 q22 -12 44 0" stroke="#9a4a20" stroke-width="3" fill="none"/><circle cx="153" cy="74" r="3.4" fill="#3b2a1c"/><circle cx="172" cy="74" r="3.4" fill="#3b2a1c"/><path d="M152 90 q10 8 20 0" stroke="#3b2a1c" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="146" cy="84" r="5" fill="#e07a4a" opacity=".6"/><circle cx="179" cy="84" r="5" fill="#e07a4a" opacity=".6"/>
    <path d="M162 46 v-18" stroke="#555" stroke-width="3"/><g fill="#e8d28a" stroke="#8a6a1a" stroke-width="1.5"><path d="M162 28 l-20 -8 a11 11 0 0 0 8 16z"/><path d="M162 28 l20 -8 a11 11 0 0 1 -8 16z"/><path d="M162 28 l0 -20 a11 11 0 0 1 8 8z"/></g>
    <g><rect x="206" y="104" width="44" height="44" rx="12" fill="#fff" stroke="#d9c9ae"/><circle cx="228" cy="126" r="11" fill="#2e9d4f"/></g><path d="M198 124 l10 4" stroke="#d9c9ae" stroke-width="3"/>
    <g><rect x="64" y="104" width="44" height="44" rx="12" fill="#fff" stroke="#d9c9ae"/><path d="M86 112 l12 22 h-24z" fill="#e0a21a"/></g></svg>`;
  }
  root.ART = { farmer, hero, symbol };
})(typeof self !== 'undefined' ? self : this);
