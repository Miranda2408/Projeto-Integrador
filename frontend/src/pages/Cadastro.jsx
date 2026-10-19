import React, { useState } from 'react';
import api from '../services/api'; // Importa a nossa configuração do Axios

export default function Cadastro() {
  // Estados para armazenar o que o usuário digita nos campos
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [telefone, setTelefone] = useState('');
  
  // Estados para exibir mensagens na tela (Sucesso ou Erro)
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');

  // Função disparada quando o usuário clica no botão "Cadastrar"
  async function lidarComCadastro(e) {
    e.preventDefault(); // Impede a página de recarregar sozinha
    setMensagemSucesso('');
    setMensagemErro('');

    try {
      // Envia os dados digitados para a rota POST /api/usuarios do seu Back-end
      const resposta = await api.post('/usuarios', {
        nome,
        email,
        senha,
        telefone
      });

      // Se der certo, exibe a mensagem de sucesso e limpa os campos do formulário
      setMensagemSucesso(resposta.data.mensagem || 'Cadastro realizado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setTelefone('');

    } catch (error) {
      // Se a API devolver um erro (ex: e-mail já cadastrado), exibe a mensagem na tela
      if (error.response && error.response.data && error.response.data.erro) {
        setMensagemErro(error.response.data.erro);
      } else {
        setMensagemErro('Não foi possível conectar ao servidor.');
      }
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Criar Nova Conta</h2>
      
      {/* Exibição de alertas visuais */}
      {mensagemSucesso && <p style={{ color: 'green', fontWeight: 'bold' }}>{mensagemSucesso}</p>}
      {mensagemErro && <p style={{ color: 'red', fontWeight: 'bold' }}>{mensagemErro}</p>}

      <form onSubmit={lidarComCadastro}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Nome Completo:</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>E-mail:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Senha:</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Telefone:</label>
          <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Cadastrar
        </button>
      </form>
    </div>
  );
}