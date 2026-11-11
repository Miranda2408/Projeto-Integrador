// Guarda o token JWT no navegador (localStorage) para a sessão continuar
// mesmo depois de recarregar a página. O logout apaga esse token.

const CHAVE_TOKEN = 'token';

export function lerToken() {
  try {
    return localStorage.getItem(CHAVE_TOKEN);
  } catch {
    return null; // navegador sem armazenamento disponível
  }
}

export function salvarToken(token) {
  try {
    localStorage.setItem(CHAVE_TOKEN, token);
  } catch {
    // sem armazenamento: o login funciona, mas não sobrevive ao recarregar
  }
}

export function limparToken() {
  try {
    localStorage.removeItem(CHAVE_TOKEN);
  } catch {
    // nada a fazer
  }
}
