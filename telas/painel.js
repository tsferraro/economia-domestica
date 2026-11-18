/* GERADO por pagina/tools/derivar_telas.py a partir de scripts/app/mockup.template.html (o mockup aprovado). NÃO EDITE À MÃO:
   mude a lista TROCAS do gerador e rode de novo. Parte «painel». */
"use strict";
/* ===================== 1 · PAINEL (v5 · onda 5: Cotidiano pelo último mês fechado, blocos 3–5 pelo ano; orçamento por competência) ===================== */
const V5 = D.v6 ? Object.assign({}, D.v5, D.v6) : D.v5, M5 = V5.meta, PN = V5.painel, MF = M5.mes_fechado, ROT_MF = M5.rotulo_mes, RIT = M5.ritmo_ano_pct, ANO = M5.ano;
const B2V = V5.blocos.b2, B3V = V5.blocos.b3, B4V = V5.blocos.b4, B5V = V5.blocos.b5, BV = {'2':B2V, '3':B3V, '4':B4V, '5':B5V};
const N2 = {}; B2V.grupos.forEach(g => { N2[g.id] = g; g.itens.forEach(i => { N2[i.id] = i; }); });
const PCLS = {verde:'verde', azul:'azul', vermelho:'verm', ambar:'ambar'};
const PALAVRA = {economia:'sobra', no_plano:'no plano', excesso:'acima', acima:'acima', abaixo:'abaixo'};
/* chip compacto (tabelas): só cor, sinal e valor; a palavra fica no title, no aria-label e na legenda do cabeçalho flutuante.
   SINAL ÚNICO em todo o app (conserto v5, P1-1): sobra = planejado − realizado; positivo e verde quando gastou menos, negativo e vermelho quando gastou mais —
   o mesmo sentido das barras de desvio (sobra à direita). Em despesa, m.desvio chega como realizado − planejado: aqui ele vira sobra. */
function chip(m, cur, o){
  o = o || {}; if (!m || !m.status) return '<span class="pil c neu">—</span>';
  const k = o.k == null ? 1 : o.k, v = Math.abs(m.valor || 0) * k, sg = -(m.desvio || 0) * k, cls = PCLS[m.cor] || (m.status === 'economia' ? 'verde' : m.status === 'excesso' ? 'verm' : 'azul'), pal = PALAVRA[m.status] || m.status;
  if (v < 0.5) return '<span class="pil c ' + cls + '" title="no plano" aria-label="no plano">no plano</span>';
  const txt = (sg < 0 ? '−' : '+') + money(v, cur || 'EUR');
  return '<span class="pil c ' + cls + '" title="' + esc(pal + (sg < 0 ? ' (gastou a mais)' : ' (sobrou)')) + '" aria-label="' + esc(txt + ' · ' + pal) + '">' + txt + '</span>';
}
/* lançamentos da v5: [data do pagamento, conta, descrição, valor nativo, moeda, valor no nó, observação (competência), id, zera] + «a entrar» */
function lancTable5(list, cur, aed){
  list = list || []; aed = aed || [];
  if (!list.length && !aed.length) return '<p class="muted" style="padding:6px 2px;font-size:.9375rem">Nenhum lançamento no livro para este item no período.</p>';
  const semCod = s => String(s || '').replace(/\(?\bD\d{2,3}\b\)?\s*/g, '').replace(/\s*\(corte \d+\)/g, '').replace(/^\s*[·:]\s*/, '').trim();   // P2-1: nenhum código de decisão na tela
  /* v10 (item 8): uma coluna «descrição»; conta e observação viram texto secundário, só quando existem */
  const rows = list.map(l => { const obs = (l[8] ? '<span class="pil neu peq" title="cobrança e estorno se anulam">zera</span>' : '') + (l[6] && semCod(l[6]) ? '<span class="pil neu peq" title="conta no mês a que se refere, não no mês do pagamento">' + esc(semCod(l[6])) + '</span>' : ''), sub = (l[1] ? esc(l[1]) : '') + (l[1] && obs ? ' ' : '') + obs;
    return '<tr' + (l[8] ? ' class="mudo"' : '') + '><td>' + dataBr(l[0]) + '</td><td>' + esc(l[2]) + (sub ? '<span class="sub">' + sub + '</span>' : '') + '</td><td class="num">' + money(l[3], l[4], {d:2}) + '</td></tr>'; }).join('') +
    aed.map(a => '<tr><td>' + esc(mesPt(a.mes)) + '</td><td><span class="azul-t">a entrar</span> <span class="apoio">' + esc(a.base) + '</span></td><td class="num azul-t">' + money(a.valor, cur, {d:2}) + '</td></tr>').join('');
  return '<div class="rolavel"><table class="mini l5"><thead><tr><th>pago em</th><th>descrição</th><th class="num">valor</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    (list.length ? '<p class="apoio" style="padding:4px 2px">' + list.length + (list.length === 1 ? ' lançamento' : ' lançamentos') + ' · soma ' + money(sum(list.map(l => l[5])), cur, {d:0}) + '</p>' : '');
}
function roscaSimples(segs, o){
  o = o || {}; const cur = o.cur || 'EUR', ss = fatias8(segs), tot = sum(ss.map(s => s.v));   // v8: no máximo 8 fatias; a 9ª em diante vira «Outros»
  if (!ss.length) return '<p class="nd">' + esc(o.vazio || 'N/D') + '</p>';
  let a = -Math.PI / 2, h = '';
  ss.forEach((s, i) => { const g = s.v / tot * Math.PI * 2; h += '<path d="' + arco(110, 110, 76, a + 0.012, a + g - 0.012) + '" fill="none" stroke="' + s.cor + '" stroke-width="30"' + (o.act ? ' role="button" tabindex="0" data-act="' + o.act + '" data-v="' + esc(s.id != null ? s.id : i) + '" style="cursor:pointer"' : '') + (o.sel != null && o.sel !== s.id ? ' opacity=".35"' : '') + '><title>' + esc(s.nome) + ': ' + esc(money(s.v, cur, {d:0})) + ' (' + fmt(s.v / tot * 100, 0) + ' %)' + (o.act ? ' — toque para aprofundar' : '') + '</title></path>'; a += g; });
  const y0 = o.sub2 ? 101 : 107;   // v10: 3ª linha do centro («jan–out/2026»)
  return '<svg class="ro-sv" width="220" height="220" viewBox="0 0 220 220" role="' + (o.act ? 'group' : 'img') + '" aria-label="' + esc(o.aria || 'Distribuição') + '">' + h + '<text x="110" y="' + y0 + '" text-anchor="middle" class="r-c">' + esc(o.centro || kfmt(tot, cur)) + '</text><text x="110" y="' + (y0 + 19) + '" text-anchor="middle" class="r-s">' + esc(o.sub || '') + '</text>' + (o.sub2 ? '<text x="110" y="' + (y0 + 35) + '" text-anchor="middle" class="r-s2">' + esc(o.sub2) + '</text>' : '') + '</svg>';
}
const HEN2 = B2V.grupos.find(g => g.henner) || {};
const NOTAS_PN = {
  regime: () => '<b>Orçamento e realizado por competência:</b> cada despesa e cada crédito contam no mês a que se referem; a data do pagamento fica como observação na linha. ' + V5.competencia.n_ajustes + ' lançamentos mudaram de mês (' + Object.keys(V5.competencia.por_item).map(k => esc(k) + ' ' + V5.competencia.por_item[k]).join(' · ') + '). Regras: ' + V5.competencia.regras.map(esc).join(' · ') + '. Compra no cartão conta pela data da compra (D62). O que já saiu ou entrou de verdade, por data, está na tela <a href="#fluxo">Fluxo de caixa</a> (regime de caixa).',
  '2': () => 'Resultado do mês = realizado − <b>a entrar</b> (créditos do mês que ainda não caíram: Education Allowance e reembolso Henner esperado; os créditos de imposto são anuais e moram no bloco 4, D65). É o resultado que se compara ao planejado do mês (orçado dos itens, com o reembolso Henner = −' + fmt(M5.henner.taxa * 100, 0) + ' % × saúde; escola e Education só nos meses de aula). Semáforo: ±' + fmt(M5.margem.bloco_pct, 0) + ' % no bloco e na categoria; no item ±' + fmt(M5.margem.item_pct, 0) + ' % ou € ' + fmt(M5.margem.item_eur, 0) + '. <b>Sinal do desvio:</b> + sobra (gastou menos), − gastou a mais — o mesmo das barras do menu e do Orçamento. Média 12 m = média do resultado de ' + esc(mesPt(J[0])) + ' a ' + esc(mesPt(J[11])) + '. Seta = mês fechado contra a média 12 m, com as mesmas cores do semáforo. Toque numa coluna do gráfico para filtrar o Painel por aquele mês.',
  henner: () => 'Reembolso Henner = ' + fmt(M5.henner.taxa * 100, 0) + ' % × (consultas e exames + farmácia e ótica), por competência; faixa ' + M5.henner.faixa.join('–') + ' % = no plano. 12 meses: ' + pct(HEN2.henner.m12.pct) + ' do gasto voltou (' + esc(HEN2.henner.m12.status) + ' da faixa); ano: ' + pct(HEN2.henner.ano.pct) + '; mês: ' + pct(HEN2.henner.mes.pct) + ' → ' + money(HEN2.henner.mes.falta_eur, 'EUR') + ' a entrar. ' + esc(HEN2.henner.regra || ''),
  ritmo: () => 'Ritmo do ano = meses fechados ÷ 12 = ' + fmt(RIT, 0) + ' %. O marcador grafite na barra é esse ponto; a barra mede o <b>usado</b> (acumulado ÷ orçado do ano). A <b>cor</b> é o semáforo do bloco: <b>vermelha</b> quando o consumo (acumulado + já assumido) passa do orçado do ano além de ' + fmt(M5.margem.bloco_pct, 0) + ' %, <b>verde</b> quando fica abaixo além de ' + fmt(M5.margem.bloco_pct, 0) + ' %, <b>azul</b> dentro de ±' + fmt(M5.margem.bloco_pct, 0) + ' %. Rubrica sem orçado aparece hachurada: tudo o que entrou nela é gasto fora do plano. Os sub-blocos vêm recolhidos; o ⓘ da coluna Desvio de cada bloco diz o que já está assumido.',
  '3': () => 'Viagens: o combinado é por ano e por sub-bloco (Viagens diversas · Férias de verão · Férias no Brasil, esta em R$ convertido pelo câmbio médio 1 € = R$ ' + fmt(CAM, 2) + '). Acumulado = todas as linhas do ano até ' + esc(mesPt(MF)) + ', por competência (compra no cartão pela data da compra). Cada viagem aparece pelo nome do destino, em ordem de início, e abre os lançamentos como os demais itens; a viagem inteira, com componentes e comparação ano a ano, está em <a href="#viagens">Viagens</a>.',
  '4': () => 'Impostos na França: as parcelas já pagas estão no acumulado; as com data ainda por pagar entram no <b>já assumido</b> e descontam o desvio (as datas estão no <a href="#fluxo">Fluxo de caixa</a>); os créditos de imposto (emprego doméstico, guarda de criança) são anuais: entram como orçado negativo e só viram realizado quando o dinheiro cai (D65) — por isso o orçado do bloco é líquido e pode ser negativo. Outras no Brasil: por categoria e item, em R$ com o equivalente em €; linha zerada no ano não aparece.',
  '5': () => 'Projetos (D52): equipamentos, mobiliário, mudança, tratamento de saúde extraordinário, investimentos e imóvel. Nenhum tem orçado no ano: o acumulado é gasto fora do plano. Aporte em investimento é transferência entre contas próprias e não entra como gasto.',
  dv3: () => notaDesvioAno('3'), dv4: () => notaDesvioAno('4'), dv5: () => notaDesvioAno('5'),
  term: () => { const t = (TM.atual && TM.atual.ativo) ? TM.atual : (TM.exemplo_ultimo_fechado || {}); return '<b>Régua do mês:</b> ' + esc(TM.regra || '') + '. Marcos: <b>plano do mês</b> (risco grafite cheio), <b>esperado até o dia</b> (triângulo azul: plano × dias corridos), <b>média 12 m</b> (risco laranja tracejado); o preenchimento é o realizado até o corte, na cor do semáforo contra o esperado. Num mês fechado não há projeção: o losango grafite mostra em quanto o mês fechou. ' + esc(t.nota || '') + ' ' + esc(TM.atualizacao || '') + (TM.atual && !TM.atual.ativo ? ' <b>Hoje a régua é uma simulação:</b> ' + esc(TM.atual.motivo || '') : ''); },
  dre: () => '<b>Demonstrativo:</b> ' + esc((DRE || {}).regra || '') + ' Orçado = ' + esc(((DRE || {}).periodos || {}).orcado || '') + '. Realizado = ' + esc(((DRE || {}).periodos || {}).realizado || '') + '. Ano a ano: ' + esc((((DRE || {}).analise_horizontal) || {}).nota || '') + ' Sinal da sobra: + sobrou, − faltou.'
};
const notaDesvioAno = n => { const a = (BV[n] || {}).ano || {}, ja = a.ja_assumido || {}; return '<b>Desvio</b> = orçado do ano − acumulado até ' + esc(mesPt(MF)) + ' − <b>já assumido</b> (D63). ' + esc(ja.texto || '') + (ja.credito_a_entrar ? ' · crédito de imposto a entrar em 2027: ' + money(ja.credito_a_entrar, 'EUR') + ' (abate o consumo)' : '') + '. Sinal: + ainda cabe no orçado (sobra), − passou. Semáforo: vermelho acima de +' + fmt(M5.margem.bloco_pct, 0) + ' %, azul em ±' + fmt(M5.margem.bloco_pct, 0) + ' %, verde abaixo de −' + fmt(M5.margem.bloco_pct, 0) + ' %. Parcelas de 2027 (' + money(ja.alem_do_ano || 0, 'EUR') + ') não entram neste ano.'; };
/* ---------- v6 (onda 6): estado novo · acesso ao mês filtrado · blocos recolhíveis ---------- */
const V6 = V5;   // D.v6 mesclado sobre o D.v5 (o que o v6 não trouxer vem do v5)
const RA = V6.ritmo_ano || {blocos:[], ritmo_pct:RIT}, TM = V6.termometro || {}, DRE = V6.demonstrativo || null, COMPO = (V6.orcamento || {}).composicao || null, INS = V6.insights || {};
const PM_ALL = (V6.painel || {}).por_mes || {}, MES_PAD = (V6.painel || {}).mes_padrao || MF;
Object.assign(S.pn, {bl:'2', vista:'desvio', ritmoSubs:{}});
S.ab = {pn:{'1':false, '2':false, '3':false, '4':false, '5':false, '6':false}, orc:{}, sim:{}};   // aberto explícito (true/false) por bloco; indefinido = segue o bloco escolhido no menu. v8: no Painel todo bloco abre recolhido (pedido do Tobia); o menu e «Expandir todos» abrem
const AB_KEYS = {pn:['1', '2', '3', '4', '5'], orc:['1', '2', '3', '4', '5', 'G'], sim:['1', '2', '3', '4', '5']};
const ehAb = (scope, n) => S.ab[scope][n] != null ? !!S.ab[scope][n] : (scope === 'orc' ? S.orc.bl : scope === 'sim' ? S.sim.bl : S.pn.bl) === n;
S.dre = {pn:(DRE && DRE.versao_padrao) || 'realizado', orc:'orcado'};
S.fab = false; S.orc.grupo = null; S.mesSel = MES_PAD; Object.assign(S.fx, {saldo:null, saldoRaw:''});
const pmSel = () => PM_ALL[S.mesSel] || PM_ALL[MES_PAD] || null;
const mesSelRot = () => { const p = pmSel(); return p ? p.rotulo : ROT_MF; };
const ehPad = () => { const p = pmSel(); return !p || p.mes === MES_PAD; };
const abTudo = (scope, v) => { AB_KEYS[scope].forEach(k => { S.ab[scope][k] = v; }); };
const todosAb = scope => AB_KEYS[scope].every(k => ehAb(scope, k));
/* cabeçalho recolhível (todos os blocos numa tela só): a seta e o nome abrem e fecham; à direita, o valor (quando fechado) e a pílula */
function cabTog(scope, n, nome, direita, extraCtl){
  const on = ehAb(scope, n);
  return '<div class="bloco-cab tog"><h2><button class="tog-b" type="button" data-act="bl-tog" data-s="' + scope + '" data-v="' + n + '" aria-expanded="' + on + '" aria-controls="' + scope + '-corpo-' + n + '">' + SETA + '<span class="nb">' + (n === 'G' ? 'Σ' : n) + '</span><span class="t">' + nome + '</span></button>' + (extraCtl || '') + '</h2><div class="tot">' + (direita || '') + '</div></div>';
}
const barraBlocos = scope => '<div class="tb-blocos"><span></span><button class="btn link peq" type="button" data-act="ab-all" data-s="' + scope + '">' + (todosAb(scope) ? 'Recolher todos' : 'Expandir todos') + '</button></div>';
/* leitura do bloco gerada dos números, com o sinal único do app (+ sobra · − gastou a mais); serve ao cartão «Leitura» e ao pop-up */
const sv = (v, cur) => (v < 0 ? '−' : '+') + money(Math.abs(v), cur || 'EUR');
/* ---------- a tela ---------- */
/* ===================== v7 (onda 7): componente único de bloco (auditoria § 1.2) · barra orçado × realizado (D76) · desvio na coluna (D72, D75) · Resultado em leque · Ano a ano no modelo SGF · matriz e histórico no Orçamento · planejador na aba Viagens.
   A tela lê SÓ D.v7 nas telas Painel e Orçamento (CONTRATO-D-v7.md); os nós da v6 ficam só para os lançamentos (ids → linhas) e para a cor dos blocos. ===================== */
/* v8 (onda 8): as telas Painel e Orçamento (e a aba Viagens) leem D.v8 — a mesma forma da v7 mais `linhas` nas entradas, `lancamentos_agrupados`, `resultado.janelas`, a coluna «projetado» do Ano a ano e `a_confirmar` da onda 8 */
const V7 = D.v8 || D.v7 || {}, B7 = {}; (V7.blocos || []).forEach(b => { B7[b.id] = b; });
const B7_BASE = Object.assign({}, B7);   // conserto G1: o orçado digitado é aplicado sobre cópias (aplicarEd); a base do gerador fica intacta
const R7 = V7.resultado || {}, AA7 = V7.ano_a_ano || null, MZ7 = V7.matriz || null, HIST7 = V7.orcamento_historico || {versoes:[]}, VP7 = V7.viagens_planejador || null, COMP7 = (V7.composicao || {}).por_bloco || {}, META7 = V7.meta_poupanca || {pct:null};
const SOBRA12 = (V7.total || {}).sobra_12m || null, MESES_FECH = MT.meses_reais_ano || 10, MESES_FALTAM = 12 - MESES_FECH;
NOME['6'] = 'Resultado'; COR['6'] = '#15965A'; CORT['6'] = '#0F7A47'; AB_KEYS.pn.push('6'); AB_KEYS.orc.push('6');   // v8: o Resultado é o bloco verde
/* v8: paleta de gráfico Mandū (8 cores vivas, ordem fixa) para TODA rosca do app: fatia i = cor i, pela ordem fixa das partes de cada bloco; a 9ª fatia em diante vira «Outros» (cinza).
   A mesma parte tem sempre a mesma cor em todas as roscas do bloco (a posição é fixa, não depende do valor). A cor do bloco não muda. Nunca na tabela (sem quadradinho), só em rosca e barra. */
/* conserto (M1): a paleta certa é a dos apps Mandū — `mandu/_recursos/id-visual-apps-mandu.md` § 1, as 10 cores na ordem gravada; 11ª fatia em diante vira «Outros».
   P1-2: no escuro, par de mesmo matiz com contraste ≥ 3:1 sobre o fundo (medido: 3,34 a 8,09; a 4ª e a 5ª clareiam mais para não se confundirem entre si). */
const PAL10 = {claro:['#FF6E00', '#F5A623', '#C2571B', '#1F3764', '#2563A0', '#157F74', '#1E7A48', '#A02B2B', '#5C6878', '#B08968'],
  escuro:['#FF6E00', '#F5A623', '#D4663A', '#8FA3D9', '#3F8FDC', '#1E9D8F', '#35A56B', '#CB3D3D', '#8A96A6', '#B08968']};
const PAL_OUTROS = '#78716C', MAX_FATIAS = 10;
const temaEscuro = () => document.documentElement.dataset.tema === 'escuro';
const PAL8 = PAL10.claro;   // nome mantido pelas chamadas antigas; a cor viva vem de palAtual()
const palAtual = () => temaEscuro() ? PAL10.escuro : PAL10.claro;
const CORCAT = {b2:COR['2'], b3:COR['3'], b4:COR['4'], b5:COR['5'], sobra:COR.sobra}, POS7 = {};
[['2.1', '2.2', '2.3', '2.4', '2.5', '2.6'], ['3.1', '3.2', '3.3'], ['4.1', '4.2'], ['4.2.1', '4.2.2', '4.2.3', '4.2.4', '4.2.5', '4.2.6', '4.2.7'], ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7'],
  ['salario_ge', 'salario_to', 'decimo_terceiro', 'licenca_ge', 'indenizacoes'], ['passagem', 'hospedagem', 'alimentacao', 'transporte', 'passeios', 'outros']].forEach(lista => lista.forEach((id, i) => { POS7[id] = i % 10; }));
/* as telas anteriores (Viagens, Anos) seguem a mesma paleta; refeito a cada troca de tema */
function aplicarPaleta(comCcor){ const P = palAtual(); Object.assign(SUBC, {'3.1':P[0], '3.2':P[1], '3.3':P[2], '4.1':P[0], '4.2':P[1], br:P[1]}); CAT.splice(0, CAT.length, ...P.slice(0, 6), PAL_OUTROS); if (comCcor) Object.assign(CCOR, {passagem:P[0], hospedagem:P[1], alimentacao:P[2], transporte:P[3], passeios:P[4], outros:P[5]}); }   // CCOR nasce mais abaixo: a 1ª chamada não o toca
aplicarPaleta(false);
/* 9ª fatia em diante = «Outros» (cinza), com a soma; a ordem das partes é a do bloco (nunca por valor, para a cor não mudar entre roscas) */
function fatias8(segs){
  const ss = segs.filter(s => s.v > 0.0001); if (ss.length <= MAX_FATIAS) return ss;
  const fica = ss.slice(0, MAX_FATIAS - 1), resto = ss.slice(MAX_FATIAS - 1);
  return fica.concat([{id:'outros', nome:'Outros (' + resto.length + ')', v:sum(resto.map(s => s.v)), cor:PAL_OUTROS}]);
}
/* lançamentos: a v7 traz só os ids; a linha vem dos nós da v6 (id na posição 7) */
const LANC7 = {}; (function(){ const add = l => { if (l && l[7]) LANC7[l[7]] = l; }; const walk = n => { if (!n || typeof n !== 'object') return; (n.lancamentos || []).forEach(add); (n.lancamentos_ano || []).forEach(add); ['grupos', 'itens', 'subs'].forEach(k => (n[k] || []).forEach(walk)); }; Object.values(V6.blocos || {}).forEach(walk); Object.values(PM_ALL).forEach(p => walk(p.cotidiano)); })();
const lanc7 = ids => (ids || []).map(id => LANC7[id]).filter(Boolean);
/* ---------- sinal e cor (D72): acima = +, direita, vermelho (despesa) · abaixo = −, esquerda, verde · receita inverte a cor (o dado já diz `bom`) · no plano = azul ---------- */
/* legenda da rosca do menu com 4 colunas (bolinha · nome · valor · %) */
const legRosca = (segs, tot, negs) => '<ul class="rosca-leg l4" role="group" aria-label="Partes do bloco">' + segs.map(s => '<li><i style="background:' + s.cor + '"></i><span>' + esc(s.nome) + '</span><b>' + money(s.v, 'EUR') + '</b><span class="muted">' + fmt(s.v / tot * 100, 0) + NB + '%</span></li>').join('') +
  (negs || []).map(a_ => '<li><i style="background:#A8A29E"></i><span>' + esc(a_.nome) + ' (reembolso acima do gasto)</span><b>' + money(a_.v, 'EUR') + '</b><span class="muted">fora da rosca</span></li>').join('') + '</ul>' +
  ((negs || []).length ? '<p class="apoio">Fatia não pode ser negativa: ' + negs.map(a_ => esc(a_.nome)).join(', ') + ' recebeu de reembolso mais do que gastou no período (fato do extrato). O centro e a soma da legenda contam esse valor; a rosca desenha só as partes positivas.</p>' : '');
const CLS7 = nd => !nd || nd.estado == null || nd.estado === 'sem_orcado' || nd.desvio == null ? 'neu' : nd.estado === 'no_plano' ? 'azul' : nd.bom === false ? 'verm' : nd.bom === true ? 'verde' : 'neu';
const PAL7 = {acima:'acima', abaixo:'abaixo', no_plano:'no orçado', sobrou:'sobrou', faltou:'faltou'};   // v10 (menor): um termo só — «no orçado», não «no plano»
const semOrc7 = nd => !nd || nd.desvio == null || !nd.estado || nd.estado === 'sem_orcado';
function chip7(nd, cur, o){
  o = o || {}; cur = cur || (nd && nd.moeda) || 'EUR';
  if (semOrc7(nd)) return o.semTxt ? '<span class="pil c neu" title="sem orçado">' + o.semTxt + '</span>' : '';   // P2-4: sem orçado = sem pílula (nada de «—» solto)
  const v = nd.desvio, cls = CLS7(nd), pal = PAL7[nd.estado] || nd.estado, txt = (v < 0 ? '−' : '+') + money(Math.abs(v), cur);
  return '<span class="pil c ' + cls + '" title="' + esc(pal + (o.tit ? ' · ' + o.tit : '')) + '" aria-label="' + esc(txt + ' · ' + pal) + '">' + (Math.abs(v) < 0.5 && nd.estado === 'no_plano' ? 'no orçado' : txt + (o.palavra ? ' · ' + pal : '')) + '</span>';
}
/* célula de desvio: barra divergente embutida (§ 5.1) + rótulo embaixo; escala = maior desvio das linhas à vista; grupo e total levam a palavra, item só o número */
function dvCell(nd, cur, mx, o){
  o = o || {}; cur = cur || (nd && nd.moeda) || 'EUR';
  if (semOrc7(nd)) return '<span class="dvc nd"><span class="tr"></span><b class="neu" title="' + (nd && nd.realizado && nd.planejado == null ? 'sem orçado: conta contra zero no total' : 'sem desvio') + '">' + (nd && nd.realizado && nd.planejado == null ? 'sem orçado' : '—') + '</b></span>';   // P2-4: traço simples, sem trilho e sem pílula
  const v = nd.desvio, ve = Math.abs(eurDe(v, cur)), p = mx > 0 ? Math.min(50, ve / mx * 50) : 0, cls = CLS7(nd), dir = v >= 0 ? 'dir' : 'esq', pal = PAL7[nd.estado] || nd.estado;
  const txt = (v < 0 ? '−' : '+') + money(Math.abs(v), cur) + (o.palavra ? ' · ' + pal : '');
  const base = nd.base_txt ? ' · ' + nd.base_txt : '';   // P1-3: quando o desvio conta o já assumido ou crédito de outro ano, a célula diz (title + leitor de tela)
  return '<span class="dvc" role="img" aria-label="' + esc((o.palavra ? txt : txt + ' · ' + pal) + base) + '"' + (base ? ' title="' + esc(pal + base) + '"' : '') + '><span class="tr"><i class="' + cls + ' ' + dir + '" style="width:' + Math.max(p, Math.abs(v) > 0.5 ? 0.8 : 0).toFixed(2) + '%"></i></span><b class="' + cls + ' ' + dir + '">' + txt + (base ? '<span class="dvb" aria-hidden="true">*</span>' : '') + '</b></span>';
}
/* ⓘ em pop-up ancorado ao clique (Popover API; BACKLOG 260): nunca em linha nova, nunca no topo da página */
let POPN = 0;
/* o ⓘ inline («peq») é um <span role="button">, não um <button>: assim pode morar dentro do botão do nome da linha, colado à última palavra (um <button> dentro de outro fecha o de fora e o ⓘ caía sozinho em linha nova — P1-2) */
function pop(txt, rot, cls){ if (!txt) return ''; const id = 'pop-' + (++POPN), peq = /\bpeq\b/.test(cls || ''), tag = peq ? 'span' : 'button'; return '<' + tag + ' class="info-b pop-b ' + (cls || '') + '"' + (peq ? ' role="button" tabindex="0"' : ' type="button"') + ' data-act="pop" data-pop="' + id + '" aria-label="' + esc(rot || 'o que é isto') + '" aria-expanded="false">ⓘ</' + tag + '><div class="pop" id="' + id + '" popover role="note">' + txt + '</div>'; }
function popAbrir(b){
  const el = document.getElementById(b.dataset.pop); if (!el) return;
  const r = b.getBoundingClientRect ? b.getBoundingClientRect() : {left:0, top:0, bottom:0};
  if (el.togglePopover){ el.togglePopover(); if (!el.matches || !el.matches(':popover-open')){ b.setAttribute('aria-expanded', 'false'); return; } }
  else { el.classList.toggle('on'); if (!el.classList.contains('on')){ b.setAttribute('aria-expanded', 'false'); return; } }
  b.setAttribute('aria-expanded', 'true');
  const W = window.innerWidth || 1280, H = window.innerHeight || 800, w = Math.min(340, W - 16), h = el.offsetHeight || 160;
  el.style.left = Math.max(8, Math.min(r.left, W - w - 8)) + 'px';
  el.style.top = (r.bottom + 8 + h > H - 8 && r.top - h - 8 > 8 ? r.top - h - 8 : Math.min(r.bottom + 8, H - h - 8)) + 'px';
  const inp = el.querySelector('input'); if (inp) setTimeout(() => inp.focus(), 0);   // v10 · M3: o campo da senha recebe o foco ao abrir
}
/* ---------- barra única orçado × realizado no detalhe de todo bloco (D76, § 5.2): trilho = orçado · preenchimento = realizado · um marco · Entradas com o a receber hachurado ---------- */
function barraOR(b, o){
  o = o || {}; const br = b.barra || {}, cur = b.moeda_tabela || 'EUR', orc = br.orcado, re = br.realizado || 0, ar = br.a_receber || 0, m = br.marco;
  if (orc == null || orc <= 0){   // P2-4: sem orçado (ou orçado líquido negativo) não há barra que informe: só o texto
    return '<div class="bor" role="note" aria-label="' + esc('realizado ' + money(re, cur) + (orc == null ? ', sem orçado' : ', orçado líquido ' + money(orc, cur))) + '"><div class="bor-l"><span class="e"><b>realizado ' + money(re, cur) + '</b></span><span class="d">' + (orc == null ? 'sem orçado no ano' : 'orçado líquido ' + money(orc, cur) + ' <span title="os créditos de imposto são maiores que os gastos orçados">(créditos maiores que os gastos)</span>') + '</span></div></div>';
  }
  /* conserto · M6: a barra conta o já assumido (parcela com data ainda por pagar), hachurado em vermelho, para dizer o mesmo desvio do cabeçalho */
  const ja = o.ja > 0.5 ? o.ja : 0, reT = re + ja, mV = m && m.valor != null && m.valor > 0 && !/ritmo/i.test(m.rotulo || '') ? m.valor : 0;
  /* v10 · conserto M5: a média 12 m fora da escala NÃO fica presa no fim do trilho (parecia o orçado): a escala cresce até ela, e o orçado passa a ser marcado onde cai (marca branca + rótulo no ponto) */
  const tot = Math.max(orc, reT + ar, mV), px = v => v / tot * 100, wr = px(reT), wa = px(ar), wo = px(orc), passou = reT > orc + 0.5, abaixo = !passou && !o.ent && orc - reT > 0.5, orcDentro = wo < 99.5;
  /* v10 (itens 1–3, pedido do Tobia): saem os dois traços grafite que se atropelavam. Embaixo da barra, triângulos: ritmo (turquesa, texto na mesma cor, igual em todo bloco; some quando é 100 %) e média 12 m (laranja). «orçado € X» diz respeito à barra: fica EM CIMA dela, na cor do bloco — no fim do trilho quando cabe, no ponto do orçado quando o realizado passou (e a marca branca no ponto segue). Passou: o excesso em vermelho com «+ € X acima do orçado» à direita; ficou abaixo (blocos 2–5): o pedaço verde até o orçado com «− € X abaixo do orçado». A amostra do hachurado vai ao lado de «+ € X a receber» e de «+ € X já assumido», e a conta fecha: «realizado + a receber = total». A colisão entre rótulos é resolvida depois de pintar (ajustarBarras): 2ª linha ou âncora à direita, sempre a mesma decisão para a mesma largura */
  const exc = (passou ? '<i class="f exc" style="left:' + wo.toFixed(2) + '%;width:' + (wr - wo).toFixed(2) + '%"></i>' : '') + (orcDentro ? '<i class="mk orc" style="left:' + wo.toFixed(2) + '%"></i>' : '');
  const sob = abaixo ? '<i class="f sob" style="left:' + wr.toFixed(2) + '%;width:' + (wo - wr).toFixed(2) + '%"></i>' : '';
  const marcos = [];
  if (m && m.valor != null && m.valor > 0){ const rit = /ritmo/i.test(m.rotulo || ''); const p = Math.min(100, px(m.valor));
    if (rit){ if (m.pct == null || m.pct < 99.5) marcos.push({cls:'rit', p, rot:'ritmo do ano · ' + fmt(m.pct != null ? m.pct : p, 0) + ' %', aria:'ritmo do ano ' + fmt(m.pct != null ? m.pct : p, 0) + ' %'}); }
    else marcos.push({cls:'med', p, rot:'média 12 m · ' + money(m.valor, cur), aria:'média 12 m ' + money(m.valor, cur)}); }
  if (o.ritmoMes != null && o.ritmoMes < 99.5) marcos.push({cls:'rit', p:Math.min(100, px(orc * o.ritmoMes / 100)), rot:'ritmo do mês · ' + fmt(o.ritmoMes, 0) + ' %', aria:'ritmo do mês ' + fmt(o.ritmoMes, 0) + ' %'});   // mês fechado = 100 %: o marco some
  const tx = p => 'transform:translateX(' + (p < 18 ? '0' : p > 82 ? '-100%' : '-50%') + ')';
  const baixo = marcos.map(k => '<i class="tri ' + k.cls + '" style="left:' + k.p.toFixed(2) + '%" aria-hidden="true"></i><span class="m ' + k.cls + '" style="left:' + k.p.toFixed(2) + '%;' + tx(k.p) + '">' + k.rot + '</span>').join('');
  const orcTxt = 'orçado ' + money(orc, cur), star = ja ? ' <span title="conta ' + esc(money(ja, cur)) + ' já assumido (parcela com data ainda por pagar)">*</span>' : '';
  const orcL = orcDentro ? '<span class="m orc' + (wo < 18 ? ' ini' : wo > 82 ? ' fim' : '') + '" style="left:' + wo.toFixed(2) + '%">' + orcTxt + '</span>' : '';
  const dir = '<span class="r">' + (passou ? '<span class="d exc">+ ' + money(reT - orc, cur) + ' acima do orçado' + star + '</span>'
    : (orcDentro ? '' : '<span class="orc">' + orcTxt + '</span>') + (abaixo ? '<span class="d sob">− ' + money(orc - reT, cur) + ' abaixo do orçado' + star + '</span>' : '')) + '</span>';
  const total = (ja || ar > 0.5) ? '<span class="a eq">= ' + money(reT + ar, cur) + '</span>' : '';
  const wJa = ja ? px(ja) : 0, wRe = px(re);
  return '<div class="bor" role="img" aria-label="' + esc('realizado ' + money(re, cur) + (ja ? ' mais ' + money(ja, cur) + ' já assumido' : '') + (ar > 0.5 ? ' mais ' + money(ar, cur) + ' a receber' : '') + ((ja || ar > 0.5) ? ' = ' + money(reT + ar, cur) : '') + ' de ' + money(orc, cur) + ' orçados' + (passou ? ', ' + money(reT - orc, cur) + ' acima do orçado' : abaixo ? ', ' + money(orc - reT, cur) + ' abaixo do orçado' : '') + (marcos.length ? '; ' + marcos.map(k => k.aria).join('; ') : '')) + '">' +
    '<div class="bor-l"><span class="e"><b>realizado ' + money(re, cur) + '</b>' + (ja ? '<span class="a"><i class="sw ja" aria-hidden="true"></i>+ ' + money(ja, cur) + ' já assumido</span>' : '') + (ar > 0.5 ? '<span class="a"><i class="sw ar" aria-hidden="true"></i>+ ' + money(ar, cur) + ' a receber</span>' : '') + total + '</span>' + orcL + dir + '</div>' +
    '<div class="bor-t"><i class="f trilho" style="width:' + wo.toFixed(2) + '%"></i>' + '<i class="f" style="width:' + Math.min(wRe, wo).toFixed(2) + '%"></i>' + (ja ? '<i class="f ja" style="left:' + wRe.toFixed(2) + '%;width:' + Math.min(wJa, Math.max(0, wo - wRe)).toFixed(2) + '%"></i>' : '') + sob + exc + (ar > 0.5 ? '<i class="f ar" style="left:' + wr.toFixed(2) + '%;width:' + wa.toFixed(2) + '%"></i>' : '') + '</div>' + (baixo ? '<div class="bor-b">' + baixo + '</div>' : '') + '</div>';
}
/* v10: depois de pintar, os rótulos da barra que cairiam um sobre o outro mudam de lugar — embaixo, o 2º (e o 3º) desce uma linha; em cima, «orçado» ancora à direita do ponto ou desce — a mesma decisão para a mesma largura (determinístico) */
function ajustarBarras(root){
  const ov = (a, b, g) => a.left < b.right + g && a.right > b.left - g && a.top < b.bottom + 1 && a.bottom > b.top - 1;
  (root || document).querySelectorAll('.bor').forEach(bor => {
    const bb = bor.querySelector('.bor-b');
    if (bb){ const ms = [...bb.querySelectorAll('.m')]; ms.forEach(m => m.classList.remove('r2', 'r3')); bb.classList.remove('r2', 'r3');
      ms.sort((x, y) => parseFloat(x.style.left) - parseFloat(y.style.left)); const rows = [[], [], []]; let max = 0;
      ms.forEach(m => { const r = m.getBoundingClientRect(); let k = 0; while (k < 2 && rows[k].some(p => r.left < p.right + 8 && r.right > p.left - 8)) k++; rows[k].push(r); if (k){ m.classList.add('r' + (k + 1)); max = Math.max(max, k); } });
      if (max) bb.classList.add('r' + (max + 1)); }
    const bl = bor.querySelector('.bor-l'), orc = bl && bl.querySelector('.m.orc');
    if (orc){ orc.classList.remove('r2', 'dir'); bl.classList.remove('r2');
      const outros = () => [...bl.children].filter(c => c !== orc).flatMap(c => c.classList.contains('r') || c.classList.contains('e') ? [...c.children].map(x => x.getBoundingClientRect()) : [c.getBoundingClientRect()]);
      const bate = () => { const r = orc.getBoundingClientRect(); return outros().some(o_ => ov(r, o_, 8)); };
      if (bate()){ if (!orc.classList.contains('fim')) orc.classList.add('dir'); if (bate()){ orc.classList.remove('dir'); orc.classList.add('r2'); bl.classList.add('r2'); } } }
  });
}
/* ---------- v8: lançamentos das Entradas (`linhas`: o salário igual numa linha só «N× de ~€ X», o que difere em linha própria com o motivo) e parcelas agrupadas (`lancamentos_agrupados`: nome · N parcelas · total da compra · o que caiu no período) ---------- */
function lancEntradas(linhas, cur, o){
  linhas = linhas || []; cur = cur || 'EUR'; o = o || {}; const ctx = o.ctx || '';
  if (!linhas.length) return '<p class="muted" style="padding:6px 2px;font-size:.9375rem">Nenhum lançamento no livro para este item no período.</p>';
  const nat = l => l.moeda && l.moeda !== cur && l.valor_nativo != null ? '<span class="sub">' + money(l.valor_nativo, l.moeda, {d:2}) + '</span>' : '';
  const curto = m => { const x = String(m || '').match(/([+\-−]\s?\d+\s?%)/); return x ? x[1].replace(/\s/g, '').replace('-', '−').replace('%', ' %') + ' vs típico' : m; };   // a pílula é curta (sinal tipográfico, P2-4); o motivo inteiro fica no title
  /* conserto · P1-5: em ordem de data (a linha agrupada entra pela 1ª data dela); conta e descrição iguais à linha anterior sobem para um subtítulo e a linha fica em data · valor · observação (~44 px) */
  const ord = linhas.slice().sort((a, b) => String(a.tipo === 'agrupada' ? a.de : a.data).localeCompare(String(b.tipo === 'agrupada' ? b.de : b.data)));
  let ult = null, rows = '';
  ord.forEach(l => {
    const chave = (l.conta || '') + '|' + (l.tipo === 'agrupada' ? '' : (l.descricao || '')), sub = l.tipo !== 'agrupada' && (l.conta || l.descricao);
    /* v10 (item 8): descrição numa coluna só; a conta vira texto secundário dela; a observação (motivo) vai na descrição da linha */
    if (sub && chave !== ult){ rows += '<tr class="lc-t"><td colspan="3">' + esc(l.descricao || '') + (l.conta ? '<span class="sub">' + esc(l.conta) + '</span>' : '') + '</td></tr>'; ult = chave; }
    if (l.tipo === 'agrupada'){ ult = null; rows += '<tr class="agr"><td>' + (l.de ? dataBr(l.de) + (l.ate && l.ate !== l.de ? '<span class="sub">a ' + dataBr(l.ate) + '</span>' : '') : '—') + '</td><td>' + esc(l.rotulo || l.descricao || '') + '<span class="sub">' + (l.conta ? esc(l.conta) + ' ' : '') + pil('neu peq', (l.n || '') + '× igual', 'as parcelas iguais do salário, somadas numa linha só') + '</span></td><td class="num">' + money(l.valor_eur, cur, {d:2}) + nat(l) + '</td></tr>'; }
    else rows += '<tr class="lc-r"><td>' + dataBr(l.data) + '</td><td>' + (l.motivo ? pil('neu peq', esc(curto(l.motivo)), esc(l.motivo) + ' · pode ser reembolso ou outra entrada no lugar errado') : '') + paLink(dataBr(l.data), l.descricao || '', money(l.valor_eur, cur, {d:2}), l.conta, ctx) + '</td><td class="num">' + money(l.valor_eur, cur, {d:2}) + nat(l) + '</td></tr>';
  });
  const n = sum(linhas.map(l => l.tipo === 'agrupada' ? (l.n || (l.ids || []).length || 1) : 1)), soma = sum(linhas.map(l => l.valor_eur || 0));
  return '<div class="rolavel"><table class="mini ent l5"><thead><tr><th>entrou em</th><th>descrição</th><th class="num">valor</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<p class="apoio" style="padding:4px 2px">' + n + (n === 1 ? ' lançamento' : ' lançamentos') + ' · soma ' + money(soma, cur, {d:0}) + '</p>';
}
function lancTable8(agr, cur, o){
  agr = agr || []; cur = cur || 'EUR'; o = o || {}; const ctx = o.ctx || '';
  if (!agr.length) return '<p class="muted" style="padding:6px 2px;font-size:.9375rem">Nenhum lançamento no livro para este item no período.</p>';
  const nat = (v, moeda) => moeda && moeda !== cur && v != null ? '<span class="sub">' + money(v, moeda, {d:2}) + '</span>' : '';
  const faixa = ps => ps.length ? (ps.length === 1 ? 'parcela ' + ps[0] : 'parcelas ' + ps[0] + '–' + ps[ps.length - 1]) : '';
  /* v10 (item 8): data · descrição (conta e observação como texto secundário, só quando existem) · valor */
  const rows = agr.map(x => x.tipo === 'parcelada'
    ? '<tr class="agr"><td>' + dataBr(x.de) + (x.ate && x.ate !== x.de ? '<span class="sub">a ' + dataBr(x.ate) + '</span>' : '') + '</td><td>' + esc(x.nome || '') + '<span class="sub">' + x.n_parcelas + ' parcelas de ' + money(x.valor_parcela_nativo, x.moeda_nativa || cur, {d:2}) + ' · compra ' + money(x.total_compra_nativo, x.moeda_nativa || cur, {d:2}) + (x.moeda_nativa && x.moeda_nativa !== 'EUR' ? ' (' + money(x.total_compra_eur, 'EUR', {d:0}) + ')' : '') + '</span><span class="sub">' + (x.conta ? esc(x.conta) + ' ' : '') + pil('neu peq', faixa(x.parcelas_no_periodo) + ' de ' + x.n_parcelas + ' no período', 'parcelas que caíram no período; o total da compra está na descrição') + paLink(dataBr(x.de), x.nome || '', money(x.no_periodo, cur, {d:2}), x.conta, ctx) + '</span></td><td class="num">' + money(x.no_periodo, cur, {d:2}) + '</td></tr>'
    : '<tr><td>' + dataBr(x.data) + '</td><td>' + esc(x.descricao || '') + '<span class="sub">' + (x.conta ? esc(x.conta) : '') + paLink(dataBr(x.data), x.descricao || '', money(x.valor, cur, {d:2}), x.conta, ctx) + '</span></td><td class="num">' + money(x.valor, cur, {d:2}) + nat(x.valor_nativo, x.moeda_nativa) + '</td></tr>').join('');
  const nP = agr.filter(x => x.tipo === 'parcelada').length, nL = sum(agr.map(x => x.tipo === 'parcelada' ? (x.ids || []).length : 1)), soma = sum(agr.map(x => x.tipo === 'parcelada' ? x.no_periodo : x.valor));
  return '<div class="rolavel"><table class="mini l5"><thead><tr><th>pago em</th><th>descrição</th><th class="num">valor</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<p class="apoio" style="padding:4px 2px">' + nL + (nL === 1 ? ' lançamento' : ' lançamentos') + (nP ? ' · ' + nP + (nP === 1 ? ' compra parcelada' : ' compras parceladas') + ' numa linha só' : '') + ' · soma ' + money(soma, cur, {d:0}) + '</p>';
}
/* v10 (e30): o salário do Tobia abre a lista da camada por mês de referência (`D.v9.salario_to_2026.meses`: mês · pago em · valor · recebido/a receber), não os lançamentos crus — o dobro de abril é março + abril */
const SAL_TO = (((D.v9 || {}).salario_to_2026 || {}).meses) || [];
function lancSalarioTo(){
  const L = SAL_TO.slice().sort((a, b) => String(a.mes_ref).localeCompare(String(b.mes_ref)) || String(a.pago_em || '').localeCompare(String(b.pago_em || '')));
  const notaH = t => esc(humano(String(t || '')).replace(/\s*\(?sugest[ãa]o Claude · validar:?\s*/gi, ' (').replace(/\(\s*\)/g, '').replace(/\b(20\d\d)-(\d\d)\b/g, (m, y, mo) => MES[+mo - 1] + '/' + y.slice(2)).replace(/\s{2,}/g, ' ').trim());   // a marca interna fica fora da tela (DESIGN: vive no ⓘ); mês como o app escreve
  const rows = L.map(x => { const ar = x.estado && x.estado !== 'recebido'; return '<tr' + (ar ? ' class="cred"' : '') + '><td>' + esc(mesPt(x.mes_ref)) + '</td><td>' + (ar ? '<span class="azul-t">a receber</span>' : 'pago em ' + dataBr(x.pago_em)) + (x.nota ? '<span class="sub">' + notaH(x.nota) + '</span>' : '') + '</td><td class="num">' + (ar ? '<span class="azul-t">' : '') + money(x.valor_eur, 'EUR', {d:2}) + (ar ? '</span>' : '') + (x.valor_brl != null ? '<span class="sub">' + money(x.valor_brl, 'BRL', {d:2}) + '</span>' : '') + '</td></tr>'; }).join('');
  const rec = L.filter(x => !x.estado || x.estado === 'recebido'), arL = L.filter(x => x.estado && x.estado !== 'recebido');
  return '<div class="rolavel"><table class="mini ent l5"><thead><tr><th>mês de referência</th><th>pagamento</th><th class="num">valor</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<p class="apoio" style="padding:4px 2px">' + rec.length + ' meses recebidos · ' + money(sum(rec.map(x => x.valor_eur || 0)), 'EUR', {d:0}) + (arL.length ? ' · ' + arL.length + ' a receber · ' + money(sum(arL.map(x => x.valor_eur || 0)), 'EUR', {d:0}) : '') + '</p>';
}
/* ---------- tabela do componente único: 1ª coluna vazia · Planejado · Realizado · Desvio (barra) · 4ª coluna ---------- */
const VDASH = '<span class="muted">—</span>';
function tabela7(o){
  const chave = o.chave, todos = S.expAll[chave] != null ? !!S.expAll[chave] : !!o.aberto, ab = k => S.exp[k] != null ? !!S.exp[k] : todos, temF = o.nos.some(n => n.filhos && n.filhos.length);
  const vis = [], walk = (nd, pai) => { const k = (pai || chave) + '|' + nd.id; vis.push(nd); if (nd.filhos && nd.filhos.length && ab(k)) nd.filhos.forEach(f => walk(f, k)); };
  o.nos.forEach(nd => walk(nd));
  const mx = Math.max(0, ...vis.map(n => n.dv && n.dv.desvio != null ? Math.abs(eurDe(n.dv.desvio, n.cur || o.cur || 'EUR')) : 0));
  const di = o.cols.findIndex(c => c.dv);
  const abrir = temF ? '<button class="btn link peq" type="button" data-act="exp-all" data-k="' + chave + '" data-ab="' + (o.aberto ? 1 : 0) + '">' + (todos ? 'Recolher' : 'Abrir tudo') + '</button>' : '';
  let h = o.ferr ? '<div class="cat-ferr">' + o.ferr + '</div>' : '';   // P2-12: «Abrir tudo» mora na 1ª célula do cabeçalho; a faixa só existe quando há a chave do desvio
  h += '<div class="cat-tab c4d' + (o.cls ? ' ' + o.cls : '') + '" role="table"><div class="cat-h" role="row"><span class="it">' + abrir + '</span>' + o.cols.map(c => '<span class="n' + (c.dv ? ' p' : '') + '">' + c.rot + (c.sub ? '<small>' + c.sub + '</small>' : '') + (c.sub2 ? '<small class="b2">' + c.sub2 + '</small>' : '') + '</span>').join('') + '</div>';
  const cel = (cells, nd, nivel) => cells.map((v, i) => '<span class="n' + (o.cols[i].dv ? ' p' : '') + '" data-l="' + esc(o.cols[i].l || o.cols[i].rot) + '">' + (i === di && nd ? (nd.dv ? dvCell(nd.dv, nd.cur || o.cur, mx, {palavra:nivel === 0 || nd.palavra}) : '') : v) + '</span>').join('');
  /* P1-2: o ⓘ inline (span) viaja com a última palavra do nome (`.nw`): nunca cai sozinho em linha nova; a etiqueta («reembolso 94 %») vem depois e pode descer uma linha */
  const nomeCom = nd => { const n = esc(nd.nome), un = nd.un ? ' <span class="un">' + nd.un + '</span>' : ''; if (!nd.pop) return n + un; const m = n.match(/^(.*\s)?(\S+)$/); return (m && m[1] ? m[1] : '') + '<span class="nw">' + (m ? m[2] : n) + ' ' + nd.pop + '</span>' + un; };
  const linha = (nd, nivel, pai) => {
    const k = (pai || chave) + '|' + nd.id, tf = nd.filhos && nd.filhos.length, tl = (nd.lanc && nd.lanc.length) || !!nd.lancHtml, on = tf ? ab(k) : !!S.exp[k];   // v8: `lancHtml` = lançamentos já montados (entradas, parcelas agrupadas)
    const nm = nomeCom(nd), bt = tf || tl ? '<button class="cat-b" type="button" data-act="exp" data-k="' + esc(k) + '" aria-expanded="' + on + '">' + SETA + '<span class="t">' + nm + '</span></button>' : '<span class="cat-b" style="cursor:default;padding-left:22px"><span class="t">' + nm + '</span></span>';
    h += '<div class="cat-r ' + (nivel === 0 ? 'cat' : nivel === 1 ? 'it' : 'it it2') + (tf && nivel > 0 ? ' tem-f' : '') + (nd.cls ? ' ' + nd.cls : '') + '" role="row"><span class="it">' + bt + (nd.etq || '') + (nd.tag ? '<span class="cat-tag">' + nd.tag + '</span>' : '') + '</span>' + cel(nd.cells, nd, nivel) + '</div>';
    if (on && tf) nd.filhos.forEach(f => linha(f, nivel + 1, k));
    if (on && !tf && tl) h += '<div class="lanc">' + (nd.lancHtml || lancTable5(nd.lanc, nd.cur || o.cur || 'EUR')) + '</div>';
    if (nd.extra && on) h += '<div class="cat-r it tot-eur" role="row"><span class="it"><span class="cat-b" style="cursor:default;padding-left:26px"><span class="t">' + nd.extra.rot + '</span></span></span>' + cel(nd.extra.cells, null) + '</div>';
  };
  o.nos.forEach(nd => linha(nd, 0));
  const tot = (t, cls) => '<div class="cat-r cat-tot ' + (cls || '') + '" role="row"><span class="it">' + t.rot + '</span>' + cel(t.cells, null) + '</div>';
  if (o.total) h += tot(o.total);
  if (o.totalEur) h += tot(o.totalEur, 'eur');
  return h + '</div>';
}
/* campo editável do Orçamento: o valor que o Tobia digitou (D68), com a unidade embaixo; `data-n="7"` = sem fator (o campo é o próprio número) */
const fmtCampo = v => v == null ? '' : (Math.round(v * 100) < 0 ? '−' : '') + new Intl.NumberFormat('pt-BR', {maximumFractionDigits:2}).format(Math.abs(v));
/* v8: o valor que o Tobia digitou fica marcado (borda teal + ponto) e guardado neste navegador (item 10): `seu` = veio da edição, na tela ou do guardado */
const campo7 = (id, v, rot, hint, cls) => { const e = S.orc.ed[id], inv = !!(e && e.x == null && String(e.raw || '').trim()), seu = !!e && !inv; return '<span class="campo-w' + (seu ? ' seu' : '') + '"' + (seu ? ' title="seu valor: vale no lugar do combinado e é gravado na planilha, com o seu nome e a hora"' : '') + '><input class="inp ' + (cls || '') + (seu ? ' seu' : '') + (inv ? ' inv' : '') + '" type="text" inputmode="decimal" data-orc="' + esc(id) + '" data-n="7" value="' + esc(e ? e.raw : fmtCampo(v)) + '" placeholder="—" aria-label="' + esc(rot + (seu ? ' (seu valor)' : '')) + '"' + (inv ? ' aria-invalid="true"' : '') + '>' + (inv ? '<span class="erro" role="alert">não entendi este número · escreva como 1.250 ou 16 mil</span>' : '') + '</span>' + (hint ? '<span class="apoio">' + hint + '</span>' : ''); };   // P1-8: «abc» avisa no próprio campo e vale o combinado
/* v8 (item 10, «você não apaga depois que eu preencho»): o orçado digitado, a meta e a taxa Henner ficam guardados neste navegador (chave estável, sem versão) e voltam ao abrir —
   sobrevivem a regerar o HTML; o valor digitado vence o do gerador e aparece marcado. Tudo em try/catch: sem localStorage a tela funciona igual. «Desfazer as edições» apaga o guardado. */
/* ---- v9 · guardado por ano (G4): o ano de referência e o do ano seguinte nascem aqui porque o orçado guardado é lido antes de tudo ---- */
const SONDA_ANO = null;   // sonda da virada do ano (G4): ?ano_ref=2027 finge o ano novo só para a camada de guardado
const SIM9 = ((D.v9 || {}).simulacao) || null, ANO_REF = SONDA_ANO || (SIM9 && SIM9.ano_ref) || ANO, ANO_SIM = SONDA_ANO ? SONDA_ANO + 1 : ((SIM9 && SIM9.ano_sim) || (ANO_REF + 1));
const SIM_KEY = 'casa.simulacao.' + ANO_SIM, ORC_KEY_ANO = 'casa.orcado.' + ANO_REF;
const lsGet = k => { try { return JSON.parse(ECON.mem.getItem(k) || 'null'); } catch (e) { return null; } };
const lsSet = (k, v) => { try { if (v == null) ECON.mem.removeItem(k); else ECON.mem.setItem(k, JSON.stringify(v)); } catch (e) {} };
S.virada = null;
(function migrarGuardado(){
  try {
    const leg = lsGet('casa.orcado'); if (leg && typeof leg === 'object'){ const anoLeg = leg.ano || (leg.gerado_para) || null; if (!lsGet('casa.orcado.' + (anoLeg || ANO_REF))) lsSet('casa.orcado.' + (anoLeg || ANO_REF), Object.assign({ano:anoLeg || ANO_REF}, leg)); ECON.mem.removeItem('casa.orcado'); }
    const legS = lsGet('casa.simulacao'); if (legS && typeof legS === 'object' && legS.ano){ if (!lsGet('casa.simulacao.' + legS.ano)) lsSet('casa.simulacao.' + legS.ano, legS); ECON.mem.removeItem('casa.simulacao'); }
    /* virada: não há orçado guardado para o ano de referência, mas há a simulação feita para ele → vira o orçado dele (nada se perde: a simulação fica guardada, o orçado do ano anterior também) */
    if (!lsGet(ORC_KEY_ANO)){ const simAnt = lsGet('casa.simulacao.' + ANO_REF); if (simAnt && typeof simAnt === 'object' && simAnt.ano === ANO_REF){
      const ed = {}, pend = []; Object.keys(simAnt.ed || {}).forEach(id => { const x = simAnt.ed[id]; if (typeof x === 'number' && isFinite(x)){ if (/^aj\|/.test(id)) pend.push({tipo:'ajuste', id, valor:x}); else ed[id] = x; } });
      (simAnt.novos || []).forEach(v => pend.push({tipo:'item novo', bloco:v.n, nome:v.nome, valor:v.x, ini:v.ini}));
      const orcAnt = lsGet('casa.orcado.' + (ANO_REF - 1)) || {};
      lsSet(ORC_KEY_ANO, {ano:ANO_REF, ed, meta:orcAnt.meta || '', taxa:orcAnt.taxa != null ? orcAnt.taxa : null, plan:null, promovido_de:'casa.simulacao.' + ANO_REF, promovido_em:new Date().toISOString().slice(0, 10), pendentes:pend});
      S.virada = {ano:ANO_REF, n:Object.keys(ed).length, pend}; } }
    const promo = lsGet(ORC_KEY_ANO); if (!S.virada && promo && promo.promovido_de && !promo.aviso_lido) S.virada = {ano:ANO_REF, n:Object.keys(promo.ed || {}).length, pend:promo.pendentes || []};
  } catch (e) {}
})();
const ORC_KEY = ORC_KEY_ANO;   // v9: casa.orcado.{ano_ref}
/* conserto e29 (item 5): item que mudou de bloco no plano de contas (o aniversário: «3.3|…» → «4.2.4|…») — o orçado digitado com o id velho migra ao id novo, quando o nome bate num id só */
function migrarIds(ed){ const ids = new Set(); const w = g => { ids.add(g.id); (g.grupos || []).forEach(w); (g.itens || []).forEach(i => ids.add(i.id)); }; Object.keys(B7_BASE).forEach(n => ((B7_BASE[n] || {}).grupos || []).forEach(w)); const todos = [...ids], mig = [];
  Object.keys(ed || {}).forEach(id => { if (ids.has(id) || id.indexOf('|') < 0) return; const suf = id.slice(id.indexOf('|') + 1), alvo = todos.filter(k => k.indexOf('|') > 0 && k.slice(k.indexOf('|') + 1) === suf); if (alvo.length === 1 && ed[alvo[0]] == null){ ed[alvo[0]] = ed[id]; delete ed[id]; mig.push([id, alvo[0]]); } }); return mig; }
function lerOrcLocal(){ try { const s = JSON.parse(ECON.mem.getItem(ORC_KEY) || 'null'); if (!s || typeof s !== 'object') return; const mig = migrarIds(s.ed); if (mig.length){ S.orc.migrados = mig; try { ECON.mem.setItem(ORC_KEY, JSON.stringify(s)); } catch (e) {} } Object.keys(s.ed || {}).forEach(id => { const x = s.ed[id]; if (typeof x === 'number' && isFinite(x)) S.orc.ed[id] = {raw:fmtCampo(x), x, guardado:true}; }); if (typeof s.meta === 'string') S.orc.meta = s.meta; if (typeof s.taxa === 'number' && isFinite(s.taxa)){ S.orc.taxa = s.taxa; S.orc.taxaRaw = toIn(s.taxa * 100); }
  if (s.plan && typeof s.plan === 'object'){ const p = s.plan; if (typeof p.total === 'number'){ S.plan.total = p.total; S.plan.totalRaw = toIn(p.total); } if (p.dias) S.plan.dias = p.dias; if (p.pes) S.plan.pes = p.pes; if (p.ed && typeof p.ed === 'object') S.vgEd.v27 = p.ed; S.plan.guardadoEm = p.guardadoEm || true; } } catch (e) {} }   // G1b: o planejador guardado volta junto
function gravarOrcLocal(){ try { const ed = {}; Object.keys(S.orc.ed).forEach(id => { const e = S.orc.ed[id]; if (e && e.x != null && isFinite(e.x)) ed[id] = e.x; }); const plan = S.plan.guardadoEm ? {guardadoEm:S.plan.guardadoEm, total:S.plan.total, dias:S.plan.dias, pes:S.plan.pes, ed:S.vgEd.v27 || {}} : null; const ant = lsGet(ORC_KEY) || {}, promo = ant.promovido_de ? {promovido_de:ant.promovido_de, promovido_em:ant.promovido_em, pendentes:ant.pendentes || [], aviso_lido:!!ant.aviso_lido} : {}; if (!Object.keys(ed).length && !S.orc.meta && S.orc.taxa == null && !plan) ECON.mem.removeItem(ORC_KEY); else ECON.mem.setItem(ORC_KEY, JSON.stringify(Object.assign({ano:ANO_REF, ed, meta:S.orc.meta || '', taxa:S.orc.taxa, plan}, promo))); } catch (e) {} }   // v9 G4: por ano
function apagarOrcLocal(){ try { ECON.mem.removeItem(ORC_KEY); } catch (e) {} }
lerOrcLocal();
const seusPil = () => { const n = Object.keys(S.orc.ed).length; return n ? pil('neu seus', n === 1 ? '1 valor seu · gravado na planilha' : n + ' valores seus · gravados na planilha','o que você digitou vale no lugar do combinado até você desfazer; cada valor é gravado na planilha com o seu nome e a hora e entra na conta na próxima rodada') : ''; };
const fixo7 = (v, cur, hint) => '<span class="' + (v < -0.5 ? 'verde-t' : '') + '">' + money(v, cur) + '</span>' + (hint ? '<span class="apoio">' + hint + '</span>' : '');
function cel7(nd, cur, o){
  o = o || {}; cur = cur || nd.moeda || 'EUR';
  const pl = o.campo != null ? o.campo : (nd.planejado == null ? (nd.registro_bienal ? '<span class="muted" title="a cada 2 anos · próxima: ' + nd.registro_bienal.proximo + '">—</span>' : VDASH) : money(nd.planejado, cur));   // C1: número de crédito sem cor
  const dezP = o.tipo === 'ent' && !(nd.a_receber > 0.5) && (nd.aguardando || nd.estado === 'a_receber' || (nd.realizado == null && (nd.a_receber_quando || nd.id === 'decimo_terceiro')));   // conserto v9 G3 / e29: o 13º ainda não venceu (estado a_receber da camada) — «a receber em dez», sem «abaixo»
  let re = dezP ? '<span class="ar" title="ainda não entrou no livro">' + esc(nd.status_texto || nd.status || ('a receber em ' + (nd.a_receber_quando || 'dez'))) + '</span>' : nd.realizado == null ? (nd.nd ? '<span class="nd" title="ainda não entrou no livro">N/D</span>' : VDASH) : money(nd.realizado, cur);
  if (o.tipo === 'ent' && nd.a_receber > 0.5) re += '<span class="ar" title="a receber: ainda não entrou no livro">+ ' + money(nd.a_receber, cur) + '</span>';   // conserto P1-4: só o número em toda linha (a palavra «a receber» mora na barra e no título da coluna); nunca passa sob o chip
  if (o.tipo === 'mes' && nd.a_entrar > 0.5) re += '<span class="ar" title="líquido do que ainda vai entrar (reembolso, crédito)">' + money(nd.a_entrar, cur) + ' a entrar</span>';
  if (nd.estimativa && nd.a_pagar > 0.5) re += '<span class="est" title="' + esc(nd['nota_ⓘ'] || 'estimado: vira valor real quando o débito chegar') + '">estimado</span>';   // simétrico ao «a entrar»: o a pagar estimado leva a marca de processo
  return [pl, re, '', (nd.quarta == null ? VDASH : money(nd.quarta, cur)) + projVsOrc(nd, cur, o.tipo)];   // v10 · M4
}
const NOTA7 = {
  '1': b => '<b>Entradas do ano.</b> Orçado = 12 × o mensal combinado (e o valor do ano das anuais); ao editar, o campo é por mês e o ano aparece nos totais; Recebido = o que entrou no livro até ' + esc(mesPt(MF)) + '. O desvio — na linha, no total e no cabeçalho — compara <b>só o que entrou</b> com o orçado de jan–' + esc(mesCurto(MF)) + ' (o ano inteiro faria tudo parecer «abaixo»); o <b>a receber</b> (salário do Tobia ainda não pago) aparece à parte, em azul, e não entra no chip; na receita, acima do orçado é verde. Projetado = recebido + a receber + o mensal até dezembro. Salário Tobia em € pelo câmbio médio 1 € = R$ ' + fmt(CAM, 2) + '. A licença bienal da Ge entra a cada 2 anos (2025 e 2027): não entra em 2026. O que falta receber, por data, está no <a href="#fluxo">Fluxo de caixa</a>.',
  '2': b => '<b>Cotidiano por competência:</b> cada despesa e crédito contam no mês a que se referem (a data do pagamento fica na linha do lançamento). Planejado = o orçado que você digitou por item, líquido dos créditos (Education Allowance, reembolso Henner); farmácia (valor fixo que você assinou) e Henner (taxa × gasto de saúde) seguem a regra que você aprovou. Realizado = o do mês, líquido do que ainda vai entrar; o encargo da faxineira ainda não debitado entra como estimativa (73 % do líquido da faxina). <b>Desvio = realizado − planejado:</b> acima = + (vermelho), abaixo = − (verde), azul dentro de ±5 % (no item, ou € 20). A chave «do mês | da média 12 m» troca o que se compara ao planejado: o mês fechado ou a média dos 12 meses. Toque numa coluna do gráfico para ver outro mês.',
  '3': b => '<b>Viagens:</b> orçado por ano e por sub-bloco (Viagens diversas · Férias de verão · Férias no Brasil, esta em R$ convertido pelo câmbio médio); realizado = todas as linhas do ano até ' + esc(mesPt(MF)) + ' (compra no cartão conta na data da compra). Desvio = realizado + parcelas já assumidas − orçado; Projetado 2026 = o que já saiu + o que o orçado ainda prevê, viagem a viagem (a regra de cada linha está no ⓘ dela). A viagem inteira, com componentes e a proposta da próxima viagem, está em <a href="#viagens">Viagens</a>.',
  '4': b => '<b>Impostos na França:</b> parcelas pagas no realizado; as com data ainda por pagar entram no já assumido e no desvio. Os créditos de imposto (faxineira, guarda de criança) são anuais: orçado negativo, viram realizado quando o dinheiro cai — por isso o orçado do bloco é líquido e pode ser negativo; o que só entra em 2027 fica fora do Projetado 2026. <b>Outras no Brasil:</b> tudo em R$, com o total em € no fim' + (b && b.total && b.total.realizado_sem_orcado > 0.5 ? '; ' + money(b.total.realizado_sem_orcado, 'EUR') + ' do realizado não tem orçado e conta contra zero' : '') + '.',
  '5': b => '<b>Projetos</b> em duas categorias — <b>Casa</b> (mobiliário e eletrodomésticos; despesas com mudança) e <b>Pessoal</b> (renovação de eletrônicos; tratamento de saúde) — com os lançamentos dentro de cada item. Nenhum tem orçado no ano até você digitar no item: o realizado é gasto fora do plano e conta contra zero. <b>Projetado ' + ANO + '</b> = o que já saiu + o já assumido (compra parcelada com parcelas por cair): projeto é gasto pontual, não repete nos meses que faltam, mesmo com orçado digitado. Aporte em investimento é transferência entre contas próprias, não sai como gasto.',
  '6': () => '<b>Resultado = entradas − blocos 2 a 5</b>, na janela da chave. Painel: <b>último mês fechado</b> (' + esc(mesCurto(MF)) + ', com o salário a receber dele) · <b>ano até ' + esc(mesCurto(MF)) + '</b> (contando o a receber: por isso diz «sobra se o salário entrar» e mostra ao lado o número sem ele) · <b>12 m</b> (média por mês dos 12 meses fechados, com a licença bienal de dez/25 e o 13º) · <b>projetado ' + ANO + '</b> (jan–dez: realizado + orçado dos meses que faltam + a receber; só aqui a sobra é «prevista»). O a receber vai hachurado no nó das entradas: é o salário do Tobia dos meses em que nada entrou nas contas (pergunta aberta em <button class="btn link peq" type="button" data-act="ir-conf">A confirmar com você</button>). Orçamento: a <b>sobra orçada</b> = entradas orçadas − blocos orçados (a licença bienal fica fora de 2026). Verde = sobrou, vermelho = faltou. A rosca no menu mostra o peso de cada bloco de despesa na mesma janela.'
};
/* v10 · conserto M4: nos blocos anuais o projetado e o desvio têm de contar a mesma história — ao lado do Projetado, quanto ele fica acima ou abaixo do orçado (fora da margem de 5 %); dentro da margem, «= orçado» só quando o desvio está fora dela */
function projVsOrc(nd, cur, tipo){
  if (tipo !== 'ano' || !nd || nd.quarta == null || nd.planejado == null || Math.abs(nd.planejado) < 0.5) return '';
  const d = nd.quarta - nd.planejado, tol = 0.05 * Math.abs(nd.planejado), fora = Math.abs(d) > tol, dvFora = nd.desvio != null && Math.abs(nd.desvio) > tol;
  if (!fora && !dvFora) return '';
  if (!fora) return '<span class="apoio pj-d" title="o projetado fecha no orçado">= orçado</span>';
  return '<span class="apoio pj-d ' + (d > 0 ? 'verm' : 'verde') + '" title="projetado − orçado do ano">' + (d < 0 ? '−' : '+') + money(Math.abs(d), cur) + ' vs orçado</span>';
}
const NOTA_DV = {mes:'<b>Desvio = realizado − planejado.</b> Barra à direita e vermelho = gastou acima do planejado · à esquerda e verde = abaixo · azul = dentro de ±5 % (no item, ±5 % ou € 20). A escala é o maior desvio das linhas à vista: abrir uma categoria recalcula. Grupo e total levam a palavra; o item, o número.', ano:'<b>Desvio = realizado + já assumido − orçado do ano:</b> parcela de imposto ou de cartão com data ainda por pagar já conta, e crédito de imposto que vai entrar abate. Por isso o desvio nem sempre é «Realizado − Planejado» da linha: a linha que conta algo assim leva um * e a explicação no title. Barra à direita e vermelho = acima do orçado · à esquerda e verde = abaixo · azul = dentro de ±5 %. Linha sem orçado conta contra zero no total. A escala é o maior desvio das linhas à vista.', ent:'<b>Desvio = recebido − orçado até o mês fechado</b> (só o que entrou; o salário a receber fica à parte, em azul, e não entra no desvio nem no chip). Receita acima do orçado = direita e <b>verde</b>; abaixo = esquerda e vermelho; azul dentro de ±5 %.'};   // v10 · G1: a mesma regra do título da coluna
/* ---------- o bloco: cabeçalho (total sempre à vista, D75/279) · barra D76 · tabela de 4 colunas ---------- */
/* conserto e29 (P0-1): em Entradas o desvio mostrado é só do que entrou (realizado − planejado até o mês); o a receber (salário ainda não pago) vai à parte, nunca dentro do chip verde */
const soEntrou = (x, tipo, cur) => { if (tipo !== 'ent' || !x || !(x.a_receber > 0.5) || x.desvio == null) return x; const d = x.desvio - x.a_receber, base = x.planejado_ate_mes != null ? x.planejado_ate_mes : x.planejado; return Object.assign({}, x, {desvio:d, desvio_pct:base ? d / Math.abs(base) * 100 : null}, estado7(d, base, true, false, x.moeda || cur)); };   // v10 · G1: a margem é sobre o orçado até o mês fechado (a mesma base do desvio), nunca sobre o ano
function bloco7(scope, b, o){
  o = o || {}; const n = b.id, on = ehAb(scope, n), cur = b.moeda_tabela || 'EUR', tipo = b.tipo === 'mes' ? 'mes' : n === '1' ? 'ent' : 'ano';
  const pm = o.pm || null, T = pm ? pm.total : b.total, grupos = pm ? pm.grupos : b.grupos, per = pm ? pm.rotulo : String(b.periodo);
  const chaveDv = n === '2' ? (S.pn.dvChave || 'mes') : 'mes', dvDe = nd => chaveDv === 'media12' ? {desvio:nd.desvio_12m, estado:nd.estado_12m, bom:nd.bom_12m, moeda:nd.moeda, realizado:nd.realizado, planejado:nd.quarta} : nd;
  const direita = '<b data-conf="' + scope + '-b' + n + '-real">' + money(T.realizado, cur) + '</b><span data-conf="' + scope + '-b' + n + '-desvio">' + chip7(dvDe(soEntrou(T, tipo, cur)), cur, {palavra:true}) + '</span>' + (tipo === 'ent' && T.a_receber > 0.5 ? pil('azul', '+ ' + money(T.a_receber, cur) + ' a receber', 'salário ainda não pago: fora do chip, por data no Fluxo de caixa') : '');   // e29 (P0-1): o chip de Entradas lê só o que entrou; o a receber aparece à parte
  /* v10 (item 4): no Cotidiano do Painel o chip do mês vira botão e abre a escolha do mês (além do clique na coluna do Mês a mês) */
  const perBtn = n === '2' && scope === 'pn' && b.por_mes ? mesChooser(b, per) : '';
  const titulo = esc(b.nome) + (perBtn ? '' : ' <span class="per">' + esc(per) + '</span>');
  const corpo = on ? '<div class="bloco-corpo" id="' + scope + '-corpo-' + n + '">' + (o.antes || '') + barraOR(pm ? Object.assign({}, b, {barra:pm.barra}) : b, {ja:tipo === 'ano' ? T.ja_assumido : 0, ent:tipo === 'ent', ritmoMes:tipo === 'mes' ? ((pm ? pm.barra : b.barra) && (pm ? pm.barra : b.barra).ritmo_mes_pct != null ? (pm ? pm.barra : b.barra).ritmo_mes_pct : 100) : null}) + (o.meio || '') + tabelaBloco7(scope, b, Object.assign({tipo, cur, grupos, T, dvDe, chaveDv, per}, o)) + (o.depois || '') + '</div>' : '';
  return '<section class="bloco b7" id="' + scope + '-bloco-' + n + '" style="' + blVars(n) + '" aria-label="Bloco ' + n + ' · ' + esc(b.nome) + '">' + cabTog(scope, n, titulo, direita, perBtn + pop(NOTA7[n] ? NOTA7[n](b) : '', 'como este bloco é calculado')) + corpo + '</section>';
}
function mesChooser(b2, per){
  const ms = Object.keys(b2.por_mes).sort(), atual = S.mesSel || b2.mes_padrao || MES_PAD, id = 'pop-' + (++POPN);
  return '<button class="per-b pop-b" type="button" data-act="pop" data-pop="' + id + '" aria-label="escolher o mês do Cotidiano (hoje ' + esc(per) + ')" aria-expanded="false">' + esc(per) + '<span class="seta-d" aria-hidden="true">▾</span></button>' +
    '<div class="pop pop-mes" id="' + id + '" popover role="dialog" aria-label="Escolher o mês do Cotidiano"><h4>Ver o Cotidiano de</h4><div class="pop-mes-g">' + ms.map(m => '<button class="btn peq" type="button" data-act="mes-sel-pop" data-v="' + esc(m) + '" aria-pressed="' + (m === atual) + '">' + esc((b2.por_mes[m] || {}).rotulo || mesPt(m)) + '</button>').join('') + '</div></div>';
}
function tabelaBloco7(scope, b, o){
  const n = b.id, edit = !!o.edit, cur = o.cur, tipo = o.tipo, T = o.T, dvDe = o.dvDe;
  /* P1-3: a base do desvio vai no título da coluna (2ª linha pequena), não só no ⓘ */
  const baseDv = tipo === 'ent' ? 'só o que entrou' : tipo === 'ano' ? 'com o já assumido' : (o.chaveDv === 'media12' ? 'média 12 m − orçado' : 'do mês fechado');
  const colDv = {rot:'Desvio' + pop(NOTA_DV[tipo], 'como ler o desvio', 'col'), l:'Desvio', sub:'◀ abaixo · acima ▶', sub2:baseDv, dv:true};
  const cols = tipo === 'mes' ? [{rot:'Orçado', sub:'€/mês'}, {rot:'Realizado', sub:esc(o.per)}, colDv, {rot:'Médio 12 m', sub:'€/mês'}]
    : [{rot:'Orçado', sub:String(b.periodo)}, {rot:tipo === 'ent' ? 'Recebido' : 'Realizado', sub:'até ' + esc(mesPt(MF))}, colDv, {rot:'Projetado', sub:String(b.periodo)}];   // conserto v9 P1-7: um nome só («Orçado»), travada ou editando; a unidade do campo fica ao lado do nome; «+ a receber» mora no ⓘ   // P2-10 · conserto P1-4: «o ano nos totais» foi para o ⓘ; a palavra «a receber» vive no título · v9: «Orçado» em toda coluna editável
  const chave = scope + '7-' + n, vis = x => x.visivel !== false;
  const henner = n === '2' ? ((N2['2.3'] || {}).henner || null) : null;
  const semRS = s => String(s || '').replace(/\s*·\s*R\$\s*$/, '');   // P2-3: «· R$» só marca tabela em R$; o salário do Tobia está em € no Painel (no Orçamento a unidade do campo diz R$/mês)
  const baseTxt = x => { const ja = x.ja_assumido; if (tipo !== 'ano' || ja == null || Math.abs(ja) <= 0.5) return ''; const c = x.moeda || cur; return ja > 0 ? 'conta ' + money(ja, c) + ' já assumido (parcela com data ainda por pagar)' : /^4\.3/.test(String(x.id || '')) ? 'conta ' + money(-ja, c) + ' de reembolso a receber (já no Fluxo de caixa; abate só o projetado)' : 'conta ' + money(-ja, c) + ' de crédito ainda por entrar'; };   // onda 12: no 4.3 o já assumido negativo é o reembolso a receber (campo reembolso_a_receber da camada), nunca «parcela de imposto»
  const dvCom = x => { const d = dvDe(soEntrou(x, tipo, cur)); if (!d) return d; const bt = baseTxt(x); return bt ? Object.assign({}, d, {base_txt:bt}) : d; };   // e29: Entradas pelo que entrou
  /* e29 (item 9): compra parcelada com parcelas ainda por cair (a estadia da FIV, 5.4) — o ⓘ diz o que compõe a linha, não só a clínica */
  const compTxt = x => { const A = x.lancamentos_agrupados || []; if (!A.length || !A.some(a => a.tipo === 'parcelada' && (a.n_parcelas || 0) > (a.parcelas_no_periodo || []).length)) return ''; const c = x.moeda || cur;
    return '<b>O que compõe esta linha:</b> ' + A.map(a => a.tipo === 'parcelada' ? esc(a.nome || '') + ' · compra parcelada em ' + a.n_parcelas + ' (' + (a.parcelas_no_periodo || []).length + ' caíram até ' + esc(mesCurto(MF)) + ' = ' + money(a.no_periodo, c) + '; as ' + (a.n_parcelas - (a.parcelas_no_periodo || []).length) + ' que faltam entram como já assumido)' : esc(a.descricao || '') + ' ' + money(a.valor, c)).join(' · '); };
  const popDe = (x, rot) => { const L = [x['nota_ⓘ'] ? esc(humano(x['nota_ⓘ'])) : '', feriasNota(x), compTxt(x), x.registro_bienal ? 'a cada 2 anos (' + x.registro_bienal.anos.join(', ') + ') · próxima: ' + x.registro_bienal.proximo + ' · valor por ocorrência ' + money(x.registro_bienal.valor, 'EUR') : '', tipo === 'ano' && x.projetado_regra ? '<b>Projetado ' + esc(String(b.periodo)) + ':</b> ' + esc(x.projetado_regra) : '', baseTxt(x) ? '<b>Desvio</b> ' + esc(baseTxt(x)) : ''].filter(Boolean); return L.length ? pop(L.join(' · '), 'sobre ' + rot, 'peq') : ''; };
  const unDe = (it, gcur) => {   // P1-2: a unidade do campo fica ao lado do nome, não sob o campo: a linha fica em 48 px
    if (!edit) return '';
    if (n === '1'){ if (it.orcado_nativo) return (it.planejado_mes != null ? 'R$/mês ≈ ' + money(it.planejado_mes, 'EUR') : 'R$/ano ≈ ' + money(it.planejado, 'EUR')); if (it.planejado_mes != null) return '€/mês × 12'; if (it.registro_bienal) return 'por ocorrência'; return ''; }   // v8: o 13º em R$ no ano, com o € ao lado (igual ao Salário Tobia)
    if (n === '2'){ if (it.editavel === false || (it.orcado_origem && it.editavel !== true)) return 'por regra'; const f = fatorAno(it.id); return f !== 12 ? '× ' + fmt(f, 0) + ' meses' : (it.orcado_origem ? 'média 12 m' : ''); }   // e29: os meses vêm de fator_ano (escola 10, férias 3)
    return '';
  };
  /* v8: Entradas abrem as `linhas` (salário igual numa linha só, o que difere em linha própria); blocos 2–5 abrem `lancamentos_agrupados` (parcelas numa linha só); sem eles, as linhas da v6 pelos ids */
  const lancDe = it => n === '1' && it.id === 'salario_to' && SAL_TO.length ? lancSalarioTo() : n === '1' && it.linhas ? lancEntradas(it.linhas, 'EUR', {ctx:b.nome + ' › ' + it.nome}) : it.lancamentos_agrupados ? lancTable8(it.lancamentos_agrupados, it.moeda || cur, {ctx:b.nome + ' › ' + it.nome}) : null;   // v10 (e30): o salário do Tobia pela lista por mês de referência
  const dezDe = it => tipo === 'ent' && !(it.a_receber > 0.5) && (it.aguardando || it.estado === 'a_receber' || (it.realizado == null && (it.a_receber_quando || it.id === 'decimo_terceiro')));   // e29 (achado 5): lê o estado a_receber da camada
  const itemNo = (it, gcur, campo, semDv) => ({id:it.id, nome:semRS(it.nome) + (it.asterisco ? ' *' : ''), un:unDe(it, gcur), cur:gcur, tag:tipo !== 'ent' && tipo !== 'mes' && (it.realizado || 0) < -0.5 ? pil('azul peq', 'reembolso passou do gasto', 'entrou mais reembolso do que saiu de gasto neste item: por isso o valor é negativo num bloco de saída') : '', cells:cel7(it, gcur, {tipo, campo}), dv:semDv || dezDe(it) ? null : dvCom(it), lanc:lanc7(it.lancamentos), lancHtml:lancDe(it), cls:'', pop:dezDe(it) ? pop(it['nota_ⓘ'] ? esc(humano(it['nota_ⓘ'])) : '<b>13º salário:</b> ainda não entrou em ' + ANO + ' (nenhum 13º identificado no livro até ' + esc(mesPt(MF)) + '); costuma cair em dezembro ou janeiro. Até entrar, não conta no desvio nem no projetado.', 'sobre o 13º', 'peq') : popDe(it, it.nome)});
  const campoDe = (it, gcur) => {
    if (!edit) return null;
    if (n === '1'){
      if (it.orcado_nativo) return campo7(it.id, it.orcado_nativo.valor, 'Orçado mensal de ' + it.nome + ' em R$');
      if (it.planejado_mes != null) return campo7(it.id, it.planejado_mes, 'Orçado mensal de ' + it.nome);
      if (it.registro_bienal) return fixo7(it.registro_bienal.valor, 'EUR', 'a cada 2 anos · não entra em ' + ANO);   // conserto v9: campo sem efeito não é campo
      return campo7(it.id, it.planejado, 'Orçado no ano de ' + it.nome);
    }
    if (n === '2'){ if (it.editavel === false || (it.orcado_origem && it.editavel !== true)) return fixo7(it.planejado, 'EUR'); return campo7(it.id, it.planejado, 'Orçado mensal de ' + it.nome); }   // Farmácia = campo (editável); Henner = fórmula, sem campo
    return campo7(it.id, it.planejado, 'Orçado no ano de ' + it.nome);
  };
  const eurRow = g => g.total_eur ? {rot:'Total em € <span class="apoio">câmbio ' + fmt(CAM, 2) + '</span>', cells:[money(g.total_eur.planejado, 'EUR'), money(g.total_eur.realizado, 'EUR'), chip7(g.total_eur, 'EUR', {palavra:true}), money(g.total_eur.quarta, 'EUR')]} : null;
  const nos = (o.grupos || []).filter(g => edit || vis(g) && (g.realizado != null && Math.abs(g.realizado) > 0.5 || g.planejado != null || (g.itens || []).some(vis) || (g.grupos || []).length)).map(g => {
    const gcur = g.moeda || cur, noPai = !!g.orcado_no_pai, campoG = edit && noPai ? campo7(g.id, g.planejado, 'Orçado no ano de ' + g.nome, '') : null;
    const filhos = g.grupos && g.grupos.length ? g.grupos.filter(h => edit || vis(h) && ((h.itens || []).some(vis) || h.planejado != null)).map(h => ({id:h.id, nome:h.nome, cur:gcur, cells:cel7(h, gcur, {tipo}), dv:dvCom(h), palavra:true, pop:popDe(h, h.nome), filhos:(h.itens || []).filter(i => edit || vis(i)).map(i => itemNo(i, gcur, campoDe(i, gcur)))}))
      : (g.itens || []).filter(i => (vis(i) || (edit && !noPai)) && (edit || i.planejado != null || Math.abs(i.realizado || 0) > 0.5 || (i.a_receber || 0) > 0.5 || (tipo !== 'mes' && Math.abs(i.quarta || 0) > 0.5))).map(i => itemNo(i, gcur, noPai ? (i.planejado == null ? VDASH : undefined) : campoDe(i, gcur), noPai));   // conserto P2-5: linha zerada no período some (a licença bienal fica no Orçamento, com «próxima 2027»)
    const saude = n === '2' && g.id === '2.3' && henner && henner.m12 && henner.m12.pct != null;
    const tag = saude ? pop('Reembolso Henner = ' + fmt(M5.henner.taxa * 100, 0) + ' % × (consultas e exames + farmácia e ótica), por competência; nos últimos 12 meses voltou ' + fmt(henner.m12.pct, 0) + ' % do gasto (faixa ' + M5.henner.faixa.join('–') + ' % = no plano). O que ainda vai entrar abate o realizado do mês.', 'como o reembolso é calculado', 'peq') : popDe(g, g.nome);
    return {id:g.id, nome:g.nome + (gcur === 'BRL' ? ' · R$' : ''), cur:gcur, cells:cel7(g, gcur, {tipo, campo:campoG, nivel:0}), dv:dvCom(g), pop:tag, etq:'', filhos, extra:eurRow(g)};   // conserto P2-9: a etiqueta «reembolso N %» mora no ⓘ (a linha fica em 52 px)
  });
  const totCells = [T.planejado == null ? VDASH : '<span data-conf="' + scope + '-b' + n + '-plan">' + money(T.planejado, cur) + '</span>', money(T.realizado, cur) + (tipo === 'ent' && T.a_receber > 0.5 ? '<span class="ar" title="a receber: ainda não entrou no livro">+ ' + money(T.a_receber, cur) + '</span>' : '') + (tipo === 'mes' && T.a_entrar > 0.5 ? '<span class="ar">' + money(T.a_entrar, cur) + ' a entrar</span>' : ''), chip7(dvDe(soEntrou(T, tipo, cur)), cur, {palavra:true}), (T.quarta == null ? VDASH : money(T.quarta, cur)) + projVsOrc(T, cur, tipo)];   // v10 · G1: o Total obedece à mesma regra das linhas e do cabeçalho (só o que entrou) · M4: o projetado diz quanto fica do orçado
  return tabela7({chave, cls:edit ? 'ed' : '', cur, cols, nos, aberto:edit, ferr:'', total:{rot:'Total', cells:totCells}});   // v8: no Painel tudo abre recolhido (pedido do Tobia); no Orçamento os campos precisam estar à vista · v10: a chave do desvio mora na legenda do Mês a mês (dvToggle)
}
/* ---------- bloco 6 · Resultado: leque (Sankey de uma fonte), sem texto e sem chave (§ 5.3) ---------- */
function leque(V, o){
  o = o || {}; if (!V) return '<p class="muted">Sem resultado.</p>';
  const ent = V.entradas || 0, sob = V.sobra || 0, faltou = sob < -0.5, bl = ['b2', 'b3', 'b4', 'b5'].map(k => ({id:k, n:k[1], nome:k[1] + ' · ' + NOME[k[1]], v:Math.max(0, (V.saidas || {})[k] || 0), cor:COR[k[1]]}));
  const ar = V.entradas_recebido != null ? Math.max(0, ent - V.entradas_recebido) : 0;   // P1-4: a parte a receber fica nomeada e hachurada no nó de origem
  const dest = bl.concat(faltou ? [] : [{id:'sobra', nome:o.sobraRot || (ar > 0.5 ? 'Sobra prevista' : 'Sobra'), v:Math.max(0, sob), cor:COR.sobra, sobra:true}]).filter(d => d.v > 0.5);
  const total = sum(dest.map(d => d.v)), W = 670, H = 300, x0 = 36, x1 = 430, gap = 10, hTot = H - 48 - gap * (dest.length - 1);
  let yL = 28, yR = 28, fitas = '', nos = '', rot = '';
  const ys = []; { let y = 28; dest.forEach(d => { const h = d.v / total * hTot; ys.push(y + h / 2); y += h + gap; }); ys[0] = Math.max(ys[0] || 0, 30); for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + 44); const over = ys.length ? ys[ys.length - 1] - (H - 16) : 0; if (over > 0) for (let i = 0; i < ys.length; i++) ys[i] -= over; for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + 44); }   // P2-9: pares de rótulo a ≥ 44 px
  dest.forEach((d, di) => { const h = d.v / total * hTot, y0 = yL, y1 = yR;
    fitas += '<path d="M' + (x0 + 26) + ',' + y0.toFixed(1) + ' C' + (x0 + 210) + ',' + y0.toFixed(1) + ' ' + (x1 - 180) + ',' + y1.toFixed(1) + ' ' + x1 + ',' + y1.toFixed(1) + ' L' + x1 + ',' + (y1 + h).toFixed(1) + ' C' + (x1 - 180) + ',' + (y1 + h).toFixed(1) + ' ' + (x0 + 210) + ',' + (y0 + h).toFixed(1) + ' ' + (x0 + 26) + ',' + (y0 + h).toFixed(1) + ' Z" fill="' + d.cor + '" opacity=".55"' + (d.n ? ' role="button" tabindex="0" data-act="' + (o.act || 'pn-bl') + '" data-v="' + d.n + '" style="cursor:pointer"' : '') + '><title>' + esc(d.nome + ': ' + money(d.v, 'EUR') + ' · ' + fmt(d.v / ent * 100, 0) + ' % das entradas') + '</title></path>';
    nos += '<rect x="' + x1 + '" y="' + y1.toFixed(1) + '" width="22" height="' + Math.max(h, 2).toFixed(1) + '" rx="4" fill="' + d.cor + '"/>';
    const ym = ys[di]; rot += (Math.abs(ym - (y1 + h / 2)) > 6 ? '<path d="M' + (x1 + 22) + ',' + (y1 + h / 2).toFixed(1) + ' L' + (x1 + 28) + ',' + ym.toFixed(1) + '" stroke="var(--borda-forte)" stroke-width="1.5" fill="none"/>' : '') + '<text x="' + (x1 + 32) + '" y="' + (ym - 5).toFixed(1) + '" class="lq-n" style="fill:' + (d.sobra ? 'var(--sobra-t)' : 'var(--c' + d.n + '-t)') + '">' + esc(d.nome) + '</text><text x="' + (x1 + 32) + '" y="' + (ym + 13).toFixed(1) + '" class="lq-v">' + esc(money(d.v, 'EUR')) + ' <tspan class="lq-p">· ' + fmt(d.v / ent * 100, d.sobra ? 1 : 0) + ' %</tspan></text>';
    yL += h; yR += h + gap; });
  const hEnt = faltou ? ent / total * hTot : hTot, hFal = faltou ? Math.max(0, -sob) / total * hTot : 0, hAr = ar > 0.5 ? hEnt * ar / ent : 0;
  const entRot = '1 · Entradas ' + money(ent, 'EUR') + (ar > 0.5 ? ' · com ' + money(ar, 'EUR') + ' a receber' : '');
  const esq = '<defs><pattern id="lq-hach" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="8" fill="#fff" opacity=".55"/></pattern></defs>' +
    '<rect x="' + x0 + '" y="28" width="26" height="' + hEnt.toFixed(1) + '" rx="4" fill="' + COR['1'] + '"/>' + (hAr > 0.5 ? '<rect x="' + x0 + '" y="' + (28 + hEnt - hAr).toFixed(1) + '" width="26" height="' + hAr.toFixed(1) + '" rx="4" fill="url(#lq-hach)"><title>' + esc(money(ar, 'EUR') + ' a receber') + '</title></rect>' : '') +
    '<text x="' + x0 + '" y="18" class="lq-n" style="fill:var(--c1-t)">' + esc(entRot) + '</text>' +   // P2-9: o rótulo fica fora da fita (contraste no branco), em cima do nó; conserto P0-2: cor por token (lê certo no escuro)
    (faltou ? '<rect x="' + x0 + '" y="' + (28 + hEnt).toFixed(1) + '" width="26" height="' + hFal.toFixed(1) + '" rx="4" fill="' + COR.neg + '"/><text x="' + x0 + '" y="' + Math.min(H - 4, 28 + hEnt + hFal + 15).toFixed(1) + '" class="lq-n" style="fill:var(--neg-t)">faltou ' + esc(money(-sob, 'EUR')) + ' · veio da reserva</text>' : '');   // conserto P1-8: o rótulo do faltou fica sob o nó vermelho, fora das fitas
  /* conserto · P0-3: no celular a barra mostra só as saídas (o faltou é origem, não destino), com as % sobre as entradas, as mesmas da tela grande; o faltou vira linha à parte */
  const emp = barraEmp(dest.map(d => ({nome:d.nome, v:d.v, cor:d.cor})), {aria:faltou ? 'Saídas, em % das entradas' : 'Entradas e para onde foram', titulo:faltou ? 'saídas · em % das entradas ' + money(ent, 'EUR') : entRot, h:32, pctDe:ent}) +
    (faltou ? '<p class="apoio" style="margin-top:6px"><b style="color:var(--neg-t)">faltou ' + esc(money(-sob, 'EUR')) + '</b> · veio da reserva: as saídas passaram as entradas (' + esc(entRot) + ')</p>' : '');
  return '<div class="leque"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc('Do que entra ao que sobra: ' + entRot + ', ' + dest.map(d => d.nome + ' ' + money(d.v, 'EUR')).join(', ') + (faltou ? ', faltou ' + money(-sob, 'EUR') : '')) + '">' + fitas + esq + nos + rot + '</svg><div class="lq-emp">' + emp + '</div></div>';
}
/* ---------- v8: as 4 janelas do Resultado (chave no Painel): último mês fechado · ano até o mês fechado · 12 m (média mensal) · projetado jan–dez. Lê `resultado.janelas`; o rótulo diz o período; «Sobra prevista» só no projetado ---------- */
const JAN8 = R7.janelas || null, JAN_ORDEM = ['mes', 'ano', 'm12', 'projetado'];
const JAN_ROT = {mes:'Último mês fechado', ano:'Ano até ' + mesCurto(MF), m12:'12 m (média mensal)', projetado:'Projetado ' + ANO};
const JAN_NOTA = {mes:'o mês fechado, contando o salário a receber dele', ano:'jan até ' + mesCurto(MF) + ', contando o a receber (o número sem ele está embaixo)', m12:'média por mês dos 12 meses fechados (inclui a licença bienal e o 13º)', projetado:'jan–dez: o que entrou e saiu + o orçado dos meses que faltam + o a receber'};   // conserto M5/P1-8: o texto diz o que o número conta
const JAN_ROT_CURTO = {mes:'Mês', ano:'Até ' + mesCurto(MF), m12:'Média 12 m', projetado:'Projetado'};
const janAtual = () => S.pn.janela || (R7.janela_padrao) || 'ano';
function janelaV(k){
  const j = JAN8 && JAN8[k]; if (!j) return null;
  const com = j.com_a_receber || {}, sem = j.sem_a_receber || {};
  if (k === 'm12' && j.por_mes){ const p = j.por_mes, d = p.divisor || 12, ar = ((com.entradas || 0) - (sem.entradas || 0)) / d;
    return {k, periodo:'média · ' + j.periodo, entradas:p.entradas, entradas_recebido:p.entradas - ar, saidas:p.saidas, saidas_total:p.saidas_total, sobra:p.sobra, sobra_sem_a_receber:sem.sobra != null ? sem.sobra / d : null, poupanca_pct:com.poupanca_pct, a_receber:ar, total12:{sobra:com.sobra, sem:sem.sobra, entradas:com.entradas}, nota:j.nota}; }
  const V = {k, periodo:j.periodo, entradas:com.entradas, entradas_recebido:(com.entradas || 0) - (j.a_receber_eur || 0), saidas:j.saidas, saidas_total:j.saidas_total, sobra:com.sobra, sobra_sem_a_receber:sem.sobra, poupanca_pct:com.poupanca_pct, a_receber:j.a_receber_eur || 0, nota:j.nota};
  if (k === 'projetado'){ const PJ = typeof projRecalc === 'function' ? projRecalc() : null; if (PJ){ Object.assign(V, {entradas:PJ.ent, entradas_recebido:PJ.ent - V.a_receber, saidas:PJ.sai, saidas_total:PJ.tot, sobra:PJ.sobra, sobra_sem_a_receber:PJ.sobra - V.a_receber, poupanca_pct:PJ.ent ? PJ.sobra / PJ.ent * 100 : null}); } }   // G1: o projetado lê o orçado digitado
  return V;
}
function chaveJanela(){
  if (!JAN8) return '';
  const jk = janAtual();
  const R = (window.innerWidth || 1280) < 600 ? JAN_ROT_CURTO : JAN_ROT;   // conserto P2-1: rótulos curtos no celular
  return '<div class="jan-chave">' + segBtns('Janela do resultado', JAN_ORDEM.filter(k => JAN8[k]).map(k => [k, R[k]]), 'pn-jan', jk, 'peq') + '<span class="apoio">' + esc(JAN_NOTA[jk] || '') + '</span></div>';
}
function bloco6(scope, V, o){
  o = o || {}; const on = ehAb(scope, '6'), sob = V ? V.sobra : null, pos = sob != null && sob >= -0.5;
  const prev = !!(V && V.k === 'projetado'), mes_ = !!(V && V.k === 'm12');   // conserto P1-8/P2-3: «previsto» no projetado (dezembro não aconteceu); «/mês» na média dos 12 m
  /* conserto e29 (P0-1 + M2): sobra com dinheiro a receber nunca sem aviso — bloco fechado, cabeçalho: «sobra se o salário entrar» + o número sem o a receber ao lado */
  const arV = V && V.a_receber > 0.5 ? V.a_receber : 0, semAr = arV && V.sobra_sem_a_receber != null ? V.sobra_sem_a_receber : null;
  const direita = sob == null ? '<span class="nd">N/D</span>' : '<b class="' + (pos ? 'sobra' : 'saida') + '" data-conf="' + scope + '-res-sobra">' + (sob < 0 ? '−' : '+') + money(Math.abs(sob), 'EUR') + (mes_ ? '<small>/mês</small>' : '') + '</b>' + (arV && !prev ? pil('ambar', (pos ? 'sobra' : 'falta') + ' se o salário entrar', money(arV, 'EUR') + ' a receber (salário do Tobia ainda não pago) estão dentro deste número') : pil(prev ? 'neu' : pos ? 'verde' : 'verm', prev ? (pos ? 'sobra prevista' : 'falta prevista') : pos ? 'sobrou' : 'faltou', V.periodo)) + (semAr != null ? '<span class="sem-ar" data-conf="' + scope + '-res-sem-ar">sem o a receber <b class="' + (semAr >= -0.5 ? 'sobra' : 'saida') + '">' + (semAr < 0 ? '−' : '+') + money(Math.abs(semAr), 'EUR') + '</b></span>' : '');
  const titulo = 'Resultado <span class="per">' + esc(V ? V.periodo : '') + '</span>';
  const corpo = on ? '<div class="bloco-corpo" id="' + scope + '-corpo-6">' + (o.antes || '') + leque(V, {act:scope === 'orc' ? 'orc-bloco' : 'pn-bl', sobraRot:o.sobraRot}) + (o.depois || '') + '</div>' : '';
  return '<section class="bloco b7 res" id="' + scope + '-bloco-6" style="' + blVars('6') + '" aria-label="Bloco 6 · Resultado">' + cabTog(scope, '6', titulo, direita, pop(NOTA7['6'](), 'como o resultado é calculado')) + corpo + '</section>';
}
const numRot = (rot, v, conf) => '<div class="rn"><span class="k">' + rot + '</span><b class="' + (v >= -0.5 ? 'sobra' : 'saida') + '"' + (conf ? ' data-conf="' + conf + '"' : '') + '>' + (v < 0 ? '−' : '+') + money(Math.abs(v), 'EUR') + '</b></div>';
/* ---------- Ano a ano (Painel, § 5.4): vertical por ano lado a lado · horizontal em chip dentro da célula · fundo tingido por linha · Poupança e meta ---------- */
/* conserto v9 G2: créditos de 2023–24 «a identificar» que ficaram fora da sobra — lê D.v9.creditos_fora em qualquer destas formas: {ano:{...}}, {por_ano:[...]} ou [...] */
const CF9 = (() => { const raw = (D.v9 || {}).creditos_fora; if (!raw) return {}; const out = {}; const put = (ano, x) => { if (!x || typeof x !== 'object') return; const v = x.valor_eur != null ? x.valor_eur : (x.fora_eur != null ? x.fora_eur : (x.total_eur != null ? x.total_eur : x.eur)); if (typeof v !== 'number') return; out[String(ano)] = {valor:v, geEnt:x.ge_nas_entradas_eur, n:x.n_linhas || x.n || (Array.isArray(x.linhas) ? x.linhas.length : null), sobraSe:x.sobra_se_entrar_eur != null ? x.sobra_se_entrar_eur : (x.sobra_com_eur != null ? x.sobra_com_eur : null), nota:x.nota || x.regra || ''}; };
  if (Array.isArray(raw)) raw.forEach(x => put(x.ano, x)); else if (Array.isArray(raw.por_ano)) raw.por_ano.forEach(x => put(x.ano, x)); else Object.keys(raw).forEach(k => { if (/^\d{4}$/.test(k)) put(k, raw[k]); }); return out; })();
function anoAano(){
  if (!AA7) return '';
  const anos = AA7.anos.filter(a => a.mostrar_padrao !== false), meta = parseNum(S.orc.meta) != null ? parseNum(S.orc.meta) : META7.pct, kDe = a => a.id || String(a.ano);   // v8: a coluna «Projetado 2026» tem id próprio
  const clsVar = (l, v) => v == null ? '' : l.tipo === 'saida' ? (v > 0 ? 'verm' : 'verde') : (v > 0 ? 'azul' : 'verm');   // C4 (Tobia): receita sobe = azul · despesa sobe = vermelho · cai = o inverso
  /* conserto G1: com orçado digitado, a coluna Projetado lê o mesmo projetado do Sankey (linhas-mãe; % e chip refeitos sobre a mesma base) */
  const PJ = projRecalc(), pjVal = l => { if (!PJ) return null; const M = {total_entradas:PJ.ent, cotidiano:PJ.sai.b2, viagens:PJ.sai.b3, outras:PJ.sai.b4, projetos:PJ.sai.b5, sobra_depois_cotidiano:PJ.ent - PJ.sai.b2, sobra_do_ano:PJ.sobra, poupanca:PJ.ent ? PJ.sobra / PJ.ent * 100 : null}; return M[l.id] != null ? M[l.id] : null; };
  const cel = (l, a, nivel) => { let c = (l.celulas || {})[kDe(a)];
    if (a.projetado && PJ && c){ const v = pjVal(l); if (v != null){ const pT = l.tipo === 'pct'; c = Object.assign({}, c, {valor:v, pct_entradas:pT ? null : (PJ.ent ? v / PJ.ent * 100 : null)}); if (pT) c.var_pp = c.base_valor != null ? v - c.base_valor : c.var_pp; else c.var_pct = c.base_valor ? (v - c.base_valor) / Math.abs(c.base_valor) * 100 : c.var_pct; } }
    if (!c || c.valor == null) return '<td class="f-' + l.fundo + (a.projetado ? ' proj' : '') + '"><span class="nd" title="' + esc(a.furo && a.furo.to_remuneracao ? 'sem extrato: a remuneração do Tobia não está no acervo' : 'sem dado no livro') + '">N/D</span></td>';
    /* v8: o chip entra em todo ano com base (2024 × 2023, 2025 × 2024, projetado × 2025 inteiro); só a 1ª coluna, o zero e a célula sem base ficam sem. Estimativa (salário do Tobia pela planilha) e parcial (faltam cartões) viram sublinhado tracejado, com o porquê no title e no ⓘ do cabeçalho */
    const neg = l.fundo === 'sobra' && c.valor < 0, pctT = l.tipo === 'pct', zero = !pctT && Math.abs(c.valor) < 0.5 && l.tipo === 'saida', primeira = anos[0] === a, semChip = primeira || c.sem_base || zero, est = !!(c.estimativa || (c.parcial && !a.parcial && !a.projetado));
    if (zero) return '<td class="f-' + l.fundo + (a.projetado ? ' proj' : '') + '"><span class="muted" title="nada neste ano">—</span></td>';
    const vH = pctT ? '<b>' + pct(c.valor, 1) + '</b>' : '<b>' + money(c.valor, 'EUR') + '</b>';
    const pcH = !pctT && c.pct_entradas != null && !(l.tipo === 'entrada' && (nivel === 0 || l.nivel === 0)) ? '<span class="pc">' + pct(c.pct_entradas, Math.abs(c.pct_entradas) < 10 ? 1 : 0) + '</span>' : '';
    /* G5: o chip lê `var_pct`/`var_pp` (base na mesma regra e período, `base_rotulo`); nada quando vier null ou sem base. % e chip sempre na 2ª linha, na mesma posição */
    const vv = pctT ? c.var_pp : c.var_pct, chip = semChip || c.sem_base || vv == null ? '' : '<span class="var ' + clsVar(l, vv) + '" title="' + esc((c.base_rotulo ? c.base_rotulo + ' · ' : '') + (c.var_base || 'contra o ano anterior')) + '">' + (vv < 0 ? '−' : '+') + fmt(Math.abs(vv), pctT ? 1 : 0) + (pctT ? ' pp' : NB + '%') + '</span>';
    const metaH = pctT && meta != null ? '<span class="mt" title="meta ' + fmt(meta, 0) + ' %"><i style="width:' + Math.max(0, Math.min(100, c.valor / meta * 100)).toFixed(0) + '%;background:' + (c.valor >= meta ? 'var(--sobra)' : 'var(--neg)') + '"></i></span>' : '';
    const fundo = neg ? (c.furo || (a.furo && a.furo.to_remuneracao) ? 'amb' : 'neg') : l.fundo;   // sobra negativa de ano com furo de extrato = âmbar (falta de dado), nunca vermelho forte; na v8 nenhum ano tem furo
    const tit_ = c.furo ? 'sem extrato nesta coluna: a sobra é parcial' : c.estimativa ? 'com estimativa: ' + (a.parcial_motivo ? humano(a.parcial_motivo) : 'o salário do Tobia vem da planilha de salários, não do extrato') : est ? 'parcial: ' + (a.parcial_motivo ? humano(a.parcial_motivo) : 'veja o ⓘ do ano') : '';   // e29 (item 8): o motivo vem da camada (parcial_motivo), nunca «faltam cartões»
    /* v10 (item 11): uma análise de cada vez — vertical = % das entradas · horizontal = chip vs ano anterior */
    return '<td class="f-' + fundo + (c.furo ? ' inc' : '') + (est ? ' est' : '') + (a.projetado ? ' proj' : '') + '"' + (tit_ ? ' title="' + esc(tit_) + '"' : '') + '>' + vH + '<span class="l2">' + (vert ? pcH : chip) + '</span>' + (vert ? metaH : '') + '</td>'; };
  const vert = (S.pn.aaVista || 'vertical') === 'vertical';
  /* e29 (item 10): o 13º ano a ano, lido da camada (anos[].decimo_terceiro.nota) — «2025 em 2 parcelas, caso único» — no ⓘ da linha «Anuais» */
  const pop13 = l => { if (l.id !== 'anuais') return ''; const L = anos.filter(a => !a.projetado && a.decimo_terceiro && a.decimo_terceiro.nota).map(a => '<b>' + a.ano + '</b> · ' + esc(semCodigo(a.decimo_terceiro.nota))); return L.length ? ' ' + pop('<b>13º do Tobia, ano a ano:</b><br>' + L.join('<br>'), 'o 13º em cada ano', 'peq') : ''; };
  const nomeL = l => { const p = pop13(l); if (!p) return esc(l.nome); const m = esc(l.nome).match(/^(.*\s)?(\S+)$/); return (m && m[1] ? m[1] : '') + '<span class="nw">' + (m ? m[2] : esc(l.nome)) + p + '</span>'; };
  const linha = (l, nivel) => '<tr class="n' + nivel + (l.tipo === 'total' || l.tipo === 'subtotal' ? ' s' : '') + '"><th class="f-' + l.fundo + '" scope="row">' + (l.filhos && l.filhos.length ? '<button class="cat-b" type="button" data-act="exp" data-k="aa|' + esc(l.id) + '" aria-expanded="' + !!S.exp['aa|' + l.id] + '">' + SETA + '<span class="t">' + esc(l.nome) + '</span></button>' : nomeL(l)) + '</th>' + anos.map(a => cel(l, a, nivel)).join('') + '</tr>' + (l.filhos && S.exp['aa|' + l.id] ? l.filhos.map(f => linha(f, nivel + 1)).join('') : '');
  const baseDe = a => { for (const l of AA7.linhas){ const c = (l.celulas || {})[kDe(a)]; if (c && c.base_rotulo && c.var_pct != null) return String(c.base_rotulo).replace(/\s+inteiro$/, ''); } return null; };   // v10 · M10: «vs 2025», sem «inteiro» (cabe em 2 linhas)   // G5: a base do chip aparece no cabeçalho da coluna
  /* v8: cabeçalho = rótulo do ano («2026 · até out», «Projetado 2026»); ano com estimativa leva a marca discreta «estimativa ⓘ» (salário do Tobia pela planilha); a marca de extrato que falta só onde o dado diz */
  const cab = '<tr><th class="vazio"></th>' + anos.map(a => { const bs = baseDe(a), estT = a.estimativa_to, furoT = a.furo && a.furo.to_remuneracao;
    const cf = CF9[String(a.ano)] && !a.projetado ? CF9[String(a.ano)] : null, sobCel = cf ? ((AA7.linhas.find(l => l.id === 'sobra_do_ano') || {celulas:{}}).celulas || {})[kDe(a)] : null, sobAt = sobCel && sobCel.valor != null ? sobCel.valor : null;
    /* e29 (item 8): o câmbio com a amiga (D.v9.creditos_fora.cambio_com_amiga) entra no ⓘ do ano dele como receita do To já contada no salário estimado */
    const CA = ((D.v9 || {}).creditos_fora || {}).cambio_com_amiga || null, caAno = CA && Array.isArray(CA.lancamentos) && CA.lancamentos.length ? +String(CA.lancamentos[0].data || '').slice(0, 4) : null, caTxt = CA && caAno === a.ano && CA.total_eur ? ' Também em ' + a.ano + ': ' + money(CA.total_eur, 'EUR') + ' de câmbio com uma amiga (' + CA.lancamentos.map(x => dataBr(x.data)).join(', ') + ') entraram na conta conjunta: é receita do Tobia já contada no salário estimado deste ano, por isso não soma de novo' + (CA.conta_na_sobra === false ? ' e fica fora da sobra' : '') + '.' : '';
    const txtCf = cf ? ('<b>' + a.ano + ': ' + money(cf.valor, 'EUR') + (cf.n ? ' em ' + cf.n + ' linhas' : '') + ' de entradas a identificar</b> ficaram fora da sobra: são créditos na conta conjunta sem a saída correspondente numa conta nossa, então não contam como entrada nem como movimento interno. ' + (cf.sobraSe != null ? 'Se entrarem como entrada, a sobra de ' + a.ano + ' vai de ' + (sobAt != null ? sv(sobAt) : '—') + ' para ' + sv(cf.sobraSe) + '.' : sobAt != null ? 'Se entrarem como entrada, a sobra de ' + a.ano + ' vai de ' + sv(sobAt) + ' para ' + sv(sobAt + cf.valor) + '.' : '') + ' São créditos do Tobia na conta conjunta para os quais não achamos a saída no C6 nem na XP-conta. <b>Até jun/26 não há extrato Wise: nenhum mês de ' + a.ano + ' é teste completo</b> — «sem par» quer dizer só isso, não que o dinheiro não saiu de uma conta nossa. O salário dele deste ano já é estimado inteiro pela planilha; por isso estes créditos ficam fora, para não contar duas vezes.' + (cf.geEnt > 0.5 ? ' Os créditos da Ge sem par (' + money(cf.geEnt, 'EUR') + ') já estão nas Entradas.' : '') + ' A conferência inteira, mês a mês, está em «Dinheiro que veio do Brasil», embaixo da tabela.' + caTxt) : '';
    /* e29 (item 8): o selo e o ⓘ do ano parcial leem o motivo da camada (parcial_motivo); nada de «faltam cartões» escrito na tela */
    const motivo = a.parcial_motivo ? esc(humano(a.parcial_motivo)).replace(/^(.)/, m => m.toUpperCase()) + '.' : '';
    /* v10 (item 11): as marcas («€ 6.400 fora», «estimativa», «parcial», «até 31/12») saem do título para UM ⓘ curto por coluna; o título fica em ≤ 2 linhas («2026 até out», «Projetado 2026») */
    const txts = [estT ? '<b>' + a.ano + ' com estimativa.</b> ' + (motivo || 'O salário do Tobia neste ano vem da planilha de salários, não do extrato.') + ' Fonte do salário: ' + esc(estT.fonte || 'planilha de salários') + ' (' + (estT.meses || 0) + ' meses). As demais entradas estão no livro; por isso a sobra deste ano é aproximada.' + (!cf ? caTxt : '') : furoT ? '<b>' + a.ano + ' sem extrato</b> em parte das contas: a sobra deste ano é parcial.' : (a.parcial_motivo && !a.parcial && !a.projetado ? '<b>' + a.ano + ' é parcial.</b> ' + motivo : ''), txtCf, a.projetado ? '<b>Projetado ' + a.ano + ', até 31/12:</b> o que já entrou e saiu + o orçado dos meses que faltam + o a receber.' : ''].filter(Boolean);
    const marca = txts.length ? pop(txts.join('<br><br>'), 'sobre ' + (a.projetado ? 'o projetado de ' : '') + a.ano + (cf ? ' (' + money(cf.valor, 'EUR') + ' fora da sobra)' : estT ? ' (estimativa)' : ''), 'col') : '';
    const rot = a.projetado ? 'Projetado ' + a.ano : a.parcial ? a.ano + ' até ' + mesCurto(MF) : String(a.ano);
    return '<th' + (a.projetado ? ' class="proj"' : furoT ? ' class="inc"' : '') + '>' + esc(rot) + marca + (bs && !vert ? ' <small class="bs">' + esc(bs) + '</small>' : '') + '</th>'; }).join('') + '</tr>';   // v10 · M10: a base corre em linha («2026 ⓘ vs 2025»), o título fica em ≤ 2 linhas   // conserto P2-7: «vs 2024» no cabeçalho (só na análise horizontal)
  const ult = anos[anos.length - 1], per = anos[0].ano + '–' + (ult.projetado ? ult.ano + ' projetado' : ult.ano);
  return '<section class="bloco b7 aa-bl" id="pn-bloco-aa" style="--c:var(--c7);--ct:var(--c7-t);--cs:var(--c7-s);--ctx:var(--sup)" aria-label="Ano a ano"><div class="bloco-cab"><h2><span class="nb">≡</span>Ano a ano' + pop('<b>Análise vertical</b> (cada linha em % das entradas do ano) e <b>horizontal</b> (o chip: variação contra o ano anterior, ano cheio contra ano cheio; no ano corrente, jan–' + esc(mesCurto(MF)) + ' contra o mesmo período do ano anterior; o projetado contra o ano anterior inteiro). Receita que cresce = azul; despesa que cresce = vermelho; o contrário, o inverso. A 1ª coluna é o ano de referência, sem chip. <b>Projetado ' + ANO + '</b> = o que já entrou e saiu + o orçado dos meses que faltam + o a receber, até 31/12. Anos com «estimativa» ou «parcial»: o motivo está no ⓘ ao lado do ano (sublinhado tracejado na célula). ' + (B7['1'] && B7['1'].total && B7['1'].total.a_receber > 0.5 ? '<b>Entradas ' + ANO + ' até ' + esc(mesCurto(MF)) + ' = ' + money((B7['1'].total.realizado || 0) + B7['1'].total.a_receber, 'EUR') + '</b>: conta o a receber (' + money(B7['1'].total.a_receber, 'EUR') + ' de salário do Tobia ainda não pago); só o que entrou = ' + money(B7['1'].total.realizado || 0, 'EUR') + ', o número do Painel. O chip da coluna compara nessa mesma base. ' : '') + 'Poupança = sobra ÷ entradas; a meta é o campo no Resultado.', 'como ler a tabela') + '</h2><div class="tot">' + segBtns('Análise', [['vertical', 'Análise vertical'], ['horizontal', 'Análise horizontal']], 'aa-vista', vert ? 'vertical' : 'horizontal', 'peq') + '<span class="per">' + esc(per) + '</span></div></div><div class="bloco-corpo"><p class="apoio" style="margin-bottom:8px">' + (vert ? 'cada linha em % das entradas do ano' : 'o chip compara com o ano anterior (o ano corrente, jan–' + esc(mesCurto(MF)) + ' contra jan–' + esc(mesCurto(MF)) + '; o projetado, contra o ano anterior inteiro)') + '</p><div class="rolavel aa-w"><table class="aa"><thead>' + cab + '</thead><tbody>' + AA7.linhas.map(l => linha(l, 0)).join('') + '</tbody></table></div></div></section>' + brasilSecao();   // v10 (item 11): toggle Análise vertical × horizontal, uma de cada vez
}
/* conserto e29 (G2 · itens 7 e 9): «Dinheiro que veio do Brasil» — chegou × saiu por ano (D.v9.transferencias), com par e sem par, meses com teste completo / parcial / sem teste, o resumo em palavras e o que ficou fora do «saiu»; e a linha das faturas de 2023 (D.v9.faturas). Lê com guarda: sem o nó, a seção não aparece */
function brasilSecao(){
  const TR = (D.v9 || {}).transferencias || null, FA = (D.v9 || {}).faturas || null; if (!TR && !FA) return '';
  const anos = TR && Array.isArray(TR.por_ano) ? TR.por_ano : [];
  const nMes = (x, ks) => { for (const k of ks) if (typeof x[k] === 'number') return x[k]; return null; };
  const rows = anos.map(x => { const ch = x.chegou_eur || 0, sp = x.sem_par_eur || 0, cp = x.com_par_eur != null ? x.com_par_eur : Math.max(0, ch - sp), comp = nMes(x, ['meses_teste_completo', 'meses_completos']), parc = nMes(x, ['meses_teste_parcial', 'meses_parciais']), sem = nMes(x, ['meses_sem_teste', 'meses_nao_testaveis']);
    return '<tr><td><b>' + x.ano + '</b></td><td class="num entrada">' + money(ch, 'EUR') + '</td><td class="num">' + money(x.saiu_eur || 0, 'EUR') + '</td><td class="num">' + money(cp, 'EUR') + '</td><td class="num">' + (sp > 0.5 ? '<b>' + money(sp, 'EUR') + '</b>' : '—') + '</td><td class="num" style="white-space:nowrap" title="' + esc((comp != null ? comp + ' com teste completo · ' : '') + (parc != null ? parc + ' com teste parcial · ' : '') + (sem != null ? sem + ' sem teste' : '')) + '">' + [comp, parc, sem].map(v => v == null ? '—' : v).join(' · ') + '</td></tr>'; }).join('');
  const resumo = TR && typeof TR.resumo === 'string' ? esc(humano(TR.resumo)) : (TR && TR.resumo && typeof TR.resumo === 'object' ? esc(humano(TR.resumo.texto || TR.resumo.nota || Object.values(TR.resumo).filter(v => typeof v === 'string').join(' '))) : 'Até jun/26 não há extrato Wise, a via principal do dinheiro que vem do Brasil: <b>nenhum mês de 2023–24 é teste completo</b>. «Com par» = o crédito na conta conjunta tem a saída correspondente no C6 ou na XP-conta; «sem par» = não achamos a saída nessas duas contas, o que não prova que o dinheiro não saiu de uma conta nossa.');
  const fora = TR ? TR.fora_do_saiu : null, foraL = Array.isArray(fora) ? fora : (fora && typeof fora === 'object' ? Object.keys(fora).map(k => Object.assign({nome:k}, typeof fora[k] === 'object' ? fora[k] : {valor:fora[k]})) : []);
  const foraItem = f => f.pix_proprio_brl != null || f.ted_brl != null ? '<b>' + f.ano + '</b>: ' + [f.pix_proprio_brl > 0.5 ? 'Pix ao próprio nome R$ ' + fmt(f.pix_proprio_brl, 0) + (f.n_pix_proprio ? ' (' + f.n_pix_proprio + ')' : '') : '', f.ted_brl > 0.5 ? 'TED R$ ' + fmt(f.ted_brl, 0) + (f.n_ted ? ' (' + f.n_ted + ')' : '') : ''].filter(Boolean).join(' · ') : esc(humano(f.nome || f.tipo || '')) + (f.valor_brl != null ? ' R$ ' + fmt(f.valor_brl, 0) : f.valor_eur != null ? ' ' + money(f.valor_eur, 'EUR') : typeof f.valor === 'number' ? ' ' + fmt(f.valor, 0) : '') + (f.ano ? ' (' + f.ano + ')' : '') + (f.nota ? ' — ' + esc(humano(f.nota)) : '');
  const foraH = foraL.length ? '<p class="apoio"><b>Fora do «saiu»</b> (saídas das contas do Brasil que não entram na conta acima, porque não têm como casar com um crédito em euros): ' + foraL.filter(f => (f.pix_proprio_brl || 0) > 0.5 || (f.ted_brl || 0) > 0.5 || f.nome || f.tipo).map(foraItem).join(' · ') + '.</p>' : (TR ? '<p class="apoio"><b>Fora do «saiu»:</b> Pix ao próprio nome e TED do C6 não entram nesta conta (estão em «A confirmar com você»).</p>' : '');
  const fat = FA ? '<p class="apoio" style="margin-top:8px"><b>Faturas de 2023 conferidas:</b> ' + (FA.linhas_novas || 0) + ' linhas entraram no livro (' + (FA.operacionais || 0) + ' de compras e ' + (FA.pagamentos_de_fatura || 0) + ' pagamentos de fatura, cada um com o par na conta)' + (FA.custo_eur_por_ano ? ' · custo novo ' + Object.keys(FA.custo_eur_por_ano).map(k => money(FA.custo_eur_por_ano[k], 'EUR') + ' em ' + k).join(' e ') : '') + (FA.a_classificar ? ' · ' + (FA.a_classificar.n || 0) + ' linhas ainda a classificar (' + money(FA.a_classificar.eur || 0, 'EUR') + ')' : '') + (FA.antes_da_janela_do_painel ? ' · nada disso cai no Painel: é tudo anterior à janela dele' : '') + '.</p>' : '';
  return det('aa-brasil', 'Dinheiro que veio do Brasil', () => '<p class="apoio">' + resumo + '</p>' + (rows ? '<div class="rolavel"><table class="medio" aria-label="Transferências por ano" style="white-space:nowrap"><thead><tr><th>ano</th><th class="num">chegou (€)</th><th class="num">saiu de contas nossas (€)</th><th class="num">com par</th><th class="num">sem par</th><th class="num" style="white-space:nowrap">meses<small style="display:block;font-weight:500">completos · parciais · sem teste</small></th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '') + foraH + fat, anos.length ? anos[0].ano + '–' + anos[anos.length - 1].ano + ' · chegou × saiu' : 'faturas');
}
/* ---------- faixa de cartões (5 blocos) e menu lateral com a rosca simples embaixo do bloco escolhido ---------- */
/* v9: os escopos «orc» (orçado, histórico) e «sim» (Simulação) leem o planejado; só «pn» lê o realizado */
const scopeSel = scope => scope === 'orc' ? S.orc.bl : scope === 'sim' ? S.sim.bl : S.pn.bl, scopeAct = scope => scope === 'pn' ? 'pn-bl' : scope + '-bloco';
function faixa7(scope, BO, pm){
  const sel = scopeSel(scope), act = scopeAct(scope);
  const cards = ['1', '2', '3', '4', '5'].map(n => { const b = BO[n], T = scope === 'pn' && n === '2' && pm && pm.total ? pm.total : b.total, orc = scope !== 'pn', v = orc ? T.planejado : T.realizado, un = '<small>' + (b.tipo === 'mes' ? '/mês' : orc ? '/ano' : ' até ' + esc(mesCurto(MF))) + '</small>';   // P1-4: valor de jan–out diz «até out», não «/ano»
    return {id:n, rot:n + ' · ' + esc(b.nome), val:(v == null ? '<span class="nd">—</span>' : money(v, b.moeda_tabela || 'EUR')) + un, vars:blVars(n), lin:chip7(scope === 'pn' ? soEntrou(T, n === '1' ? 'ent' : '', b.moeda_tabela) : T, b.moeda_tabela, {}) + (scope === 'pn' && n === '1' && T.a_receber > 0.5 ? pil('azul peq', '+ ' + money(T.a_receber, 'EUR') + ' a receber') : ''), pressed:sel === n, conf:scope === 'pn' && n === '2' ? 'pn-b2-card' : null}; });
  return faixa(cards, act, null, 'faixa-b', 'fxb');
}
/* v10 (item 9, pedido do Tobia): UMA regra para toda rosca do menu (Painel e Simulação) — fatias do maior para o menor, a partir das 12 h no sentido horário, a legenda na mesma ordem;
   cor = rampa tonal da cor do próprio bloco, do tom forte ao claro (no escuro, o tom forte já clareia um passo para sair do fundo), separador = o fundo do cartão; a 10ª em diante vira «Outros» (cinza).
   A rosca do Resultado segue com as cores dos blocos e ganha a fatia verde da Sobra (quando positiva), com linha na legenda; o centro = saídas + sobra, dizendo o que é. A regra D85 (10 cores por posição fixa) sai. */
/* v10 · conserto M9: degraus visíveis de verdade — a rampa é construída em LUMINÂNCIA (espaçamento geométrico entre um tom escuro do bloco e um tom claro), e cada degrau é achado por busca binária no próprio matiz; vizinhas ficam com contraste ≥ ~1,5:1 (n = 6: ≈ 1,55), no claro e no escuro */
function corLum(cor, alvo){ const Lc = lum(cor); let lo = 0, hi = 1, dir = alvo > Lc ? '#FFFFFF' : '#000000'; for (let k = 0; k < 22; k++){ const t = (lo + hi) / 2; if (lum(misturar(cor, dir, t)) < alvo === (alvo > Lc)) lo = t; else hi = t; } return misturar(cor, dir, (lo + hi) / 2); }
function rampaTonal(cor, n){ if (n <= 1) return [cor]; const Lmin = Math.max(0.02, lum(misturar(cor, '#000000', 0.5))), Lmax = temaEscuro() ? 0.8 : 0.74, r = Math.pow((Lmax + 0.05) / (Lmin + 0.05), 1 / (n - 1)); return Array.from({length:n}, (_, i) => corLum(cor, (Lmin + 0.05) * Math.pow(r, i) - 0.05)); }   // espaçado em (L + 0,05): o mesmo contraste entre cada par de vizinhas (n = 6 → ≈ 1,55:1)
function fatiasRampa(segs, cor){ const ss = segs.filter(s => s.v > 0.5).sort((a, b) => b.v - a.v), f = fatias8(ss), P = rampaTonal(cor, f.filter(s => s.id !== 'outros').length); return f.map((s, i) => Object.assign({}, s, {cor:s.id === 'outros' ? PAL_OUTROS : P[i]})); }
function roscaMenu7(scope, n, BO, pm){
  const orc = scope !== 'pn', b = BO[n], c = COMP7[n] || null; let segs = [], centro = '', sub = '', sub2 = '', negs = [];
  if (n === '6'){ const V = orc ? (BO.res || {}) : (janelaV(janAtual()) || (R7.realizado_ano || {}).com_a_receber || {}); segs = ['b2', 'b3', 'b4', 'b5'].map(k => ({id:k, nome:NOME[k[1]], v:Math.max(0, (V.saidas || {})[k] || 0), cor:COR[k[1]]}));
    if (V.sobra > 0.5) segs.push({id:'sobra', nome:'Sobra', v:V.sobra, cor:COR.sobra});   // v10: a fatia verde da Sobra (quando positiva)
    segs = segs.filter(s => s.v > 0.5).sort((a, b_) => b_.v - a.v); centro = kfmt(sum(segs.map(s => s.v)), 'EUR'); sub = V.sobra > 0.5 ? 'saídas + sobra' : 'saídas'; sub2 = orc ? (V.periodo || 'orçado ' + ANO) : V.k === 'm12' ? 'média mensal' : (V.periodo || ''); }   // v8: a rosca do Resultado segue a janela da chave; as fatias são os blocos, nas cores deles
  else if (!orc && n === '2' && b && b.por_mes){   // v10 (item 10): o Cotidiano mostra o total até o mês fechado (jan–out), como as outras roscas; a soma bate com o Ano a ano
    const acc = {}; Object.keys(b.por_mes).filter(m => +m.slice(0, 4) === ANO && m <= MF).sort().forEach(m => ((b.por_mes[m] || {}).grupos || []).forEach(g => { const a = acc[g.id] || (acc[g.id] = {id:g.id, nome:g.nome, v:0}); a.v += g.realizado || 0; }));
    const todos = Object.values(acc); negs = todos.filter(a_ => a_.v < -0.5);   // e32b: grupo negativo (reembolso maior que o gasto) não vira fatia, mas entra no centro e na legenda
    segs = fatiasRampa(todos, COR['2']); centro = kfmt(sum(todos.map(a_ => a_.v)), 'EUR'); sub = 'jan–' + mesCurto(MF) + '/' + ANO; }
  else if (orc && b){ const partes = n === '1' ? (b.grupos || []).flatMap(g => g.itens || []) : (b.grupos || []);   // conserto P1-3: Entradas pelas partes reais (salários, 13º, licença, indenizações), não pela periodicidade
    segs = fatiasRampa(partes.map(g => ({id:g.id, nome:g.nome, v:Math.max(0, eurDe(g.planejado || 0, g.moeda || 'EUR'))})), COR[n]); centro = kfmt(sum(segs.map(s => s.v)), 'EUR'); sub = 'orçado ' + (b.tipo === 'mes' ? '/mês' : b.periodo); }
  else if (c){ segs = fatiasRampa((c.fatias || []).filter(f => !f.negativo).map(f => ({id:f.id, nome:f.nome, v:Math.max(0, f.valor || 0)})), COR[n]); centro = kfmt(c.centro || sum(segs.map(s => s.v)), c.moeda || 'EUR'); sub = c.periodo; }
  segs = segs.filter(s => s.v > 0.5); const tot = sum(segs.map(s => s.v));
  if (!segs.length) return '<p class="muted" style="font-size:.875rem">Nada ' + (orc ? 'orçado' : 'realizado') + ' aqui.</p>';
  return roscaSimples(segs, {centro, sub, sub2, aria:'Composição do bloco ' + n + ', da maior fatia para a menor'}) + legRosca(segs, tot, negs);
}
function menu7(scope, BO, pm){
  const orc = scope !== 'pn', sel = scopeSel(scope), act = scopeAct(scope);
  const res = orc ? BO.res : (janelaV(janAtual()) || (R7.realizado_ano || {}).com_a_receber || null), sob = res ? res.sobra : null, mes12 = !orc && res && res.k === 'm12';   // conserto P2-2: o menu segue a janela da chave
  const bt = (n, nome, val, vars, cor) => '<button class="bl-b" type="button" data-act="' + act + '" data-v="' + n + '" aria-pressed="' + (sel === n) + '" style="' + vars + '"><i style="background:' + cor + '"></i><span class="bl-t">' + nome + '</span><span class="bl-v">' + val + '</span></button>';
  const val = n => { const b = BO[n], T = !orc && n === '2' && pm && pm.total ? pm.total : b.total, v = orc ? T.planejado : T.realizado; return (v == null ? '—' : money(v, b.moeda_tabela || 'EUR')) + '<small>' + (b.tipo === 'mes' ? '/mês' : orc ? '/ano' : ' até ' + esc(mesCurto(MF))) + '</small>'; };
  const lista = ['1', '2', '3', '4', '5'].map(n => bt(n, n + ' · ' + esc(NOME[n]), val(n), blVars(n), COR[n]) + (sel === n ? '<div class="bl-sub" style="' + blVars(n) + '">' + roscaMenu7(scope, n, BO, pm) + '</div>' : '')).join('') +
    bt('6', '6 · Resultado', sob == null ? '<span class="nd">N/D</span>' : '<span class="' + (sob >= -0.5 ? 'sobra' : 'saida') + '">' + (sob < 0 ? '−' : '+') + money(Math.abs(sob), 'EUR') + '</span><small>' + (orc ? '/ano' : mes12 ? '/mês · 12 m' : ' ' + esc(res.periodo || ('até ' + mesCurto(MF)))) + '</small>' + (!orc && res && res.a_receber > 0.5 && res.sobra_sem_a_receber != null && res.k !== 'projetado' ? '<span class="bl-ar">se o salário entrar · sem ele <b class="' + (res.sobra_sem_a_receber >= -0.5 ? 'sobra' : 'saida') + '">' + (res.sobra_sem_a_receber < 0 ? '−' : '+') + money(Math.abs(res.sobra_sem_a_receber), 'EUR') + '</b></span>' : ''), blVars('6'), COR['6']) + (sel === '6' ? '<div class="bl-sub" style="' + blVars('6') + '">' + roscaMenu7(scope, '6', BO, pm) + '</div>' : '') +
    '<a class="bl-b bl-8" href="#fluxo"><i style="background:transparent"></i><span>A pagar e a receber: Fluxo de caixa</span><span aria-hidden="true">›</span></a>';
  const pilulas = ['1', '2', '3', '4', '5', '6'].map(n => '<button class="bl-p" type="button" data-act="' + act + '" data-v="' + n + '" aria-pressed="' + (sel === n) + '">' + n + ' · ' + esc(NOME[n]) + '</button>').join('');
  return '<nav class="bl-lista" aria-label="Blocos">' + lista + '</nav><div class="bl-pilulas" role="group" aria-label="Blocos">' + pilulas + '</div>' + (!orc && sel !== '6' ? leitura7(sel, BO, pm) : '');
}
/* leitura do bloco gerada dos números da v7, com o sinal D72 (o único texto corrido do Painel) */
function leitura7(n, BO, pm){
  const b = BO[n]; if (!b) return ''; const T = soEntrou(pm && n === '2' ? pm.total : b.total, n === '1' ? 'ent' : '', b.moeda_tabela || 'EUR'), grupos = pm && n === '2' ? pm.grupos : b.grupos, cur = b.moeda_tabela || 'EUR', L = [];
  const sgn = v => (v < 0 ? '−' : '+') + money(Math.abs(v), cur);
  if (semOrc7(T)) L.push('sem orçado no ano: ' + money(T.realizado, cur) + ' gastos até ' + mesCurto(MF) + ' (fora do plano)');
  else L.push((pm ? pm.rotulo : b.tipo === 'mes' ? b.periodo : ANO + ' até ' + mesCurto(MF)) + ': ' + sgn(T.desvio) + ' · ' + (PAL7[T.estado] || T.estado) + (T.estado === 'no_plano' ? ' (±5 %)' : n === '1' ? ' do plano' : ' do planejado'));
  const cd = g => { const e = g.moeda === 'BRL' && g.eur ? g.eur : g; return e.contribui_desvio != null ? e.contribui_desvio : (e.desvio || 0); };   // grupo em R$ (3.3, 4.2): a Leitura lê o valor em € (`eur.contribui_desvio`), nunca o R$ como se fosse €
  const ex = (grupos || []).filter(g => Math.abs(cd(g)) > 0.5).sort((p, q) => Math.abs(cd(q)) - Math.abs(cd(p))).slice(0, 3);
  if (ex.length) L.push('o que mais explica: ' + ex.map(g => esc(g.nome) + ' ' + sgn(cd(g))).join(' · '));
  if (n === '2' && T.desvio_12m != null) L.push('média 12 m (' + money(T.quarta, cur) + ') contra o planejado: ' + sgn(T.desvio_12m) + ' · ' + (PAL7[T.estado_12m] || ''));
  if (n === '1' && T.a_receber > 0.5) L.push('a receber ' + money(T.a_receber, cur) + ' (salário ainda não pago), fora do desvio; por data, no Fluxo de caixa');
  return '<section class="leitura" style="' + blVars(n) + '" aria-label="Leitura do bloco ' + n + '"><h3>Leitura · ' + n + ' · ' + esc(NOME[n]) + '</h3><ul>' + L.map(l => '<li>' + l.replace(/^(.)/, m => m.toUpperCase()) + '</li>').join('') + '</ul></section>';
}
/* mês a mês do Cotidiano (filtro do Painel): colunas pelo semáforo; planejado em grafite contínua, média 12 m em grafite tracejada (C2) */
function colunas12v7(b2, mesK, chaveDv){
  const meses = Object.keys(b2.por_mes || {}).sort(), pmK = (b2.por_mes || {})[mesK], plan = pmK && pmK.total && pmK.total.planejado != null ? pmK.total.planejado : b2.total.planejado, m12 = b2.total.quarta;   // v10 · M7: a linha do orçado segue o orçado do mês escolhido (jul/ago: 5.364), como a barra
  const it = meses.map(m => { const p = b2.por_mes[m], t = p.total || {}; return {id:m, v:t.realizado || 0, rot:mesCurto(m), cor:CLS7(t) === 'verm' ? SEM.ruim : CLS7(t) === 'verde' ? SEM.ok : SEM.plano, tip:p.rotulo + ': ' + money(t.realizado, 'EUR') + ' · orçado ' + money(t.planejado, 'EUR') + ' · ' + (PAL7[t.estado] || '') + ' — toque para ver o mês'}; });
  const sel = meses.indexOf(mesK);
  /* v10 (itens 4 e 5): linha e texto do orçado na cor do bloco; média 12 m em laranja (como era); a chave do desvio mora nesta linha, à direita, com as cores (do mês = cor do bloco · da média = laranja) */
  const tog = '<span class="seg-l dv-tog" title="' + ((chaveDv || 'mes') === 'media12' ? 'desvio = média 12 m − orçado' : 'desvio = realizado do mês − orçado') + '">Desvio ' + segBtns('Base do desvio', [['mes', 'do mês'], ['media12', 'da média 12 m']], 'dv-chave', chaveDv || 'mes', 'peq') + '</span>';   // v10 · M6: a conta fica no title (e no título da coluna Desvio); assim a chave cabe na linha da legenda a 1280 e 1440
  return '<h3 class="h-mm">Mês a mês' + (mesK !== (b2.mes_padrao || MES_PAD) ? ' <button class="btn link peq" type="button" data-act="mes-sel" data-v="' + (b2.mes_padrao || MES_PAD) + '">voltar a ' + esc(b2.periodo) + '</button>' : '') + '</h3>' + colunas(it, {h:150, refs:[{v:plan, cls:'plan'}, {v:m12, cls:'med'}], sel:sel < 0 ? null : sel, act:'mes-sel', fv:v => nfmt(v, 0), aria:'Cotidiano França mês a mês, pelo semáforo; linha contínua na cor do bloco = orçado, laranja tracejada = média 12 m; toque numa coluna ou no chip do mês para ver aquele mês'}) +
    '<div class="leg-q col-leg mm-leg"><span class="lg-orc"><i class="lin-plan"></i>orçado <b data-conf="pn-b2-plan">' + money(plan, 'EUR') + '</b>' + (pmK && plan !== b2.total.planejado ? '<span class="apoio"> em ' + esc(pmK.rotulo || mesPt(mesK)) + '</span>' : '') + '</span><span class="lg-med"><i class="lin-med"></i>média 12 m <b data-conf="pn-b2-media">' + money(m12, 'EUR') + '</b></span>' + tog + '</div>';
}
/* ---------- PAINEL (v7) ---------- */
/* v9 (onda 9): o Painel é a única tela do orçamento do ano corrente. Um botão no cabeçalho («Editar orçamento») libera a coluna Orçado dos blocos 1–5 — nada de lápis por célula;
   «Concluir» trava de novo. A matriz Mensal · % · Anual · % mora no Resultado, embaixo do leque; o histórico do orçamento (D74) vem depois do Ano a ano. */
const pnPartes = () => { const b2 = B7['2'], mesK = S.mesSel || b2.mes_padrao || MES_PAD, pad = mesK === (b2.mes_padrao || MES_PAD); return {b2, mesK, pad, pm:!pad && b2.por_mes && b2.por_mes[mesK] ? b2.por_mes[mesK] : null}; };
/* conserto e29 (achado 2): um controle só. Travado, «Editar orçamento» mora no cabeçalho da tela; editando, o único «Concluir» mora na barra fixa do topo (topoChip), ao lado da sobra orçada — à vista em toda largura e em qualquer rolagem; o cabeçalho fica com «Desfazer as edições» e a pílula */
const pnTopoDir = P => (S.pn.editOrc
    ? '<span class="pil neu" title="o «Concluir» está na barra do topo, ao lado da sobra orçada">editando o orçado ' + ANO + '</span>' + (temEd() ? '<button class="btn peq" type="button" data-act="orc-desfazer">Desfazer as edições</button>' : '')
    : '')
  + (P && !P.pad ? pil('azul', 'Cotidiano em ' + esc(P.pm ? P.pm.rotulo : P.mesK)) : '') + seusPil();   // conserto P2-13: «out/26 · mês fechado» já está na barra do topo; G1: o Painel diz que lê seus números · v10 (item 7): «Editar orçamento» e «Baixar meus números» moram no header (topoAcoes)
function pnDir(P){
  const ed = !!S.pn.editOrc, BO = blocosOrc();
  const resAno = (R7.realizado_ano || {}).com_a_receber || null, r12 = (R7.realizado_12m || {}).com_a_receber || null;
  /* v8: o bloco 6 mostra a janela da chave (mês · ano · 12 m · projetado); sem `janelas` (dados antigos) cai no ano até o mês fechado */
  const jk = janAtual(), res = janelaV(jk) || resAno, arP = res && res.a_receber != null ? res.a_receber : (res && res.entradas_recebido != null ? res.entradas - res.entradas_recebido : 0);
  const numRot2 = (rot, v, conf, extra) => numRot(rot, v, conf).replace(/<\/div>$/, (extra || '') + '</div>');
  /* P1-4: «sobrou» diz que conta o a receber e mostra o valor sem ele; os 12 m dizem que incluem a licença bienal; a poupança leva o período */
  const rotSobra = jk === 'projetado' ? 'sobra prevista · ' : jk === 'm12' ? 'sobra por mês · ' : 'sobra · ';
  const res2 = '<div class="res-2n">' + (res ? numRot2(rotSobra + esc(res.periodo) + (arP > 0.5 ? ' · <span class="apoio">conta ' + money(arP, 'EUR') + ' a receber</span>' : ''), res.sobra, 'pn-tot-sobra-ano', res.sobra_sem_a_receber != null && arP > 0.5 ? '<span class="apoio">sem o a receber ' + sv(res.sobra_sem_a_receber) + '</span>' : '') : '') +
    (res && res.total12 ? numRot2('total dos 12 m', res.total12.sobra, 'hz-sobra-ano', r12 && r12.inclui_licenca ? '<span class="apoio" title="' + esc(r12.inclui_licenca.nota || '') + '">inclui licença bienal ' + money(r12.inclui_licenca.valor, 'EUR') + (r12.sobra_sem_licenca != null ? ' · sem ela ' + sv(r12.sobra_sem_licenca) : '') + '</span>' : '') : '') +
    (res && res.poupanca_pct != null ? '<div class="rn"><span class="k">poupança · ' + esc(res.poupanca_periodo || res.periodo) + '</span><b class="' + (res.poupanca_pct >= 0 ? 'sobra' : 'saida') + '">' + pct(res.poupanca_pct, 1) + '</b></div>' : '') +
    '<label class="rn campo-meta"><span class="k">meta de poupança</span><span class="v"><input class="inp" type="text" inputmode="decimal" data-meta="1" placeholder="—" value="' + esc(S.orc.meta) + '" aria-label="Meta de poupança em porcentagem das entradas" style="max-width:88px"> %</span></label><span id="meta-pill">' + metaPill7(res) + '</span></div>';   // v9: a meta (D74) migrou do Orçamento para o Resultado do Painel · v10 (item 13): o chip compara com a poupança ao lado (a janela), não com a orçada
  return barraBlocos('pn') + bloco7('pn', B7['1'], {edit:ed}) + bloco7('pn', P.b2, {pm:P.pm, meio:colunas12v7(P.b2, P.mesK, S.pn.dvChave || 'mes'), edit:ed}) + bloco7('pn', B7['3'], {edit:ed}) + bloco7('pn', B7['4'], {edit:ed}) + bloco7('pn', B7['5'], {edit:ed}) +
    bloco6('pn', res, {antes:chaveJanela(), sobraRot:jk === 'projetado' ? 'Sobra prevista' : 'Sobra', depois:res2 + matrizInline(BO)}) + anoAano() + historico7();
}
function pnRegioes(){ const P = pnPartes(); const e = $('#pn-esq'), d = $('#pn-dir'), t = $('.cab-tela .dir'); if (e) e.innerHTML = menu7('pn', B7, P.pm); if (d) d.innerHTML = pnDir(P); if (t) t.innerHTML = pnTopoDir(P); topoChip(); posRender(); }   // v9: recálculo sem perder o foco (como o orcRegioes)
function viewPainel(){
  if (!B7['2']) return tit('Painel') + aviso('<b>Sem dados da v7 (D.v7.blocos).</b> Gere o mockup de novo com a camada de dados da onda 7.', 'bad') + rodape();
  const P = pnPartes();
  const topo = tit('Painel', pnTopoDir(P));
  const estados = '';
  if (S.estado === 'carregando') return topo + '<div class="painel esqueleto" aria-busy="true"><i style="width:60%"></i><i style="width:90%"></i><i style="width:80%"></i><i style="width:70%"></i></div>' + estados + rodape();
  let h = topo;
  if (S.estado === 'erro') h += aviso('<strong>Exemplo de estado de erro (não é dado real):</strong> o saldo recalculado de uma conta não bate com o saldo do extrato. O bloco afetado fica em vermelho e o número mostra «com ressalva» até a conta ser conferida. <a href="#rotina">Abrir a Rotina</a>.', 'bad') + '<div style="height:14px"></div>';
  if (S.virada){ const V = S.virada, pend = (V.pend || []).map(x => x.tipo === 'item novo' ? '«' + esc(x.nome) + '» (' + esc(NOME[x.bloco] || x.bloco) + ', ' + money(x.valor, 'EUR') + ')' : esc(x.id).replace(/^aj\|/, '')); h += aviso('<b>' + ANO_REF + ' abriu: a simulação que você fez para ' + ANO_REF + ' virou o orçado deste ano</b> (' + V.n + ' ' + (V.n === 1 ? 'valor seu aplicado' : 'valores seus aplicados') + '; o orçado de ' + (ANO_REF - 1) + ' continua guardado). ' + (pend.length ? 'Ainda não existem no plano de contas e esperam você: ' + pend.join(' · ') + ' — peça pelo «Pedir ajuste». ' : '') + '<button class="btn link peq" type="button" data-act="virada-ok">Entendi</button>', 'ok') + '<div style="height:14px"></div>'; }   // G4: nada se perde na virada
  h += faixa7('pn', B7, P.pm);
  h += '<div class="orc-grid" id="pn-grid"><aside class="orc-esq" id="pn-esq">' + menu7('pn', B7, P.pm) + '</aside><div class="orc-dir" id="pn-dir">' + pnDir(P) + '</div></div>';
  const AC = V7.a_confirmar || [];   // v8: lê as perguntas abertas da onda 8 (as respondidas saíram; as novas entraram)
  if (AC.length) h += '<div id="pn-conf">' + det('pn-conf', 'A confirmar com você (' + AC.length + ')', () => '<p class="apoio">Perguntas que a leitura do livro deixou em aberto; a classificação atual vale até você responder.</p><ul class="lista">' + AC.map(x => '<li><span><b>' + esc(humano(x.tema)) + '</b> · ' + esc(humano(x.pergunta)) + '<div class="apoio">hoje em: ' + esc(humano(x.onde_esta || '—')) + '</div></span><span class="num"><b>' + (x.valor_eur != null ? money(x.valor_eur, 'EUR') : '<span class="nd">—</span>') + '</b>' + (x.n_linhas ? '<div class="apoio">' + x.n_linhas + ' linha(s)</div>' : '') + '</span></li>').join('') + '</ul>', 'leitura do livro') + '</div>';
  return h + estados + rodape();
}
/* ---------- ORÇAMENTO (v7): o mesmo bloco com o Planejado editável; a recontagem na página continua (edições só nesta página) ---------- */
const temEd = () => Object.keys(S.orc.ed).length > 0;
const edX = id => { const e = S.orc.ed[id]; return e && e.x != null && isFinite(e.x) ? e.x : undefined; };   // conserto v9 P1-8: «abc» não vale zero, vale o combinado (e o campo avisa)
function estado7(desvio, planejado, receita, item, cur){
  if (desvio == null || planejado == null) return {estado:'sem_orcado', bom:null};
  const tol = Math.max(0.05 * Math.abs(planejado), item ? 20 * (cur === 'BRL' ? CAM : 1) : 0);
  if (Math.abs(desvio) <= tol) return {estado:'no_plano', bom:true};
  const acima = desvio > 0; return {estado:acima ? 'acima' : 'abaixo', bom:receita ? acima : !acima};
}
const henTaxa = () => S.orc.taxa != null ? S.orc.taxa : (((((D.v9 || {}).simulacao || {}).henner || {}).taxa) || (M5.henner || {}).taxa || 0.8);   // taxa do reembolso: a digitada, a da camada v9 ou a do livro
/* recalcula um bloco com as edições (D68: só o que o Tobia digitou muda; o realizado nunca) — usado só quando há edição */
function recalcBloco(b){
  const n = b.id, ent = n === '1', mes = b.tipo === 'mes', ano = !ent && !mes, cur0 = b.moeda_tabela || 'EUR';
  /* conserto G1: o Projetado só muda na linha que foi editada (regra genérica: realizado + orçado dos meses que faltam); as outras linhas guardam o projetado do gerador, e grupos e total somam os filhos */
  /* v10 (item 14): projetado «discreto» (modo_projecao da camada; no bloco Projetos é o padrão quando a camada não diz) = realizado + já assumido, sem somar o orçado dos meses que faltam — o mesmo que o desvio conta, em item, categoria e total */
  const discB = b.modo_projecao != null ? b.modo_projecao === 'discreto' : n === '5';
  const discreto = (nd, herdado) => nd && nd.modo_projecao != null ? nd.modo_projecao === 'discreto' : !!herdado;
  const fim = (nd, pl, item, cur, mensal, ed, disc) => {
    nd.planejado = pl;
    /* conserto e29 (achado 5): entrada que ainda não venceu (13º «a receber em dez», estado a_receber) não entra no desvio em nenhum recálculo: desvio 0, nada contribui ao grupo, o projetado conta o orçado */
    if (ent && item && (nd.aguardando || nd.estado === 'a_receber')){ nd.planejado_ate_mes = 0; nd.desvio = 0; nd.contribui_desvio = 0; nd.desvio_pct = null; nd.estado = 'a_receber'; nd.bom = null; if (ed || nd.quarta == null) nd.quarta = pl == null ? (nd.realizado || 0) : pl; return; }
    if (pl == null){ nd.desvio = null; nd.contribui_desvio = mes ? (nd.realizado || 0) : (nd.realizado || 0) + (nd.ja_assumido || 0); Object.assign(nd, {estado:'sem_orcado', bom:null, desvio_pct:null}); if (ano && (ed || nd.quarta == null)) nd.quarta = nd.realizado;
      if (ent && item){ const r = (nd.realizado || 0) + (nd.a_receber || 0); nd.desvio = r; nd.contribui_desvio = r; nd.planejado_ate_mes = 0; if (r > 0.5){ nd.estado = 'acima'; nd.bom = true; } if (ed || nd.quarta == null) nd.quarta = r; }   // v10 (menor): entrada sem orçado (indenização, bônus) conta contra zero, como o gerador — não vira «sem orçado» depois de editar
      return; }
    if (ent){ nd.planejado_ate_mes = mensal ? pl * MESES_FECH / 12 : pl; nd.desvio = (nd.realizado || 0) + (nd.a_receber || 0) - nd.planejado_ate_mes; if (ed || nd.quarta == null) nd.quarta = (nd.realizado || 0) + (nd.a_receber || 0) + (mensal ? pl / 12 * MESES_FALTAM : (nd.realizado == null ? pl : 0)); }
    else if (mes){ nd.desvio = (nd.realizado || 0) - pl; if (nd.quarta != null){ nd.desvio_12m = nd.quarta - pl; const e12 = estado7(nd.desvio_12m, pl, false, item, cur); nd.estado_12m = e12.estado; nd.bom_12m = e12.bom; } }
    else { nd.desvio = (nd.realizado || 0) + (nd.ja_assumido || 0) - pl; if (ed || nd.quarta == null) nd.quarta = disc ? (nd.realizado || 0) + (nd.ja_assumido || 0) : (nd.realizado || 0) + pl * MESES_FALTAM / 12; }
    nd.contribui_desvio = nd.desvio; const basE = ent && nd.planejado_ate_mes != null ? nd.planejado_ate_mes : pl; nd.desvio_pct = basE ? nd.desvio / Math.abs(basE) * 100 : null; Object.assign(nd, estado7(nd.desvio, basE, ent, item, cur));   // v10 · G1: em Entradas a margem é sobre o orçado até o mês (a base do desvio)
  };
  const soma = (arr, k) => arr.some(x => x[k] != null) ? sum(arr.map(x => x[k] || 0)) : null;
  const folha = (it, cur, disc) => { let x = edX(it.id), pl = it.planejado;
    if (x !== undefined){ if (ent && it.orcado_nativo){ pl = x / CAM * (it.planejado_mes != null ? 12 : 1); it.orcado_nativo = Object.assign({}, it.orcado_nativo, {valor:x}); } else if (ent && it.planejado_mes != null) pl = x * 12; else if (it.registro_bienal) pl = it.planejado; else pl = x; if (ent && it.planejado_mes != null) it.planejado_mes = pl / 12; }   // v8: 13º em R$ é anual (sem × 12) · v10 (item 16): o valor em R$ digitado no Painel também vale na referência da Simulação (orcado_nativo acompanha)
    fim(it, pl, true, cur, ent && it.planejado_mes != null, x !== undefined, discreto(it, disc)); return x !== undefined; };   // G1: diz se a folha foi editada (o projetado do grupo só se refaz quando um filho mudou)
  const grupo = (g, cur, discPai) => { const gcur = g.moeda || cur, disc = discreto(g, discPai); let edR = false;
    if (g.grupos && g.grupos.length){ const edG = g.grupos.map(h => grupo(h, gcur, disc)).some(Boolean); const pl = soma(g.grupos, 'planejado'); fim(g, pl, false, gcur, false, false, disc); if (pl != null) g.desvio = sum(g.grupos.map(h => h.contribui_desvio || 0)); g.contribui_desvio = sum(g.grupos.map(h => h.contribui_desvio || 0)); if (pl != null) Object.assign(g, estado7(g.desvio, pl, ent, false, gcur)); if (!mes && edG && soma(g.grupos, 'quarta') != null) g.quarta = soma(g.grupos, 'quarta'); edR = edG; }
    else if (g.orcado_no_pai){ const x = edX(g.id); fim(g, x !== undefined ? x : g.planejado, false, gcur, false, x !== undefined, disc); edR = x !== undefined; }
    else { let edI = (g.itens || []).map(i => folha(i, gcur, disc)).some(Boolean); if (n === '2' && edI){ const hen = (g.itens || []).find(i => i.editavel === false && /henner/i.test(i.nome || '')); if (hen){ const dBase = sum((g.itens || []).filter(i => i !== hen).map(i => (i.planejado || 0) - (BASE_PL[i.id] || 0))); fim(hen, (BASE_PL[hen.id] || 0) - henTaxa() * dBase, true, gcur, false, true, disc); } }   // conserto v9 M6: reembolso = o do gerador − taxa × (saúde orçada nova − a de referência)
      edR = edI; const pl = soma(g.itens || [], 'planejado'); fim(g, pl, false, gcur, false, false, disc); if (pl != null){ g.desvio = sum((g.itens || []).map(i => i.contribui_desvio || 0)); Object.assign(g, estado7(g.desvio, pl, ent, false, gcur)); } g.contribui_desvio = sum((g.itens || []).map(i => i.contribui_desvio || 0)); if (!mes && !ent && edI && soma(g.itens || [], 'quarta') != null) g.quarta = soma(g.itens || [], 'quarta'); if (ent){ if (edI) g.quarta = sum((g.itens || []).map(i => i.quarta || 0)); g.planejado_ate_mes = sum((g.itens || []).map(i => i.planejado_ate_mes || 0)); g.desvio = pl == null ? null : (g.realizado || 0) + (g.a_receber || 0) - g.planejado_ate_mes; if (pl != null) Object.assign(g, estado7(g.desvio, g.planejado_ate_mes, true, false, gcur)); } }
    /* v10 (item 15): no sub-bloco em R$ o € do realizado e do já assumido é o do gerador (câmbio linha a linha), e só o orçado digitado é convertido pelo câmbio médio — assim o chip do cabeçalho (Σ contribui_desvio em €) e a barra (realizado + já assumido − orçado, em €) dizem o MESMO número; antes o chip dividia tudo por um câmbio só e ficava € 16 à frente da barra */
    if (gcur === 'BRL'){ const e = g.eur || g.total_eur || {}; const re = e.realizado != null ? e.realizado : (g.realizado == null ? null : g.realizado / CAM), ja = e.ja_assumido != null ? e.ja_assumido : (g.ja_assumido || 0) / CAM, pl = g.planejado == null ? null : g.planejado / CAM;
      e.planejado = pl; e.realizado = re; e.ja_assumido = ja; e.desvio = pl == null ? null : (re || 0) + ja - pl; e.contribui_desvio = pl == null ? (re || 0) + ja : e.desvio; e.quarta = edR || e.quarta == null ? (g.quarta == null ? null : (disc ? (re || 0) + ja : g.quarta / CAM)) : e.quarta; Object.assign(e, pl == null ? {estado:'sem_orcado', bom:null} : estado7(e.desvio, pl, ent, false, 'EUR')); g.eur = e; if (g.total_eur) Object.assign(g.total_eur, e); if (g.total) Object.assign(g.total, {planejado:g.planejado, desvio:g.desvio, quarta:g.quarta, estado:g.estado, bom:g.bom}); } return edR; };
  const edT = b.grupos.map(g => grupo(g, cur0, discB)).some(Boolean);
  const em = (g, k) => g.moeda === 'BRL' ? (g.eur || {})[k] : g[k];
  const T = b.total, pl = b.grupos.some(g => em(g, 'planejado') != null) ? sum(b.grupos.map(g => em(g, 'planejado') || 0)) : null;
  fim(T, pl, false, cur0, false, false, discB);
  if (pl != null){ T.desvio = sum(b.grupos.map(g => em(g, 'contribui_desvio') || 0)); Object.assign(T, estado7(T.desvio, pl, ent, false, cur0)); }
  T.contribui_desvio = sum(b.grupos.map(g => em(g, 'contribui_desvio') || 0)); if (!mes && edT && b.grupos.some(g => em(g, 'quarta') != null)) T.quarta = sum(b.grupos.map(g => em(g, 'quarta') || 0));
  if (ent){ T.planejado_ate_mes = sum(b.grupos.map(g => g.planejado_ate_mes || 0)); T.desvio = pl == null ? null : (T.realizado || 0) + (T.a_receber || 0) - T.planejado_ate_mes; if (pl != null) Object.assign(T, estado7(T.desvio, T.planejado_ate_mes, true, false, cur0)); }
  if (b.total_eur) Object.assign(b.total_eur, T);
  b.barra = Object.assign({}, b.barra, {orcado:pl, marco:b.barra && b.barra.marco ? Object.assign({}, b.barra.marco, {valor:mes ? b.barra.marco.valor : (pl == null ? 0 : pl * MESES_FECH / 12)}) : null});
  return b;
}
/* conserto · G1: o orçado digitado vale no app inteiro. Ao abrir (e a cada edição) os nós de D.v8 em memória são recalculados a partir da base: Painel, desvio, Sankey, Resultado, Projetado e matriz leem o mesmo número */
const idsDoBloco = {}, BASE_PL = {}; ['1', '2', '3', '4', '5'].forEach(n => { const ids = new Set(); const w = g => { ids.add(g.id); BASE_PL[g.id] = g.planejado; (g.grupos || []).forEach(w); (g.itens || []).forEach(i => { ids.add(i.id); BASE_PL[i.id] = i.planejado; }); }; ((B7_BASE[n] || {}).grupos || []).forEach(w); idsDoBloco[n] = ids; });
const blocoEditado = n => Object.keys(S.orc.ed).some(id => idsDoBloco[n] && idsDoBloco[n].has(id)) || (n === '2' && S.orc.taxa != null);
function aplicarEd(){
  ['1', '2', '3', '4', '5'].forEach(n => {
    if (!B7_BASE[n]) return;
    if (!temEd() || !blocoEditado(n)){ B7[n] = B7_BASE[n]; return; }   // conserto v9 P1-5: bloco que ninguém tocou fica como o gerador deixou (chips idênticos)
    const b = recalcBloco(JSON.parse(JSON.stringify(B7_BASE[n])));
    if (n === '2' && b.por_mes) Object.keys(b.por_mes).forEach(m => { const pm = b.por_mes[m]; const pb = recalcBloco(Object.assign({}, b, {grupos:pm.grupos, total:pm.total, barra:pm.barra})); pm.barra = pb.barra; });
    B7[n] = b;
  });
}
/* projetado jan–dez com o orçado digitado: entradas e blocos 3–5 pelo Projetado recalculado; Cotidiano = projetado do gerador + (orçado mensal novo − antigo) × meses que faltam */
function projRecalc(){
  if (!temEd() || !JAN8 || !JAN8.projetado) return null;
  const J = JAN8.projetado, q = n => (B7[n] && B7[n].total && B7[n].total.quarta != null) ? B7[n].total.quarta : ((J.saidas || {})['b' + n] || 0);
  const d2 = ((B7['2'].total.planejado || 0) - (B7_BASE['2'].total.planejado || 0)) * MESES_FALTAM;
  const ent = B7['1'].total.quarta != null ? B7['1'].total.quarta : ((J.com_a_receber || {}).entradas || 0);
  const sai = {b2:((J.saidas || {}).b2 || 0) + d2, b3:q('3'), b4:q('4'), b5:q('5')}, tot = sai.b2 + sai.b3 + sai.b4 + sai.b5;
  return {ent, sai, tot, sobra:ent - tot};
}
function blocosOrc(){
  const out = {}; ['1', '2', '3', '4', '5'].forEach(n => { out[n] = B7[n]; });   // G1: B7 já carrega as edições (aplicarEd)
  /* conserto e29 (achado 4): o ano de cada bloco = Σ orçado do ano por item (orcado_ano_id da camada; refeito só no bloco editado) — nada de fator agregado da matriz; a sobra orçada do Painel e a referência da Simulação fecham ao centavo */
  const ent = out['1'].total.planejado || 0, b2 = orcAnoBloco('2'), b3 = orcAnoBloco('3'), b4 = orcAnoBloco('4'), b5 = orcAnoBloco('5'), sai = b2 + b3 + b4 + b5, sob = ent - sai, k2 = (out['2'].total.planejado || 0) ? b2 / out['2'].total.planejado : 12;
  const RO = (R7.orcado_ano || {}).com_a_receber || {};
  out.res = temEd() ? {periodo:RO.periodo || 'orçado ' + ANO, entradas:ent, saidas:{b2, b3, b4, b5}, saidas_total:sai, sobra:sob, estado:sob >= 0 ? 'sobrou' : 'faltou', bom:sob >= 0, poupanca_pct:ent ? sob / ent * 100 : null} : RO;
  out.k2 = k2; out.ano = {ent, b2, b3, b4, b5, sai, sob};
  return out;
}
aplicarEd();   // G1: ao abrir, o guardado (lerOrcLocal) já vale nos nós que o Painel lê
/* conserto · G1b: «Salvar meus números» baixa casa-orcado.json (a próxima sessão absorve no gerador); o planejador grava na mesma chave */
function baixarOrc(){
  try {
    const s = {formato:'casa-orcado', versao:1, gerado_em:new Date().toISOString(), ano:ANO, orcado:{}, meta_poupanca_pct:parseNum(S.orc.meta), taxa_henner:S.orc.taxa, planejador:S.plan.guardadoEm ? {guardado_em:S.plan.guardadoEm, total:S.plan.total, dias:S.plan.dias, pessoas:S.plan.pes, travados:S.vgEd.v27 || {}} : null};
    Object.keys(S.orc.ed).forEach(id => { const e = S.orc.ed[id]; if (e && e.x != null) s.orcado[id] = e.x; });
    if (typeof temSim === 'function' && temSim()){ const so = {}; Object.keys(S.sim.ed).forEach(id => { const e = S.sim.ed[id]; if (e && e.x != null) so[id] = e.x; }); s.simulacao = {ano:ANO_SIM, base:'orçado ' + ANO_REF, orcado:so, itens_novos:S.sim.novos.map(v => ({bloco:v.n, nome:v.nome, valor:v.x, unidade:v.n === '2' ? 'EUR/mes' : 'EUR/ano', mes_inicio:v.ini})), ajustes_desligados:Object.keys(S.sim.aj).filter(k => S.sim.aj[k] === false)}; }   // v9: a simulação vai junto
    const blob = new Blob([JSON.stringify(s, null, 1)], {type:'application/json'}), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'casa-orcado.json'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('casa-orcado.json baixado: é a sua cópia de segurança.');
  } catch (e) { toast('Não deu para baixar o arquivo neste navegador.'); }
}
const salvarBtn = () => (!OCULTO && (temEd() || S.plan.guardadoEm || (typeof temSim === 'function' && temSim())) ? '<button class="btn peq" type="button" data-act="orc-salvar" aria-label="Baixar meus números" title="baixa uma cópia (casa-orcado.json) do que você digitou; é cópia de segurança, não é por ela que o orçado é gravado">' + icoV('baixar') + '<span>Baixar meus números</span></button>' : '');   // v10 (item 7): mora no header; (item 12) indisponível com os valores escondidos
/* v10 (itens 7 e 12): as ações do app no header — Editar orçamento (Painel, travado) · Baixar meus números · Esconder valores ↔ Mostrar valores (senha) — junto de «Pedir ajuste» e «Tema» */
const ICO_V = {olho:'<path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', olhoOff:'<path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.6A10.6 10.6 0 0 1 12 5.5c6.5 0 10 6.5 10 6.5a17.6 17.6 0 0 1-3.3 4.2M6.5 6.5C3.8 8.4 2 12 2 12s3.5 6.5 10 6.5c1.5 0 2.8-.3 4-.8"/>', lapis:'<path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M12.5 7.5l4 4"/>', baixar:'<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>'};
const icoV = k => '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + ICO_V[k] + '</svg>';
function topoAcoes(){
  const el = $('#topo-acoes'); if (!el) return; const r = rota(); let h = '';
  if (!OCULTO){
    if (r === 'painel' && B7['2'] && !S.pn.editOrc) h += '<button class="btn peq" type="button" data-act="pn-ed" aria-label="Editar orçamento" title="libera a coluna Orçado dos blocos 1–5 para você digitar">' + icoV('lapis') + '<span>Editar orçamento</span></button>';
    if (r === 'painel' || r === 'orcamento') h += salvarBtn();
  }
  h += OCULTO ? '<button class="btn peq" type="button" data-act="pop" data-pop="pop-senha" aria-expanded="false" aria-label="Mostrar valores (pede a senha)" title="os valores estão escondidos; para mostrar de novo, a senha">' + icoV('olho') + '<span>Mostrar valores</span></button><div class="pop pop-senha" id="pop-senha" popover role="dialog" aria-label="Senha para mostrar os valores"><form data-form="senha" autocomplete="off"><label class="apoio" for="senha-in">Senha para mostrar os valores</label><div class="linha"><input class="inp" id="senha-in" type="password" autocomplete="current-password" aria-label="Senha"><button class="btn peq prim" type="submit">Mostrar</button></div><span class="erro" id="senha-erro" role="alert"></span></form></div>'
    : '<button class="btn peq" type="button" data-act="ocultar" aria-label="Esconder valores" title="esconde todo número do app; só as porcentagens ficam. Para mostrar de novo, pede a senha">' + icoV('olhoOff') + '<span>Esconder valores</span></button>';
  el.innerHTML = h;
}
function esconderValores(){
  OCULTO = true; try { ECON.mem.setItem('casa.oculto', '1'); } catch (e) {}
  if (S.pn.editOrc){ S.pn.editOrc = false; S.ab.pn = S.pn.abAntes || S.ab.pn; S.pn.abAntes = null; }   // editar fica indisponível: a edição em curso é concluída (o digitado já está guardado)
  document.documentElement.classList.add('oculto'); render(true); toast('Valores escondidos: só as porcentagens ficam. Para mostrar de novo, a senha.');
}
function mostrarValores(senha){
  if (sha256Hex(String(senha == null ? '' : senha)) !== HASH_MOSTRAR) return false;
  OCULTO = false; try { ECON.mem.removeItem('casa.oculto'); } catch (e) {}
  document.documentElement.classList.remove('oculto'); render(true); toast('Valores à vista de novo.'); return true;
}
/* com os valores escondidos, todo campo numérico mostra «•••» e fica travado (edição, simulação, planejador, saldo do fluxo) */
function mascararCampos(){ if (!OCULTO) return; document.querySelectorAll('#main input[data-sim],#main input[data-vg],#main input[data-pl-total],#main input[data-fx-saldo],#main input[data-orc],#main input[data-fut]').forEach(i => { i.value = MASCARA; i.disabled = true; }); }
/* v10 (item 6): um termo só — «orçado». O que ainda chegar como «planejado» (texto do código antigo ou da camada de dados) é trocado na exibição: texto, title e aria-label; as chaves dos dados ficam como estão */
const RX_PLAN = /\b([Pp])lanejad(o|a|os|as)\b/g, trocaPlan = s => s.replace(/\bdo o ([Pp]lanejad|orçad)/g, 'do $1').replace(RX_PLAN, (m, p, s_) => (p === 'P' ? 'Orçad' : 'orçad') + s_);
function termoOrcado(root){
  root = root || document.body; const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), L = []; let n;
  while ((n = w.nextNode())) if (n.nodeValue && /planejad/i.test(n.nodeValue)) L.push(n);
  L.forEach(t => { t.nodeValue = trocaPlan(t.nodeValue); });
  root.querySelectorAll('[title],[aria-label]').forEach(el => ['title', 'aria-label'].forEach(k => { const v = el.getAttribute(k); if (v && /planejad/i.test(v)) el.setAttribute(k, trocaPlan(v)); }));
}
/* número que chega pronto num texto da camada de dados («além dos € 482 da linha») também some quando os valores estão escondidos */
/* v10 · conserto G2: a máscara é por ORIGEM do número, não pela moeda na frente — toda sequência de dígitos em texto, title e aria vira «•••», salvo o que não é valor: porcentagem e pp, data (dd/mm/aa), ano (19xx–21xx), mês (jan/26, 2026-01), hora, «13º», «12 m», «× 10 meses», e contagem pequena sem separador (≤ 31: «2 lançamentos», «3 parcelas») */
const RX_DIG = /\d[\d.,]*/g;
function mascaraNum(s){
  return s.replace(RX_DIG, (m, i, str) => {
    const antes = str.slice(Math.max(0, i - 3), i), depois = str.slice(i + m.length, i + m.length + 12);
    if (/[\/\-:]$/.test(antes) || /^\s?[\/\-:]\d/.test(depois)) return m;                 // data, mês, hora: 20/10/26 · jan/26 · 2026-01 · 10:30
    if (/^\s?(%|pp\b|º|ª)/.test(depois)) return m;                                        // 83 % · 6,2 pp · 13º
    if (/^(19|20|21)\d\d$/.test(m) && !/(€|\$)\s?$/.test(antes)) return m;                 // ano — mas «€ 1901» é valor (crítica onda 11)
    if (/^\d$/.test(m) && /(€|\$)\s?$/.test(antes)) return MASCARA;                            // «€ 0» é valor (conferidor e30)
    if (/^\d$/.test(m)) return m;                                                        // um algarismo só nunca é valor (número do bloco, contagem)
    if (/^\d+$/.test(m) && !/(€|\$)\s?$/.test(antes) && /^\s?(lan[çc]amentos?\b|linhas?\b|de\s\d+\s(lan|linh))/.test(depois)) return m;   // onda 12: «4.942 de 8.514 lançamentos» é contagem, não valor
    if (/[A-Za-z]$/.test(antes)) return m;                                               // código colado a letra (E30, D62) não é valor
    if (/^\s?(m\b|meses\b|mês\b|×)/.test(depois) || /×\s?$/.test(antes)) return m;         // 12 m · × 10 meses · 2×
    if (/^\d{1,2}$/.test(m) && +m <= 31 && /^\s?(lan[çc]amentos?|parcelas?|linhas?|itens?|item|dias?|pessoas?|valores?|viagens?|contas?|compras?|vezes|de\s\d|no per)/.test(depois)) return m;   // contagem
    return MASCARA;
  });
}
function mascararTexto(){ if (!OCULTO) return; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), L = []; let n; while ((n = w.nextNode())) if (n.nodeValue && /\d/.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest('script,style'))) L.push(n); L.forEach(t => { t.nodeValue = mascaraNum(t.nodeValue); }); document.querySelectorAll('[title],[aria-label]').forEach(el => ['title', 'aria-label'].forEach(k => { const v = el.getAttribute(k); if (v && /\d/.test(v)) el.setAttribute(k, mascaraNum(v)); })); }
function mascaraHtml(h){ if (!OCULTO) return h; return String(h).replace(/>([^<]*)</g, (m, t) => /\d/.test(t) ? '>' + mascaraNum(t) + '<' : m).replace(/\b(title|aria-label|placeholder|data-txt|data-msg)="([^"]*)"/g, (m, k, v) => /\d/.test(v) ? k + '="' + mascaraNum(v) + '"' : m); }   // e30 (conferidor): a máscara já no HTML montado — o rodapé («câmbio 1 € = R$ X»), a legenda do desvio, texto da camada e o exemplo do Pedir ajuste saem mascarados da própria tela
function trocaPlanHtml(h){ return String(h).replace(/>([^<]*)</g, (m, t) => /planejad/i.test(t) ? '>' + trocaPlan(t) + '<' : m).replace(/\b(title|aria-label|placeholder|data-txt|data-msg)="([^"]*)"/g, (m, k, v) => /planejad/i.test(v) ? k + '="' + trocaPlan(v) + '"' : m); }   // conferidor onda 11: um termo só já no HTML montado
function posRender(){ termoOrcado(); mascararCampos(); mascararTexto(); ajustarBarras(); }
/* v10 (item 13): o chip da meta sai da MESMA base que o número ao lado (a poupança da janela escolhida no Resultado) — antes lia a poupança orçada (BO.res) e dizia «faltam 6,2 pp» ao lado de 3,0 % × 15 % — e traz o valor nominal (meta × entradas − sobra) */
const resAtual = () => janelaV(janAtual()) || (R7.realizado_ano || {}).com_a_receber || null;
function metaPill7(res, o){
  o = o || {}; const m = parseNum(S.orc.meta), p = res ? res.poupanca_pct : null;
  if (m == null) return pil('neu', 'meta: a definir', 'escreva a meta de poupança, em % das entradas');
  if (p == null) return pil('neu', 'meta ' + fmt(m, 0) + ' %');
  const T12 = res.total12 || null, ent = T12 ? T12.entradas : (res.entradas != null ? res.entradas : (res.entTot != null ? res.entTot : 0)), sob = T12 ? T12.sobra : (res.sobra != null ? res.sobra : (res.sob != null ? res.sob : 0)), nom = m / 100 * ent - sob, pCheio = ent ? sob / ent * 100 : p, per = o.per || (T12 ? String(res.periodo || '').replace(/^média · /, 'nos ') : res.periodo) || '';   // conferidor e30: nos 12 m o nominal é sobre os 12 meses inteiros (meta × entradas − sobra), não sobre a média
  const tit_ = 'meta ' + fmt(m, 0) + ' % de ' + money(ent, 'EUR') + ' = ' + money(m / 100 * ent, 'EUR') + ' · sobra ' + money(sob, 'EUR') + (per ? ' · ' + per : '');
  return pCheio >= m ? pil('verde', 'fecha a meta · +' + fmt(pCheio - m, 1) + ' pp · ' + money(-nom, 'EUR') + ' a mais', tit_) : pil('ambar', 'faltam ' + fmt(m - pCheio, 1) + ' pp · ' + money(nom, 'EUR') + ' para a meta', tit_);   // conferidor e31: os pp saem do valor cheio (sobra ÷ entradas), arredondados uma vez só — nunca do % já arredondado
}
/* matriz Mensal · % · Anual · % (BACKLOG 271/280): fundo pintado por linha, sem quadradinho; chave orçado | realizado 12 m. v9: mora no Resultado do Painel, embaixo do leque (sem cartão dentro de cartão) */
function matrizInline(BO){
  if (!MZ7) return '';
  const ver = S.orc.mtz || 'orcado', orc = ver === 'orcado', ed = temEd(), A = BO.ano;
  const over = {salario_ge:null, salario_to:null}; if (ed){ const b1 = BO['1']; b1.grupos.forEach(g => g.itens.forEach(i => { over[i.id] = {mensal_eur:i.planejado_mes != null ? i.planejado_mes : null, anual_eur:i.planejado, mensal_brl:i.orcado_nativo && i.planejado_mes != null ? edX(i.id) || i.orcado_nativo.valor : null}; })); over.total_entradas = {mensal_eur:sum(b1.grupos[0].itens.map(i => i.planejado_mes || 0)), anual_eur:A.ent}; over.cotidiano = {mensal_eur:BO['2'].total.planejado, anual_eur:A.b2}; over.sobra_depois_cotidiano = {mensal_eur:over.total_entradas.mensal_eur - (BO['2'].total.planejado || 0), anual_eur:A.ent - A.b2}; over.viagens = {anual_eur:A.b3}; over.outras = {anual_eur:A.b4}; over.projetos = {anual_eur:A.b5 || null}; over.sobra_do_ano = {anual_eur:A.sob}; }
  const entM = orc && ed ? over.total_entradas.mensal_eur : null, entA = orc && ed ? A.ent : null;
  const pcTxt = (v, base) => { if (v == null) return ''; const x = base != null && base ? v / base * 100 : v; return (x < 0 ? '−' : '') + fmt(x, 1) + NB + '%'; };
  const cel = (v, pcm, cls) => v == null ? '<td class="num"><span class="muted">—</span></td>' : '<td class="num ' + (cls || '') + '">' + money(v, 'EUR') + (pcm ? '<small class="pcm">' + pcm + '</small>' : '') + '</td>';   // P1-10: a 390 a % vai sob o valor
  const pc = (v, base) => { const t = pcTxt(v, base); return '<td class="pc">' + (t || '—') + '</td>'; };   // sinal na % de linha negativa
  const rows = MZ7.linhas.map(l => { const o = orc ? Object.assign({}, l.orcado, ed && over[l.id] ? over[l.id] : {}) : l.realizado; const m = o.mensal_eur, a = o.anual_eur;
    const pM = orc && ed ? (m == null ? null : m) : o.mensal_pct, pA = orc && ed ? (a == null ? null : a) : o.anual_pct;
    const marca = !orc && l.id === 'licenca_ge' && a != null && Math.abs(a) > 0.5 ? '<span class="est" title="a licença bienal entrou em dez/25: está nos 12 meses, fora do orçado de 2026">nos 12 m · a cada 2 anos</span>' : '';
    return '<tr class="n' + l.nivel + ' f-' + (l.fundo === 'sobra' && a != null && a < 0 ? 'neg' : l.fundo) + '"><th scope="row">' + esc(l.nome) + (l['nota_ⓘ'] ? pop(esc(l['nota_ⓘ']), 'sobre ' + l.nome, 'peq') : '') + marca + (o.mensal_brl ? '<span class="apoio">R$ ' + fmt(o.mensal_brl, 0) + '/mês</span>' : '') + '</th>' + cel(m, orc && ed ? pcTxt(pM, entM) : pcTxt(pM)) + (orc && ed ? pc(pM, entM) : pc(pM)) + cel(a, orc && ed ? pcTxt(pA, entA) : pcTxt(pA), l.id === 'sobra_do_ano' ? 'tot' : '') + (orc && ed ? pc(pA, entA) : pc(pA)) + '</tr>'; }).join('');
  const per = orc ? esc(MZ7.periodos.orcado || 'orçado ' + ANO) : 'realizado · ' + esc(MZ7.periodos.realizado_curto || 'últimos 12 m');   // o mesmo ano do bloco («orçado 2026»), não a janela nov/26–out/27
  return '<div class="mtz-in" id="pn-mtz" aria-label="Matriz mensal e anual"><h3 class="h-mm">Orçamento em uma página' + pop('<b>Análise vertical do orçamento:</b> cada linha em % das entradas (mensais ou anuais). Mensal só para o que tem sentido por mês (salários e Cotidiano); «—» nos blocos anuais. Orçado = o orçamento de ' + ANO + ' como está no Painel, com o que você digitou; a licença bienal e as indenizações não entram no orçado de ' + ANO + '. Realizado = ' + esc(MZ7.periodos.realizado) + '; a licença que entrou em dez/25 está nele.', 'como ler a matriz') + segBtns('Versão da matriz', [['orcado', 'orçado'], ['realizado', 'realizado 12 m']], 'orc-mtz', ver, 'peq') + '</h3><div class="rolavel"><table class="mtz"><thead><tr><th><span class="per">' + per + '</span></th><th class="num">Mensal<small>€/mês</small></th><th class="pc">%</th><th class="num">Anual<small>€/ano</small></th><th class="pc">%</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
}
function historico7(){
  const vs = HIST7.versoes || [];
  return '<section class="bloco b7" id="pn-bloco-hist" style="--c:var(--txt-2);--ct:var(--txt-1);--cs:var(--sup-2);--ctx:var(--sup)" aria-label="Histórico do orçamento"><div class="bloco-cab"><h2><span class="nb">✎</span>Histórico do orçamento' + pop('Cada orçamento que você assina fica guardado com data e valores; a última versão é a vigente. Ao assinar uma nova, a anterior fica no histórico com os acertos do ano, para medir o acerto ano a ano.', 'como funciona o histórico') + '</h2><div class="tot"><button class="btn peq" type="button" data-act="econ-assinar" title="grava uma versão nova do orçamento, assinada por você, com a data de hoje e os valores desta tela">Assinar este orçamento</button></div></div><div class="bloco-corpo"><ul class="hist">' +
    (vs.length ? vs.map(v => '<li><span class="h-d">' + esc(dataBr(v.data)) + '</span><span class="h-r"><b>' + esc(humano(v.rotulo)) + '</b><span class="apoio">assinado por ' + esc(v.assinado_por) + (v.origem && !/\.(json|csv|py|md)\b/.test(String(v.origem)) ? ' · ' + esc(humano(v.origem)) : '') + '</span></span>' + (v.vigente ? pil('verde peq', 'vigente') : pil('neu peq', 'anterior')) + '</li>').join('') : '<li class="muted">Nenhuma versão assinada ainda.</li>') + '</ul></div></section>';
}
