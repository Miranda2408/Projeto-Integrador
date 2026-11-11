import axios from 'axios';
import { lerToken } from './sessao';

// O endereço da API fica em UM só lugar: na variável de ambiente VITE_API_URL.
//  - Em desenvolvimento: "/api" (o Vite encaminha para o back-end em localhost:3000,
//    veja o "proxy" no arquivo vite.config.js)
//  - Em produção: o endereço publicado da API, ex.: https://minha-api.onrender.com/api
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000
});

// Antes de CADA requisição, anexa o token (se existir) no cabeçalho Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = lerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// O AuthContext registra aqui o que fazer quando o token expira (ou é recusado pela API)
let aoExpirarSessao = null;
export function definirTratadorDeSessaoExpirada(funcao) {
  aoExpirarSessao = funcao;
}

// Depois de CADA resposta: se a API devolver 401 numa rota protegida, a sessão acabou.
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const url = erro.config?.url || '';
    const rotaPublica = url.includes('/auth/login') || url.includes('/auth/register');

    if (erro.response?.status === 401 && !rotaPublica && aoExpirarSessao) {
      aoExpirarSessao();
    }
    return Promise.reject(erro);
  }
);

// Transforma qualquer erro de requisição em uma mensagem amigável para mostrar na tela.
export function mensagemDeErro(erro) {
  // Sem resposta = a requisição nem chegou ao servidor (rede caiu, API fora do ar...)
  if (!erro.response) {
    if (erro.code === 'ECONNABORTED') {
      return 'O servidor demorou demais para responder. Tente novamente.';
    }
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
  }

  // Mensagem enviada pela própria API (ex.: "Este e-mail já está cadastrado.")
  const mensagemApi = erro.response.data?.erro;
  if (mensagemApi) {
    return mensagemApi;
  }

  if (erro.response.status === 403) {
    return 'Você não tem permissão para fazer isso.';
  }
  if (erro.response.status === 401) {
    return 'Sua sessão expirou. Faça login novamente.';
  }
  return 'Ocorreu um erro inesperado. Tente novamente em instantes.';
}

export default api;
