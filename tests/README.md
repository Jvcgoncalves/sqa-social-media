# Testes da Atividade 5

Projeto de testes criado do zero para validar o SQA Social Media como caixa-preta.

## O que foi implementado

- 4 testes de API para `/auth/signup` e `/auth/signin`.
- 2 testes E2E no navegador para cadastro e login.
- Dados unicos por teste para evitar conflito de e-mail no banco.
- Separacao entre testes de API, testes E2E, helpers e tipos.

## Pre-requisitos

- Java 17+.
- Node.js 18+.
- npm.
- MySQL configurado para a API.
- API rodando em `http://localhost:8080`.
- Frontend rodando em `http://localhost:3000`.

Se precisar alterar URLs, use variaveis de ambiente:

```bash
API_BASE_URL=http://localhost:8080
FRONTEND_BASE_URL=http://localhost:3000
```

## Como rodar

Em um terminal, suba a API:

```bash
cd api
./mvnw spring-boot:run
```

Em outro terminal, suba o frontend:

```bash
cd client
npm install
npm run dev
```

Em outro terminal, rode os testes:

```bash
cd tests
npm install
npx playwright install
npm test
```

## Comandos uteis

Rodar apenas API:

```bash
npm run test:api
```

Rodar apenas E2E:

```bash
npm run test:e2e
```

Rodar E2E com navegador visivel:

```bash
npm run test:headed
```

Abrir relatorio HTML:

```bash
npm run report
```

## Estrutura

```text
tests/
├── api/
│   └── auth.spec.ts
├── e2e/
│   └── auth.spec.ts
├── support/
│   ├── AuthApi.ts
│   └── TestData.ts
├── types/
│   └── index.ts
├── package.json
├── playwright.config.ts
├── README.md
└── tsconfig.json
```
