import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { mensagemDeErro } from '../services/api';
import { formatarPreco } from '../utils/formatar';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';
import ModalConfirmacao from '../components/ModalConfirmacao';

// Listagem das ferramentas do usuário logado (a API só devolve as dele).
export default function Ferramentas() {
  const location = useLocation();
  const navigate = useNavigate();

  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Mensagem de sucesso/erro mostrada no topo (também pode vir de outra tela, ex.: "Ferramenta cadastrada!")
  const [aviso, setAviso] = useState(
    location.state?.mensagem ? { texto: location.state.mensagem, tipo: location.state.tipo || 'sucesso' } : null
  );

  const [paraExcluir, setParaExcluir] = useState(null); // item que aguarda confirmação
  const [excluindo, setExcluindo] = useState(false);

  // A mensagem já foi copiada para o estado: limpa do histórico para não reaparecer ao recarregar
  useEffect(() => {
    if (location.state?.mensagem) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  // Busca as ferramentas do usuário na API (GET /inventario)
  const carregar = useCallback(async () => {
    try {
      const resposta = await api.get('/inventario');
      setItens(resposta.data);
      setErro('');
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);

  // Ao abrir a tela, busca a lista (o estado já começa com carregando = true)
  useEffect(() => {
    carregar();
  }, [carregar]);

  // Botão "Tentar novamente" depois de um erro
  function tentarNovamente() {
    setErro('');
    setCarregando(true);
    carregar();
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    try {
      await api.delete(`/inventario/${paraExcluir.id}`);
      setItens((atuais) => atuais.filter((item) => item.id !== paraExcluir.id));
      setAviso({ texto: `"${paraExcluir.nome_item}" foi excluída.`, tipo: 'sucesso' });
    } catch (e) {
      setAviso({ texto: mensagemDeErro(e), tipo: 'erro' });
    } finally {
      setExcluindo(false);
      setParaExcluir(null);
    }
  }

  return (
    <>
      <div className="titulo-pagina">
        <h1>Minhas ferramentas</h1>
        <Link to="/ferramentas/nova" className="botao botao-primario">+ Nova ferramenta</Link>
      </div>

      {aviso && <Alerta tipo={aviso.tipo} onFechar={() => setAviso(null)}>{aviso.texto}</Alerta>}

      {carregando && <Carregando texto="Carregando suas ferramentas..." />}

      {!carregando && erro && (
        <div className="estado-vazio">
          <Alerta tipo="erro">{erro}</Alerta>
          <button type="button" className="botao botao-contorno" onClick={tentarNovamente}>Tentar novamente</button>
        </div>
      )}

      {!carregando && !erro && itens.length === 0 && (
        <div className="estado-vazio">
          <h2>Você ainda não cadastrou nenhuma ferramenta</h2>
          <p>Comece cadastrando a primeira para vê-la aqui.</p>
          <Link to="/ferramentas/nova" className="botao botao-primario">Cadastrar primeira ferramenta</Link>
        </div>
      )}

      {!carregando && !erro && itens.length > 0 && (
        <ul className="grade">
          {itens.map((item) => (
            <li key={item.id} className="item">
              <div className="item-topo">
                <span className="selo selo-categoria">{item.categoria}</span>
                <span className={`selo ${item.status_disponibilidade ? 'selo-ok' : 'selo-neutro'}`}>
                  {item.status_disponibilidade ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
              <h2 className="item-nome">{item.nome_item}</h2>
              <p className="item-descricao">{item.descricao || 'Sem descrição.'}</p>
              <p className="item-preco">{formatarPreco(item.preco_diaria)} <small>/ dia</small></p>
              <div className="item-acoes">
                <Link to={`/ferramentas/${item.id}`} className="botao botao-contorno botao-pequeno">Detalhes</Link>
                <Link to={`/ferramentas/${item.id}/editar`} className="botao botao-contorno botao-pequeno">Editar</Link>
                <button type="button" className="botao botao-perigo-contorno botao-pequeno" onClick={() => setParaExcluir(item)}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {paraExcluir && (
        <ModalConfirmacao
          titulo="Excluir ferramenta?"
          texto={`Tem certeza que deseja excluir "${paraExcluir.nome_item}"? Essa ação não pode ser desfeita.`}
          textoConfirmar="Sim, excluir"
          processando={excluindo}
          onConfirmar={confirmarExclusao}
          onCancelar={() => setParaExcluir(null)}
        />
      )}
    </>
  );
}
