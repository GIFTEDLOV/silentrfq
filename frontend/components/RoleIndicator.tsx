type Props = {
  isConnected: boolean;
  isBuyer: boolean;
};

export function RoleIndicator({ isConnected, isBuyer }: Props) {
  if (!isConnected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
        Observer
      </span>
    );
  }
  if (isBuyer) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
        Buyer
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
      Vendor
    </span>
  );
}
