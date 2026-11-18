/* GERADO por pagina/tools/derivar_telas.py a partir de scripts/app/mockup.template.html (o mockup aprovado). NÃO EDITE À MÃO:
   mude a lista TROCAS do gerador e rode de novo. Parte «simulacao». */
"use strict";
/* ===================== v9 (onda 9): a aba «Orçamento» vira «Simulação {ano_sim}» =====================
   Ano: D.v9.simulacao.ano_sim (fallback: ano do livro + 1) — nada de ano escrito no código; na virada do ano a aba segue sozinha.
   Colunas: Orçado {ano_ref} (referência travada = o Painel, com o que o Tobia digitou) · Orçado {ano_sim} (campo, pré-preenchido com a referência) · Diferença.
   A resposta fica no topo e na barra fixa: sobra {ano_sim} recalculada na hora e a variação frente a {ano_ref}, com barras simples que fecham a conta (linha «Já se sabe»).
   «Já se sabe» = D.v9.simulacao.ajustes (créditos que passam, licença bienal), com a fonte no ⓘ, já marcados; sem a chave, a tela funciona sem eles; o item do bloco com o mesmo nome do ajuste fica «—» (nunca conta duas vezes).
   Ano = mensal × D.v9.simulacao.fator_ano[id] (fallback 12). Henner = −taxa × saúde orçada. Persistência por ano: casa.orcado.{ano} e casa.simulacao.{ano}; na virada, a simulação do ano que abriu vira o orçado dele. */
const FATOR9 = (SIM9 && SIM9.fator_ano && typeof SIM9.fator_ano === 'object') ? SIM9.fator_ano : {}, fatorAno = id => { const f = FATOR9[id]; return typeof f === 'number' && f > 0 ? f : 12; };   // M5: Escola × 10, Aluguel × 12; fallback 12
/* conserto e29 (achado 4): o orçado do ANO por item vem da camada (D.v9.simulacao.orcado_ano_id: digitado × meses de aula; R$ ÷ câmbio médio nos sub-blocos em R$) — sem fator agregado da matriz.
   Só quando o bloco foi editado no Painel a tela refaz a conta: mensal × fator_ano[id] no Cotidiano, anual (R$ ÷ câmbio) nos demais. Painel (sobra orçada) e Simulação (referência) leem a mesma função. */
const OAI9 = (SIM9 && SIM9.orcado_ano_id && typeof SIM9.orcado_ano_id === 'object') ? SIM9.orcado_ano_id : null;
const PADRAO9_PREMISSA = (SIM9 && SIM9.padrao_sim_origem) ? 'premissa a confirmar: ' + String(SIM9.padrao_sim_origem).replace(/\s*TRAB\/.*$/, '').trim() : '';   // onda 12 (G1): o texto da premissa, para o chip do topo e o selo da linha
const PADRAO9 = (SIM9 && SIM9.padrao_sim && typeof SIM9.padrao_sim === 'object') ? SIM9.padrao_sim : {}, PADRAO9_ORIGEM = (SIM9 && SIM9.padrao_sim_origem) ? String(SIM9.padrao_sim_origem).replace(/\s*\(.*\)\s*$/, '').replace(/\s*TRAB\/.*$/, '').trim() : '';   // só o nome humano da fonte, sem caminho de arquivo   // v10: padrão de 2027 vindo do parecer fiscal (imposto e créditos)
const orcAnoDe = (n, nd, cur) => {
  if (OAI9 && OAI9[nd.id] != null && !blocoEditado(n)) return OAI9[nd.id];
  if (nd.planejado == null) return 0;
  if (n === '2') return nd.planejado * fatorAno(nd.id);
  return (nd.moeda || cur) === 'BRL' ? nd.planejado / CAM : nd.planejado;
};
const orcAnoBloco = n => { const b = B7[n]; if (!b) return 0; let t = 0; const w = (g, cur) => { const c = g.moeda || cur; if (g.grupos && g.grupos.length) g.grupos.forEach(h => w(h, c)); else if (g.orcado_no_pai || !(g.itens && g.itens.length)) t += orcAnoDe(n, g, c); else g.itens.forEach(i => { t += orcAnoDe(n, i, c); }); }; (b.grupos || []).forEach(g => w(g, b.moeda_tabela || 'EUR')); return t; };
/* conserto e29 (item 6): Atividades de férias — os meses vêm de D.v9.simulacao.atividades_ferias; o texto do ⓘ nasce deles (nada escrito no código) */
const MES_ABR = {'01':'jan', '02':'fev', '03':'mar', '04':'abr', '05':'mai', '06':'jun', '07':'jul', '08':'ago', '09':'set', '10':'out', '11':'nov', '12':'dez'};
const feriasNota = nd => { const F = SIM9 && SIM9.atividades_ferias; if (!F || !nd || !/f[ée]rias/i.test(nd.nome || '') || !/^2\./.test(String(nd.id || ''))) return ''; const ms = (F.meses || []).map(m => MES_ABR[m] || m), mo = (F.meses_orcado || []).map(m => MES_ABR[m] || m), f = F.fator || fatorAno(nd.id), lista = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1] : a.join(''); return '<b>Atividades de férias:</b> pode haver em ' + lista(ms) + (ms.indexOf('dez') >= 0 ? ' (dezembro é férias no Brasil)' : '') + '. O orçado conta só ' + lista(mo) + ': o ano = mensal × ' + fmt(f, 0) + ' meses, aqui e na Simulação.'; };
/* conserto e29 (P1-3): texto da camada que chega ao casal passa por aqui — sem código de decisão, sem nome de arquivo ou versão, sem chave sem acento, sem «o Tobia digita» (a Ge também lê) */
const humano = t => semCodigo(t).replace(/\(valor assinado na v\d\)/g, '(valor que você assinou)').replace(/recebido \+ a receber com o orçado/g, 'só o que entrou com o orçado').replace(/compara recebido \+ a receber/gi, 'compara só o que entrou').replace(/\bno plano\b/g, 'no orçado').replace(/\blista no RET[O]RNO\b/g, 'lista com a equipe').replace(/\bRET[O]RNO\b/g, 'relatório da equipe').replace(/\bv\d\b/g, '').replace(/\bOr[c]amento\b/g, 'Orçamento').replace(/\bSa[u]de\b/g, 'Saúde').replace(/\bo Tobia digita\b/g, 'você digita').replace(/\bem 5\.4\b/g, 'em Projetos · tratamento de saúde').replace(/\bmédia de 12 meses\b(?=[^.]*farm)/gi, 'valor que você assinou').replace(/\bfaltam extr[a]tos\b/g, 'sem extrato').replace(/\blistados em fora_do_saiu\b/g, 'listados abaixo').replace(/\bfora_do_saiu\b/g, 'fora do «saiu»').replace(/\s{2,}/g, ' ').replace(/\s+,/g, ',').trim();
const semCodigo = t => String(t == null ? '' : t).replace(/`([^`]*)`/g, '$1').replace(/\b[a-z]+(?:_[a-z0-9]+)+\b/g, s => s.replace(/_/g, ' ')).replace(/\bD\d{2,3}\s*[:·—-]\s*/g, '').replace(/\s*\(D\d{2,3}\)/g, '').trim();   // P1-6: código interno de decisão não aparece na tela
const fonteHumana = t => { const f = semCodigo(t); return !f || /^D\.v\d|^[A-Za-z_]+\.(json|py)\b|›/.test(f) ? '' : f; };   // caminho de arquivo ou de chave não é fonte para quem lê
/* ajustes conhecidos do ano seguinte: lista {id, nome, valor_eur, regra, fonte, bloco?, tipo?, periodicidade?}. Sem D.v9, cai na estrutura `simulacao_2027` da v8 */
const AJ9 = (() => {
  const norm = a => Object.assign({}, a, {id:String(a.id || a.nome), nome:semCodigo(a.nome || a.rotulo || String(a.id)), valor_eur:a.valor_eur != null ? a.valor_eur : (a.valor != null ? a.valor : null), regra:semCodigo(a.regra || ''), fonte:fonteHumana(a.fonte || a.origem || a.nota || '')});
  if (SIM9 && Array.isArray(SIM9.ajustes)) return SIM9.ajustes.map(norm);
  const s8 = V7.simulacao_2027; if (!s8 || s8.ano !== ANO_SIM) return [];
  const L = ((s8.creditos_gerados_no_ano || {}).itens || []).map(c => ({id:String(c.id), nome:c.nome, valor_eur:c.valor_eur, fonte:c.origem || '', tipo:'entrada', regra:'crédito de imposto gerado em ' + ANO_REF + ' que só entra em ' + ANO_SIM}));
  if (s8.licenca_bienal && s8.licenca_bienal.ano === ANO_SIM) L.push({id:'licenca_bienal', nome:'Licença bienal', valor_eur:s8.licenca_bienal.valor_eur, fonte:s8.licenca_bienal.nota || '', tipo:'entrada', regra:'a cada 2 anos'});
  return L.map(norm);
})();
const AJ_ENT = a => a.tipo === 'entrada' || a.efeito === 'entrada' || (a.tipo !== 'saida' && a.efeito !== 'saida' && a.valor_eur != null);   // sem tipo: valor conhecido = entra/abate (crédito, licença); valor vazio = gasto que o Tobia digita
const nomeKey = t => String(t || '').toLowerCase().replace(/\s+/g, ' ').trim();
const AJ_NOMES = new Set(AJ9.map(a => nomeKey(a.nome)));
const ajCobre = nd => AJ_NOMES.has(nomeKey(nd.nome)) || (nd.registro_bienal && AJ9.some(a => /licen/i.test(a.id) || /licen/i.test(a.nome)));   // M4: o item do bloco que o ajuste já traz fica «—»
/* ---- guardado por ano (G4): casa.orcado.{ano_ref} e casa.simulacao.{ano_sim}; o legado sem ano migra; na virada, a simulação feita para o ano que abriu vira o orçado dele ---- */
const temSim = () => Object.keys(S.sim.ed).length > 0 || S.sim.novos.length > 0 || Object.keys(S.sim.aj).length > 0;
const simX = id => { const e = S.sim.ed[id]; return e && e.x != null && isFinite(e.x) ? e.x : undefined; };
function lerSimLocal(){ try { const s = lsGet(SIM_KEY); if (!s || typeof s !== 'object' || s.ano !== ANO_SIM) return;
  Object.keys(s.ed || {}).forEach(id => { const x = s.ed[id]; if (typeof x === 'number' && isFinite(x)) S.sim.ed[id] = {raw:fmtCampo(x), x, guardado:true}; });
  if (Array.isArray(s.novos)) S.sim.novos = s.novos.filter(v => v && typeof v.nome === 'string').map((v, i) => ({id:'novo|' + (i + 1), n:String(v.n || '2'), nome:v.nome.slice(0, 60), x:isFinite(+v.x) ? +v.x : 0, ini:Math.min(12, Math.max(1, +v.ini || 1))}));
  S.sim.seq = S.sim.novos.length; if (s.aj && typeof s.aj === 'object') Object.keys(s.aj).forEach(k => { if (s.aj[k] === false) S.sim.aj[k] = false; }); } catch (e) {} }
function gravarSimLocal(){ const ed = {}; Object.keys(S.sim.ed).forEach(id => { const e = S.sim.ed[id]; if (e && e.x != null && isFinite(e.x)) ed[id] = e.x; });
  lsSet(SIM_KEY, temSim() ? {ano:ANO_SIM, ed, novos:S.sim.novos.map(v => ({n:v.n, nome:v.nome, x:v.x, ini:v.ini})), aj:S.sim.aj} : null); }
function apagarSimLocal(){ lsSet(SIM_KEY, null); }
lerSimLocal();
const MESES_LONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
/* motor: anda nos blocos do Painel (B7, já com o orçado digitado) e produz, nó a nó, referência × simulação, na unidade do campo (refU/simU) e no ano em € (refA/simA).
   Bloco 2: total mensal = soma dos mensais (como o Painel); ano = Σ mensal × fator do item; item novo «a partir de novembro» = mensal × meses que restam. */
function simCalc(){
  const out = {blocos:{}}, taxaH = henTaxa();
  const leaf = (n, nd, cur) => {
    const ent = n === '1'; let kind, ref;
    if (ent){ if (nd.orcado_nativo){ kind = nd.planejado_mes != null ? 'ent_brl_mes' : 'ent_brl_ano'; ref = nd.orcado_nativo.valor; } else if (nd.planejado_mes != null){ kind = 'ent_mes'; ref = nd.planejado_mes; } else if (nd.registro_bienal){ kind = 'bienal'; ref = null; } else { kind = 'ent_ano'; ref = nd.planejado; } }
    else if (n === '2'){ kind = 'mes'; ref = nd.planejado; }
    else { kind = cur === 'BRL' ? 'ano_brl' : 'ano'; ref = nd.planejado; }
    const henner = n === '2' && nd.editavel === false && /henner/i.test(nd.nome || ''), fixo = n === '2' && (nd.editavel === false || (nd.orcado_origem && nd.editavel !== true));   // farmácia por regra segue a referência; Henner é fórmula (recalculada abaixo)
    const fator = kind === 'mes' ? fatorAno(nd.id) : 1;
    let def = ref, nota = '', cobre = ajCobre(nd), pad = PADRAO9[nd.id] || null, rotSim = null;
    if (cobre){ def = null; nota = 'entra pelo bloco «Já se sabe»'; }
    else if (pad && pad.valor_eur != null){ def = pad.valor_eur; rotSim = pad.rotulo || null; }   // v10: D.v9.simulacao.padrao_sim entra no lugar do orçado de 2026 na coluna de 2027 (sinal: despesa +, crédito −); o digitado vale por cima; o rótulo muda só em 2027
    else if (kind === 'bienal'){ const rb = nd.registro_bienal || {}; if ((rb.anos || []).indexOf(ANO_SIM) >= 0){ def = rb.valor; nota = 'a cada 2 anos · entra em ' + ANO_SIM; } else nota = 'não entra em ' + ANO_SIM; }
    const campo = !fixo && !cobre && !(kind === 'bienal' && def == null), x = campo ? simX(nd.id) : undefined, sim = x !== undefined ? x : def;
    const refA = cobre ? 0 : ent ? (nd.planejado || 0) : orcAnoDe(n, nd, cur);   // e29 (achado 4): a referência anual é o orçado do ano da camada (orcado_ano_id), não mensal × fator
    const anual = v => v == null ? 0 : kind === 'ent_brl_mes' ? v / CAM * 12 : (kind === 'ent_brl_ano' || kind === 'ano_brl') ? v / CAM : kind === 'ent_mes' ? v * 12 : kind === 'mes' ? v * fator : v;
    const simA = x !== undefined ? anual(x) : (kind === 'bienal' || cobre || (pad && pad.valor_eur != null) ? anual(def) : refA);   // conserto: o padrão do parecer entra no anual (totais · sobra · meta) com o mesmo valor da linha
    const un = kind === 'ent_brl_mes' ? 'R$/mês' : kind === 'ent_brl_ano' ? 'R$/ano' : kind === 'ent_mes' ? '€/mês × 12' : kind === 'mes' ? (henner ? 'por fórmula' : fixo ? 'por regra' : fator !== 12 ? '× ' + fmt(fator, 0) + ' meses' : '') : kind === 'bienal' ? 'por ocorrência' : kind === 'ano_brl' ? 'R$/ano' : '';
    return {id:nd.id, nome:nd.nome, rotSim, pad:!!pad, kind, refU:cobre ? null : ref, simU:sim, refA, simA, cur:kind.indexOf('brl') >= 0 ? 'BRL' : 'EUR', campo, fixo, henner, fator, seu:x !== undefined, un, nota, pop:(feriasNota(nd) ? feriasNota(nd) + ' ' : '') + esc(humano(nd['nota_ⓘ'] || '')), popHtml:true};
  };
  ['1', '2', '3', '4', '5'].forEach(n => { const b = B7[n]; if (!b) return; const cur0 = b.moeda_tabela || 'EUR', mes = n === '2';
    const agreg = (fs, gcur, nome, id, popTxt) => ({id, nome, cur:gcur, filhos:fs, refA:sum(fs.map(f => f.refA)), simA:sum(fs.map(f => f.simA)), refU:n === '1' ? sum(fs.map(f => f.refA)) : sum(fs.map(f => f.refU || 0)), simU:n === '1' ? sum(fs.map(f => f.simA)) : sum(fs.map(f => f.simU || 0)), un:n === '1' ? '€/ano' : '', pop:popTxt || ''});
    const grupo = (g, cur) => { const gcur = g.moeda || cur, noPai = !!g.orcado_no_pai;
      if (g.grupos && g.grupos.length) return agreg(g.grupos.map(h => grupo(h, gcur)), gcur, g.nome, g.id, g['nota_ⓘ']);
      if (noPai){ const l = leaf(n, g, gcur); l.nome = g.nome; l.grupo = true; l.pop = g['nota_ⓘ'] || ''; return l; }
      const fs = (g.itens || []).map(i => leaf(n, i, gcur));
      const hen = fs.find(f => f.henner); if (hen){ const outros = fs.filter(f => f !== hen), dBase = sum(outros.map(f => (f.simU || 0) - (f.refU || 0))); hen.simU = (hen.refU || 0) - taxaH * dBase; hen.simA = hen.refA + (hen.simU - (hen.refU || 0)) * hen.fator; hen.seu = false; }   // M6: o reembolso acompanha a saúde simulada (−taxa × o que mudou, a partir do número do gerador)
      return agreg(fs, gcur, g.nome, g.id, g['nota_ⓘ']); };
    const gs = (b.grupos || []).map(g => grupo(g, cur0));
    const novos = S.sim.novos.filter(v => v.n === n).map(v => ({id:v.id, nome:v.nome, novo:true, x:v.x, ini:v.ini, un:mes ? '€/mês' : '€/ano', cur:'EUR', refU:null, simU:v.x, refA:0, simA:mes ? v.x * (13 - v.ini) : v.x, meses:mes ? 13 - v.ini : null}));
    const ajB = AJ9.filter(a => a.bloco != null && String(a.bloco) === n).map(a => { const x = simX('aj|' + a.id), v = x !== undefined ? x : a.valor_eur, m = a.periodicidade === 'mes' || /m[êe]s/i.test(a.periodicidade || '') || mes; return {id:'aj|' + a.id, nome:a.nome, aj:true, fonte:a.fonte, regra:a.regra, un:m ? '€/mês' : '€/ano', cur:'EUR', refU:null, simU:v, refA:0, simA:v == null ? 0 : (m ? v * 12 : v), seu:x !== undefined, campo:true}; });
    const refA = sum(gs.map(g => g.refA)), simA = sum(gs.map(g => g.simA)) + sum(novos.map(v => v.simA)) + sum(ajB.map(a => a.simA));
    const refU = mes ? sum(gs.map(g => g.refU)) : refA, simU = mes ? sum(gs.map(g => g.simU)) + sum(novos.map(v => v.simU || 0)) + sum(ajB.map(a => a.simU || 0)) : simA;
    out.blocos[n] = {id:n, nome:b.nome, mes, grupos:gs, novos, ajB, refA, simA, refU, simU}; });
  const livres = AJ9.filter(a => a.bloco == null).map(a => { const on = S.sim.aj[a.id] !== false, x = simX('aj|' + a.id), v = x !== undefined ? x : a.valor_eur, ent = AJ_ENT(a); return {id:a.id, nome:a.nome, fonte:a.fonte, regra:a.regra, on, v, ent, seu:x !== undefined, efeito:on && v != null ? (ent ? v : -v) : 0}; });
  const B = out.blocos, ent = B['1'] ? B['1'].simA : 0, entR = B['1'] ? B['1'].refA : 0, s = k => B[k] ? B[k].simA : 0, r = k => B[k] ? B[k].refA : 0;
  const ajA = sum(livres.map(a => a.efeito)), ajEnt = sum(livres.map(a => a.ent && a.efeito > 0 ? a.efeito : 0));
  out.livres = livres; out.ajA = ajA; out.ref = {ent:entR, b2:r('2'), b3:r('3'), b4:r('4'), b5:r('5')}; out.ref.sai = out.ref.b2 + out.ref.b3 + out.ref.b4 + out.ref.b5; out.ref.sob = entR - out.ref.sai;
  out.sim = {ent, b2:s('2'), b3:s('3'), b4:s('4'), b5:s('5')}; out.sim.sai = out.sim.b2 + out.sim.b3 + out.sim.b4 + out.sim.b5; out.sim.sob = ent - out.sim.sai + ajA;
  out.sim.entTot = ent + ajEnt; out.sim.pct = out.sim.entTot ? out.sim.sob / out.sim.entTot * 100 : null; out.ref.pct = entR ? out.ref.sob / entR * 100 : null;   // % das entradas conta os ajustes que são entrada
  const PJ = JAN8 && JAN8.projetado ? janelaV('projetado') : null; out.ritmo = PJ ? {sobra:PJ.sobra, sem:PJ.sobra_sem_a_receber} : null;   // P1-1b: o ano de referência no ritmo atual
  return out;
}
/* diferença {ano_sim} − {ano_ref}: + é a mais, − é a menos; a cor diz se é bom (receita que sobe, gasto que cai = verde); igual = célula vazia (P2-3) */
function difPil(d, receita, cur, o){
  o = o || {}; if (d == null) return VDASH; const z = Math.abs(d) < 0.5; if (z) return o.igual ? '<span class="pil c neu">igual</span>' : '';
  const cls = (receita ? d > 0 : d < 0) ? 'verde' : 'verm', txt = (d < 0 ? '−' : '+') + money(Math.abs(d), cur || 'EUR') + (o.palavra ? (d > 0 ? ' · a mais' : ' · a menos') : '');
  return '<span class="pil c ' + cls + '" title="' + esc(ANO_SIM + ' − ' + ANO_REF + (d > 0 ? ': a mais em ' + ANO_SIM : ': a menos em ' + ANO_SIM)) + '">' + txt + '</span>';
}
const campoSim = (id, v, rot, seu) => { const e = S.sim.ed[id], inv = !!(e && e.x == null && String(e.raw || '').trim()); return '<span class="campo-w' + (seu ? ' seu' : '') + '"' + (seu ? ' title="seu valor: vale enquanto esta página estiver aberta"' : '') + '><input class="inp' + (seu ? ' seu' : '') + (inv ? ' inv' : '') + '" type="text" inputmode="decimal" data-sim="' + esc(id) + '" value="' + esc(e ? e.raw : fmtCampo(v)) + '" placeholder="—" aria-label="' + esc(rot + ' em ' + ANO_SIM + (seu ? ' (seu valor)' : '')) + '"' + (inv ? ' aria-invalid="true"' : '') + '>' + (inv ? '<span class="erro" role="alert">não entendi este número · escreva como 1.250 ou 16 mil</span>' : '') + '</span>'; };
/* o mesmo componente de bloco (cabeçalho, barra «Abrir tudo», linhas), com 3 colunas; grupos recolhidos por padrão (pedido do brief) */
function tabelaSim(n, sb){
  const ent = n === '1', cur = ent ? 'EUR' : (B7[n].moeda_tabela || 'EUR'), unB = sb.mes ? '€/mês' : '€/ano';
  const cols = [{rot:'Orçado ' + ANO_REF, sub:ent ? 'como no Painel' : unB}, {rot:'Orçado ' + ANO_SIM, sub:ent ? 'o campo diz a unidade' : unB}, {rot:'Diferença', l:'Diferença', sub:ANO_SIM + ' − ' + ANO_REF}];
  const vU = (v, c) => v == null ? VDASH : money(v, c || 'EUR');
  const no = (f, nivel) => {
    const ref = '<span class="ref">' + vU(f.refU, f.cur) + '</span>';
    const sim = f.filhos ? vU(f.simU, f.cur) : f.campo === false || f.fixo || (f.campo == null && !f.novo) ? vU(f.simU, f.cur) + (f.nota ? '<span class="apoio">' + esc(f.nota) + '</span>' : '') : campoSim(f.id, f.simU, f.nome, f.seu) + (f.nota ? '<span class="apoio">' + esc(f.nota) + '</span>' : '') + (f.novo && f.meses && f.meses < 12 ? '<span class="apoio">' + f.meses + ' ' + (f.meses === 1 ? 'mês' : 'meses') + ' = ' + money(f.simA, 'EUR') + ' no ano</span>' : '');   // P1-4: o item com mês de início diz o que soma no ano
    const d = f.filhos ? f.simU - f.refU : (f.simU == null ? null : f.simU - (f.refU || 0));
    const padTxt = f.pad ? '<b>Premissa a confirmar:</b> ' + money(PADRAO9[f.id].valor_eur, 'EUR') + ' em ' + ANO_SIM + (f.rotSim ? ' («' + esc(f.rotSim) + '»)' : '') + ' no lugar do orçado de ' + ANO_REF + ' (' + money(f.refU, 'EUR') + '). Não foi confirmada por documento: é a sua decisão de orçar assim. O que você digitar vale por cima.' + (PADRAO9_ORIGEM ? '<br>De onde vem: ' + esc(PADRAO9_ORIGEM) : '') : '';   // onda 12 (crítica G1): a Simulação não dá o crédito como certo
    const popH = f.aj ? pop('<b>Já se sabe de ' + ANO_SIM + ':</b> ' + esc(f.regra || '') + (f.fonte ? '<br>Fonte: ' + esc(f.fonte) : ''), 'de onde vem', 'peq') : (f.pop || padTxt) ? pop((f.popHtml ? f.pop : esc(f.pop || '')) + (padTxt ? (f.pop ? '<br><br>' : '') + padTxt : ''), 'sobre ' + f.nome, 'peq') : '';
    const etq = f.pad && !f.novo ? '<span class="etq pad" title="' + esc(PADRAO9_PREMISSA || 'premissa de 07/11, não confirmada por documento') + '">premissa · a confirmar</span>' : f.novo ? '<span class="etq">seu item' + (f.ini > 1 ? ' · a partir de ' + MESES_LONGO[f.ini - 1] : '') + '</span><button class="btn link peq" type="button" data-act="sim-rm" data-k="' + esc(f.id) + '" data-n="' + n + '" aria-label="tirar ' + esc(f.nome) + '">tirar</button>' : f.aj ? '<span class="etq">já se sabe</span>' : '';
    return {id:f.id, nome:f.rotSim && !f.seu ? f.rotSim : f.nome, un:f.un ? esc(f.un) : '', cells:[ref, sim, difPil(d, ent, f.cur, {palavra:nivel === 0})], pop:popH, etq, cls:f.novo ? 'novo' : f.aj ? 'aj' : '', palavra:nivel === 0, filhos:f.filhos ? f.filhos.map(h => no(h, nivel + 1)) : null};   // v10: o rótulo do padrão muda só em 2027
  };
  const nos = sb.grupos.map(g => no(g, 0)).concat(sb.ajB.map(a => no(a, 0))).concat(sb.novos.map(v => no(v, 0)));
  const dA = sb.simA - sb.refA;
  const tot = {rot:'Total' + (sb.mes ? '<span class="apoio">no ano: ' + money(sb.refA, 'EUR') + ' → ' + money(sb.simA, 'EUR') + '</span>' : ''), cells:[vU(sb.refU), vU(sb.simU), difPil(sb.simU - sb.refU, ent, 'EUR', {palavra:true}) + (sb.mes && Math.abs(dA) >= 0.5 ? '<span class="apoio">' + (dA < 0 ? '−' : '+') + money(Math.abs(dA), 'EUR') + ' no ano</span>' : '')]};
  return tabela7({chave:'sim7-' + n, cls:'c3s', cur, cols, nos, aberto:false, total:tot});
}
/* acrescentar item num bloco: nome + valor (+ mês de início, «babá a partir de novembro»); sem valor sugerido — o Tobia digita. `n = 'topo'` = formulário do cabeçalho, com a escolha do bloco (P1-9) */
function novoForm(n, sb){
  const topo = n === 'topo';
  if (S.sim.add !== n) return topo ? '' : '<div class="sim-add"><button class="btn link peq" type="button" data-act="sim-add" data-v="' + n + '">+ Acrescentar item em ' + ANO_SIM + '</button></div>';
  const bl = topo ? (S.sim.addBl || '2') : n, mes = bl === '2', un = mes ? '€/mês' : '€/ano', opts = MESES_LONGO.map((m, i) => '<option value="' + (i + 1) + '">' + (i === 0 ? 'o ano todo' : 'a partir de ' + m) + '</option>').join('');
  const selBl = topo ? '<label class="campo bl"><span>Em qual bloco</span><select class="inp sel" data-novo="bl" data-act-change="sim-add-bl">' + ['1', '2', '3', '4', '5'].map(k => '<option value="' + k + '"' + (k === bl ? ' selected' : '') + '>' + k + ' · ' + esc(NOME[k]) + '</option>').join('') + '</select></label>' : '';
  return '<form class="sim-form' + (topo ? ' topo-f' : '') + '" data-n="' + n + '" aria-label="Item novo em ' + (topo ? ANO_SIM : esc(NOME[n])) + '">' + selBl + '<label class="campo"><span>Nome</span><input class="inp txt" type="text" data-novo="nome" maxlength="60" placeholder="ex.: babá" autocomplete="off"></label>' +
    '<label class="campo"><span>Valor <small>' + un + '</small></span><input class="inp" type="text" inputmode="decimal" data-novo="x" placeholder="—"></label>' +
    (mes ? '<label class="campo"><span>Quando</span><select class="inp sel" data-novo="ini">' + opts + '</select></label>' : '') +
    '<span class="sim-form-b"><button class="btn peq prim" type="submit" data-act="sim-add-ok" data-v="' + bl + '">Acrescentar</button><button class="btn peq link" type="button" data-act="sim-add-cancel" data-v="' + n + '">Cancelar</button></span></form>';
}
const NOTA_SIM = n => '<b>Simulação ' + ANO_SIM + ':</b> a coluna da esquerda é o orçado de ' + ANO_REF + ' como está no Painel (com o que você digitou); a da direita começa igual e é a que você mexe aqui. Diferença = ' + ANO_SIM + ' − ' + ANO_REF + '. Nada aqui muda o orçado de ' + ANO_REF + '; o que você digita vale enquanto esta página estiver aberta e entra em «Baixar meus números» (o servidor ainda não guarda a simulação).' + (n === '2' ? ' Valores por mês; o ano = mensal × os meses de cada item (ao lado do nome quando não são 12' + (() => { const d = Object.keys(FATOR9).filter(k => FATOR9[k] !== 12).map(k => k.split('|').pop().toLowerCase() + ' ' + fmt(FATOR9[k], 0)); return d.length ? ': ' + d.join(', ') : ''; })() + '). A coluna de referência é o orçado do ano como o Painel o soma. Farmácia segue o valor que você assinou e o Reembolso Henner acompanha o gasto de saúde (−taxa × saúde), aqui e no Painel.' : n === '1' ? ' Salários por mês (o do Tobia em R$, pelo câmbio médio); 13º em R$ por ano; a licença bienal entra pelo bloco «Já se sabe» (crédito de imposto já está no bloco 4 como padrão do parecer fiscal).' : n === '3' ? ' Férias: mexa no orçado de cada sub-bloco e a sobra muda na hora; os cenários de verão moram no planejador da aba Viagens.' : ' Valores por ano. O que o bloco «Já se sabe» já traz fica «—» aqui, para não contar duas vezes.');
function blocoSim(n, SC){
  const sb = SC.blocos[n], b = B7[n], on = ehAb('sim', n), ent = n === '1', unT = sb.mes ? '/mês' : '/ano';
  const direita = '<b data-conf="sim-b' + n + '-tot">' + money(sb.simU, 'EUR') + '<small>' + unT + '</small></b>' + difPil(sb.simU - sb.refU, ent, 'EUR', {palavra:true});
  const titulo = esc(b.nome) + ' <span class="per">' + ANO_SIM + '</span>';
  const ferias = n === '3' ? '<div class="sim-ferias"><span>Férias: ao reduzir um sub-bloco a sobra muda na hora (na barra do topo). Cenários de verão: <a href="#viagens">planejador em Viagens</a>.</span>' + (S.plan.guardadoEm && S.plan.total != null ? '<span class="apoio">proposta guardada do verão: <b>' + money(S.plan.total, 'EUR') + '</b></span><button class="btn link peq" type="button" data-act="sim-usar-plan" data-v="3.2">usar em 3.2</button>' : '') + '</div>' : '';
  const corpo = on ? '<div class="bloco-corpo" id="sim-corpo-' + n + '">' + ferias + tabelaSim(n, sb) + novoForm(n, sb) + '</div>' : '';
  return '<section class="bloco b7" id="orc-bloco-' + n + '" style="' + blVars(n) + '" aria-label="Bloco ' + n + ' · ' + esc(b.nome) + ' · simulação ' + ANO_SIM + '">' + cabTog('sim', n, titulo, direita, pop(NOTA_SIM(n), 'como simular este bloco')) + corpo + '</section>';
}
/* «Já se sabe de {ano_sim}»: créditos que passam de ano, licença bienal e o que mais a camada de dados trouxer, já marcados, com a fonte no ⓘ; desmarcar tira da sobra */
function blocoAjustes(SC){
  const L = SC.livres; if (!L.length) return '';
  const rows = L.map(a => '<div class="aj-r' + (a.on ? '' : ' off') + '"><label class="aj-c"><input type="checkbox" data-sim-aj="' + esc(a.id) + '"' + (a.on ? ' checked' : '') + ' aria-label="contar ' + esc(a.nome) + ' na sobra de ' + ANO_SIM + '"></label><span class="aj-n"><b><span class="nw">' + esc(a.nome) + ' ' + pop('<b>' + esc(a.nome) + '</b> · ' + esc(a.regra || 'já se sabe de ' + ANO_SIM) + (a.fonte ? '<br>Fonte: ' + esc(a.fonte) : ''), 'de onde vem ' + a.nome, 'peq') + '</span></b><span class="apoio">' + esc(a.regra || '') + '</span></span><span class="aj-v">' + (a.v == null || a.seu ? campoSim('aj|' + a.id, a.v, a.nome, a.seu) : '<b class="' + (a.ent ? 'sobra' : 'saida') + '">' + (a.ent ? '+' : '−') + money(Math.abs(a.v), 'EUR') + '</b>') + '<span class="apoio">' + (a.ent ? 'entra em ' : 'sai em ') + ANO_SIM + '</span></span></div>').join('');
  return '<section class="bloco b7" id="orc-bloco-aj" style="--c:var(--txt-2);--ct:var(--txt-1);--cs:var(--sup-2);--ctx:var(--sup)" aria-label="Já se sabe de ' + ANO_SIM + '"><div class="bloco-cab"><h2><span class="nb">✓</span>Já se sabe de ' + ANO_SIM + pop('O que a leitura do livro já sabe do ano seguinte: crédito de imposto gerado em ' + ANO_REF + ' que só cai em ' + ANO_SIM + ', licença bienal, e o que mais a camada de dados trouxer, cada um com a fonte. Marcado = conta na sobra de ' + ANO_SIM + ' (e aparece na linha «Já se sabe» das barras). Valor vazio = você digita.', 'o que é isto') + '</h2><div class="tot"><b class="' + (SC.ajA >= 0 ? 'sobra' : 'saida') + '">' + (SC.ajA < 0 ? '−' : '+') + money(Math.abs(SC.ajA), 'EUR') + '</b><span class="apoio">na sobra de ' + ANO_SIM + '</span></div></div><div class="bloco-corpo"><div class="aj-l">' + rows + '</div></div></section>';
}
const sobraTxt = v => (v < 0 ? '−' : '+') + money(Math.abs(v), 'EUR');
/* a resposta, no topo: sobra {ano_sim} e quanto muda frente a {ano_ref}; barras simples (referência em cinza, simulação na cor do bloco) que fecham a conta com a linha «Já se sabe» (P1-3) */
function simTopo(SC){
  const R = SC.ref, X = SC.sim, d = X.sob - R.sob, pos = X.sob >= -0.5;
  const linhas = [['1', '1 · Entradas', R.ent, X.ent, COR['1']], ['2', '2 · Cotidiano França', R.b2, X.b2, COR['2']], ['3', '3 · Viagens', R.b3, X.b3, COR['3']], ['4', '4 · Outras saídas', R.b4, X.b4, COR['4']], ['5', '5 · Projetos', R.b5, X.b5, COR['5']]];
  if (SC.livres.length) linhas.push(['aj', 'Já se sabe', 0, SC.ajA, 'var(--txt-2)']);
  linhas.push(['6', pos ? 'Sobra' : 'Falta', R.sob, X.sob, pos ? COR.sobra : COR.neg]);
  const mx = Math.max(1, ...linhas.map(l => Math.max(Math.abs(l[2]), Math.abs(l[3])))), w = v => (Math.abs(v) / mx * 100).toFixed(1) + '%';
  const bars = linhas.map(l => { const dd = l[3] - l[2], res = l[0] === '6', entr = l[0] === '1' || l[0] === 'aj' || res; return '<div class="sb-r"><span class="sb-n">' + l[1] + '</span><span class="sb-b" role="img" aria-label="' + esc(l[1] + ': ' + ANO_REF + ' ' + money(l[2], 'EUR') + ' · ' + ANO_SIM + ' ' + money(l[3], 'EUR')) + '"><i class="ref" style="width:' + w(l[2]) + '"></i><i class="sim" style="width:' + w(l[3]) + ';background:' + (res ? (l[3] >= -0.5 ? COR.sobra : COR.neg) : l[0] === 'aj' && l[3] < 0 ? COR.neg : l[4]) + '"></i></span><span class="sb-v"><span class="ref">' + (res || l[0] === 'aj' ? sobraTxt(l[2]) : money(l[2], 'EUR')) + '</span><b' + (res ? ' class="' + (l[3] >= -0.5 ? 'sobra' : 'saida') + '"' : '') + '>' + (res || l[0] === 'aj' ? sobraTxt(l[3]) : money(l[3], 'EUR')) + '</b>' + difPil(dd, entr, 'EUR') + '</span></div>'; }).join('');
  const metaP = metaPill7({poupanca_pct:X.pct, entradas:X.entTot, sobra:X.sob, periodo:'simulação ' + ANO_SIM});   // v10 (item 13): a mesma regra e o valor nominal, na mesma base do «% das entradas» ao lado
  const ritmo = SC.ritmo ? numRot(ANO_REF + ' no ritmo atual', SC.ritmo.sobra, 'sim-ritmo').replace(/<\/div>$/, '<span class="apoio" title="o que o Painel projeta para ' + ANO_REF + ' até 31/12, com o a receber">projetado · ' + (SC.ritmo.sem != null ? 'sem o a receber ' + sobraTxt(SC.ritmo.sem) : 'contando o a receber') + '</span></div>') : '';   // P1-1b: o ano de referência no ritmo atual, não só orçado contra orçado
  const res2 = '<div class="res-2n">' + numRot('sobra orçada ' + ANO_REF, R.sob, 'sim-sobra-ref') + ritmo + '<div class="rn"><span class="k">% das entradas · ' + ANO_SIM + '</span><b class="' + (X.pct == null || X.pct >= 0 ? 'sobra' : 'saida') + '">' + (X.pct == null ? 'N/D' : pct(X.pct, 1)) + '</b>' + metaP + '</div></div>';
  return '<section class="bloco b7 res sim-res" id="orc-bloco-6" style="' + blVars('6') + '" aria-label="' + (pos ? 'Sobra' : 'Falta') + ' simulada de ' + ANO_SIM + '"><div class="bloco-cab"><h2><span class="nb">6</span>' + (pos ? 'Sobra ' : 'Falta ') + ANO_SIM + ' <span class="per">simulada</span>' + pop('<b>' + (pos ? 'Sobra' : 'Falta') + ' ' + ANO_SIM + ' = entradas − blocos 2 a 5</b>, com o que você digitou nesta tela, mais a linha «Já se sabe» (hoje só a licença bienal).' + (premissaAtiva() ? ' <b>Este número depende de uma premissa não confirmada por documento</b> (' + esc(PADRAO9_PREMISSA.replace(/^premissa a confirmar: /, '')) + '): confira a linha do imposto em Outras saídas.' : '') + ' A barra cinza é o orçado de ' + ANO_REF + ' (o Painel); a colorida, a simulação. Mexa num valor abaixo e este número muda na hora, aqui e na barra do topo. «' + ANO_REF + ' no ritmo atual» é o que o Painel projeta para o ano de referência até dezembro: compare com ele antes de orçar folga.', 'como a sobra é calculada') + '</h2><div class="tot"><b class="' + (pos ? 'sobra' : 'saida') + '" data-conf="sim-res-sobra">' + sobraTxt(X.sob) + '</b>' + (Math.abs(d) >= 0.5 ? difPil(d, true, 'EUR', {palavra:false}).replace('</span>', ' vs ' + ANO_REF + '</span>') : pil('neu', 'igual a ' + ANO_REF)) + (premissaAtiva() ? pil('ambar', 'com premissa a confirmar', PADRAO9_PREMISSA) : '') + '</div></div>' +
    '<div class="bloco-corpo"><div class="sb" aria-label="Orçado ' + ANO_REF + ' × simulação ' + ANO_SIM + '"><div class="sb-leg"><span><i class="ref"></i>orçado ' + ANO_REF + '</span><span><i class="sim"></i>simulação ' + ANO_SIM + '</span></div>' + bars + '</div>' + res2 + '</div></section>';
}
const premissaAtiva = () => !!PADRAO9_PREMISSA && Object.keys(PADRAO9).some(id => !(S.sim.ed[id] && S.sim.ed[id].x != null));   // onda 12 (G1): enquanto o padrão do imposto não for digitado por cima, a sobra simulada carrega a premissa
/* o menu lateral e a faixa leem a simulação (valores de {ano_sim}, itens novos incluídos); o Resultado do menu aponta a sobra simulada */
function simBO(SC){
  const BO = {}; ['1', '2', '3', '4', '5'].forEach(n => { const sb = SC.blocos[n], b = B7[n]; if (!sb) return;
    const nos = sb.grupos.map(g => ({id:g.id, nome:g.nome, moeda:'EUR', planejado:sb.mes ? g.simU : g.simA, itens:(g.filhos || []).map(f => ({id:f.id, nome:f.nome, moeda:'EUR', planejado:sb.mes ? (f.simU || 0) : f.simA}))}));
    sb.novos.concat(sb.ajB).forEach(v => nos.push({id:'outros', nome:v.nome, moeda:'EUR', planejado:sb.mes ? (v.simU || 0) : v.simA, itens:[{id:'outros', nome:v.nome, moeda:'EUR', planejado:sb.mes ? (v.simU || 0) : v.simA}]}));   // P1-4: item novo entra na rosca (fatia «Outros»)
    BO[n] = {id:n, nome:b.nome, tipo:b.tipo, moeda_tabela:'EUR', periodo:ANO_SIM, total:{planejado:sb.simU, realizado:null}, grupos:nos}; });
  BO.res = {periodo:'simulação ' + ANO_SIM, entradas:SC.sim.ent, saidas:{b2:SC.sim.b2, b3:SC.sim.b3, b4:SC.sim.b4, b5:SC.sim.b5}, saidas_total:SC.sim.sai, sobra:SC.sim.sob, poupanca_pct:SC.sim.pct};
  return BO;
}
const simSeusPil = () => { const n = Object.keys(S.sim.ed).length + S.sim.novos.length; return n ? pil('neu seus', n === 1 ? '1 valor seu · só nesta página aberta' : n + ' valores seus · só nesta página aberta', 'o servidor ainda não guarda a simulação: ela vale enquanto esta página estiver aberta, ou até você recomeçar do orçado de ' + ANO_REF) : ''; };
const simTopoDir = () => '<button class="btn peq' + (S.sim.add === 'topo' ? ' prim' : '') + '" type="button" data-act="sim-add" data-v="topo">+ Acrescentar item</button>' + (temSim() ? '<button class="btn peq" type="button" data-act="sim-desfazer" title="apaga a simulação guardada e volta ao orçado de ' + ANO_REF + '">Recomeçar do orçado ' + ANO_REF + '</button>' : '') + simSeusPil() + pil('neu base', 'base: orçado ' + ANO_REF, 'a simulação parte do orçado de ' + ANO_REF + ' como está no Painel');   // v10 (item 7): «Baixar meus números» mora no header
function dirSim(SC){ return simTopo(SC) + blocoAjustes(SC) + barraBlocos('sim') + ['1', '2', '3', '4', '5'].map(n => SC.blocos[n] ? blocoSim(n, SC) : '').join(''); }
/* a sobra na barra fixa do topo (P1-1): na Simulação, a sobra simulada; no Painel editando, a sobra orçada e o «Concluir» — um componente só, sempre à mão */
function topoChip(){
  topoAcoes();   // v10: as ações do header seguem a tela e o estado (editando · escondido)
  const c = $('#chip-mes'), t = document.querySelector('.topo'); if (!c) return; const r = rota(); const attr = (k, v) => { if (!c.setAttribute) return; if (v == null) c.removeAttribute(k); else c.setAttribute(k, v); };
  if (r === 'orcamento'){ const SC = simCalc(), X = SC.sim, d = X.sob - SC.ref.sob; c.className = 'chip sobra-topo'; attr('aria-live', 'polite'); c.innerHTML = '<span class="k">' + (X.sob >= -0.5 ? 'sobra' : 'falta') + ' ' + ANO_SIM + '</span><b class="' + (X.sob >= -0.5 ? 'sobra' : 'saida') + '">' + sobraTxt(X.sob) + '</b>' + (Math.abs(d) >= 0.5 ? difPil(d, true, 'EUR').replace('</span>', ' vs ' + ANO_REF + '</span>') : '') + (premissaAtiva() ? mascaraHtml(pil('ambar peq', 'premissa a confirmar', PADRAO9_PREMISSA)) : ''); if (t) t.classList.add('com-sobra'); }   // conferidor e31: o title da premissa («€ 2.711») também se esconde — a barra do topo não passa pelo render
  else if (r === 'painel' && S.pn.editOrc){ const BO = blocosOrc(), sob = BO.res ? BO.res.sobra : null; c.className = 'chip sobra-topo'; attr('aria-live', 'polite'); c.innerHTML = '<span class="k">editando o orçado ' + ANO + ' · sobra orçada</span>' + (sob == null ? '<b>N/D</b>' : '<b class="' + (sob >= -0.5 ? 'sobra' : 'saida') + '">' + sobraTxt(sob) + '</b>') + '<button class="btn peq prim" type="button" data-act="pn-ed" data-conf="pn-concluir" title="trava a coluna Orçado de novo; o que você digitou fica">Concluir</button>'; if (t) t.classList.add('com-sobra'); }   // e29 (achado 2): o único «Concluir» do app
  else { c.className = 'chip neutro'; attr('aria-live', null); c.textContent = r === 'painel' ? mesSelRot() + (ehPad() ? ' · mês fechado' : ' · filtro do Painel') : ROT_MF + ' · mês fechado'; if (t) t.classList.remove('com-sobra'); }
}
function viewOrcamento(){
  if (!B7['2']) return tit('Simulação ' + ANO_SIM) + aviso('<b>Sem dados da v7.</b>', 'bad') + rodape();
  const SC = simCalc(), BO = simBO(SC);
  return tit('Simulação ' + ANO_SIM, simTopoDir()) + '<div id="orc-topo">' + novoForm('topo') + faixa7('sim', BO) + '</div><div class="orc-grid" id="orc-grid"><aside id="orc-esq" class="orc-esq">' + menu7('sim', BO) + '</aside><div id="orc-dir" class="orc-dir">' + dirSim(SC) + '</div></div>' + rodape();
}
function orcRegioes(){ const SC = simCalc(), BO = simBO(SC); const a = $('#orc-topo'), e = $('#orc-esq'), d = $('#orc-dir'), t = $('.cab-tela .dir'); if (a) a.innerHTML = novoForm('topo') + faixa7('sim', BO); if (e) e.innerHTML = menu7('sim', BO); if (d) d.innerHTML = dirSim(SC); if (t) t.innerHTML = simTopoDir(); topoChip(); posRender(); }
/* a tela certa se refaz sem perder o foco: Simulação (regiões), Painel (regiões) ou a tela inteira */
function regioes(){ const r = rota(); if (r === 'orcamento') orcRegioes(); else if (r === 'painel') pnRegioes(); else render(true); }
function simIr(v){ S.sim.bl = v; S.ab.sim = {}; orcRegioes(); focoSem(document.querySelector('[data-act="sim-bloco"][data-v="' + v + '"]')); rolarBloco('orc-bloco-' + v); }
/* ===================== 2 · ORÇAMENTO (v5: cartões por bloco em linha, menu + rosca embaixo, detalhe tingido, barras de desvio, Cotidiano editável com recálculo, planejador de viagem editável) ===================== */
const vista = n => S.orc.vista[n] || 'anual';
const fator = n => vista(n) === 'mensal' ? 1 / 12 : 1;
/* bloco 2 (v5, D55): campos editáveis do Cotidiano; Reembolso Henner = −taxa × (consultas e exames + farmácia e ótica), recalculado quando um dos três muda */
const EC = V5.orcamento.editavel.cotidiano, CAMPO = {}; EC.campos.forEach(c => { CAMPO[c.id] = c; });
const taxaH = () => S.orc.taxa != null ? S.orc.taxa : EC.taxa_henner.valor;
const nMes2 = c => c && c.orcado_mes && Math.abs((c.orcado_ano || 0) - c.orcado_mes * 12) > 1 ? Math.max(1, Math.round(c.orcado_ano / c.orcado_mes)) : 12;   // escola e Education: 10 meses de aula (orçado sazonal)
const fat2 = id => vista('2') === 'mensal' ? 1 / nMes2(CAMPO[id]) : 1;   // o campo digitado vira anual: mensal × meses do item
const inp = (id, n, raw, rot, extra) => '<input class="inp ' + (extra || '') + '" type="text" inputmode="decimal" data-orc="' + esc(id) + '" data-n="' + n + '" value="' + esc(raw) + '" placeholder="—" aria-label="' + esc(rot) + '">';
const NOTAS_ORC = {
  '1': () => 'Orçado: salário de Ge em 12 parcelas, licença bienal dividida por 2 (cai a cada 2 anos) e salário do Tobia pelo que a Mandū paga (D48, D51). Real: o que entrou no livro na janela escolhida (' + esc(janRot()) + '). R$ ↔ € pelo câmbio médio de 12 meses, 1 € = R$ ' + fmt(CAM, 2) + '. O salário a receber (meses que a Mandū ainda não pagou) aparece em azul, à parte do real. Barras: acima do plano para a direita (verde), abaixo para a esquerda (vermelho).',
  '2': () => 'Orçado de cada item = o que vocês combinaram, por mês (o que você digitar vale só nesta página e recalcula a categoria, o bloco, a rosca, os cartões e a visão geral). Os créditos (Education Allowance, créditos de imposto, reembolso Henner) entram com sinal negativo: o planejado do bloco já é o que fica no bolso quando eles entram. <b>Reembolso Henner</b> não se digita: é −' + fmt(taxaH() * 100, 0) + ' % × (consultas e exames + farmácia e ótica); mude a taxa ao lado dele (D6: faixa ' + M5.henner.faixa.join('–') + ' % = no plano). Real = resultado médio (realizado − a entrar) de ' + esc(janRot()) + ', por competência. Semáforo ±' + fmt(M5.margem.bloco_pct, 0) + ' % no bloco e na categoria; no item ±' + fmt(M5.margem.item_pct, 0) + ' % ou € ' + fmt(M5.margem.item_eur, 0) + '.',
  '3': () => '3.1 Viagens diversas (as viagens curtas), 3.2 Férias de verão e 3.3 Férias no Brasil (em R$, convertido pelo câmbio médio). O orçado é por ano, por sub-bloco; o real é a viagem inteira pelo livro, por centro de custo (a mesma base da tela Viagens). O planejador distribui o orçado do sub-bloco pelos componentes na proporção das viagens parecidas; o que você digitar fica travado e o resto se redistribui (sugestão Claude · validar).',
  '4': () => 'Impostos na França: regularização do imposto de 2025 em 4 parcelas (as próximas estão no <a href="#fluxo">Fluxo de caixa</a>). Outras no Brasil: por categoria, em R$ (orçado anual ÷ 12 no mensal); o IR de pessoa física no Brasil ainda não tem valor (N/D).',
  '5': () => 'Projetos (D52): Equipamentos, Mobiliário e eletrodomésticos, Mudança de residência, Tratamento de saúde extraordinário, Investimentos e Imóvel. Nenhum está orçado no ano; o real mostra o que já aconteceu. Aporte em investimento é transferência entre contas próprias: fica na sobra e no Patrimônio, não sai como gasto.',
  'G': () => '<b>Demonstrativo (tipo DRE):</b> entradas → − Cotidiano França = sobra depois do Cotidiano → − Viagens → − Outras saídas → − Projetos = sobra do ano. Coluna Mensal só para o que tem sentido por mês (salários e Cotidiano); «—» nos blocos anuais. % = linha ÷ entradas da mesma coluna e versão. <b>Orçado</b> = o que está nesta tela, com as suas edições (o Cotidiano já líquido dos créditos; o % de sobra é plano, não medição — a poupança medida está em Patrimônio e Futuro). <b>Realizado</b> = ' + esc(((DRE || {}).periodos || {}).realizado || 'últimos 12 meses') + '. Ano a ano: ' + esc((((DRE || {}).analise_horizontal) || {}).nota || '') + ' Ano em âmbar tem dado incompleto: sem seta de variação.',
  henner2: NOTAS_PN.henner,
  desvio: () => '<b>Sinal único em todo o app:</b> + é sobra (gastou menos que o planejado), − é gasto a mais; vale para as barras e para os chips das tabelas, do Painel e do Total. Uma barra por item: sobra cresce para a direita em verde; excesso cresce para a esquerda em vermelho; dentro da margem fica azul. Cotidiano: resultado médio dos 12 meses × orçado mensal. Blocos anuais: acumulado × orçado do ano — ou × o orçado proporcional ao ano corrido (' + fmt(RIT, 0) + ' %), quando «pelo ritmo» está ligado.'
};
['1', '2', '3', '4', '5'].forEach(n => { NOTAS_ORC['desvio' + n] = NOTAS_ORC.desvio; });
function orcAtualizar(foco){
  regioes();   // v9: o campo do orçado vive no Painel (e a simulação na aba dela): refaz só as regiões da tela aberta
  if (foco && foco.sel){ const el = document.querySelector(foco.sel); if (el){ el.focus(); try { el.setSelectionRange(foco.pos, foco.pos); } catch (e) {} } }
}

const CCOR = {passagem:PAL8[0], hospedagem:PAL8[1], alimentacao:PAL8[2], transporte:PAL8[3], passeios:PAL8[4], outros:PAL8[5]};   // v8: a mesma cor por componente em todas as roscas e colunas, pela paleta de 10 (aplicarPaleta troca no escuro)
aplicarPaleta(true);
/* ===================== onda 11 (06/11 noite, ENXUGAMENTO.md) + conserto pós-crítica (07/11): as 9 telas além de Painel e Simulação, no padrão do DESIGN.md v10 =====================
   Régua curta (R1–R12): a tela começa pela resposta · título = nome · chip do período · ⓘ · nenhuma instrução de clique · disclaimer de mockup só no rodapé ·
   paleta antiga sai (rampa tonal do bloco; rosca maior → menor) · todo número com período e base · método mora no ⓘ · lista em 3 colunas no lugar de tabela larga ·
   Esconder valores vale em tudo · um termo só: orçado · cartão gigante não volta · `det` com título-padrão + contagem no sub.
   Conserto (crítica 07/11): nada no app diz que fez o que não fez — botão que só avisava saiu ou virou pedido pelo «Pedir ajuste»; cartão que não abre não é botão. */
function cabTela(nome, chipTxt, popTxt, chipTit){ return tit(nome, (chipTxt ? pil('neu', chipTxt, chipTit) : '') + (popTxt ? pop(popTxt, 'sobre esta tela') : '')); }
/* lista em 3 colunas (quando · o quê com o apoio embaixo · valor) — o padrão dos lançamentos (v10, item 8) para toda lista do app (R8).
   rows: {q, t, sub, v, vsub, acao, cls, act, id, ativo} · {grupo, gsub} = linha de grupo · {raw} = linha livre (detalhe aberto dentro da lista) */
function lista3(rows, o){
  o = o || {}; if (!rows.length) return '<p class="muted" style="padding:6px 2px">' + esc(o.vazio || 'nada aqui') + '</p>';
  const th = o.th ? '<thead><tr><th>' + o.th[0] + '</th><th>' + o.th[1] + '</th><th class="num">' + o.th[2] + '</th></tr></thead>' : '';
  const tr = r => r.grupo != null ? '<tr class="l3-g"><td colspan="3"><span>' + r.grupo + '</span>' + (r.gsub ? '<span class="muted">' + r.gsub + '</span>' : '') + '</td></tr>' :
    r.raw != null ? '<tr class="l3-x"><td colspan="3">' + r.raw + '</td></tr>' :
    '<tr' + (r.cls ? ' class="' + r.cls + '"' : '') + (r.act ? ' data-act="' + r.act + '" data-id="' + esc(r.id) + '" role="button" tabindex="0" aria-pressed="' + !!r.ativo + '"' : '') + '><td>' + (r.q || '') + '</td><td>' + (r.t || '') + (r.sub ? '<span class="sub">' + r.sub + '</span>' : '') + '</td><td class="num">' + (r.v || '') + (r.vsub ? '<span class="sub">' + r.vsub + '</span>' : '') + (r.acao ? '<span class="sub l3-a">' + r.acao + '</span>' : '') + '</td></tr>';
  return '<div class="rolavel"><table class="mini l5 l3' + (o.cls ? ' ' + o.cls : '') + '">' + th + '<tbody>' + rows.map(tr).join('') + '</tbody></table></div>' + (o.rodape ? '<p class="apoio" style="padding:4px 2px">' + o.rodape + '</p>' : '');
}
const nPl = (n, um, muitos) => n + ' ' + (n === 1 ? um : (muitos || um + 's'));
/* pedido pelo «Pedir ajuste» já montado (J2): o único caminho do app para mudar o livro, o plano ou um saldo — nada aqui finge gravar */
const paLink = () => '';
/* nome de conta como a família fala (a crítica: «XP-cartao», «BoursoBank-joint» crus) */
const contaNome = c => { const r = (D.rotina && D.rotina.contas || []).find(x => x.conta === c); return r ? r.rotulo : String(c || '').replace(/-joint$/, '').replace(/-cartao$/, ' cartão').replace(/-conta$/, ' conta').replace(/etherfi/i, 'ether.fi'); };

const FX_SALDO_KEY = 'casa.fluxo.saldo';
function fabRender(){ const el = $('#fab'); if (el) el.innerHTML = ''; }

