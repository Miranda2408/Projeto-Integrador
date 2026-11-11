const { Sequelize } = require('sequelize');

// Os dados de conexão vêm do arquivo .env (backend/.env).
// Assim a senha do banco não fica escrita no código nem vai para o GitHub.
//
// Dois jeitos de configurar:
//  1) DATABASE_URL  -> um endereço único (é o que o Supabase e o Render fornecem)
//  2) DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS -> campos separados (uso local)
//
// DB_DIALECT escolhe o tipo de banco: "mysql" (padrão) ou "postgres".
// DB_SSL=true liga a conexão segura, que bancos hospedados costumam exigir.

const opcoes = { logging: false };

if (process.env.DB_SSL === 'true') {
  opcoes.dialectOptions = { ssl: { require: true, rejectUnauthorized: false } };
}

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, opcoes);
} else {
  const dialect = process.env.DB_DIALECT || 'mysql';
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS || '',
    {
      ...opcoes,
      dialect,
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || (dialect === 'postgres' ? 5432 : 3306),
    }
  );
}

module.exports = sequelize;
