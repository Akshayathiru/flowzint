"use client";

import React, { useEffect, useRef, useState } from "react";
import { Link } from "@/lib/navigation";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const t = useTranslations("landing");

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      num: 1,
      title: t("steps.s1_title"),
      desc: t("steps.s1_desc"),
      active: activeStep >= 0,
    },
    {
      num: 2,
      title: t("steps.s2_title"),
      desc: t("steps.s2_desc"),
      active: activeStep >= 1,
    },
    {
      num: 3,
      title: t("steps.s3_title"),
      desc: t("steps.s3_desc"),
      active: activeStep >= 2,
    },
    {
      num: 4,
      title: t("steps.s4_title"),
      desc: t("steps.s4_desc"),
      active: activeStep >= 3,
    },
    {
      num: 5,
      title: t("steps.s5_title"),
      desc: t("steps.s5_desc"),
      active: activeStep >= 4,
    },
  ];

  const [isVisible, setIsVisible] = useState(false);
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats');
      return res.json();
    },
    refetchInterval: 10000
  });
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-warm-cream flex flex-col justify-between font-sans selection:bg-harvest-gold/20 select-none">
      {/* SECTION 1: TOP BAR */}
      <nav className="w-full bg-white border-b border-gray-200 py-4 px-6 md:px-12 flex items-center justify-between z-20">
        <span className="font-display font-bold text-lg md:text-xl tracking-widest uppercase text-soil-brown">
          MANDI MITRA
        </span>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </nav>

      {/* SECTION 2: HERO */}
      <section className="flex flex-col items-center justify-center text-center px-4 md:px-8 py-16 md:py-24 min-h-[80vh] max-w-6xl mx-auto w-full">
        {/* Eyebrow Line */}
        <div className="flex items-center gap-4 w-full max-w-2xl mb-6">
          <div className="flex-1 h-[1px] bg-gray-300" />
          <span className="font-sans text-xs md:text-sm font-semibold tracking-widest uppercase text-harvest-gold whitespace-nowrap transition-opacity duration-200">
            {t("eyebrow")}
          </span>
          <div className="flex-1 h-[1px] bg-gray-300" />
        </div>

        {/* Headlines */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-charcoal tracking-tight leading-none mt-2 transition-opacity duration-200">
          {t("headline1")}
          <br />
          <span className="text-soil-brown mt-1 block">{t("headline2")}</span>
        </h1>

        <p className="font-sans text-stone-500 text-base sm:text-lg max-w-2xl mt-6 leading-relaxed font-medium transition-opacity duration-200">
          {t("subheadline")}
        </p>

        {/* CTA Row */}
        <div className="mt-10 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6">
            <Link
              href="/login?role=farmer"
              className="inline-flex items-center justify-center border border-field-green text-field-green rounded-lg px-6 py-3 hover:bg-field-green/5 transition-colors font-sans font-semibold text-sm whitespace-nowrap"
            >
              I'm a Farmer
            </Link>
            <Link
              href="/login?role=admin"
              className="inline-flex items-center justify-center bg-charcoal text-white rounded-lg px-6 py-3 hover:bg-gray-800 transition-colors font-sans font-semibold text-sm whitespace-nowrap"
            >
              Admin Dashboard
            </Link>
            <Link
              href="/login?role=buyer"
              className="inline-flex items-center justify-center border border-harvest-gold text-harvest-gold rounded-lg px-6 py-3 hover:bg-harvest-gold/5 transition-colors font-sans font-semibold text-sm whitespace-nowrap"
            >
              I'm a Buyer
            </Link>
          </div>
          <div className="text-center">
            <Link
              href="/demo"
              className="font-sans text-sm text-gray-400 hover:text-charcoal underline font-semibold transition-colors"
            >
              Watch Demo Flow
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: LIVE METRICS BAR */}
      <section className="w-full bg-white border-y border-gray-200 py-8 px-4 z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {/* Metric 1 */}
          <div className="flex flex-col items-center justify-center pb-6 md:pb-0 md:px-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-display font-extrabold text-4xl text-charcoal">
                {stats?.activePoolsCount ?? 0}
              </span>
            </div>
            <span className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
              {t("stats_pools")}
            </span>
          </div>

          {/* Metric 2 */}
          <div className="flex flex-col items-center justify-center py-6 md:py-0 md:px-4">
            <span className="font-display font-extrabold text-4xl text-charcoal">
              {stats?.farmersCalledTodayCount ?? 0}
            </span>
            <span className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
              {t("stats_farmers")}
            </span>
          </div>

          {/* Metric 3 */}
          <div className="flex flex-col items-center justify-center pt-6 md:pt-0 md:px-4">
            <span className="font-display font-extrabold text-4xl text-charcoal">
              {stats?.settlementsCount ?? 0}
            </span>
            <span className="font-sans text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">
              {t("stats_settlements")}
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 4: PIPELINE */}
      <section ref={sectionRef} className="w-full max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-charcoal">
            How It Works
          </h2>
          <p className="font-sans text-sm text-gray-500 mt-2">
            Five steps. One phone call.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:flex items-start justify-between relative max-w-5xl mx-auto w-full px-4 z-0">
          {/* Horizontal Connecting Line */}
          <div className="absolute left-[8%] right-[8%] top-[20px] h-[1px] bg-gray-300 -z-10" />

          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="flex-1 flex flex-col items-center text-center transition-all duration-700 ease-out transform"
              style={{
                transitionDelay: `${idx * 150}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(24px)",
              }}
            >
              <div
                className={`w-10 h-10 rounded-full border-2 border-soil-brown flex items-center justify-center font-display font-bold text-sm shadow-sm transition-colors duration-300 ${
                  step.active
                    ? "bg-soil-brown text-white"
                    : "bg-white text-soil-brown"
                }`}
              >
                {step.num}
              </div>
              <h3 className="font-display font-semibold text-sm text-charcoal mt-3 transition-opacity duration-200">
                {step.title}
              </h3>
              <p className="font-sans text-[11px] text-gray-500 mt-2 leading-relaxed max-w-[130px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Stepper */}
        <div className="lg:hidden flex flex-col gap-8 relative max-w-md mx-auto w-full px-6 z-0">
          {/* Vertical Connecting Line */}
          <div className="absolute left-[39px] top-4 bottom-4 w-[1px] bg-gray-300 -z-10" />

          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="flex items-start gap-5 transition-all duration-700 ease-out transform"
              style={{
                transitionDelay: `${idx * 150}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(24px)",
              }}
            >
              <div
                className={`w-10 h-10 shrink-0 rounded-full border-2 border-soil-brown flex items-center justify-center font-display font-bold text-sm shadow-sm transition-colors duration-300 ${
                  step.active
                    ? "bg-soil-brown text-white"
                    : "bg-white text-soil-brown"
                }`}
              >
                {step.num}
              </div>
              <div className="pt-1.5">
                <h3 className="font-display font-semibold text-sm text-charcoal leading-none transition-opacity duration-200">
                  {step.title}
                </h3>
                <p className="font-sans text-xs text-gray-500 mt-2 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: TRUST INDICATORS */}
      <section className="w-full max-w-5xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
            <div>
              <div className="font-display font-bold text-3xl text-soil-brown">
                {t("trust1_stat")}
              </div>
              <div className="font-sans font-semibold text-sm text-charcoal mt-2">
                {t("trust1_label")}
              </div>
            </div>
            <p className="font-sans text-[11px] text-gray-500 mt-4 leading-relaxed">
              {t("trust1_sub")}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
            <div>
              <div className="font-display font-bold text-3xl text-soil-brown">
                {t("trust2_stat")}
              </div>
              <div className="font-sans font-semibold text-sm text-charcoal mt-2">
                {t("trust2_label")}
              </div>
            </div>
            <p className="font-sans text-[11px] text-gray-500 mt-4 leading-relaxed">
              Fully interactive speaking calls processed in native dialects
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
            <div>
              <div className="font-display font-bold text-3xl text-soil-brown">
                {t("trust3_stat")}
              </div>
              <div className="font-sans font-semibold text-sm text-charcoal mt-2">
                {t("trust3_label")}
              </div>
            </div>
            <p className="font-sans text-[11px] text-gray-500 mt-4 leading-relaxed">
              Immediate callbacks with verified wholesale auction prices
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM BAR */}
      <footer className="w-full border-t border-gray-200 py-6 text-center bg-white">
        <p className="font-sans text-[11px] text-gray-500 tracking-wide">
          Mandi Mitra &middot; Built for the Sarvam AI Track Hackathon &middot; Mandi = Market, Mitra = Friend
        </p>
      </footer>
    </div>
  );
}
