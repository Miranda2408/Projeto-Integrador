// Cria um usuário de demonstração e dois itens de exemplo.
// Pode rodar quantas vezes quiser: o que já existe não é duplicado.
// Uso (na pasta backend):  npm run seed

require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./src/config/database');
const Usuario = require('./src/models/Usuario');
const Inventario = require('./src/models/Inventario');

const EMAIL_DEMO = 'demo@exemplo.com';
const SENHA_DEMO = 'demo123';

const ITENS_EXEMPLO = [
  {
    nome_item: 'Furadeira de impacto',
    descricao: 'Furadeira 750W com maleta e jogo de brocas para concreto.',
    categoria: 'Elétrica',
    preco_diaria: 35.0,
    status_disponibilidade: true
  },
  {
    nome_item: 'Roçadeira a gasolina',
    descricao: 'Roçadeira 2 tempos, acompanha fio de nylon e protetor facial.',
    categoria: 'Jardinagem',
    preco_diaria: 60.0,
    status_disponibilidade: true
  }
];

async function popular() {
  try {
    await sequelize.sync();

    const [usuario] = await Usuario.findOrCreate({
      where: { email: EMAIL_DEMO },
      defaults: {
        nome: 'Usuário Demo',
        senha: await bcrypt.hash(SENHA_DEMO, 10),
        telefone: '(49) 99999-0000'
      }
    });

    for (const item of ITENS_EXEMPLO) {
      await Inventario.findOrCreate({
        where: { id_usuario: usuario.id, nome_item: item.nome_item },
        defaults: { ...item, id_usuario: usuario.id }
      });
    }

    console.log('✅ Dados de exemplo prontos.');
    console.log(`   Login de demonstração: ${EMAIL_DEMO} / senha: ${SENHA_DEMO}`);
  } catch (error) {
    console.error('❌ Não foi possível criar os dados de exemplo:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

popular();
