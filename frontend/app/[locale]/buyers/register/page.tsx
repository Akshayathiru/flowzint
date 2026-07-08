"use client";

import React, { useState } from "react";
import { Link, useRouter } from "@/lib/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  ChevronLeft,
  CheckCircle,
  Loader2,
  Phone,
  Mic,
} from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { CROPS, DISTRICTS } from "@/lib/constants";
import { BuyerSchema } from "@/lib/schemas";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const FormSchema = BuyerSchema.omit({ phone: true }).extend({
  phoneDigits: z
    .string()
    .length(10, "Format: exactly 10 digits"),
});

type FormFormData = z.infer<typeof FormSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return function(...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function RegisterBuyerPage() {
  const router = useRouter();
  const t = useTranslations("buyer");
  const { isViewer } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      phoneDigits: "",
      districts: [],
      crops: [],
      preferredHours: {
        start: "06:00",
        end: "20:00",
      },
    },
  });

  const watchedDistricts = watch("districts") || [];
  const watchedCrops = watch("crops") || [];
  const phoneDigitsValue = watch("phoneDigits") || "";
  const phoneValue = phoneDigitsValue ? "+91" + phoneDigitsValue : "";

  const checkPhone = React.useMemo(
    () =>
      debounce(async (phone: string) => {
        if (phone.length < 13) {
          setPhoneExists(false);
          return;
        }
        setCheckingPhone(true);
        try {
          const res = await fetch(`/api/buyers/check?phone=${encodeURIComponent(phone)}`);
          const data = await res.json();
          setPhoneExists(data.exists);
        } catch {
          setPhoneExists(false);
        } finally {
          setCheckingPhone(false);
        }
      }, 600),
    []
  );

  const toggleDistrict = (districtName: string) => {
    if (isViewer) return;
    const current = [...watchedDistricts];
    const next = current.includes(districtName)
      ? current.filter((d) => d !== districtName)
      : [...current, districtName];
    setValue("districts", next, { shouldValidate: true });
  };

  const toggleCrop = (cropName: string) => {
    if (isViewer) return;
    const current = [...watchedCrops];
    const exists = current.some((c) => c.name === cropName);
    const next = exists
      ? current.filter((c) => c.name !== cropName)
      : [...current, { name: cropName, minQtyKg: 100 }];
    setValue("crops", next, { shouldValidate: true });
  };

  const handleMinQtyChange = (cropName: string, val: string) => {
    if (isViewer) return;
    const parsed = parseInt(val, 10);
    const current = [...watchedCrops];
    const next = current.map((c) =>
      c.name === cropName ? { ...c, minQtyKg: isNaN(parsed) ? 0 : parsed } : c
    );
    setValue("crops", next, { shouldValidate: true });
  };

  const onSubmit = async (data: FormFormData) => {
    if (isViewer) return;
    if (phoneExists) {
      toast.error("Please use an unregistered phone number");
      return;
    }

    const fullPhone = "+91" + data.phoneDigits;
    const finalData = {
      name: data.name,
      phone: fullPhone,
      districts: data.districts,
      crops: data.crops,
      preferredHours: data.preferredHours,
    };

    const parseResult = BuyerSchema.safeParse(finalData);
    if (!parseResult.success) {
      toast.error("Invalid form data. Please check all inputs.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.buyers.register(finalData);
      toast.success(t("register_success"));
      router.push("/buyers");
    } catch (err) {
      console.error("Failed to register buyer:", err);
      toast.error("Failed to register buyer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      {/* PAGE HEADER */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Link
              href="/buyers"
              className="flex items-center gap-1 text-gray-500 hover:text-charcoal font-sans text-sm transition-colors font-medium"
            >
              <ChevronLeft size={16} />
              <span>{t("registry_title")}</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="font-display font-bold text-xl text-charcoal">
              {t("register_title")}
            </span>
          </div>
        }
        subtitle="Onboard a new bulk buyer"
      />

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto px-6 py-6 flex flex-col gap-6">
        {/* Read-only banner for viewers */}
        {isViewer && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-sans text-xs text-gray-500">
            You have view-only access. Contact your administrator to make changes.
          </div>
        )}

        {/* Two-Column Form Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* LEFT: Main Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:border-gray-300 transition-colors flex flex-col gap-6"
          >
            {/* SECTION A: Business Details */}
            <div className="border-b border-gray-100 pb-6">
              <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-gray-500 block mb-4">
                Business Details
              </span>

              <div className="flex flex-col gap-4">
                {/* Business Name */}
                <div className="flex flex-col">
                  <label htmlFor="buyer-name-input" className="font-sans text-xs font-semibold text-gray-600 mb-1">
                    {t("name")}
                  </label>
                  <input
                    id="buyer-name-input"
                    type="text"
                    disabled={isViewer}
                    aria-required="true"
                    {...register("name")}
                    placeholder="e.g. Ramesh Traders"
                    className="border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-soil-brown/40 focus:border-soil-brown transition-all bg-white text-charcoal disabled:opacity-60"
                  />
                  {errors.name && (
                    <span role="alert" aria-live="polite" className="font-sans text-xs text-alert-red mt-1">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Phone Number */}
                <div className="flex flex-col">
                  <label htmlFor="buyer-phone-input" className="font-sans text-xs font-semibold text-gray-600 mb-1">
                    {t("phone")}
                  </label>
                  <div className="flex">
                    <span className="border border-r-0 border-gray-200 rounded-l-lg px-3 py-2.5 bg-gray-50 font-sans text-sm text-gray-500 shrink-0 select-none">
                      +91
                    </span>
                    <input
                      id="buyer-phone-input"
                      type="text"
                      disabled={isViewer}
                      aria-required="true"
                      {...register("phoneDigits", {
                        onChange: (e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setValue("phoneDigits", val, { shouldValidate: true });
                          checkPhone("+91" + val);
                        },
                      })}
                      placeholder="9876543210"
                      maxLength={10}
                      className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal disabled:opacity-60"
                    />
                  </div>
                  {errors.phoneDigits && (
                    <span role="alert" aria-live="polite" className="font-sans text-xs text-alert-red mt-1">
                      {errors.phoneDigits.message}
                    </span>
                  )}

                  {/* Async check UI */}
                  {!errors.phoneDigits && !isViewer && (
                    <div className="flex flex-col mt-1">
                      {checkingPhone && (
                        <span className="font-sans text-[11px] text-gray-500">Checking...</span>
                      )}
                      {phoneExists && (
                        <span className="font-sans text-[11px] text-alert-red" role="alert">
                          This phone number is already registered
                        </span>
                      )}
                      {!phoneExists && phoneValue.length >= 13 && !checkingPhone && (
                        <span className="font-sans text-[11px] text-field-green">Phone available</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION B: Service Area & Crops */}
            <div className="border-b border-gray-100 pb-6">
              <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-gray-500 block mb-4">
                Service Area &amp; Crops
              </span>

              <div className="flex flex-col gap-5">
                {/* Districts Multi-Select */}
                <div className="flex flex-col">
                  <label className="font-sans text-xs font-semibold text-gray-600 mb-2">
                    {t("districts")}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DISTRICTS.map((d) => {
                      const isSelected = watchedDistricts.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          disabled={isViewer}
                          onClick={() => toggleDistrict(d)}
                          className={`rounded-lg px-3 py-1.5 font-sans text-xs transition-colors cursor-pointer disabled:opacity-60 ${
                            isSelected
                              ? "bg-charcoal text-white font-semibold"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white"
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                  {errors.districts && (
                    <span className="font-sans text-xs text-alert-red mt-1">
                      {errors.districts.message}
                    </span>
                  )}
                </div>

                {/* Crops Multi-Select with Min Lot Size */}
                <div className="flex flex-col mt-2">
                  <label className="font-sans text-xs font-semibold text-gray-600 mb-2">
                    {t("crops_min_lot")}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {CROPS.map((c) => {
                      const isSelected = watchedCrops.some((item) => item.name === c);
                      return (
                        <button
                          key={c}
                          type="button"
                          disabled={isViewer}
                          onClick={() => toggleCrop(c)}
                          className={`rounded-lg px-3 py-1.5 font-sans text-xs transition-colors cursor-pointer disabled:opacity-60 ${
                            isSelected
                              ? "bg-charcoal text-white font-semibold"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50 bg-white"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                  {errors.crops && (
                    <span className="font-sans text-xs text-alert-red mt-1">
                      {errors.crops.message}
                    </span>
                  )}

                  {/* Min Lot Quantity Inputs for selected crops */}
                  <div className="flex flex-col gap-2 mt-2">
                    {watchedCrops.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3"
                      >
                        <span className="font-sans font-medium text-sm text-charcoal">
                          {c.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <label htmlFor={`min-qty-${c.name}`} className="font-sans text-xs text-gray-500">{t("min_lot")}:</label>
                          <input
                            id={`min-qty-${c.name}`}
                            type="number"
                            disabled={isViewer}
                            value={c.minQtyKg || ""}
                            onChange={(e) =>
                              handleMinQtyChange(c.name, e.target.value)
                            }
                            className="w-20 text-center border border-gray-200 rounded-lg px-2 py-1.5 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal disabled:opacity-60"
                          />
                          <span className="font-sans text-xs text-gray-500">kg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION C: Availability */}
            <div className="pb-2">
              <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-gray-500 block mb-4">
                {t("preferred_hours")}
              </span>
              <p className="font-sans text-xs text-gray-500 mb-3">
                {t("hours_note")}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="start-time-input" className="font-sans text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                    From
                  </label>
                  <input
                    id="start-time-input"
                    type="time"
                    disabled={isViewer}
                    {...register("preferredHours.start")}
                    className="border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-soil-brown/40 bg-white text-charcoal disabled:opacity-60"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="end-time-input" className="font-sans text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                    To
                  </label>
                  <input
                    id="end-time-input"
                    type="time"
                    disabled={isViewer}
                    {...register("preferredHours.end")}
                    className="border border-gray-200 rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-soil-brown/40 bg-white text-charcoal disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {!isViewer && (
              <button
                type="submit"
                disabled={isSubmitting || phoneExists}
                className="bg-charcoal text-white rounded-lg py-3 font-sans font-semibold text-sm hover:bg-gray-800 transition-colors shadow-sm w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  t("register_submit")
                )}
              </button>
            )}
          </form>

          {/* RIGHT: Info Sidebar */}
          <aside className="lg:sticky lg:top-6 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
              <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-4">
                {t("how_calls_work")}
              </span>

              <div className="flex flex-col divide-y divide-gray-100">
                <div className="flex items-start gap-3 py-3 first:pt-0">
                  <Phone className="w-4 h-4 text-soil-brown shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-gray-500 leading-normal">
                    Bulbul calls registered buyers when a pool threshold is
                    crossed in their service area.
                  </p>
                </div>
                <div className="flex items-start gap-3 py-3">
                  <Mic className="w-4 h-4 text-soil-brown shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-gray-500 leading-normal">
                    Buyers respond verbally with a price &mdash; Sarvam STT converts
                    it to structured data.
                  </p>
                </div>
                <div className="flex items-start gap-3 py-3 last:pb-0">
                  <CheckCircle className="w-4 h-4 text-soil-brown shrink-0 mt-0.5" />
                  <p className="font-sans text-xs text-gray-500 leading-normal">
                    Highest verified bid wins. Farmers are called back immediately.
                  </p>
                </div>
              </div>

              {/* Callout Box */}
              <div className="bg-harvest-gold/10 rounded-lg p-3 border border-harvest-gold/20 mt-4">
                <p className="font-sans text-xs text-stone-700 leading-relaxed">
                  Buyers are not charged per call. Subscription fee covers
                  unlimited auction participation in registered districts.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
