# Cadê Minha Garantia?

Carteira pessoal de produtos, garantias e comprovantes de compra. O projeto foi desenvolvido para a terceira unidade de Desenvolvimento Web II.

## Funcionalidades

- Criação de conta, login e logout com e-mail e senha.
- Painel com total de produtos, situação das garantias e vencimentos dos próximos 30 dias.
- Cadastro, consulta, edição e exclusão de produtos da própria conta.
- Pesquisa por nome e filtros por categoria e situação da garantia.
- Anexo opcional em PDF, JPG, JPEG ou PNG, com visualização, download, substituição e remoção.
- Layout responsivo, validação junto aos campos e mensagens de carregamento, erro e confirmação.

## Tecnologias

Next.js 16 com App Router, React 19, TypeScript, Node.js, MongoDB Atlas, Mongoose, NextAuth.js 4, BcryptJS, TanStack Query 5, Zustand 5, Zod 4, Tailwind CSS 4, ShadCN/UI Vega com Radix UI, Lucide e Inter. A fonte Inter é distribuída com a aplicação pelo Fontsource. O Playwright é usado nos testes de navegador.

## Instalação e execução

Use Node.js 22.18 ou superior. A partir da raiz do repositório, instale as dependências.

```sh
npm ci
```

Para um ambiente novo, copie `.env.example` para `.env.local` e preencha os valores. Quando o arquivo local já estiver configurado, use-o diretamente.

| Variável | Uso |
| --- | --- |
| `MONGODB_URI` | URI de conexão do MongoDB Atlas, com o banco que armazenará as contas e os produtos. |
| `NEXTAUTH_SECRET` | Segredo aleatório de pelo menos 32 bytes usado pelo NextAuth.js para proteger as sessões. |
| `NEXTAUTH_URL` | URL canônica da aplicação, como `http://localhost:3000` no desenvolvimento. |
| `MONGODB_DEV_DNS` | Lista opcional de servidores DNS separados por vírgula. Aplicada pelo Node.js em desenvolvimento. |

Para gerar um segredo localmente, execute `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"` e coloque o resultado em `.env.local`. Mantenha os valores reais nas variáveis locais ou no painel de hospedagem.

```sh
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O acesso inicial encaminha para o painel e solicita login quando a sessão está ausente. Use **Criar uma conta** para começar a demonstração.

### DNS local no Atlas

Se a consulta SRV retornar `querySrv ECONNREFUSED` em desenvolvimento, defina `MONGODB_DEV_DNS=8.8.8.8,8.8.4.4` na sessão do terminal que inicia o servidor e reinicie o Next.js.

```powershell
$env:MONGODB_DEV_DNS = "8.8.8.8,8.8.4.4"
npm run dev
```

Em Bash, execute `MONGODB_DEV_DNS=8.8.8.8,8.8.4.4 npm run dev`. Para uma validação local com `npm start`, corrija o resolvedor DNS da rede usada no teste. A configuração opcional na aplicação é restrita ao modo de desenvolvimento.

## Arquitetura

| Local | Responsabilidade |
| --- | --- |
| `src/app/(auth)` | Layout público, login e cadastro. |
| `src/app/(dashboard)` | Layout autenticado, painel e páginas de produtos. |
| `src/app/api` | Route Handlers de autenticação, CRUD e entrega dos comprovantes. |
| `src/lib` e `src/models` | Conexão, autorização, persistência, regras de garantia e formatação. |
| `src/validations` e `src/types` | Esquemas Zod, regras de arquivo e contratos TypeScript. |
| `src/components` | Componentes de tela e primitives ShadCN/UI. |
| `src/services`, `src/hooks` e `src/providers` | Cliente HTTP, queries, mutations e configuração do cache. |
| `src/store` | Filtros, confirmação de exclusão e avisos locais. |

Os Server Components validam a sessão e, nas rotas dinâmicas, conferem a propriedade do produto antes de renderizar. A interatividade dos formulários, filtros e menus fica nos Client Components.

### Modelagem

| Coleção | Campos |
| --- | --- |
| `users` | `_id`, `name`, `email` normalizado, `passwordHash`, `createdAt` e `updatedAt`. O índice de e-mail é único. |
| `products` | `_id`, `userId`, `name`, `brand`, `category`, `purchaseDate`, `purchasePrice`, `store`, `warrantyMonths`, `receipt`, `receiptContent`, `createdAt` e `updatedAt`. O índice composto por `userId` e `createdAt` atende à listagem por conta. |

**Singleton do MongoDB.** A conexão e sua promessa ficam em `globalThis`. Requisições simultâneas na mesma instância reaproveitam a tentativa em andamento. O pool é reutilizado durante hot reload e invocações de uma instância serverless ainda ativa. Uma conexão inicial que falha libera a promessa para uma nova tentativa.

**Autenticação.** O cadastro normaliza o e-mail, valida a confirmação e grava o hash bcrypt com custo 12. O NextAuth.js verifica as credenciais, usa JWT em cookie HttpOnly e encerra a sessão no logout. Cada operação privada obtém o identificador na sessão. Consultas e mutations sobre um produto usam o par `_id` e `userId`. O DTO de produto inclui os metadados necessários à interface e a API de comprovante exige a mesma autorização.

**TanStack Query e Zustand.** A lista é compartilhada pelo painel e por Meus produtos. O salvamento atualiza o detalhe e invalida a lista. A exclusão remove o detalhe do cache e sincroniza a lista. O cache é montado dentro do layout autenticado. O Zustand mantém os filtros, o alvo da confirmação e o aviso visível.

**Garantias.** O mês de vencimento é calculado preservando o dia da compra até o último dia disponível no mês de destino. Datas de compra são tratadas como datas civis. A situação é determinada pelo dia corrente em `America/Sao_Paulo`. A garantia está ativa com mais de 30 dias, próxima do vencimento entre 0 e 30 e expirada com menos de 0. O dia zero é exibido como **Vence hoje**.

## Comprovantes

O armazenamento usa o Atlas já configurado. O campo `receipt` guarda nome, tipo e tamanho, e o campo `receiptContent` guarda o BSON binário com seleção desabilitada nas consultas comuns. A substituição, remoção e exclusão usam a atomicidade de um documento. O endpoint autenticado lê o binário após filtrar por proprietário e entrega o arquivo para visualização ou download com cache privado desativado. A aplicação valida extensão, tipo declarado, tamanho e assinatura inicial do arquivo.

O limite de 4 MiB mantém o binário dentro do limite de 16 MiB por documento MongoDB e reserva espaço para o formulário multipart no limite padrão de corpo das Vercel Functions. A configuração usa as mesmas variáveis do banco. [Limites de BSON](https://www.mongodb.com/docs/manual/core/document/) · [Limites das Vercel Functions](https://vercel.com/docs/functions/limitations)

## Deploy na Vercel

1. Importe o repositório em um projeto Vercel com o preset **Next.js**, a raiz do repositório como diretório do projeto e uma versão do Node.js compatível com `package.json`.
2. Cadastre `MONGODB_URI`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL` nas variáveis do ambiente de produção. Use a URL HTTPS canônica em `NEXTAUTH_URL`. Para testar em Preview, configure o ambiente correspondente com a URL e o banco de teste.
3. Configure no Atlas o usuário do banco e o acesso de rede para o ambiente de execução de acordo com a política do projeto. As permissões do usuário devem permitir ler, escrever e criar os índices do banco da aplicação.
4. Inicie o deploy e confirme cadastro, login, criação de produto, visualização de comprovante e logout na URL publicada.

[Deploy do Next.js na Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs) · [Variáveis da Vercel](https://vercel.com/docs/environment-variables) · [Acesso de rede no Atlas](https://www.mongodb.com/docs/atlas/security/ip-access-list/)

## Testes

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Os testes unitários verificam fim de mês, ano bissexto, fronteiras dos status, fuso horário, busca, filtros, validações e tipos de comprovante.

Para o teste de integração, configure o Atlas em `.env.local` para um banco de teste e mantenha a URL local na porta 3000. Instale o Chromium do Playwright uma vez e execute a suíte.

```sh
npx playwright install chromium
npm run test:e2e
```

Em Windows com o Microsoft Edge instalado, é possível usar `$env:PLAYWRIGHT_CHANNEL = "msedge"` antes de testar. Caso a rede local exija DNS alternativo, aplique também `MONGODB_DEV_DNS` no terminal. A suíte cria duas contas temporárias, valida as operações pela interface e pelos endpoints e remove os registros associados aos e-mails de teste. O Playwright registra capturas e diagnóstico de falha em `test-results/`.

Para testar o build local de produção, execute `npm run build` e defina `PLAYWRIGHT_PRODUCTION=1` na sessão do terminal antes de `npm run test:e2e`. Nesse modo o Playwright inicia `npm start`, e o resolvedor do processo deve conseguir acessar o Atlas.

Para demonstrar manualmente, crie uma conta, cadastre um produto com comprovante, consulte a garantia e valide a troca de arquivo. Use uma segunda conta para confirmar o isolamento dos produtos.
