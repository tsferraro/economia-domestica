/* fila.js · fila do navegador (biblioteca sem tela) · ADR-002 § 3 «Sem rede» e ADR-003 · padrão ref 08 da webapp-mandu.
 * Mora na PÁGINA (pagina/, GitHub Pages), não no Apps Script: o servidor só fala JSON (doPost).
 *
 * Cada gesto vira um item com client_token criado NO GESTO e guardado em localStorage ANTES de qualquer rede.
 * Estados: pendente → enviando → (gravado: o item SAI da fila na hora, sem guardar a resposta; ADR-003) | recusado.
 *   - PENDENTE (passa sozinho, o item fica visível e tenta de novo; o token é o mesmo e o servidor devolve «repetido», não grava duas vezes):
 *     rede caída, resposta perdida, resposta nula, e as recusas de TOKEN ou de INFRAESTRUTURA (token_vencido, token_malformado,
 *     assinatura_invalida, sem_configuracao, leitura_de_volta_diferente, erro_interno, limite_excedido, ocupado…; ver TRANSITORIOS). Backoff com jitter;
 *     também ao voltar a rede e ao voltar à aba. ADR-003 § 2 e RNF6: só recusa de REGRA tira o item do envio.
 *   - RECUSADO: recusa de regra de dado (campo, rev_desatualizada, base_diferente, lista…) ou de identidade (email_nao_autorizado, aud_nao_permitida,
 *     sem_acesso…). NÃO some e não reenvia sozinho: fica visível com o que a pessoa digitou até ela reenviar() ou descartar().
 * O que fica guardado no item recusado: SÓ o motivo (código curto) e o que a própria pessoa digitou (payload/envio). NADA da resposta do servidor:
 * orçado vigente, autor, hora e valores lidos da planilha (resposta.atual) vão ao callback aoRecusar(item) como `item.resposta`, que vive
 * só na memória da tela (ADR-003 § 2: nenhum número lido no aparelho).
 * Nada de número fica no aparelho depois que o servidor confirma: só um CONTADOR da sessão (em memória, resumo().gravado) e o callback
 * opcional aoGravar(resposta, item), chamado antes de o item sair, para a tela atualizar o que mostra.
 * Limite honesto: a fila é a ÚNICA coisa guardada no aparelho (gestos ainda não enviados, sem número lido). No ícone da tela de início
 * do iPhone o armazenamento da página é do próprio domínio e não do Google; o teste de 30 min (LEIA.md) mede se sobrevive.
 *
 * Uso: const fila = Fila.criar({ enviar: (item) => cliente.chamar(item.tipo, item.envio) });  // cliente = api.js
 *      fila.iniciar(window, document); fila.enfileirar('gravarClassificacao', { lancamento_id, campos, rev_esperada });
 *      fila.resumo().texto  // «2 enviando, não feche»
 */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.Fila = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CHAVE_PADRAO = 'econ_fila_v1'; // o _v1 permite migrar o formato depois

  function novoToken() {
    var c = (typeof crypto !== 'undefined') ? crypto : null;
    if (c && c.randomUUID) return c.randomUUID();
    return 'g' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  function erro(codigo, msg) {
    var e = new Error(msg);
    e.code = codigo;
    return e;
  }

  function criar(opcoes) {
    opcoes = opcoes || {};
    var chave = opcoes.chave || CHAVE_PADRAO;
    var storage = opcoes.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!storage) throw erro('armazenamento', 'sem localStorage');
    var enviarFn = opcoes.enviar;
    if (typeof enviarFn !== 'function') throw erro('config', 'opcoes.enviar é obrigatório');
    var agora = opcoes.agora || function () { return Date.now(); };
    var agendar = opcoes.agendar || function (fn, ms) { return setTimeout(fn, ms); };
    var aoMudar = opcoes.aoMudar || function () {};
    var aoRecusar = opcoes.aoRecusar || function () {};
    var aoGravar = opcoes.aoGravar || function () {};
    var gravadosNaSessao = 0;                     // só um contador: o item gravado não fica guardado

    var enviandoAgora = false;
    var refazer = false;
    var refazerForcado = false;
    var retryAgendado = false;
    var api = { _storage: storage };

    // Motivos que passam sozinhos: o item fica pendente e visível e tenta de novo (o token é o mesmo; o servidor dedupe por client_token).
    // São as recusas de TOKEN e de INFRAESTRUTURA, não de regra (ADR-003 § 2: «token vencido» não é recusa definitiva; a página renova e reenvia).
    var TRANSITORIOS = ['ocupado', 'token_ausente', 'token_vencido', 'token_malformado', 'assinatura_invalida', 'certificados_indisponiveis',
      'auds_nao_configuradas', 'sem_configuracao', 'leitura_de_volta_diferente', 'historico_falhou', 'erro_interno', 'limite_excedido'];
    // Recusas de identidade: o servidor disse que ESTA conta/cliente não entra. Não adianta repetir; o item fica visível com o que foi digitado.
    var IDENTIDADE = ['email_nao_autorizado', 'aud_nao_permitida', 'sem_acesso', 'email_nao_verificado', 'email_ausente', 'iss_invalido'];
    function ler() {
      try {
        var v = JSON.parse(storage.getItem(chave) || '[]');
        return Array.isArray(v) ? v : [];
      } catch (e) { return []; }
    }
    function gravar(arr) {
      try { storage.setItem(chave, JSON.stringify(arr)); return true; } catch (e) { return false; }
    }
    // nada que atravessa um await é gravado de volta inteiro: atualiza SÓ o item, relendo antes (ref 08 § 6.2)
    function atualizar(token, remendo) {
      var arr = ler();
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].client_token === token) { for (var k in remendo) arr[i][k] = remendo[k]; break; }
      }
      gravar(arr);
      avisar();
      return arr;
    }
    function avisar() {
      try { aoMudar(api.resumo(), api.itens()); } catch (e) { /* a tela não derruba a fila */ }
    }

    // ao abrir: «enviando» órfão (página fechada no meio) volta a pendente, com o mesmo token; «gravado» que uma versão antiga deixou é apagado
    (function recuperar() {
      var arr = ler(), mudou = false;
      var novo = arr.filter(function (i) { return i.estado !== 'gravado'; });
      if (novo.length !== arr.length) mudou = true;
      novo.forEach(function (i) {
        if (i.estado === 'enviando') { i.estado = 'pendente'; mudou = true; }
        if ('resposta' in i) { // versão antiga guardava a resposta do servidor: fica só o motivo
          if (i.estado === 'recusado' && !i.motivo) { i.motivo = codigoCurto(i.resposta && i.resposta.motivo); i.classe = classeDoMotivo(i.motivo); }
          delete i.resposta; mudou = true;
        }
      });
      if (mudou) gravar(novo);
    })();

    api.enfileirar = function (tipo, payload) {
      var token = novoToken();
      var envio = {};
      for (var k in (payload || {})) envio[k] = payload[k];
      envio.client_token = token;
      var item = { client_token: token, tipo: tipo, payload: payload || {}, envio: envio, estado: 'pendente', tentativas: 0, proxima_em: 0, criado_em: new Date(agora()).toISOString() };
      var arr = ler();
      arr.push(item);
      if (!gravar(arr)) throw erro('armazenamento', 'o navegador recusou guardar o gesto (cota ou modo privado): nada foi enfileirado');
      avisar();
      Promise.resolve().then(function () { api.enviar(); }); // envio automático, depois de guardar e fora do gesto
      return item;
    };

    api.itens = function () { return ler(); };

    api.resumo = function () {
      var r = { pendente: 0, enviando: 0, gravado: gravadosNaSessao, recusado: 0 };
      ler().forEach(function (i) { if (i.estado !== 'gravado' && r[i.estado] !== undefined) r[i.estado]++; });
      var t;
      if (r.enviando) t = r.enviando + ' enviando, não feche';
      else if (r.pendente) t = r.pendente + ' aguardando a rede, não feche';
      else if (r.recusado) t = r.recusado + ' recusado(s): veja o que o servidor respondeu';
      else t = 'tudo gravado';
      r.texto = t;
      return r;
    };

    api.aberto = function () { var r = api.resumo(); return r.pendente + r.enviando > 0; };

    function classificar(r) {
      if (r === null || r === undefined) return 'transitorio'; // resposta nula ou perdida
      if (r.ok === true) return 'gravado';
      if (r.ok === false && TRANSITORIOS.indexOf(r.motivo) >= 0) return 'transitorio';
      if (r.ok === false) return 'recusado';
      return 'transitorio';
    }
    function classeDoMotivo(m) { return IDENTIDADE.indexOf(m) >= 0 ? 'identidade' : 'regra'; }
    // só um código curto do servidor vai para o aparelho; qualquer outra coisa (texto, objeto) vira «recusado»
    function codigoCurto(m) { return (typeof m === 'string' && /^[a-z0-9_]{1,40}$/.test(m)) ? m : 'recusado'; }

    function espera(tentativas) {
      return Math.min(30000, 1000 * Math.pow(2, tentativas)) + Math.random() * 1000; // jitter evita sincronia
    }

    function agendarNovaTentativa(tentativas) {
      if (retryAgendado) return;
      retryAgendado = true;
      agendar(function () { retryAgendado = false; api.enviar(); }, espera(tentativas));
    }

    // Esvazia a fila em ordem. Coalescente: pedido de envio durante um envio vira «refazer», nunca se perde.
    api.enviar = function (op) {
      var forcar = !!(op && op.forcar);
      if (enviandoAgora) { refazer = true; refazerForcado = refazerForcado || forcar; return api._corrente || Promise.resolve(); }
      enviandoAgora = true;
      api._corrente = (async function () {
        try {
          for (;;) {
            var proximo = ler().filter(function (i) { return i.estado === 'pendente'; })[0];
            if (!proximo) break;
            if (!forcar && proximo.proxima_em > agora()) { agendarNovaTentativa(proximo.tentativas); break; }
            atualizar(proximo.client_token, { estado: 'enviando' });
            var resposta, falhou = false;
            try { resposta = await enviarFn(proximo); } catch (e) { falhou = true; }
            var classe = falhou ? 'transitorio' : classificar(resposta);
            if (classe === 'gravado') {
              // ADR-003: confirmou → o item SAI da fila, sem a resposta (valores, autor, rev ficam só na memória da tela, via aoGravar)
              gravar(ler().filter(function (i) { return i.client_token !== proximo.client_token; }));
              gravadosNaSessao++;
              avisar();
              try { aoGravar(resposta, { client_token: proximo.client_token, tipo: proximo.tipo }); } catch (e) { /* a tela não derruba a fila */ }
            } else if (classe === 'recusado') {
              var motivo = codigoCurto(resposta && resposta.motivo);
              var arr = atualizar(proximo.client_token, { estado: 'recusado', motivo: motivo, classe: classeDoMotivo(motivo) });
              var it = arr.filter(function (i) { return i.client_token === proximo.client_token; })[0];
              var paraTela = {}; for (var kk in it) paraTela[kk] = it[kk];
              paraTela.resposta = resposta; // SÓ na memória da tela (rev nova, valor atual, autor): nunca vai ao armazenamento
              try { aoRecusar(paraTela); } catch (e) { /* idem */ }
            } else {
              var t = (proximo.tentativas || 0) + 1;
              atualizar(proximo.client_token, { estado: 'pendente', tentativas: t, proxima_em: agora() + espera(t) });
              agendarNovaTentativa(t);
              break; // mantém a ordem: não passa o próximo na frente de um que falhou
            }
          }
        } finally {
          enviandoAgora = false;
          if (refazer) { var f = refazerForcado; refazer = false; refazerForcado = false; api.enviar({ forcar: f }); } // só força se alguém pediu forçado (rede voltou)
        }
      })();
      return api._corrente;
    };

    // recusado volta à fila com o MESMO token (a tela pode trazer rev_esperada nova no remendo do envio)
    api.reenviar = function (token, remendoEnvio) {
      var arr = ler();
      arr.forEach(function (i) {
        if (i.client_token !== token || i.estado !== 'recusado') return;
        for (var k in (remendoEnvio || {})) { i.envio[k] = remendoEnvio[k]; i.payload[k] = remendoEnvio[k]; }
        i.estado = 'pendente'; i.tentativas = 0; i.proxima_em = 0; delete i.motivo; delete i.classe;
      });
      gravar(arr);
      avisar();
      Promise.resolve().then(function () { api.enviar({ forcar: true }); });
    };

    // a pessoa desistiu de um gesto recusado: só então ele sai do aparelho (nada é apagado antes disso)
    api.descartar = function (token) {
      gravar(ler().filter(function (i) { return !(i.client_token === token && i.estado === 'recusado'); }));
      avisar();
    };

    // «Sair e apagar deste aparelho»: some a fila inteira (a tela confirma antes se ainda há gesto não enviado)
    api.apagarTudo = function () {
      try { storage.removeItem(chave); } catch (e) { gravar([]); }
      avisar();
    };

    api.limparGravados = function () {            // restos de versão antiga; hoje nada «gravado» fica na fila
      gravar(ler().filter(function (i) { return i.estado !== 'gravado'; }));
      avisar();
    };

    // saída manual: se o servidor nunca responder, o que a pessoa fez ainda dá para copiar
    api.pendentesComoTexto = function () {
      return ler().filter(function (i) { return i.estado !== 'gravado'; }).map(function (i) { return JSON.stringify({ tipo: i.tipo, envio: i.envio }); }).join('\n');
    };

    api.iniciar = function (win, doc) {
      win = win || (typeof window !== 'undefined' ? window : null);
      doc = doc || (typeof document !== 'undefined' ? document : null);
      if (win) {
        win.addEventListener('online', function () { api.enviar({ forcar: true }); });
        win.addEventListener('beforeunload', function (ev) {
          if (!api.aberto()) return;
          var msg = 'Há gravações ainda não enviadas. Se fechar agora, elas podem se perder.';
          if (ev) { if (ev.preventDefault) ev.preventDefault(); ev.returnValue = msg; }
          return msg;
        });
      }
      if (doc) doc.addEventListener('visibilitychange', function () { if (doc.visibilityState === 'visible') api.enviar({ forcar: true }); });
      return api.enviar({ forcar: true });
    };

    return api;
  }

  return { criar: criar, CHAVE_PADRAO: CHAVE_PADRAO };
});
