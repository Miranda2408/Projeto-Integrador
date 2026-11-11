import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.svg';

// Estrutura comum a todas as telas: cabeçalho com menu, conteúdo e rodapé.
export default function Layout() {
  const { token, usuario, logout } = useAuth();
  const primeiroNome = usuario?.nome?.split(' ')[0];

  return (
    <>
      <header className="cabecalho">
        <div className="cabecalho-conteudo">
          <Link to="/" className="marca">
            <img src={logo} alt="" width="32" height="32" />
            <span>Caixa de Ferramentas</span>
          </Link>

          <nav className="menu" aria-label="Menu principal">
            {token ? (
              <>
                <NavLink to="/ferramentas" end>Minhas ferramentas</NavLink>
                <NavLink to="/ferramentas/nova">Nova ferramenta</NavLink>
                {primeiroNome && <span className="menu-usuario">Olá, {primeiroNome}</span>}
                <button type="button" className="botao botao-contorno botao-pequeno" onClick={logout}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Entrar</NavLink>
                <NavLink to="/cadastro" className="menu-destaque">Criar conta</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="conteudo">
        <Outlet />
      </main>

      <footer className="rodape">
        Projeto Integrador &middot; Sistema web com React e API REST
      </footer>
    </>
  );
}
