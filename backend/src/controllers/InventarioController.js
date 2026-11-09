const Inventario = require('../models/Inventario');
const Aluguel = require('../models/Aluguel');

module.exports = {
  // GET /api/inventario - Lista todas as ferramentas disponíveis
  async listar(req, res) {
    try {
      const itens = await Inventario.findAll();
      return res.status(200).json(itens);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao buscar itens do inventário." });
    }
  },

  // POST /api/inventario - Cadastra uma nova ferramenta
  async cadastrar(req, res) {
    try {
      const { nome_item, descricao, preco_diaria } = req.body;

      // O dono do item é SEMPRE o usuário logado (vem do token), nunca do corpo da requisição.
      // Assim ninguém consegue cadastrar um item em nome de outra pessoa.
      const id_usuario = req.idUsuario;

      if (!nome_item || !preco_diaria) {
        return res.status(400).json({ erro: "nome_item e preco_diaria são obrigatórios." });
      }

      if (!(Number(preco_diaria) > 0)) {
        return res.status(400).json({ erro: "preco_diaria deve ser um número maior que zero." });
      }

      const novoItem = await Inventario.create({
        id_usuario,
        nome_item,
        descricao,
        preco_diaria
      });

      return res.status(201).json(novoItem);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ erro: "Dados de cadastro inválidos." });
    }
  },

  // PUT /api/inventario/:id - Atualiza informações de um item
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome_item, preco_diaria, status_disponibilidade } = req.body;

      const item = await Inventario.findByPk(id);
      if (!item) {
        return res.status(404).json({ erro: "Item não encontrado." });
      }

      // PERMISSÃO: só o dono do item pode alterá-lo
      if (item.id_usuario !== req.idUsuario) {
        return res.status(403).json({ erro: "Você só pode alterar os seus próprios itens." });
      }

      if (preco_diaria !== undefined && !(Number(preco_diaria) > 0)) {
        return res.status(400).json({ erro: "preco_diaria deve ser um número maior que zero." });
      }

      // Atualiza apenas os campos que foram enviados
      const dados = {};
      if (nome_item !== undefined) dados.nome_item = nome_item;
      if (preco_diaria !== undefined) dados.preco_diaria = preco_diaria;
      if (status_disponibilidade !== undefined) dados.status_disponibilidade = status_disponibilidade;

      await item.update(dados);
      return res.status(200).json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao atualizar item." });
    }
  },

  // DELETE /api/inventario/:id - Remove um item do inventário (Regra 409)
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const item = await Inventario.findByPk(id);
      if (!item) {
        return res.status(404).json({ erro: "Item não encontrado." });
      }

      // PERMISSÃO: só o dono do item pode removê-lo
      if (item.id_usuario !== req.idUsuario) {
        return res.status(403).json({ erro: "Você só pode excluir os seus próprios itens." });
      }

      // REGRA DO BAREMA/OPENAPI: Verifica se o item possui algum aluguel pendente ou ativo
      const possuiAluguel = await Aluguel.findOne({
        where: {
          id_item: id,
          status_pedido: ['Pendente', 'Ativo'] // Aluguéis não concluídos
        }
      });

      if (possuiAluguel) {
        return res.status(409).json({ erro: "Não é possível deletar um item associado a um aluguel ativo." });
      }

      await item.destroy();
      return res.status(200).json({ mensagem: "Item deletado com sucesso." });
    } catch (error) {
      // Se o item tem aluguéis antigos (concluídos/cancelados), o banco não deixa excluir (RESTRICT)
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(409).json({ erro: "Não é possível deletar um item que possui histórico de aluguéis." });
      }
      console.error(error);
      return res.status(500).json({ erro: "Erro ao deletar item." });
    }
  }
};
