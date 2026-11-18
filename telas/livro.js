/* GERADO por pagina/tools/derivar_telas.py a partir de scripts/app/mockup.template.html (o mockup aprovado). NÃO EDITE À MÃO:
   mude a lista TROCAS do gerador e rode de novo. Parte «livro». */
"use strict";
/* ===================== 12 · LIVRO-CAIXA (onda 12): o livro único inteiro, rolagem virtual, colunas à escolha, filtro por coluna, busca, edição na célula, importador =====================
   Dado: D.livro (gerador) = cols na ordem do CSV · dic[col] (valores distintos) · rows[i][j] (índice no dic, ou número nas colunas de valor) · plano (categoria → itens).
   Regra da v11 — nada aqui diz que fez o que não fez: edição e importação ficam neste navegador (localStorage · sessionStorage) e a tela diz isso no pé e no ⓘ; o nó de sincronização com a planilha é o app real. */
const LV = D.livro || null;
const LV_META = {   // nome humano · tipo (data · num · txt) · largura · editável (true = texto livre · 'lista' = lista fechada)
  DATA:{n:'Data', t:'data', m:92, w:100}, DESCRICAO_LIMPA:{n:'Descrição', t:'txt', m:170, fr:2, ed:true}, VALOR_NATIVO:{n:'Valor', t:'num', m:108, w:124}, MOEDA:{n:'Moeda', t:'txt', m:62, w:72}, CONTA:{n:'Conta', t:'txt', m:110, w:140},
  CATEGORIA:{n:'Categoria', t:'txt', m:140, w:220, ed:'lista'}, ITEM:{n:'Item', t:'txt', m:122, w:180, ed:'lista'}, PROJETO:{n:'Projeto', t:'txt', m:114, w:170, ed:'lista'}, CONTRAPARTE:{n:'Contraparte', t:'txt', m:150, fr:1, ed:true}, CONTRAPARTE_NORM:{n:'Contraparte normalizada', t:'txt', m:150, w:210},
  TITULAR:{n:'Titular', t:'txt', m:86, w:100, ed:'lista'}, CARTAO:{n:'Cartão', t:'txt', m:90, w:104}, PARCELA:{n:'Parcela', t:'txt', m:84, w:92}, COR:{n:'Confiança', t:'txt', m:96, w:108, ed:'lista'}, FONTE:{n:'Fonte', t:'txt', m:160, fr:1}, 'OBSERVAÇÃO':{n:'Observação', t:'txt', m:200, fr:2},
  ENTRADA:{n:'Entrada', t:'num', m:100, w:116}, 'SAÍDA':{n:'Saída', t:'num', m:100, w:116}, TIPO_CC:{n:'Tipo', t:'txt', m:110, w:136}, PROJETO_GRUPO:{n:'Grupo do projeto', t:'txt', m:140, w:180}, VALOR_EUR:{n:'Valor em €', t:'num', m:104, w:120}, VALOR_BRL_EQ:{n:'Valor em R$', t:'num', m:110, w:128},
  GRANULARIDADE:{n:'Granularidade', t:'txt', m:130, w:156}, PERIODO_VIDA:{n:'Período de vida', t:'txt', m:150, w:206}, CC:{n:'Centro de custo', t:'txt', m:110, w:130}, EM:{n:'Empresa', t:'txt', m:120, w:150}, '#':{n:'Nº', t:'txt', m:60, w:70}, 'MÊS':{n:'Mês', t:'txt', m:64, w:80}, ANO:{n:'Ano', t:'txt', m:64, w:80}
};
const LV_PADRAO = ['DATA', 'DESCRICAO_LIMPA', 'VALOR_NATIVO', 'MOEDA', 'CONTA', 'CATEGORIA', 'ITEM', 'PROJETO'];   // as relevantes, ligadas por padrão (pedido do Tobia, 07/11)
const LV_RH = 44, LV_RH_CEL = 100, LV_BUF = 8;
const LV_KEY_COLS = 'casa.livro.colunas', LV_KEY_ED = () => 'casa.livro.' + (LV ? LV.edicao : 'x'), LV_KEY_IMP = () => 'casa.livro.importados.' + (LV ? LV.edicao : 'x');
const lvCI = {}; if (LV) LV.cols.forEach((c, j) => { lvCI[c] = j; });
const lvMeta = c => LV_META[c] || {n:c, t:'txt', m:110, w:140};
const lvNorm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const ssGet = k => { try { return JSON.parse(ECON.mem2.getItem(k) || 'null'); } catch (e) { return null; } };
const ssSet = (k, v) => { try { if (v == null) ECON.mem2.removeItem(k); else ECON.mem2.setItem(k, JSON.stringify(v)); } catch (e) {} };
S.lv = {cols:null, q:'', f:{}, sort:{c:'DATA', d:-1}, ed:null, edits:{}, edSeq:0, imp:{on:false}, exp:null, extra:[], calc:null, sig:'', kDe:-1, kAte:-1, ultimo:null, vals:{}};
function lvMigrarEd(){   // a edição mais recente de uma edição ANTERIOR (casa.livro.e31 → casa.livro.e32): copia para a chave nova e deixa a antiga intacta
  try {
    const atual = +String((LV && LV.edicao) || '').replace(/\D/g, ''); if (!atual) return null;
    let melhor = null, nm = -1;
    for (let i = 0; i < ECON.mem.length; i++){ const k = ECON.mem.key(i), m = /^casa\.livro\.e(\d+)$/.exec(k || ''); if (m && +m[1] < atual && +m[1] > nm){ nm = +m[1]; melhor = k; } }
    const o = melhor ? lsGet(melhor) : null;
    if (!o || !o.edits || typeof o.edits !== 'object' || !Object.keys(o.edits).length) return null;
    const n = {edicao:LV.edicao, edits:o.edits, em:o.em || new Date().toISOString().slice(0, 10), migrado_de:melhor.replace('casa.livro.', '')};
    lsSet(LV_KEY_ED(), n); return n;
  } catch (e) { return null; }
}
function lvInit(){
  if (S.lv.cols) return;
  const g = lsGet(LV_KEY_COLS); S.lv.cols = Array.isArray(g) && g.length && g.every(c => lvCI[c] != null) ? g : LV_PADRAO.filter(c => lvCI[c] != null);
  let e = lsGet(LV_KEY_ED());
  if (!e) e = lvMigrarEd();   // e32: o livro novo mantém a ordem do anterior (linha nova entra no fim), então a edição por posição passa para a edição nova
  if (e && e.edits && typeof e.edits === 'object') S.lv.edits = e.edits;
  const x = ssGet(LV_KEY_IMP()); if (Array.isArray(x)) S.lv.extra = x;
  Object.keys(S.lv.edits).forEach(i => { if (+i >= LV.n + S.lv.extra.length) delete S.lv.edits[i]; });   // edição de linha importada que não está mais na sessão
}
const lvN = () => LV.n + S.lv.extra.length;
const lvColsVis = () => S.lv.cols.filter(c => lvCI[c] != null);
const lvCel = () => (window.innerWidth || 1280) < 768;
const lvEditavel = c => !OCULTO && ECON.livroEdita() && !!(LV_META[c] && LV_META[c].ed);
function lvOrig(i, c){ if (i < LV.n){ const j = lvCI[c]; if (j == null) return ''; const v = LV.rows[i][j]; return LV.dic[c] ? LV.dic[c][v] : v; } const x = S.lv.extra[i - LV.n]; return x && x[c] != null ? x[c] : (lvMeta(c).t === 'num' ? null : ''); }
function lvVal(i, c){ const e = S.lv.edits[i]; if (e && c in e) return e[c]; return lvOrig(i, c); }
const lvMoeda = (i, c) => c === 'VALOR_EUR' ? 'EUR' : c === 'VALOR_BRL_EQ' ? 'BRL' : (lvVal(i, 'MOEDA') || 'EUR');
/* valores distintos de uma coluna com a contagem (todas as linhas), do mais frequente ao menos: a lista do filtro */
function lvValores(c){
  if (S.lv.vals[c] && S.lv.vals[c].seq === S.lv.edSeq + '|' + S.lv.extra.length) return S.lv.vals[c].lista;
  const m = new Map(); const N = lvN(); for (let i = 0; i < N; i++){ const v = lvVal(i, c); const k = v == null ? '' : String(v); m.set(k, (m.get(k) || 0) + 1); }
  const lista = Array.from(m.entries()).sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]), 'pt-BR'));
  S.lv.vals[c] = {seq:S.lv.edSeq + '|' + S.lv.extra.length, lista}; return lista;
}
const lvFAtivo = f => !!f && ((f.vals && f.vals.length) || f.de || f.ate || f.min != null || f.max != null);
function lvPassa(c, f, v){
  const t = lvMeta(c).t;
  if (f.vals && f.vals.length){ const k = v == null ? '' : String(v); if (f.vals.indexOf(k) < 0) return false; }
  if (t === 'data'){ if (f.de && (!v || v < f.de)) return false; if (f.ate && (!v || v > f.ate)) return false; }
  if (t === 'num'){ if (f.min != null && (v == null || v < f.min)) return false; if (f.max != null && (v == null || v > f.max)) return false; }
  return true;
}
function lvCalc(){
  const sig = JSON.stringify([S.lv.q, S.lv.f, S.lv.sort, S.lv.extra.length, S.lv.edSeq, S.lv.cols]);
  if (S.lv.calc && S.lv.sig === sig) return S.lv.calc;
  const q = lvNorm(S.lv.q).trim(), cols = lvColsVis(), N = lvN(), idx = [], fs = Object.keys(S.lv.f).filter(c => lvFAtivo(S.lv.f[c]) && lvCI[c] != null).map(c => [c, S.lv.f[c]]);
  let ent = 0, sai = 0; const nat = {};
  for (let i = 0; i < N; i++){
    let ok = true;
    for (let k = 0; k < fs.length && ok; k++) ok = lvPassa(fs[k][0], fs[k][1], lvVal(i, fs[k][0]));
    if (ok && q){ ok = false; for (let k = 0; k < cols.length && !ok; k++){ const v = lvVal(i, cols[k]); if (v != null && v !== '' && lvNorm(cols[k] === 'CONTA' ? contaNome(v) + ' ' + v : lvMeta(cols[k]).t === 'num' ? fmt(v, 2) + ' ' + v : v).indexOf(q) > -1) ok = true; } }
    if (!ok) continue;
    idx.push(i);
    const e = lvVal(i, 'VALOR_EUR'); if (typeof e === 'number'){ if (e > 0) ent += e; else sai -= e; }
    const vn = lvVal(i, 'VALOR_NATIVO'), mo = lvVal(i, 'MOEDA') || '?'; if (typeof vn === 'number'){ const o = nat[mo] = nat[mo] || {ent:0, sai:0}; if (vn > 0) o.ent += vn; else o.sai -= vn; }
  }
  const sc = S.lv.sort.c, sd = S.lv.sort.d, st = lvMeta(sc).t;
  if (lvCI[sc] != null) idx.sort((a, b) => { const x = lvVal(a, sc), y = lvVal(b, sc); if (st === 'num'){ const nx = x == null, ny = y == null; if (nx || ny) return nx && ny ? a - b : nx ? 1 : -1; return (x - y) * sd || a - b; } const r = String(x == null ? '' : x).localeCompare(String(y == null ? '' : y), 'pt-BR'); return r * sd || (a - b) * sd; });
  S.lv.sig = sig; S.lv.calc = {idx, ent, sai, nat}; S.lv.kDe = -1; return S.lv.calc;
}
/* ---------- a tabela: cabeçalho fixo + corpo virtual (só as linhas à vista são montadas; a altura total é a de todas) ---------- */
/* trilhas: minmax(mínimo, ideal); descrição, observação, fonte e contraparte absorvem a sobra (fr); sem nenhuma delas à vista, a última coluna absorve. Rolagem lateral só dentro do quadro, e só quando os mínimos não cabem */
const lvTpl = cols => { const temFr = cols.some(c => lvMeta(c).fr); return '28px ' + cols.map((c, k) => { const m = lvMeta(c); return m.fr ? 'minmax(' + m.m + 'px,' + m.fr + 'fr)' : (!temFr && k === cols.length - 1) ? 'minmax(' + m.m + 'px,1fr)' : 'minmax(' + m.m + 'px,' + m.w + 'px)'; }).join(' '); };
const lvMinW = cols => 28 + sum(cols.map(c => lvMeta(c).m));
const lvColsDet = () => { const v = new Set(LV.vazias || []); return LV_PADRAO.filter(c => lvCI[c] != null).concat(LV.cols.filter(c => LV_PADRAO.indexOf(c) < 0)).filter(c => !v.has(c)); };   // o registro inteiro: as relevantes primeiro; coluna vazia no livro inteiro fica de fora
function lvEH(cel){ const n = lvColsDet().length, por = cel ? 1 : (window.innerWidth || 1280) >= 1180 ? 3 : 2; return Math.ceil(n / por) * 32 + 16 + 40 + (cel ? 16 : 0); }
function lvAltura(C){ const cel = lvCel(); return C.idx.length * (cel ? LV_RH_CEL : LV_RH) + (S.lv.exp != null && C.idx.indexOf(S.lv.exp) > -1 ? lvEH(cel) : 0); }
const ICO_FUNIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>';
function lvTh(c){
  const m = lvMeta(c), on = S.lv.sort.c === c, f = lvFAtivo(S.lv.f[c]), vazia = (LV.vazias || []).indexOf(c) > -1;
  return '<div class="lv-c' + (m.t === 'num' ? ' num' : '') + '"><button class="lv-tn" type="button" data-act="lv-sort" data-v="' + esc(c) + '"' + (on ? ' aria-sort="' + (S.lv.sort.d > 0 ? 'ascending' : 'descending') + '"' : '') + ' title="ordenar por ' + esc(m.n) + '">' + esc(m.n) + (vazia ? ' <span class="apoio">(vazia)</span>' : '') + (on ? '<span class="srt">' + (S.lv.sort.d > 0 ? '▲' : '▼') + '</span>' : '') + '</button>' +
    '<button class="lv-ff' + (f ? ' on' : '') + '" type="button" data-act="pop" data-pop="lv-f-' + esc(c) + '" data-c="' + esc(c) + '" aria-expanded="false" aria-label="filtrar ' + esc(m.n) + '">' + ICO_FUNIL + '</button><div class="pop lv-pop" id="lv-f-' + esc(c) + '" popover role="dialog" aria-label="filtro de ' + esc(m.n) + '">' + lvFiltroPop(c) + '</div></div>';
}
function lvFiltroPop(c){
  const m = lvMeta(c), f = S.lv.f[c] || {}, hd = '<div class="lv-fp-h"><b>' + esc(m.n) + '</b>' + (lvFAtivo(f) ? '<button class="btn link peq" type="button" data-act="lv-f-limpar" data-v="' + esc(c) + '">limpar</button>' : '') + '</div>';
  if (m.t === 'data') return hd + '<div class="lv-fp-g"><label class="campo">de<input type="date" class="lv-fin" data-lv-f="de" data-c="' + esc(c) + '" value="' + esc(f.de || '') + '" min="' + esc(LV.de || '') + '" max="' + esc(LV.ate || '') + '"></label><label class="campo">até<input type="date" class="lv-fin" data-lv-f="ate" data-c="' + esc(c) + '" value="' + esc(f.ate || '') + '" min="' + esc(LV.de || '') + '" max="' + esc(LV.ate || '') + '"></label></div>' +
    '<div class="lv-fp-atalhos">' + [['mes', mesPt(MT.mes_fechado)], ['12m', 'últimos 12 m'], ['ano', 'em ' + String(MT.ano_corrente)]].map(([k, t]) => '<button class="btn peq" type="button" data-act="lv-f-data" data-v="' + k + '" data-c="' + esc(c) + '">' + esc(t) + '</button>').join('') + '</div>';
  if (m.t === 'num') return hd + '<div class="lv-fp-g"><label class="campo">mínimo<input type="text" inputmode="decimal" class="lv-fin" data-lv-f="min" data-c="' + esc(c) + '" value="' + (f.min != null ? esc(toIn(f.min)) : '') + '" placeholder="ex.: −500"></label><label class="campo">máximo<input type="text" inputmode="decimal" class="lv-fin" data-lv-f="max" data-c="' + esc(c) + '" value="' + (f.max != null ? esc(toIn(f.max)) : '') + '" placeholder="ex.: 0"></label></div><p class="apoio">saída = negativo · entrada = positivo</p>';
  return hd + '<input type="search" class="lv-fin" data-lv-fq="' + esc(c) + '" placeholder="procurar um valor" aria-label="procurar na lista de ' + esc(m.n) + '"><div class="lv-fl" id="lv-fl-' + esc(c) + '">' + lvFiltroLista(c, '') + '</div>';
}
function lvFiltroLista(c, q){
  const f = S.lv.f[c] || {}, sel = f.vals || [], qn = lvNorm(q).trim(), L = lvValores(c), rot = v => c === 'CONTA' ? contaNome(v) : v === '' ? '(vazio)' : v;
  const mostra = (qn ? L.filter(([v]) => lvNorm(rot(v)).indexOf(qn) > -1) : L).slice(0, 60);
  if (!mostra.length) return '<p class="apoio" style="padding:6px 2px">nenhum valor com «' + esc(q) + '»</p>';
  return mostra.map(([v, n]) => '<label class="lv-ck"><input type="checkbox" data-lv-fv="' + esc(c) + '" value="' + esc(v) + '"' + (sel.indexOf(v) > -1 ? ' checked' : '') + '><span class="t">' + esc(rot(v)) + '</span><span class="n">' + n + '</span></label>').join('') + (L.length > 60 && !qn ? '<p class="apoio" style="padding:6px 2px">' + (L.length - 60) + ' valores a mais: procure acima</p>' : '');
}
function lvTexto(i, c, v){
  const m = lvMeta(c);
  if (m.t === 'num'){ if (v == null || v === '') return ''; const cur = lvMoeda(i, c), cls = c === 'ENTRADA' ? 'entrada' : c === 'SAÍDA' ? 'saida' : v < 0 ? 'saida' : v > 0 ? 'entrada' : ''; return '<span class="' + cls + '">' + money(v, cur, {d:2}) + '</span>'; }
  if (c === 'DATA') return v ? esc(dataBr(v)) : '';
  if (c === 'CONTA') return esc(contaNome(v));
  if (c === 'COR') return v ? '<span title="confiança da classificação">' + esc(v) + '</span>' : '';
  if (c === 'GRANULARIDADE') return v && v !== 'linha' ? pil('ambar peq', esc(v), 'linha agregada: não é um lançamento do extrato') : esc(v);
  let t = esc(v == null ? '' : v);
  if (c === 'DESCRICAO_LIMPA'){ const g = lvVal(i, 'GRANULARIDADE'); if (g && g !== 'linha' && S.lv.cols.indexOf('GRANULARIDADE') < 0) t += ' ' + pil('ambar peq', esc(g), 'linha agregada: não é um lançamento do extrato'); if (i >= LV.n) t += ' ' + pil('azul peq', 'importado', 'entrou nesta sessão do navegador'); }
  return t;
}
function lvCampo(i, c, v){
  const m = lvMeta(c), at = ' class="lv-in" data-lv-in="' + esc(c) + '" data-i="' + i + '" aria-label="editar ' + esc(m.n) + '"';
  if (m.ed === 'lista'){
    let L = c === 'CATEGORIA' ? Object.keys(LV.plano || {}).sort() : c === 'ITEM' ? ((LV.plano || {})[lvVal(i, 'CATEGORIA')] || []).slice() : (LV.dic[c] || []).slice().sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
    if (c === 'ITEM' && !L.length) L = (LV.dic.ITEM || []).slice().sort();
    if (L.indexOf(v) < 0) L = [v].concat(L);
    return '<select' + at + '>' + L.map(x => '<option value="' + esc(x) + '"' + (x === v ? ' selected' : '') + '>' + esc(x === '' ? '(vazio)' : x) + '</option>').join('') + '</select>';
  }
  return '<input type="text"' + at + ' value="' + esc(v == null ? '' : v) + '" maxlength="200">';
}
function lvTd(i, c){
  const m = lvMeta(c), v = lvVal(i, c), ed = !!(S.lv.edits[i] && c in S.lv.edits[i]), editing = !!(S.lv.ed && S.lv.ed.i === i && S.lv.ed.c === c), pode = lvEditavel(c);
  const inner = editing ? lvCampo(i, c, v) : '<span class="t">' + lvTexto(i, c, v) + '</span>' + (ed ? '<button class="lv-undo" type="button" data-act="lv-undo" data-v="' + i + '" data-c="' + esc(c) + '" aria-label="desfazer a edição" title="desfazer: volta a «' + esc(lvOrig(i, c) == null ? '' : lvOrig(i, c)) + '»">↶</button>' : '');
  return '<div class="lv-c' + (m.t === 'num' ? ' num' : '') + (pode ? ' ed-ok' : '') + (ed ? ' edit' : '') + (editing ? ' editing' : '') + '"' + (pode && !editing ? ' data-act="lv-ed" data-v="' + i + '" data-c="' + esc(c) + '" title="' + (ed ? 'editado · era «' + esc(lvOrig(i, c) == null ? '' : lvOrig(i, c)) + '»' : 'toque para editar') + '"' : (!pode && !editing && m.t !== 'num' && v ? ' title="' + esc(c === 'CONTA' ? contaNome(v) : v) + '"' : '')) + '>' + inner + '</div>';
}
/* o registro inteiro (todas as colunas), aberto embaixo da linha: as editáveis editam aqui também; o que não se edita leva o «está errado?» (Pedir ajuste) */
function lvDet(i){
  const v = c => lvVal(i, c), desc = v('DESCRICAO_LIMPA') || v('CONTRAPARTE') || '', val = money(v('VALOR_NATIVO') || 0, v('MOEDA') || 'EUR', {d:2});
  return '<div class="lv-det">' + lvColsDet().map(c => { const m = lvMeta(c), x = v(c), ed = !!(S.lv.edits[i] && c in S.lv.edits[i]), editing = !!(S.lv.ed && S.lv.ed.i === i && S.lv.ed.c === c), pode = lvEditavel(c);
      return '<div class="lv-dk"><span class="k">' + esc(m.n) + '</span><span class="v' + (pode ? ' ed-ok' : '') + (ed ? ' edit' : '') + '"' + (pode && !editing ? ' data-act="lv-ed" data-v="' + i + '" data-c="' + esc(c) + '" title="toque para editar"' : (x && m.t !== 'num' ? ' title="' + esc(x) + '"' : '')) + '>' + (editing ? lvCampo(i, c, x) : (lvTexto(i, c, x) || '<span class="nd">—</span>') + (ed ? '<button class="lv-undo" type="button" data-act="lv-undo" data-v="' + i + '" data-c="' + esc(c) + '" aria-label="desfazer a edição">↶</button>' : '')) + '</span></div>'; }).join('') +
    '<div class="lv-det-pe"><span class="apoio">linha ' + (i + 1) + (i >= LV.n ? ' · importada nesta sessão' : ' do livro ' + esc(LV.edicao)) + '</span>' + paLink(dataBr(v('DATA') || ''), desc, val, contaNome(v('CONTA')), (v('CATEGORIA') || '') + (v('ITEM') ? ' › ' + v('ITEM') : '')) + '</div></div>';
}
function lvLinha(i, k){
  const cel = lvCel(), exp = S.lv.exp === i, EH = lvEH(cel), nova = i >= LV.n;
  if (cel){
    const extras = lvColsVis().filter(c => ['DATA', 'DESCRICAO_LIMPA', 'VALOR_NATIVO', 'MOEDA'].indexOf(c) < 0).map(c => lvTexto(i, c, lvVal(i, c))).filter(Boolean);
    return '<div class="lv-r card' + (exp ? ' exp' : '') + (nova ? ' nova' : '') + '" data-act="lv-exp" data-v="' + i + '" role="button" tabindex="0" aria-expanded="' + exp + '" style="height:' + (LV_RH_CEL + (exp ? EH : 0)) + 'px"><span class="lv-card-d">' + esc(dataBr(lvVal(i, 'DATA') || '')) + '</span><span class="lv-card-v">' + lvTexto(i, 'VALOR_NATIVO', lvVal(i, 'VALOR_NATIVO')) + '</span><span class="lv-card-t">' + lvTexto(i, 'DESCRICAO_LIMPA', lvVal(i, 'DESCRICAO_LIMPA')) + '</span><span class="lv-card-s">' + extras.join(' · ') + '</span>' + (exp ? lvDet(i) : '') + '</div>';
  }
  return '<div class="lv-r' + (exp ? ' exp' : '') + (nova ? ' nova' : '') + '" data-i="' + i + '"' + (exp ? ' style="height:' + (LV_RH + EH) + 'px;grid-template-rows:' + LV_RH + 'px minmax(0,1fr)"' : '') + '><div class="lv-c lv-x"><button type="button" data-act="lv-exp" data-v="' + i + '" aria-expanded="' + exp + '" aria-label="' + (exp ? 'fechar' : 'mostrar') + ' o registro inteiro">' + SETA + '</button></div>' + lvColsVis().map(c => lvTd(i, c)).join('') + (exp ? lvDet(i) : '') + '</div>';
}
function lvPintar(forca){
  const w = $('#lv-wrap'), R = $('#lv-rows'); if (!w || !R) return;
  const C = lvCalc(), idx = C.idx, n = idx.length, cel = lvCel(), RH = cel ? LV_RH_CEL : LV_RH, EH = lvEH(cel), expK = S.lv.exp != null ? idx.indexOf(S.lv.exp) : -1;
  const top = w.scrollTop, H = w.clientHeight || 600; let k0 = Math.floor(top / RH); if (expK >= 0 && k0 > expK) k0 = Math.max(expK, Math.floor((top - EH) / RH));
  const kDe = Math.max(0, k0 - LV_BUF), kAte = Math.min(n, k0 + Math.ceil(H / RH) + LV_BUF + 1);
  if (!forca && kDe === S.lv.kDe && kAte === S.lv.kAte) return;
  S.lv.kDe = kDe; S.lv.kAte = kAte;
  let h = ''; for (let k = kDe; k < kAte; k++) h += lvLinha(idx[k], k);
  R.style.top = (kDe * RH + (expK >= 0 && kDe > expK ? EH : 0)) + 'px'; R.innerHTML = mascaraHtml(trocaPlanHtml(h));
  const b = $('#lv-b'); if (b) b.style.height = lvAltura(C) + 'px';
  if (S.lv.ed){ const inp = R.querySelector('[data-lv-in]'); if (inp && document.activeElement !== inp){ focoSem(inp); if (inp.type === 'text'){ try { const n = inp.value.length; inp.setSelectionRange(n, n); } catch (err) {} } } }   // o cursor vai ao fim: digitar acrescenta, não substitui (P2 da autoavaliação)
}
function lvTabela(){
  const cols = lvColsVis(), C = lvCalc(), cel = lvCel();
  return (cel ? '' : '<div class="lv-h" role="row"><div class="lv-c lv-x" aria-hidden="true"></div>' + cols.map(lvTh).join('') + '</div>') + '<div class="lv-b" id="lv-b" style="height:' + lvAltura(C) + 'px"><div class="lv-rows" id="lv-rows"></div></div>' + (C.idx.length ? '' : '<div class="lv-vazio">nenhum lançamento com esses filtros e essa busca</div>');
}
function lvChips(){
  const L = [], rot = c => lvMeta(c).n, x = (c, k) => '<button type="button" data-act="lv-f-limpar" data-v="' + esc(c) + '"' + (k ? ' data-k="' + k + '"' : '') + ' aria-label="tirar este filtro">×</button>';
  if (S.lv.q.trim()) L.push('<span class="pil">busca: «' + esc(S.lv.q.trim()) + '»' + x('__q') + '</span>');
  Object.keys(S.lv.f).forEach(c => { const f = S.lv.f[c]; if (!lvFAtivo(f) || lvCI[c] == null) return;
    if (f.vals && f.vals.length){ const vs = f.vals.map(v => c === 'CONTA' ? contaNome(v) : v === '' ? '(vazio)' : v); L.push('<span class="pil">' + esc(rot(c)) + ': ' + esc(vs.slice(0, 3).join(', ')) + (vs.length > 3 ? ' +' + (vs.length - 3) : '') + x(c) + '</span>'); }
    if (f.de || f.ate) L.push('<span class="pil">' + esc(rot(c)) + ': ' + (f.de ? 'de ' + esc(dataBr(f.de)) : '') + (f.ate ? ' até ' + esc(dataBr(f.ate)) : '') + x(c, 'per') + '</span>');
    if (f.min != null || f.max != null) L.push('<span class="pil">' + esc(rot(c)) + ': ' + (f.min != null ? '≥ ' + esc(toIn(f.min)) : '') + (f.max != null ? ' ≤ ' + esc(toIn(f.max)) : '') + x(c, 'fx') + '</span>'); });
  return L.length ? L.join('') + '<button class="btn link peq" type="button" data-act="lv-f-limpar" data-v="__tudo">limpar tudo</button>' : '<span class="apoio">sem filtro · ordem: ' + esc(lvMeta(S.lv.sort.c).n) + (S.lv.sort.d > 0 ? ' crescente' : ' decrescente') + '</span>';
}
const lvNEd = () => sum(Object.keys(S.lv.edits).map(i => Object.keys(S.lv.edits[i]).length));
function lvPe(){
  const C = lvCalc(), n = C.idx.length, N = lvN(), moedas = Object.keys(C.nat), nEd = lvNEd();
  const nat = moedas.length === 1 && moedas[0] !== 'EUR' ? ' <span class="muted">· em ' + esc(moedas[0]) + ': entrou ' + money(C.nat[moedas[0]].ent, moedas[0]) + ' · saiu ' + money(C.nat[moedas[0]].sai, moedas[0]) + '</span>' : '';
  return '<div class="lv-pe-s"><span><b>' + n + ' de ' + N + ' lançamentos</b></span><span>entrou <b class="entrada">' + money(C.ent, 'EUR') + '</b></span><span>saiu <b class="saida">' + money(C.sai, 'EUR') + '</b></span><span>líquido <b class="' + (C.ent - C.sai >= 0 ? 'sobra' : 'saida') + '">' + money(C.ent - C.sai, 'EUR', {sign:true}) + '</b></span>' + nat + (moedas.length > 1 ? ' <span class="muted">· soma em € pelo câmbio de cada mês</span>' : '') + '</div>' +
    '<span class="apoio">' + (nEd ? '<b>' + nPl(nEd, 'célula editada', 'células editadas') + '</b> · ' : '') + 'edições e importações ficam neste navegador · o app real grava na planilha</span>';
}
function lvPopTela(){
  return 'Todas as <b>' + lvN() + ' linhas</b> do livro único, de ' + esc(mesPt(LV.de.slice(0, 7))) + ' a ' + esc(mesPt(LV.ate.slice(0, 7))) + ': nada é somado nem escondido. As linhas <b>agregado mensal</b> (antes de nov/2024, vindas das planilhas antigas) e <b>estimativa mensal</b> aparecem marcadas na coluna Granularidade (e na descrição, quando essa coluna está desligada). ' +
    'Você escolhe as colunas — a escolha fica neste navegador; o funil de cada coluna filtra por valor, faixa de data ou de valor; a busca procura nas colunas à vista; o pé soma o que está filtrado, em € pelo câmbio de cada mês. ' +
    '<b>Edição direta na célula</b> — descrição, contraparte, categoria, item, projeto, titular, parcela, confiança e observação: são campos de classificação, e as listas fechadas vêm do plano de contas. <b>Data, valor, moeda, conta e cartão não se editam aqui</b>: vêm do extrato, e um valor digitado à mão quebraria a conferência com o saldo do banco — se estiverem errados, o caminho é «está errado?» no registro (Pedir ajuste) ou absorver o extrato de novo. Valor em €, Entrada/Saída, grupo do projeto, período de vida, tipo e contraparte normalizada são calculados a partir das outras colunas. ' +
    '<b>Neste mockup a edição e a importação ficam neste navegador</b>; o app real sincroniza com a planilha.';
}
function viewLivro(){
  if (!LV) return cabTela('Livro-Caixa') + aviso('<b>Sem o livro na camada de dados.</b> Gere o mockup de novo com o livro único.', 'bad') + rodape();
  lvInit();
  const cols = lvColsVis(), nEd = lvNEd(), nCols = LV.cols.length;
  let h = cabTela('Livro-Caixa', nPl(lvN(), 'lançamento') + ' · ' + LV.de.slice(0, 4) + '–' + LV.ate.slice(0, 4), lvPopTela(), 'todas as linhas do livro único, inclusive as agregadas por mês');
  h += '<div class="lv-top"><label class="lv-busca"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.3-4.3"/></svg><input type="search" data-lv="q" value="' + esc(S.lv.q) + '" placeholder="buscar nas colunas à vista" aria-label="buscar nas colunas à vista"></label>' +
    '<button class="btn peq" type="button" data-act="pop" data-pop="lv-cols" aria-expanded="false">Colunas · <span id="lv-cols-n">' + cols.length + ' de ' + nCols + '</span></button><div class="pop lv-pop lv-pop-cols" id="lv-cols" popover role="dialog" aria-label="colunas à vista">' + lvColsPop() + '</div>' +
    '<button class="btn peq' + (S.lv.imp.on ? ' prim' : '') + '" type="button" data-act="lv-imp" aria-expanded="' + S.lv.imp.on + '"' + (OCULTO ? ' disabled title="com os valores escondidos, a importação fica indisponível"' : '') + '>' + '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M7 9l5-5 5 5"/><path d="M5 20h14"/></svg>' + '<span>Absorver extrato ou fatura</span></button>' +
    (lvCel() ? '<button class="btn peq" type="button" data-act="pop" data-pop="lv-mob" aria-expanded="false">' + ICO_FUNIL_BTN + '<span>Filtrar · ordenar</span></button><div class="pop lv-pop" id="lv-mob" popover role="dialog" aria-label="filtrar e ordenar">' + lvMobPop() + '</div>' : '') +
    (nEd ? '<span class="lv-ed-pil">' + pil('acc', nPl(nEd, 'célula editada', 'células editadas') + ' · indo para a planilha') + '<button class="btn link peq" type="button" data-act="lv-undo-all">Desfazer tudo</button><button class="btn link peq" type="button" data-act="lv-baixar">Baixar edições (CSV)</button></span>' : '') +
    (S.lv.extra.length ? '<span class="lv-ed-pil">' + pil('azul', nPl(S.lv.extra.length, 'linha importada', 'linhas importadas') + ' · nesta sessão') + '<button class="btn link peq" type="button" data-act="lv-imp-undo">Desfazer importações</button></span>' : '') +
    (OCULTO ? pil('neu peq', 'valores escondidos: sem edição nem importação') : '') + '</div>' + lvAtalhos();
  if (S.lv.imp.on) h += lvImpHtml();
  h += '<div class="lv-chips" id="lv-chips">' + lvChips() + '</div>';
  h += '<div class="lv-wrap" id="lv-wrap" style="--lvt:' + lvTpl(cols) + ';--lvw:' + lvMinW(cols) + 'px" role="table" aria-label="Livro-Caixa" aria-rowcount="' + lvN() + '">' + lvTabela() + '</div><div class="lv-pe" id="lv-pe">' + lvPe() + '</div>';
  return h + rodape();
}
const ICO_FUNIL_BTN = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg>';
/* atalhos para o que pede ação: as linhas «A-classificar» e as de confiança baixa (🔴) — um toque liga o filtro, outro desliga */
function lvAtalhos(){
  const nA = (lvValores('ITEM').find(([v]) => v === 'A-classificar') || [0, 0])[1], nR = (lvValores('COR').find(([v]) => v === '🔴') || [0, 0])[1];
  const onA = !!(S.lv.f.ITEM && (S.lv.f.ITEM.vals || []).length === 1 && S.lv.f.ITEM.vals[0] === 'A-classificar'), onR = !!(S.lv.f.COR && (S.lv.f.COR.vals || []).length === 1 && S.lv.f.COR.vals[0] === '🔴');
  if (!nA && !nR) return '';
  return '<div class="lv-atalhos">' + (nA ? '<button class="pil ambar" type="button" data-act="lv-atalho" data-v="ITEM" aria-pressed="' + onA + '" title="lançamentos sem categoria: o que falta você dizer">A classificar · ' + nA + '</button>' : '') + (nR ? '<button class="pil ambar" type="button" data-act="lv-atalho" data-v="COR" aria-pressed="' + onR + '" title="classificação de confiança baixa (🔴): vale conferir">confiança baixa · ' + nR + '</button>' : '') + '</div>';
}
/* celular e tablet sem cabeçalho de colunas: ordenar e filtrar por coluna num pop-up só */
function lvMobPop(){
  const cols = lvColsVis(), c = S.lv.mobCol && lvCI[S.lv.mobCol] != null ? S.lv.mobCol : cols[0];
  return '<div class="lv-fp-h"><b>Ordenar por</b></div><div class="lv-fp-g"><select class="lv-fin" data-lv-sortc="1" aria-label="coluna da ordem">' + LV.cols.map(x => '<option value="' + esc(x) + '"' + (S.lv.sort.c === x ? ' selected' : '') + '>' + esc(lvMeta(x).n) + '</option>').join('') + '</select><select class="lv-fin" data-lv-sortd="1" aria-label="sentido"><option value="-1"' + (S.lv.sort.d < 0 ? ' selected' : '') + '>decrescente</option><option value="1"' + (S.lv.sort.d > 0 ? ' selected' : '') + '>crescente</option></select></div>' +
    '<div class="lv-fp-h" style="margin-top:10px"><b>Filtrar a coluna</b></div><select class="lv-fin" data-lv-fcol="1" aria-label="coluna a filtrar">' + LV.cols.map(x => '<option value="' + esc(x) + '"' + (c === x ? ' selected' : '') + '>' + esc(lvMeta(x).n) + (lvFAtivo(S.lv.f[x]) ? ' ●' : '') + '</option>').join('') + '</select><div id="lv-f-' + esc(c) + '" class="lv-fp-in">' + lvFiltroPop(c) + '</div>';
}
function lvColsPop(){
  const on = new Set(S.lv.cols), vazias = new Set(LV.vazias || []);
  const ck = c => '<label class="lv-ck"><input type="checkbox" data-lv-col="' + esc(c) + '"' + (on.has(c) ? ' checked' : '') + '><span class="t">' + esc(lvMeta(c).n) + '</span>' + (vazias.has(c) ? '<span class="n">vazia</span>' : LV_PADRAO.indexOf(c) > -1 ? '<span class="n">padrão</span>' : '') + '</label>';
  return '<div class="lv-fp-h"><b>Colunas à vista</b><span class="apoio">a escolha fica neste navegador</span></div><div class="lv-fp-atalhos"><button class="btn peq" type="button" data-act="lv-cols-pad">Só as relevantes</button><button class="btn peq" type="button" data-act="lv-cols-todas">Todas</button></div><div class="lv-ckg">' + LV.cols.map(ck).join('') + '</div>';
}
/* atualiza só o que muda (corpo, pé, chips, funis): o pop-up aberto no cabeçalho ou na barra não fecha. `tudo` refaz o quadro inteiro (colunas, ordem) */
function lvRefresh(tudo){
  S.lv.calc = null; S.lv.sig = '';
  const w = $('#lv-wrap'); if (!w) return;
  if (tudo){ const cols = lvColsVis(); w.style.setProperty('--lvt', lvTpl(cols)); w.style.setProperty('--lvw', lvMinW(cols) + 'px'); w.innerHTML = lvTabela(); const n = $('#lv-cols-n'); if (n) n.textContent = cols.length + ' de ' + LV.cols.length; }
  else { const C = lvCalc(), b = $('#lv-b'); if (b) b.style.height = lvAltura(C) + 'px'; const vz = w.querySelector('.lv-vazio'); if (C.idx.length && vz) vz.remove(); else if (!C.idx.length && !vz) w.insertAdjacentHTML('beforeend', '<div class="lv-vazio">nenhum lançamento com esses filtros e essa busca</div>'); }
  lvPintar(true);
  const pe = $('#lv-pe'); if (pe) pe.innerHTML = mascaraHtml(lvPe());
  const ch = $('#lv-chips'); if (ch) ch.innerHTML = mascaraHtml(lvChips());
  document.querySelectorAll('.lv-ff').forEach(b => b.classList.toggle('on', lvFAtivo(S.lv.f[b.dataset.c])));
  document.querySelectorAll('.lv-fp-h').forEach(hd => { const p = hd.closest('[id^="lv-f-"]'); if (!p) return; const c = p.id.slice(5), tem = !!hd.querySelector('[data-act="lv-f-limpar"]'), at = lvFAtivo(S.lv.f[c]); if (at && !tem) hd.insertAdjacentHTML('beforeend', '<button class="btn link peq" type="button" data-act="lv-f-limpar" data-v="' + esc(c) + '">limpar</button>'); else if (!at && tem) hd.querySelector('[data-act="lv-f-limpar"]').remove(); });
}
function lvGravarEd(){ lsSet(LV_KEY_ED(), {edicao:LV.edicao, edits:S.lv.edits, em:new Date().toISOString().slice(0, 10)}); S.lv.edSeq++; }
function lvSalvar(i, c, val){
  const o = lvOrig(i, c); S.lv.edits[i] = S.lv.edits[i] || {};
  if (String(val == null ? '' : val) === String(o == null ? '' : o)) delete S.lv.edits[i][c]; else S.lv.edits[i][c] = val;
  if (!Object.keys(S.lv.edits[i]).length) delete S.lv.edits[i];
  lvGravarEd(); ECON.livroGravou(i, c, val);
}
function lvFimEd(t, cancela){
  const d = t && t.dataset ? t.dataset : {}; if (d.lvIn == null || !S.lv.ed) return;
  const i = +d.i, c = d.lvIn; if (!cancela) lvSalvar(i, c, t.value);
  S.lv.ed = null; lvRefresh(); lvAtualizarBarra();
  const cel = document.querySelector('[data-act="lv-ed"][data-v="' + i + '"][data-c="' + c.replace(/"/g, '\\"') + '"]'); if (cel) focoSem(cel);
}
function lvAtualizarBarra(){ const p = document.querySelector('.lv-ed-pil'), nEd = lvNEd(), top = document.querySelector('.lv-top'); if (nEd && !p && top) top.insertAdjacentHTML('beforeend', '<span class="lv-ed-pil">' + pil('acc', nPl(nEd, 'célula editada', 'células editadas') + ' · indo para a planilha') + '<button class="btn link peq" type="button" data-act="lv-undo-all">Desfazer tudo</button><button class="btn link peq" type="button" data-act="lv-baixar">Baixar edições (CSV)</button></span>'); else if (p){ if (!nEd) p.remove(); else p.querySelector('.pil').textContent = nPl(nEd, 'célula editada', 'células editadas') + ' · neste navegador'; } }
function lvBaixarEd(){
  const L = [['linha', 'data', 'descricao', 'conta', 'valor', 'moeda', 'coluna', 'de', 'para']];
  Object.keys(S.lv.edits).sort((a, b) => a - b).forEach(i => Object.keys(S.lv.edits[i]).forEach(c => L.push([String(+i + 1), lvOrig(i, 'DATA') || '', lvOrig(i, 'DESCRICAO_LIMPA') || '', lvOrig(i, 'CONTA') || '', lvOrig(i, 'VALOR_NATIVO'), lvOrig(i, 'MOEDA') || '', c, lvOrig(i, c), S.lv.edits[i][c]])));
  const csv = '﻿' + L.map(r => r.map(x => '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"').join(';')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'})); a.download = 'casa-livro-edicoes-' + LV.edicao + '.csv'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  toast('Baixou ' + nPl(L.length - 1, 'edição', 'edições') + ' em CSV: é o que o app real levaria à planilha.');
}
function lvAct(a, b, e){
  const v = b.dataset.v;
  if (a === 'lv-sort'){ S.lv.sort = S.lv.sort.c === v ? {c:v, d:-S.lv.sort.d} : {c:v, d:lvMeta(v).t === 'txt' ? 1 : -1}; S.lv.exp = null; lvRefresh(true); focoSem(document.querySelector('[data-act="lv-sort"][data-v="' + v.replace(/"/g, '\\"') + '"]')); }
  else if (a === 'lv-exp'){ const i = +v; if (e && e.target && e.target.closest && e.target.closest('[data-act="lv-ed"],[data-act="lv-undo"],[data-act="pa-de"],[data-lv-in]')) return; S.lv.exp = S.lv.exp === i ? null : i; S.lv.ed = null; lvRefresh(); focoSem(document.querySelector('[data-act="lv-exp"][data-v="' + i + '"]')); }
  else if (a === 'lv-ed'){ if (S.lv.ed){ const inp = document.querySelector('[data-lv-in]'); if (inp) lvFimEd(inp); } S.lv.ed = {i:+v, c:b.dataset.c}; lvRefresh(); }
  else if (a === 'lv-undo'){ const i = +v, c = b.dataset.c; if (S.lv.edits[i]){ delete S.lv.edits[i][c]; if (!Object.keys(S.lv.edits[i]).length) delete S.lv.edits[i]; } lvGravarEd(); lvRefresh(); lvAtualizarBarra(); focoSem(document.querySelector('[data-act="lv-ed"][data-v="' + i + '"][data-c="' + String(c).replace(/"/g, '\\"') + '"]')); }
  else if (a === 'lv-undo-all'){ S.lv.ultimo = S.lv.edits; S.lv.edits = {}; S.lv.ed = null; lvGravarEd(); lvRefresh(); lvAtualizarBarra(); toastAcao('Edições desfeitas: o livro voltou ao que o gerador trouxe.', 'Voltar', 'lv-undo-voltar'); }
  else if (a === 'lv-undo-voltar'){ if (S.lv.ultimo){ S.lv.edits = S.lv.ultimo; S.lv.ultimo = null; lvGravarEd(); if (rota() === 'livro'){ lvRefresh(); lvAtualizarBarra(); } toast('Suas edições voltaram e estão guardadas de novo.'); } }
  else if (a === 'lv-baixar'){ lvBaixarEd(); }
  else if (a === 'lv-f-limpar'){ if (v === '__tudo'){ S.lv.f = {}; S.lv.q = ''; const q = document.querySelector('[data-lv="q"]'); if (q) q.value = ''; } else if (v === '__q'){ S.lv.q = ''; const q = document.querySelector('[data-lv="q"]'); if (q) q.value = ''; } else { const k = b.dataset.k, f = S.lv.f[v] || {}; if (k === 'per'){ delete f.de; delete f.ate; } else if (k === 'fx'){ delete f.min; delete f.max; } else delete S.lv.f[v]; if (S.lv.f[v] && !lvFAtivo(S.lv.f[v])) delete S.lv.f[v]; }
    S.lv.exp = null; lvRefresh(); document.querySelectorAll('[id^="lv-f-"]').forEach(p => { const c = p.id.slice(5); if (v === '__tudo' || v === c){ p.innerHTML = lvFiltroPop(c); } }); const at = document.querySelector('.lv-atalhos'); if (at) at.outerHTML = lvAtalhos(); }
  else if (a === 'lv-f-data'){ const c = b.dataset.c, f = S.lv.f[c] = S.lv.f[c] || {}, mf = MT.mes_fechado, ini = J[0]; if (v === 'mes'){ f.de = mf + '-01'; f.ate = mf + '-31'; } else if (v === '12m'){ f.de = ini + '-01'; f.ate = mf + '-31'; } else { f.de = MT.ano_corrente + '-01-01'; f.ate = MT.ano_corrente + '-12-31'; } S.lv.exp = null; lvRefresh(); const p = $('#lv-f-' + c); if (p) p.innerHTML = lvFiltroPop(c); }
  else if (a === 'lv-cols-pad' || a === 'lv-cols-todas'){ S.lv.cols = a === 'lv-cols-pad' ? LV_PADRAO.filter(c => lvCI[c] != null) : LV.cols.slice(); lsSet(LV_KEY_COLS, S.lv.cols); S.lv.exp = null; lvRefresh(true); const p = $('#lv-cols'); if (p) p.innerHTML = lvColsPop(); }
  else if (a === 'lv-imp'){ S.lv.imp.on = !S.lv.imp.on; if (!S.lv.imp.on) S.lv.imp = {on:false}; render(true); const el = $('#lv-dz') || document.querySelector('[data-act="lv-imp"]'); if (el) focoSem(el); }
  else if (a === 'lv-imp-limpar'){ S.lv.imp = {on:true}; render(true); const el = $('#lv-dz'); if (el) focoSem(el); }
  else if (a === 'lv-importar'){ lvImportar(); }
  else if (a === 'lv-imp-ok'){ S.lv.imp.ok[v] = true; lvImpRefresh(); focoSem(document.querySelector('[data-act="lv-importar"]')); }   // G2: sugestão incerta confirmada por ele
  else if (a === 'lv-imp-voltar'){ const u = S.lv.ultimoImp; if (u){ S.lv.extra = u.antes; ssSet(LV_KEY_IMP(), S.lv.extra); S.lv.chaves = null; S.lv.vals = {}; S.lv.calc = null; S.lv.ultimoImp = null; S.lv.exp = null; Object.keys(S.lv.edits).forEach(i => { if (+i >= LV.n + S.lv.extra.length) delete S.lv.edits[i]; }); if (rota() === 'livro') render(true); toast('Importação desfeita: ' + nPl(u.n, 'linha saiu', 'linhas saíram') + ' («' + u.nome + '»).'); } }
  else if (a === 'lv-imp-undo'){ const n = S.lv.extra.length; S.lv.ultimoImp = {n, antes:[], nome:'todas as importações da sessão', tudo:S.lv.extra.slice()}; S.lv.extra = []; ssSet(LV_KEY_IMP(), null); S.lv.chaves = null; S.lv.vals = {}; S.lv.calc = null; S.lv.exp = null; Object.keys(S.lv.edits).forEach(i => { if (+i >= LV.n) delete S.lv.edits[i]; }); render(true); toastAcao(nPl(n, 'linha importada saiu', 'linhas importadas saíram') + ' desta sessão.', 'Voltar', 'lv-imp-undo-voltar'); }
  else if (a === 'lv-imp-undo-voltar'){ const u = S.lv.ultimoImp; if (u && u.tudo){ S.lv.extra = u.tudo; ssSet(LV_KEY_IMP(), S.lv.extra); S.lv.chaves = null; S.lv.vals = {}; S.lv.calc = null; S.lv.ultimoImp = null; render(true); toast('As linhas importadas voltaram.'); } }
  else if (a === 'lv-atalho'){ const c = v, alvo = c === 'ITEM' ? 'A-classificar' : '🔴', f = S.lv.f[c], on = !!(f && (f.vals || []).length === 1 && f.vals[0] === alvo); if (on) delete S.lv.f[c]; else S.lv.f[c] = {vals:[alvo]}; S.lv.exp = null; lvRefresh(); const at = document.querySelector('.lv-atalhos'); if (at) at.outerHTML = lvAtalhos(); const p = $('#lv-f-' + CSS.escape(c)); if (p) p.innerHTML = lvFiltroPop(c); focoSem(document.querySelector('[data-act="lv-atalho"][data-v="' + c + '"]')); }
}
function lvInput(t, d){
  if (d.lv === 'q'){ clearTimeout(S.lv.tq); S.lv.tq = setTimeout(() => { S.lv.q = t.value; S.lv.exp = null; lvRefresh(); }, 140); }
  else if (d.lvFq != null){ const c = d.lvFq, L = $('#lv-fl-' + CSS.escape(c)); if (L) L.innerHTML = lvFiltroLista(c, t.value); }
  else if (d.lvF != null){ const c = d.c, f = S.lv.f[c] = S.lv.f[c] || {}; if (d.lvF === 'de' || d.lvF === 'ate'){ f[d.lvF] = t.value || ''; } else { const x = parseNum(t.value); f[d.lvF] = x == null ? null : x; } if (!lvFAtivo(f)) delete S.lv.f[c]; S.lv.exp = null; clearTimeout(S.lv.tf); S.lv.tf = setTimeout(() => lvRefresh(), 120); }
  else if (d.lvMapIn != null){ S.lv.imp.map[d.lvMapIn] = t.value; clearTimeout(S.lv.ti); S.lv.ti = setTimeout(() => lvImpRefresh(), 160); }
}
function lvChange(t, d){
  if (d.lvCol != null){ const c = d.lvCol, on = t.checked, cols = S.lv.cols.filter(x => x !== c && lvCI[x] != null); if (on) cols.push(c); if (!cols.length){ t.checked = true; toast('Pelo menos uma coluna fica à vista.'); return; } S.lv.cols = cols; lsSet(LV_KEY_COLS, cols); S.lv.exp = null; lvRefresh(true); }
  else if (d.lvFv != null){ const c = d.lvFv, f = S.lv.f[c] = S.lv.f[c] || {}; f.vals = f.vals || []; const v = t.value; if (t.checked){ if (f.vals.indexOf(v) < 0) f.vals.push(v); } else f.vals = f.vals.filter(x => x !== v); if (!lvFAtivo(f)) delete S.lv.f[c]; S.lv.exp = null; lvRefresh(); }
  else if (d.lvIn != null && t.tagName === 'SELECT'){ lvFimEd(t); }
  else if (d.lvMap != null){ const M = S.lv.imp.map; if (t.type === 'checkbox') M[d.lvMap] = t.checked; else M[d.lvMap] = t.value; if (d.lvMap === 'data') M.fmtData = lvFmtData(lvColAmostra(M.data)).fmt; if (d.lvMap === 'conta' && M.moeda === '' && M.conta){ M.moeda = LV_CONTAS_BRL.test(M.conta) ? '=BRL' : M.conta === 'BoursoBank-joint' ? '=EUR' : ''; } lvImpRefresh(); }
  else if (d.lvForcar != null){ S.lv.imp.forcar[+d.lvForcar] = t.checked; S.lv.det['lv-imp-fora'] = true; lvImpRefresh(); }   // G3: a duplicata pode ser forçada
  else if (d.lvSortc != null || d.lvSortd != null){ const c = d.lvSortc != null ? t.value : S.lv.sort.c, dd = d.lvSortd != null ? +t.value : S.lv.sort.d; S.lv.sort = {c, d:dd}; S.lv.exp = null; lvRefresh(true); }
  else if (d.lvFcol != null){ S.lv.mobCol = t.value; const p = $('#lv-mob'); if (p) p.innerHTML = lvMobPop(); }
}
/* ---------- importador (onda 12 · conserto G2/G3): lê CSV · TSV · XLSX no navegador; a conta vem da ASSINATURA das colunas (depois do nome do arquivo, por palavra inteira);
   a moeda vem da conta, do cabeçalho ou do símbolo, nunca de um padrão calado; fatura de cartão = compra é saída e o pagamento da fatura fica de fora (listado);
   duplicata conta ocorrências (N iguais no arquivo contra M no livro, entram N − M; parcela na chave) e as que ficaram de fora podem ser forçadas; sugestão incerta não leva selo verde e pede confirmação ---------- */
const LV_CONTAS_BRL = /^(c6|c6-cartao|xp-cartao|xp-conta|rico-cartao|nubank-cartao)$/i, LV_RX_PAG = /inclusao de pagamento|pagamentos? validos|pagamento (de |da )?fatura|pgto\.? ?fat|payment received|^payment$|repayment|top ?up/i;
const LV_ASSIN = [   // assinatura das colunas → conta · moeda · se é fatura · mapa explícito (regex por cabeçalho normalizado)
  {id:'bourso', nome:'export da BoursoBank', test:h => /\b(date operation|dateop)\b/.test(h) && /\b(libelle|label)\b/.test(h), conta:'BoursoBank-joint', moeda:'EUR', fatura:false, mapa:{data:/^(date operation|dateop)$/, desc:/^(libelle|label)$/, valor:/^(solde|amount|montant)$/}},
  {id:'c6fat', nome:'fatura do cartão C6', test:h => /data de compra/.test(h) && /valor \(em r\$\)/.test(h), conta:'C6-cartao', moeda:'BRL', fatura:true, mapa:{data:/^data de compra$/, desc:/^descricao$/, valor:/^valor \(em r\$\)$/, parcela:/^parcela$/}},
  {id:'xpfat', nome:'fatura do cartão XP', test:h => /^data\|estabelecimento\|portador\|valor/.test(h), conta:'XP-cartao', moeda:'BRL', fatura:true, mapa:{data:/^data$/, desc:/^estabelecimento$/, valor:/^valor$/, parcela:/^parcela$/}},
  {id:'c6ext', nome:'extrato da conta C6', test:h => /data lancamento/.test(h) && /entrada ?\(r\$\)/.test(h), conta:'C6', moeda:'BRL', fatura:false, mapa:{data:/^data lancamento$/, desc:/^titulo$/, deb:/^saida ?\(r\$\)$/, cred:/^entrada ?\(r\$\)$/}},
  {id:'wise', nome:'histórico da Wise', test:h => /source amount/.test(h) && /\bdirection\b/.test(h), conta:'Wise', moeda:'col', fatura:false, mapa:{data:/^created on$/, desc:/^target name$/, valor:/^source amount/, moeda:/^source currency$/, flag:/^direction$/}},
  {id:'etherfi', nome:'histórico do cartão ether.fi', test:h => /^timestamp\|type\|description/.test(h), conta:'etherfi-cartao', moeda:'col', fatura:true, mapa:{data:/^timestamp$/, desc:/^description$/, valor:/^amount$/, moeda:/^currency$/}}
];
const LV_TOKENS = [[/^(bourso|boursobank|boursorama)$/, () => 'BoursoBank-joint'], [/^c6$/, fat => fat ? 'C6-cartao' : 'C6'], [/^xp$/, fat => fat ? 'XP-cartao' : 'XP-conta'], [/^rico$/, () => 'Rico-cartao'], [/^nubank$/, () => 'Nubank-cartao'], [/^wise$/, () => 'Wise'], [/^(ether|etherfi)$/, () => 'etherfi-cartao']];
function lvImpHtml(){
  const I = S.lv.imp;
  let h = '<section class="painel lv-imp" id="lv-imp" aria-label="Absorver extrato ou fatura"><div class="orc-cab"><h2>Absorver extrato ou fatura</h2><div class="dir">' + pil('neu peq', 'CSV · TSV · XLSX') + pil('neu peq', 'PDF: no app real', 'a fatura em PDF é lida pelo app real; aqui entram CSV, TSV e XLSX') + '<button class="btn link peq" type="button" data-act="lv-imp">fechar</button></div></div>';
  if (I.erro) h += aviso('<b>' + esc(I.erro) + '</b>', 'bad');
  if (!I.arq) return h + '<div class="lv-dz" id="lv-dz" tabindex="0" role="button" aria-label="escolher o arquivo do extrato ou da fatura"><b>Solte aqui o arquivo</b><span>ou toque para escolher · CSV, TSV ou XLSX de qualquer banco</span><input type="file" id="lv-dz-in" accept=".csv,.tsv,.txt,.xlsx,.xls,.pdf" hidden></div>' +
    '<p class="apoio">A conta e a moeda vêm das colunas do arquivo (BoursoBank, C6, XP, Wise, ether.fi) ou do nome dele; fatura de cartão entra com a compra como saída e o pagamento da fatura de fora. Linha que já existe no livro (mesma conta, data, valor e parcela) fica de fora, contando quantas vezes aparece; você pode forçar. Sugestão incerta vem marcada «a confirmar». As linhas importadas ficam só nesta página aberta: o servidor ainda não recebe importação.</p></section>';
  const A = I.arq, M = I.map, R = lvImpCalc(), opt = (sel, vazio) => '<option value=""' + (sel === '' ? ' selected' : '') + '>' + esc(vazio || '— nenhuma —') + '</option>' + A.cab.map((c, j) => '<option value="' + j + '"' + (String(sel) === String(j) ? ' selected' : '') + '>' + esc(c || 'coluna ' + (j + 1)) + '</option>').join('');
  const selo = k => { const cf = I.conf[k] || 'alta', igual = M[k] !== '' && M[k] != null && String(M[k]) === String(I.sug[k]); if (M[k] === '' || M[k] == null) return pil('ambar peq', 'a escolher'); if (!igual) return pil('neu peq', 'você trocou'); if (cf === 'alta') return pil('verde peq', 'sugerido', I.porque[k] || 'lido do arquivo'); return I.ok[k] ? pil('verde peq', 'confirmado por você') : '<button class="pil ambar peq" type="button" data-act="lv-imp-ok" data-v="' + k + '" title="' + esc(I.porque[k] || 'a sugestão é incerta: confira e confirme') + '">a confirmar · ' + esc(I.porque[k] || 'confira') + '</button>'; };
  h += '<div class="lv-imp-cab"><span><b>' + esc(A.nome) + '</b> · ' + nPl(A.linhas.length, 'linha') + ' · ' + nPl(A.cab.length, 'coluna') + '</span>' + (I.assin ? pil('verde peq', esc(I.assin.nome), 'reconhecido pelas colunas do arquivo') : pil('neu peq', 'formato não reconhecido: mapa pelas colunas', 'nenhuma assinatura de banco bateu; a sugestão vem das colunas e do nome do arquivo')) + pil('neu peq', A.tipo === 'xlsx' ? 'XLSX · 1ª aba' : 'separador «' + (A.sep === '\t' ? 'tab' : A.sep) + '»') + pil('neu peq', 'decimal ' + (M.dec === ',' ? 'vírgula' : 'ponto')) + (A.semCab ? pil('ambar peq', 'sem cabeçalho: a 1ª linha é dado', 'o arquivo não traz nomes de coluna; as colunas ficaram numeradas e nenhuma linha foi descartada') : '') + (I.fatura ? pil('azul peq', 'fatura: compra = saída · pagamento fica de fora', 'na fatura a compra é despesa (sinal invertido) e a linha de pagamento da fatura não entra: ela já está no extrato da conta') : '') + '<button class="btn link peq" type="button" data-act="lv-imp-limpar">outro arquivo</button></div>';
  h += '<div class="rolavel"><table class="mini lv-amostra"><thead><tr>' + A.cab.map(c => '<th>' + esc(c || '') + '</th>').join('') + '</tr></thead><tbody>' + A.linhas.slice(0, 5).map(r => '<tr>' + A.cab.map((c, j) => '<td title="' + esc(r[j] || '') + '">' + esc(r[j] || '') + '</td>').join('') + '</tr>').join('') + '</tbody></table></div><p class="apoio">as 5 primeiras linhas, como vieram no arquivo</p>';
  const sel = (k, extra) => '<select data-lv-map="' + k + '" aria-label="coluna do arquivo para ' + k + '">' + opt(M[k], extra) + '</select>';
  h += '<div class="lv-map">' +
    '<span class="k">Data</span><span class="f">' + sel('data') + '<select data-lv-map="fmtData" aria-label="formato da data">' + [['dmy', 'dia/mês/ano'], ['mdy', 'mês/dia/ano'], ['ymd', 'ano-mês-dia'], ['serial', 'número de data do Excel']].map(([k, t]) => '<option value="' + k + '"' + (M.fmtData === k ? ' selected' : '') + '>' + t + '</option>').join('') + '</select></span>' + selo('data') +
    '<span class="k">Valor</span><span class="f">' + (M.sinal === 'debcred' ? '<select data-lv-map="deb" aria-label="coluna do débito">' + opt(M.deb, '— débito —') + '</select><select data-lv-map="cred" aria-label="coluna do crédito">' + opt(M.cred, '— crédito —') + '</select>' : sel('valor')) + '<select data-lv-map="dec" aria-label="separador decimal"><option value=","' + (M.dec === ',' ? ' selected' : '') + '>vírgula decimal (12,50)</option><option value="."' + (M.dec === '.' ? ' selected' : '') + '>ponto decimal (12.50)</option></select></span>' + selo(M.sinal === 'debcred' ? 'deb' : 'valor') +
    '<span class="k">Sinal</span><span class="f"><select data-lv-map="sinal" aria-label="como o arquivo marca entrada e saída"><option value="valor"' + (M.sinal === 'valor' ? ' selected' : '') + '>no sinal do valor (− = saiu)</option><option value="debcred"' + (M.sinal === 'debcred' ? ' selected' : '') + '>débito e crédito em colunas separadas</option><option value="flag"' + (M.sinal === 'flag' ? ' selected' : '') + '>uma coluna diz D/C (ou IN/OUT)</option></select>' + (M.sinal === 'flag' ? '<select data-lv-map="flag" aria-label="coluna D/C">' + opt(M.flag, '— coluna D/C —') + '</select>' : '') + '<label class="lv-ck"><input type="checkbox" data-lv-map="inverter"' + (M.inverter ? ' checked' : '') + '><span class="t">inverter: compra positiva na fatura = saída</span></label></span>' + selo('sinal') +
    '<span class="k">Descrição</span><span class="f">' + sel('desc') + '</span>' + selo('desc') +
    '<span class="k">Parcela</span><span class="f">' + sel('parcela', '— sem coluna de parcela —') + '</span>' + (M.parcela !== '' ? selo('parcela') : '<span class="apoio">entra na chave da duplicata</span>') +
    '<span class="k">Moeda</span><span class="f"><select data-lv-map="moeda" aria-label="moeda"><option value=""' + (M.moeda === '' ? ' selected' : '') + '>— escolher —</option><optgroup label="fixa">' + ['EUR', 'BRL', 'USD'].map(m => '<option value="=' + m + '"' + (M.moeda === '=' + m ? ' selected' : '') + '>' + m + ' em todas as linhas</option>').join('') + '</optgroup><optgroup label="coluna do arquivo">' + A.cab.map((c, j) => '<option value="' + j + '"' + (String(M.moeda) === String(j) ? ' selected' : '') + '>' + esc(c || 'coluna ' + (j + 1)) + '</option>').join('') + '</optgroup></select></span>' + selo('moeda') +
    '<span class="k">Conta</span><span class="f"><select data-lv-map="conta" aria-label="conta do livro"><option value=""' + (M.conta === '' ? ' selected' : '') + '>— escolher —</option>' + (LV.dic.CONTA || []).filter(Boolean).slice().sort().map(c => '<option value="' + esc(c) + '"' + (M.conta === c ? ' selected' : '') + '>' + esc(contaNome(c)) + '</option>').join('') + '<option value="=nova"' + (M.conta === '=nova' ? ' selected' : '') + '>conta nova…</option></select>' + (M.conta === '=nova' ? '<input type="text" data-lv-map-in="contaNova" value="' + esc(M.contaNova || '') + '" placeholder="nome da conta nova" aria-label="nome da conta nova">' : '') + '</span>' + selo('conta') + '</div>';
  h += '<h3 style="margin-top:6px">Como as linhas entram no livro</h3>' + lista3(R.linhas.slice(0, 5).map(r => ({q:r.data ? esc(dataBr(r.data)) : '<span class="nd">sem data</span>', t:'<b>' + esc(r.desc || '—') + '</b>' + (r.parcela ? ' ' + pil('neu peq', 'parcela ' + esc(r.parcela)) : ''), sub:esc(contaNome(r.conta) || 'conta a escolher'), v:r.valor == null ? '<span class="nd">sem valor</span>' : '<b class="' + (r.valor < 0 ? 'saida' : 'entrada') + '">' + money(r.valor, r.moeda || '?', {d:2}) + '</b>', vsub:lvImpSelo(r)})), {th:['data', 'descrição · conta', 'valor']});
  const fora = R.linhas.map((r, i) => Object.assign({i}, r)).filter(r => r.status !== 'entra');
  if (fora.length) h += det('lv-imp-fora', 'Ficaram de fora', () => lista3(fora.map(r => ({q:r.data ? esc(dataBr(r.data)) : '<span class="nd">sem data</span>', t:'<b>' + esc(r.desc || '—') + '</b>' + (r.parcela ? ' ' + pil('neu peq', 'parcela ' + esc(r.parcela)) : ''), sub:esc(r.motivo || ''), v:r.valor == null ? '<span class="nd">—</span>' : '<b class="' + (r.valor < 0 ? 'saida' : 'entrada') + '">' + money(r.valor, r.moeda || '?', {d:2}) + '</b>', vsub:lvImpSelo(r), acao:r.status === 'dup' ? '<label class="lv-ck" style="min-height:30px"><input type="checkbox" data-lv-forcar="' + r.i + '"' + (I.forcar[r.i] ? ' checked' : '') + '><span class="t">forçar a entrada</span></label>' : ''})), {rodape:'duplicata = a mesma conta, data, valor e parcela já está no livro (ou já apareceu antes neste arquivo); pagamento de fatura e conversão entre moedas não entram'}), nPl(fora.length, 'linha') + ' · ' + R.dup + ' duplicata' + (R.dup === 1 ? '' : 's') + (R.pag ? ' · ' + nPl(R.pag, 'pagamento') : '') + (R.inval ? ' · ' + R.inval + ' ilegível' + (R.inval === 1 ? '' : 'eis') : ''));
  const pend = Object.keys(I.conf).filter(k => I.conf[k] === 'media' && !I.ok[k] && M[k] !== '' && M[k] != null && String(M[k]) === String(I.sug[k]));
  const pode = R.entram && M.conta && (M.conta !== '=nova' || (M.contaNova || '').trim()) && M.moeda && !pend.length;
  h += '<div class="lv-imp-res"><span><b>' + R.entram + '</b> ' + (R.entram === 1 ? 'linha entra' : 'linhas entram') + (R.forcadas ? ' (' + R.forcadas + ' forçada' + (R.forcadas === 1 ? '' : 's') + ')' : '') + '</span><span>· <b>' + R.dup + '</b> já ' + (R.dup === 1 ? 'existe' : 'existem') + ' (conta, data, valor e parcela)</span>' + (R.pag ? '<span>· <b>' + R.pag + '</b> ' + (R.pag === 1 ? 'pagamento de fatura fica' : 'pagamentos de fatura ficam') + ' de fora</span>' : '') + (R.inval ? '<span>· <b>' + R.inval + '</b> sem data ou valor legível</span>' : '') +
    '<button class="btn prim peq" type="button" data-act="lv-importar"' + (pode ? '' : ' disabled title="' + esc(!M.conta ? 'escolha a conta' : M.conta === '=nova' && !(M.contaNova || '').trim() ? 'escreva o nome da conta nova' : !M.moeda ? 'escolha a moeda' : pend.length ? 'confirme o que está marcado «a confirmar»: ' + pend.join(', ') : 'nenhuma linha nova para importar') + '"') + '>Importar ' + R.entram + (R.entram === 1 ? ' linha' : ' linhas') + '</button><span class="apoio">nesta sessão do navegador · o app real grava na planilha</span></div>';
  return h + '</section>';
}
const lvImpSelo = r => r.status === 'entra' ? (r.forcada ? pil('azul peq', 'entra · forçada') : pil('verde peq', 'entra')) : r.status === 'dup' ? pil('ambar peq', 'já existe', r.motivo) : r.status === 'pagamento' ? pil('neu peq', 'pagamento da fatura', r.motivo) : r.status === 'conversao' ? pil('neu peq', 'conversão', r.motivo) : pil('verm peq', esc(r.motivo || 'ilegível'));
function lvImpRefresh(){ const el = $('#lv-imp'); if (!el) return; el.outerHTML = mascaraHtml(lvImpHtml()); }
function lvLerArquivo(file){
  if (!file) return; const nome = file.name || 'arquivo';
  if (/\.pdf$/i.test(nome)){ S.lv.imp.erro = 'Fatura em PDF fica para o app real (ele lê o PDF). Aqui entram CSV, TSV e XLSX — o banco costuma oferecer um desses no mesmo lugar do PDF.'; lvImpRefresh(); return; }
  const fim = (linhas, tipo, sep) => { if (!linhas || !linhas.length){ S.lv.imp.erro = 'Não achei tabela no arquivo.'; lvImpRefresh(); return; } lvImpPreparar(nome, linhas, tipo, sep); lvImpRefresh(); const el = $('#lv-imp'); if (el && el.scrollIntoView) el.scrollIntoView({block:'start'}); };
  const falha = err => { S.lv.imp.erro = 'Não consegui ler «' + nome + '»: ' + (err && err.message ? err.message : err); lvImpRefresh(); };
  if (/\.xlsx?$/i.test(nome)){ if (/\.xls$/i.test(nome)){ S.lv.imp.erro = '.xls (formato antigo do Excel) não é lido aqui: salve como .xlsx ou .csv.'; lvImpRefresh(); return; } file.arrayBuffer().then(lvXlsx).then(l => fim(l, 'xlsx')).catch(falha); return; }
  file.arrayBuffer().then(buf => { let txt = new TextDecoder('utf-8').decode(buf); if (txt.indexOf('�') > -1) txt = new TextDecoder('windows-1252').decode(buf); const r = lvCsv(txt); fim(r.linhas, 'csv', r.sep); }).catch(falha);
}
function lvCsv(txt){
  const ls = txt.replace(/^﻿/, '').split(/\r\n|\n|\r/).filter(l => l.trim() !== ''), seps = [';', ',', '\t', '|'], amostra = ls.slice(0, 40);
  let sep = ';', melhor = -1;
  seps.forEach(s => { const cs = amostra.map(l => lvSplit(l, s).length), moda = lvModa(cs.filter(x => x > 1)); if (!moda) return; const n = cs.filter(x => x === moda).length, nota = moda * 10 + n; if (nota > melhor){ melhor = nota; sep = s; } });
  const linhas = ls.map(l => lvSplit(l, sep)); return {sep, linhas};
}
function lvSplit(l, sep){ const out = []; let cur = '', q = false; for (let i = 0; i < l.length; i++){ const ch = l[i]; if (q){ if (ch === '"'){ if (l[i + 1] === '"'){ cur += '"'; i++; } else q = false; } else cur += ch; } else if (ch === '"') q = true; else if (ch === sep){ out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(x => x.trim()); }
function lvModa(a){ const m = new Map(); let b = 0, bv = 0; a.forEach(x => { const n = (m.get(x) || 0) + 1; m.set(x, n); if (n > b || (n === b && x > bv)){ b = n; bv = x; } }); return bv; }
const lvColIdx = s => { let n = 0; for (const ch of s) n = n * 26 + (ch.charCodeAt(0) - 64); return n - 1; };
async function lvXlsx(buf){
  const dv = new DataView(buf), u8 = new Uint8Array(buf); let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 70000); i--){ if (dv.getUint32(i, true) === 0x06054b50){ eocd = i; break; } }
  if (eocd < 0) throw new Error('não é um .xlsx (não achei o índice do zip)');
  const n = dv.getUint16(eocd + 10, true), cdOff = dv.getUint32(eocd + 16, true), ents = {}; let p = cdOff;
  for (let k = 0; k < n; k++){ if (dv.getUint32(p, true) !== 0x02014b50) break; const met = dv.getUint16(p + 10, true), cs = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true); ents[new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nl))] = {met, cs, lo}; p += 46 + nl + el + cl; }
  async function ler(nome){ const e = ents[nome]; if (!e) return null; const nl = dv.getUint16(e.lo + 26, true), el = dv.getUint16(e.lo + 28, true), ini = e.lo + 30 + nl + el, dados = u8.subarray(ini, ini + e.cs); if (e.met === 0) return new TextDecoder().decode(dados); if (e.met !== 8) throw new Error('compressão ' + e.met + ' não prevista'); if (typeof DecompressionStream === 'undefined') throw new Error('este navegador não descompacta .xlsx (sem DecompressionStream): exporte como CSV'); const ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter(); w.write(dados); w.close(); return new TextDecoder().decode(await new Response(ds.readable).arrayBuffer()); }
  const wb = await ler('xl/workbook.xml'), rels = await ler('xl/_rels/workbook.xml.rels'); let alvo = 'xl/worksheets/sheet1.xml';
  if (wb && rels){ const m = wb.match(/<sheet\b[^>]*\br:id="([^"]+)"/); if (m){ const rm = rels.match(new RegExp('<Relationship\\b[^>]*\\bId="' + m[1] + '"[^>]*\\bTarget="([^"]+)"')) || rels.match(new RegExp('<Relationship\\b[^>]*\\bTarget="([^"]+)"[^>]*\\bId="' + m[1] + '"')); if (rm){ const t = rm[1].replace(/^\//, ''); alvo = /^xl\//.test(t) ? t : 'xl/' + t; } } }
  const ss = [], sst = await ler('xl/sharedStrings.xml'); if (sst){ const d = new DOMParser().parseFromString(sst, 'application/xml'); d.querySelectorAll('si').forEach(si => ss.push(Array.from(si.querySelectorAll('t')).map(t => t.textContent).join(''))); }
  const sx = await ler(alvo); if (!sx) throw new Error('planilha sem a 1ª aba');
  const doc = new DOMParser().parseFromString(sx, 'application/xml'), linhas = [];
  doc.querySelectorAll('row').forEach(row => { const L = []; row.querySelectorAll('c').forEach(c => { const col = lvColIdx((c.getAttribute('r') || 'A').replace(/\d+/g, '')), t = c.getAttribute('t'), ve = c.querySelector('v'); let v = ''; if (t === 's') v = ss[+(ve ? ve.textContent : 0)] || ''; else if (t === 'inlineStr') v = Array.from(c.querySelectorAll('t')).map(x => x.textContent).join(''); else v = ve ? ve.textContent : ''; while (L.length < col) L.push(''); L[col] = String(v).trim(); }); if (L.some(x => x !== '')) linhas.push(L); });
  return linhas;
}
const lvEhDado = x => x !== '' && (lvEhNum(x, ',') || lvEhNum(x, '.') || !!lvData(x, 'dmy') || !!lvData(x, 'ymd') || !!lvData(x, 'serial'));
function lvImpPreparar(nome, linhas, tipo, sep){
  const cs = linhas.map(l => l.length), moda = lvModa(cs);
  let hi = linhas.findIndex(l => l.length === moda && l.filter(x => x && !lvEhDado(x)).length >= 2 && !l.some(x => /^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}/.test(x))); if (hi < 0) hi = linhas.findIndex(l => l.length === moda); if (hi < 0) hi = 0;
  const semCab = linhas[hi].filter(lvEhDado).length >= 2;   // a 1ª linha da tabela já é dado (xlsx sem cabeçalho): colunas numeradas, nenhuma linha descartada
  const cab = semCab ? linhas[hi].map((c, j) => 'coluna ' + (j + 1)) : linhas[hi].map((c, j) => c || 'coluna ' + (j + 1)), dados = linhas.slice(semCab ? hi : hi + 1).filter(l => l.some(x => x !== '')).map(l => { const r = l.slice(0, cab.length); while (r.length < cab.length) r.push(''); return r; });
  const A = S.lv.imp.arq = {nome, tipo, sep, cab, linhas:dados, semCab}, am = j => dados.slice(0, 40).map(r => r[j]), h = cab.map(c => lvNorm(c)), hs = h.join('|');
  const conf = {}, porque = {}, sug = {};
  const ass = LV_ASSIN.find(a => a.test(hs)) || null; S.lv.imp.assin = ass;
  const colRx = rx => { const j = h.findIndex(x => rx.test(x)); return j < 0 ? '' : String(j); };
  // 1 · mapa pela assinatura (certo) ou pela pontuação das colunas (incerto onde empata ou falta cabeçalho)
  const pctOk = (j, f) => { const a = am(j).filter(x => x !== ''); return a.length ? a.filter(f).length / a.length : 0; };
  const numPct = j => Math.max(pctOk(j, x => lvEhNum(x, ',')), pctOk(j, x => lvEhNum(x, '.')));
  const nota = {};
  nota.data = cab.map((c, j) => (/\b(data|date|dt|fecha|datum|dia|timestamp)\b/.test(h[j]) ? 3 : 0) + pctOk(j, x => !!lvData(x, 'dmy') || !!lvData(x, 'ymd') || !!lvData(x, 'serial')) * 4);
  nota.valor = cab.map((c, j) => (/\b(valor|amount|montant|value|total|quantia|importe|betrag|solde)\b/.test(h[j]) && !/saldo|balance|cotacao|fee|taxa/.test(h[j]) ? 3 : 0) + numPct(j) * 2 + (am(j).some(x => /^-|-$|\(|r\$ -/i.test(x)) ? 2 : 0) - (nota.data[j] >= 4 ? 5 : 0) - (/saldo|balance|accountbalance/.test(h[j]) ? 4 : 0));
  nota.deb = cab.map((c, j) => (/d[eé]bit|debito|sa[ií]da|retrait|withdrawal/.test(h[j]) ? 4 : 0) + numPct(j) * 2); nota.cred = cab.map((c, j) => (/cr[eé]dit|credito|entrada|d[eé]p[oô]t|deposit/.test(h[j]) ? 4 : 0) + numPct(j) * 2);
  nota.desc = cab.map((c, j) => (/descri|libell|hist[oó]rico|memo|label|lan[çc]amento|detalhe|narrative|t[ií]tulo|estabelecimento|opera[çc][aã]o|transaction|texto|concepto|beneficiario|target name/.test(h[j]) ? 3 : 0) + Math.min(2, (sum(am(j).map(x => x.length)) / Math.max(1, am(j).length)) / 12) - numPct(j) * 2 - nota.data[j]);
  nota.moeda = cab.map((c, j) => (/\b(moeda|currency|devise|ccy|divisa)\b/.test(h[j]) ? 3 : 0) + pctOk(j, x => /^(EUR|BRL|USD|GBP|R\$|€|\$)$/i.test(x)) * 3);
  nota.flag = cab.map((c, j) => (/\b(tipo|type|d\/c|dc|natureza|sinal|direction|debit\/credit)\b/.test(h[j]) ? 2 : 0) + pctOk(j, x => /^(d|c|dr|cr|d[eé]bito|cr[eé]dito|debit|credit|in|out|neutral)$/i.test(x)) * 4);
  nota.parcela = cab.map((c, j) => (/parcel|installment|prestac/.test(h[j]) ? 4 : 0) + pctOk(j, x => /^\d{1,2}\s*(\/|de)\s*\d{1,2}$/.test(x)) * 3);
  const top = (k, min) => { let b = -1, bj = '', emp = false; nota[k].forEach((v, j) => { if (v > b){ b = v; bj = String(j); emp = false; } else if (v === b && v > 0) emp = true; }); return {j:b >= (min == null ? 3 : min) ? bj : '', emp, b}; };
  const pega = (k, rx, min) => { if (ass && ass.mapa[k]){ const j = colRx(ass.mapa[k]); if (j !== ''){ sug[k] = j; conf[k] = 'alta'; porque[k] = 'coluna «' + cab[+j] + '» do formato ' + ass.nome; return; } } const t = top(k, min); sug[k] = t.j; conf[k] = t.j === '' ? 'alta' : (t.emp || semCab || t.b < 4 ? 'media' : 'alta'); if (conf[k] === 'media') porque[k] = semCab ? 'arquivo sem cabeçalho: confira a coluna' : t.emp ? 'duas colunas parecidas: confira' : 'cabeçalho não diz; achei pelo conteúdo'; };
  pega('data', null, 3); pega('desc', null, 1.5); pega('parcela', null, 4); pega('flag', null, 4);
  if (ass && ass.mapa.deb){ sug.deb = colRx(ass.mapa.deb); sug.cred = colRx(ass.mapa.cred); conf.deb = conf.cred = 'alta'; porque.deb = porque.cred = 'formato ' + ass.nome; sug.sinal = 'debcred'; sug.valor = sug.deb; conf.sinal = 'alta'; }
  else { const td = top('deb', 5), tc = top('cred', 5); sug.deb = td.j; sug.cred = tc.j; if (sug.deb && sug.cred && sug.deb !== sug.cred){ sug.sinal = 'debcred'; sug.valor = sug.deb; conf.deb = conf.cred = conf.sinal = 'alta'; } else { pega('valor', null, 2); sug.sinal = ass && ass.mapa.flag ? 'flag' : (sug.flag && !ass ? 'flag' : 'valor'); conf.sinal = ass ? 'alta' : (sug.flag ? 'media' : 'alta'); if (conf.sinal === 'media') porque.sinal = 'há uma coluna que parece D/C: confira'; } }
  if (ass && ass.mapa.flag){ sug.flag = colRx(ass.mapa.flag); sug.sinal = 'flag'; conf.flag = conf.sinal = 'alta'; }
  // 2 · conta: assinatura > nome do arquivo (palavra inteira) > nada
  const tokens = lvNorm(nome).split(/[^a-z0-9]+/).filter(Boolean), fatTok = tokens.some(t => /^(fatura|invoice|cartao|card|statement)$/.test(t));
  let contaNome_ = '', contaConf = 'alta', contaPq = '';
  tokens.forEach(t => { if (contaNome_) return; LV_TOKENS.forEach(([rx, f]) => { if (!contaNome_ && rx.test(t)) contaNome_ = f(fatTok); }); });
  if (ass){ sug.conta = ass.conta; contaConf = 'alta'; contaPq = 'pelas colunas: ' + ass.nome + (contaNome_ && contaNome_ !== ass.conta ? ' (o nome do arquivo dizia ' + contaNome(contaNome_) + ')' : ''); }
  else if (contaNome_){ sug.conta = contaNome_; contaConf = 'media'; contaPq = 'só pelo nome do arquivo («' + nome + '»)'; }
  else { sug.conta = ''; contaConf = 'alta'; }
  conf.conta = contaConf; porque.conta = contaPq;
  const contaSug = sug.conta;
  // 3 · fatura? assinatura, ou cartão no nome/conta; compra = saída; pagamento da fatura fica de fora
  const fatura = ass ? !!ass.fatura : (fatTok || /-cartao$/.test(contaSug)); S.lv.imp.fatura = fatura;
  const vj = sug.valor !== '' && sug.valor != null ? +sug.valor : -1, vals = vj >= 0 ? am(vj) : [];
  const dec = vals.some(x => /,\d{1,2}$/.test(x)) ? ',' : vals.some(x => /\.\d{1,2}$/.test(x)) ? '.' : (vals.some(x => /\d\.\d{3}(\D|$)/.test(x)) ? ',' : (sep === ';' ? ',' : '.'));
  const posPct = vals.length ? vals.filter(x => x !== '' && !/^-|-$|\(|r\$ -/i.test(x)).length / vals.filter(x => x !== '').length : 0;
  let inverter = false, sinalPq = '';
  if (sug.sinal === 'valor'){ if (fatura){ inverter = true; sinalPq = 'fatura: a compra é saída'; } else if (/-cartao$/.test(contaSug) && posPct >= 0.7){ inverter = true; conf.sinal = 'media'; sinalPq = 'quase tudo positivo num cartão: parece fatura, confira'; } }
  if (sinalPq) porque.sinal = sinalPq;
  // 4 · moeda: coluna da assinatura > moeda da assinatura > cabeçalho > símbolo nas linhas > conta > a escolher (nunca um padrão calado)
  let moedaSug = '', moedaConf = 'alta', moedaPq = '';
  if (ass && ass.moeda === 'col' && ass.mapa.moeda){ moedaSug = colRx(ass.mapa.moeda); moedaPq = 'coluna «' + (cab[+moedaSug] || '') + '»'; }
  else if (ass && ass.moeda && ass.moeda !== 'col'){ moedaSug = '=' + ass.moeda; moedaPq = 'conta ' + contaNome(ass.conta); }
  else if (sug.moeda !== '' && sug.moeda != null && nota.moeda[+sug.moeda] >= 5){ moedaSug = sug.moeda; moedaPq = 'coluna «' + cab[+sug.moeda] + '»'; }
  else { const todos = (dados.slice(0, 60).map(r => r.join(' ')).join(' ')), cabTxt = h.join(' '); const nR = (todos.match(/R\$/g) || []).length, nE = (todos.match(/€|\bEUR\b/g) || []).length, nU = (todos.match(/US\$|\bUSD\b/g) || []).length;
    if (/\(em r\$\)|\br\$\b/.test(cabTxt)){ moedaSug = '=BRL'; moedaPq = 'o cabeçalho diz R$'; } else if (/\(em €\)|\beur\b|€/.test(cabTxt)){ moedaSug = '=EUR'; moedaPq = 'o cabeçalho diz €'; }
    else if (nR + nE + nU){ moedaSug = nR >= nE && nR >= nU ? '=BRL' : nE >= nU ? '=EUR' : '=USD'; moedaPq = 'símbolo nas linhas'; }
    else if (contaSug && LV_CONTAS_BRL.test(contaSug)){ moedaSug = '=BRL'; moedaConf = 'media'; moedaPq = 'pela conta ' + contaNome(contaSug) + ' (em R$): confira'; }
    else if (contaSug === 'BoursoBank-joint'){ moedaSug = '=EUR'; moedaConf = 'media'; moedaPq = 'pela conta BoursoBank (em €): confira'; }
    else { moedaSug = ''; moedaPq = ''; } }
  sug.moeda = moedaSug; conf.moeda = moedaConf; porque.moeda = moedaPq;
  if (sug.parcela === '' || sug.parcela == null) sug.parcela = '';
  if (sug.flag === '' || sug.flag == null) sug.flag = '';
  const fd = lvFmtData(sug.data !== '' ? am(+sug.data) : []); conf.data = conf.data === 'media' ? 'media' : fd.conf; if (fd.conf === 'media') porque.data = 'dia e mês ambíguos (nenhum dia passa de 12): dia/mês ou mês/dia?';
  if (!conf.desc) conf.desc = 'alta';
  S.lv.imp.sug = sug; S.lv.imp.conf = conf; S.lv.imp.porque = porque; S.lv.imp.ok = {}; S.lv.imp.forcar = {}; S.lv.imp.erro = null;
  S.lv.imp.map = {data:sug.data, valor:sug.valor || '', deb:sug.deb || '', cred:sug.cred || '', flag:sug.flag, sinal:sug.sinal, desc:sug.desc, parcela:sug.parcela, moeda:sug.moeda, conta:sug.conta, contaNova:'', dec, fmtData:fd.fmt, inverter};
}
const lvColAmostra = j => j === '' || j == null ? [] : (S.lv.imp.arq ? S.lv.imp.arq.linhas.slice(0, 40).map(r => r[+j]) : []);
function lvEhNum(x, dec){ if (x == null) return false; let t = String(x).trim().replace(/R\$\s?-/i, '-').replace(/[€$]|R\$|US\$|EUR|BRL|USD|\s/g, ''); if (t === '') return false; if (/^\(.*\)$/.test(t)) t = '-' + t.slice(1, -1); if (dec === ',') return /^[+-]?\d{1,3}(\.\d{3})*(,\d+)?$|^[+-]?\d+(,\d+)?$/.test(t) || /^[+-]?\d+(,\d+)?-$/.test(t); return /^[+-]?\d{1,3}(,\d{3})*(\.\d+)?$|^[+-]?\d+(\.\d+)?$/.test(t) || /^[+-]?\d+(\.\d+)?-$/.test(t); }
function lvNum(x, dec){ if (x == null) return null; let t = String(x).trim().replace(/R\$\s?-/i, '-'), neg = false; if (/^\(.*\)$/.test(t)){ neg = true; t = t.slice(1, -1); } if (/-$/.test(t)){ neg = true; t = t.slice(0, -1); } t = t.replace(/[€$]|R\$|US\$|EUR|BRL|USD|\s/g, ''); if (/^[+-]?\d{1,3}(\.\d{3})*(,\d+)?$|^[+-]?\d+(,\d+)?$/.test(t) && dec === ','){ t = t.replace(/\./g, '').replace(',', '.'); } else if (dec === '.' && (/^[+-]?\d{1,3}(,\d{3})*(\.\d+)?$|^[+-]?\d+(\.\d+)?$/.test(t))){ t = t.replace(/,/g, ''); } else return null; const v = parseFloat(t); return Number.isFinite(v) ? (neg ? -Math.abs(v) : v) : null; }
function lvData(x, fmt){
  if (x == null) return null; const t = String(x).trim(); if (!t) return null;
  if (fmt === 'serial'){ const n = parseFloat(t); if (!Number.isFinite(n) || n < 20000 || n > 80000) return null; const d = new Date(Math.round((n - 25569) * 86400000)); return d.toISOString().slice(0, 10); }
  let m;
  if (fmt === 'ymd'){ m = t.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/); return m ? lvIso(m[1], m[2], m[3]) : null; }
  m = t.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2,4})\b/); if (!m) return null;
  const a = fmt === 'mdy' ? m[2] : m[1], b = fmt === 'mdy' ? m[1] : m[2], y = m[3].length === 2 ? '20' + m[3] : m[3]; return lvIso(y, b, a);
}
function lvIso(y, mo, d){ mo = +mo; d = +d; if (mo < 1 || mo > 12 || d < 1 || d > 31) return null; return y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
function lvFmtData(am){   // {fmt, conf}: dia/mês fica «a confirmar» quando nenhum dia passa de 12 (11/03 pode ser 11 de março ou 3 de novembro)
  const a = (am || []).filter(x => x !== ''); if (!a.length) return {fmt:'dmy', conf:'alta'};
  if (a.filter(x => lvData(x, 'ymd')).length / a.length >= 0.8) return {fmt:'ymd', conf:'alta'};
  if (a.filter(x => lvData(x, 'serial')).length / a.length >= 0.8) return {fmt:'serial', conf:'alta'};
  const ps = a.map(x => String(x).match(/^(\d{1,2})[-\/.](\d{1,2})/)).filter(Boolean);
  if (ps.some(m => +m[1] > 12)) return {fmt:'dmy', conf:'alta'}; if (ps.some(m => +m[2] > 12)) return {fmt:'mdy', conf:'alta'}; return {fmt:'dmy', conf:ps.length ? 'media' : 'alta'};
}
const lvParcelaNorm = s => { const t = String(s == null ? '' : s).trim().toLowerCase(); if (!t || /^(-|unica|única|à vista|a vista)$/.test(t)) return ''; const m = t.match(/^(\d{1,2})\s*(?:\/|de)\s*(\d{1,2})$/); return m ? (+m[1]) + '/' + (+m[2]) : t; };
const lvChaveLivro = (conta, data, valor, parcela) => conta + '|' + data + '|' + (valor == null ? '' : valor.toFixed(2)) + '|' + lvParcelaNorm(parcela);
function lvChaves(){ if (S.lv.chaves && S.lv.chaves.n === lvN()) return S.lv.chaves.map; const map = new Map(); const N = lvN(); for (let i = 0; i < N; i++){ const v = lvOrig(i, 'VALOR_NATIVO'); if (typeof v === 'number'){ const k = lvChaveLivro(lvOrig(i, 'CONTA'), lvOrig(i, 'DATA'), v, lvOrig(i, 'PARCELA')); map.set(k, (map.get(k) || 0) + 1); } } S.lv.chaves = {n:N, map}; return map; }
function lvImpCalc(){
  const I = S.lv.imp, A = I.arq, M = I.map, K = lvChaves(), conta = M.conta === '=nova' ? (M.contaNova || '').trim() : M.conta, vistos = new Map(), out = []; let entram = 0, dup = 0, inval = 0, pag = 0, forcadas = 0;
  A.linhas.forEach((r, idx) => {
    const data = M.data === '' ? null : lvData(r[+M.data], M.fmtData); let valor = null, bruto = null, moeda = M.moeda === '' ? '' : /^=/.test(String(M.moeda)) ? String(M.moeda).slice(1) : (String(r[+M.moeda] || '').toUpperCase().replace('R$', 'BRL').replace('€', 'EUR').replace('US$', 'USD').replace('$', 'USD') || '');
    const desc = M.desc === '' ? '' : String(r[+M.desc] || ''), parcela = M.parcela === '' ? '' : String(r[+M.parcela] || ''), flagV = M.flag !== '' ? lvNorm(r[+M.flag]) : '';
    if (M.sinal === 'debcred'){ const d = M.deb === '' ? null : lvNum(r[+M.deb], M.dec), c = M.cred === '' ? null : lvNum(r[+M.cred], M.dec); if (d != null && d !== 0) valor = -Math.abs(d); else if (c != null && c !== 0) valor = Math.abs(c); else if (d === 0 || c === 0) valor = 0; bruto = valor; }
    else { valor = M.valor === '' ? null : lvNum(r[+M.valor], M.dec); bruto = valor; if (valor != null && M.sinal === 'flag' && M.flag !== ''){ valor = /^(d|dr|debito|debit|saida|out)$/.test(flagV) ? -Math.abs(valor) : /^(c|cr|credito|credit|entrada|in)$/.test(flagV) ? Math.abs(valor) : valor; } }
    let status = 'entra', motivo = '';
    if (!data){ status = 'invalida'; motivo = 'sem data legível'; } else if (valor == null){ status = 'invalida'; motivo = 'sem valor legível'; }
    else if (M.sinal === 'flag' && /^neutral$/.test(flagV)){ status = 'conversao'; motivo = 'conversão entre moedas da mesma conta: não é entrada nem saída'; }
    else if (I.fatura && bruto < 0 && LV_RX_PAG.test(desc)){ status = 'pagamento'; motivo = 'pagamento da fatura: já está no extrato da conta que pagou'; }
    if (status === 'entra' && valor != null && M.inverter) valor = -valor;
    const k = lvChaveLivro(conta, data, valor, parcela);
    if (status === 'entra'){ const noLivro = K.get(k) || 0, antes = vistos.get(k) || 0; vistos.set(k, antes + 1); if (antes < noLivro){ if (I.forcar[idx]){ forcadas++; } else { status = 'dup'; motivo = noLivro + (noLivro === 1 ? ' igual no livro' : ' iguais no livro') + ' · ' + (antes + 1) + 'ª ocorrência no arquivo'; } } }
    if (status === 'invalida') inval++; else if (status === 'dup') dup++; else if (status === 'pagamento' || status === 'conversao') pag++; else entram++;
    out.push({data, valor, moeda, conta, desc, parcela:lvParcelaNorm(parcela), status, motivo, forcada:status === 'entra' && !!I.forcar[idx]});
  });
  return {linhas:out, entram, dup, inval, pag, forcadas};
}
function lvImportar(){
  const R = lvImpCalc(), M = S.lv.imp.map, nome = S.lv.imp.arq.nome, novas = R.linhas.filter(r => r.status === 'entra').map(r => ({DATA:r.data, DESCRICAO_LIMPA:r.desc, VALOR_NATIVO:r.valor, MOEDA:r.moeda, CONTA:r.conta, ENTRADA:r.valor > 0 ? r.valor : null, 'SAÍDA':r.valor < 0 ? -r.valor : null, VALOR_EUR:(r.moeda === 'EUR' ? r.valor : r.moeda === 'BRL' ? r.valor / CAM : null), VALOR_BRL_EQ:(r.moeda === 'BRL' ? r.valor : r.moeda === 'EUR' ? r.valor * CAM : null), FONTE:'importado · ' + nome, GRANULARIDADE:'linha', TIPO_CC:'Operacional', CATEGORIA:'', ITEM:'A-classificar', PROJETO:'', COR:'🔴', TITULAR:'', CONTRAPARTE:r.desc, 'OBSERVAÇÃO':'importado nesta sessão do navegador' + (r.forcada ? ' · forçado (igual já existia)' : ''), PROJETO_GRUPO:'', PERIODO_VIDA:'', CARTAO:'', PARCELA:r.parcela, CONTRAPARTE_NORM:lvNorm(r.desc)}));
  if (!novas.length) return;
  const usd = novas.filter(r => r.VALOR_EUR == null).length;
  S.lv.ultimoImp = {n:novas.length, antes:S.lv.extra.slice(), nome};
  S.lv.extra = S.lv.extra.concat(novas); ssSet(LV_KEY_IMP(), S.lv.extra); S.lv.chaves = null; S.lv.vals = {}; S.lv.imp = {on:false}; S.lv.exp = null; S.lv.calc = null;
  if (!lvFAtivo(S.lv.f.CONTA)) S.lv.f.CONTA = {vals:[M.conta === '=nova' ? (M.contaNova || '').trim() : M.conta]};
  render(true);
  toastAcao(nPl(novas.length, 'linha entrou', 'linhas entraram') + ' só nesta sessão do navegador — no app real elas vão para a planilha. ' + (R.dup ? nPl(R.dup, 'já existia', 'já existiam') + ' e ' + (R.dup === 1 ? 'ficou' : 'ficaram') + ' de fora. ' : '') + (R.pag ? nPl(R.pag, 'pagamento de fatura ficou', 'pagamentos de fatura ficaram') + ' de fora. ' : '') + (usd ? nPl(usd, 'linha em USD fica', 'linhas em USD ficam') + ' sem valor em € (sem câmbio no mockup). ' : '') + 'O filtro mostra a conta importada.', 'Desfazer', 'lv-imp-voltar');
}
function lvLigar(){
  const w = $('#lv-wrap'); if (w){ w.addEventListener('scroll', () => lvPintar()); lvPintar(true); }
  const dz = $('#lv-dz'); if (dz){
    const inp_ = $('#lv-dz-in');
    dz.addEventListener('click', () => inp_.click()); dz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); inp_.click(); } });
    inp_.addEventListener('change', () => lvLerArquivo(inp_.files[0]));
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('sobre'); }));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('sobre'); }));
    dz.addEventListener('drop', e => lvLerArquivo(e.dataTransfer && e.dataTransfer.files[0]));
  }
}
document.addEventListener('keydown', e => { const t = e.target; if (!t || !t.dataset || t.dataset.lvIn == null) return; if (e.key === 'Enter'){ e.preventDefault(); lvFimEd(t); } else if (e.key === 'Escape'){ e.preventDefault(); lvFimEd(t, true); } });
