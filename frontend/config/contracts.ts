import { SILENT_RFQ_FACTORY_ABI } from "@/abis/SilentRFQFactory";
import { SILENT_RFQ_ABI } from "@/abis/SilentRFQ";

export { SILENT_RFQ_FACTORY_ABI, SILENT_RFQ_ABI };

export const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as
  | `0x${string}`
  | undefined;

export const EXPECTED_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? "31337"
);

export const FACTORY_MISSING_MESSAGE =
  "Factory address missing. Deploy SilentRFQFactory and set NEXT_PUBLIC_FACTORY_ADDRESS in frontend/.env.local.";
