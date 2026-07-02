# SilentRFQ — Frontend

Next.js 15 App Router frontend for the SilentRFQ confidential procurement dApp.

## Vercel Deployment

**Root directory:** `frontend/`

| Setting | Value |
|---|---|
| Framework | Next.js |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Install command | `npm install` |
| Output directory | *(leave blank — Next.js default)* |

### Required environment variables

Set these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` |
| `NEXT_PUBLIC_FACTORY_ADDRESS` | Sepolia `SilentRFQFactory` contract address |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID |

`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is optional if you only need MetaMask support.

### Local development

```bash
cp .env.production.example .env.local
# fill in .env.local values
npm install
npm run dev
```
