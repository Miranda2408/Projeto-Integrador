// IMPORTANTE: o dotenv precisa ser carregado ANTES de tudo, para o .env ser lido
require('dotenv').config();

const sequelize = require('./src/config/database');
const app = require('./app');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  try {
    // .sync() cria as tabelas no banco automaticamente (só as que ainda não existem)
    await sequelize.sync();
    console.log('📦 Banco de dados e tabelas sincronizados automaticamente!');

    app.listen(PORT, () => {
      console.log(`\n🚀 SERVIDOR ONLINE! Clique no link para testar:`);
      console.log(`👉 http://localhost:${PORT}/api/status \n`);
    });
  } catch (error) {
    console.error('❌ Falha ao conectar ou sincronizar o banco de dados:', error);
    process.exit(1); // Encerra o programa: sem banco de dados a API não funciona
  }
}

iniciarServidor();
