const PUBLIC_ITEMS = [
  "RFQ description and deadline",
  "Vendor wallet addresses (submission order)",
  "Total number of bids submitted",
  "Winner address (after reveal only)",
];

const PRIVATE_ITEMS = [
  "Individual bid amounts (never exposed on-chain)",
  "Losing bid amounts (permanently encrypted)",
  "Winning bid amount (buyer-only FHE access)",
  "Live ranking during the bidding period",
  "Encrypted comparison results",
];

export function PrivacyPanel() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-800">Privacy Model</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Public On-Chain
          </p>
          <ul className="space-y-1.5">
            {PUBLIC_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600">
                <span className="mt-0.5 shrink-0 text-gray-400">-</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-500">
            Encrypted / Private
          </p>
          <ul className="space-y-1.5">
            {PRIVATE_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-1.5 text-xs text-gray-600">
                <span className="mt-0.5 shrink-0 text-blue-400">-</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-xs text-gray-400 leading-relaxed">
        Encrypted ciphertexts are stored on-chain, but plaintext bid amounts remain inaccessible
        without an FHE.allow grant. No grant is ever issued for losing bids.
      </p>
    </div>
  );
}
