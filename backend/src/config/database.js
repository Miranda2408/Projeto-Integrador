const { Sequelize } = require('sequelize');

// Colocamos os dados direto aqui para garantir que o Node consiga ler!
const sequelize = new Sequelize(
  'aluguel_ferramentas', // Nome do banco que você criou no Workbench
  'root',                // Seu usuário do MySQL
  '',      // ⚠️ TROQUE PELA SUA SENHA DO WORKBENCH (se não tiver senha, deixe vazio '')
  {
    host: 'localhost',
    port: 3307,          // A porta 3307 que deu certo no passo anterior
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;