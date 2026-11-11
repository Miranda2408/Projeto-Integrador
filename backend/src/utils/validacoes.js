// Funções pequenas de validação, usadas pelos controllers.

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Confere se o texto parece um e-mail (ex: nome@dominio.com) e não é gigante
function emailValido(email) {
  return typeof email === 'string' && email.length <= 100 && REGEX_EMAIL.test(email);
}

// Confere se o id que veio na URL é um número inteiro positivo (ex: "7").
// Recusa coisas como "abc", "-1", "1.5" ou "7; DROP TABLE".
function idValido(valor) {
  return /^[1-9]\d{0,8}$/.test(String(valor));
}

module.exports = { emailValido, idValido };
