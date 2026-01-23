export const ZYLO_VAULT_ABI = [
  {
    inputs: [],
    name: "depositFLR",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    name: "withdrawFLR",
    outputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "exchangeRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalAssets",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    name: "convertToAssets",
    outputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "asset",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export const ASSET_MANAGER_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "lots", type: "uint256" }],
    name: "collateralReservationFee",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
  inputs: [
    { internalType: "address", name: "agent", type: "address" },
    { internalType: "uint256", name: "lots", type: "uint256" },
    { internalType: "uint256", name: "maxMintingFeeBIPS", type: "uint256" },
    { internalType: "address", name: "executor", type: "address" }
  ],
  name: "reserveCollateral",
  outputs: [
    { internalType: "uint64", name: "collateralReservationId", type: "uint64" }
  ],
  stateMutability: "payable",
  type: "function"
},
  {
  inputs: [
    { internalType: "uint256", name: "start", type: "uint256" },
    { internalType: "uint256", name: "end", type: "uint256" }
  ],
  
  name: "getAvailableAgentsDetailedList",
  outputs: [
    {
      components: [
        { internalType: "address", name: "agentVault", type: "address" },
        { internalType: "address", name: "ownerManagementAddress", type: "address" },
        { internalType: "uint256", name: "feeBIPS", type: "uint256" },
        { internalType: "uint256", name: "mintingVaultCollateralRatioBIPS", type: "uint256" },
        { internalType: "uint256", name: "mintingPoolCollateralRatioBIPS", type: "uint256" },
        { internalType: "uint256", name: "freeCollateralLots", type: "uint256" },
        { internalType: "uint8", name: "status", type: "uint8" }
      ],
      internalType: "struct AvailableAgentInfo.Data[]",
      name: "_agents",
      type: "tuple[]"
    },
    { internalType: "uint256", name: "_totalLength", type: "uint256" }
  ],
  stateMutability: "view",
  type: "function"
},
  {
    inputs: [{ internalType: "address", name: "agentVault", type: "address" }],
    name: "getAgentInfo",
    outputs: [
      {
        components: [
          { internalType: "address", name: "agentVault", type: "address" },
          { internalType: "address", name: "collateralPool", type: "address" },
          { internalType: "address", name: "collateralPoolToken", type: "address" },
          { internalType: "uint256", name: "feeBIPS", type: "uint256" },
          { internalType: "uint256", name: "poolFeeShareBIPS", type: "uint256" },
          { internalType: "uint256", name: "mintingVariableFeeBIPS", type: "uint256" },
          { internalType: "uint256", name: "freeCollateralLots", type: "uint256" },
          { internalType: "string", name: "underlyingAddressString", type: "string" }
        ],
        internalType: "struct IIAssetManager.AgentInfo",
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "agentVault", type: "address" },
      { indexed: true, internalType: "address", name: "minter", type: "address" },
      { indexed: true, internalType: "uint64", name: "collateralReservationId", type: "uint64" },
      { indexed: false, internalType: "uint256", name: "valueUBA", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "feeUBA", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "firstUnderlyingBlock", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "lastUnderlyingBlock", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "lastUnderlyingTimestamp", type: "uint256" },
      { indexed: false, internalType: "string", name: "paymentAddress", type: "string" },
      { indexed: false, internalType: "bytes32", name: "paymentReference", type: "bytes32" },
      { indexed: false, internalType: "address", name: "executor", type: "address" },
      { indexed: false, internalType: "uint256", name: "executorFeeNatWei", type: "uint256" }
    ],
    name: "CollateralReserved",
    type: "event"
  }
] as const;