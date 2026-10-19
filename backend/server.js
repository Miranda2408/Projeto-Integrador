const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./src/config/database');
const routes = require('./src/routes/routes');

// IMPORTANTE: Importar os modelos para o Sequelize tomar conhecimento deles
const Usuario = require('./src/models/Usuario');
const Inventario = require('./src/models/Inventario');
const Aluguel = require('./src/models/Aluguel');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes); // Prefixo /api para todas as rotas definidas no arquivo routes.js

// Rota de teste da API
app.get('/api/status', (req, res) => {
  res.json({ mensagem: "API de Aluguel de Ferramentas funcionando com sucesso!" });
});

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    // .sync() cria as tabelas no MySQL automaticamente!
    // Opcional: usar { alter: true } atualiza as tabelas se você mudar algo no código depois
    await sequelize.sync( );
    console.log('📦 Banco de dados e tabelas sincronizados automaticamente!');
    
    app.listen(PORT, () => {
      console.log(`\n🚀 SERVIDOR ONLINE! Clique no link para testar:`);
      console.log(`👉 http://localhost:${PORT}/api/status \n`);
    });
  } catch (error) {
    console.error('❌ Falha ao conectar ou sincronizar o banco de dados:', error);
  }
}

iniciarServidor();