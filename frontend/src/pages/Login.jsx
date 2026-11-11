import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mensagemDeErro } from '../services/api';
import { emailValido } from '../utils/formatar';
import Alerta from '../components/Alerta';

export default function Login() {
  const { token, login, limparSaida } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // A mensagem do motivo da saída já chegou pelo redirecionamento: limpa para não reaparecer depois
  useEffect(() => {
    limparSaida();
  }, [limparSaida]);

  // Campos do formulário. Ficam guardados no estado: se a API devolver erro, nada é apagado.
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});        // erros por campo (validação no navegador)
  const [erroApi, setErroApi] = useState('');    // erro devolvido pela API
  const [enviando, setEnviando] = useState(false);

  // Aviso vindo de outra tela (ex.: "Conta criada!", "Sua sessão expirou...")
  const aviso = location.state?.mensagem;
  const tipoAviso = location.state?.tipo || 'info';

  // Para onde ir depois do login: a página que a pessoa queria abrir, ou a lista
  const destino = location.state?.from?.pathname || '/ferramentas';

  // Quem já está logado não precisa ver o login
  if (token && !enviando) {
    return <Navigate to={destino} replace />;
  }

  function validar() {
    const novos = {};
    if (!emailValido(email.trim())) {
      novos.email = 'Informe um e-mail válido.';
    }
    if (!senha) {
      novos.senha = 'Informe a senha.';
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

    setEnviando(true);
    try {
      await login(email.trim(), senha);
      navigate(destino, { replace: true });
    } catch (erro) {
      setErroApi(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="cartao cartao-estreito">
      <h1>Entrar</h1>

      {aviso && <Alerta tipo={tipoAviso}>{aviso}</Alerta>}
      {erroApi && <Alerta tipo="erro">{erroApi}</Alerta>}

      <form onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(erros.email)}
          />
          {erros.email && <span className="campo-erro">{erros.email}</span>}
        </div>

        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            aria-invalid={Boolean(erros.senha)}
          />
          {erros.senha && <span className="campo-erro">{erros.senha}</span>}
        </div>

        <button type="submit" className="botao botao-primario botao-bloco" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="texto-apoio">
        Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
      </p>
    </section>
  );
}
