import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Carregando from './Carregando';

// Guarda das telas privadas: sem login, a pessoa é mandada para /login.
// Este é o ÚNICO lugar que faz esse redirecionamento, e ele leva junto:
//  - "from": a página que a pessoa queria abrir (para voltar a ela depois do login)
//  - a mensagem do motivo (ex.: "Sua sessão expirou." ou "Você saiu da sua conta.")
export default function RotaProtegida() {
  const { token, carregando, saida } = useAuth();
  const location = useLocation();

  if (carregando) {
    return <Carregando texto="Verificando sua sessão..." />;
  }

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: saida?.lembrarPagina === false ? undefined : location,
          mensagem: saida?.mensagem,
          tipo: saida?.tipo
        }}
      />
    );
  }

  // Logado: mostra a tela filha (definida no App.jsx)
  return <Outlet />;
}
