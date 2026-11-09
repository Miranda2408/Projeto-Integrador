const Aluguel = require('../models/Aluguel');
const Inventario = require('../models/Inventario');
const { Op } = require('sequelize');

// Status que um aluguel pode ter
const STATUS_VALIDOS = ['Pendente', 'Ativo', 'Concluído', 'Cancelado'];

// Converte um texto "AAAA-MM-DD" em data. Devolve null se o texto não for uma data válida
// (exemplos inválidos: "2026-02-31", "10/05/2026", "abc").
function lerData(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return null;
  }
  const data = new Date(`${texto}T00:00:00Z`);
  if (Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== texto) {
    return null;
  }
  return data;
}

// Busca o item do aluguel e confere se quem está logado participa dele:
// ou é quem alugou, ou é o dono do item.
async function usuarioParticipa(aluguel, idUsuario) {
  if (aluguel.id_usuario === idUsuario) {
    return true;
  }
  const item = await Inventario.findByPk(aluguel.id_item);
  return Boolean(item) && item.id_usuario === idUsuario;
}

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
      const { id_item, data_inicio, data_fim } = req.body;

      // Quem aluga é SEMPRE o usuário logado (vem do token), nunca do corpo da requisição.
      const id_usuario = req.idUsuario;

      // --- Validações dos dados enviados ---
      if (!id_item || !data_inicio || !data_fim) {
        return res.status(400).json({ erro: "id_item, data_inicio e data_fim são obrigatórios." });
      }

      const inicio = lerData(data_inicio);
      const fim = lerData(data_fim);
      if (!inicio || !fim) {
        return res.status(400).json({ erro: "Datas inválidas. Use o formato AAAA-MM-DD (ex: 2026-12-25)." });
      }
      if (fim < inicio) {
        return res.status(400).json({ erro: "A data final não pode ser anterior à data inicial." });
      }

      // --- O item existe e está disponível? ---
      const item = await Inventario.findByPk(id_item);
      if (!item) {
        return res.status(404).json({ erro: "Item não encontrado." });
      }
      if (!item.status_disponibilidade) {
        return res.status(422).json({ erro: "O item escolhido não está disponível para aluguel." });
      }

      // REGRA DO BAREMA/OPENAPI: Verificar se o item já está reservado nestas datas.
      // Dois períodos se sobrepõem quando: o início de um é antes (ou igual) ao fim do outro
      // E o fim de um é depois (ou igual) ao início do outro. Essa condição pega TODOS os casos,
      // inclusive quando um aluguel existente cobre o período novo por inteiro.
      const conflitoData = await Aluguel.findOne({
        where: {
          id_item,
          status_pedido: { [Op.ne]: 'Cancelado' }, // Ignora se o aluguel foi cancelado
          data_inicio: { [Op.lte]: data_fim },
          data_fim: { [Op.gte]: data_inicio }
        }
      });

      if (conflitoData) {
        return res.status(422).json({ erro: "O item escolhido já está reservado nestas datas." });
      }

      // O valor total é calculado AQUI no servidor (o cliente não pode inventar o preço).
      // Conta os dias incluindo o primeiro e o último: de 10 a 12 = 3 dias.
      const dias = Math.round((fim - inicio) / 86400000) + 1;
      const valor_total = Number((dias * Number(item.preco_diaria)).toFixed(2));

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

      if (!STATUS_VALIDOS.includes(status_pedido)) {
        return res.status(400).json({ erro: `status_pedido inválido. Use um destes: ${STATUS_VALIDOS.join(', ')}.` });
      }

      const aluguel = await Aluguel.findByPk(id);
      if (!aluguel) {
        return res.status(404).json({ erro: "Registro de aluguel não encontrado." });
      }

      // PERMISSÃO: só quem alugou ou o dono do item pode mudar o status
      if (!(await usuarioParticipa(aluguel, req.idUsuario))) {
        return res.status(403).json({ erro: "Você não tem permissão para alterar este aluguel." });
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

      // PERMISSÃO: só quem alugou ou o dono do item pode excluir
      if (!(await usuarioParticipa(aluguel, req.idUsuario))) {
        return res.status(403).json({ erro: "Você não tem permissão para excluir este aluguel." });
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
