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
      const { id_usuario, nome_item, descricao, preco_diaria } = req.body;

      if (!id_usuario || !nome_item || !preco_diaria) {
        return res.status(400).json({ erro: "id_usuario, nome_item e preco_diaria son obrigatórios." });
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

      await item.update({ nome_item, preco_diaria, status_disponibilidade });
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

      const item = await Inventario.findByPk(id);
      if (!item) {
        return res.status(404).json({ erro: "Item não encontrado." });
      }

      await item.destroy();
      return res.status(200).json({ mensagem: "Item deletado com sucesso." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao deletar item." });
    }
  }
};