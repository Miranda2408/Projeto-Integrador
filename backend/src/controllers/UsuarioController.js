const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRA_EM } = require('../config/auth');

module.exports = {
  // GET /api/usuarios - Lista todos os usuários (Mapeado do OpenAPI)
  async listar(req, res) {
    try {
      // Busca apenas id, nome, email e telefone (oculta a senha por segurança)
      const usuarios = await Usuario.findAll({
        attributes: ['id', 'nome', 'email', 'telefone']
      });
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro interno no servidor ao listar usuários." });
    }
  },

  // GET /api/usuarios/:id - Busca um usuário específico pelo ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id, {
        attributes: ['id', 'nome', 'email', 'telefone']
      });

      if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado." });
      }

      return res.status(200).json(usuario);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao buscar usuário." });
    }
  },

  // POST /api/usuarios - Cadastra um novo usuário
  async cadastrar(req, res) {
    try {
      const { nome, email, senha, telefone } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ erro: "Nome, e-mail e senha são obrigatórios." });
      }

      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
      }

      const salt = await bcrypt.genSalt(10);
      const senhaCriptografada = await bcrypt.hash(senha, salt);

      const novoUsuario = await Usuario.create({
        nome,
        email,
        senha: senhaCriptografada,
        telefone
      });

      return res.status(201).json({
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        telefone: novoUsuario.telefone,
        mensagem: "Usuário criado com sucesso!"
      });

    } catch (error) {
      console.error("Erro no cadastro:", error);
      return res.status(500).json({ erro: "Erro interno no servidor ao cadastrar usuário." });
    }
  },

  // PUT /api/usuarios/:id - Atualiza os dados de um usuário (Mapeado do OpenAPI)
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, telefone } = req.body;

      // PERMISSÃO: cada usuário só pode alterar a PRÓPRIA conta
      if (Number(id) !== req.idUsuario) {
        return res.status(403).json({ erro: "Você só pode alterar os dados da sua própria conta." });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado." });
      }

      // Atualiza apenas os campos permitidos na especificação (e só os que foram enviados)
      const dados = {};
      if (nome !== undefined) dados.nome = nome;
      if (telefone !== undefined) dados.telefone = telefone;

      await usuario.update(dados);

      return res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        mensagem: "Usuário atualizado com sucesso!"
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao atualizar usuário." });
    }
  },

  // DELETE /api/usuarios/:id - Exclui um usuário do sistema (Mapeado do OpenAPI)
  async deletar(req, res) {
    try {
      const { id } = req.params;

      // PERMISSÃO: cada usuário só pode excluir a PRÓPRIA conta
      if (Number(id) !== req.idUsuario) {
        return res.status(403).json({ erro: "Você só pode excluir a sua própria conta." });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ erro: "Usuário não encontrado." });
      }

      await usuario.destroy();
      return res.status(200).json({ mensagem: "Usuário removido com sucesso." });
    } catch (error) {
      // Se o usuário tem aluguéis registrados, o banco não deixa excluir (RESTRICT)
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ erro: "Não é possível excluir um usuário que possui aluguéis registrados." });
      }
      console.error(error);
      return res.status(500).json({ erro: "Erro ao remover usuário." });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
      }

      const usuario = await Usuario.findOne({ where: { email } });
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
  }

};
