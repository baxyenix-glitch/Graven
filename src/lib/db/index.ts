import fs from 'fs';
import path from 'path';
import { AsyncMutex } from './mutex';
import {
  ConfigSchema,
  Config,
  TokenRecordSchema,
  TokenRecord,
  GraveRecordSchema,
  GraveRecord,
  HolderSnapshotSchema,
  HolderSnapshot,
  ViewRecordSchema,
  ViewRecord,
  LedgerEntrySchema,
  LedgerEntry,
  PayoutRecordSchema,
  PayoutRecord,
  NonceRecordSchema,
  NonceRecord,
  UserRecordSchema,
  UserRecord,
  StatsCacheSchema,
  StatsCache,
  FaucetClaimSchema,
  FaucetClaim,
  AdminActionSchema,
  AdminAction,
  FlaggedClusterSchema,
  FlaggedCluster,
} from './schemas';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');
const SNAPSHOTS_DIR = path.join(DATA_DIR, 'holder_snapshots');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
if (!fs.existsSync(SNAPSHOTS_DIR)) fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });

// Mutex per collection
const mutexes: Record<string, AsyncMutex> = {
  config: new AsyncMutex(),
  tokens: new AsyncMutex(),
  graves: new AsyncMutex(),
  views: new AsyncMutex(),
  ledger: new AsyncMutex(),
  payouts: new AsyncMutex(),
  nonces: new AsyncMutex(),
  users: new AsyncMutex(),
  stats_cache: new AsyncMutex(),
  faucet_claims: new AsyncMutex(),
  admin_actions: new AsyncMutex(),
  flagged_clusters: new AsyncMutex(),
  snapshots: new AsyncMutex(),
};

// In-Memory store
class MemoryStore {
  config: Config;
  tokens: Map<string, TokenRecord> = new Map();
  graves: Map<string, GraveRecord> = new Map();
  gravesByDev: Map<string, string[]> = new Map();
  gravesByBurialTime: string[] = []; // sorted IDs (newest first)
  views: ViewRecord[] = [];
  ledger: LedgerEntry[] = [];
  payouts: PayoutRecord[] = [];
  nonces: Map<string, NonceRecord> = new Map();
  users: Map<string, UserRecord> = new Map();
  statsCache: StatsCache;
  faucetClaims: Map<string, FaucetClaim> = new Map();
  adminActions: AdminAction[] = [];
  flaggedClusters: FlaggedCluster[] = [];
  snapshots: Map<string, HolderSnapshot> = new Map();
  initialized: boolean = false;

  constructor() {
    this.config = ConfigSchema.parse({});
    this.statsCache = StatsCacheSchema.parse({});
  }
}

const memory = new MemoryStore();

// Atomic file write with Windows EPERM/EBUSY resilience
async function atomicWriteJson(filePath: string, data: any) {
  const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  const content = JSON.stringify(data, null, 2);
  await fs.promises.writeFile(tempPath, content, 'utf-8');

  let retries = 5;
  while (retries > 0) {
    try {
      await fs.promises.rename(tempPath, filePath);
      return;
    } catch (err: any) {
      if ((err.code === 'EPERM' || err.code === 'EBUSY') && retries > 1) {
        retries--;
        await new Promise((r) => setTimeout(r, 30));
      } else {
        // Fallback to direct write if Windows locks rename
        try {
          await fs.promises.writeFile(filePath, content, 'utf-8');
          await fs.promises.unlink(tempPath).catch(() => {});
          return;
        } catch {
          throw err;
        }
      }
    }
  }
}

// Read JSON safely
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed reading ${filePath}:`, err);
    return fallback;
  }
}

// Backup system (keep 14 daily backups)
export async function createDailyBackup() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const targetDir = path.join(BACKUPS_DIR, today);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const src = path.join(DATA_DIR, file);
      const dest = path.join(targetDir, file);
      await fs.promises.copyFile(src, dest);
    }

    // Prune older than 14
    const existingBackups = fs.readdirSync(BACKUPS_DIR).sort();
    if (existingBackups.length > 14) {
      const toRemove = existingBackups.slice(0, existingBackups.length - 14);
      for (const oldDir of toRemove) {
        fs.rmSync(path.join(BACKUPS_DIR, oldDir), { recursive: true, force: true });
      }
    }
  } catch (err) {
    console.error('Backup creation error:', err);
  }
}

// Initialize database from disk
export function initDb() {
  if (memory.initialized) return;

  // 1. Config
  const rawConfig = readJsonFile(path.join(DATA_DIR, 'config.json'), null);
  memory.config = rawConfig ? ConfigSchema.parse(rawConfig) : ConfigSchema.parse({});

  // 2. Tokens
  const rawTokens = readJsonFile<TokenRecord[]>(path.join(DATA_DIR, 'tokens.json'), []);
  memory.tokens.clear();
  for (const t of rawTokens) {
    const valid = TokenRecordSchema.parse(t);
    memory.tokens.set(valid.address.toLowerCase(), valid);
  }

  // 3. Graves & Indexes
  const rawGraves = readJsonFile<GraveRecord[]>(path.join(DATA_DIR, 'graves.json'), []);
  memory.graves.clear();
  memory.gravesByDev.clear();
  for (const g of rawGraves) {
    const valid = GraveRecordSchema.parse(g);
    const id = valid.tokenAddress.toLowerCase();
    memory.graves.set(id, valid);

    const dev = valid.devWallet.toLowerCase();
    const existing = memory.gravesByDev.get(dev) || [];
    existing.push(id);
    memory.gravesByDev.set(dev, existing);
  }

  // Build sorted index by burial time
  memory.gravesByBurialTime = Array.from(memory.graves.values())
    .sort((a, b) => new Date(b.buriedAt).getTime() - new Date(a.buriedAt).getTime())
    .map((g) => g.tokenAddress.toLowerCase());

  // 4. Views
  const rawViews = readJsonFile<ViewRecord[]>(path.join(DATA_DIR, 'views.json'), []);
  memory.views = rawViews.map((v) => ViewRecordSchema.parse(v));

  // 5. Ledger
  const rawLedger = readJsonFile<LedgerEntry[]>(path.join(DATA_DIR, 'ledger.json'), []);
  memory.ledger = rawLedger.map((l) => LedgerEntrySchema.parse(l));

  // 6. Payouts
  const rawPayouts = readJsonFile<PayoutRecord[]>(path.join(DATA_DIR, 'payouts.json'), []);
  memory.payouts = rawPayouts.map((p) => PayoutRecordSchema.parse(p));

  // 7. Nonces
  const rawNonces = readJsonFile<NonceRecord[]>(path.join(DATA_DIR, 'nonces.json'), []);
  memory.nonces.clear();
  for (const n of rawNonces) {
    memory.nonces.set(n.nonce, NonceRecordSchema.parse(n));
  }

  // 8. Users
  const rawUsers = readJsonFile<UserRecord[]>(path.join(DATA_DIR, 'users.json'), []);
  memory.users.clear();
  for (const u of rawUsers) {
    memory.users.set(u.wallet.toLowerCase(), UserRecordSchema.parse(u));
  }

  // 9. Stats Cache
  const rawStats = readJsonFile(path.join(DATA_DIR, 'stats_cache.json'), null);
  memory.statsCache = rawStats ? StatsCacheSchema.parse(rawStats) : StatsCacheSchema.parse({});

  // 10. Faucet Claims
  const rawFaucet = readJsonFile<FaucetClaim[]>(path.join(DATA_DIR, 'faucet_claims.json'), []);
  memory.faucetClaims.clear();
  for (const fc of rawFaucet) {
    memory.faucetClaims.set(fc.wallet.toLowerCase(), FaucetClaimSchema.parse(fc));
  }

  // 11. Admin Actions
  const rawAdmin = readJsonFile<AdminAction[]>(path.join(DATA_DIR, 'admin_actions.json'), []);
  memory.adminActions = rawAdmin.map((a) => AdminActionSchema.parse(a));

  // 12. Flagged Clusters
  const rawClusters = readJsonFile<FlaggedCluster[]>(path.join(DATA_DIR, 'flagged_clusters.json'), []);
  memory.flaggedClusters = rawClusters.map((c) => FlaggedClusterSchema.parse(c));

  memory.initialized = true;
  recalculateStats();
}

// Auto-seed default config if missing
export async function seedConfigOnly() {
  initDb();
  const configPath = path.join(DATA_DIR, 'config.json');
  if (!fs.existsSync(configPath)) {
    const defaultConfig = ConfigSchema.parse({
      rewardDevPct: Number(process.env.REWARD_DEV_PCT || 60),
      rewardHoldersPct: Number(process.env.REWARD_HOLDERS_PCT || 30),
      rewardPlatformPct: Number(process.env.REWARD_PLATFORM_PCT || 10),
      rewardEthPerQualifiedView: Number(process.env.REWARD_ETH_PER_QUALIFIED_VIEW || 0.0005),
      dailyCapPerWalletEth: Number(process.env.DAILY_CAP_PER_WALLET_ETH || 0.05),
      dailyCapPerGraveEth: Number(process.env.DAILY_CAP_PER_GRAVE_ETH || 0.25),
      dailyCapGlobalEth: Number(process.env.DAILY_CAP_GLOBAL_ETH || 2.0),
      minClaimThresholdEth: Number(process.env.MIN_CLAIM_THRESHOLD_ETH || 0.001),
      minGravenHold: Number(process.env.MIN_GRAVEN_HOLD || 10000),
      deadMinDays: Number(process.env.DEAD_MIN_DAYS || 7),
      deadMcapDropPct: Number(process.env.DEAD_MCAP_DROP_PCT || 85),
      testnetDevMode: process.env.TESTNET_DEV_MODE !== 'false',
    });
    await atomicWriteJson(configPath, defaultConfig);
    memory.config = defaultConfig;
  }
}

// Recalculate stats from authoritative memory
export function recalculateStats(): StatsCache {
  const graves = Array.from(memory.graves.values());
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  let tokensBuried = graves.length;
  let activeGraves = graves.filter((g) => g.status === 'live').length;
  let totalGraveViews = graves.reduce((sum, g) => sum + g.viewsCount, 0);
  let buriedToday = graves.filter((g) => new Date(g.buriedAt).getTime() >= startOfDay).length;

  // Paid out from payouts where status === 'SENT'
  let ethPaidOut = memory.payouts
    .filter((p) => p.status === 'SENT')
    .reduce((sum, p) => sum + p.amountEth, 0);

  // Holders rewarded
  const holdersRewardedSet = new Set(
    memory.ledger
      .filter((l) => l.role === 'HOLDER' && l.type === 'ACCRUAL')
      .map((l) => l.recipient.toLowerCase())
  );

  // Recent events from latest burials + paid claims
  const recentEvents: StatsCache['recentEvents'] = [];

  for (const g of graves.slice(-10)) {
    recentEvents.push({
      id: `burial_${g.tokenAddress}_${g.buriedAt}`,
      type: 'BURIED',
      tokenSymbol: g.symbol,
      tokenAddress: g.tokenAddress,
      timestamp: g.buriedAt,
      description: `$${g.symbol} was laid to rest`,
    });
  }

  for (const p of memory.payouts.filter((x) => x.status === 'SENT').slice(-10)) {
    recentEvents.push({
      id: `payout_${p.id}`,
      type: 'CLAIM_PAID',
      tokenSymbol: 'ETH',
      tokenAddress: p.recipient,
      amountEth: p.amountEth,
      timestamp: p.timestamp,
      description: `Payout of ${p.amountEth.toFixed(4)} ETH completed`,
    });
  }

  recentEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  memory.statsCache = {
    tokensBuried,
    totalGraveViews,
    ethPaidOut: Number(ethPaidOut.toFixed(6)),
    holdersRewarded: holdersRewardedSet.size,
    buriedToday,
    activeGraves,
    recentEvents: recentEvents.slice(0, 10),
    updatedAt: new Date().toISOString(),
  };

  return memory.statsCache;
}

// Periodic or write-triggered stats cache save
export async function persistStatsCache() {
  const release = await mutexes.stats_cache.acquire();
  try {
    recalculateStats();
    await atomicWriteJson(path.join(DATA_DIR, 'stats_cache.json'), memory.statsCache);
  } finally {
    release();
  }
}

// Export Database Access API (in-memory read, mutexed atomic write)
export const db = {
  // CONFIG
  getConfig: (): Config => {
    initDb();
    return memory.config;
  },
  updateConfig: async (updates: Partial<Config>): Promise<Config> => {
    initDb();
    const release = await mutexes.config.acquire();
    try {
      const merged = ConfigSchema.parse({
        ...memory.config,
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      await atomicWriteJson(path.join(DATA_DIR, 'config.json'), merged);
      memory.config = merged;
      return merged;
    } finally {
      release();
    }
  },

  // STATS
  getStats: (): StatsCache => {
    initDb();
    return memory.statsCache;
  },

  // GRAVES
  getAllGraves: (): GraveRecord[] => {
    initDb();
    return memory.gravesByBurialTime
      .map((id) => memory.graves.get(id)!)
      .filter(Boolean);
  },
  getGraveByAddress: (address: string): GraveRecord | null => {
    initDb();
    return memory.graves.get(address.toLowerCase()) || null;
  },
  getGravesByDev: (devWallet: string): GraveRecord[] => {
    initDb();
    const ids = memory.gravesByDev.get(devWallet.toLowerCase()) || [];
    return ids.map((id) => memory.graves.get(id)!).filter(Boolean);
  },
  createGrave: async (grave: GraveRecord): Promise<GraveRecord> => {
    initDb();
    const valid = GraveRecordSchema.parse(grave);
    const release = await mutexes.graves.acquire();
    try {
      const id = valid.tokenAddress.toLowerCase();
      if (memory.graves.has(id)) {
        throw new Error(`Grave for token ${id} already exists`);
      }
      memory.graves.set(id, valid);

      const dev = valid.devWallet.toLowerCase();
      const existing = memory.gravesByDev.get(dev) || [];
      existing.push(id);
      memory.gravesByDev.set(dev, existing);

      memory.gravesByBurialTime.unshift(id);

      const all = Array.from(memory.graves.values());
      await atomicWriteJson(path.join(DATA_DIR, 'graves.json'), all);

      // Also mark token as buried
      if (memory.tokens.has(id)) {
        const t = memory.tokens.get(id)!;
        t.isBuried = true;
        await atomicWriteJson(path.join(DATA_DIR, 'tokens.json'), Array.from(memory.tokens.values()));
      }

      await persistStatsCache();
      return valid;
    } finally {
      release();
    }
  },
  updateGrave: async (tokenAddress: string, updates: Partial<GraveRecord>): Promise<GraveRecord> => {
    initDb();
    const id = tokenAddress.toLowerCase();
    const release = await mutexes.graves.acquire();
    try {
      const current = memory.graves.get(id);
      if (!current) throw new Error(`Grave ${id} not found`);

      const updated = GraveRecordSchema.parse({
        ...current,
        ...updates,
      });

      memory.graves.set(id, updated);
      await atomicWriteJson(path.join(DATA_DIR, 'graves.json'), Array.from(memory.graves.values()));
      await persistStatsCache();
      return updated;
    } finally {
      release();
    }
  },

  // TOKENS
  getToken: (address: string): TokenRecord | null => {
    initDb();
    return memory.tokens.get(address.toLowerCase()) || null;
  },
  upsertToken: async (token: TokenRecord): Promise<TokenRecord> => {
    initDb();
    const valid = TokenRecordSchema.parse(token);
    const release = await mutexes.tokens.acquire();
    try {
      const addr = valid.address.toLowerCase();
      memory.tokens.set(addr, valid);
      await atomicWriteJson(path.join(DATA_DIR, 'tokens.json'), Array.from(memory.tokens.values()));
      return valid;
    } finally {
      release();
    }
  },

  // VIEWS
  recordView: async (view: ViewRecord): Promise<ViewRecord> => {
    initDb();
    const valid = ViewRecordSchema.parse(view);
    const release = await mutexes.views.acquire();
    try {
      memory.views.push(valid);
      await atomicWriteJson(path.join(DATA_DIR, 'views.json'), memory.views);

      // Increment in grave
      const grave = memory.graves.get(valid.graveAddress.toLowerCase());
      if (grave) {
        grave.viewsCount += 1;
        if (valid.isQualified) {
          grave.qualifiedViewsCount += 1;
        }
        await atomicWriteJson(path.join(DATA_DIR, 'graves.json'), Array.from(memory.graves.values()));
      }

      await persistStatsCache();
      return valid;
    } finally {
      release();
    }
  },
  getViewsForGrave: (graveAddress: string): ViewRecord[] => {
    initDb();
    const target = graveAddress.toLowerCase();
    return memory.views.filter((v) => v.graveAddress.toLowerCase() === target);
  },
  hasWalletViewedIn24h: (graveAddress: string, wallet: string): boolean => {
    initDb();
    const targetGrave = graveAddress.toLowerCase();
    const targetWallet = wallet.toLowerCase();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    return memory.views.some(
      (v) =>
        v.graveAddress.toLowerCase() === targetGrave &&
        v.viewerWallet?.toLowerCase() === targetWallet &&
        v.isQualified &&
        new Date(v.timestamp).getTime() >= cutoff
    );
  },

  // LEDGER
  addLedgerEntry: async (entry: LedgerEntry): Promise<LedgerEntry> => {
    initDb();
    const valid = LedgerEntrySchema.parse(entry);
    const release = await mutexes.ledger.acquire();
    try {
      memory.ledger.push(valid);
      await atomicWriteJson(path.join(DATA_DIR, 'ledger.json'), memory.ledger);

      // Update grave earned if dev or holder
      const grave = memory.graves.get(valid.graveAddress.toLowerCase());
      if (grave && valid.type === 'ACCRUAL') {
        grave.totalEthEarned += valid.amountEth;
        await atomicWriteJson(path.join(DATA_DIR, 'graves.json'), Array.from(memory.graves.values()));
      }

      // Update user
      const user = memory.users.get(valid.recipient.toLowerCase());
      if (user && valid.type === 'ACCRUAL') {
        user.totalEarnedEth += valid.amountEth;
        await atomicWriteJson(path.join(DATA_DIR, 'users.json'), Array.from(memory.users.values()));
      }

      await persistStatsCache();
      return valid;
    } finally {
      release();
    }
  },
  getLedgerForWallet: (wallet: string): LedgerEntry[] => {
    initDb();
    const target = wallet.toLowerCase();
    return memory.ledger.filter((l) => l.recipient.toLowerCase() === target);
  },
  getClaimableBalanceForWallet: (wallet: string): number => {
    initDb();
    const target = wallet.toLowerCase();
    const accrued = memory.ledger
      .filter((l) => l.recipient.toLowerCase() === target && l.type === 'ACCRUAL')
      .reduce((sum, l) => sum + l.amountEth, 0);

    const claimed = memory.ledger
      .filter((l) => l.recipient.toLowerCase() === target && l.type === 'CLAIM_PAID')
      .reduce((sum, l) => sum + l.amountEth, 0);

    const balance = accrued - claimed;
    return Math.max(0, Number(balance.toFixed(6)));
  },

  // PAYOUTS
  createPayout: async (payout: PayoutRecord): Promise<PayoutRecord> => {
    initDb();
    const valid = PayoutRecordSchema.parse(payout);
    const release = await mutexes.payouts.acquire();
    try {
      memory.payouts.push(valid);
      await atomicWriteJson(path.join(DATA_DIR, 'payouts.json'), memory.payouts);
      return valid;
    } finally {
      release();
    }
  },
  updatePayout: async (id: string, updates: Partial<PayoutRecord>): Promise<PayoutRecord> => {
    initDb();
    const release = await mutexes.payouts.acquire();
    try {
      const idx = memory.payouts.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error(`Payout ${id} not found`);

      const updated = PayoutRecordSchema.parse({
        ...memory.payouts[idx],
        ...updates,
      });

      memory.payouts[idx] = updated;
      await atomicWriteJson(path.join(DATA_DIR, 'payouts.json'), memory.payouts);
      await persistStatsCache();
      return updated;
    } finally {
      release();
    }
  },
  getPayoutsForWallet: (wallet: string): PayoutRecord[] => {
    initDb();
    const target = wallet.toLowerCase();
    return memory.payouts.filter((p) => p.recipient.toLowerCase() === target);
  },

  // NONCES
  createNonce: async (wallet: string, tokenAddress: string): Promise<NonceRecord> => {
    initDb();
    const nonce = `graven_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    const record: NonceRecord = {
      nonce,
      wallet: wallet.toLowerCase(),
      tokenAddress: tokenAddress.toLowerCase(),
      expiresAt,
      used: false,
    };
    const release = await mutexes.nonces.acquire();
    try {
      memory.nonces.set(nonce, record);
      await atomicWriteJson(path.join(DATA_DIR, 'nonces.json'), Array.from(memory.nonces.values()));
      return record;
    } finally {
      release();
    }
  },
  consumeNonce: async (nonce: string, wallet: string, tokenAddress: string): Promise<boolean> => {
    initDb();
    const release = await mutexes.nonces.acquire();
    try {
      const record = memory.nonces.get(nonce);
      if (!record) return false;
      if (record.used) return false;
      if (Date.now() > record.expiresAt) return false;
      if (record.wallet.toLowerCase() !== wallet.toLowerCase()) return false;
      if (record.tokenAddress.toLowerCase() !== tokenAddress.toLowerCase()) return false;

      record.used = true;
      await atomicWriteJson(path.join(DATA_DIR, 'nonces.json'), Array.from(memory.nonces.values()));
      return true;
    } finally {
      release();
    }
  },

  // FAUCET CLAIMS
  getFaucetClaim: (wallet: string): FaucetClaim | null => {
    initDb();
    return memory.faucetClaims.get(wallet.toLowerCase()) || null;
  },
  recordFaucetClaim: async (wallet: string, amount: number, txHash: string | null): Promise<FaucetClaim> => {
    initDb();
    const release = await mutexes.faucet_claims.acquire();
    try {
      const claim: FaucetClaim = {
        wallet: wallet.toLowerCase(),
        lastClaimedAt: new Date().toISOString(),
        amountClaimed: amount,
        txHash,
      };
      memory.faucetClaims.set(wallet.toLowerCase(), claim);
      await atomicWriteJson(path.join(DATA_DIR, 'faucet_claims.json'), Array.from(memory.faucetClaims.values()));
      return claim;
    } finally {
      release();
    }
  },

  // SNAPSHOTS
  getHolderSnapshot: (tokenAddress: string): HolderSnapshot | null => {
    initDb();
    const addr = tokenAddress.toLowerCase();
    if (memory.snapshots.has(addr)) {
      return memory.snapshots.get(addr)!;
    }
    const snapPath = path.join(SNAPSHOTS_DIR, `${addr}.json`);
    const data = readJsonFile<HolderSnapshot | null>(snapPath, null);
    if (data) {
      const valid = HolderSnapshotSchema.parse(data);
      memory.snapshots.set(addr, valid);
      return valid;
    }
    return null;
  },
  saveHolderSnapshot: async (snapshot: HolderSnapshot): Promise<HolderSnapshot> => {
    initDb();
    const valid = HolderSnapshotSchema.parse(snapshot);
    const release = await mutexes.snapshots.acquire();
    try {
      const addr = valid.tokenAddress.toLowerCase();
      memory.snapshots.set(addr, valid);
      const snapPath = path.join(SNAPSHOTS_DIR, `${addr}.json`);
      await atomicWriteJson(snapPath, valid);
      return valid;
    } finally {
      release();
    }
  },

  // USERS
  upsertUser: async (wallet: string, role: 'user' | 'admin' = 'user'): Promise<UserRecord> => {
    initDb();
    const target = wallet.toLowerCase();
    const release = await mutexes.users.acquire();
    try {
      const existing = memory.users.get(target);
      const now = new Date().toISOString();
      const user: UserRecord = existing
        ? {
            ...existing,
            lastActiveAt: now,
            role: role === 'admin' ? 'admin' : existing.role,
          }
        : {
            wallet: target,
            firstSeenAt: now,
            lastActiveAt: now,
            isBanned: false,
            role,
            totalEarnedEth: 0,
            totalClaimedEth: 0,
          };

      memory.users.set(target, user);
      await atomicWriteJson(path.join(DATA_DIR, 'users.json'), Array.from(memory.users.values()));
      return user;
    } finally {
      release();
    }
  },
  getUser: (wallet: string): UserRecord | null => {
    initDb();
    return memory.users.get(wallet.toLowerCase()) || null;
  },

  // ADMIN ACTIONS
  logAdminAction: async (adminWallet: string, action: string, target: string, details: Record<string, any> = {}) => {
    initDb();
    const release = await mutexes.admin_actions.acquire();
    try {
      const item: AdminAction = {
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        adminWallet: adminWallet.toLowerCase(),
        action,
        target,
        details,
      };
      memory.adminActions.push(item);
      await atomicWriteJson(path.join(DATA_DIR, 'admin_actions.json'), memory.adminActions);
      return item;
    } finally {
      release();
    }
  },
  getAdminActions: (): AdminAction[] => {
    initDb();
    return [...memory.adminActions].reverse();
  },
};

// Seed config automatically
seedConfigOnly().catch(console.error);
