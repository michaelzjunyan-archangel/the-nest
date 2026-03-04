---
title: test
desc: >-
  function parseFM(raw) {
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
    if (!m) return { meta:{}, body:raw.trim() };
    const meta = {};
    const lines = m[1].split(/\r?\n/);
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const ci = line.indexOf(':');
      if (ci < 0) { i++; continue; }
      const k = line.slice(0, ci).trim();
      const rest = line.slice(ci + 1).trim();
      // multiline block scalar: "key: |" or "key: |-"
      if (rest === '|' || rest === '|-' || rest === '>') {
        i++;
        const blockLines = [];
        while (i < lines.length && (lines[i].startsWith('  ') || lines[i] === '')) {
          blockLines.push(lines[i].replace(/^  /, ''));
          i++;
        }
        meta[k] = blockLines.join('\n').trim();
      } else {
        meta[k] = rest.replace(/^["']|["']$/g, '');
        i++;
      }
    }
    return { meta, body: m[2].trim() };
  }
---
