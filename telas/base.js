/* GERADO por pagina/tools/derivar_telas.py a partir de scripts/app/mockup.template.html (o mockup aprovado). NÃO EDITE À MÃO:
   mude a lista TROCAS do gerador e rode de novo. Parte «base». */
"use strict";
/* ===================== base: dados, formato, cor, estado (v4 + v5) ===================== */
const D = ECON.D;
const V4 = D.v4, M = D.meta, MT = V4.meta, J = MT.janela_12m, NB = ' ';   // espaço que não quebra entre o símbolo e o número
const SYM = {EUR:'€', BRL:'R$', USD:'US$'};
const MES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mesPt = m => MES[+m.slice(5, 7) - 1] + '/' + m.slice(2, 4);
const mesCurto = m => MES[+m.slice(5, 7) - 1];
const sum = a => a.reduce((x, y) => x + (y || 0), 0);
const CAM = MT.cambio_media;
function fmt(v, d = 2){ return new Intl.NumberFormat('pt-BR', {minimumFractionDigits:d, maximumFractionDigits:d}).format(Math.abs(v)); }
/* ===== v10 (item 12): esconder valores. Todo número nominal passa por money · kfmt · kc · nfmt (tela, SVG, centro de rosca, rótulos, ⓘ, title, aria, chips); com OCULTO a tela mostra «•••» e só as porcentagens ficam.
   O estado fica neste navegador (casa.oculto, try/catch); mostrar de novo pede a senha, conferida por SHA-256 em JS puro (funciona em file://); só o hash mora no código. ===== */
let OCULTO = (() => { try { return ECON.mem.getItem('casa.oculto') === '1'; } catch (e) { return false; } })();
const MASCARA = '•••', HASH_MOSTRAR = 'cb47eba12f9ba7f5ba5395be6165f9dfd1bc24274d4145bb2a5b59bed270f3d1';
const nfmt = (v, d) => OCULTO ? MASCARA : fmt(v, d);   // número nominal sem símbolo (R$ escrito à parte, rótulo de coluna)
function sha256Hex(str){
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  const bytes = new TextEncoder().encode(str), L = bytes.length, nBlk = ((L + 8) >> 6) + 1, M = new Uint8Array(nBlk * 64); M.set(bytes); M[L] = 0x80;
  const dv = new DataView(M.buffer); dv.setUint32(nBlk * 64 - 4, (L * 8) >>> 0); dv.setUint32(nBlk * 64 - 8, Math.floor(L * 8 / 4294967296));
  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]; const W = new Uint32Array(64), rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let b = 0; b < nBlk; b++){
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(b * 64 + i * 4);
    for (let i = 16; i < 64; i++){ const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3), s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10); W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0; }
    let [a, b_, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++){ const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[i] + W[i]) >>> 0, S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22), mj = (a & b_) ^ (a & c) ^ (b_ & c), t2 = (S0 + mj) >>> 0; h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b_; b_ = a; a = (t1 + t2) >>> 0; }
    H = [a, b_, c, d, e, f, g, h].map((x, i) => (H[i] + x) >>> 0);
  }
  return H.map(x => x.toString(16).padStart(8, '0')).join('');
}
function money(v, cur, o = {}){
  if (v == null || Number.isNaN(v)) return '<span class="nd">N/D</span>';
  const d = o.d == null ? 0 : o.d; const neg = Math.round(v * Math.pow(10, d)) < 0;
  const sg = neg ? '−' : (o.sign && Math.round(v * Math.pow(10, d)) > 0 ? '+' : '');
  if (OCULTO) return sg + (SYM[cur] || cur) + NB + MASCARA;
  return sg + (SYM[cur] || cur) + NB + fmt(v, d);
}
const pct = (v, d = 0) => v == null ? '<span class="nd">N/D</span>' : (v < 0 ? '−' : '') + fmt(v, d) + NB + '%';
const dataBr = s => s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(2, 4) : '';
function kfmt(v, cur){
  if (OCULTO) return (v < 0 ? '−' : '') + (cur ? SYM[cur] + NB : '') + MASCARA;
  const a = Math.abs(v), s = a >= 1e6 ? fmt(a / 1e6, 1) + ' mi' : a >= 1e5 ? fmt(a / 1e3, 0) + ' mil' : a >= 1e3 ? fmt(a / 1e3, 1) + ' mil' : fmt(a, 0);   // v10: «€ 66,6 mil» (1 casa até 100 mil)
  return (v < 0 ? '−' : '') + (cur ? SYM[cur] + NB : '') + s;
}
const kc = v => OCULTO ? MASCARA : (v < 0 ? '−' : '') + fmt(Math.abs(v) / 1000, Math.abs(v) >= 10000 ? 0 : 1) + 'k';
const eurDe = (v, cur) => cur === 'BRL' ? v / CAM : v;
/* conserto e29 (P1-1): só número inteiro de verdade. «16 mil» e «16k» = 16.000; «1e5», «16 mil x», «abc» = não entendi (vale o combinado); vírgula e ponto do jeito brasileiro (1.250 ou 2,5); «1.5» = 1,5 */
function parseNum(s){
  if (s == null) return null;
  let t = String(s).trim().replace(/[−–]/g, '-').replace(/[R$€]/g, '').replace(/\s+/g, ' ').trim(); if (t === '') return null;
  let mult = 1; const m = t.match(/^(-?[\d.,]+) ?(mil|k)$/i); if (m){ t = m[1]; mult = 1000; }
  t = t.replace(/\s/g, '');
  if (!/^-?\d+([.,]\d+)*$/.test(t)) return null;
  if (t.indexOf(',') > -1){ if ((t.match(/,/g) || []).length > 1) return null; t = t.replace(/\./g, '').replace(',', '.'); }
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  else if ((t.match(/\./g) || []).length > 1) return null;
  const x = parseFloat(t) * mult; return Number.isFinite(x) ? x : null;
}
const negCabe = id => typeof BASE_PL === 'object' && BASE_PL && typeof BASE_PL[id] === 'number' && BASE_PL[id] < 0;   // negativo só onde o combinado já é negativo (crédito, Education Allowance)
const toIn = v => v == null ? '' : OCULTO ? MASCARA : (Math.round(v) < 0 ? '−' : '') + new Intl.NumberFormat('pt-BR', {maximumFractionDigits:0}).format(Math.abs(Math.round(v)));

/* ---------- cor (DESIGN.md v4): bloco = fill · txt · sup; partes na paleta categórica ---------- */
const COR = {'1':'#2563EB', '2':'#D6336C', '3':'#D4A017', '4':'#8B1E3F', '5':'#7C3AED', sobra:'#15965A', neg:'#E0453A'};
const CORT = {'1':'#1E40AF', '2':'#A61E4D', '3':'#8A5A00', '4':'#7A1B38', '5':'#6D28D9', sobra:'#0F7A47', neg:'#B42318'};
const CAT = ['#E06100', '#0E7490', '#C026D3', '#003778', '#86198F', '#B45309', '#78716C'];   // v7: paleta categórica «Casa» (auditoria § 3.2); a 7ª é o cinza do «Outros»
const SUBC = {'3.1':'#0E7490', '3.2':'#E06100', '3.3':'#003778', '4.1':'#B45309', '4.2':'#0E7490', br:'#0E7490'};   // v7: uso fixo da paleta
const SEM = {marca:'#0B8A83', neutro:'#B8C4D3', ok:'#15965A', plano:'#2563EB', ruim:'#E0453A', atencao:'#92400E'};
const rotAno = r => /^\d{4}$/.test(String(r)) ? '<span class="ano-l">' + r + '</span><span class="ano-c">’' + String(r).slice(2) + '</span>' : esc(r);
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbHex = a => '#' + a.map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0')).join('');
function misturar(h, alvo, t){ if (!h || h[0] !== '#') return h; const a = hexRgb(h), b = hexRgb(alvo); return rgbHex(a.map((x, i) => x + (b[i] - x) * t)); }
function lum(h){ const c = hexRgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
function corTxt(h){ if (!h || h[0] !== '#') return '#FFFFFF'; const L = lum(h), branco = 1.05 / (L + .05), tinta = (L + .05) / (lum('#111827') + .05); return branco >= tinta ? '#FFFFFF' : '#111827'; }
const blVars = n => '--c:var(--c' + n + ');--ct:var(--c' + n + '-t);--cs:var(--c' + n + '-s);--ctx:' + corTxt(COR[n]);
const ICO = {
  painel:'<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="12" width="8" height="9" rx="2"/><rect x="3" y="15" width="8" height="6" rx="2"/>', fluxo:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>', analises:'<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.3-4.3"/>', ajustes:'<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>', plano:'<path d="M7 4v16M7 10h8a2 2 0 0 0 2-2V4M7 16h5a2 2 0 0 0 2-2v-2"/>',
  mes:'<path d="M4 6h16M4 12h10M4 18h6"/>', orcamento:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h4"/>', viagens:'<path d="M3 14l18-8-6 14-3-6z"/>',
  'casa-ferias':'<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>', caixa:'<path d="M4 13l3-8h10l3 8v6H4z"/><path d="M4 13h5l1 2h4l1-2h5"/>',
  receitas:'<path d="M12 3v18M7 8c0-2 2-3 5-3s5 1 5 3-2 3-5 3-5 1-5 3 2 3 5 3 5-1 5-3"/>', rotina:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
  patrimonio:'<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>', anos:'<path d="M3 17l5-6 4 4 8-9"/><path d="M3 21h18"/>', futuro:'<path d="M4 20c4 0 5-12 9-12s3 6 7 6"/><circle cx="20" cy="14" r="1.4"/>', ajuste:'<path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/>', mais:'<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
  livro:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 9v11"/>'
};
/* v9 (onda 9): a aba «Orçamento» vira «Simulação {ano seguinte}»; o ano vem de D.v9.simulacao.ano_sim (fallback: ano do livro + 1) — nunca um ano escrito no código */
const ANO_SIM0 = (((D.v9 || {}).simulacao || {}).ano_sim) || ((((D.v8 || {}).meta || {}).ano) || new Date().getFullYear()) + 1;
const TELAS = [
  {id:'painel', nome:'Painel', ico:'painel'}, {id:'orcamento', nome:'Simulação ' + ANO_SIM0, curto:'Simulação', ico:'orcamento'}, {id:'livro', nome:'Livro-Caixa', curto:'Livro', ico:'livro'}
];
const GRUPOS = [];   // menu: botões principais + «Análises ▸» e «Ajustes ▸» (contrato da v5)
const PRINCIPAIS = ['painel', 'orcamento', 'livro'];
const icone = id => '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + ICO[id] + '</svg>';
const SETA = '<svg class="seta" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l5 5-5 5"/></svg>';

const NOME = {'1':'Entradas', '2':'Cotidiano França', '3':'Viagens', '4':'Outras saídas', '5':'Projetos'};
const janRot = () => S.orc.jan === '12m' ? 'últimos 12 m' : String(MT.ano_corrente) + ' (' + MT.meses_reais_ano + ' m)';

/* ---------- estado ---------- */
const S = {
  estado:'normal', mesSel:MT.mes_atual, info:{}, det:{}, exp:{}, expAll:{}, pn:{card:null, grupo:null}, menu:{}, menuFecha:null, fx:{prio:'todas'}, vgEd:{},
  orc:{bl:'2', sub:{'3':'3.1', '4':'4.1', '5':'5.1'}, vista:Object.assign({}, MT.vista_padrao), jan:'12m', ed:{}, meta:'', taxa:null, taxaRaw:null, rit:'ano', vgSel:null},
  sim:{bl:'2', ed:{}, novos:[], aj:{}, add:null, seq:0},   // v9: Simulação do ano seguinte (bloco aberto · campos editados · itens acrescentados · ajustes desligados · formulário aberto)
  vg:{ano:null, tipo:'todas', comp:'todas', sel:null, cmp:'verao', cmpAno:null},
  cf:{todos:false, grupo:null}, pl:{ren:{}, mov:{}, novos:[], cria:null, nome:'', todos:false, ab:{}}, pd:{prio:'todas'}, an:{sel:null, filtro:'todos'},
  fut:{idade:null, retorno:'', inflacao:'', faculdade:'', filho:'06/2027'}, plan:{tipo:'verao', dias:null, pes:null, total:null, totalRaw:null}, upload:null, caixa:null
};
function pil(cls, txt, title){ return '<span class="pil ' + cls + '"' + (title ? ' title="' + esc(title) + '"' : '') + '>' + txt + '</span>'; }
function sem(m, cur, o){
  o = o || {}; const d = o.d == null ? 0 : o.d, k = o.k == null ? 1 : o.k;
  if (!m || !m.status) return pil('neu', 'N/D');
  // sinal único (conserto v5): despesa mostra a sobra (planejado − realizado); receita mostra o que entrou a mais ou a menos (realizado − planejado)
  const receita = m.receita || m.status === 'acima_do_plano' || m.status === 'abaixo_do_plano';
  const v = (m.valor || 0) * k, sg = (m.desvio || 0) * k * (receita ? 1 : -1), sv = (sg < 0 ? '−' : '+') + money(Math.abs(v), cur, {d});
  switch (m.status){
    case 'economia': return pil('verde', sv + ' · sobra', 'gastou menos que o planejado');
    case 'excesso': return pil('verm', sv + ' · acima', 'gastou mais que o planejado');
    case 'no_plano': return pil('azul', (Math.abs(v) < 0.5 ? '' : sv + ' · ') + 'no plano', 'dentro da margem de ' + MT.margem.bloco_pct + ' %');
    case 'acima_do_plano': return pil('verde', sv + ' · acima do plano');
    case 'abaixo_do_plano': return pil('verm', sv + ' · abaixo do plano');
    case 'credito': return pil('verde', 'crédito ' + money(v, cur, {d}));
    case 'a_receber': return pil('azul', money(v, cur, {d}) + ' a entrar', 'receita esperada que ainda não entrou no livro');
    case 'irregular': return pil('neu', 'irregular', 'entrada que não vem todo mês: sem semáforo');
    default: return pil('neu', 'N/D');
  }
}
/* ---------- peças compartilhadas ---------- */
function tit(h1, extra){ return '<header class="cab-tela"><h1>' + h1 + '</h1><div class="dir">' + (extra || '') + '</div></header>'; }
function rodape(){ return ECON.rodape(); }
function aviso(txt, tipo){ return '<div class="aviso ' + (tipo || '') + '" role="note"><span>' + txt + '</span></div>'; }
function det(key, titulo, corpo, sub){
  const on = !!S.det[key];
  return '<section class="det"><button class="det-b" type="button" data-act="det" data-k="' + key + '" aria-expanded="' + on + '">' + SETA + '<span class="t">' + titulo + '</span>' + (sub ? '<span class="det-sub">' + sub + '</span>' : '') + '</button>' + (on ? '<div class="det-c">' + (typeof corpo === 'function' ? corpo() : corpo) + '</div>' : '') + '</section>';
}
function segBtns(grupo, opts, act, atual, extra){ return '<div class="seg ' + (extra || '') + '" role="group" aria-label="' + esc(grupo) + '">' + opts.map(([k, t]) => '<button type="button" data-act="' + act + '" data-v="' + k + '" aria-pressed="' + (atual === k) + '">' + t + '</button>').join('') + '</div>'; }
/* faixa de cartões pequenos: {id, rot, val, vars, lin, extra (rollover), conf, pressed}; cls = classe extra do cartão (fxb = fundo na cor do bloco) */
function faixa(cards, act, aberto, extra, cls){
  const morto = act === 'nada'; return '<div class="faixa ' + (extra || '') + '">' + cards.map(c => (morto ? '<div class="fx ' + (cls || '') + '" style="' + (c.vars || '') + '">' : '<button class="fx ' + (cls || '') + '" type="button" data-act="' + act + '" data-v="' + esc(c.id) + '" style="' + (c.vars || '') + '" ' + (c.pressed != null ? 'aria-pressed="' + c.pressed + '"' : 'aria-expanded="' + (aberto === c.id) + '"') + '>') +
    '<span class="fx-rot"><span>' + c.rot + '</span>' + SETA + '</span><span class="fx-val"' + (c.conf ? ' data-conf="' + c.conf + '"' : '') + '>' + c.val + '</span>' + (c.lin ? '<span class="fx-lin">' + c.lin + '</span>' : '') + (c.extra || '') + (morto ? '</div>' : '</button>')).join('') + '</div>';
}
/* ---------- gráficos (rótulos em px reais, em HTML) ---------- */
/* colunas: it = [{v, rot, cor, tip, segs:[{v,cor,nome}], badge, var}] · o = {h, refs:[{v, cls, rot}], aria, act, fv, sel, muitas} */
function colunas(it, o){
  o = o || {}; const n = it.length, H = o.h || 230, pt = o.pt || (o.badges || it.some(x => x.var) ? 58 : 30);   // com seta de variação, o topo cresce para o valor não ficar atrás dela
  const tops = it.map(x => x.segs ? sum(x.segs.map(s => Math.max(s.v, 0))) : Math.abs(x.v));
  const mx = Math.max(...(o.refs || []).map(r => r.v || 0), ...tops, 1) * 1.04, gc = 'grid-template-columns:repeat(' + n + ',minmax(0,1fr))';
  let cols = '', eixo = '';
  it.forEach((x, i) => {
    const sel = o.sel != null && i === o.sel, tag = o.act ? 'button' : 'div', attrs = o.act ? ' type="button" data-act="' + o.act + '" data-v="' + esc(x.id != null ? x.id : i) + '" aria-pressed="' + sel + '"' : '';
    let barra;
    if (x.segs){
      barra = '<span class="col-emp" style="height:calc((100% - 26px) * ' + (tops[i] / mx).toFixed(4) + ')">' + x.segs.filter(s => s.v > 0).map(s => '<i style="flex:' + s.v.toFixed(2) + ' 0 0;background:' + s.cor + '" title="' + esc(s.nome + ': ' + (o.fv || kc)(s.v)) + '"></i>').join('') + '</span>';
    } else barra = '<span class="col-b" style="height:calc((100% - 26px) * ' + (Math.abs(x.v) / mx).toFixed(4) + ');background:' + (x.cor || SEM.marca) + (sel ? ';box-shadow:0 0 0 2px var(--sup),0 0 0 4px var(--txt-1)' : '') + '"></span>';
    cols += '<' + tag + ' class="col-c' + (sel ? ' sel' : '') + (x.parcial ? ' parcial' : '') + '"' + attrs + ' title="' + esc(x.tip || x.rot) + '">' + (x.badge ? '<span class="col-badge">' + x.badge + '</span>' : '') + (x.var ? '<span class="var-seta" style="background:var(--sup-2);color:var(--txt-1);left:0">' + x.var + '</span>' : '') +
      (tops[i] ? '<span class="col-v">' + esc((o.fv || kc)(tops[i])) + '</span>' : '') + barra + '</' + tag + '>';
    eixo += '<span' + (sel ? ' class="sel"' : '') + '>' + rotAno(x.rot) + (x.sub ? '<small class="col-xs">' + esc(x.sub) + '</small>' : '') + '</span>';
  });
  const refs = (o.refs || []).filter(r => r.v).map(r => '<div class="col-ref ' + (r.cls || '') + '" style="bottom:calc((100% - ' + pt + 'px - 26px) * ' + (r.v / mx).toFixed(4) + ')">' + (r.rot ? '<span>' + esc(r.rot) + '</span>' : '') + '</div>').join('');
  return '<figure class="col' + (o.muitas || n >= 10 ? ' muitas' : '') + '" role="group" aria-label="' + esc(o.aria || 'Gráfico de colunas') + '"><div class="col-plot" style="height:' + H + 'px;padding-top:' + pt + 'px;' + gc + '">' + cols + refs + '</div><div class="col-x" style="' + gc + '">' + eixo + '</div></figure>';
}
/* barra empilhada 100 % com legenda valor + %: segs = [{nome, v, cor}] */
function barraEmp(segs, o){
  o = o || {}; const cur = o.cur || 'EUR', H = o.h || 40, ss = segs.filter(s => s.v > 0.0001), tot = sum(ss.map(s => s.v));
  if (!ss.length) return '<p class="nd">N/D</p>';
  const k = o.max ? 100 / o.max : 100 / tot;
  const base = o.pctDe || tot;   // conserto · P0-3: a % pode ser sobre outra base (as entradas), igual à tela grande
  const r = ss.map(s => { const w = s.v * k; return '<span class="emp-s' + (w < 22 ? ' pq' : '') + '" style="flex:0 0 ' + w.toFixed(3) + '%;background:' + s.cor + '" title="' + esc(s.nome) + ': ' + esc(money(s.v, cur, {d:0})) + ' (' + fmt(s.v / base * 100, 0) + ' %)">' + (w >= 10 ? '<b style="color:' + corTxt(s.cor) + '">' + esc(kfmt(s.v, cur)) + '</b>' : '') + '</span>'; }).join('');
  const leg = o.semLeg ? '' : '<ul class="emp-leg">' + ss.map(s => '<li><i style="background:' + s.cor + '"></i><span>' + esc(s.nome) + '</span><b>' + money(s.v, cur, {d:0}) + ' <span class="muted">· ' + fmt(s.v / base * 100, 0) + NB + '%</span></b></li>').join('') + '</ul>';
  const titulo = o.titulo ? '<div class="emp-tit"><span>' + o.titulo + '</span><b>' + money(tot, cur, {d:0}) + '</b></div>' : '';
  return '<figure class="emp">' + titulo + '<div class="emp-bar' + (o.max ? ' trilho' : '') + '" style="height:' + H + 'px" role="img" aria-label="' + esc(o.aria || 'Barra empilhada') + '">' + r + '</div>' + leg + '</figure>';
}
/* rosca com rótulos puxados por linha-guia (SVG de largura fixa); no celular, versão simples + legenda */
function arco(cx, cy, r, a0, a1){
  const g = a1 - a0 >= Math.PI * 2 - 1e-4 ? Math.PI * 2 - 1e-4 : a1 - a0;
  const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a0 + g), y1 = cy + r * Math.sin(a0 + g);
  return 'M' + x0.toFixed(2) + ' ' + y0.toFixed(2) + ' A' + r + ' ' + r + ' 0 ' + (g > Math.PI ? 1 : 0) + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2);
}
