/* api.js · cliente do servidor (biblioteca sem tela) · ADR-003 § 2.
 *
 * Fala com o /exec do Apps Script por fetch + POST + corpo texto/plain: sem cabeçalho extra, sem cookie, então o navegador não faz preflight
 * de CORS (a resposta, depois do redirecionamento do Google, vem com cabeçalho aberto). Corpo: {token, acao, dados}.
 * O token é o ID token do Google (dura 1 h) e vive SÓ em memória, na função `token()` que a página passa. Nunca é guardado aqui.
 *
 * Token vencido NÃO é recusa definitiva: antes de enviar, se o token vence em menos de `margemS`, e depois, se o servidor responder
 * «token_vencido», pede um token novo (`renovar()`, uma só chamada para vários pedidos juntos) e reenvia o MESMO pedido: o client_token
 * dentro de `dados` é o mesmo, então o servidor devolve «repetido» e não grava duas vezes. Se renovar falhar (o Google pediu um toque),
 * a exceção sobe e a fila deixa o gesto pendente e visível.
 *
 * Uso: const api = Api.criarCliente({ url, fetch: window.fetch.bind(window), token: () => tokenAtual, renovar: () => pedirTokenNovo() });
 *      await api.chamar('quem_sou', {});   // → { ok:true, email, origem } (o e-mail que o servidor conferiu)
 *      Fila.criar({ enviar: (item) => api.chamar(item.tipo, item.envio) });
 *      api.chamar(acao, dados, { token: 'x.y.z', semRenovar: true })   // só para as provas de recusa
 */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.Api = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // exp (segundos) lido do JWT SÓ para decidir quando renovar; quem confere o token é o servidor.
  function expDoToken(token) {
    try {
      var p = String(token).split('.')[1];
      p = p.replace(/-/g, '+').replace(/_/g, '/');
      while (p.length % 4) p += '=';
      var txt = (typeof atob === 'function') ? atob(p) : Buffer.from(p, 'base64').toString('binary');
      var exp = JSON.parse(txt).exp;
      return typeof exp === 'number' && isFinite(exp) ? exp : null;
    } catch (e) {
      return null;
    }
  }

  function criarCliente(op) {
    op = op || {};
    if (!op.url || typeof op.fetch !== 'function' || typeof op.token !== 'function' || typeof op.renovar !== 'function') {
      throw new Error('criarCliente: url, fetch, token e renovar são obrigatórios');
    }
    var agora = op.agora || function () { return Date.now(); };
    var margemMs = (op.margemS === undefined ? 60 : op.margemS) * 1000;
    var renovando = null;

    // uma renovação só, mesmo com vários pedidos esperando
    function renovar() {
      if (!renovando) {
        renovando = Promise.resolve().then(function () { return op.renovar(); }).then(
          function (t) { renovando = null; return t; },
          function (e) { renovando = null; throw e; }
        );
      }
      return renovando;
    }

    function precisaRenovar(token) {
      if (!token) return true;
      var exp = expDoToken(token);
      return exp !== null && exp * 1000 - agora() < margemMs;
    }

    async function enviar(acao, dados, token) {
      var corpo = { acao: acao, dados: dados };
      if (token) corpo.token = token;
      var resp = await op.fetch(op.url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // o único cabeçalho: qualquer outro dispara o preflight que o /exec não responde
        body: JSON.stringify(corpo),
        credentials: 'omit',
        redirect: 'follow',
        cache: 'no-store',
      });
      if (!resp.ok) throw new Error('http_' + resp.status);
      var txt = await resp.text();
      try {
        return JSON.parse(txt);
      } catch (e) {
        throw new Error('resposta_nao_json'); // página de login do Google, erro HTML: nunca vira «gravado»
      }
    }

    var api = {};
    api.chamar = async function (acao, dados, opcoes) {
      opcoes = opcoes || {};
      var renova = !opcoes.semRenovar;
      var token = ('token' in opcoes) ? opcoes.token : op.token();
      if (renova && precisaRenovar(token)) token = await renovar();
      var r = await enviar(acao, dados === undefined ? {} : dados, token);
      if (renova && r && r.ok === false && r.motivo === 'token_vencido') {
        token = await renovar();
        r = await enviar(acao, dados === undefined ? {} : dados, token);
      }
      return r;
    };
    api.expDoToken = expDoToken;
    return api;
  }

  return { criarCliente: criarCliente, expDoToken: expDoToken };
});
