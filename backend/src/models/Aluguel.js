const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Inventario = require('./Inventario');

const Aluguel = sequelize.define('Aluguel', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  id_usuario: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: Usuario, key: 'id' }
  },
  id_item: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: Inventario, key: 'id' }
  },
  data_inicio: { type: DataTypes.DATEONLY, allowNull: false },
  data_fim: { type: DataTypes.DATEONLY, allowNull: false },
  valor_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status_pedido: { type: DataTypes.STRING(50), defaultValue: 'Pendente' }
}, {
  tableName: 'alugueis',
  timestamps: true,
  underscored: true
});

// Relacionamentos dos Aluguéis
Usuario.hasMany(Aluguel, { foreignKey: 'id_usuario', onDelete: 'RESTRICT' });
Aluguel.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Inventario.hasMany(Aluguel, { foreignKey: 'id_item', onDelete: 'RESTRICT' });
Aluguel.belongsTo(Inventario, { foreignKey: 'id_item' });

module.exports = Aluguel;