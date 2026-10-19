import axios from 'axios';

// Configura o endereço padrão do seu servidor Node.js
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export default api;