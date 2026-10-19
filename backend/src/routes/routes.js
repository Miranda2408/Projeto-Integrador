const express = require('express');
const routes = express.Router();

// Importar os controladores
const UsuarioController = require('../controllers/UsuarioController');
const InventarioController = require('../controllers/InventarioController');
const AluguelController = require('../controllers/AluguelController');

// Importar o Middleware de Segurança
const path = require('path');
const authMiddleware = require(path.resolve(__dirname, '..', 'middlewares', 'auth.js'));

// =========================================================================
// ROTAS PÚBLICAS (Qualquer um acessa sem token)
// =========================================================================
routes.post('/usuarios', UsuarioController.cadastrar); // Cadastro de conta
routes.post('/login', UsuarioController.login);        // Login do sistema

// =========================================================================
// A BARREIRA: Daqui para baixo, todas as rotas exigirão o token JWT!
// =========================================================================
routes.use(authMiddleware);

// ROTAS DE USUÁRIOS PROTEGIDAS
routes.get('/usuarios', UsuarioController.listar);
routes.get('/usuarios/:id', UsuarioController.buscarPorId);
routes.put('/usuarios/:id', UsuarioController.atualizar);
routes.delete('/usuarios/:id', UsuarioController.deletar);

// ROTAS DO INVENTÁRIO PROTEGIDAS
routes.get('/inventario', InventarioController.listar);
routes.post('/inventario', InventarioController.cadastrar);
routes.put('/inventario/:id', InventarioController.atualizar);
routes.delete('/inventario/:id', InventarioController.deletar);

// ROTAS DE ALUGUÉIS PROTEGIDAS
routes.get('/alugueis', AluguelController.listar);
routes.post('/alugueis', AluguelController.registrar);
routes.put('/alugueis/:id', AluguelController.atualizarStatus);
routes.delete('/alugueis/:id', AluguelController.deletar);

module.exports = routes;