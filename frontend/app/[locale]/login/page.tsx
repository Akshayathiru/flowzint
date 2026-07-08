"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/lib/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, LayoutDashboard, Gavel } from "lucide-react";
import { useTranslations } from "next-intl";
import { buyerApi } from "@/lib/buyerApi";
import { useBuyerSessionStore } from "@/store/buyerSessionStore";
import { BuyerProfile } from "@/types";
import { toast } from "sonner";
import OfflineBanner from "@/components/shared/OfflineBanner";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginData = z.infer<typeof LoginSchema>;

function SessionExpiredBanner() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const sessionExpired = searchParams ? searchParams.get("expired") === "true" : false;

  if (!sessionExpired) return null;

  return (
    <div className="bg-amber-50 border border-amber-250 rounded-lg px-3 py-2 mb-4 font-sans w-full">
      <p className="text-xs text-amber-700 font-medium">{t("session_expired")}</p>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const { setCurrentBuyer } = useBuyerSessionStore();

  const [selectedRole, setSelectedRole] = useState<"operator" | "buyer" | null>(null);

  // Operator Form states
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Buyer Form states
  const [buyers, setBuyers] = useState<BuyerProfile[]>([]);
  const [offline, setOffline] = useState(false);
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(false);
  const [buyerError, setBuyerError] = useState<string | null>(null);

  // Auto-select role based on query param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (roleParam === "buyer") {
        setSelectedRole("buyer");
      } else if (roleParam === "operator") {
        setSelectedRole("operator");
      }
    }
  }, []);

  // Fetch buyers when buyer role is selected
  useEffect(() => {
    if (selectedRole === "buyer") {
      setIsLoadingBuyers(true);
      setBuyerError(null);
      buyerApi
        .getAll()
        .then(({ data, offline }) => {
          setBuyers(data);
          setOffline(offline);
        })
        .catch((err) => {
          setBuyerError(err.message || "Could not reach the backend server");
        })
        .finally(() => {
          setIsLoadingBuyers(false);
        });
    }
  }, [selectedRole]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(data: LoginData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        setError("root", { message: body.message || t("invalid_credentials") });
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("root", { message: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectBuyer = (buyer: BuyerProfile) => {
    setCurrentBuyer(buyer);
    toast.success(`Logged in as ${buyer.name}`);
    router.push("/buyer/auctions");
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div
            className="font-bold text-sm tracking-widest uppercase text-[#6B4226]"
            style={{ fontFamily: "Mukta, sans-serif" }}
          >
            MANDI MITRA
          </div>
          <div
            className="text-xs text-gray-500 mt-1 font-semibold"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Smart Agriculture Market Pooler
          </div>
        </div>

        <React.Suspense fallback={null}>
          <SessionExpiredBanner />
        </React.Suspense>

        {/* STEP 1: ROLE SELECTION */}
        {selectedRole === null && (
          <div className="flex flex-col items-center">
            <h2
              className="text-lg font-bold text-charcoal text-center mb-2"
              style={{ fontFamily: "Mukta, sans-serif" }}
            >
              Sign in to Mandi Mitra
            </h2>
            <p
              className="text-xs text-gray-400 text-center mb-6 font-medium"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Choose your portal access role
            </p>

            <div className="grid grid-cols-2 gap-4 w-full">
              {/* Operator Card */}
              <button
                onClick={() => setSelectedRole("operator")}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-[#6B4226] hover:shadow-sm transition-all text-center flex flex-col items-center focus:outline-none focus:ring-1 focus:ring-[#6B4226]"
              >
                <div className="w-12 h-12 rounded-full bg-[#6B4226]/5 flex items-center justify-center text-[#6B4226] shrink-0">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-sm text-charcoal mt-3">
                  Operator
                </h3>
                <p className="font-sans text-[10px] text-gray-400 mt-1 leading-normal font-medium">
                  Manage pools, farmers, and settlements
                </p>
              </button>

              {/* Buyer Card */}
              <button
                onClick={() => setSelectedRole("buyer")}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-[#E6A817] hover:shadow-sm transition-all text-center flex flex-col items-center focus:outline-none focus:ring-1 focus:ring-[#E6A817]"
              >
                <div className="w-12 h-12 rounded-full bg-[#E6A817]/5 flex items-center justify-center text-[#E6A817] shrink-0">
                  <Gavel className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-sm text-charcoal mt-3">
                  Buyer / Wholesaler
                </h3>
                <p className="font-sans text-[10px] text-gray-400 mt-1 leading-normal font-medium">
                  View live auctions and place bids
                </p>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2A: OPERATOR LOGIN FORM */}
        {selectedRole === "operator" && (
          <div className="flex flex-col">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-xs text-gray-400 hover:text-charcoal font-semibold mb-4 text-left cursor-pointer transition-colors"
            >
              &larr; Back to role selection
            </button>

            <div
              className="text-lg font-semibold text-[#1C1C1E] text-center mb-6"
              style={{ fontFamily: "Mukta, sans-serif" }}
            >
              {t("signin_heading")}
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email-input"
                  className="text-xs font-semibold text-gray-655 block mb-1"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {t("email_label")}
                </label>
                <input
                  id="email-input"
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  aria-required="true"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4226]/20 focus:border-[#6B4226] bg-white text-charcoal"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                {errors.email && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="text-xs text-[#DC2626] mt-1 font-medium"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {errors.email.message}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="password-input"
                  className="text-xs font-semibold text-gray-655 block mb-1"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {t("password_label")}
                </label>
                <div className="relative">
                  <input
                    id="password-input"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-required="true"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B4226]/20 focus:border-[#6B4226] bg-white text-charcoal"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-505 hover:text-charcoal focus:outline-none cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <div
                    role="alert"
                    aria-live="polite"
                    className="text-xs text-[#DC2626] mt-1 font-medium"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {errors.password.message}
                  </div>
                )}
              </div>

              {errors.root && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="text-xs text-[#DC2626] text-center font-medium"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {errors.root.message}
                </div>
              )}

              <button
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full bg-[#1C1C1E] text-white rounded-lg py-3 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-sm"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Signing in...
                  </>
                ) : (
                  t("signin_button")
                )}
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
              <div
                className="text-[10px] text-gray-505 text-center mb-2 uppercase tracking-wider font-semibold"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Demo credentials
              </div>
              {[
                {
                  role: "Admin",
                  email: "admin@mandimitra.in",
                  password: "admin2024",
                },
                {
                  role: "Operator",
                  email: "operator@mandimitra.in",
                  password: "demo2024",
                },
                {
                  role: "Viewer",
                  email: "viewer@mandimitra.in",
                  password: "view2024",
                },
              ].map((c) => (
                <div
                  key={c.role}
                  className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0"
                >
                  <span
                    className="text-[10px] font-semibold text-gray-505"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {c.role}
                  </span>
                  <span className="font-mono text-[10px] text-gray-505">
                    {c.email} / {c.password}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2B: BUYER PROFILE SELECTION FLOW */}
        {selectedRole === "buyer" && (
          <div className="flex flex-col">
            <button
              onClick={() => setSelectedRole(null)}
              className="text-xs text-gray-400 hover:text-charcoal font-semibold mb-4 text-left cursor-pointer transition-colors"
            >
              &larr; Back to role selection
            </button>

            <h2
              className="text-lg font-bold text-charcoal text-center mb-1"
              style={{ fontFamily: "Mukta, sans-serif" }}
            >
              Buyer Portal
            </h2>
            <p
              className="text-xs text-gray-500 text-center mb-6 font-medium"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Select your buyer profile to access live auctions
            </p>

            {/* SKELETON LOADERS */}
            {isLoadingBuyers && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="animate-pulse bg-gray-50 border border-gray-200 rounded-xl h-24 p-4 flex flex-col justify-between"
                  >
                    <div className="h-4 bg-gray-150 rounded w-2/3" />
                    <div className="h-3 bg-gray-150 rounded w-1/2" />
                    <div className="h-3 bg-gray-150 rounded w-3/4" />
                  </div>
                ))}
              </div>
            )}

            {/* BACKEND ERROR HANDLING */}
            {buyerError && !isLoadingBuyers && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-sm font-semibold text-alert-red">
                  Could not reach the backend server
                </p>
                <p className="text-[11px] text-gray-450 font-medium mt-1 leading-normal font-mono">
                  Make sure the backend is running at {process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}
                </p>
              </div>
            )}

            {/* BUYERS LIST */}
            {!isLoadingBuyers && !buyerError && (
              <>
                {offline && <OfflineBanner />}
                {buyers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-xs text-gray-400 font-semibold mb-4">
                      No buyers registered yet
                    </p>
                    <Link
                      href="/buyer/register"
                      className="inline-flex items-center justify-center bg-charcoal text-white rounded-lg px-4 py-2 font-sans font-semibold text-xs hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
                    >
                      Register as Buyer &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                    {buyers.map((buyer) => (
                      <button
                        key={buyer.buyer_id}
                        onClick={() => handleSelectBuyer(buyer)}
                        className="text-left bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-[#6B4226] hover:shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#6B4226]"
                      >
                        <h3 className="font-display font-semibold text-sm text-charcoal">
                          {buyer.name}
                        </h3>
                        <p className="font-sans text-[11px] text-gray-400 font-mono mt-0.5">
                          {buyer.phone}
                        </p>
                        <p className="font-sans text-[11px] text-gray-500 mt-1.5 font-medium">
                          {buyer.crop} &middot; {buyer.location}
                        </p>
                        <p className="font-sans text-[9px] text-gray-400 mt-1 font-semibold">
                          Min lot: {buyer.min_quantity}kg
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t border-gray-200 mt-6 pt-4 flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-400 font-medium">Not registered yet?</span>
                  <Link
                    href="/buyer/register"
                    className="text-sky-blue hover:underline"
                  >
                    Register as Buyer &rarr;
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
