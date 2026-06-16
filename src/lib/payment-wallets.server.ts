import { readStoreConfig } from "@/lib/store-config.server";
import {
  resolveBtcWalletInput,
  resolveEthWalletInput,
} from "@/lib/store-config";
import { extractDisplayAddress } from "@/lib/crypto-payment-uri";
import { ADMIN_DEPOSIT_WALLETS } from "@/lib/payment-wallets";

export async function getPaymentWalletsFromConfig() {
  const config = await readStoreConfig();

  const bitcoinInput = resolveBtcWalletInput(config);
  const ethereumInput = resolveEthWalletInput(config);

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
        extractDisplayAddress(ethereumInput) ||
        ADMIN_DEPOSIT_WALLETS.ethereum.address,
    },
    bitcoin: {
      ...ADMIN_DEPOSIT_WALLETS.bitcoin,
      address:
        extractDisplayAddress(bitcoinInput) ||
        ADMIN_DEPOSIT_WALLETS.bitcoin.address,
    },
  } as const;
}
