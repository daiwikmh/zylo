import { ethers } from "ethers";
import { interfaceToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { FTSOV2_CONFIG, TOKENS, FEED_IDS } from "../config/ftsoV2.config";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export interface AssetPrice {
  symbol: string;
  balance: string;
  price: string;
  valueUsd: string;
}

export interface AccountBalance {
  type: "EOA" | "Smart Account";
  address: string;
  assets: AssetPrice[];
  totalUsd: string;
}

export interface PortfolioData {
  accounts: AccountBalance[];
  grandTotalUsd: string;
}

async function fetchAddressBalances(
  walletAddress: string,
  provider: ethers.JsonRpcProvider,
  xrpPrice: number,
  flrPrice: number
): Promise<{ assets: AssetPrice[]; totalUsd: string }> {
  const usdtContract = new ethers.Contract(
    TOKENS.USDT0.address,
    ERC20_ABI,
    provider
  );
  const fxrpContract = new ethers.Contract(
    TOKENS.FXRP.address,
    ERC20_ABI,
    provider
  );

  const [c2flrBalance, usdtBalance, fxrpBalance, usdtDecimals, fxrpDecimals] = await Promise.all([
    provider.getBalance(walletAddress),
    usdtContract.balanceOf(walletAddress),
    fxrpContract.balanceOf(walletAddress),
    usdtContract.decimals(),
    fxrpContract.decimals(),
  ]);

  const c2flrBalanceFormatted = Number(ethers.formatEther(c2flrBalance));
  const usdtBalanceFormatted = Number(
    ethers.formatUnits(usdtBalance, usdtDecimals)
  );
  const fxrpBalanceFormatted = Number(
    ethers.formatUnits(fxrpBalance, fxrpDecimals)
  );

  const c2flrValueUsd = c2flrBalanceFormatted * flrPrice;
  const usdtValueUsd = usdtBalanceFormatted * 1.0;
  const fxrpValueUsd = fxrpBalanceFormatted * xrpPrice;

  const assets: AssetPrice[] = [
    {
      symbol: "C2FLR",
      balance: c2flrBalanceFormatted.toFixed(4),
      price: flrPrice.toFixed(6),
      valueUsd: c2flrValueUsd.toFixed(2),
    },
    {
      symbol: "USDT0",
      balance: usdtBalanceFormatted.toFixed(2),
      price: "1.00",
      valueUsd: usdtValueUsd.toFixed(2),
    },
    {
      symbol: "FXRP",
      balance: fxrpBalanceFormatted.toFixed(4),
      price: xrpPrice.toFixed(4),
      valueUsd: fxrpValueUsd.toFixed(2),
    },
  ];

  const totalUsd = (c2flrValueUsd + usdtValueUsd + fxrpValueUsd).toFixed(2);

  return {
    assets,
    totalUsd,
  };
}

export async function fetchPortfolioValue(
  eoaAddress?: string,
  smartAccountAddress?: string
): Promise<PortfolioData> {
  const provider = new ethers.JsonRpcProvider(FTSOV2_CONFIG.RPC_URL);

  const ftsov2Abi = interfaceToAbi("FtsoV2Interface", "coston2");
  const ftsov2 = new ethers.Contract(
    FTSOV2_CONFIG.ADDRESS,
    ftsov2Abi,
    provider
  );

  const feedIdArray = [FEED_IDS["XRP/USD"], FEED_IDS["FLR/USD"]];
  const priceData = await ftsov2.getFeedsById.staticCall(feedIdArray);

  const feeds = priceData[0];
  const decimals = priceData[1];

  const xrpPrice = Number(feeds[0]) / Math.pow(10, Number(decimals[0]));
  const flrPrice = Number(feeds[1]) / Math.pow(10, Number(decimals[1]));

  const accounts: AccountBalance[] = [];
  let grandTotal = 0;

  if (eoaAddress) {
    const { assets, totalUsd } = await fetchAddressBalances(
      eoaAddress,
      provider,
      xrpPrice,
      flrPrice
    );
    accounts.push({
      type: "EOA",
      address: eoaAddress,
      assets,
      totalUsd,
    });
    grandTotal += Number(totalUsd);
  }

  if (smartAccountAddress) {
    const { assets, totalUsd } = await fetchAddressBalances(
      smartAccountAddress,
      provider,
      xrpPrice,
      flrPrice
    );
    accounts.push({
      type: "Smart Account",
      address: smartAccountAddress,
      assets,
      totalUsd,
    });
    grandTotal += Number(totalUsd);
  }

  return {
    accounts,
    grandTotalUsd: grandTotal.toFixed(2),
  };
}
