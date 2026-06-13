// ADMIN SETTINGS - Change these to your own crypto wallet deposit addresses before going live
// Paste your personal TRON, BSC, Bitcoin, and Ethereum deposit wallet strings below.
// Live values are managed via /admin and stored in src/lib/data/store-config.json
export const ADMIN_DEPOSIT_WALLETS = {
  tron: {
    networkId: "tron" as const,
    label: "TRON (TRC-20)",
    address: "TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  },
  bsc: {
    networkId: "bsc" as const,
    label: "Binance Smart Chain (BEP-20)",
    address: "0x0000000000000000000000000000000000000000",
  },
  ethereum: {
    networkId: "ethereum" as const,
    label: "Ethereum (ERC-20)",
    address: "0x0000000000000000000000000000000000000000",
  },
  bitcoin: {
    networkId: "bitcoin" as const,
    label: "Bitcoin Network",
    address: "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  },
} as const;

export type PaymentNetwork = keyof typeof ADMIN_DEPOSIT_WALLETS;
export type PaymentToken = "usdt" | "btc";

export function getDepositAddress(network: PaymentNetwork): string {
  return ADMIN_DEPOSIT_WALLETS[network].address;
}
