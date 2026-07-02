type Props = {
  isConnected: boolean;
  isBuyer: boolean;
};

export function RoleIndicator({ isConnected, isBuyer }: Props) {
  if (!isConnected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
        Observer
      </span>
    );
  }
  if (isBuyer) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-zamaYellow/25 bg-zamaYellow/10 px-3 py-1 text-xs font-bold text-zamaYellow">
        <span className="h-1.5 w-1.5 rounded-full bg-zamaYellow" />
        Buyer
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-fheBlue/25 bg-fheBlue/10 px-3 py-1 text-xs font-bold text-fheBlueSoft">
      <span className="h-1.5 w-1.5 rounded-full bg-fheBlueSoft" />
      Vendor
    </span>
  );
}
