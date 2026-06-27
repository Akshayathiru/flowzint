"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

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
    <div className="bg-amber-50 border border-amber-250 rounded-lg px-3 py-2 mb-4 font-sans">
      <p className="text-xs text-amber-700 font-medium">{t("session_expired")}</p>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
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
            {t("title")}
          </div>
        </div>

        <React.Suspense fallback={null}>
          <SessionExpiredBanner />
        </React.Suspense>

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
          <div
            className="text-[10px] text-gray-505 text-center mt-2 font-medium"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {"// TODO: replace with POST /api/auth/login backed by real DB"}
          </div>
        </div>
      </div>
    </div>
  );
}
