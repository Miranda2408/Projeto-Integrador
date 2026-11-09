// Configuração do JWT (token de login).
// O segredo NUNCA fica escrito no código: ele vem do arquivo .env (variável JWT_SECRET).
// Quem tiver o segredo consegue criar tokens falsos, por isso o .env não vai para o GitHub.

const segredo = process.env.JWT_SECRET;

if (!segredo || segredo.length < 32) {
  throw new Error(
    'JWT_SECRET não definido ou muito curto (mínimo 32 caracteres). ' +
    'Abra o arquivo backend/.env e preencha JWT_SECRET. ' +
    'Para gerar uma chave segura, rode no terminal: ' +
    'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
  );
}

module.exports = {
  JWT_SECRET: segredo,
  JWT_EXPIRA_EM: '1h'
};
