#!/usr/bin/env node
'use strict';
// Gera os ícones da página (PNG, sem dependências): quadrado teal da marca do app (#0B8A83, DESIGN.md --marca) com o «E» branco do logotipo.
//   node pagina/tools/gerar_icones.js   → apple-touch-icon.png (180) · icone-192.png · icone-512.png
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function bloco(tipo, dados) {
  const t = Buffer.from(tipo, 'latin1');
  const len = Buffer.alloc(4); len.writeUInt32BE(dados.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, dados])));
  return Buffer.concat([len, t, dados, crc]);
}
// E em coordenadas de 0 a 100 (haste + 3 barras)
const RETANGULOS = [[30, 24, 42, 76], [30, 24, 70, 36], [30, 44, 64, 56], [30, 64, 70, 76]];
function png(tam) {
  const teal = [0x0b, 0x8a, 0x83], branco = [255, 255, 255];
  const linhas = [];
  for (let y = 0; y < tam; y++) {
    const l = Buffer.alloc(1 + tam * 3);
    for (let x = 0; x < tam; x++) {
      const ux = ((x + 0.5) * 100) / tam, uy = ((y + 0.5) * 100) / tam;
      const dentro = RETANGULOS.some(([x0, y0, x1, y1]) => ux >= x0 && ux < x1 && uy >= y0 && uy < y1);
      const c = dentro ? branco : teal;
      l[1 + x * 3] = c[0]; l[2 + x * 3] = c[1]; l[3 + x * 3] = c[2];
    }
    linhas.push(l);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(tam, 0); ihdr.writeUInt32BE(tam, 4); ihdr[8] = 8; ihdr[9] = 2; // 8 bits, RGB
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), bloco('IHDR', ihdr), bloco('IDAT', zlib.deflateSync(Buffer.concat(linhas))), bloco('IEND', Buffer.alloc(0))]);
}
const pasta = path.resolve(__dirname, '..');
for (const [arquivo, tam] of [['apple-touch-icon.png', 180], ['icone-192.png', 192], ['icone-512.png', 512]]) {
  fs.writeFileSync(path.join(pasta, arquivo), png(tam));
  console.log(arquivo + ' ' + tam + 'x' + tam);
}
