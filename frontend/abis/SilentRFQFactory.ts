export const SILENT_RFQ_FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "rfq", type: "address" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "string", name: "description", type: "string" },
      { indexed: false, internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "RFQCreated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
    ],
    name: "createRFQ",
    outputs: [{ internalType: "address", name: "rfq", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getRFQs",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "buyer", type: "address" }],
    name: "getRFQsByBuyer",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rfqCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
