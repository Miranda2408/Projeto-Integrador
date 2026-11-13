# Caixa de Ferramentas

Sistema web para organizar o inventário de ferramentas de cada usuário: cadastro de conta, login e controle dos itens (nome, descrição, categoria, valor da diária e disponibilidade).

Projeto Integrador do curso Técnico em Processamento de Dados (IFSC), com **front-end em React** e **API REST em Node.js**.

## Endereços publicados

| Parte | Serviço | Endereço |
|-------|---------|----------|
| Site (front-end) | Vercel | https://projeto-integrador-two-amber.vercel.app |
| API (back-end) | Render | https://projeto-integrador-puvz.onrender.com |
| Banco de dados | Supabase (PostgreSQL) | acesso privado |

Teste rápido da API: https://projeto-integrador-puvz.onrender.com/api/status

> A API fica no plano gratuito do Render e "dorme" quando fica parada. A primeira resposta pode levar cerca de 50 segundos.

## Tecnologias

- **Front-end:** React, Vite, Axios, React Router
- **Back-end:** Node.js, Express, Sequelize
- **Banco de dados:** PostgreSQL (Supabase)
- **Autenticação:** JWT (JSON Web Token) e senhas criptografadas com bcrypt

## Estrutura do projeto

```
Projeto-Integrador/
├── backend/    API REST (Express + Sequelize)
└── frontend/   Site (React + Vite)
```

## Banco de dados

O banco tem duas tabelas, com relacionamento de um para muitos:

**usuarios**

| Campo | Tipo | Observação |
|-------|------|-----------|
| id | inteiro | chave primária |
| nome | texto (100) | obrigatório |
| email | texto (100) | obrigatório e único |
| senha | texto (255) | guardada criptografada |
| telefone | texto (20) | opcional |

**inventario**

| Campo | Tipo | Observação |
|-------|------|-----------|
| id | inteiro | chave primária |
| id_usuario | inteiro | chave estrangeira para `usuarios` |
| nome_item | texto (150) | obrigatório |
| descricao | texto | opcional |
| categoria | texto (50) | Elétrica, Manual, Jardinagem, Construção ou Outros |
| preco_diaria | decimal (10,2) | obrigatório |
| status_disponibilidade | verdadeiro/falso | disponível ou indisponível |

Cada usuário vê e altera apenas os próprios itens. Se um usuário é excluído, os itens dele também são.

## Rotas da API

Todas começam com `/api`.

**Públicas**

| Método | Rota | Função |
|--------|------|--------|
| GET | `/status` | verifica se a API está no ar |
| POST | `/auth/register` | cria uma conta |
| POST | `/auth/login` | faz login e devolve o token JWT |

**Protegidas** (exigem o cabeçalho `Authorization: Bearer <token>`)

| Método | Rota | Função |
|--------|------|--------|
| GET | `/auth/me` | dados do usuário logado |
| GET | `/inventario` | lista os itens do usuário |
| GET | `/inventario/categorias` | lista as categorias aceitas |
| GET | `/inventario/:id` | detalhes de um item |
| POST | `/inventario` | cadastra um item |
| PUT | `/inventario/:id` | edita um item |
| DELETE | `/inventario/:id` | exclui um item |

## Como rodar no seu computador

Pré-requisitos: Node.js instalado e um banco PostgreSQL (pode ser um projeto gratuito no Supabase) ou MySQL.

### 1. Back-end

```bash
cd backend
npm install
```

Crie o arquivo `backend/.env` com as variáveis abaixo (veja também o `backend/.env.example`):

```env
PORT=3000
JWT_SECRET=uma_chave_longa_com_pelo_menos_32_caracteres
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:5432/postgres
DB_SSL=true
CORS_ORIGIN=http://localhost:5173
```

- Para gerar uma chave segura para o `JWT_SECRET`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- Em vez de `DATABASE_URL`, também é possível usar `DB_DIALECT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASS` (útil para um banco local).

Inicie a API (as tabelas são criadas automaticamente):

```bash
npm start
```

Opcional: criar um usuário e itens de demonstração.

```bash
npm run seed
```

### 2. Front-end

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://localhost:5173). Em desenvolvimento, o Vite encaminha as chamadas de `/api` para a API em `localhost:3000`.

## Como foi publicado

**Banco (Supabase):** projeto PostgreSQL gratuito. A API usa a *Connection string* do **Session pooler**.

**API (Render):** serviço Web com *Root Directory* `backend`, *Build Command* `npm install` e *Start Command* `npm start`. Variáveis de ambiente:

| Variável | Para que serve |
|----------|----------------|
| `DATABASE_URL` | conexão com o banco no Supabase |
| `JWT_SECRET` | chave usada para assinar os tokens |
| `CORS_ORIGIN` | endereço do front que pode chamar a API |

**Front (Vercel):** projeto com *Root Directory* `frontend` e a variável de ambiente:

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | `https://projeto-integrador-puvz.onrender.com/api` |

## Segurança

- Senhas guardadas com bcrypt, nunca em texto puro.
- Rotas do inventário protegidas por token JWT.
- Segredos (`JWT_SECRET`, senha do banco) ficam em variáveis de ambiente e não são enviados ao GitHub.
- CORS liberado apenas para o endereço do front-end.
- Proteção por linha (RLS) ativada nas tabelas do Supabase.

## Autor

André Luis Miranda