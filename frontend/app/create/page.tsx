"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount } from "wagmi";
import {
  CalendarClock,
  CheckCircle,
  Coins,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  Lock,
  MapPin,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Tag,
  Trophy,
  Zap,
} from "lucide-react";
import { DarkSelect } from "@/components/DarkSelect";
import { NetworkGuard } from "@/components/NetworkGuard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { TxStatus } from "@/components/TxStatus";
import { WalletConnect } from "@/components/WalletConnect";
import { FACTORY_ADDRESS, FACTORY_MISSING_MESSAGE } from "@/config/contracts";
import { useCreateRFQ } from "@/hooks/useFactory";
import {
  CATEGORY_OPTIONS,
  CURRENCY_OPTIONS,
  UNIT_OPTIONS,
  buildRFQDescription,
  buildRFQTitle,
  resolveCurrencyLabel,
  resolveUnitLabel,
  type StructuredRFQFields,
} from "@/config/rfqDescription";

const DEMO_RFQ_ADDRESS = "0x6272ea767fa6e6668173F5a4D532885ce1D2502E";

const SETUP_STEPS = [
  {
    icon: Zap,
    title: "Create RFQ",
    desc: "Deploy a confidential RFQ contract on Sepolia with your procurement description and bid deadline.",
  },
  {
    icon: Lock,
    title: "Vendors submit encrypted bids",
    desc: "Vendors encrypt bid amounts locally using the Zama SDK. Only TFHE ciphertexts land on-chain. No plaintext, ever.",
  },
  {
    icon: Trophy,
    title: "Finalize and reveal winner",
    desc: "After the deadline, you finalize the RFQ. The Zama KMS gateway publicly decrypts only the winning vendor index.",
  },
];

const inputClass =
  "w-full rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-zamaYellow/50 focus:ring-1 focus:ring-zamaYellow/30 focus:outline-none focus:shadow-[0_0_20px_rgba(255,210,8,0.08)] transition-all duration-200";

const labelClass = "mb-2 block text-sm font-bold text-slate-200";

export default function CreatePage() {
  // Structured RFQ fields
  const [goods, setGoods] = useState("");
  const [category, setCategory] = useState<string>(CATEGORY_OPTIONS[0]);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<string>(UNIT_OPTIONS[0]);
  const [customUnit, setCustomUnit] = useState("");
  const [currency, setCurrency] = useState<string>(CURRENCY_OPTIONS[0]);
  const [customCurrency, setCustomCurrency] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryTarget, setDeliveryTarget] = useState("");
  const [requirements, setRequirements] = useState("");
  const [additionalTerms, setAdditionalTerms] = useState("");
  const [titleOverride, setTitleOverride] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);

  const [deadlineInput, setDeadlineInput] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);

  const { isConnected } = useAccount();
  const { create, hash, isPending, isConfirming, isSuccess, createdRFQAddress, error, reset } = useCreateRFQ();

  const fields: StructuredRFQFields = {
    goods,
    category,
    quantity,
    unit,
    customUnit,
    currency,
    customCurrency,
    deliveryLocation,
    deliveryTarget,
    requirements,
    additionalTerms,
  };

  const autoTitle = buildRFQTitle(fields);
  const effectiveTitle = titleTouched ? titleOverride : autoTitle;
  const unitLabel = resolveUnitLabel(unit, customUnit);
  const currencyLabel = resolveCurrencyLabel(currency, customCurrency);
  const generatedDescription = buildRFQDescription(effectiveTitle, fields);

  const validateDeadline = (value: string): string => {
    if (!value) return "";
    if (new Date(value).getTime() <= Date.now()) return "Deadline must be in the future.";
    return "";
  };

  const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDeadlineInput(e.target.value);
    setDeadlineError(validateDeadline(e.target.value));
  };

  const validate = (): string => {
    if (!goods.trim()) return "Goods / service needed is required.";
    const qtyNum = Number(quantity);
    if (!quantity.trim() || !(qtyNum > 0)) return "Quantity must be greater than 0.";
    if (unit === "other" && !customUnit.trim()) return 'Custom unit is required when unit is "other".';
    if (currency === "Other" && !customCurrency.trim()) return 'Custom currency is required when currency is "Other".';
    if (!deadlineInput) return "Bid deadline is required.";
    const deadlineErr = validateDeadline(deadlineInput);
    if (deadlineErr) return deadlineErr;
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError("");
    const deadlineUnix = BigInt(Math.floor(new Date(deadlineInput).getTime() / 1000));
    create(generatedDescription, deadlineUnix);
  };

  const handleCopyAddress = () => {
    if (!createdRFQAddress) return;
    navigator.clipboard.writeText(createdRFQAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    reset();
    setGoods("");
    setCategory(CATEGORY_OPTIONS[0]);
    setQuantity("");
    setUnit(UNIT_OPTIONS[0]);
    setCustomUnit("");
    setCurrency(CURRENCY_OPTIONS[0]);
    setCustomCurrency("");
    setDeliveryLocation("");
    setDeliveryTarget("");
    setRequirements("");
    setAdditionalTerms("");
    setTitleOverride("");
    setTitleTouched(false);
    setDeadlineInput("");
    setDeadlineError("");
    setFormError("");
    setCopied(false);
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[72vh] flex-col items-center justify-center py-16 px-4">
        <ScrollReveal>
          <div className="w-full max-w-lg space-y-5">
            {/* Success card */}
            <div className="rounded-2xl border border-success/25 bg-success/[0.05] p-10 text-center space-y-5 shadow-[0_0_60px_rgba(16,185,129,0.07)]">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 border border-success/20"
                style={{ animation: "checkmark-pulse 2.4s ease-in-out infinite" }}
              >
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-display text-3xl font-bold text-white">RFQ Created</h2>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Your confidential RFQ is live on Sepolia. Vendors can now submit encrypted bids — bid amounts are never visible on-chain.
                </p>
              </div>

              {/* RFQ address */}
              {createdRFQAddress && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    RFQ Contract Address
                  </p>
                  <p className="font-mono text-sm text-white break-all leading-relaxed">
                    {createdRFQAddress}
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="flex items-center gap-1.5 text-xs font-medium text-fheBlueSoft hover:text-white transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Copied!" : "Copy address"}
                  </button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className={`grid gap-3 ${createdRFQAddress ? "grid-cols-3" : "grid-cols-2"}`}>
              {createdRFQAddress && (
                <Link
                  href={`/rfq/${createdRFQAddress}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-zamaYellow px-4 py-3 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_20px_rgba(255,210,8,0.35)] transition-all"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View RFQ
                </Link>
              )}
              <Link
                href="/rfqs"
                className="flex items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 hover:border-white/[0.18] hover:bg-white/[0.06] transition-all"
              >
                Browse RFQs
              </Link>
              <button
                onClick={resetForm}
                className="rounded-xl border border-white/[0.10] bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-300 hover:border-white/[0.18] hover:bg-white/[0.06] transition-all"
              >
                Create Another
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    );
  }

  return (
    <div className="pt-4">
      <ScrollReveal delay={0}>
        <div className="mb-8">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] uppercase text-zamaYellow">
            New Procurement Request
          </p>
          <h1 className="font-display text-4xl font-bold text-white">Create Confidential RFQ</h1>
          <p className="mt-3 max-w-xl text-sm text-slate-400">
            Post a structured procurement request. Vendors submit encrypted total price quotes
            using Zama FHE. Bid amounts are never visible on-chain.
          </p>
        </div>
      </ScrollReveal>

      {!FACTORY_ADDRESS && (
        <div className="mb-6 rounded-xl border border-danger/20 bg-danger/[0.06] p-4 text-sm text-red-400">
          {FACTORY_MISSING_MESSAGE}
        </div>
      )}

      {/* RFQ Mode selector */}
      <ScrollReveal delay={40}>
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="relative rounded-2xl border border-zamaYellow/40 bg-zamaYellow/[0.06] p-5 shadow-[0_0_24px_rgba(255,210,8,0.06)]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold text-white">Fixed quantity price quote</p>
              <span className="rounded-full border border-zamaYellow/40 bg-zamaYellow/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-zamaYellow">
                Active
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Buyer defines a fixed quantity. Vendors submit encrypted total price quotes for
              fulfilling the full RFQ.
            </p>
          </div>
          <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 opacity-50 cursor-not-allowed">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-400">Fixed budget quantity quote</p>
              <span className="rounded-full border border-white/[0.10] bg-white/[0.05] px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Coming soon
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Buyer defines a budget. Vendors compete on how much quantity they can supply.
            </p>
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Left: explainer */}
        <div className="space-y-6 lg:col-span-2">
          <ScrollReveal delay={80}>
            <div className="rounded-2xl border border-fheBlue/20 bg-fheBlue/[0.05] p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-fheBlueSoft">
                How encrypted bidding works
              </p>
              <ul className="space-y-2">
                {[
                  "Bid amount is the vendor's encrypted total price quote.",
                  "The buyer defines quantity, specs, currency, and terms in the RFQ description.",
                  "Vendors encrypt amounts using the Zama SDK — only ciphertexts land on-chain.",
                  "The contract compares bids via TFHE.",
                  "Only the winner index is publicly decrypted.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-fheBlueSoft" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <Link
              href={`/rfq/${DEMO_RFQ_ADDRESS}`}
              className="inline-flex items-center gap-2 text-sm font-bold text-fheBlueSoft hover:text-white transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              View Verified Demo
            </Link>
          </ScrollReveal>
        </div>

        {/* Right: form or disconnected state */}
        <div className="lg:col-span-3">
          <ScrollReveal delay={160}>
            {!isConnected ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 space-y-7">
                <div>
                  <p className="font-display text-xl font-bold text-white">Get started in three steps</p>
                  <p className="mt-1.5 text-sm text-slate-400">
                    Connect your Sepolia wallet to deploy a confidential RFQ contract.
                  </p>
                </div>

                <div className="space-y-4">
                  {SETUP_STEPS.map(({ icon: Icon, title, desc }, i) => (
                    <div key={title} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zamaYellow/25 bg-zamaYellow/[0.08] font-display text-sm font-bold text-zamaYellow">
                        {i + 1}
                      </div>
                      <div className="pt-0.5">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-3.5 w-3.5 text-slate-500" />
                          <p className="text-sm font-bold text-white">{title}</p>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] pt-6 space-y-3">
                  <p className="text-xs font-medium text-slate-500">Connect to Sepolia to continue</p>
                  <WalletConnect />
                </div>
              </div>
            ) : (
              <NetworkGuard>
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Goods / service */}
                      <div>
                        <label className={labelClass}>Goods / service needed</label>
                        <div className="relative">
                          <Package className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                          <input
                            type="text"
                            value={goods}
                            onChange={(e) => setGoods(e.target.value)}
                            placeholder="Business laptops"
                            required
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div>
                        <label className={labelClass}>Category</label>
                        <DarkSelect
                          options={CATEGORY_OPTIONS}
                          value={category}
                          onChange={setCategory}
                          icon={<Tag className="h-4 w-4" />}
                        />
                      </div>

                      {/* Quantity + Unit */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Quantity</label>
                          <div className="relative">
                            <Hash className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              placeholder="100"
                              required
                              className={`${inputClass} pl-10`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Unit</label>
                          <DarkSelect options={UNIT_OPTIONS} value={unit} onChange={setUnit} />
                          {unit === "other" && (
                            <input
                              type="text"
                              value={customUnit}
                              onChange={(e) => setCustomUnit(e.target.value)}
                              placeholder="Custom unit"
                              required
                              className={`${inputClass} mt-2`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Currency */}
                      <div>
                        <label className={labelClass}>Currency</label>
                        <DarkSelect
                          options={CURRENCY_OPTIONS}
                          value={currency}
                          onChange={setCurrency}
                          icon={<Coins className="h-4 w-4" />}
                        />
                        {currency === "Other" && (
                          <input
                            type="text"
                            value={customCurrency}
                            onChange={(e) => setCustomCurrency(e.target.value)}
                            placeholder="Custom currency"
                            required
                            className={`${inputClass} mt-2`}
                          />
                        )}
                        <p className="mt-1.5 text-xs text-slate-600">
                          All vendors must submit their encrypted total price quote in this
                          currency so bids can be compared fairly.
                        </p>
                      </div>

                      {/* Delivery location + target */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>
                            Delivery location <span className="font-normal text-slate-600">(optional)</span>
                          </label>
                          <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                            <input
                              type="text"
                              value={deliveryLocation}
                              onChange={(e) => setDeliveryLocation(e.target.value)}
                              placeholder="Lagos office"
                              className={`${inputClass} pl-10`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>
                            Delivery target <span className="font-normal text-slate-600">(optional)</span>
                          </label>
                          <div className="relative">
                            <CalendarClock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                            <input
                              type="text"
                              value={deliveryTarget}
                              onChange={(e) => setDeliveryTarget(e.target.value)}
                              placeholder="Within 14 days"
                              className={`${inputClass} pl-10`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Requirements */}
                      <div>
                        <label className={labelClass}>
                          Requirements / specifications{" "}
                          <span className="font-normal text-slate-600">(recommended)</span>
                        </label>
                        <textarea
                          value={requirements}
                          onChange={(e) => setRequirements(e.target.value)}
                          placeholder="Each laptop should have at least 16GB RAM, 512GB SSD, Core i5 or equivalent processor, and Windows 11 Pro."
                          rows={3}
                          className={`${inputClass} resize-none`}
                        />
                        {!requirements.trim() && (
                          <p className="mt-1.5 text-xs text-slate-600">
                            Recommended — clear requirements help vendors quote accurately.
                          </p>
                        )}
                      </div>

                      {/* Additional terms */}
                      <div>
                        <label className={labelClass}>
                          Additional terms <span className="font-normal text-slate-600">(optional)</span>
                        </label>
                        <textarea
                          value={additionalTerms}
                          onChange={(e) => setAdditionalTerms(e.target.value)}
                          placeholder="Quote should include delivery, basic setup, and warranty details."
                          rows={2}
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      {/* Title override */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="block text-sm font-bold text-slate-200">
                            RFQ title <span className="font-normal text-slate-600">(auto-generated, editable)</span>
                          </label>
                          {titleTouched && (
                            <button
                              type="button"
                              onClick={() => {
                                setTitleTouched(false);
                                setTitleOverride("");
                              }}
                              className="inline-flex items-center gap-1 text-xs font-medium text-fheBlueSoft hover:text-white transition-colors"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Reset to auto-generated
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <FileText className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                          <input
                            type="text"
                            value={effectiveTitle}
                            onChange={(e) => {
                              setTitleTouched(true);
                              setTitleOverride(e.target.value);
                            }}
                            className={`${inputClass} pl-10`}
                          />
                        </div>
                      </div>

                      {/* Deadline */}
                      <div>
                        <label className={labelClass}>Bid Deadline</label>
                        <input
                          type="datetime-local"
                          value={deadlineInput}
                          onChange={handleDeadlineChange}
                          required
                          className={`${inputClass} ${deadlineError ? "border-danger/40 focus:border-danger/60 focus:ring-danger/20" : ""}`}
                        />
                        {deadlineError && <p className="mt-1.5 text-xs text-red-400">{deadlineError}</p>}
                      </div>

                      {formError && (
                        <p className="rounded-xl border border-danger/20 bg-danger/[0.06] p-3 text-xs text-red-400">
                          {formError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={!FACTORY_ADDRESS || isPending || isConfirming}
                        className="w-full rounded-xl bg-zamaYellow px-5 py-3 text-sm font-bold text-ink hover:bg-yellow-300 hover:shadow-[0_0_25px_rgba(255,210,8,0.3)] disabled:opacity-40 transition-all"
                      >
                        {isPending ? "Waiting for wallet..." : isConfirming ? "Confirming..." : "Create RFQ"}
                      </button>
                    </form>

                    <div className="mt-4">
                      <TxStatus
                        isPending={isPending}
                        isConfirming={isConfirming}
                        isSuccess={isSuccess}
                        error={error}
                        hash={hash}
                      />
                    </div>
                  </div>

                  {/* RFQ Preview */}
                  <div className="rounded-2xl border border-zamaYellow/20 bg-gradient-to-b from-zamaYellow/[0.04] to-transparent p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-zamaYellow" />
                      <h3 className="text-sm font-bold text-white">RFQ Preview</h3>
                      <span className="ml-auto font-mono text-[10px] text-slate-600">live</span>
                    </div>

                    <p className="mb-5 font-display text-lg font-bold leading-snug text-white">
                      {effectiveTitle}
                    </p>

                    <div className="space-y-2.5 border-t border-white/[0.06] pt-4">
                      <PreviewRow label="RFQ Type" value="Fixed quantity price quote" />
                      <PreviewRow label="Category" value={category} />
                      <PreviewRow label="Goods / Service" value={goods || "—"} />
                      <PreviewRow label="Quantity" value={quantity ? `${quantity} ${unitLabel}` : "—"} />
                      <PreviewRow label="Currency" value={currencyLabel} />
                      {deliveryLocation.trim() && (
                        <PreviewRow label="Delivery Location" value={deliveryLocation} />
                      )}
                      {deliveryTarget.trim() && <PreviewRow label="Delivery Target" value={deliveryTarget} />}
                    </div>

                    {requirements.trim() && (
                      <div className="mt-4 border-t border-white/[0.06] pt-4">
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          Requirements
                        </p>
                        <p className="text-xs leading-relaxed text-slate-400">{requirements}</p>
                      </div>
                    )}

                    {additionalTerms.trim() && (
                      <div className="mt-4 border-t border-white/[0.06] pt-4">
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          Additional Terms
                        </p>
                        <p className="text-xs leading-relaxed text-slate-400">{additionalTerms}</p>
                      </div>
                    )}

                    <div className="mt-4 border-t border-fheBlue/15 pt-4">
                      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-fheBlueSoft">
                        <Lock className="h-3 w-3" />
                        Vendor Instruction
                      </p>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Submit your encrypted total price quote in {currencyLabel} for fulfilling
                        the full RFQ. The buyer has already defined the quantity, specifications,
                        currency, and terms. Your bid amount should represent the total price for
                        the full requirement.
                      </p>
                    </div>

                    <div className="mt-4 border-t border-white/[0.06] pt-4">
                      <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                        <Eye className="h-3 w-3" />
                        Privacy
                      </p>
                      <p className="text-xs leading-relaxed text-slate-500">
                        Bid amounts are encrypted before being sent on-chain. Only the winning
                        vendor is revealed after finalization and gateway reveal.
                      </p>
                    </div>
                  </div>
                </div>
              </NetworkGuard>
            )}
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-xs">
      <span className="shrink-0 font-medium text-slate-600">{label}</span>
      <span className="text-right font-medium text-slate-300">{value}</span>
    </div>
  );
}
