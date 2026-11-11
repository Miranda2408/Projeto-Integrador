const express = require('express');
const routes = express.Router();

// Importar os controladores
const UsuarioController = require('../controllers/UsuarioController');
const InventarioController = require('../controllers/InventarioController');

// Importar o Middleware de Segurança
const authMiddleware = require('../middlewares/auth');

// =========================================================================
// ROTAS PÚBLICAS (Qualquer um acessa sem token)
// =========================================================================
routes.post('/auth/register', UsuarioController.cadastrar); // Cadastro de conta
routes.post('/auth/login', UsuarioController.login);        // Login do sistema

// =========================================================================
// A BARREIRA: Daqui para baixo, todas as rotas exigirão o token JWT!
// =========================================================================
routes.use(authMiddleware);

// DADOS DO USUÁRIO LOGADO
routes.get('/auth/me', UsuarioController.me);

// ROTAS DO INVENTÁRIO (cada usuário só enxerga e altera os próprios itens)
// Atenção: '/inventario/categorias' precisa vir ANTES de '/inventario/:id'
routes.get('/inventario/categorias', InventarioController.categorias);
routes.get('/inventario', InventarioController.listar);
routes.get('/inventario/:id', InventarioController.buscarPorId);
routes.post('/inventario', InventarioController.cadastrar);
routes.put('/inventario/:id', InventarioController.atualizar);
routes.delete('/inventario/:id', InventarioController.deletar);

module.exports = routes;
