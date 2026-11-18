/* leitura.js · o que as telas leem do árbitro e como o publicado volta a ser uma árvore (biblioteca sem tela; roda no navegador e no Node).
 *
 * O árbitro devolve, por tela, um objeto { «caminho»: projeção } (gerar_dados_app.dividir_por_tela): «a.b.c» é a subárvore inteira;
 * «a[].b» é a projeção por lista (um valor por elemento, {} onde o elemento não tem o campo); «a[chave].b» idem por dicionário.
 * `remontar` junta tudo numa árvore só, a mesma forma que o código das telas (derivado do mockup aprovado) lê.
 *
 * CAMINHOS é a ÚNICA lista do que as telas da C3 precisam. Três usos, um endereço:
 *   1. a página confere, ao abrir, se o árbitro trouxe os obrigatórios (`faltando`); se não trouxe, mostra o erro de leitura, nunca número pela metade;
 *   2. a prévia local (tools/previa.js) publica exatamente estes caminhos;
 *   3. é o pedido ao motor: `gerar_dados_app.py` tem de publicar estes caminhos em `comum`, `painel` e `livro`.
 * Painel e Simulação leem o mesmo dado (a Simulação parte do orçado do ano corrente), por isso não há lista «simulacao».
 */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.Leitura = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CAMINHOS = {
    comum: ['meta', 'v4.meta', 'v6.meta', 'v8.meta'],
    painel: [
      'v6.blocos', 'v6.painel.mes_padrao', 'v6.painel.por_mes', 'v6.orcamento.editavel.cotidiano', 'v6.demonstrativo.versao_padrao', 'v6.termometro', 'v6.competencia',
      'v8.blocos', 'v8.resultado', 'v8.ano_a_ano', 'v8.matriz', 'v8.composicao', 'v8.orcamento_historico', 'v8.meta_poupanca', 'v8.total', 'v8.a_confirmar', 'v8.simulacao_2027',
      'v9.simulacao', 'v9.salario_to_2026', 'v9.transferencias', 'v9.creditos_fora', 'v9.faturas',
    ],
    livro: ['livro', 'rotina.contas'],
  };
  // vêm se o motor publicar; a tela funciona sem eles (sem «rodada», o rodapé mostra a hora em que o dado foi gerado)
  var OPCIONAIS = { comum: ['rodada'], painel: [], livro: [] };
  // que telas do árbitro cada tela do app pede (o Livro-Caixa é o mais pesado e só vem quando a pessoa o abre)
  var TELAS_DO_APP = { painel: ['comum', 'painel'], orcamento: ['comum', 'painel'], livro: ['comum', 'painel', 'livro'] };

  function ehObjeto(o) { return o !== null && typeof o === 'object' && !Array.isArray(o); }
  function objetoVazio(o) { return ehObjeto(o) && Object.keys(o).length === 0; }
  function chaveSegura(c) { return c !== '__proto__' && c !== 'constructor' && c !== 'prototype'; }

  function pedacos(caminho) {
    return String(caminho).split('.').filter(Boolean).map(function (s) {
      var m = /^([^\[\]]*)((?:\[[^\]]*\])*)$/.exec(s);
      if (!m) throw new Error('caminho que não entendo: ' + caminho);
      return { nome: m[1], n: (m[2].match(/\[/g) || []).length };
    });
  }

  // junta `p` em `alvo`: objeto com objeto funde chave a chave; qualquer outra coisa, vale `p`
  function juntar(alvo, p) {
    if (ehObjeto(alvo) && ehObjeto(p)) {
      Object.keys(p).forEach(function (c) { if (chaveSegura(c)) alvo[c] = juntar(alvo[c], p[c]); });
      return alvo;
    }
    return p;
  }
  function por(alvo, segs, i, p) {
    if (i === segs.length) return juntar(alvo, p);
    var s = segs[i];
    if (!chaveSegura(s.nome)) return alvo;
    if (!ehObjeto(alvo)) alvo = {};
    if (s.nome) { alvo[s.nome] = descer(alvo[s.nome], s.n, segs, i + 1, p); return alvo; }
    return descer(alvo, s.n, segs, i + 1, p);
  }
  function descer(alvo, k, segs, prox, p) {
    if (k === 0) return por(alvo, segs, prox, p);
    if (Array.isArray(p)) {
      if (!Array.isArray(alvo)) alvo = [];
      for (var j = 0; j < p.length; j++) {
        if (objetoVazio(p[j])) { if (alvo[j] === undefined) alvo[j] = {}; continue; }   // {} = este elemento não tem o campo
        alvo[j] = descer(alvo[j], k - 1, segs, prox, p[j]);
      }
      return alvo;
    }
    if (ehObjeto(p)) {
      if (!ehObjeto(alvo)) alvo = {};
      Object.keys(p).forEach(function (c) { if (chaveSegura(c)) alvo[c] = descer(alvo[c], k - 1, segs, prox, p[c]); });
      return alvo;
    }
    return alvo;   // o caminho pede lista e a projeção não é lista: nada a pôr
  }

  // { tela: { caminho: projeção } } → a árvore. Subárvores inteiras primeiro; as projeções por lista completam por cima, elemento a elemento.
  function remontar(porTela, base) {
    var D = base || {};
    var pares = [];
    Object.keys(porTela || {}).forEach(function (t) {
      var o = porTela[t];
      if (!ehObjeto(o)) return;
      Object.keys(o).forEach(function (c) { pares.push([c, o[c]]); });
    });
    var ordem = function (c) { return (c.indexOf('[') >= 0 ? 1e6 : 0) + c.split('.').length; };
    pares.sort(function (a, b) { return ordem(a[0]) - ordem(b[0]); });
    pares.forEach(function (par) { D = por(D, pedacos(par[0]), 0, par[1]); });
    return D;
  }

  function pegar(D, caminho) {
    var o = D, segs = String(caminho).split('.');
    for (var i = 0; i < segs.length; i++) {
      if (o === null || typeof o !== 'object' || !(segs[i] in o)) return undefined;
      o = o[segs[i]];
    }
    return o;
  }

  // caminhos obrigatórios das `telas` que a árvore não tem (lista vazia = pode desenhar)
  function faltando(D, telas) {
    var f = [];
    (telas || []).forEach(function (t) {
      (CAMINHOS[t] || []).forEach(function (c) { var v = pegar(D, c); if (v === undefined || v === null) f.push(c); });
    });
    return f;
  }

  function caminhosDe(tela) { return (CAMINHOS[tela] || []).concat(OPCIONAIS[tela] || []); }

  return { CAMINHOS: CAMINHOS, OPCIONAIS: OPCIONAIS, TELAS_DO_APP: TELAS_DO_APP, remontar: remontar, faltando: faltando, pegar: pegar, caminhosDe: caminhosDe };
});
