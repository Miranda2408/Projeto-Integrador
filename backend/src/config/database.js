const { Sequelize } = require('sequelize');

// Os dados de conexão vêm do arquivo .env (backend/.env).
// Assim a senha do banco não fica escrita no código nem vai para o GitHub.
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;
