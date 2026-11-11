import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mensagemDeErro } from '../services/api';
import { emailValido } from '../utils/formatar';
import Alerta from '../components/Alerta';

export default function Cadastro() {
  const { token, registrar } = useAuth();
  const navigate = useNavigate();

  // Um único objeto guarda todos os campos; "name" de cada input diz qual campo alterar
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmarSenha: '', telefone: '' });
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Quem já está logado não precisa criar conta
  if (token && !enviando) {
    return <Navigate to="/ferramentas" replace />;
  }

  function alterar(e) {
    const { name, value } = e.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  function validar() {
    const novos = {};
    if (!form.nome.trim()) {
      novos.nome = 'Informe seu nome.';
    } else if (form.nome.trim().length > 100) {
      novos.nome = 'O nome deve ter no máximo 100 caracteres.';
    }
    if (!emailValido(form.email.trim())) {
      novos.email = 'Informe um e-mail válido.';
    }
    if (form.senha.length < 6) {
      novos.senha = 'A senha deve ter pelo menos 6 caracteres.';
    } else if (form.senha.length > 72) {
      novos.senha = 'A senha deve ter no máximo 72 caracteres.';
    }
    if (form.confirmarSenha !== form.senha) {
      novos.confirmarSenha = 'As senhas não são iguais.';
    }
    if (form.telefone.length > 20) {
      novos.telefone = 'O telefone deve ter no máximo 20 caracteres.';
    }
    return novos;
  }

  async function enviar(e) {
    e.preventDefault();
    setErroApi('');

    const novos = validar();
    setErros(novos);
    if (Object.keys(novos).length > 0) {
      return;
    }

    setEnviando(true);
    try {
      await registrar({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        telefone: form.telefone.trim()
      });
      // Conta criada: vai para o login com uma mensagem de sucesso
      navigate('/login', {
        state: { mensagem: 'Conta criada com sucesso! Entre com seu e-mail e senha.', tipo: 'sucesso' }
      });
    } catch (erro) {
      // Erro da API (ex.: e-mail já cadastrado): mostra a mensagem e mantém o que foi digitado
      setErroApi(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="cartao cartao-estreito">
      <h1>Criar conta</h1>

      {erroApi && <Alerta tipo="erro">{erroApi}</Alerta>}

      <form onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="nome">Nome completo</label>
          <input id="nome" name="nome" type="text" autoComplete="name" value={form.nome} onChange={alterar} aria-invalid={Boolean(erros.nome)} />
          {erros.nome && <span className="campo-erro">{erros.nome}</span>}
        </div>

        <div className="campo">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={alterar} aria-invalid={Boolean(erros.email)} />
          {erros.email && <span className="campo-erro">{erros.email}</span>}
        </div>

        <div className="campo">
          <label htmlFor="telefone">Telefone <span className="opcional">(opcional)</span></label>
          <input id="telefone" name="telefone" type="tel" autoComplete="tel" value={form.telefone} onChange={alterar} aria-invalid={Boolean(erros.telefone)} />
          {erros.telefone && <span className="campo-erro">{erros.telefone}</span>}
        </div>

        <div className="campo">
          <label htmlFor="senha">Senha</label>
          <input id="senha" name="senha" type="password" autoComplete="new-password" value={form.senha} onChange={alterar} aria-invalid={Boolean(erros.senha)} />
          {erros.senha && <span className="campo-erro">{erros.senha}</span>}
        </div>

        <div className="campo">
          <label htmlFor="confirmarSenha">Confirmar senha</label>
          <input id="confirmarSenha" name="confirmarSenha" type="password" autoComplete="new-password" value={form.confirmarSenha} onChange={alterar} aria-invalid={Boolean(erros.confirmarSenha)} />
          {erros.confirmarSenha && <span className="campo-erro">{erros.confirmarSenha}</span>}
        </div>

        <button type="submit" className="botao botao-primario botao-bloco" disabled={enviando}>
          {enviando ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="texto-apoio">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </section>
  );
}
