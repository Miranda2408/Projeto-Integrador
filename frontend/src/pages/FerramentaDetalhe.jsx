import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { mensagemDeErro } from '../services/api';
import { formatarData, formatarPreco } from '../utils/formatar';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';
import ModalConfirmacao from '../components/ModalConfirmacao';

// Detalhes de uma ferramenta. Se o id não for do usuário logado, a API responde 404.
export default function FerramentaDetalhe() {
  const { id } = useParams(); // o :id da URL
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    let ativo = true; // evita atualizar a tela se a pessoa já saiu dela

    async function carregar() {
      setCarregando(true);
      setErro('');
      try {
        const resposta = await api.get(`/inventario/${id}`);
        if (ativo) setItem(resposta.data);
      } catch (e) {
        if (ativo) setErro(mensagemDeErro(e));
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();
    return () => { ativo = false; };
  }, [id]);

  async function excluir() {
    setExcluindo(true);
    try {
      await api.delete(`/inventario/${id}`);
      navigate('/ferramentas', {
        state: { mensagem: `"${item.nome_item}" foi excluída.`, tipo: 'sucesso' }
      });
    } catch (e) {
      setErro(mensagemDeErro(e));
      setConfirmando(false);
      setExcluindo(false);
    }
  }

  if (carregando) {
    return <Carregando texto="Carregando ferramenta..." />;
  }

  if (!item) {
    return (
      <div className="estado-vazio">
        <Alerta tipo="erro">{erro || 'Ferramenta não encontrada.'}</Alerta>
        <Link to="/ferramentas" className="botao botao-contorno">Voltar para a lista</Link>
      </div>
    );
  }

  return (
    <section className="cartao">
      <Link to="/ferramentas" className="voltar">&larr; Voltar para a lista</Link>

      {erro && <Alerta tipo="erro">{erro}</Alerta>}

      <div className="detalhe-topo">
        <h1>{item.nome_item}</h1>
        <span className={`selo ${item.status_disponibilidade ? 'selo-ok' : 'selo-neutro'}`}>
          {item.status_disponibilidade ? 'Disponível' : 'Indisponível'}
        </span>
      </div>

      <dl className="detalhe-dados">
        <div>
          <dt>Categoria</dt>
          <dd>{item.categoria}</dd>
        </div>
        <div>
          <dt>Valor da diária</dt>
          <dd>{formatarPreco(item.preco_diaria)}</dd>
        </div>
        {item.createdAt && (
          <div>
            <dt>Cadastrada em</dt>
            <dd>{formatarData(item.createdAt)}</dd>
          </div>
        )}
        <div className="detalhe-largo">
          <dt>Descrição</dt>
          <dd>{item.descricao || 'Sem descrição.'}</dd>
        </div>
      </dl>

      <div className="acoes-formulario">
        <Link to={`/ferramentas/${item.id}/editar`} className="botao botao-primario">Editar</Link>
        <button type="button" className="botao botao-perigo-contorno" onClick={() => setConfirmando(true)}>
          Excluir
        </button>
      </div>

      {confirmando && (
        <ModalConfirmacao
          titulo="Excluir ferramenta?"
          texto={`Tem certeza que deseja excluir "${item.nome_item}"? Essa ação não pode ser desfeita.`}
          textoConfirmar="Sim, excluir"
          processando={excluindo}
          onConfirmar={excluir}
          onCancelar={() => setConfirmando(false)}
        />
      )}
    </section>
  );
}
