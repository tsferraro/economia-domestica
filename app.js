/* app.js · a casca do app «Economia Doméstica» (ADR-003): login, leitura do árbitro, fila de gravações, orçado gravado, estados.
 *
 * As TELAS (Painel, Simulação, Livro-Caixa) são o código do mockup aprovado, derivado por tools/derivar_telas.py para telas/*.js.
 * Esta casca fica em volta delas e é a única que fala com o mundo:
 *   · lê os números SÓ do árbitro (api.js → lerTela), remonta a árvore (telas/leitura.js) e só então carrega as telas;
 *   · nada de número no aparelho: o que o mockup guardava em localStorage vive em ECON.mem (memória da página); no aparelho ficam só a
 *     fila de gestos não enviados (fila.js) e as preferências sem número (econ_prefs_v1: esconder valores e colunas do Livro-Caixa);
 *   · cada orçado digitado vira `gravarOrcado` pela fila, com o id, a base e a revisão publicados; a recusa aparece ao lado do campo.
 * Prévia local: só com a página servida de 127.0.0.1 e ?previa=1 (tools/previa.js). Fora disso o parâmetro não faz nada.
 */
(function () {
  'use strict';
  var CFG = window.ECON_CONFIG || {};
  var ECON = window.ECON = {};
  var el = function (id) { return document.getElementById(id); };
  var h = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var LOCAL = /^(127\.0\.0\.1|localhost|\[::1\])$/.test(location.hostname);
  var PREVIA = LOCAL && /(?:^|[?&])previa=1(?:&|$)/.test(location.search);   // nunca em endereço publicado
  var API_URL = PREVIA ? location.origin + '/exec' : CFG.API_URL;
  var preenchido = function (v) { return typeof v === 'string' && !!v && v.indexOf('PREENCHER') !== 0; };
  var configurado = PREVIA || (preenchido(CFG.CLIENT_ID) && preenchido(CFG.API_URL));
  ECON.previa = PREVIA;

  // ---------------------------------------------------------------- memória da página e preferências sem número
  var CHAVE_PREFS = 'econ_prefs_v1';
  function lerPrefs() {
    try { var p = JSON.parse(localStorage.getItem(CHAVE_PREFS) || '{}'); return p && typeof p === 'object' && !Array.isArray(p) ? p : {}; } catch (e) { return {}; }
  }
  function gravarPrefs(p) {   // só o que não é número: um sim/não e nomes de coluna (sem dígito)
    try {
      var limpo = {};
      if (p.valores_escondidos === true) limpo.valores_escondidos = true;
      if (Array.isArray(p.colunas) && p.colunas.length && p.colunas.every(function (c) { return typeof c === 'string' && /^[^0-9]{1,40}$/.test(c); })) limpo.colunas = p.colunas.slice(0, 40);
      if (Object.keys(limpo).length) localStorage.setItem(CHAVE_PREFS, JSON.stringify(limpo)); else localStorage.removeItem(CHAVE_PREFS);
    } catch (e) { /* modo privado: a preferência vale só nesta página */ }
  }
  function memoria(comPrefs) {
    var m = {};
    var api = {
      getItem: function (k) {
        if (comPrefs && k === 'casa.oculto') return lerPrefs().valores_escondidos ? '1' : null;
        if (comPrefs && k === 'casa.livro.colunas') { var c = lerPrefs().colunas; return c ? JSON.stringify(c) : null; }
        return Object.prototype.hasOwnProperty.call(m, k) ? m[k] : null;
      },
      setItem: function (k, v) {
        var p;
        if (comPrefs && k === 'casa.oculto') { p = lerPrefs(); p.valores_escondidos = String(v) === '1'; gravarPrefs(p); return; }
        if (comPrefs && k === 'casa.livro.colunas') { p = lerPrefs(); try { p.colunas = JSON.parse(v); } catch (e) { return; } gravarPrefs(p); return; }
        m[k] = String(v);
      },
      removeItem: function (k) {
        var p;
        if (comPrefs && k === 'casa.oculto') { p = lerPrefs(); delete p.valores_escondidos; gravarPrefs(p); return; }
        if (comPrefs && k === 'casa.livro.colunas') { p = lerPrefs(); delete p.colunas; gravarPrefs(p); return; }
        delete m[k];
      },
      key: function (i) { var ks = Object.keys(m); return i < ks.length ? ks[i] : null; },
    };
    Object.defineProperty(api, 'length', { get: function () { return Object.keys(m).length; } });
    return api;
  }
  ECON.mem = memoria(true);     // no lugar do localStorage do mockup
  ECON.mem2 = memoria(false);   // no lugar do sessionStorage do mockup

  // ---------------------------------------------------------------- login (Google Identity Services) e cliente do árbitro
  var tokenAtual = PREVIA ? 'previa.sem.token' : null;   // o ID token vive só aqui, em memória
  var espera = null, precisaEntrar = false, emailConferido = null, aberto = false;

  function configGis() { return { client_id: CFG.CLIENT_ID, callback: aoCredencial, auto_select: true, cancel_on_tap_outside: false, itp_support: true }; }
  function aoCredencial(resp) {
    if (!resp || !resp.credential) return;
    tokenAtual = resp.credential; precisaEntrar = false;
    if (espera) { var e = espera; espera = null; clearTimeout(e.t); e.resolver(tokenAtual); atualizarFaixas(); }
    else if (!aberto) abrir();
    else { atualizarFaixas(); fila.enviar({ forcar: true }); }
  }
  // token novo sem trocar de página; se o Google pedir um toque, aparece «Entrar de novo» e os gestos esperam pendentes
  function renovar() {
    if (PREVIA) return Promise.resolve(tokenAtual);
    return new Promise(function (resolver, rejeitar) {
      if (!window.google || !google.accounts || !google.accounts.id) { rejeitar(new Error('gis_indisponivel')); return; }
      function desistir() {
        if (!espera) return;
        clearTimeout(espera.t); espera = null; precisaEntrar = true; atualizarFaixas();
        rejeitar(new Error('precisa_de_toque'));
      }
      espera = { resolver: resolver, t: setTimeout(desistir, 20000) };
      try {
        google.accounts.id.prompt(function (n) {
          try { if ((n.isNotDisplayed && n.isNotDisplayed()) || (n.isSkippedMoment && n.isSkippedMoment())) desistir(); } catch (e) { /* sem notificação: vale o prazo */ }
        });
      } catch (e) { desistir(); }
    });
  }
  window.aoCarregarGis = function () {
    if (PREVIA || !configurado) return;
    google.accounts.id.initialize(configGis());
    google.accounts.id.renderButton(el('econ-botao-google'), { theme: 'outline', size: 'large', text: 'signin_with', locale: 'pt-BR' });
    google.accounts.id.prompt();
  };

  var api = configurado ? Api.criarCliente({ url: API_URL, fetch: window.fetch.bind(window), token: function () { return tokenAtual; }, renovar: renovar }) : null;
  var fila = Fila.criar({
    enviar: function (item) { return api.chamar(item.tipo, item.envio); },
    aoMudar: function () { atualizarFaixas(); agendarDecorar(); },
    aoRecusar: aoRecusar,
    aoGravar: aoGravar,
  });
  ECON.fila = fila;

  // ---------------------------------------------------------------- leitura
  var rodadaLida = null;
  function lerTela(tela, tentativa) {
    return api.chamar('lerTela', { tela: tela, opcoes: { descompactar: true } }).then(function (r) {
      if (r && r.ok === true && typeof r.json === 'string') return { ok: true, dado: JSON.parse(r.json), rodada_id: r.rodada_id };
      if (r && r.motivo === 'rodada_instavel' && (tentativa || 0) < 2) return lerTela(tela, (tentativa || 0) + 1);
      return { ok: false, motivo: (r && r.motivo) || 'sem_resposta' };
    });
  }
  var IDENTIDADE = ['email_nao_autorizado', 'sem_acesso', 'aud_nao_permitida', 'email_nao_verificado', 'email_ausente', 'iss_invalido'];

  function mostrarMain(html) { var m = el('main'); if (m) m.innerHTML = html; }
  var ESQUELETO = '<div class="painel esqueleto" aria-busy="true" aria-label="carregando"><i style="width:60%"></i><i style="width:90%"></i><i style="width:80%"></i><i style="width:70%"></i></div>';
  function erroDeLeitura(incompleto) {
    document.body.classList.add('econ-sem-tela');
    mostrarMain('<div class="econ-estado" role="alert"><h2>Não consegui ler os dados agora.</h2>' +
      (incompleto ? '<p>O servidor ainda não publicou todos os números desta tela. Nada é mostrado pela metade.</p>' : '<p>Pode ser a rede ou o servidor. Nada foi perdido: o que você digitou e ainda não foi gravado continua na fila.</p>') +
      '<p><button class="btn prim" type="button" data-econ="tentar">Tentar de novo</button></p></div>');
  }
  function acessoNegado() {
    document.body.classList.add('econ-sem-tela');
    mostrarMain('<div class="econ-estado" role="alert"><h2>Este app é privado.</h2><p>Peça acesso ao Tobia.</p><p><button class="btn" type="button" data-econ="sair">Sair e apagar deste aparelho</button></p></div>');
  }

  function abrir() {
    if (!configurado) return;
    aberto = true;
    document.body.classList.remove('econ-entrada-aberta', 'econ-sem-tela');
    mostrarMain(ESQUELETO);
    return api.chamar('quem_sou', {}).then(function (q) {
      if (!q || q.ok !== true) {
        if (q && IDENTIDADE.indexOf(q.motivo) >= 0) { acessoNegado(); return null; }
        erroDeLeitura(false); return null;
      }
      emailConferido = q.email; mostrarConta();
      return Promise.all([lerTela('comum'), lerTela('painel'), api.chamar('lerAlteracoes', {})]);
    }).then(function (rs) {
      if (!rs) return;
      var comum = rs[0], painel = rs[1], alt = rs[2];
      var recusa = [comum, painel, alt].filter(function (r) { return !r || r.ok !== true; })[0];
      if (recusa) {
        if (IDENTIDADE.indexOf(recusa.motivo) >= 0) { acessoNegado(); return; }
        erroDeLeitura(false); return;
      }
      if (comum.rodada_id !== painel.rodada_id) { erroDeLeitura(false); return; }   // a rodada trocou no meio: «Tentar de novo» lê tudo de uma rodada só
      rodadaLida = painel.rodada_id;
      var D = Leitura.remontar({ comum: comum.dado, painel: painel.dado });
      var falta = Leitura.faltando(D, ['comum', 'painel']);
      if (falta.length) {
        if (window.console) console.warn('publicação incompleta: faltam ' + falta.length + ' caminhos', falta);
        erroDeLeitura(true); return;
      }
      ECON.D = D;
      prepararOrcado(alt.orcado || []);
      return carregarScripts(['telas/base.js', 'telas/painel.js', 'telas/simulacao.js', 'telas/casca.js']).then(function () {
        if (!window.__casa) { erroDeLeitura(false); return; }
        depoisDasTelas();
      });
    }).catch(function (e) {
      if (window.console) console.warn('leitura falhou', e && e.message);
      erroDeLeitura(false);
    });
  }

  var carregados = {};
  function carregarScripts(lista) {
    return lista.reduce(function (p, src) {
      return p.then(function () {
        if (carregados[src]) return null;
        return new Promise(function (ok, erro) {
          var s = document.createElement('script');
          s.src = src; s.async = false;
          s.onload = function () { carregados[src] = true; ok(); };
          s.onerror = function () { erro(new Error('não carregou ' + src)); };
          document.body.appendChild(s);
        });
      });
    }, Promise.resolve());
  }
  function casa() { return window.__casa; }

  // ---------------------------------------------------------------- orçado gravado (CONTRATO § 3c)
  var IDX = {}, ANO = null;
  var REV = {};        // id do nó → a maior revisão conhecida (publicada, de lerAlteracoes ou da última resposta)
  var ESTADO = {};     // id → { estado: 'pendente' | 'gravado', autor, em }
  var RECUSA = {};     // id → { motivo, token, resposta, x }   (x = o número recusado; a resposta vive só aqui, na memória)
  var POR_TOKEN = {};  // client_token → id do nó
  var ULTIMO = {};     // id → último número enviado (não reenvia o mesmo)

  function revDe(id) { var no = IDX[id]; return Math.max((no && Number(no.orcado_rev)) || 0, REV[id] || 0); }

  function prepararOrcado(alteracoes) {
    var D = ECON.D, sim = (D.v9 || {}).simulacao || {};
    ANO = sim.ano_ref || (D.v6.meta || {}).ano || (D.v8 && D.v8.meta && D.v8.meta.ano) || null;
    IDX = Orcado.indice(D);
    var ed = {}, alt = Orcado.sobreposicao(alteracoes, ANO, IDX);
    Object.keys(alt).forEach(function (id) {   // o digitado que a rodada ainda não incorporou: aparece por cima, com quem e quando
      REV[id] = Math.max(REV[id] || 0, alt[id].rev);
      ESTADO[id] = { estado: 'gravado', autor: alt[id].autor, em: alt[id].em }; ULTIMO[id] = alt[id].x;
      var pub = Orcado.valorPublicado(IDX[id]);
      if (typeof pub === 'number' && Math.abs(pub - alt[id].x) < 0.005) return;   // a gravação devolveu a linha ao valor publicado («Desfazer»): não é «valor seu», o contador cai a 0 (CONTRATO § 3c, regra 6)
      ed[id] = alt[id].x;
    });
    fila.itens().forEach(function (it) {       // o que ainda está na fila (não enviado ou recusado): o digitado nunca some da tela
      if (it.tipo !== 'gravarOrcado' || !it.envio) return;
      var id = Orcado.idDoNo(it.envio.linha_orcamento_id);
      if (id === null || !IDX[id] || it.envio.ano_orcado !== ANO || typeof it.envio.valor_orcado !== 'number') return;
      POR_TOKEN[it.client_token] = id; ed[id] = it.envio.valor_orcado; ULTIMO[id] = it.envio.valor_orcado;
      if (it.estado === 'recusado') { RECUSA[id] = { motivo: it.motivo || 'recusado', token: it.client_token, x: it.envio.valor_orcado, resposta: alt[id] ? { atual: { valor_orcado: alt[id].x, rev: alt[id].rev, autor: alt[id].autor, em: alt[id].em, base: alt[id].base } } : {} }; delete ESTADO[id]; }
      else ESTADO[id] = { estado: 'pendente' };
    });
    if (Object.keys(ed).length) ECON.mem.setItem('casa.orcado.' + ANO, JSON.stringify({ ano: ANO, ed: ed }));   // as telas leem daqui ao carregar, como liam o «guardado»
  }

  function refazerTela() { var c = casa(); if (!c) return; c.aplicarEd(); c.regioes(); }

  function confirmarCampo(id) {
    var c = casa(), no = IDX[id];
    if (!c || !no || !Orcado.grava(no)) return;
    var e = c.S.orc.ed[id], x, rec = RECUSA[id];
    if (e && e.x == null && String(e.raw || '').trim()) return;                      // «não entendi este número»: a tela já avisa, nada é enviado
    if (!e || e.x == null) {                                                           // campo esvaziado: volta ao valor publicado, e a volta também se grava
      if (rec || !(id in ULTIMO)) return;                                              // com recusa pendente, campo vazio não manda nada: a saída são os botões da recusa
      x = Orcado.valorPublicado(no); if (x == null) return;
      delete c.S.orc.ed[id];
    } else {
      x = Orcado.valorDaTela(no, e.x);
      if (x !== e.x) { e.x = x; e.raw = c.fmtCampo(x); }                               // Education Allowance: o crédito fica negativo na tela
    }
    if (rec) {
      // recusa pendente neste campo. O MESMO número não reenvia sozinho (quem decide é a pessoa, nos botões); um número NOVO é um gesto novo:
      // sai como pedido novo, com a revisão atual e client_token novo (CONTRATO § 3b), e o gesto recusado deixa a fila.
      if (rec.x === x) { if (rec.motivo === 'base_diferente') { delete c.S.orc.ed[id]; refazerTela(); } return; }
      if (!Orcado.pedido(no, x, ANO, revDe(id))) return;
      fila.descartar(rec.token); delete POR_TOKEN[rec.token]; delete RECUSA[id];
    } else if (ULTIMO[id] === x) { refazerTela(); return; }
    var ped = Orcado.pedido(no, x, ANO, revDe(id));
    if (!ped) return;
    var item;
    try { item = fila.enfileirar('gravarOrcado', ped); }
    catch (err) { c.toast('O navegador não deixou guardar este gesto (modo privado ou sem espaço): o valor NÃO foi gravado.'); return; }
    POR_TOKEN[item.client_token] = id; ULTIMO[id] = x; ESTADO[id] = { estado: 'pendente' };
    refazerTela();
  }

  function aoGravar(resposta, item) {
    if (item.tipo === 'gravarClassificacao') { livroGravado(resposta, item); return; }
    if (item.tipo !== 'gravarOrcado') return;
    var id = POR_TOKEN[item.client_token]; delete POR_TOKEN[item.client_token];
    if (!id) return;
    if (typeof resposta.rev === 'number') REV[id] = Math.max(REV[id] || 0, resposta.rev);
    else if (resposta.repetido) atualizarRevisoes();                                   // a resposta da 1ª tentativa se perdeu: a revisão nova vem de lerAlteracoes
    ESTADO[id] = { estado: 'gravado', autor: resposta.autor || emailConferido || '', em: resposta.em || '' };
    var c = casa(), e = c && c.S.orc.ed[id];
    if (e && typeof resposta.valor_orcado === 'number' && resposta.valor_orcado !== e.x) { e.x = resposta.valor_orcado; e.raw = c.fmtCampo(e.x); ULTIMO[id] = e.x; refazerTela(); }
    agendarDecorar(); atualizarMigracao(item.client_token, 'gravada');
  }

  function aoRecusar(item) {
    if (item.tipo === 'gravarClassificacao') { livroRecusado(item); return; }
    if (item.tipo !== 'gravarOrcado') { var c0 = casa(); if (c0) c0.toast(Orcado.recusa(item.motivo, item.resposta).texto); return; }
    var id = POR_TOKEN[item.client_token] || Orcado.idDoNo(item.envio && item.envio.linha_orcamento_id);
    if (!id) return;
    POR_TOKEN[item.client_token] = id;
    RECUSA[id] = { motivo: item.motivo, token: item.client_token, resposta: item.resposta || {}, x: item.envio ? item.envio.valor_orcado : undefined };
    delete ESTADO[id]; delete ULTIMO[id];
    var at = (item.resposta || {}).atual;
    if (at && typeof at.rev === 'number') REV[id] = Math.max(REV[id] || 0, at.rev);
    if (item.motivo === 'base_diferente') { var c = casa(); if (c) { delete c.S.orc.ed[id]; refazerTela(); } }   // a tela volta ao valor da linha
    agendarDecorar(); atualizarMigracao(item.client_token, 'recusada');
  }

  function atualizarRevisoes() {
    return api.chamar('lerAlteracoes', {}).then(function (r) {
      if (!r || r.ok !== true) return;
      var alt = Orcado.sobreposicao(r.orcado || [], ANO, IDX);
      Object.keys(alt).forEach(function (id) { REV[id] = Math.max(REV[id] || 0, alt[id].rev); });
    }, function () { /* a próxima gravação descobre pela recusa */ });
  }

  function resolverRecusa(id, acao) {
    var r = RECUSA[id], c = casa(); if (!r || !c) return;
    var at = (r.resposta || {}).atual || null, no = IDX[id], e = c.S.orc.ed[id];
    if (acao === 'ficar_meu' && e && e.x != null) {                // pedido novo, com a revisão atual e client_token novo (CONTRATO § 3b)
      fila.descartar(r.token); delete RECUSA[id];
      var ped = Orcado.pedido(no, e.x, ANO, revDe(id));
      if (ped) { var item = fila.enfileirar('gravarOrcado', ped); POR_TOKEN[item.client_token] = id; ULTIMO[id] = e.x; ESTADO[id] = { estado: 'pendente' }; }
    } else if (acao === 'reenviar') {
      delete RECUSA[id]; ESTADO[id] = { estado: 'pendente' }; if (e && e.x != null) ULTIMO[id] = e.x;
      fila.reenviar(r.token, { rev_esperada: revDe(id) });
    } else {                                                       // ficar com o dele · entendi · descartar: o gesto sai da fila
      fila.descartar(r.token); delete RECUSA[id];
      var v = at && at.valor_orcado !== '' && at.valor_orcado != null ? Number(at.valor_orcado) : null;
      if (acao === 'ficar_dele' && v !== null && isFinite(v)) { c.S.orc.ed[id] = { raw: c.fmtCampo(v), x: v, guardado: true }; ULTIMO[id] = v; ESTADO[id] = { estado: 'gravado', autor: at.autor || '', em: at.em || '' }; }
      else if (acao !== 'entendi' || r.motivo !== 'base_diferente') { delete c.S.orc.ed[id]; delete ULTIMO[id]; }
    }
    refazerTela(); agendarDecorar();
  }

  // «Desfazer as edições»: regrava, linha a linha, o valor publicado; nada se apaga (CONTRATO § 3c, regra 6).
  // Devolve QUANTAS linhas foram regravadas, para o aviso da tela dizer a verdade: só se desfaz o que foi gravado nesta página ou ainda
  // não entrou na rodada (lerAlteracoes). Depois da rodada o digitado JÁ É o valor publicado, e a tela não recebe o valor da versão
  // assinada nem o da carga: não há para onde voltar (0 linhas), e o aviso diz isso.
  ECON.orcadoDesfazer = function (ids) {
    var n = 0;
    (ids || []).forEach(function (id) {
      var no = IDX[id];
      if (!no || !(id in ULTIMO)) return;
      if (RECUSA[id]) { fila.descartar(RECUSA[id].token); delete RECUSA[id]; }
      var x = Orcado.valorPublicado(no); if (x == null || ULTIMO[id] === x) return;
      var ped = Orcado.pedido(no, x, ANO, revDe(id)); if (!ped) return;
      var item = fila.enfileirar('gravarOrcado', ped); POR_TOKEN[item.client_token] = id; ULTIMO[id] = x; ESTADO[id] = { estado: 'pendente' }; n++;
    });
    agendarDecorar();
    return n;
  };

  // ---------------------------------------------------------------- o que a casca acrescenta ao desenho das telas
  var obs = null, agendado = false;
  function agendarDecorar() {
    if (agendado || !casa()) return;
    agendado = true;
    setTimeout(function () { agendado = false; decorar(); }, 0);   // temporizador, não requestAnimationFrame: com a aba em segundo plano o quadro não vem e a recusa ficaria sem aviso
  }
  var ROT = { ficar_meu: 'Ficar com a minha', ficar_dele: 'Ficar com a outra', entendi: 'Entendi', descartar: 'Descartar', reenviar: 'Tentar de novo' };
  function fmtValor(v) { var c = casa(); return c && c.oculto() ? '•••' : (c ? c.fmtCampo(v) : String(v)); }
  function quemCurto(a) { return String(a || '').split('@')[0]; }
  function horaCurta(em) { var m = /T(\d{2}):(\d{2})/.exec(String(em || '')); return m ? m[1] + ':' + m[2] : ''; }

  function estadoHtml(id) {
    var r = RECUSA[id];
    if (r) {
      var t = Orcado.recusa(r.motivo, r.resposta, fmtValor);
      return '<span class="econ-st recusa" role="alert" data-chave="r|' + h(r.motivo) + '|' + h(r.token) + '">' + h(t.texto) + ' ' +
        t.acoes.map(function (a) { return '<button class="btn link peq" type="button" data-econ="recusa" data-acao="' + a + '" data-id="' + h(id) + '">' + h(a === 'ficar_dele' && t.quem && t.quem !== 'Outra pessoa' ? 'Ficar com a de ' + t.quem : ROT[a]) + '</button>'; }).join(' ') + '</span>';
    }
    var e = ESTADO[id];
    if (!e) return '';
    if (e.estado === 'pendente') {   // «enviando» na 1ª tentativa; depois de falhar (rede, servidor, login), «aguardando»: o gesto continua na fila
      var it = fila.itens().filter(function (i) { return POR_TOKEN[i.client_token] === id && i.estado !== 'recusado'; })[0];
      var esperando = !!(it && it.estado === 'pendente' && it.tentativas > 0);
      return '<span class="econ-st indo" data-chave="p' + (esperando ? 'e' : '') + '" role="status" title="ainda não gravou: está na fila, não feche a página">' + (esperando ? 'aguardando, não feche' : 'enviando…') + '</span>';
    }
    var quando = [quemCurto(e.autor), horaCurta(e.em)].filter(Boolean).join(' · ');
    return '<span class="econ-st ok" data-chave="g|' + h(quando) + '" title="gravado na planilha' + (quando ? ' por ' + h(quando) : '') + '; entra na conta na próxima rodada" aria-label="gravado na planilha">gravado' + (quando ? ' · ' + h(quando) : '') + '</span>';
  }

  function decorar() {
    var c = casa(); if (!c) return;
    if (obs) obs.disconnect();
    try {
      // 1 · cada campo de orçado: o que não entra na conta fica sem edição; os outros mostram enviando · gravado · recusa
      document.querySelectorAll('#main input[data-orc][data-n="7"]').forEach(function (inp) {
        var id = inp.dataset.orc, no = IDX[id], w = inp.closest('.campo-w') || inp, prox = w.nextElementSibling;
        var html = '';
        if (no && no.orcado_entra_na_conta === false) {
          inp.disabled = true; inp.title = 'valor derivado: não entra na conta, por isso não se edita aqui';
          html = '<span class="econ-st nota" data-chave="n">não entra na conta</span>';
        } else if (!no) {
          inp.disabled = true; inp.title = 'este campo ainda não tem linha na planilha';
          html = '<span class="econ-st nota" data-chave="s">sem linha na planilha</span>';
        } else html = estadoHtml(id);
        var chave = (/data-chave="([^"]*)"/.exec(html) || [])[1] || '';
        // a recusa precisa de espaço para a frase e os botões: ganha uma faixa da largura da tabela, logo abaixo da linha do campo
        var tr = inp.closest('.cat-r') || inp.closest('tr'), abaixo = tr ? tr.nextElementSibling : null, temLinha = !!(abaixo && abaixo.classList.contains('econ-recusa-linha'));
        if (RECUSA[id] && tr) {
          if (prox && prox.classList && prox.classList.contains('econ-st')) prox.remove();
          if (temLinha) { if (abaixo.dataset.chave === chave) return; abaixo.remove(); }
          var linha = document.createElement(tr.tagName === 'TR' ? 'tr' : 'div'); linha.className = 'econ-recusa-linha'; linha.dataset.chave = chave;
          linha.innerHTML = tr.tagName === 'TR' ? '<td colspan="99">' + html + '</td>' : html; tr.after(linha);
          return;
        }
        if (temLinha) abaixo.remove();
        if (prox && prox.classList && prox.classList.contains('econ-st')) { if (prox.dataset.chave === chave) return; prox.remove(); }
        if (html) w.insertAdjacentHTML('afterend', html);
      });
      // 2 · atalhos para telas que ainda não estão no ar viram texto
      document.querySelectorAll('#main a[href^="#"]').forEach(function (a) {
        var alvo = a.getAttribute('href').slice(1).split('/')[0];
        if (!alvo || c.rotas.indexOf(alvo) >= 0 || document.getElementById(alvo)) return;
        var s = document.createElement('span'); s.className = 'econ-sem-link'; s.title = 'esta tela chega numa próxima entrega'; s.textContent = a.textContent; a.replaceWith(s);
      });
      // 3 · no topo do Painel: trazer os números digitados no mockup (migração por arquivo, CONTRATO § 3d)
      var ta = el('topo-acoes');
      if (ta && !ta.querySelector('[data-econ="migrar"]') && rotaAtual() === 'painel' && !c.oculto() && c.S.pn && c.S.pn.editOrc) {
        ta.insertAdjacentHTML('afterbegin', '<button class="btn peq" type="button" data-econ="migrar" aria-label="Trazer os números do mockup" title="lê o arquivo «Baixar meus números» do mockup, mostra a diferença e só grava com o seu «Gravar»"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V9M7 14l5-5 5 5"/><path d="M5 4h14"/></svg><span>Trazer do mockup</span></button>');
      }
      // 4 · Livro-Caixa: enquanto o livro publicado não traz o id de cada linha, a edição fica desligada, e a tela diz
      var cab = rotaAtual() === 'livro' && ECON.livroPronto() && !ECON.livroEdita() ? document.querySelector('#main .cab-tela') : null;
      if (cab && !document.querySelector('#main .econ-so-leitura')) cab.insertAdjacentHTML('afterend', '<p class="econ-so-leitura">Só leitura por enquanto: para editar uma célula, o livro publicado precisa trazer o id de cada lançamento.</p>');
    } finally {
      if (obs) obs.observe(document.querySelector('.app'), { childList: true, subtree: true });
    }
  }
  function rotaAtual() { var r = (location.hash || '#painel').slice(1).split('/')[0]; return r === 'simulacao' ? 'orcamento' : (r === 'mes' ? 'painel' : r); }

  function dataHora(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(String(iso || '')); return m ? m[3] + '/' + m[2] + '/' + m[1] + ' ' + m[4] + ':' + m[5] : String(iso || ''); }
  // SPEC, «Rodapé novo»: dados até · rodada de · N gravações entram na próxima rodada
  ECON.rodape = function () {
    var D = ECON.D, rod = D.rodada || null, n = Object.keys(ESTADO).filter(function (id) { return ESTADO[id].estado === 'gravado'; }).length;
    var mf = D.v4.meta.mes_fechado, M3 = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    var mes = M3[+mf.slice(5, 7) - 1] + '/' + mf.slice(2, 4);
    var cambio = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(D.v4.meta.cambio_media);
    return '<footer class="rodape"><span>dados até ' + h(mes) + ' · rodada de ' + h(rod && rod.rodada_em ? dataHora(rod.rodada_em) : D.meta.gerado_em) + '</span><span>mês fechado: ' + h(mes) + ' · câmbio médio 1 € = R$ ' + cambio + '</span><span>' +
      (n === 1 ? '1 gravação entra' : n + ' gravações entram') + ' na próxima rodada</span></footer>';
  };

  function faixa(tipo, texto, botao) { return '<div class="econ-faixa ' + tipo + '" role="status"><span>' + h(texto) + '</span>' + (botao || '') + '</div>'; }
  function atualizarFaixas() {
    var f = el('econ-faixas'); if (!f) return;
    var r = fila.resumo(), p = [];
    if (precisaEntrar) p.push(faixa('aviso', 'O Google pediu para entrar de novo. O que você digitou espera na fila.', '<button class="btn peq" type="button" data-econ="entrar">Entrar de novo</button>'));
    if (r.enviando) p.push(faixa('indo', r.enviando + ' enviando, não feche'));
    else if (r.pendente) p.push(faixa('indo', r.pendente + (navigator.onLine === false ? ' aguardando a rede, não feche' : ' aguardando o servidor, não feche')));
    if (r.recusado) p.push(faixa('recusa', r.recusado === 1 ? '1 gravação não entrou.' : r.recusado + ' gravações não entraram.', '<button class="btn peq" type="button" data-econ="ver-recusadas">Ver</button>'));
    var rod = ECON.D && ECON.D.rodada;
    if (rod && rod.rodada_em) {
      var horas = (Date.now() - Date.parse(rod.rodada_em)) / 36e5;
      if (isFinite(horas) && horas > 24) p.push(faixa('aviso', 'Números de ' + dataHora(rod.rodada_em) + '. O Mac não rodou.'));
      if (rod.faixa) p.push(faixa('aviso', String(rod.faixa)));
    }
    f.innerHTML = p.join('');
  }

  function mostrarConta() {
    var b = el('econ-conta'); if (!b) return;
    b.hidden = false; b.textContent = (emailConferido || '?').slice(0, 1).toUpperCase();
    b.title = 'conta conferida pelo servidor: ' + (emailConferido || '');
    var e = el('econ-conta-email'); if (e) e.textContent = emailConferido || '';
  }

  // ---------------------------------------------------------------- recusadas, sair, migração
  function abrirDialogo(id, html) { var d = el(id); if (!d) return null; d.innerHTML = html; if (d.showModal && !d.open) d.showModal(); else d.setAttribute('open', ''); return d; }
  function fecharDialogo(id) { var d = el(id); if (!d) return; if (d.close && d.open) d.close(); else d.removeAttribute('open'); }

  function verRecusadas() {
    var linhas = fila.itens().filter(function (i) { return i.estado === 'recusado'; }).map(function (i) {
      var id = i.tipo === 'gravarOrcado' ? Orcado.idDoNo(i.envio && i.envio.linha_orcamento_id) : null, no = id ? IDX[id] : null;
      var rec = id && RECUSA[id] && RECUSA[id].token === i.client_token ? RECUSA[id] : { motivo: i.motivo, resposta: {} };
      var oque = i.tipo === 'gravarOrcado' ? 'Orçado de ' + (no ? no.nome : 'uma linha') + ': ' + fmtValor(i.envio.valor_orcado) : i.tipo === 'gravarClassificacao' ? 'Edição no Livro-Caixa' : 'Gravação';
      return '<li><b>' + h(oque) + '</b><span>' + h(Orcado.recusa(rec.motivo, rec.resposta, fmtValor).texto) + '</span><button class="btn peq" type="button" data-econ="descartar-item" data-token="' + h(i.client_token) + '">Descartar</button></li>';
    });
    abrirDialogo('econ-dialogo', '<h2>Gravações que não entraram</h2><p class="apoio">Nada some sozinho: cada uma fica aqui, com o que você digitou, até você descartar ou resolver ao lado do campo.</p><ul class="econ-lista">' +
      (linhas.join('') || '<li>Nenhuma.</li>') + '</ul><p><button class="btn" type="button" data-econ="fechar">Fechar</button></p>');
  }

  function sair() {
    var r = fila.resumo(), n = r.pendente + r.enviando + r.recusado;
    if (n && !window.confirm('Há ' + n + (n === 1 ? ' gravação ainda não enviada' : ' gravações ainda não enviadas') + '. Sair apaga ' + (n === 1 ? 'esse gesto' : 'esses gestos') + ' deste aparelho. Continuar?')) return;
    fila.apagarTudo();
    try { localStorage.removeItem(CHAVE_PREFS); } catch (e) { /* nada a apagar */ }
    try { sessionStorage.clear(); } catch (e) { /* idem */ }
    try { if (window.caches && caches.keys) caches.keys().then(function (ks) { ks.forEach(function (k) { caches.delete(k); }); }); } catch (e) { /* idem */ }
    try { if (window.indexedDB && indexedDB.databases) indexedDB.databases().then(function (ds) { ds.forEach(function (d) { if (d && d.name) indexedDB.deleteDatabase(d.name); }); }); } catch (e) { /* idem */ }
    try { google.accounts.id.disableAutoSelect(); } catch (e) { /* sem GIS carregado */ }
    tokenAtual = null; ECON.D = null;
    location.replace(location.pathname + (PREVIA ? '?previa=1' : ''));
  }

  var MIG = null;   // { plano, tokens: { token: 'indo' | 'gravada' | 'recusada' } }
  function migrarAbrir() {
    MIG = null;
    abrirDialogo('econ-dialogo', '<h2>Trazer os números do mockup</h2><p class="apoio">No mockup, toque em «Baixar meus números» e escolha aqui o arquivo <b>casa-orcado.json</b>. A tela mostra a diferença e nada é gravado antes do seu «Gravar».</p>' +
      '<p><input type="file" id="econ-arquivo" accept="application/json,.json" aria-label="arquivo casa-orcado.json"></p><div id="econ-mig"></div><p><button class="btn" type="button" data-econ="fechar">Fechar</button></p>');
  }
  function migrarLer(file) {
    var alvo = el('econ-mig'); if (!file || !alvo) return;
    var leitor = new FileReader();
    leitor.onerror = function () { alvo.innerHTML = '<p class="erro" role="alert">Não consegui ler o arquivo.</p>'; };
    leitor.onload = function () {
      var obj = null; try { obj = JSON.parse(String(leitor.result)); } catch (e) { obj = null; }
      var c = casa(), vig = function (id) { var e = c.S.orc.ed[id]; return e && e.x != null ? e.x : Orcado.valorPublicado(IDX[id]); };
      var plano = Orcado.migracao(obj, IDX, vig, ANO);
      MIG = plano.ok ? { plano: plano, tokens: {} } : null;
      alvo.innerHTML = migrarHtml(plano);
    };
    leitor.readAsText(file);
  }
  function migrarHtml(p) {
    if (!p.ok) return '<p class="erro" role="alert">' + h(p.erro) + '</p>';
    var c = casa(), money = function (v, cur) { return v == null ? '—' : (cur === 'BRL' ? 'R$ ' : '€ ') + fmtValor(v); };
    var st = MIG ? MIG.tokens : {}, gravadas = 0, recusadas = 0, indo = 0;
    Object.keys(st).forEach(function (t) { if (st[t] === 'gravada') gravadas++; else if (st[t] === 'recusada') recusadas++; else indo++; });
    var enviado = Object.keys(st).length > 0;
    var html = '<p class="econ-conta-mig" role="status"><b>lidas ' + p.lidas + '</b> · ' + (enviado ? 'gravadas ' + gravadas + (indo ? ' · enviando ' + indo : '') + ' · recusadas ' + recusadas : 'a gravar ' + p.gravar.length) + ' · já existiam ' + p.ja_existem.length + ' · não entram ' + p.nao_entram.length + '</p>';
    if (p.gravar.length) html += '<div class="tw"><table class="tb"><thead><tr><th scope="col">Linha</th><th scope="col" class="num">Hoje na tela</th><th scope="col" class="num">No arquivo</th></tr></thead><tbody>' +
      p.gravar.map(function (g) { return '<tr><th scope="row">' + h(g.nome) + ' <span class="apoio">' + h(g.unidade) + '</span></th><td class="num">' + money(g.de, g.moeda) + '</td><td class="num"><b>' + money(g.para, g.moeda) + '</b></td></tr>'; }).join('') + '</tbody></table></div>';
    if (p.nao_entram.length) html += '<p class="apoio"><b>Não entram</b> (ficam só neste relatório): ' + p.nao_entram.map(function (f) { return h(f.nome) + ' (' + h(f.motivo) + ')'; }).join(' · ') + '</p>';
    if (p.outros.length) html += '<p class="apoio"><b>Fora desta carga:</b> ' + p.outros.map(function (o) { return h(o.o_que) + ' (' + h(o.motivo) + ')'; }).join(' · ') + '</p>';
    if (p.gravar.length && !enviado) html += '<p><button class="btn prim" type="button" data-econ="migrar-gravar">Gravar ' + (p.gravar.length === 1 ? '1 valor' : p.gravar.length + ' valores') + '</button></p>';
    if (!p.gravar.length && !enviado) html += '<p class="apoio">Nada a gravar: o que está no arquivo já é o que a tela mostra.</p>';
    return html;
  }
  function migrarGravar() {
    var c = casa(); if (!MIG || !c) return;
    MIG.plano.gravar.forEach(function (g) {
      var no = IDX[g.id], ped = Orcado.pedido(no, g.para, ANO, revDe(g.id)); if (!ped) return;
      if (RECUSA[g.id]) { fila.descartar(RECUSA[g.id].token); delete RECUSA[g.id]; }
      c.S.orc.ed[g.id] = { raw: c.fmtCampo(g.para), x: g.para, guardado: true };
      var item = fila.enfileirar('gravarOrcado', ped); POR_TOKEN[item.client_token] = g.id; ULTIMO[g.id] = g.para; ESTADO[g.id] = { estado: 'pendente' }; MIG.tokens[item.client_token] = 'indo';
    });
    refazerTela();
    var alvo = el('econ-mig'); if (alvo) alvo.innerHTML = migrarHtml(MIG.plano);
  }
  function atualizarMigracao(token, estado) {
    if (!MIG || !(token in MIG.tokens)) return;
    MIG.tokens[token] = estado;
    var alvo = el('econ-mig'); if (alvo) alvo.innerHTML = migrarHtml(MIG.plano);
  }

  // ---------------------------------------------------------------- Livro-Caixa (carrega quando a pessoa abre)
  var livro = { estado: 'nada', rev: {}, porToken: {} };
  ECON.livroPronto = function () { return livro.estado === 'pronto'; };
  ECON.livroEdita = function () { var L = ECON.D && ECON.D.livro; return !!(L && Array.isArray(L.ids) && Array.isArray(L.revs) && L.ids.length === L.n); };
  ECON.verLivro = function () {
    if (livro.estado === 'pronto') return window.viewLivro();
    if (livro.estado === 'erro') return '<div class="econ-estado" role="alert"><h2>Não consegui ler o Livro-Caixa agora.</h2><p><button class="btn prim" type="button" data-econ="tentar-livro">Tentar de novo</button></p></div>';
    if (livro.estado === 'nada') carregarLivro();
    return ESQUELETO;
  };
  function carregarLivro() {
    livro.estado = 'carregando';
    lerTela('livro').then(function (r) {
      if (!r.ok || r.rodada_id !== rodadaLida) throw new Error(r.motivo || 'rodada trocou');
      Leitura.remontar({ livro: r.dado }, ECON.D);
      if (Leitura.faltando(ECON.D, ['livro']).length) throw new Error('livro incompleto');
      return carregarScripts(['telas/livro.js']);
    }).then(function () { livro.estado = 'pronto'; if (rotaAtual() === 'livro') casa().render(false); },
      function (e) { if (window.console) console.warn('livro', e && e.message); livro.estado = 'erro'; if (rotaAtual() === 'livro') casa().render(false); });
  }
  ECON.livroGravou = function (i, coluna, valor) {
    var L = ECON.D.livro; if (!ECON.livroEdita() || i >= L.n) return;
    var rev = i in livro.rev ? livro.rev[i] : Number(L.revs[i]);
    var ped = Orcado.pedidoClassificacao(L.ids[i], coluna, valor, rev); if (!ped) return;
    var item = fila.enfileirar('gravarClassificacao', ped); livro.porToken[item.client_token] = i;
  };
  function livroGravado(resposta, item) { var i = livro.porToken[item.client_token]; delete livro.porToken[item.client_token]; if (i != null && typeof resposta.rev === 'number') livro.rev[i] = resposta.rev; }
  function livroRecusado(item) {
    var i = livro.porToken[item.client_token], at = (item.resposta || {}).atual;
    if (i != null && at && typeof at.rev === 'number') livro.rev[i] = at.rev;
    var c = casa(); if (c) c.toast('Uma edição do Livro-Caixa não entrou. Toque em «Ver», na faixa do topo.');
  }

  // ---------------------------------------------------------------- eventos da casca
  function depoisDasTelas() {
    obs = new MutationObserver(agendarDecorar);
    decorar(); atualizarFaixas();
    fila.iniciar(window, document);
    // o orçado digitado grava quando a pessoa sai do campo (ou aperta Enter): uma gravação por valor, não por tecla
    document.addEventListener('change', function (ev) {
      var t = ev.target, d = t && t.dataset;
      if (d && d.orc != null && d.n === '7') setTimeout(function () { confirmarCampo(d.orc); }, 0);
    });
    document.addEventListener('keydown', function (ev) {
      var t = ev.target, d = t && t.dataset;
      if (ev.key === 'Enter' && d && d.orc != null && d.n === '7' && t.blur) t.blur();
    });
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target && ev.target.closest ? ev.target.closest('[data-econ], [data-act="econ-assinar"], [data-act="orc-voltar"]') : null;
    if (!b) return;
    var a = b.dataset.econ, c = casa();
    if (b.dataset.act === 'orc-voltar') { setTimeout(function () { var cc = casa(); if (cc) Object.keys(cc.S.orc.ed).forEach(confirmarCampo); }, 0); return; }
    if (b.dataset.act === 'econ-assinar') { if (c) c.toast('O servidor ainda não assina o orçamento: nada foi gravado. Os valores digitados já estão gravados, linha a linha.'); return; }
    if (a === 'tentar') { aberto = false; abrir(); }
    else if (a === 'tentar-livro') { livro.estado = 'nada'; if (c) c.render(false); }
    else if (a === 'recusa') resolverRecusa(b.dataset.id, b.dataset.acao);
    else if (a === 'entrar') { try { google.accounts.id.prompt(); } catch (e) { /* sem GIS */ } }
    else if (a === 'ver-recusadas') verRecusadas();
    else if (a === 'descartar-item') {
      var tk = b.dataset.token, id = POR_TOKEN[tk];
      if (id && RECUSA[id] && RECUSA[id].token === tk) resolverRecusa(id, 'descartar'); else fila.descartar(tk);
      verRecusadas();
    }
    else if (a === 'fechar') fecharDialogo('econ-dialogo');
    else if (a === 'conta') { var pop = el('econ-conta-pop'); if (pop) pop.hidden = !pop.hidden; }
    else if (a === 'sair') sair();
    else if (a === 'migrar') migrarAbrir();
    else if (a === 'migrar-gravar') migrarGravar();
  });
  document.addEventListener('change', function (ev) { if (ev.target && ev.target.id === 'econ-arquivo') migrarLer(ev.target.files && ev.target.files[0]); });
  window.addEventListener('online', atualizarFaixas);
  window.addEventListener('offline', atualizarFaixas);

  // ---------------------------------------------------------------- partida
  function partir() {
    if (!configurado) {
      document.body.classList.add('econ-sem-tela');
      mostrarMain('<div class="econ-estado" role="alert"><h2>Falta preencher o config.js.</h2><p>O id do cliente e o endereço do servidor ainda estão com os marcadores (LEIA.md, passo 1).</p></div>');
      return;
    }
    if (PREVIA) { document.body.classList.add('econ-previa'); abrir(); return; }
    document.body.classList.add('econ-entrada-aberta');
    var s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true; s.onload = window.aoCarregarGis;
    document.head.appendChild(s);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', partir); else partir();
})();
