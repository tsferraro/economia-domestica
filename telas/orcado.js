/* orcado.js · as regras do orçado gravado, sem tela (roda no navegador e no Node): CONTRATO § 3c e § 3d.
 *
 *   indice(D)            → { id do nó: nó } dos campos de orçado publicados (têm `orcado_linha_id`)
 *   valorDaTela(no, x)   → o número no sinal da tela (Education Allowance: sempre negativo; o servidor guarda o módulo)
 *   valorPublicado(no)   → o número que o campo mostra sem nada digitado (a mesma regra do campo do mockup)
 *   pedido(no, x, ano, rev) → o `dados` de `gravarOrcado`, ou null se o campo não grava (derivado, «não entra na conta»)
 *   sobreposicao(alt, ano, idx) → o digitado ainda não incorporado pela rodada (de `lerAlteracoes().orcado`), por id do nó
 *   recusa(motivo, resposta)    → { texto, acoes } em português, sem nome interno
 *   migracao(arquivo, idx, vigente) → o plano da carga do arquivo «Baixar meus números» do mockup: o que grava, o que já existe, o que não entra
 */
(function (raiz, fabrica) {
  if (typeof module === 'object' && module.exports) module.exports = fabrica();
  else raiz.Orcado = fabrica();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var PREFIXO = 'v8|';
  function numero(v) { return typeof v === 'number' && isFinite(v); }

  function indice(D) {
    var out = {};
    function no(o, bloco) {
      if (!o || typeof o !== 'object') return;
      if (typeof o.orcado_linha_id === 'string' && o.id != null) {
        out[String(o.id)] = o;
        try { Object.defineProperty(o, '__bloco', { value: bloco, enumerable: false, configurable: true }); } catch (e) { /* nó congelado: fica sem a marca */ }
      }
      (o.grupos || []).forEach(function (x) { no(x, bloco); });
      (o.itens || []).forEach(function (x) { no(x, bloco); });
    }
    ((((D || {}).v8 || {}).blocos) || []).forEach(function (b) { (b.grupos || []).forEach(function (g) { no(g, String(b.id)); }); });
    return out;
  }

  function valorDaTela(no, x) {
    if (!numero(x)) return x;
    if (no && no.orcado_em_modulo) return x === 0 ? 0 : -Math.abs(x);
    return x;
  }

  // o campo do mockup: bloco 1 em R$/mês (orcado_nativo) ou mensal (planejado_mes); os demais, `planejado` (mensal no Cotidiano, anual nos outros)
  function valorPublicado(no) {
    if (!no) return null;
    if (no.__bloco === '1') {
      if (no.orcado_nativo && numero(no.orcado_nativo.valor)) return no.orcado_nativo.valor;
      if (no.planejado_mes != null) return numero(no.planejado_mes) ? no.planejado_mes : null;
    }
    return numero(no.planejado) ? no.planejado : null;
  }

  function grava(no) { return !!(no && typeof no.orcado_linha_id === 'string' && no.orcado_entra_na_conta !== false && (no.orcado_base === 'mes' || no.orcado_base === 'ano')); }

  function pedido(no, x, ano, rev) {
    if (!grava(no) || !numero(x) || !numero(ano)) return null;
    return { linha_orcamento_id: no.orcado_linha_id, ano_orcado: ano, valor_orcado: valorDaTela(no, x), base: no.orcado_base, rev_esperada: numero(rev) ? rev : 0 };
  }

  function idDoNo(linhaId) { return String(linhaId || '').indexOf(PREFIXO) === 0 ? String(linhaId).slice(PREFIXO.length) : null; }

  function sobreposicao(alteracoes, ano, idx) {
    var out = {};
    (alteracoes || []).forEach(function (a) {
      var id = idDoNo(a && a.linha_orcamento_id);
      if (id === null || !idx[id] || Number(a.ano_orcado) !== ano) return;
      var x = Number(a.valor_orcado);
      if (a.valor_orcado === '' || a.valor_orcado === null || !isFinite(x)) return;
      out[id] = { x: valorDaTela(idx[id], x), rev: Number(a.rev) || 0, autor: a.autor || '', em: a.em || '', base: a.base || '' };
    });
    return out;
  }

  var IDENTIDADE_CONTA = ['email_nao_autorizado', 'sem_acesso'];
  var IDENTIDADE_LOGIN = ['aud_nao_permitida', 'iss_invalido', 'email_nao_verificado', 'email_ausente'];
  function quem(autor) { var a = String(autor || '').split('@')[0]; return a ? a : 'Outra pessoa'; }
  function horaCurta(em) { var m = /T(\d{2}:\d{2})/.exec(String(em || '')); return m ? m[1] : ''; }

  // `fmt(valor)` escreve o número como a tela (com «•••» se os valores estão escondidos)
  function recusa(motivo, resposta, fmt) {
    var r = resposta || {}, at = r.atual || null;
    fmt = fmt || function (v) { return String(v); };
    if (motivo === 'rev_desatualizada') {
      var h = at && at.em ? horaCurta(at.em) : '';
      var val = at && numero(Number(at.valor_orcado)) && at.valor_orcado !== '' && at.valor_orcado != null ? ': agora é ' + fmt(Number(at.valor_orcado)) : '';
      var q = quem(at && at.autor);
      return { texto: q + ' mudou este valor' + (h ? ' às ' + h : '') + val + '. Ficar com a sua ou com a de ' + (q === 'Outra pessoa' ? 'quem mudou' : q) + '?', acoes: ['ficar_meu', 'ficar_dele'], quem: q };
    }
    if (motivo === 'base_diferente') {
      return { texto: 'Não gravou: na planilha este valor é por ' + (at && at.base === 'mes' ? 'mês' : 'ano') + '. O campo voltou ao valor da linha.', acoes: ['entendi'] };
    }
    if (motivo === 'valor_invalido') {
      if (r.detalhe === 'numero_ambiguo') return { texto: 'Não gravou: o servidor não soube se a vírgula é de milhar ou de centavo. Escreva sem ponto de milhar, com vírgula só nos centavos.', acoes: ['entendi'] };
      if (r.campo === 'linha_orcamento_id') return { texto: 'Não gravou: esta linha não está no plano de contas da planilha.', acoes: ['entendi'] };
      return { texto: 'Não gravou: o servidor não aceitou este número.', acoes: ['entendi'] };
    }
    if (motivo === 'campo_nao_editavel') return { texto: 'Não gravou: este campo não aceita edição.', acoes: ['entendi'] };
    if (motivo === 'nao_implementada') return { texto: 'Não gravou: o servidor ainda não tem esta gravação.', acoes: ['entendi'] };
    if (IDENTIDADE_CONTA.indexOf(motivo) >= 0) return { texto: 'Não gravou: esta conta não tem acesso. O que você digitou continua aqui.', acoes: ['descartar'] };
    if (IDENTIDADE_LOGIN.indexOf(motivo) >= 0) return { texto: 'Não gravou: o servidor não aceitou o login desta página. Saia e entre de novo. O que você digitou continua aqui.', acoes: ['descartar'] };
    return { texto: 'Não gravou: o servidor recusou. O que você digitou continua aqui.', acoes: ['reenviar', 'descartar'] };
  }

  // arquivo = o JSON de «Baixar meus números» do mockup ({formato:'casa-orcado', versao, ano, orcado:{id:x}, …}); vigente(id) = o número do campo hoje
  function migracao(arquivo, idx, vigente, ano) {
    var a = arquivo;
    if (!a || typeof a !== 'object' || a.formato !== 'casa-orcado' || !a.orcado || typeof a.orcado !== 'object') {
      return { ok: false, erro: 'Não é o arquivo de «Baixar meus números» do mockup (casa-orcado.json).' };
    }
    if (numero(a.ano) && numero(ano) && a.ano !== ano) return { ok: false, erro: 'O arquivo é do orçado de ' + a.ano + '; a tela está em ' + ano + '.' };
    var gravar = [], ja = [], fora = [];
    Object.keys(a.orcado).forEach(function (id) {
      var x = a.orcado[id], no = idx[id];
      if (!numero(x)) { fora.push({ id: id, nome: no ? no.nome : id, valor: x, motivo: 'não é número' }); return; }
      if (!no) { fora.push({ id: id, nome: id, valor: x, motivo: 'sem campo nesta tela' }); return; }
      if (!grava(no)) { fora.push({ id: id, nome: no.nome, valor: x, motivo: 'não entra na conta (valor derivado)' }); return; }
      var para = valorDaTela(no, x), de = vigente ? vigente(id) : valorPublicado(no);
      if (numero(de) && Math.abs(de - para) < 0.005) { ja.push({ id: id, nome: no.nome, valor: para }); return; }
      gravar.push({ id: id, nome: no.nome, de: numero(de) ? de : null, para: para, unidade: no.orcado_base === 'mes' ? 'por mês' : 'no ano', moeda: (no.orcado_nativo && no.orcado_nativo.moeda) || no.moeda || 'EUR' });
    });
    var outros = [], s = a.simulacao || null;
    if (s && typeof s === 'object') {
      var ns = Object.keys(s.orcado || {}).length + (s.itens_novos || []).length + (s.ajustes_desligados || []).length;
      if (ns) outros.push({ o_que: 'simulação', n: ns, motivo: 'o servidor ainda não guarda a simulação' });
    }
    if (a.meta_poupanca_pct != null) outros.push({ o_que: 'meta de poupança', n: 1, motivo: 'o servidor ainda não guarda parâmetros' });
    if (a.taxa_henner != null) outros.push({ o_que: 'taxa Henner', n: 1, motivo: 'o servidor ainda não guarda parâmetros' });
    if (a.planejador) outros.push({ o_que: 'plano do verão', n: 1, motivo: 'o servidor ainda não guarda parâmetros' });
    return { ok: true, lidas: gravar.length + ja.length + fora.length, gravar: gravar, ja_existem: ja, nao_entram: fora, outros: outros };
  }

  // colunas do Livro-Caixa que o contrato deixa editar → campo de `gravarClassificacao` (CONTRATO § 3; parcela e observação nunca)
  var CAMPO_DO_LIVRO = { DESCRICAO_LIMPA: 'descricao', CATEGORIA: 'categoria', ITEM: 'item', PROJETO: 'projeto', CONTRAPARTE: 'contraparte', TITULAR: 'titular', COR: 'confianca' };
  function pedidoClassificacao(lancamentoId, coluna, valor, rev) {
    var campo = CAMPO_DO_LIVRO[coluna];
    if (!campo || typeof lancamentoId !== 'string' || !lancamentoId || !numero(rev)) return null;
    var campos = {}; campos[campo] = String(valor == null ? '' : valor);
    return { lancamento_id: lancamentoId, campos: campos, rev_esperada: rev };
  }

  return { PREFIXO: PREFIXO, indice: indice, valorDaTela: valorDaTela, valorPublicado: valorPublicado, grava: grava, pedido: pedido, idDoNo: idDoNo, sobreposicao: sobreposicao,
    recusa: recusa, migracao: migracao, CAMPO_DO_LIVRO: CAMPO_DO_LIVRO, pedidoClassificacao: pedidoClassificacao };
});
