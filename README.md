# Batalha de Rodizio (Conta Rodizio)

Plataforma web multijogador em tempo real para gerenciamento e gamificacao de consumo em rodizios e buffets. Desenvolvida para transformar refeicoes entre amigos em disputas interativas com sincronizacao instantanea, ranking ao vivo, podio, historico de carreira e sistema de condecoracoes.

Link de acesso a aplicacao em producao:
https://contarodizio.onrender.com/

---

## Indice

- [Visao Geral e Ideia do Projeto](#visao-geral-e-ideia-do-projeto)
- [Link de Acesso](#link-de-acesso)
- [Modalidades de Rodizio Suportadas](#modalidades-de-rodizio-suportadas)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Sistema de Conquistas e Missoes](#sistema-de-conquistas-e-missoes)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalacao e Execucao Local](#instalacao-e-execucao-local)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Scripts Disponiveis](#scripts-disponiveis)
- [Licenca](#licenca)

---

## Visao Geral e Ideia do Projeto

A ideia do Batalha de Rodizio nasceu da classica disputa entre amigos sobre quem consegue comer mais durante um rodizio. Tradicionalmente, as pessoas tentavam acompanhar a pontuacao acumulando palitos na mesa, empilhando guardanapos ou anotando de forma desorganizada no bloco de notas do celular.

O projeto resolve esse problema criando uma arena digital onde:

1. Um participante cria uma sala com um codigo rapido de 4 caracteres ou opta por listar publicamente a mesa.
2. Os demais amigos entram na sala pelo codigo ou por meio de link compartilhavel.
3. Cada membro aperta o botao de incremento diretamente em seu proprio aparelho a cada item consumido.
4. O placar da mesa se atualiza instantaneamente para todos os membros conectados via WebSockets.
5. Ao finalizar a rodada, a sala revela o podio oficial dos vencedores com chuva de confetes e salva os resultados no historico permanente de cada jogador.

---

## Link de Acesso

A aplicacao esta publicada e disponivel para acesso imediato no endereco:

[https://contarodizio.onrender.com/](https://contarodizio.onrender.com/)

---

## Modalidades de Rodizio Suportadas

O sistema disponibiliza 5 modalidades oficiais com rotulos, cores e unidades de medida proprias para cada contexto:

1. **Pizza**:
   - Unidade: Fatias
   - Ideal para rodizios tradicionais de pizzaria salgada e doce.

2. **Japones**:
   - Unidade: Pecas
   - Focado em sushis, sashimis, temakis e entradas orientais.

3. **Hamburguer**:
   - Unidade: Burgers
   - Ajustado para mini burgers e rodizios de lanches.

4. **Bebida**:
   - Unidade: Copos
   - Voltado para open bar, degustacoes e rodizios de chopp ou bebidas.

5. **Churrasco**:
   - Unidade: Pedacos
   - Para espeto corrido e churrascarias.
   - **Regulamento integrado**: Antes de abrir ou ingressar em uma sala de churrasco, a aplicacao exibe uma janela modal com as regras oficiais da modalidade para garantir medicoes justas. Exemplo de regra: alimentos servidos em porcoes multiplas de uma vez so (como coracoes de galinha) devem ser contabilizados como uma unica porcao para manter o equilibrio do duelo.

---

## Principais Funcionalidades

### 1. Salas em Tempo Real (Socket.IO)
- Criacao de salas com codigo alfanumerico curto de 4 letras.
- Possibilidade de sala privada com senha ou publica listada no saguao.
- Entrada instantanea sem burocracia para convidados ou jogadores registrados.
- Desconexao inteligente: se um participante se reconectar, seu progresso na partida e mantido.

### 2. Controle de Consumo Interativo
- Botoes ergonômicos de facil clique para operacao com apenas uma mao no restaurante.
- Opcao de desfazimento da ultima marcacao caso ocorra clique indevido.
- Sincronizacao em milissegundos entre todos os smartphones na mesa.

### 3. Podio e Encerramento
- Encerramento controlado pelo lider da sala.
- Tela cerimonial de podio destacando primeiro, segundo e terceiro colocados.
- Animacoes comemorativas e registro formal da vitoria na conta dos participantes.

### 4. Progressao de Patentes e Ranks
- Progressao acessivel: a cada nivel o guerreiro precisa vencer 1 partida ou acumular 20 porcoes consumidas.
- Patentes tematicas que evoluem desde "Iniciante da Mesa" ate o topo da classificacao.
- Barra de progresso visual exibindo exatamente o percentual e os requisitos restantes para o proximo nivel.

### 5. Estatisticas de Carreira Segmentadas
- **Visao Geral**: total de vitorias oficiais, batalhas disputadas, total de itens consumidos em toda a trajetoria, media de consumo por batalha e recorde historico em uma unica sessao.
- **Visao por Modalidade**: aba dedicada que segmenta o rendimento especifico em Pizza, Japones, Hamburguer, Bebida e Churrasco, sempre exibindo a unidade correta do tipo.

---

## Sistema de Conquistas e Missoes

O projeto conta com um sistema gamificado de condecoracoes, inspirado em conquistas de videogames.

- **Niveis de Raridade**:
  - Bronze: marcos iniciais de participacao.
  - Prata: metas intermediarias de rendimento e consumo.
  - Ouro: recordes expressivos e dominancia na mesa.
  - Diamante: conquistas lendarias e acumuladas.
- **Pontuacao de Gamificacao**:
  - Cada missao atribui pontos a conta do jogador, com barra de progresso global em tempo real.
- **Navegacao e Slider**:
  - Barra de categorias com carrossel deslizante, botoes direcionais laterais e suporte a rolagem direta com o scroll do mouse.
  - Botao para alternar entre o modo carrossel e a visualizacao de todas as categorias em grade.
- **Ordenacao por Raridade**:
  - Seletor que permite organizar as condecoracoes em:
    - *Padrao*: ordem natural de progressao.
    - *Mais Raras*: prioriza conquistas de maior raridade e pontuacao (Diamante para Bronze).
    - *Mais Comuns*: exibe conquistas de facil conclusao no topo (Bronze para Diamante).
- **Arquitetura Aberta para Novas Missoes**:
  - O arquivo `src/utils/achievements.js` contem a matriz declarativa `ACHIEVEMENTS_LIST`. Para adicionar qualquer nova missao, basta inserir um novo objeto com id, titulo, descricao, icone Lucide, tier, categoria, meta e funcao de calculo.

---

## Tecnologias Utilizadas

### Front-end
- **React 18** (SPA moderna e responsiva)
- **Vite** (Ambiente de compilacao ultrarrapido)
- **Tailwind CSS** (Design responsivo com suporte nativo aos modos Claro e Escuro)
- **Lucide React** (Iconografia vetorial e consistente)
- **Socket.IO Client** (Comunicacao bidirecional em tempo real)
- **Canvas-Confetti** (Efeitos visuais para o podio dos vencedores)
- **Oxlint** (Linter de alto desempenho em Rust)

### Back-end
- **Node.js** (Ambiente de execucao)
- **Express** (API REST para autenticacao, salas e dados de perfil)
- **Socket.IO** (Servidor de comunicacao WebSockets para gerenciamento de salas)
- **SQLite / LibSQL / Better-SQLite3** (Banco de dados relacional embutido e persistente)
- **JSON Web Tokens (JWT)** e **Bcryptjs** (Autenticacao segura e hashing de senhas)

---

## Instalacao e Execucao Local

### Pre-requisitos
- Node.js versao 18.0.0 ou superior instalada.
- NPM versao 9.0.0 ou superior.

### Passos de Instalacao

1. Clone este repositorio:
```bash
git clone https://github.com/ironJohnsson/Batalha-De-Rodizio.git
cd Batalha-De-Rodizio
```

2. Instale as dependencias do projeto principal e do cliente web:
```bash
npm install
npm --prefix BatalhaDeRodizio install
```

3. Crie um arquivo `.env` na raiz do projeto caso queira configurar variaveis de ambiente (opcional, ha valores padrao):
```env
PORT=3000
JWT_SECRET=sua_chave_secreta_aqui
```

4. Inicie o servidor e o cliente concomitantemente em modo de desenvolvimento:
```bash
npm run dev
```

5. Abra o navegador no endereco indicado no terminal (por padrao, `http://localhost:5173` para a interface do cliente e `http://localhost:3000` para a API).

---

## Estrutura do Projeto

```text
Batalha-De-Rodizio/
├── package.json                   # Dependencias e scripts raiz (servidor + client)
├── README.md                      # Documentacao principal do projeto
│
├── server/                        # Camada de back-end em Node.js / Express
│   ├── index.js                   # Ponto de entrada, servidor HTTP e Socket.IO
│   ├── db.js                      # Inicializacao e schema do banco SQLite
│   ├── roomsManager.js            # Gerenciador de estado das salas em memoria
│   ├── middleware/
│   │   └── authMiddleware.js      # Validacao de token JWT
│   └── routes/
│       ├── authRoutes.js          # Cadastro, login e perfil de usuario
│       └── statsRoutes.js         # Estatisticas gerais, por tipo e ranking
│
└── BatalhaDeRodizio/              # Camada de front-end em React + Vite
    ├── package.json               # Dependencias da interface
    ├── vite.config.js             # Configuracoes de bundle do Vite
    └── src/
        ├── App.jsx                # Componente orquestrador de estado e telas
        ├── main.jsx               # Ponto de montagem da aplicacao
        ├── components/
        │   ├── Navbar.jsx         # Barra de navegacao superior com tema
        │   ├── ProfileModal.jsx   # Modal de perfil, estatisticas e conquistas
        │   ├── PodiumModal.jsx    # Cerimonia de encerramento de sala
        │   └── ChurrascoRulesModal.jsx # Popup com regras de churrasco
        ├── views/
        │   ├── HomeView.jsx       # Criacao, busca de salas e resumo de perfil
        │   └── RoomView.jsx       # Interface da arena de consumo ao vivo
        ├── context/
        │   └── AuthContext.jsx    # Gerenciamento global de autenticacao
        ├── services/
        │   ├── api.js             # Chamadas REST com headers de autorizacao
        │   └── socket.js          # Instancia e reconexao do Socket.IO
        └── utils/
            ├── achievements.js    # Catalogo modular e regras de missoes
            ├── rodizioTypes.js    # Configuracao dos 5 tipos de rodizio
            └── titles.js          # Sistema de ranks e niveis do jogador
```

---

## Scripts Disponiveis

Na raiz do projeto:

- `npm run dev`: Executa simultaneamente o servidor backend e o ambiente de desenvolvimento do frontend.
- `npm run build`: Instala as dependencias do frontend e compila o pacote de producao na pasta `dist`.
- `npm start`: Inicia o servidor Node.js em modo de producao.
- `npm run server`: Executa apenas o servidor backend.
- `npm run client`: Executa apenas o servidor de desenvolvimento do frontend.
- `npm --prefix BatalhaDeRodizio run lint`: Executa a verificacao de codigo estatico com o Oxlint.

---

## Licenca

Projeto desenvolvido para fins de entretenimento e gestao social de rodizios. Distribuido sob os termos aplicaveis ao repositorio. Para propostas de melhorias ou relato de questoes, utilize a aba de Issues do projeto.
