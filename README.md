# ClipForge AI Backend

API backend para gerar clips de vídeos longos usando IA.

## Features

- Upload de vídeo local ou via URL do YouTube
- Processamento em fila com BullMQ + Redis
- Transcrição de áudio usando OpenAI Whisper
- Análise de conteúdo com GPT-4
- Geração de clips em 9:16 com FFmpeg
- Banco de dados PostgreSQL com Prisma
- Atualização em tempo real via Socket.io

## Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Redis
- BullMQ
- Socket.io
- FFmpeg
- OpenAI
- yt-dlp

### Frontend
- Vite
- React 18
- TypeScript
- Tailwind CSS

## Setup

1. Instale dependências do backend:
   ```bash
   npm install
   ```
2. Instale dependências do frontend:
   ```bash
   cd frontend
   npm install
   cd ..
   ```
3. Copie o arquivo de ambiente:
   ```bash
   copy .env.example .env
   ```
4. Atualize `.env` com sua configuração
5. Inicie os serviços Docker (opcional):
   ```bash
   docker-compose up -d
   ```

### Alternativa sem Docker
Se você não quiser usar Docker, use SQLite localmente:
```bash
copy .env.example .env
# Atualize .env para DATABASE_URL="file:./dev.db"
npm run prisma:generate:dev
npm run prisma:dbpush:dev
npm run dev
```

6. Rode migrações e gere o cliente Prisma (quando usando PostgreSQL):
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```
7. Inicie o backend:
   ```bash
   npm run dev
   ```
8. Inicie o frontend em outra aba:
   ```bash
   cd frontend
   npm run dev
   ```

## Environment Setup

### Backend (.env)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/clipforge_ai"
OPENAI_API_KEY="your-openai-api-key"
REDIS_HOST="localhost"
REDIS_PORT="6379"
PORT=5000
FRONTEND_URL="http://localhost:3000"
YTDLP_PATH=""
FFMPEG_PATH=""
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000
```

## API Endpoints

- `POST /api/auth/register` - Cria um novo usuário
- `POST /api/auth/login` - Faz login e retorna token JWT
- `GET /api/auth/me` - Retorna dados do usuário atual
- `POST /api/upload` - Envia vídeo local ou URL do YouTube
- `POST /api/process` - Inicia processamento do vídeo
- `GET /api/videos` - Recupera vídeos de um usuário
- `GET /api/clips/:videoId` - Recupera clips de um vídeo
- `GET /api/clips/download/:clipId` - Baixa um clip

> Para endpoints que aceitam autenticação, envie o header `Authorization: Bearer <token>`.

## Development

- `npm run build` - Compila TypeScript
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run queue:worker` - Inicia worker
- `npm run prisma:studio` - Abre Prisma Studio

## Docker

```bash
docker-compose up --build
```

## License

MIT

