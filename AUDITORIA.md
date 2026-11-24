# Auditoria da avaliação

Referência conferida em duas páginas, na pasta `references`, em `[WEB II] Avaliação - Terceira Unidade - Copia.pdf`. Os valores abaixo são os pesos da rubrica. A pontuação da avaliação depende da correção do professor e da demonstração.

## Rubrica

| Grupo | Critério | Peso | Status e evidência | Arquivos principais |
| --- | --- | --- | --- | --- |
| Arquitetura fullstack e integração | Persistência e Singleton | 1,0 | Implementado. O Atlas respondeu ao ping com o DNS alternativo local. A promessa e o pool são reaproveitados na instância. | `src/lib/mongodb.ts`, `src/models/` |
| Arquitetura fullstack e integração | Operações de CRUD | 1,0 | Verificado no Atlas por criação, leitura, edição, exclusão, substituição e remoção de comprovantes. | `src/app/api/produtos/`, `src/lib/products.ts`, `src/lib/product-request.ts`, `tests/e2e/garantia.spec.ts` |
| Arquitetura fullstack e integração | Gerenciamento assíncrono e cache | 1,0 | Verificado com a lista carregada antes das mutations, o detalhe após o salvamento e a reabertura do editor. | `src/hooks/use-products.ts`, `src/providers/app-provider.tsx`, `src/services/products.ts` |
| Segurança e controle de acesso | Autenticação com NextAuth.js | 0,5 | Verificado com cadastro, e-mail duplicado, credenciais válidas e inválidas, persistência da sessão e logout. | `src/lib/auth.ts`, `src/app/api/auth/`, `src/components/auth/` |
| Segurança e controle de acesso | Proteção em camadas | 0,5 | Verificado com redirecionamento, HTTP 401 sem sessão, HTTP 404 entre contas e isolamento dos comprovantes. | `src/app/(dashboard)/layout.tsx`, `src/lib/owned-product.ts`, `src/lib/api.ts`, `src/app/api/produtos/` |
| Segurança e controle de acesso | Segurança de credenciais | 0,5 | Verificado pelo hash bcrypt de custo 12 no Atlas e pelo contrato público da resposta de sessão. | `src/app/api/auth/cadastro/route.ts`, `src/models/user.ts`, `src/validations/auth.ts` |
| Estrutura e estado da aplicação | Roteamento baseado em arquivos | 0,5 | Confirmado pelo build. App Router em `src/app`, layouts aninhados e segmentos `[id]`. | `src/app/`, `tsconfig.json`, `components.json` |
| Estrutura e estado da aplicação | Separação de responsabilidades e tipagem | 0,5 | Confirmado pela verificação de tipos. Esquemas de entrada e DTOs distintos da persistência. | `src/components/`, `src/lib/`, `src/models/`, `src/types/`, `src/validations/` |
| Estrutura e estado da aplicação | Estado de interface com Zustand | 0,5 | Verificado por pesquisa, filtros, limpeza dos filtros, confirmação de exclusão e avisos na interface. | `src/store/ui.ts`, `src/components/products/product-filters.tsx`, `src/components/products/delete-dialog.tsx` |
| Estrutura e estado da aplicação | Resiliência e estados de UX | 0,5 | Arquivos de carregamento e erro compilados. A suíte confirmou a recuperação após HTTP 500 na consulta, o estado 404 e o aviso de sessão expirada. | `src/app/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/components/shared/` |
| Componentização e estilização | Ecossistema de componentes | 0,5 | Confirmado pelo build. Componentes Vega do ShadCN/UI, primitives Radix UI e tokens do Tailwind. | `src/components/ui/`, `components.json`, `src/app/globals.css` |
| Componentização e estilização | Responsividade e usabilidade | 0,5 | Verificado em desktop de 1440 px e em largura mobile de 360 px, com lista e formulário sem transbordamento lateral. | `src/components/layout/`, `src/components/auth/`, `src/components/products/` |
| Otimizações e performance | Recursos nativos | 0,5 | Implementado. `next/link` na navegação e `next/image` na prévia autenticada. A imagem é entregue diretamente pelo endpoint privado que recebe a sessão. | `src/components/layout/navigation.tsx`, `src/components/products/receipt-card.tsx` |
| Otimizações e performance | Uso consciente de escopos | 0,5 | Implementado. Sessão, propriedade e estrutura da página são resolvidas no servidor. Formulários, menus e dados interativos usam componentes cliente. | `src/app/(dashboard)/`, `src/lib/auth.ts`, `src/components/` |
| Apresentação e deploy | Deploy funcional na Vercel | 1,0 | Pendente. Build de produção concluído e variáveis documentadas. A URL pública e a comunicação da Vercel com o Atlas dependem da publicação. | `README.md`, `.env.example`, `next.config.ts` |
| Apresentação e deploy | README e demonstração | 0,5 | README entregue com execução, testes e roteiro. A apresentação acadêmica depende da data definida pelo professor. | `README.md`, `tests/e2e/garantia.spec.ts` |

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| `npm run lint` | Passou sem erros ou avisos de lint. |
| `npm run typecheck` | Passou com geração dos tipos de rota. |
| `npm test` | 7 testes passaram. Cobrem fim de mês, ano bissexto, status nos limites de 31, 30, 0 e −1 dia, fuso horário, filtros, validação de cadastro, produto e comprovante. |
| `npm run build` | Passou. As páginas foram compiladas e as rotas da API ficaram dinâmicas. |
| MongoDB Atlas | Ping bem-sucedido com DNS alternativo. O resolvedor padrão local retorna `ECONNREFUSED`. |
| `npm run test:e2e` | Passou um fluxo de oito etapas no Microsoft Edge com duas contas no Atlas e o build de produção local. Incluiu CRUD, pesquisa e filtros, sincronização do cache, prévia de PNG, abertura de PDF, download, substituição, remoção, isolamento, logout e expiração de sessão. |

A rodada final usou `PLAYWRIGHT_PRODUCTION=1` e DNS alternativo no processo local de teste. A conferência após a suíte encontrou zero contas temporárias da automação no Atlas. A rodada inicial em modo de desenvolvimento excedeu o limite de tempo durante a compilação fria de rotas.

## Decisões e pendências

- Comprovantes persistem no Atlas como BSON binário, com limite de 4 MiB, seleção restrita e escrita atômica com os metadados. O deploy usa as variáveis da autenticação e do próprio banco.
- O problema de SRV local é tratado por configuração opcional de desenvolvimento. A aplicação usa o resolvedor do ambiente em produção.
- A publicação, a configuração das variáveis na Vercel e a validação na URL pública dependem de autorização. A apresentação acadêmica segue pendente.
