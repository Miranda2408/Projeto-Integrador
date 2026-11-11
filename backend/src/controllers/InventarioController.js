const Inventario = require('../models/Inventario');
const { idValido } = require('../utils/validacoes');

// Transforma o item em objeto simples e garante que o preço sai como número
// (o banco devolve DECIMAL como texto, e assim fica igual em todas as respostas).
function formatar(item) {
  return { ...item.toJSON(), preco_diaria: Number(item.preco_diaria) };
}

// Busca um item pelo id, mas SOMENTE se ele pertence ao usuário logado.
// Se o item existe mas é de outra pessoa, devolve null (a resposta será 404).
function buscarProprio(id, idUsuario) {
  return Inventario.findOne({ where: { id, id_usuario: idUsuario } });
}

// Valida os campos recebidos no corpo da requisição.
// completo = true  -> cadastro (nome_item e preco_diaria são obrigatórios)
// completo = false -> edição (só valida o que foi enviado)
// Devolve { erro } se algo estiver errado, ou { dados } com os valores já limpos.
function lerCampos(body, completo) {
  const b = body || {};
  const dados = {};

  if (completo || b.nome_item !== undefined) {
    if (typeof b.nome_item !== 'string' || !b.nome_item.trim() || b.nome_item.trim().length > 150) {
      return { erro: "nome_item é obrigatório (texto de até 150 caracteres)." };
    }
    dados.nome_item = b.nome_item.trim();
  }

  if (b.descricao !== undefined) {
    if (b.descricao === null) {
      dados.descricao = null;
    } else if (typeof b.descricao !== 'string' || b.descricao.length > 2000) {
      return { erro: "descricao deve ser um texto de até 2000 caracteres." };
    } else {
      dados.descricao = b.descricao.trim();
    }
  }

  if (b.categoria !== undefined) {
    if (!Inventario.CATEGORIAS.includes(b.categoria)) {
      return { erro: `categoria inválida. Use uma destas: ${Inventario.CATEGORIAS.join(', ')}.` };
    }
    dados.categoria = b.categoria;
  }

  if (completo || b.preco_diaria !== undefined) {
    let preco = NaN;
    if (typeof b.preco_diaria === 'number') {
      preco = b.preco_diaria;
    } else if (typeof b.preco_diaria === 'string' && b.preco_diaria.trim() !== '') {
      preco = Number(b.preco_diaria);
    }
    if (!Number.isFinite(preco) || preco <= 0 || preco > 99999999.99) {
      return { erro: "preco_diaria deve ser um número maior que zero." };
    }
    dados.preco_diaria = Math.round(preco * 100) / 100;
  }

  if (b.status_disponibilidade !== undefined) {
    if (typeof b.status_disponibilidade !== 'boolean') {
      return { erro: "status_disponibilidade deve ser true ou false." };
    }
    dados.status_disponibilidade = b.status_disponibilidade;
  }

  return { dados };
}

module.exports = {
  // GET /api/inventario - Lista SOMENTE os itens do usuário logado
  async listar(req, res) {
    try {
      const itens = await Inventario.findAll({
        where: { id_usuario: req.idUsuario },
        order: [['id', 'DESC']]
      });
      return res.status(200).json(itens.map(formatar));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao buscar itens do inventário." });
    }
  },

  // GET /api/inventario/categorias - Lista as categorias aceitas (para o campo de seleção)
  categorias(req, res) {
    return res.status(200).json(Inventario.CATEGORIAS);
  },

  // GET /api/inventario/:id - Mostra um item do usuário logado
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      if (!idValido(id)) {
        return res.status(400).json({ erro: "Identificador inválido." });
      }

      const item = await buscarProprio(id, req.idUsuario);
      if (!item) {
        return res.status(404).json({ erro: "Item não encontrado." });
      }

      return res.status(200).json(formatar(item));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao buscar item." });
    }
  },

  // POST /api/inventario - Cadastra um item para o usuário logado
  async cadastrar(req, res) {
    try {
      const { erro, dados } = lerCampos(req.body, true);
      if (erro) {
        return res.status(400).json({ erro });
      }

      // O dono do item é SEMPRE o usuário logado (vem do token), nunca do corpo da requisição.
      const novoItem = await Inventario.create({ ...dados, id_usuario: req.idUsuario });

      return res.status(201).json(formatar(novoItem));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao cadastrar item." });
    }
  },

  // PUT /api/inventario/:id - Atualiza um item do usuário logado
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      if (!idValido(id)) {
        return res.status(400).json({ erro: "Identificador inválido." });
      }

      const item = await buscarProprio(id, req.idUsuario);
      if (!item) {
        return res.status(404).json({ erro: "Item não encontrado." });
      }

      const { erro, dados } = lerCampos(req.body, false);
      if (erro) {
        return res.status(400).json({ erro });
      }
      if (Object.keys(dados).length === 0) {
        return res.status(400).json({ erro: "Envie ao menos um campo para atualizar." });
      }

      await item.update(dados);
      return res.status(200).json(formatar(item));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ erro: "Erro ao atualizar item." });
    }
  },

  // DELETE /api/inventario/:id - Exclui um item do usuário logado
  async deletar(req, res) {
    try {
      const { id } = req.params;
      if (!idValido(id)) {
        return res.status(400).json({ erro: "Identificador inválido." });
      }

      const item = await buscarProprio(id, req.idUsuario);
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
