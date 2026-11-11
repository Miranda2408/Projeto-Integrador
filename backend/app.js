const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');

// IMPORTANTE: Importar os modelos para o Sequelize tomar conhecimento deles
require('./src/models/Usuario');
require('./src/models/Inventario');

const app = express();

// CORS: só os endereços do front-end listados em CORS_ORIGIN podem chamar a API pelo navegador.
// Vários endereços se separam por vírgula. Sem a variável, vale só o front local (Vite).
const origensPermitidas = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean);

app.use(cors({ origin: origensPermitidas }));
app.use(express.json());

// Rota de teste da API (pública). Fica ANTES das rotas protegidas, senão exigiria token.
app.get('/api/status', (req, res) => {
  res.json({ mensagem: "API de Inventário de Ferramentas funcionando com sucesso!" });
});

app.use('/api', routes); // Prefixo /api para todas as rotas definidas no arquivo routes.js

// Rota que não existe
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

// Tratamento de erros: sempre responde em JSON e nunca mostra detalhes internos
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: "JSON inválido no corpo da requisição." });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ erro: "Corpo da requisição grande demais." });
  }
  console.error(err);
  return res.status(500).json({ erro: "Erro interno no servidor." });
});

module.exports = app;
