const Aluguel = require('../models/Aluguel');
const { Op } = require('sequelize');

module.exports = {
  // GET /api/alugueis - Lista o histórico geral de aluguéis
  async listar(req, res) {
    try {
      const alugueis = await Aluguel.findAll();
      return res.status(200).json(alugueis);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao buscar histórico de aluguéis." });
    }
  },

  // POST /api/alugueis - Registra um novo aluguel (Regra 422)
  async registrar(req, res) {
    try {
      const { id_usuario, id_item, data_inicio, data_fim, valor_total } = req.body;

      // REGRA DO BAREMA/OPENAPI: Verificar se o item já está reservado nestas datas
      const conflitoData = await Aluguel.findOne({
        where: {
          id_item,
          status_pedido: { [Op.ne]: 'Cancelado' }, // Ignora se o aluguel foi cancelado
          [Op.or]: [
            {
              data_inicio: { [Op.between]: [data_inicio, data_fim] }
            },
            {
              data_fim: { [Op.between]: [data_inicio, data_fim] }
            }
          ]
        }
      });

      if (conflitoData) {
        return res.status(422).json({ erro: "O item escolhido já está reservado nestas datas." });
      }

      const novoAluguel = await Aluguel.create({
        id_usuario,
        id_item,
        data_inicio,
        data_fim,
        valor_total
      });

      return res.status(201).json(novoAluguel);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao processar reserva de aluguel." });
    }
  },

  // PUT /api/alugueis/:id - Atualiza o status do aluguel (Ex: Concluído)
  async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status_pedido } = req.body;

      const aluguel = await Aluguel.findByPk(id);
      if (!aluguel) {
        return res.status(404).json({ erro: "Registro de aluguel não encontrado." });
      }

      await aluguel.update({ status_pedido });
      return res.status(200).json(aluguel);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao atualizar status do aluguel." });
    }
  },

  // DELETE /api/alugueis/:id - Cancela um registro pendente (Regra 400)
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const aluguel = await Aluguel.findByPk(id);
      if (!aluguel) {
        return res.status(404).json({ erro: "Registro de aluguel não encontrado." });
      }

      // REGRA DO BAREMA/OPENAPI: Apenas aluguéis com status 'Pendente' podem ser excluídos
      if (aluguel.status_pedido !== 'Pendente') {
        return res.status(400).json({ erro: "Aluguéis ativos ou concluídos não podem ser excluídos." });
      }

      await aluguel.destroy();
      return res.status(200).json({ mensagem: "Aluguel removido/cancelado com sucesso." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao remover registro de aluguel." });
    }
  }
};