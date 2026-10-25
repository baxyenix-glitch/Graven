# Graven (v3) ⚰️⚡

> **A digital graveyard where dead tokens on Robinhood Chain get an afterlife.**
>
> Graven turns defunct, rugged, and abandoned meme coins and micro-caps into commemorative digital shrines. Original creators bury their dead coins with signed cryptographic certificates of demise, memorial inscriptions, and epitaphs. Visitors pay respects at each shrine, generating qualified views that fund continuous ETH rewards—split **60% to the Developer**, **30% to Verified Original Token Holders**, and **10% to the Graven Treasury**.

---

## 🎨 Design Philosophy & Brand Identity

- **Platform Name:** **Graven** (Never "Graveyard").
- **Aesthetic Synthesis:** Combines high-density information architecture (featured burial cards, live activity feeds, Ca search palettes, tabular leaderboards) with a vibrant, playful neo-brutalist sticker styling.
- **Color Palette:**
  - **Lavender Cream Background:** `#F6F4FF` (soft solid canvas, strictly zero gridlines/lined paper)
  - **Midnight Ink:** `#0A0F2E` (3px and 2.5px chunky borders, high-contrast typography)
  - **Cobalt Accent:** `#1237E8` (deep interactive brand primary)
  - **Electric Lime:** `#E4FF6B` (high-voltage callouts, primary buttons, badges)
  - **Bubblegum Pink:** `#FF9CCB` (epitaphs, accent chips, death tags)
  - **Cyan (`#67E8F9`) & Mint (`#6EE7B7`):** Stats highlights and launchpad indicators
- **Typography:**
  - Headings & Large Numbers: **Anton** (uppercase, bold, retro-impactful)
  - Body & Micro-labels: **Raleway** (weights 500/600/700/800)
  - Epitaphs & Notes: **Caveat** (handwritten marker personality)
  - Addresses & Values: **Space Mono** (monospace clarity)

---

## 📱 Mobile Architecture & Fixes (Zero Bugs)

Graven v3 completely eliminates the legacy mobile issues:
1. **Fully Responsive Navbar:** Floating pill on desktop; on mobile (<768px), transforms into a responsive header featuring a dedicated wallet button and hamburger trigger.
2. **Unmounted Mobile Drawer:** When closed, the mobile drawer is unmounted (`{isOpen && ...}`) with `pointer-events: none` on overlays, eliminating dead tap zones or blocking invisible elements.
3. **Scroll Lock Cleanup:** Restores `document.body.style.overflow` immediately upon drawer toggle or route change.
4. **iOS Auto-Zoom Prevention:** All input elements enforce `text-base` (≥ 16px font size) so iOS Safari never forces unprompted screen zoom.
5. **Generous Tap Targets:** All buttons and interactive links meet minimum 44px tap targets.
6. **Gravestone Percentage Inscriptions:** The gravestone is positioned using percentage boundaries (safe area: left 23%, right 23%, top 15%, bottom 31%) directly over the clean base PNG, ensuring text and badges never drift or overflow on any viewport width (360px to 1440px+).

---

## 📂 Project Architecture

```
c:\Users\USER\Desktop\Graden
├── contracts/
│   ├── GravenToken.sol          # ERC-20 testnet $GRAVEN contract (with minting for testing)
│   └── deploy.ts                # Deployment script for Robinhood Chain Testnet
├── data/                        # JSON Database (Persistent Storage)
│   ├── config.json              # Protocol rules, fee splits, and caps
│   ├── tokens.json              # Indexed ERC-20 token cache
│   ├── graves.json              # Buried token records & epitaphs
│   ├── views.json               # View history & dwell time qualifications
│   ├── ledger.json              # Double-entry ledger (accruals & claims)
│   ├── payouts.json             # Execution records via Privy Server Wallet
│   ├── users.json               # Profile records & earnings aggregations
│   ├── stats_cache.json         # Authoritative stats cache
│   ├── faucet_claims.json       # Faucet rate-limiting records
│   ├── admin_actions.json       # Audit log for governance actions
│   ├── holder_snapshots/        # Per-token snapshot records of eligible holders
│   └── backups/                 # Automatic 14-day rolling backup archives
├── public/
│   ├── assets/
│   │   ├── logo.png             # Official Graven smiling gravestone mascot
│   │   ├── gravestone.png       # Base gravestone artwork (unmodified PNG)
│   │   └── hero/                # Desktop and mobile hero banners
│   └── favicon.ico              # Custom mascot favicon
├── src/
│   ├── app/                     # Next.js App Router (All 11 pages + API routes)
│   │   ├── api/                 # Dynamic server API routes
│   │   │   ├── bury/            # Nonce generation & cryptographic burial verification
│   │   │   ├── claims/          # Reward claim submission & execution
│   │   │   ├── cron/            # Maintenance cron (backup rotation + stats cache)
│   │   │   ├── faucet/          # Testnet $GRAVEN faucet
│   │   │   ├── graves/          # Grave querying & detail retrieval
│   │   │   ├── leaderboard/     # Leaderboards (most visited, highest rewards)
│   │   │   ├── stats/           # Real-time protocol metrics
│   │   │   ├── tokens/          # Live contract address & metadata lookup
│   │   │   └── views/           # Anti-fraud 5s dwell view recording
│   │   ├── bury/                # 6-Step burial wizard
│   │   ├── dashboard/           # Creator & holder dashboard with 1-click claim
│   │   ├── faucet/              # Faucet page for testnet tokens
│   │   ├── grave/[address]/     # Individual grave shrine with 5s dwell timer
│   │   ├── graves/              # Filterable cemetery directory
│   │   ├── leaderboard/         # Hall of the Honored Dead
│   │   ├── how-it-works/        # Explainer guide with economics walkthrough
│   │   ├── admin/               # Governance & system configuration dashboard
│   │   ├── terms/               # Legal terms
│   │   └── privacy/             # Privacy policy
│   ├── components/              # Modular UI components
│   │   ├── grave/               # Gravestone HTML inscription renderer
│   │   ├── home/                # Hero, StatsBand, RecentBurials, Analytics, Timeline
│   │   ├── layout/              # Navbar, Footer, CommandPalette, WrongNetworkModal
│   │   └── providers/           # PrivyProvider configured for Robinhood Chain
│   └── lib/
│       ├── auth/                # Server-side Privy token verification
│       ├── chain/               # Viem public client & Robinhood Chain testnet config
│       ├── db/                  # In-memory indexed, mutexed atomic JSON DB engine
│       ├── launchpads/          # Pons.family & generic ERC-20 creator adapters
│       ├── privy/               # Privy Server Wallet native ETH payout executor
│       └── rate-limit.ts        # In-memory IP/wallet rate limiter
└── tests/                       # Vitest integration & protocol integrity test suite
```

---

## ⚙️ Environment Variables Reference

Create a `.env.local` file in the project root:

```env
# ==============================================================================
# NETWORK & APP CONFIG
# ==============================================================================
NEXT_PUBLIC_NETWORK_MODE=testnet
TESTNET_DEV_MODE=true

# ==============================================================================
# PRIVY AUTHENTICATION & EMBEDDED WALLETS
# ==============================================================================
NEXT_PUBLIC_PRIVY_APP_ID=cmvfa453b000w0fjnxtyvhk1o
PRIVY_APP_SECRET=privy_app_secret_...
PRIVY_SERVER_WALLET_ID=x4akr5v6sfmk7akh0rxqpus8
PRIVY_AUTHORIZATION_PRIVATE_KEY=

# Optional: WalletConnect Project ID for mobile wallet deep linking
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

# ==============================================================================
# ROBINHOOD CHAIN (Testnet Chain ID: 46630)
# ==============================================================================
RH_CHAIN_ID=46630
RH_RPC_URL=https://rpc.testnet.chain.robinhood.com
RH_EXPLORER_URL=https://explorer.testnet.chain.robinhood.com
RH_EXPLORER_API_URL=https://explorer.testnet.chain.robinhood.com/api

# ==============================================================================
# PROTOCOL TOKEN & LAUNCHPAD ADAPTERS
# ==============================================================================
GRAVEN_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
MIN_GRAVEN_HOLD=10000

PONS_FACTORY_ADDRESS=
PONS_BONDING_CURVE_ROUTER=
PONS_METADATA_API_URL=https://api.pons.family

# ==============================================================================
# SECURITY, CRON & DEV SETTINGS
# ==============================================================================
ADMIN_WALLETS=
CRON_SECRET=graven_super_secure_cron_secret_v3
DEV_ALLOWED_ORIGINS=localhost:3000,127.0.0.1:3000

# ==============================================================================
# ECONOMICS & REWARDS SPLIT
# ==============================================================================
REWARD_DEV_PCT=60
REWARD_HOLDERS_PCT=30
REWARD_PLATFORM_PCT=10
REWARD_ETH_PER_QUALIFIED_VIEW=0.0005
DAILY_CAP_PER_WALLET_ETH=0.05
DAILY_CAP_PER_GRAVE_ETH=0.25
DAILY_CAP_GLOBAL_ETH=2.0
MIN_CLAIM_THRESHOLD_ETH=0.001
DEAD_MIN_DAYS=7
DEAD_MCAP_DROP_PCT=85
```

---

## 🔒 Privy Dashboard Configuration

To ensure seamless authentication, log into your [Privy Dashboard](https://dashboard.privy.io) and configure the following:

1. **Allowed Origins:**
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `https://your-production-domain.com`
   - Your local LAN IP (e.g. `http://192.168.1.X:3000`) for mobile testing.
2. **Login Methods:**
   - Enable **External Wallets** (MetaMask, Rabby, Rainbow, Coinbase Wallet).
   - Enable **Embedded Wallets** if email or social login is desired.
3. **Server Wallet Permissions:**
   - Ensure the server wallet ID (`x4akr5v6sfmk7akh0rxqpus8`) is funded with testnet ETH on Robinhood Chain to process reward claims.

---

## 💾 Persistent-Disk Requirements for Production Deployments

The Graven v3 database engine is fully self-contained, high-performance, and concurrency-safe without requiring external database servers (PostgreSQL/Redis). Data is indexed in memory and flushed via atomic writes with Windows/Linux lock resilience to `data/*.json`.

> [!IMPORTANT]
> When deploying to containerized cloud providers (Railway, Render, Fly.io, AWS ECS, or Docker):
> - **Mount a Persistent Volume** to the `./data` directory (e.g., `/app/data`).
> - Without a persistent volume, container restarts will discard new burials and ledger records.

### Automatic 14-Day Rolling Backups
The database engine automatically takes daily snapshots of all JSON files into `data/backups/YYYY-MM-DD/` and prunes backups older than 14 days.

---

## ⏰ Automated Cron Schedule Setup

Graven provides a secured maintenance endpoint at `/api/cron`.

### What it does:
1. Re-computes authoritative protocol statistics (views, payouts, burials today, active graves).
2. Flushes and writes `data/stats_cache.json`.
3. Creates a daily backup snapshot under `data/backups/YYYY-MM-DD/` and prunes backups older than 14 days.

### Calling the Cron:
```bash
# Via Bearer Token
curl -X POST https://your-domain.com/api/cron \
  -H "Authorization: Bearer graven_super_secure_cron_secret_v3"

# Via Query Parameter (e.g. for simple ping services)
curl -X GET "https://your-domain.com/api/cron?key=graven_super_secure_cron_secret_v3"
```

### Recommended Cron Setup:
- **Vercel Cron (`vercel.json`):**
  ```json
  {
    "crons": [
      {
        "path": "/api/cron?key=graven_super_secure_cron_secret_v3",
        "schedule": "0 0 * * *"
      }
    ]
  }
  ```
- **Linux Crontab (`crontab -e`):**
  ```bash
  0 0 * * * curl -s -X POST -H "Authorization: Bearer graven_super_secure_cron_secret_v3" http://localhost:3000/api/cron > /dev/null
  ```

---

## 🧪 Testing & Verification

### 1. Run Unit Tests
```bash
pnpm test
```
Executes all 8 tests in `tests/db.test.ts` and `tests/protocol.test.ts`, verifying atomic writes, ledger double-entry math, anti-sybil filtering, rate-limiting, and backup rotation.

### 2. Run Production Build
```bash
pnpm build
pnpm start
```
Compiles and starts the optimized Turbopack production bundle on `http://localhost:3000`.

### 3. End-to-End Walkthrough
1. **Faucet (`/faucet`):** Connect any testnet wallet and claim 10,000 testnet $GRAVEN tokens.
2. **Search / Lookup:** Use the hero search bar or press `Cmd+K` to open the Command Palette and paste any token contract address.
3. **Burial Wizard (`/bury`):** Follow the 6-step flow (Address -> Verification -> Epitaph & Cause of Death -> Memorial Photos -> Snapshot -> Sign Burial Demise Certificate).
4. **Shrine View (`/grave/[address]`):** Dwell on the page for 5 seconds and scroll to trigger qualified view verification.
5. **Dashboard (`/dashboard`):** Check creator accruals and click **Claim Rewards** to receive native ETH on Robinhood Chain testnet via Privy Server Wallet.

---

## 📲 LAN Mobile Device Testing

To test the application on your physical smartphone over local Wi-Fi:
1. Find your computer's local IP address (`ipconfig` on Windows or `ifconfig` on macOS/Linux, e.g. `192.168.1.120`).
2. Add the IP to `DEV_ALLOWED_ORIGINS` in `.env.local`:
   ```env
   DEV_ALLOWED_ORIGINS=localhost:3000,127.0.0.1:3000,192.168.1.120:3000
   ```
3. Add `http://192.168.1.120:3000` to Allowed Origins in your Privy Dashboard.
4. Open `http://192.168.1.120:3000` on your mobile browser (Safari / Chrome).
5. Verify the mobile drawer opens smoothly, buttons are responsive, the search bar works, and the wallet connects properly.

---

## 🚀 Switching to Mainnet

When Robinhood Chain mainnet goes live:
1. Set `NEXT_PUBLIC_NETWORK_MODE=mainnet` and `TESTNET_DEV_MODE=false` in `.env.local`.
2. Update `RH_CHAIN_ID`, `RH_RPC_URL`, and `RH_EXPLORER_URL` in `src/lib/chain/config.ts` with the official Robinhood Chain mainnet parameters.
3. Deploy the production `$GRAVEN` token contract to mainnet using `contracts/deploy.ts` and set `GRAVEN_TOKEN_ADDRESS`.
4. Fund the production Privy Server Wallet with mainnet ETH.
5. Re-run `pnpm build` and deploy.
