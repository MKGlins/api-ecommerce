# LOJA API - BACKEND (NESTJS)

API RESTful desenvolvida com NestJS para gerenciamento de produtos de uma loja virtual. O sistema conta com recursos avançados como Upload de Imagens, Paginação e Soft Delete (Lixeira).
___

# TECNOLOGIAS

- NestJS (Framework Backend)
- TypeScript (Linguagem) 
- TypeORM (ORM)
- MySQL (Banco de Dados)
- Multer (Upload de Arquivos)
- Class Validator (Validação de DTOs)

___

# FUNCIONALIDADES

- CRUD Completo de Produtos: Criação, Leitura, Atualização e Exclusão.
- Upload de Imagens: Armazenamento local de fotos dos produtos.
- Paginação: Listagem otimizada com controle de página e limite.
- Soft Delete: Os produtos não são apagados do banco, vão para uma "Lixeira".
- Restauração: Capacidade de restaurar produtos deletados.

___
### COMO RODAR O PROJETO

Pré-requisitos:
- Node.js
- MySQL (Rodando localmente ou via Docker)

## 1. Clone o repositório
```bash
git clone https://github.com/MKGlins/api-ecommerce

cd api-ecommerce
```

## 2. Instale as dependências
```bash
npm install 
```

## 3. Configure o Banco de Dados

Crie um arquivo .env na raiz do projeto com as suas credenciais:
```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=sua_senha
DB_NAME=loja_db
```

## 4. Execute a aplicação

**(Modo de desenvolvimento)**
```bash
npm run start:dev
```

> A API estará rodando em: http://localhost:3000


### ROTAS DA API

Produtos:
- POST /products - Cria um produto.
- GET /products?page=1&limit=10 - Lista produtos (com paginação).
- GET /products/:id - Busca um produto único.
- PATCH /products/:id - Atualiza dados do produto.
- PATCH /products/:id/upload - Envia a foto do produto (Multipart/Form-Data).
- DELETE /products/:id - Move o produto para a lixeira (Soft Delete).

Lixeira:
- GET /products/lixeira - Lista produtos deletados.
- POST /products/:id/restaurar - Restaura um produto da lixeira.

LICENÇA

Este projeto está sob a licença MIT.
