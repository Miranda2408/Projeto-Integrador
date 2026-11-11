import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { mensagemDeErro } from '../services/api';
import { CATEGORIAS_PADRAO } from '../utils/categorias';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';

const FORM_VAZIO = {
  nome_item: '',
  categoria: 'Outros',
  preco_diaria: '',
  descricao: '',
  status_disponibilidade: true
};

// Formulário usado para CADASTRAR (/ferramentas/nova) e para EDITAR (/ferramentas/:id/editar).
// Se existe :id na URL, estamos editando e o formulário já abre preenchido.
export default function FerramentaForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(FORM_VAZIO);
  const [categorias, setCategorias] = useState(CATEGORIAS_PADRAO);
  const [carregando, setCarregando] = useState(editando);
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Busca na API a lista de categorias (se falhar, continua com a lista padrão)
  useEffect(() => {
    api.get('/inventario/categorias')
      .then((resposta) => setCategorias(resposta.data))
      .catch(() => {});
  }, []);

  // Na edição: busca a ferramenta e preenche os campos
  useEffect(() => {
    if (!editando) {
      return;
    }
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErroApi('');
      try {
        const resposta = await api.get(`/inventario/${id}`);
        if (!ativo) return;
        const item = resposta.data;
        setForm({
          nome_item: item.nome_item,
          categoria: item.categoria,
          preco_diaria: String(item.preco_diaria),
          descricao: item.descricao || '',
          status_disponibilidade: item.status_disponibilidade
        });
      } catch (e) {
        if (ativo) setErroApi(mensagemDeErro(e));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; };
  }, [id, editando]);

  // Atualiza o campo que foi digitado (checkbox usa "checked", os demais usam "value")
  function alterar(e) {
    const { name, type, value, checked } = e.target;
    setForm((atual) => ({ ...atual, [name]: type === 'checkbox' ? checked : value }));
  }

  function validar() {
    const novos = {};
    if (!form.nome_item.trim()) {
      novos.nome_item = 'Informe o nome da ferramenta.';
    } else if (form.nome_item.trim().length > 150) {
      novos.nome_item = 'O nome deve ter no máximo 150 caracteres.';
    }
    if (!categorias.includes(form.categoria)) {
      novos.categoria = 'Escolha uma categoria.';
    }
    const preco = Number(form.preco_diaria);
    if (form.preco_diaria === '' || !Number.isFinite(preco) || preco <= 0) {
      novos.preco_diaria = 'Informe um valor maior que zero.';
    }
    if (form.descricao.length > 2000) {
      novos.descricao = 'A descrição deve ter no máximo 2000 caracteres.';
    }
    return novos;
  }

  async function enviar(e) {
    e.preventDefault();
    setErroApi('');

    const novos = validar();
    setErros(novos);
    if (Object.keys(novos).length > 0) {
      return;
    }

    const dados = {
      nome_item: form.nome_item.trim(),
      categoria: form.categoria,
      preco_diaria: Number(form.preco_diaria),
      descricao: form.descricao.trim(),
      status_disponibilidade: form.status_disponibilidade
    };

    setEnviando(true);
    try {
      if (editando) {
        await api.put(`/inventario/${id}`, dados);
      } else {
        await api.post('/inventario', dados);
      }
      navigate('/ferramentas', {
        state: {
          mensagem: editando ? 'Ferramenta atualizada com sucesso!' : 'Ferramenta cadastrada com sucesso!',
          tipo: 'sucesso'
        }
      });
    } catch (erro) {
      // Mostra a mensagem da API e mantém tudo o que foi digitado
      setErroApi(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  if (carregando) {
    return <Carregando texto="Carregando ferramenta..." />;
  }

  // Edição de um item que não existe (ou que é de outro usuário): a API respondeu erro
  if (editando && erroApi && !form.nome_item) {
    return (
      <div className="estado-vazio">
        <Alerta tipo="erro">{erroApi}</Alerta>
        <Link to="/ferramentas" className="botao botao-contorno">Voltar para a lista</Link>
      </div>
    );
  }

  return (
    <section className="cartao cartao-medio">
      <Link to="/ferramentas" className="voltar">&larr; Voltar para a lista</Link>
      <h1>{editando ? 'Editar ferramenta' : 'Nova ferramenta'}</h1>

      {erroApi && <Alerta tipo="erro">{erroApi}</Alerta>}

      <form onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="nome_item">Nome da ferramenta</label>
          <input id="nome_item" name="nome_item" type="text" maxLength={150} value={form.nome_item} onChange={alterar} aria-invalid={Boolean(erros.nome_item)} />
          {erros.nome_item && <span className="campo-erro">{erros.nome_item}</span>}
        </div>

        <div className="campo-duplo">
          <div className="campo">
            <label htmlFor="categoria">Categoria</label>
            <select id="categoria" name="categoria" value={form.categoria} onChange={alterar} aria-invalid={Boolean(erros.categoria)}>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
            {erros.categoria && <span className="campo-erro">{erros.categoria}</span>}
          </div>

          <div className="campo">
            <label htmlFor="preco_diaria">Valor da diária (R$)</label>
            <input id="preco_diaria" name="preco_diaria" type="number" inputMode="decimal" min="0.01" step="0.01" value={form.preco_diaria} onChange={alterar} aria-invalid={Boolean(erros.preco_diaria)} />
            {erros.preco_diaria && <span className="campo-erro">{erros.preco_diaria}</span>}
          </div>
        </div>

        <div className="campo">
          <label htmlFor="descricao">Descrição <span className="opcional">(opcional)</span></label>
          <textarea id="descricao" name="descricao" rows="4" maxLength={2000} value={form.descricao} onChange={alterar} aria-invalid={Boolean(erros.descricao)} />
          {erros.descricao && <span className="campo-erro">{erros.descricao}</span>}
        </div>

        <label className="campo-checkbox">
          <input type="checkbox" name="status_disponibilidade" checked={form.status_disponibilidade} onChange={alterar} />
          Disponível para aluguel
        </label>

        <div className="acoes-formulario">
          <button type="submit" className="botao botao-primario" disabled={enviando}>
            {enviando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar ferramenta'}
          </button>
          <Link to="/ferramentas" className="botao botao-contorno">Cancelar</Link>
        </div>
      </form>
    </section>
  );
}
