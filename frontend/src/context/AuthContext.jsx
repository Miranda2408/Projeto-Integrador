import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { definirTratadorDeSessaoExpirada } from '../services/api';
import { lerToken, salvarToken, limparToken } from '../services/sessao';

// O "contexto" deixa o estado da sessão (quem está logado) disponível
// para qualquer tela, sem precisar passar props de componente em componente.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(lerToken());
  const [usuario, setUsuario] = useState(null);
  // true enquanto confirmamos, ao abrir o site, se o token guardado ainda vale
  const [carregando, setCarregando] = useState(Boolean(lerToken()));
  // Motivo do último encerramento de sessão (logout ou token expirado).
  // A RotaProtegida lê isto para mandar a pessoa ao login já com a mensagem certa.
  const [saida, setSaida] = useState(null);

  // Apaga o token e os dados do usuário. Quem leva a pessoa até o login é a RotaProtegida.
  const encerrarSessao = useCallback((mensagem, tipo, lembrarPagina) => {
    limparToken();
    setToken(null);
    setUsuario(null);
    setSaida({ mensagem, tipo, lembrarPagina });
  }, []);

  const limparSaida = useCallback(() => setSaida(null), []);

  // Quando a API recusar o token (expirado/inválido), encerra a sessão.
  // lembrarPagina = true: depois de entrar de novo, a pessoa volta para onde estava.
  useEffect(() => {
    definirTratadorDeSessaoExpirada(() =>
      encerrarSessao('Sua sessão expirou. Faça login novamente.', 'erro', true)
    );
  }, [encerrarSessao]);

  // Ao abrir (ou recarregar) o site: se existe token salvo, confirma com a API e carrega o usuário.
  useEffect(() => {
    if (!lerToken()) {
      return;
    }
    api.get('/auth/me')
      .then((resposta) => setUsuario(resposta.data))
      .catch(() => {
        // 401: o interceptor já encerrou a sessão. Falha de rede: a tela mostrará o erro.
      })
      .finally(() => setCarregando(false));
  }, []);

  async function login(email, senha) {
    const resposta = await api.post('/auth/login', { email, senha });
    salvarToken(resposta.data.token);
    setToken(resposta.data.token);
    setUsuario(resposta.data.usuario);
    setSaida(null);
  }

  async function registrar(dados) {
    await api.post('/auth/register', dados);
  }

  // lembrarPagina = false: depois de um logout, a próxima pessoa não deve cair na página da anterior
  function logout() {
    encerrarSessao('Você saiu da sua conta.', 'sucesso', false);
  }

  const valor = useMemo(
    () => ({ token, usuario, carregando, saida, limparSaida, login, registrar, logout }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, usuario, carregando, saida, limparSaida]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// Atalho para usar o contexto: const { usuario, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
