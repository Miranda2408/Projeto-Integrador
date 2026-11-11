import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ilustracao from '../assets/ferramentas.svg';

// Página inicial (pública): apresenta o propósito do sistema.
export default function Home() {
  const { token } = useAuth();

  return (
    <>
      <section className="heroi">
        <div className="heroi-texto">
          <h1>Suas ferramentas organizadas e prontas para alugar</h1>
          <p>
            Cadastre as ferramentas que você tem em casa ou na oficina, escolha a categoria,
            defina o valor da diária e marque o que está disponível. Tudo em um só lugar,
            e só você enxerga os seus itens.
          </p>
          <div className="heroi-acoes">
            {token ? (
              <Link to="/ferramentas" className="botao botao-primario">Ver minhas ferramentas</Link>
            ) : (
              <>
                <Link to="/cadastro" className="botao botao-primario">Criar conta grátis</Link>
                <Link to="/login" className="botao botao-contorno">Já tenho conta</Link>
              </>
            )}
          </div>
        </div>
        <img
          className="heroi-imagem"
          src={ilustracao}
          alt="Caixa de ferramentas aberta com martelo, chave inglesa e chave de fenda"
        />
      </section>

      <section className="passos" aria-labelledby="titulo-passos">
        <h2 id="titulo-passos">Como funciona</h2>
        <ol className="passos-lista">
          <li>
            <strong>1. Cadastre</strong>
            <span>Informe nome, descrição, categoria e valor da diária de cada ferramenta.</span>
          </li>
          <li>
            <strong>2. Organize</strong>
            <span>Veja a lista completa, abra os detalhes e edite quando algo mudar.</span>
          </li>
          <li>
            <strong>3. Controle</strong>
            <span>Marque cada item como disponível ou indisponível para aluguel.</span>
          </li>
        </ol>
      </section>
    </>
  );
}
