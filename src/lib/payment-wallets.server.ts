import { readStoreConfig } from "@/lib/store-config.server";
import { resolveNetworkWalletInput } from "@/lib/store-config";
import { extractDisplayAddress } from "@/lib/crypto-payment-uri";
import { ADMIN_DEPOSIT_WALLETS } from "@/lib/payment-wallets";

export async function getPaymentWalletsFromConfig() {
  const config = await readStoreConfig();

  const resolveAddress = (network: keyof typeof ADMIN_DEPOSIT_WALLETS) => {
    const walletInput = resolveNetworkWalletInput(config, network);
    return (
      extractDisplayAddress(walletInput) ||
      ADMIN_DEPOSIT_WALLETS[network].address
    );
  };

  return {
    tron: {
      ...ADMIN_DEPOSIT_WALLETS.tron,
      address: resolveAddress("tron"),
    },
    bsc: {
      ...ADMIN_DEPOSIT_WALLETS.bsc,
      address: resolveAddress("bsc"),
    },
    ethereum: {
      ...ADMIN_DEPOSIT_WALLETS.ethereum,
      address: resolveAddress("ethereum"),
    },
    bitcoin: {
      ...ADMIN_DEPOSIT_WALLETS.bitcoin,
      address: resolveAddress("bitcoin"),
    },
  } as const;
}
