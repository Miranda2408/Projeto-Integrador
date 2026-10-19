const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  senha: { type: DataTypes.STRING(255), allowNull: false },
  telefone: { type: DataTypes.STRING(20) }
}, {
  tableName: 'usuarios', // Nome da tabela no banco
  timestamps: true,      // Cria as colunas automaticamente (createdAt, updatedAt)
  underscored: true      // Transforma em padrão snake_case (criado_em)
});

module.exports = Usuario;