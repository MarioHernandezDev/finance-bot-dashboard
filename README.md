# Nuxt Minimal Starter

## Arquitectura del bot

- `server/plugins/bot-engine.ts` mantiene el ciclo del bot en procesos Node persistentes y escanea los seis símbolos cada 10 segundos.
- `server/api/bot/state.ts` permite leer logs/configuración y cambiar activación, umbrales RSI y asignación de riesgo.
- `server/utils/paper-trading.ts` centraliza saldo, holdings e historial. Nitro los guarda mediante `unstorage` en `server/data` durante desarrollo.
- `server/api/cron/scan.ts` ejecuta un escaneo único para plataformas serverless. `vercel.json` lo programa cada minuto.

En Render o Node debe ejecutarse el servidor Nitro como proceso persistente. En Vercel, el almacenamiento local no es durable entre instancias: para conservar cartera entre despliegues hay que sustituir el driver `fs` de `bot-state` por una base de datos o KV administrado.

## Alertas de Telegram

Configura estas variables de entorno en Render para activar las alertas:

```bash
TELEGRAM_BOT_TOKEN=token proporcionado por BotFather
TELEGRAM_CHAT_ID=id del chat receptor
```

El bot envía alertas cuando SOL, LINK, FET o PEPE alcanzan RSI 25 o inferior, o cuando cualquier activo soportado cae al menos un 5% en 15 minutos. Las alertas tienen un cooldown de 15 minutos por señal para evitar duplicados.

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
