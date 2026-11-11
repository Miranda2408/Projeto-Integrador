const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Inventario = sequelize.define('Inventario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Usuario, key: 'id' }
  },
  nome_item: { type: DataTypes.STRING(150), allowNull: false },
  descricao: { type: DataTypes.TEXT },
  categoria: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'Outros' },
  preco_diaria: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status_disponibilidade: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'inventario',
  timestamps: true,
  underscored: true
});

// Lista das categorias aceitas (usada na validação e na tela de cadastro)
Inventario.CATEGORIAS = ['Elétrica', 'Manual', 'Jardinagem', 'Construção', 'Outros'];

// Relacionamento: um usuário tem muitos itens (se o usuário for excluído, seus itens também)
Usuario.hasMany(Inventario, { foreignKey: 'id_usuario', onDelete: 'CASCADE' });
Inventario.belongsTo(Usuario, { foreignKey: 'id_usuario' });

module.exports = Inventario;
