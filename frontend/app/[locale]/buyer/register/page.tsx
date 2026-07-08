"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, Link } from "@/lib/navigation";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { buyerApi } from "@/lib/buyerApi";
import { CROPS, DISTRICTS } from "@/lib/constants";
import PageHeader from "@/components/shared/PageHeader";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const BuyerRegisterSchema = z.object({
  name: z.string().min(3, "Business name required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter 10-digit phone number"),
  crop: z.string().min(1, "Select a crop"),
  location: z.string().min(1, "Select a location"),
  min_quantity: z.number().min(10, "Minimum 10kg"),
});

type BuyerRegisterForm = z.infer<typeof BuyerRegisterSchema>;

export default function BuyerRegisterPage() {
  const router = useRouter();
  const { setCurrentBuyer } = useBuyerSessionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerRegisterForm>({
    resolver: zodResolver(BuyerRegisterSchema),
    defaultValues: {
      name: "",
      phone: "",
      crop: "",
      location: "",
      min_quantity: 10,
    },
  });

  const onSubmit = async (data: BuyerRegisterForm) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { data: response, offline } = await buyerApi.register(data);
      toast.success(
        offline
          ? `Registered in demo mode — Buyer ID: ${response.buyer_id}`
          : `Registered successfully — Buyer ID: ${response.buyer_id}`
      );

      // Fetch all buyers to retrieve full profile details
      const { data: allBuyers } = await buyerApi.getAll();
      const matched = allBuyers.find((b) => b.phone === data.phone);

      if (matched) {
        setCurrentBuyer(matched);
      } else {
        // Fallback profile object if matching fails
        setCurrentBuyer({
          buyer_id: response.buyer_id,
          name: data.name,
          phone: data.phone,
          crop: data.crop,
          location: data.location,
          min_quantity: data.min_quantity,
        });
      }

      router.push("/buyer/auctions");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to register profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col font-sans">
      <PageHeader
        title="Buyer Registration"
        subtitle="Register your wholesale/trading business to access real-time mandi pooling auctions"
      />

      <main className="flex-1 p-4 lg:p-6 w-full flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Business Name */}
            <div>
              <label htmlFor="name" className="text-xs font-semibold text-gray-500 block mb-1">
                Business Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal"
              />
              {errors.name && (
                <p className="text-alert-red text-xs mt-1 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="text-xs font-semibold text-gray-500 block mb-1">
                Phone Number (10 digits)
              </label>
              <input
                id="phone"
                type="text"
                placeholder="9876543210"
                {...register("phone")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal font-mono"
              />
              {errors.phone && (
                <p className="text-alert-red text-xs mt-1 font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Crop Select */}
            <div>
              <label htmlFor="crop" className="text-xs font-semibold text-gray-500 block mb-1">
                Crop
              </label>
              <select
                id="crop"
                {...register("crop")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal cursor-pointer"
              >
                <option value="">Select a crop</option>
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.crop && (
                <p className="text-alert-red text-xs mt-1 font-medium">
                  {errors.crop.message}
                </p>
              )}
            </div>

            {/* Location Select */}
            <div>
              <label htmlFor="location" className="text-xs font-semibold text-gray-500 block mb-1">
                Location
              </label>
              <select
                id="location"
                {...register("location")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal cursor-pointer"
              >
                <option value="">Select a location</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.location && (
                <p className="text-alert-red text-xs mt-1 font-medium">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Minimum Lot Size */}
            <div>
              <label htmlFor="min_quantity" className="text-xs font-semibold text-gray-500 block mb-1">
                Minimum Lot Size (kg)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  id="min_quantity"
                  type="number"
                  {...register("min_quantity", { valueAsNumber: true })}
                  className="w-full pr-8 pl-3 border border-gray-200 rounded-lg py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 bg-white text-charcoal"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 font-sans text-xs">
                  kg
                </span>
              </div>
              {errors.min_quantity && (
                <p className="text-alert-red text-xs mt-1 font-medium">
                  {errors.min_quantity.message}
                </p>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1C1C1E] text-white rounded-lg py-3 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-sm font-sans"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  Registering...
                </>
              ) : (
                "Register & Continue"
              )}
            </button>

            {submitError && (
              <p className="text-alert-red text-xs text-center mt-2 font-medium">
                {submitError}
              </p>
            )}

            <div className="text-center mt-2">
              <Link
                href="/buyer"
                className="text-xs text-gray-400 hover:text-charcoal font-semibold underline"
              >
                Back to Selection
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
