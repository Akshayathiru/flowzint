"use client";

import React from "react";
import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { Phone, Brain, CheckCircle } from "lucide-react";

export default function SarvamShowcasePage() {
  const t = useTranslations("sarvamShowcase");

  return (
    <div className="min-h-screen bg-[#FBF7F0] w-full text-charcoal font-sans">
      {/* SECTION 1: HERO */}
      <section className="text-center py-16 px-6 max-w-3xl mx-auto flex flex-col items-center">
        <span
          className="text-xs font-semibold uppercase tracking-widest text-[#6B4226] mb-3"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          MANDI MITRA
        </span>
        <h1
          className="text-4xl sm:text-5xl font-extrabold text-charcoal leading-tight"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          {t("hero_title")}
        </h1>
        <p className="text-base sm:text-lg text-gray-500 mt-5 max-w-xl leading-relaxed">
          {t("hero_subtitle")}
        </p>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2
          className="text-2xl sm:text-3xl font-bold text-center text-charcoal mb-2"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          {t("how_it_works")}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-12 font-sans">
          {t("one_call")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-stretch">
          {/* Step 1 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm relative flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-full bg-field-green/10 text-field-green flex items-center justify-center mx-auto mb-6">
                <Phone className="w-6 h-6" />
              </div>
              <h3
                className="text-lg font-bold text-charcoal"
                style={{ fontFamily: "Mukta, sans-serif" }}
              >
                {t("step1_title")}
              </h3>
              <p className="text-sm text-gray-500 mt-3 font-sans leading-relaxed">
                {t("step1_desc")}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm relative flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-full bg-harvest-gold/10 text-harvest-gold flex items-center justify-center mx-auto mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3
                className="text-lg font-bold text-charcoal"
                style={{ fontFamily: "Mukta, sans-serif" }}
              >
                {t("step2_title")}
              </h3>
              <p className="text-sm text-gray-500 mt-3 font-sans leading-relaxed">
                {t("step2_desc")}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm relative flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="w-12 h-12 rounded-full bg-sky-blue/10 text-sky-blue flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3
                className="text-lg font-bold text-charcoal"
                style={{ fontFamily: "Mukta, sans-serif" }}
              >
                {t("step3_title")}
              </h3>
              <p className="text-sm text-gray-500 mt-3 font-sans leading-relaxed">
                {t("step3_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: COMPARISON TABLE */}
      <section className="py-16 px-6 bg-white border-y border-gray-150">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center text-charcoal mb-8"
            style={{ fontFamily: "Mukta, sans-serif" }}
          >
            {t("comparison_title")}
          </h2>

          <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="px-6 py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                      Feature
                    </th>
                    <th className="px-6 py-4 font-semibold text-gray-500 bg-red-50/20">
                      {t("without_sarvam")}
                    </th>
                    <th className="px-6 py-4 font-semibold text-[#2D6A4F] bg-field-green/5">
                      {t("with_sarvam")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-charcoal">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-600">Access Point</td>
                    <td className="px-6 py-4 text-alert-red font-semibold bg-red-50/20">
                      ✗ {t("compare_app")}
                    </td>
                    <td className="px-6 py-4 text-field-green font-bold bg-field-green/5">
                      ✓ {t("compare_app_alt")}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-600">Literacy Requirements</td>
                    <td className="px-6 py-4 text-alert-red font-semibold bg-red-50/20">
                      ✗ {t("compare_literacy")}
                    </td>
                    <td className="px-6 py-4 text-field-green font-bold bg-field-green/5">
                      ✓ {t("compare_literacy_alt")}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-600">Interface Type</td>
                    <td className="px-6 py-4 text-alert-red font-semibold bg-red-50/20">
                      ✗ {t("compare_form")}
                    </td>
                    <td className="px-6 py-4 text-field-green font-bold bg-field-green/5">
                      ✓ {t("compare_form_alt")}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-600">Onboarding identity</td>
                    <td className="px-6 py-4 text-alert-red font-semibold bg-red-50/20">
                      ✗ {t("compare_signup")}
                    </td>
                    <td className="px-6 py-4 text-field-green font-bold bg-field-green/5">
                      ✓ {t("compare_signup_alt")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FARMER QUOTE */}
      <section className="py-16 px-6 max-w-2xl mx-auto text-center">
        <span
          className="text-6xl text-harvest-gold/30 font-serif leading-none block select-none mb-2"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          &ldquo;
        </span>
        <blockquote className="text-lg sm:text-xl text-charcoal font-medium italic leading-relaxed">
          {t("quote")}
        </blockquote>
        <cite className="block text-sm text-gray-500 font-sans mt-4 font-semibold not-italic">
          &mdash; {t("quote_author")}
        </cite>
      </section>

      {/* SECTION 5: TECH STACK */}
      <section className="py-16 px-6 bg-white border-t border-gray-150">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-bold text-center text-charcoal mb-10"
            style={{ fontFamily: "Mukta, sans-serif" }}
          >
            {t("tech_title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans">
                Speech-to-Text
              </span>
              <h3
                className="text-lg font-bold text-field-green mt-1 mb-3"
                style={{ fontFamily: "Mukta, sans-serif" }}
              >
                Saaras v2.5
              </h3>
              <p className="text-sm text-gray-500 font-sans leading-relaxed">
                {t("saaras_desc")}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans">
                Language Understanding
              </span>
              <h3
                className="text-lg font-bold text-harvest-gold mt-1 mb-3"
                style={{ fontFamily: "Mukta, sans-serif" }}
              >
                Sarvam-2 LLM
              </h3>
              <p className="text-sm text-gray-500 font-sans leading-relaxed">
                {t("sarvam2_desc")}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-sans">
                Text-to-Speech
              </span>
              <h3
                className="text-lg font-bold text-sky-blue mt-1 mb-3"
                style={{ fontFamily: "Mukta, sans-serif" }}
              >
                Bulbul v3
              </h3>
              <p className="text-sm text-gray-500 font-sans leading-relaxed">
                {t("bulbul_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA */}
      <section className="py-20 px-6 text-center max-w-xl mx-auto flex flex-col items-center">
        <Link
          href="/login?role=farmer"
          className="inline-flex items-center justify-center bg-charcoal text-white rounded-lg px-8 py-4 font-bold text-lg hover:brightness-90 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 min-h-[44px]"
          style={{ fontFamily: "Mukta, sans-serif" }}
        >
          {t("cta")}
        </Link>
      </section>
    </div>
  );
}
