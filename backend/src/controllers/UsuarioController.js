const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRA_EM } = require('../config/auth');
const { emailValido } = require('../utils/validacoes');

module.exports = {
  // POST /api/auth/register - Cria uma conta nova (rota pública)
  async cadastrar(req, res) {
    try {
      const { nome, email, senha, telefone } = req.body || {};

      // --- Validação dos dados enviados ---
      if (typeof nome !== 'string' || !nome.trim() || nome.trim().length > 100) {
        return res.status(400).json({ erro: "O nome é obrigatório (até 100 caracteres)." });
      }

      const emailLimpo = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!emailValido(emailLimpo)) {
        return res.status(400).json({ erro: "Informe um e-mail válido." });
      }

      if (typeof senha !== 'string' || senha.length < 6 || senha.length > 72) {
        return res.status(400).json({ erro: "A senha deve ter entre 6 e 72 caracteres." });
      }

      if (telefone !== undefined && telefone !== null && telefone !== '' &&
          (typeof telefone !== 'string' || telefone.length > 20)) {
        return res.status(400).json({ erro: "O telefone deve ser um texto de até 20 caracteres." });
      }

      // --- E-mail já usado? (409 = conflito) ---
      const usuarioExistente = await Usuario.findOne({ where: { email: emailLimpo } });
      if (usuarioExistente) {
        return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
      }

      // A senha NUNCA é guardada pura: salvamos só o hash (bcrypt)
      const senhaCriptografada = await bcrypt.hash(senha, 10);

      const novoUsuario = await Usuario.create({
        nome: nome.trim(),
        email: emailLimpo,
        senha: senhaCriptografada,
        telefone: telefone ? telefone.trim() : null
      });

      return res.status(201).json({
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        telefone: novoUsuario.telefone,
        mensagem: "Usuário criado com sucesso!"
      });

    } catch (error) {
      // Dois cadastros ao mesmo tempo com o mesmo e-mail: o banco barra o segundo
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ erro: "Este e-mail já está cadastrado." });
      }
      console.error("Erro no cadastro:", error);
      return res.status(500).json({ erro: "Erro interno no servidor ao cadastrar usuário." });
    }
  },

  // POST /api/auth/login - Confere e-mail e senha e devolve o token JWT (rota pública)
  async login(req, res) {
    try {
      const { email, senha } = req.body || {};

      if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
        return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
      }

      const usuario = await Usuario.findOne({ where: { email: email.trim().toLowerCase() } });
      if (!usuario) {
        return res.status(401).json({ erro: "E-mail ou senha incorretos." });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: "E-mail ou senha incorretos." });
      }

      // O token é assinado com o segredo que vem do .env e expira em 1h
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRA_EM }
      );

      return res.status(200).json({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        token
      });

    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ erro: "Erro interno no servidor ao tentar fazer login." });
    }
  },

  // GET /api/auth/me - Devolve os dados (não sensíveis) de quem está logado
  async me(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.idUsuario, {
        attributes: ['id', 'nome', 'email', 'telefone']
      });

      // Token válido, mas a conta não existe mais
      if (!usuario) {
        return res.status(401).json({ erro: "Usuário não encontrado. Faça login novamente." });
      }

      return res.status(200).json(usuario);
    } catch (error) {
      console.error("Erro ao buscar usuário logado:", error);
      return res.status(500).json({ erro: "Erro interno no servidor ao buscar usuário." });
    }
  }
};
