const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Capturar o cabeçalho de autorização enviado na requisição HTTP
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: "Token de acesso não fornecido." });
  }

  // O cabeçalho vem no formato: "Bearer token_aqui", vamos dividir o texto por espaço
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ erro: "Erro no formato do token de segurança." });
  }

  const [ scheme, token ] = parts;

  // Verificar se a primeira palavra é "Bearer"
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ erro: "Token mal formatado." });
  }

  // 2. Validar o token de fato usando a nossa chave secreta
  jwt.verify(token, 'minhasenhasupersecretaparaojwt', (err, decoded) => {
    if (err) {
      return res.status(401).json({ erro: "Token inválido ou expirado." });
    }

    // Se o token for válido, salvamos o ID do usuário dentro da requisição (req.idUsuario)
    req.idUsuario = decoded.id;
    
    // Libera a requisição para continuar para o controlador
    return next();
  });
};