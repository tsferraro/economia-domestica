/* GERADO por pagina/tools/derivar_telas.py a partir de scripts/app/mockup.template.html (o mockup aprovado). NÃO EDITE À MÃO:
   mude a lista TROCAS do gerador e rode de novo. Parte «casca». */
"use strict";
/* ===================== roteador, casca e eventos (v5: menu agrupado · Painel · Fluxo de caixa) ===================== */
const VIEWS = {painel:viewPainel, orcamento:viewOrcamento, livro:() => ECON.verLivro()};
const ALIAS = {mes:'painel', simulacao:'orcamento'};   // onda 11 (M1): «Pedir ajuste» não é tela; #ajuste abre o pop-up do botão do topo
function rota(){ const h = (location.hash || '#painel').slice(1).split('/'), id = ALIAS[h[0]] || h[0]; return VIEWS[id] ? id : 'painel'; }
const grupoDe = id => (TELAS.find(t => t.id === id) || {}).g || null;
function nav(id){
  const g0 = grupoDe(id);
  const link = (t, sub) => '<a href="#' + t.id + '"' + (t.id === id ? ' aria-current="page"' : '') + '>' + icone(t.ico) + esc(sub ? t.nome : t.nome) + '</a>';
  const grupo = g => { const ab = S.menuFecha === g.id ? false : (S.menu[g.id] || g0 === g.id); return '<button class="side-g" type="button" data-act="menu-g" data-v="' + g.id + '" aria-expanded="' + ab + '"' + (g0 === g.id ? ' aria-current="true"' : '') + '>' + icone(g.ico) + esc(g.nome) + SETA + '</button>' + (ab ? '<div class="side-sub">' + TELAS.filter(t => t.g === g.id).map(t => link(t, true)).join('') + '</div>' : ''); };
  $('#side').innerHTML = '<div class="marca"><i>E</i><span>Economia Doméstica</span></div>' + TELAS.filter(t => !t.g).map(t => link(t)).join('') + GRUPOS.map(grupo).join('') +
    '<div class="rodape-side"><div class="leg-blocos">' + ['1', '2', '3', '4', '5', '6'].map(n => '<span><i style="background:' + COR[n] + '"></i>' + n + ' · ' + esc(NOME[n]) + '</span>').join('') + '</div><span>dados até ' + esc(mesPt(MT.mes_fechado)) + ' · ' + esc(M.gerado_em) + '</span></div>';
  const ativoMobile = PRINCIPAIS.includes(id) ? id : (g0 || 'analises');
  $('#tabbar').innerHTML = PRINCIPAIS.map(p => { const t = TELAS.find(x => x.id === p); return '<a href="#' + p + '"' + (ativoMobile === p ? ' aria-current="page"' : '') + '>' + icone(t.ico) + '<span>' + esc(t.curto || t.nome) + '</span></a>'; }).join('') +
    GRUPOS.map(g => '<a href="#mais/' + g.id + '"' + (ativoMobile === g.id ? ' aria-current="page"' : '') + '>' + icone(g.ico) + '<span>' + esc(g.nome) + '</span></a>').join('');
}
function render(manterScroll){
  const id = rota(), y = window.scrollY;
  $('#main').innerHTML = mascaraHtml(trocaPlanHtml(VIEWS[id]()));
  $('#main').classList.toggle('largo', id === 'livro');   // onda 12: o Livro-Caixa usa a largura inteira
  nav(id);
  const nome = id === 'mais' ? ((GRUPOS.find(x => x.id === (location.hash.split('/')[1] || 'analises')) || GRUPOS[0]).nome) : (TELAS.find(t => t.id === id) || {nome:'Economia Doméstica'}).nome;
  $('#topo-tit').textContent = nome;
  topoChip();   // v9: na Simulação a sobra simulada; no Painel editando, a sobra orçada e o «Concluir»; nas outras telas, o mês fechado
  fabRender();
  document.title = nome + ' · Economia Doméstica';   // D107: o app chama-se Economia Doméstica (as chaves casa.* do navegador ficam, para não perder o digitado)
  $('#carimbo-topo').textContent = '';
  ligar(id);
  posRender();   // v10: «orçado» como termo único, campos mascarados quando escondido, rótulos da barra sem colisão
  if (manterScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
}
function ligar(id){
  if (id === 'livro' && ECON.livroPronto()) lvLigar();   // onda 12: rolagem virtual e zona de soltar do importador
  if (id === 'painel' && (window.innerWidth || 1280) < 768) document.querySelectorAll('.aa-w').forEach(el => { el.scrollLeft = el.scrollWidth; });   // conserto P2-8: no celular o Ano a ano abre no fim (2026 e Projetado), 1ª coluna fixa
  const pt = $('#pl-tipo'); if (pt){ pt.addEventListener('change', e => { S.plan.tipo = e.target.value; S.plan.total = null; delete S.vgEd.viagens; render(true); }); $('#pl-dias').addEventListener('change', e => { S.plan.dias = Math.max(1, +e.target.value || 1); S.plan.total = null; render(true); }); $('#pl-pes').addEventListener('change', e => { S.plan.pes = Math.max(1, +e.target.value || 1); S.plan.total = null; render(true); }); }
  const pd_ = $('#pl-dias'); if (pd_ && !pt){ pd_.addEventListener('change', e => { S.plan.dias = +e.target.value || null; render(true); }); const pp_ = $('#pl-pes'); if (pp_) pp_.addEventListener('change', e => { S.plan.pes = +e.target.value || null; render(true); }); }
  const dz = $('#dz'); if (dz){
    const inp_ = $('#dz-input'), ok = f => { S.upload = f ? f.name : 'arquivo.csv'; render(true); };
    dz.addEventListener('click', () => inp_.click()); dz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); inp_.click(); } });
    inp_.addEventListener('change', () => ok(inp_.files[0]));
    ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('sobre'); }));
    ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('sobre'); }));
    dz.addEventListener('drop', e => ok(e.dataTransfer && e.dataTransfer.files[0]));
  }
}
function rerender(b){
  const d = b && b.dataset ? b.dataset : {};
  render(true);
  const sel = '[data-act="' + d.act + '"]' + ['id', 'v', 'k', 'i', 't', 'g'].filter(k => d[k] != null).map(k => '[data-' + k + '="' + String(d[k]).replace(/"/g, '\\"') + '"]').join('');
  const el = d.act ? document.querySelector(sel) : null;
  if (el && el.focus) el.focus();
}
function sair(x){
  x.sai = true; const el = document.querySelector('[data-linha="' + x.id + '"]'); if (el) el.classList.add('sai');
  setTimeout(() => { x.gone = true; render(true); const prox = document.querySelector('.cx-linha [data-act="caixa-aceitar"]'); if (prox) prox.focus(); }, 260);
}
let tToast;
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tToast); tToast = setTimeout(() => t.classList.remove('on'), 4200); }
function toastAcao(msg, rot, act){ const t = $('#toast'); t.innerHTML = esc(msg) + ' <button class="btn peq" type="button" data-act="' + act + '" style="margin-left:10px">' + esc(rot) + '</button>'; t.classList.add('on'); clearTimeout(tToast); tToast = setTimeout(() => t.classList.remove('on'), 10000); }
const AVISO_GRAVA = 'No app real isto grava';
function temaAlternar(){ const r = document.documentElement; r.dataset.tema = r.dataset.tema === 'escuro' ? 'claro' : 'escuro'; aplicarPaleta(true); render(true); }   // conserto: as roscas trocam para o par escuro da paleta
const rolarPara = id => { const el = document.getElementById(id); if (el && el.scrollIntoView) el.scrollIntoView({block:'start'}); };
/* P1-1 («restinho do bloco anterior»): o topo do bloco para colado sob a barra do topo. O foco no botão do menu (sticky) já tinha rolado a página antes do
   scrollIntoView, e o scroll-margin não bastava: agora a rolagem é calculada (posição do bloco − barra − 16 px), com `preventScroll` no foco, e repetida
   num 2º quadro para absorver o reflow do bloco que fechou. Alvo: topo do bloco = --topo + 16 px (84 px no computador). */
const topoPx = () => { const t = document.querySelector('.topo'); return t && t.getBoundingClientRect ? Math.round(t.getBoundingClientRect().height) : 68; };
function rolarBloco(id){
  const el = document.getElementById(id); if (!el || !el.getBoundingClientRect) return;
  const ir = () => { const r = el.getBoundingClientRect(), y = Math.max(0, Math.round(r.top + (window.scrollY || 0) - topoPx() - 16)); window.scrollTo({top:y, left:0, behavior:'auto'}); };
  ir(); const raf = window.requestAnimationFrame || (f => setTimeout(f, 16)); raf(() => raf(ir));
}
const focoSem = el => { if (el && el.focus){ try { el.focus({preventScroll:true}); } catch (e) { el.focus(); } } };
function orcIr(v, b){
  S.orc.bl = v; S.ab.orc = {};
  S.orc.grupo = v === '3' || v === '4' ? S.orc.sub[v] : null;
  orcRegioes();
  focoSem(document.querySelector('[data-act="orc-bloco"][data-v="' + v + '"]'));
  rolarBloco('orc-bloco-' + v);
}
function pnIr(v, b){
  S.pn.bl = v; if (v !== 'G') S.ab.pn = {};
  render(true);
  focoSem(document.querySelector('[data-act="pn-bl"][data-v="' + v + '"]'));
  rolarBloco('pn-bloco-' + v);
}
const emOrc = () => rota() === 'orcamento';
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, v = b.dataset.v;
  if (a === 'pn-card'){ S.pn.card = S.pn.card === v ? null : v; rerender(b); }
  else if (a === 'pop'){ popAbrir(b); }
  else if (a === 'dv-chave'){ S.pn.dvChave = v; if (emOrc()) orcRegioes(); else rerender(b); }
  else if (a === 'orc-mtz'){ S.orc.mtz = v; regioes(); const el = document.querySelector('[data-act="orc-mtz"][data-v="' + v + '"]'); if (el) focoSem(el); }
  /* v9: um único botão libera a coluna Orçado do Painel; ao liberar, os blocos 1–5 abrem (os campos precisam estar à vista); «Concluir» devolve o estado de antes */
  else if (a === 'pn-ed'){ if (!S.pn.editOrc){ S.pn.editOrc = true; S.pn.abAntes = Object.assign({}, S.ab.pn); ['1', '2', '3', '4', '5'].forEach(k => { S.ab.pn[k] = true; }); } else { S.pn.editOrc = false; S.ab.pn = S.pn.abAntes || {}; S.pn.abAntes = null; } pnRegioes(); focoSem(document.querySelector('[data-act="pn-ed"]')); toast(S.pn.editOrc ? 'Coluna Orçado liberada. «Concluir», na barra do topo, trava de novo.' : 'Orçado travado; o que você digitou fica guardado.'); }   // e29: o foco vai ao único controle (barra do topo editando; cabeçalho travado)
  else if (a === 'ir-conf'){ S.det['pn-conf'] = true; render(true); const el = $('#pn-conf'); if (el){ el.scrollIntoView({block:'start'}); const b_ = el.querySelector('.det-b'); if (b_) focoSem(b_); } }   // e29: o a receber aponta para a pergunta aberta
  else if (a === 'virada-ok'){ const g = lsGet(ORC_KEY); if (g){ g.aviso_lido = true; lsSet(ORC_KEY, g); } S.virada = null; render(true); }
  else if (a === 'sim-bloco'){ simIr(v); }
  else if (a === 'sim-add'){ S.sim.add = S.sim.add === v && v === 'topo' ? null : v; orcRegioes(); const i = document.querySelector('.sim-form[data-n="' + v + '"] [data-novo="nome"]'); if (i) i.focus(); else focoSem(document.querySelector('[data-act="sim-add"][data-v="topo"]')); }
  else if (a === 'sim-add-cancel'){ const n = S.sim.add; S.sim.add = null; orcRegioes(); focoSem(document.querySelector('[data-act="sim-add"][data-v="' + (n || 'topo') + '"]')); }
  else if (a === 'sim-add-ok'){ e.preventDefault(); const f = b.closest ? b.closest('.sim-form') : null, nome = f ? (f.querySelector('[data-novo="nome"]').value || '').trim() : '', x = f ? parseNum(f.querySelector('[data-novo="x"]').value) : null, iniEl = f ? f.querySelector('[data-novo="ini"]') : null, ini = iniEl ? +iniEl.value || 1 : 1;
    if (!nome){ toast('Escreva o nome do item (ex.: babá).'); const i = f && f.querySelector('[data-novo="nome"]'); if (i) i.focus(); return; } if (x == null){ toast('Escreva o valor: sem valor sugerido, é você quem orça.'); const i = f && f.querySelector('[data-novo="x"]'); if (i) i.focus(); return; }
    S.sim.seq = (S.sim.seq || 0) + 1; const nid = 'novo|' + S.sim.seq; S.sim.novos.push({id:nid, n:v, nome:nome.slice(0, 60), x, ini}); S.sim.add = null; if (!ehAb('sim', v)) S.ab.sim[v] = true; gravarSimLocal(); orcRegioes(); const SCn = simCalc(); toast('«' + nome + '» entrou. ' + (SCn.sim.sob >= -0.5 ? 'Sobra' : 'Falta') + ' ' + ANO_SIM + ': ' + sobraTxt(SCn.sim.sob)); const nf = document.querySelector('[data-sim="' + nid + '"]'); if (nf) focoSem(nf); else focoSem(document.querySelector('[data-act="sim-add"][data-v="' + v + '"]')); }   // P1-8/P2-19: foco no item novo, aviso curto
  else if (a === 'sim-rm'){ const k = b.dataset.k, n = b.dataset.n, it = S.sim.novos.find(x => x.id === k); S.sim.novos = S.sim.novos.filter(x => x.id !== k); gravarSimLocal(); orcRegioes(); if (it) toast('«' + it.nome + '» saiu da simulação.'); focoSem(document.querySelector('[data-act="sim-add"][data-v="' + (n || 'topo') + '"]')); }
  else if (a === 'sim-usar-plan'){ if (S.plan.total != null){ S.sim.ed[v] = {raw:fmtCampo(S.plan.total), x:S.plan.total}; gravarSimLocal(); orcRegioes(); toast('Proposta do verão (' + money(S.plan.total, 'EUR') + ') usada em ' + v + ' de ' + ANO_SIM + '.'); } }
  else if (a === 'sim-desfazer'){ S.sim.ultimo = {ed:S.sim.ed, novos:S.sim.novos, aj:S.sim.aj}; S.sim.ed = {}; S.sim.novos = []; S.sim.aj = {}; S.sim.add = null; apagarSimLocal(); orcRegioes(); const h1 = document.querySelector('.cab-tela h1'); if (h1){ h1.setAttribute('tabindex', '-1'); focoSem(h1); } toastAcao('Recomeçou do orçado de ' + ANO_REF + '.', 'Voltar', 'sim-voltar'); }
  else if (a === 'sim-voltar'){ const u = S.sim.ultimo; if (u){ S.sim.ed = u.ed; S.sim.novos = u.novos; S.sim.aj = u.aj; S.sim.ultimo = null; gravarSimLocal(); if (emOrc()) orcRegioes(); else render(true); toast('Sua simulação voltou e está guardada de novo.'); } }
  else if (a === 'pn-jan'){ S.pn.janela = v; rerender(b); }   // v8: chave das 4 janelas do Resultado
  else if (a === 'aa-vista'){ S.pn.aaVista = v; rerender(b); }   // v10 (item 11): Análise vertical × horizontal
  else if (a === 'pn-bl'){ pnIr(v, b); }
  else if (a === 'pn-vista'){ S.pn.vista = v; rerender(b); }
  else if (a === 'pn-ritmo-subs'){ S.pn.ritmoSubs[v] = !S.pn.ritmoSubs[v]; rerender(b); }
  else if (a === 'bl-tog'){ const sc = b.dataset.s; S.ab[sc][v] = !ehAb(sc, v); if (sc === 'orc' || sc === 'sim'){ if (S.ab[sc][v]) (sc === 'sim' ? S.sim : S.orc).bl = v; orcRegioes(); const el = document.querySelector('[data-act="bl-tog"][data-s="' + sc + '"][data-v="' + v + '"]'); if (el && el.focus) el.focus(); } else { if (S.ab.pn[v]) S.pn.bl = v; rerender(b); } }
  else if (a === 'ab-all'){ const sc = b.dataset.s; abTudo(sc, !todosAb(sc)); if (sc === 'orc' || sc === 'sim') orcRegioes(); else rerender(b); }
  else if (a === 'orc-grupo'){ const n = S.orc.bl; S.orc.grupo = S.orc.grupo === v ? null : v; if (!ehAb('orc', n)) S.ab.orc[n] = true;
    if (n === '2'){ S.expAll.orc2 = false; Object.keys(S.exp).forEach(x => { if (x.indexOf('orc2|') === 0) delete S.exp[x]; }); if (S.orc.grupo) S.exp['orc2|' + v] = true; }
    else if (n === '3' && S.orc.grupo){ S.orc.sub['3'] = v; S.orc.vgSel = null; }
    else if (n === '4' && S.orc.grupo){ S.orc.sub['4'] = v === '4.1' ? '4.1' : '4.2'; if (v !== '4.1'){ S.expAll.orc42 = false; Object.keys(S.exp).forEach(x => { if (x.indexOf('orc42|') === 0) delete S.exp[x]; }); S.exp['orc42|' + v] = true; } }
    else if (n === '5' && S.orc.grupo){ S.exp['orc5|' + v] = true; }
    orcRegioes(); const row = document.querySelector('[data-act="exp"][data-k="orc2|' + v + '"], [data-act="exp"][data-k="orc42|' + v + '"]'); if (row && row.scrollIntoView) row.scrollIntoView({block:'center'}); else rolarPara('orc-bloco-' + n); }
  else if (a === 'dre-versao'){ const g = b.closest ? b.closest('[data-s]') : null, sc = g && g.dataset ? g.dataset.s : 'pn'; S.dre[sc] = v; if (sc === 'orc') orcRegioes(); else rerender(b); }
  else if (a === 'fab'){ S.fab = !S.fab; if (S.fab) S.paN = (S.paN || 0) + 1; else S.paTxt = ''; fabRender(); const el = document.querySelector(S.fab ? '#pa-fab' : '.fab-b'); if (el && el.focus) el.focus(); }
  else if (a === 'pa-mic'){ toast('Gravar um áudio: só desenho neste mockup. No app real o áudio vira texto no campo e você confirma antes de enviar.'); }
  else if (a === 'pa-enviar'){ const w = b.closest ? b.closest('.pedir') : null, ta = w ? w.querySelector('textarea') : null; if (ta && !ta.value.trim()){ toast('Escreva ou grave o que quer ajustar.'); ta.focus(); return; } toast('No app real isto manda o pedido ao Claude, que ajusta o livro e avisa aqui quando terminar.'); S.paTxt = ''; if (ta) ta.value = ''; }
  else if (a === 'pn-grupo'){ S.pn.grupo = v && S.pn.grupo !== v ? v : null; Object.keys(S.exp).forEach(x => { if (x.indexOf('pn2|') === 0) delete S.exp[x]; }); delete S.expAll.pn2; rerender(b); }
  else if (a === 'fx-cf'){ S.cfCard = S.cfCard === v ? null : v; rerender(b); }
  else if (a === 'mes-sel'){ S.mesSel = S.mesSel === v ? MES_PAD : v; S.pn.grupo = null; rerender(b); }
  else if (a === 'mes-sel-pop'){ S.mesSel = v; S.pn.grupo = null; render(true); focoSem(document.querySelector('#pn-bloco-2 .per-b')); }   // v10 (item 4): o chip do mês abre a escolha do mês
  else if (a === 'ocultar'){ esconderValores(); }   // v10 (item 12)
  else if (a === 'menu-g'){ const aberto = S.menu[v] || grupoDe(rota()) === v; S.menu[v] = !aberto; S.menuFecha = !aberto ? null : v; nav(rota()); const el = document.querySelector('[data-act="menu-g"][data-v="' + v + '"]'); if (el && el.focus) el.focus(); }
  else if (a === 'exp'){ const k = b.dataset.k, cur = b.getAttribute ? b.getAttribute('aria-expanded') === 'true' : !!S.exp[k]; S.exp[k] = !cur; if (S.exp[k] && /^orc(2|42|5)\|/.test(k)) S.orc.grupo = k.split('|')[1]; if (emOrc()) orcRegioes(); else rerender(b); if (emOrc()){ const el = document.querySelector('[data-act="exp"][data-k="' + k.replace(/"/g, '\\"') + '"]'); if (el && el.focus) el.focus(); } }
  else if (a === 'exp-all'){ const k = b.dataset.k, atual = S.expAll[k] != null ? S.expAll[k] : b.dataset.ab === '1'; S.expAll[k] = !atual; Object.keys(S.exp).forEach(x => { if (x.indexOf(k + '|') === 0) delete S.exp[x]; }); if (emOrc()) orcRegioes(); else rerender(b); }
  else if (a === 'estado'){ S.estado = v; rerender(b); }
  else if (a === 'orc-bloco'){ orcIr(v, b); }
  else if (a === 'ir'){ const el = $('#' + v); if (el && el.scrollIntoView) el.scrollIntoView({block:'start'}); }
  else if (a === 'orc-sub'){ const n = b.dataset.n || S.orc.bl; S.orc.sub[n] = v; S.orc.grupo = v; S.orc.vgSel = null; orcRegioes(); const el = document.querySelector('[data-act="orc-sub"][data-v="' + v + '"]'); if (el && el.focus) el.focus(); }
  else if (a === 'orc-vista'){ const n = b.dataset.n || S.orc.bl; S.orc.vista[n] = v; orcRegioes(); const el = document.querySelector('[data-act="orc-vista"][data-n="' + n + '"][data-v="' + v + '"]'); if (el && el.focus) el.focus(); }
  else if (a === 'orc-rit'){ S.orc.rit = v; orcRegioes(); const el = document.querySelector('[data-act="orc-rit"][data-v="' + v + '"]'); if (el && el.focus) el.focus(); }
  else if (a === 'orc-vgsel'){ S.orc.vgSel = S.orc.vgSel === b.dataset.id ? null : b.dataset.id; orcRegioes(); const el = document.querySelector('[data-act="orc-vgsel"][data-id="' + String(b.dataset.id).replace(/"/g, '\\"') + '"]'); if (el && el.focus) el.focus(); }
  else if (a === 'orc-jan'){ S.orc.jan = v; rerender(b); }
  else if (a === 'orc-desfazer'){ S.orc.ultimo = {ed:S.orc.ed, meta:S.orc.meta, taxa:S.orc.taxa, taxaRaw:S.orc.taxaRaw, vgEd:S.vgEd, plan:Object.assign({}, S.plan)}; const nDesf = ECON.orcadoDesfazer(Object.keys(S.orc.ed)); S.orc.ed = {}; S.orc.meta = ''; S.orc.taxa = null; S.orc.taxaRaw = null; S.vgEd = {}; S.plan.guardadoEm = null; apagarOrcLocal(); aplicarEd(); regioes(); toastAcao(nDesf ? 'Edições desfeitas: ' + (nDesf === 1 ? '1 linha volta' : nDesf + ' linhas voltam') + ' ao valor da última rodada, e a volta também é gravada.' : 'Edições desfeitas. Nada tinha sido gravado, então nada mudou na planilha.', 'Voltar', 'orc-voltar'); }   // conserto P2-16: dá para voltar por 10 s
  else if (a === 'orc-voltar'){ const u = S.orc.ultimo; if (u){ S.orc.ed = u.ed; S.orc.meta = u.meta; S.orc.taxa = u.taxa; S.orc.taxaRaw = u.taxaRaw; S.vgEd = u.vgEd; Object.assign(S.plan, u.plan); S.orc.ultimo = null; gravarOrcLocal(); aplicarEd(); regioes(); toast('Seus números voltaram e estão guardados de novo.'); } }
  else if (a === 'orc-salvar'){ baixarOrc(); }
  else if (a === 'pl-guardar'){ S.plan.guardadoEm = new Date().toISOString().slice(0, 10); gravarOrcLocal(); render(true); toast('Proposta do verão guardada neste navegador e incluída em «Salvar meus números».'); }
  else if (a === 'pl-lock'){ const c = b.dataset.c, ed = S.vgEd.v27 = S.vgEd.v27 || {}; if (ed[c] != null){ delete ed[c]; delete ed[c + '_raw']; } else { const inp = document.querySelector('[data-vg="v27"][data-c="' + c + '"]'), x = inp ? parseNum(inp.value) : null; if (x != null){ ed[c] = x; ed[c + '_raw'] = inp.value; } } render(true); const el = document.querySelector('[data-act="pl-lock"][data-c="' + c + '"]'); if (el && el.focus) el.focus(); }   // cadeado por linha (print 12)
  else if (a === 'vg-ed-limpar'){ delete S.vgEd[b.dataset.k]; if (emOrc()) orcRegioes(); else render(true); }
  else if (a === 'aviso-grava') toast(b.dataset.msg || AVISO_GRAVA);
  else if (a === 'tema') temaAlternar();
  else if (a === 'caixa-aceitar'){ const x = S.caixa[+b.dataset.i]; sair(x); toast(AVISO_GRAVA + ': a sugestão vira a classificação da linha. Neste mockup só a linha sai da fila.'); }
  else if (a === 'caixa-regra'){ const x = S.caixa[+b.dataset.i]; sair(x); toast(AVISO_GRAVA + ': uma regra para as ' + x.iguais + ' linhas parecidas, e nunca mais pergunta. Neste mockup nada foi criado.'); }
  else if (a === 'fut-idade'){ S.fut.idade = +v; rerender(b); }
  else if (a === 'infob'){ S.info[b.dataset.t] = S.info[b.dataset.t] === b.dataset.k ? null : b.dataset.k; if (emOrc() && b.dataset.t === 'orc') orcRegioes(); else rerender(b); }
  else if (a === 'det'){ S.det[b.dataset.k] = !S.det[b.dataset.k]; rerender(b); }
  else if (a === 'vg-ano'){ S.vg.ano = +v; S.vg.sel = null; rerender(b); }
  else if (a === 'vg-tipo'){ S.vg.tipo = S.vg.tipo === v ? 'todas' : v; rerender(b); }
  else if (a === 'vg-comp'){ S.vg.comp = v; rerender(b); }
  else if (a === 'vg-sel'){ S.vg.sel = S.vg.sel === b.dataset.id ? null : b.dataset.id; rerender(b); }
  else if (a === 'vg-cmp'){ S.vg.cmp = v; rerender(b); }
  else if (a === 'cf-grupo'){ S.cf.grupo = S.cf.grupo === b.dataset.id ? null : b.dataset.id; rerender(b); }
  else if (a === 'fx-prio'){ S.fx.prio = v; rerender(b); }
  else if (a === 'fx-saldo-limpar'){ S.fx.saldo = null; S.fx.saldoRaw = ''; lsSet(FX_SALDO_KEY, null); rerender(b); }
  else if (a === 'an-sel'){ S.an.sel = S.an.sel === v ? null : v; rerender(b); }
  else if (a === 'an-filtro'){ S.an.filtro = v; rerender(b); }
  else if (a === 'rt-soltar'){ S.det['rt-bourso'] = true; render(true); const dz = $('#dz'); if (dz && dz.scrollIntoView){ dz.scrollIntoView({block:'center'}); dz.focus(); } }
  else if (a === 'vg-mano'){ S.vg.mAno = v; rerender(b); }   // onda 11 (V6): no celular, um ano da matriz por vez
  else if (a === 'pa-de'){ S.fab = true; S.paN = (S.paN || 0) + 1; S.paTxt = OCULTO ? mascaraNum(b.dataset.txt || '') : (b.dataset.txt || ''); fabRender(); const ta = $('#pa-fab'); if (ta){ ta.focus(); try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch (err) {} } }   // onda 11 (J2): «está errado?» abre o pedido já preenchido
  else if (a === 'pl-edit'){ S.pl.edit = b.dataset.id; S.pl.cria = null; render(true); const i = $('#pl-ed-nome'); if (i){ i.focus(); i.select(); } }   // onda 11 (L3): o lápis abre a edição de uma linha por vez
  else if (a === 'pl-cancel'){ const id = S.pl.edit; S.pl.edit = null; render(true); focoSem(document.querySelector('[data-act="pl-edit"][data-id="' + String(id || '').replace(/"/g, '\\"') + '"]')); }
  else if (a === 'pl-salvar'){ const id = b.dataset.id, i = $('#pl-ed-nome'), g = $('#pl-ed-g'), nome = (i && i.value || '').trim(); if (!nome){ toast('Escreva o nome do item.'); if (i) i.focus(); return; } S.pl.ren[id] = nome; if (g && g.value) S.pl.mov[id] = g.value; S.pl.edit = null; render(true); toast(AVISO_GRAVA + ': o item muda no plano. Neste mockup só muda nesta página.'); focoSem(document.querySelector('[data-act="pl-edit"][data-id="' + String(id).replace(/"/g, '\\"') + '"]')); }
  else if (a === 'pl-voltar'){ const u = S.pl.ultimo; if (u){ S.pl.ren = u.ren; S.pl.mov = u.mov; S.pl.novos = u.novos; S.pl.ultimo = null; render(true); toast('As edições do plano voltaram.'); } }
  else if (a === 'pl-ab'){ const n = b.dataset.id, atual = S.pl.ab[n] !== undefined ? S.pl.ab[n] : n === '2'; S.pl.ab[n] = !atual; rerender(b); }
  else if (a === 'pl-cria'){ S.pl.cria = b.dataset.b || null; S.pl.edit = null; S.pl.nome = ''; render(true); const i = $('#pl-novo'); if (i && i.focus) i.focus(); }
  else if (a === 'pl-criar'){ e.preventDefault(); const i = $('#pl-novo'), gs = $('#pl-novo-g'), nome = (i && i.value || '').trim(); if (!nome){ toast('Escreva o nome do item novo.'); if (i) i.focus(); return; } S.pl.novos.push({id:'novo|' + (S.pl.novos.length + 1), b:b.dataset.b, g:gs ? gs.value : '', nome}); S.pl.cria = null; S.pl.nome = ''; render(true); toast(AVISO_GRAVA + ': o item «' + nome + '» é criado no plano. Neste mockup só aparece nesta página.'); }
  else if (a === 'pl-desfazer'){ S.pl.ultimo = {ren:S.pl.ren, mov:S.pl.mov, novos:S.pl.novos}; S.pl.ren = {}; S.pl.mov = {}; S.pl.novos = []; S.pl.cria = null; S.pl.edit = null; render(true); toastAcao('Edições do plano desfeitas.', 'Voltar', 'pl-voltar'); }   // onda 11 (L6): com Voltar por 10 s
  else if (a === 'pl-todos'){ S.pl.todos = !S.pl.todos; rerender(b); }
  else if (a.slice(0, 3) === 'lv-'){ lvAct(a, b, e); }   // onda 12: Livro-Caixa
});
document.addEventListener('keydown', e => { const t = e.target; if (e.key === 'Enter' && t && t.dataset && (t.dataset.orc != null || t.dataset.taxa != null || t.dataset.vg != null || t.dataset.sim != null)){ const sel = t.dataset.orc != null ? '[data-orc="' + t.dataset.orc.replace(/"/g, '\\"') + '"]' : t.dataset.sim != null ? '[data-sim="' + t.dataset.sim.replace(/"/g, '\\"') + '"]' : t.dataset.taxa != null ? '[data-taxa]' : null; t.blur(); const el = sel ? document.querySelector(sel) : null; if (el) focoSem(el); }   // P1-8: Enter confirma e o foco fica no campo
  if (e.key === 'Escape' && t){ const f = t.closest ? t.closest('.sim-form') : null; if (f){ e.preventDefault(); const c = f.querySelector('[data-act="sim-add-cancel"]'); if (c) c.click(); return; } if (t.dataset && (t.dataset.orc != null || t.dataset.sim != null)){ t.blur(); return; } } if ((e.key === 'Enter' || e.key === ' ') && t && t.dataset && t.dataset.act && t.tagName && (t.tagName.toLowerCase() === 'path' || t.tagName.toLowerCase() === 'tr' || (t.tagName.toLowerCase() === 'span' && t.getAttribute('role') === 'button'))){ e.preventDefault(); e.stopPropagation(); t.dispatchEvent(new MouseEvent('click', {bubbles:true})); } });   // Enter/Espaço no ⓘ inline (span role=button) e nas fitas do leque
document.addEventListener('focusout', e => {
  const t = e.target, d = t && t.dataset; if (!d) return;
  if (d.orc != null){ const m_ = S.orc.ed[d.orc]; if (m_){ if (m_.x == null){ if (!String(m_.raw || '').trim()) delete S.orc.ed[d.orc]; gravarOrcLocal(); aplicarEd(); regioes(); return; } m_.raw = d.n === '7' ? fmtCampo(m_.x) : toIn(m_.x * (d.n === '2' && CAMPO[d.orc] ? fat2(d.orc) : fator(d.n))); t.value = m_.raw; gravarOrcLocal(); if (t.classList.contains('inv')) regioes(); } }   // P1-8: inválido fica marcado no campo; vazio volta ao combinado
  else if (d.sim != null){ const m_ = S.sim.ed[d.sim]; if (m_){ if (m_.x == null){ if (!String(m_.raw || '').trim()) delete S.sim.ed[d.sim]; gravarSimLocal(); orcRegioes(); return; } m_.raw = fmtCampo(m_.x); t.value = m_.raw; gravarSimLocal(); if (t.classList.contains('inv')) orcRegioes(); } }   // v9: campo vazio = volta à referência
  else if (d.taxa != null){ if (S.orc.taxa == null) S.orc.taxaRaw = null; else S.orc.taxaRaw = toIn(S.orc.taxa * 100); orcRegioes(); }
  else if (d.vg != null){ const ed = S.vgEd[d.vg]; if (ed && ed[d.c] != null){ ed[d.c + '_raw'] = toIn(ed[d.c]); } if (emOrc()) orcRegioes(); else render(true); }
  else if (d.lvIn != null && t.tagName !== 'SELECT'){ const i = +d.i, c = d.lvIn; setTimeout(() => { if (S.lv.ed && S.lv.ed.i === i && S.lv.ed.c === c && document.activeElement !== t) lvFimEd(t); }, 0); }   // onda 12: sair do campo guarda (o clique noutra célula chega antes)
});
document.addEventListener('submit', e => { const f = e.target; if (f && f.classList && f.classList.contains('sim-form')){ e.preventDefault(); const b = f.querySelector('[data-act="sim-add-ok"],[data-act="pl-criar"]'); if (b) b.click(); }
  else if (f && f.dataset && f.dataset.form === 'senha'){ e.preventDefault(); const i = f.querySelector('#senha-in'), er = f.querySelector('#senha-erro'); if (!mostrarValores(i ? i.value : '')){ if (er) er.textContent = 'Senha errada. Os valores seguem escondidos.'; if (i){ i.value = ''; i.focus(); } } } });   // v9: Enter no formulário do item novo acrescenta, nunca recarrega a página · v10: a senha que mostra os valores
document.addEventListener('change', e => {
  const d = e.target && e.target.dataset; if (!d) return;
  if (d.simAj != null){ if (e.target.checked) delete S.sim.aj[d.simAj]; else S.sim.aj[d.simAj] = false; gravarSimLocal(); orcRegioes(); const el = document.querySelector('[data-sim-aj="' + d.simAj.replace(/"/g, '\\"') + '"]'); if (el) focoSem(el); }   // v9: desmarcar tira o ajuste da sobra simulada
  else if (d.actChange === 'sim-add-bl'){ const f = e.target.closest('.sim-form'), nome = f ? f.querySelector('[data-novo="nome"]').value : '', x = f ? f.querySelector('[data-novo="x"]').value : ''; S.sim.addBl = e.target.value; orcRegioes(); const f2 = document.querySelector('.sim-form[data-n="topo"]'); if (f2){ f2.querySelector('[data-novo="nome"]').value = nome; f2.querySelector('[data-novo="x"]').value = x; focoSem(f2.querySelector('[data-novo="bl"]')); } }   // P1-9: trocar o bloco não perde o que já foi digitado
  else if (d.fut != null){ render(true); }   // onda 11: o chip «sua» acompanha o campo
  else if (d.plRen != null){ S.pl.ren[d.plRen] = e.target.value.trim(); render(true); toast(AVISO_GRAVA + ': o item é renomeado no plano. Neste mockup só muda nesta página.'); }
  else if (d.plMov != null){ S.pl.mov[d.plMov] = e.target.value; render(true); toast(AVISO_GRAVA + ': o item muda de grupo no plano. Neste mockup só muda nesta página.'); }
  else if (d.lvCol != null || d.lvFv != null || d.lvIn != null || d.lvMap != null || d.lvForcar != null || d.lvSortc != null || d.lvSortd != null || d.lvFcol != null){ lvChange(e.target, d); }   // onda 12
});
function refoco(sel, pos){ const el = document.querySelector(sel); if (el){ el.focus(); try { el.setSelectionRange(pos, pos); } catch (err) {} } }
document.addEventListener('input', e => {
  const t = e.target, d = t && t.dataset; if (!d) return;
  if (d.fut) S.fut[d.fut] = t.value;
  else if (d.orc != null){ let x = parseNum(t.value); if (x != null && x < 0 && !negCabe(d.orc)) x = null; const f_ = d.n === '2' && CAMPO[d.orc] ? fat2(d.orc) : fator(d.n); S.orc.ed[d.orc] = {raw:t.value, x:x == null ? null : x / f_}; gravarOrcLocal(); aplicarEd(); orcAtualizar({sel:'[data-orc="' + d.orc.replace(/"/g, '\\"') + '"]', pos:t.selectionStart}); }
  else if (d.taxa != null){ const x = parseNum(t.value); S.orc.taxa = x == null ? null : x / 100; S.orc.taxaRaw = t.value; gravarOrcLocal(); orcAtualizar({sel:'[data-taxa]', pos:t.selectionStart}); }
  else if (d.sim != null){ let x = parseNum(t.value); if (x != null && x < 0 && !negCabe(d.sim)) x = null; S.sim.ed[d.sim] = {raw:t.value, x:x == null ? null : x}; gravarSimLocal(); orcAtualizar({sel:'[data-sim="' + d.sim.replace(/"/g, '\\"') + '"]', pos:t.selectionStart}); }   // v9: a sobra lá em cima muda na hora, sem perder o foco
  else if (d.vg != null){ const x = parseNum(t.value), ed = S.vgEd[d.vg] = S.vgEd[d.vg] || {}; if (x == null){ delete ed[d.c]; delete ed[d.c + '_raw']; } else { ed[d.c] = x; ed[d.c + '_raw'] = t.value; } const pos = t.selectionStart, sel = '[data-vg="' + d.vg.replace(/"/g, '\\"') + '"][data-c="' + d.c + '"]'; if (emOrc()) orcRegioes(); else render(true); refoco(sel, pos); }
  else if (d.plTotal != null){ const x = parseNum(t.value); S.plan.total = x; S.plan.totalRaw = t.value; const pos = t.selectionStart; render(true); refoco('[data-pl-total]', pos); }
  else if (d.fxSaldo != null){ const x = parseNum(t.value); S.fx.saldo = x; S.fx.saldoRaw = t.value; lsSet(FX_SALDO_KEY, x); const pos = t.selectionStart; render(true); refoco('[data-fx-saldo]', pos); }
  else if (d.meta != null){ S.orc.meta = t.value; gravarOrcLocal(); const mp = $('#meta-pill'); if (mp) mp.innerHTML = metaPill7(resAtual()); }   // v10 (item 13): a mesma base do número ao lado
  else if (d.novo != null){ /* o formulário do item novo não refaz a tela a cada tecla: os valores são lidos no «Acrescentar» */ }
  else if (d.lv != null || d.lvFq != null || d.lvF != null || d.lvMapIn != null){ lvInput(t, d); }   // onda 12
});
window.addEventListener('hashchange', () => { if (location.hash === '#ajuste'){ S.fab = true; S.paN = (S.paN || 0) + 1; } render(false); window.scrollTo(0, 0); if (location.hash === '#ajuste'){ const ta = $('#pa-fab'); if (ta) ta.focus(); } });
document.documentElement.dataset.tema = 'claro';
if (OCULTO) document.documentElement.classList.add('oculto');   // v10: recarregar continua escondido
$('#tema').addEventListener('click', temaAlternar);
render(false);
window.__casa = {rotas:Object.keys(VIEWS), render, S, B7, B7_BASE, ajustarBarras, sha256Hex, oculto:() => OCULTO, aplicarEd, regioes, fmtCampo, parseNum, toast, ANO_REF, ANO_SIM};

