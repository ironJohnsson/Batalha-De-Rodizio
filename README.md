# ContaRodízio 

Aplicação web em tempo real para contagem de fatias em rodízios (pizzas, buffet, etc.) com disputas ao vivo entre múltiplos dispositivos na mesma mesa, contas de usuário para histórico/médias e tema escuro nativo.

---

## Principais Funcionalidades

- **Multi-dispositivo em Tempo Real**: Crie uma sala, compartilhe o código de 6 caracteres ou o QR Code gerado na tela para que todos na mesa acompanhem e marquem suas fatias simultaneamente.
- **Contador Rápido**: Botão grande e tátil para marcar `+1 Fatia` com um toque no celular e opção de desfazer (`-1`).
- **Controle Exclusivo do Dono da Sala**: Apenas o anfitrião (criador da sala) pode encerrar a competição e calcular o vencedor.
- **Contas e Persistência**:
  - Cadastro e login simples com **Apelido** e **Senha**.
  - Média de fatias por rodízio, total de fatias, total de vitórias e recorde em uma única sessão.
  - Títulos/Patentes dinâmicas baseadas no histórico (ex: *Iniciante*, *Veterano de Mesa*, *Comilão de Elite*, *Destruidor de Buffet*, *Lenda Suprema*).
- **Tema Escuro Nativo**: Interface moderna em modo escuro por padrão, com alternador rápido para modo claro no topo.
- **100% Livre de Emojis**: Design limpo utilizando exclusivamente ícones vetoriais SVG (`lucide-react`).

---

## Tecnologias Utilizadas

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons + Socket.IO Client + Canvas Confetti + QRCode React.
- **Backend**: Node.js + Express + Socket.IO + SQLite (`better-sqlite3`) + Bcryptjs + JWT.

---

## Como Executar o Projeto

### 1. Iniciar o servidor e cliente simultaneamente
Na raiz do projeto (`ContaRodizio/`), execute:

```bash
npm run dev
```

Isso iniciará:
- O servidor backend na porta `4000` (`http://localhost:4000`)
- O aplicativo web frontend na porta `5173` (`http://localhost:5173`)

### 2. Acessando pelo Celular na mesma rede Wi-Fi
Para que seus amigos na mesa do rodízio acessem pelos próprios celulares:
1. Conecte o computador e os celulares na mesma rede Wi-Fi (ou roteador do celular).
2. Descubra o IP local do seu computador (no PowerShell: `ipconfig`, procure por *Endereço IPv4*, ex: `192.168.1.105`).
3. Abra no navegador do celular: `http://SEU_IP_LOCAL:5173` (ex: `http://192.168.1.105:5173`).
4. Pronto! Qualquer um pode entrar na sala escaneando o QR Code ou digitando o código da sala.

