# Página de teste · Economia Doméstica (ADR-003 § 4)

Página estática (sem número, sem segredo) para o teste de 30 minutos que decide se o desenho «página no GitHub Pages + Apps Script como árbitro» funciona no iPhone. **Roda antes de a C3 construir tela.** Só abre depois do passo 1.

| Arquivo | O que é |
|---|---|
| `index.html` | a página: login Google, as provas da porta e a fila de gestos |
| `config.js` | os dois valores a preencher: `CLIENT_ID` e `API_URL` (marcadores `PREENCHER_*`) |
| `api.js` · `fila.js` | cliente do servidor (renova o token e reenvia) e fila de gestos (a única coisa guardada no aparelho) |
| `manifest.webmanifest` · `icone-*.png` · `apple-touch-icon.png` | «adicionar à tela de início» com o nome «Economia Doméstica» (`node tools/gerar_icones.js` refaz os ícones) |

## Passo 1 · Preparar (a sessão conduz; os gestos do Tobia são o 1, o 2 e o 4)

1. **Cliente OAuth** (gesto do Tobia): no Google Cloud da conta pessoal, criar o cliente do tipo «Web» com a origem do GitHub Pages; copiar o id. Para a Prova 3 criar um **2º cliente de teste** com a mesma origem.
2. **Planilha de teste** (gesto do Tobia): fazer uma **cópia** da planilha viva e passar o id à sessão. A implantação de teste grava nela, não na viva. Sem `planilha_id_teste` no `config.json` o `./deploy.sh --teste` **recusa** e não sobe nada.
3. A sessão põe no `config.json` (fora do git): `client_ids` (o 1º cliente), `planilha_id_teste` e `autorizados`, e roda `./deploy.sh --teste "teste de 30 min"` na pasta `app/`. O `/exec` de teste sai impresso; o `/exec` vigente não é tocado.
4. **Autorizar** (gesto do Tobia): abrir o `/exec` de teste **uma vez**, na conta dona, e clicar «Allow». A resposta `{"ok":false,"motivo":"use_post"}` é o certo.
5. A sessão preenche `config.js` (`CLIENT_ID` e `API_URL`) e publica a pasta `pagina/` no repositório do GitHub Pages.

### Trocar o `/exec` vigente (só depois do teste de 30 min verde)
O `./deploy.sh` sem `--teste` mexe no `/exec` que o app da C2 já usa. Por isso ele só roda com a flag `--trocar-exec` **e** o arquivo marcador `app/teste-30min-verde.txt` (fora do git, em `_trabalho`), com a data do teste verde na 1ª linha (`AAAA-MM-DD`). Sem os dois, recusa com a mensagem do que falta. Quem escreve o marcador é a sessão, depois de o Tobia dizer que as 6 provas passaram.

## Passo 2 · As 6 provas

Faça cada uma e anote **passou** ou **não passou**. «Passa quando» é o critério, não a impressão.

### Prova 1 · Login e chamada nas 3 superfícies, com 2 contas
Safari do iPhone · ícone da tela de início do iPhone · Chrome do Mac; a conta do Tobia e a da Ge. Em cada uma: entrar e apertar «Quem sou eu?».
**Passa quando:** nas 3 superfícies e nas 2 contas a página mostra «Conta conferida pelo servidor» com o e-mail certo, **sem aviso de app não verificado** do Google. Anote também se, no Chrome do Mac com várias contas e a da Mandū como padrão, o link da página abre (o caso do `/exec` que dava «Sorry, unable to open the file»).

### Prova 2 · 3ª conta
Entrar com uma conta Google que **não** está em `autorizados` e apertar «Quem sou eu?» e «Enfileirar a gravação».
**Passa quando:** o resultado é `email_nao_autorizado`, o gesto fica «recusado» na fila e nenhuma linha aparece na planilha de teste.

### Prova 3 · Sem token, vencido, de outro cliente
Botões «Pedido sem token», «Token malformado», «Token vencido» (só habilita depois de 1 h da entrada) e «Pedir token do outro cliente».
**Passa quando:** vêm `token_ausente`, `token_malformado`, `token_vencido` e `aud_nao_permitida`, cada um com o seu motivo, **e** nenhuma dessas 4 execuções deixa a linha `busca_certificados` no log do projeto Apps Script (menu «Execuções», aba de logs de cada execução). É essa linha que o servidor escreve (`console.log`) toda vez que busca os certificados do Google; a própria tela de Execuções não lista chamadas de `UrlFetchApp`, então sem a linha não há como conferir. Conferir assim: filtrar as execuções de `doPost` do momento das 4 provas e abrir o log de cada uma. (O 1º pedido bom da sessão pode deixar 1 linha, porque o cache está frio; ela não conta contra as 4 provas.)

### Prova 4 · Gesto parado mais de 1 hora sem rede
Enfileirar uma gravação em modo avião, deixar o aparelho parado **mais de 1 hora**, voltar a rede com a página ainda aberta.
**Passa quando:** o gesto fica visível («aguardando a rede, não feche»), e ao voltar a rede a página renova o token (se o Google pedir um toque, aparece «Entrar de novo» e o gesto continua pendente) e grava **uma** linha na planilha de teste: sem duplicar, com o `autor` igual ao e-mail da conta.

### Prova 5 · Fila em modo avião
Modo avião, enfileirar 2 gestos (a `rev` do 2º é a do 1º + 1), voltar a rede.
**Passa quando:** os 2 gestos esperam visíveis e gravam ao voltar a rede, em ordem, sem duplicar; depois de gravar, a fila fica vazia (nada de número fica no aparelho).

### Prova 6 · CORS do `/exec` com `fetch` e `text/plain`
É a leitura que a própria página faz em toda chamada.
**Passa quando:** a resposta do servidor aparece na página (campo «Resultado») sem erro de CORS no console, nas 3 superfícies da Prova 1.

## Se uma prova não passar
- Login falha no ícone do iPhone (Prova 1): plano B do ADR-003 § 4 (intermediário na Cloudflare que confere o token); vira ADR próprio, porque põe um terceiro no meio.
- Resto: anotar o texto exato que a página mostrou e levar à sessão.

## O que esta página não prova
Que a tela do app funciona; que o iPhone **mantém** a fila ao fechar o app (só a Prova 5, com a página aberta); desempenho do Painel (portão da C3).
