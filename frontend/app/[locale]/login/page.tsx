"use client";

import React, { useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError("root", {
          message: errData.message || t("invalid_credentials"),
        });
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("root", { message: "An unexpected error occurred" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col justify-start items-center px-4 font-sans select-none">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-8 shadow-sm mt-32">
        {/* TOP SECTION */}
        <div className="flex flex-col items-center mb-6">
          <span className="font-display font-bold text-sm tracking-widest uppercase text-soil-brown">
            MANDI MITRA
          </span>
          <span className="font-sans text-xs text-gray-500 mt-1 font-semibold">
            {t("title")}
          </span>
        </div>

        {/* FORM */}
        <div className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email-input" className="font-sans text-xs font-semibold text-gray-600 mb-1">
              {t("email_label")}
            </label>
            <input
              id="email-input"
              type="email"
              autoComplete="email"
              aria-required="true"
              placeholder="operator@mandimitra.in"
              {...register("email")}
              className="border border-gray-200 rounded-lg px-3 py-2.5 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-soil-brown/40 focus:border-soil-brown transition-all bg-white text-charcoal"
            />
            {errors.email && (
              <span role="alert" aria-live="polite" className="font-sans text-[11px] text-alert-red mt-1 font-medium">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label htmlFor="password-input" className="font-sans text-xs font-semibold text-gray-600 mb-1">
              {t("password_label")}
            </label>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                aria-required="true"
                placeholder="••••••••"
                {...register("password")}
                className="w-full border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 font-sans text-sm focus:outline-none focus:ring-1 focus:ring-soil-brown/40 focus:border-soil-brown transition-all bg-white text-charcoal"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-505 hover:text-charcoal focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <span role="alert" aria-live="polite" className="font-sans text-[11px] text-alert-red mt-1 font-medium">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Root Form Error */}
          {errors.root && (
            <div role="alert" aria-live="polite" className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
              <span className="font-sans text-xs text-alert-red font-medium">
                {errors.root.message}
              </span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="bg-charcoal text-white rounded-lg py-3 mt-4 font-sans font-semibold text-sm hover:bg-gray-800 transition-colors shadow-sm w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              t("signin_button")
            )}
          </button>
        </div>

        {/* Role credentials card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-2">
            Demo Credentials
          </span>
          <div className="flex flex-col gap-1.5 divide-y divide-gray-100">
            <div className="pt-1.5 first:pt-0">
              <span className="font-sans text-xs text-charcoal font-semibold block">
                Admin
              </span>
              <span className="font-mono text-[10px] text-gray-500 block">
                admin@mandimitra.in / admin2024
              </span>
            </div>
            <div className="pt-2">
              <span className="font-sans text-xs text-charcoal font-semibold block">
                Operator
              </span>
              <span className="font-mono text-[10px] text-gray-500 block">
                operator@mandimitra.in / demo2024
              </span>
              <span className="font-sans text-[10px] text-gray-500 block mt-0.5">
                Full access &mdash; manage pools, buyers, settlements
              </span>
            </div>
            <div className="pt-2">
              <span className="font-sans text-xs text-charcoal font-semibold block">
                Viewer
              </span>
              <span className="font-mono text-[10px] text-gray-500 block">
                viewer@mandimitra.in / view2024
              </span>
              <span className="font-sans text-[10px] text-gray-500 block mt-0.5">
                Read-only access &mdash; view pools and settlements
              </span>
            </div>
          </div>
          <span className="font-sans text-[10px] text-gray-500 block mt-3 font-medium">
            * Role is assigned by admin, contact your NGO administrator
            {/* TODO: role is assigned by admin, contact your NGO administrator */}
          </span>
        </div>
      </div>
    </div>
  );
}
