import { readStoreConfig } from "@/lib/store-config.server";
import { ADMIN_DEPOSIT_WALLETS } from "@/lib/payment-wallets";

export async function getPaymentWalletsFromConfig() {
  const config = await readStoreConfig();

  return {
    tron: {
      ...ADMIN_DEPOSIT_WALLETS.tron,
      address: config.cryptoWallets.tron || ADMIN_DEPOSIT_WALLETS.tron.address,
    },
    bsc: {
      ...ADMIN_DEPOSIT_WALLETS.bsc,
      address: config.cryptoWallets.bsc || ADMIN_DEPOSIT_WALLETS.bsc.address,
    },
    ethereum: {
      ...ADMIN_DEPOSIT_WALLETS.ethereum,
      address:
        config.cryptoWallets.ethereum || ADMIN_DEPOSIT_WALLETS.ethereum.address,
    },
    bitcoin: {
      ...ADMIN_DEPOSIT_WALLETS.bitcoin,
      address:
        config.cryptoWallets.bitcoin || ADMIN_DEPOSIT_WALLETS.bitcoin.address,
    },
  } as const;
}
