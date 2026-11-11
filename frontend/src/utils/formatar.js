// Funções de formatação usadas em mais de uma tela.

// 35.5 -> "R$ 35,50"
export function formatarPreco(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// "2026-11-10T11:05:00.000Z" -> "10/11/2026"
export function formatarData(dataIso) {
  if (!dataIso) {
    return '';
  }
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) {
    return '';
  }
  return data.toLocaleDateString('pt-BR');
}

// Valida o formato de um e-mail (ex.: nome@dominio.com)
export function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
