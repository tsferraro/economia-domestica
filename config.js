// config.js · os únicos dois valores que a página precisa. Nenhum é segredo (o id do cliente OAuth é público por natureza; o /exec só atende
// quem prova quem é por um token do Google), mas nenhum fica no código: preencha ao publicar (LEIA.md, passo 1).
window.ECON_CONFIG = {
  CLIENT_ID: '29508449638-7a4jkrvmn3ddira5t6ltin0oq6c77r74.apps.googleusercontent.com',   // «ID do cliente» do tipo Web, criado no Google Cloud da conta pessoal
  API_URL: 'https://script.google.com/macros/s/AKfycby1e0pFTENYzDscAB6zVkwgOhUb4eZ2gtqtkPGRqJsmvaybvaTka2lmjlnN7LWFOGDL/exec',      // endereço /exec da implantação de TESTE do árbitro (a saída do deploy.sh --teste)
};
