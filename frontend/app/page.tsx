"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";

const steps = [
  {
    num: 1,
    title: "Farmer Calls In",
    desc: "Speaks crop, quantity, location in their language",
    active: true,
  },
  {
    num: 2,
    title: "Pool Forms",
    desc: "Geo-bounded lot aggregated by crop type",
    active: true,
  },
  {
    num: 3,
    title: "Buyer Auction",
    desc: "Registered wholesalers called for live bids",
    active: false,
  },
  {
    num: 4,
    title: "Farmer Callback",
    desc: "Price confirmed, consent recorded",
    active: false,
  },
  {
    num: 5,
    title: "Settlement",
    desc: "SMS receipt issued to every farmer",
    active: false,
  },
];

export default function Home() {
  const [lang, setLang] = useState<"en" | "hi" | "ta" | "kn">("en");

  const t = {
    en: {
      eyebrow: "AI-Orchestrated Flash Bargaining Network",
      line1: "FPO-level bargaining power.",
      line2: "One call. Ninety minutes.",
      sub: "Smallholder farmers call in their crop and quantity. Our system pools them, auctions the lot to registered bulk buyers, and calls every farmer back with a verified price — all without an app, a membership, or literacy.",
      cta: "Open Operator Dashboard",
      demo: "Watch Demo Flow",
      step1: "Farmer Calls In",
      step2: "Pool Forms",
      step3: "Buyer Auction",
      step4: "Farmer Callback",
      step5: "Settlement",
    },
    hi: {
      eyebrow: "AI-संचालित फ्लैश बार्गेनिंग नेटवर्क",
      line1: "एफपीओ-स्तरीय मोलभाव की शक्ति।",
      line2: "एक कॉल। नब्बे मिनट।",
      sub: "किसान अपनी फसल और मात्रा बताने के लिए कॉल करते हैं। हमारा सिस्टम उन्हें पूल करता है, थोक खरीदारों को नीलामी करता है, और हर किसान को सत्यापित मूल्य के साथ वापस कॉल करता है।",
      cta: "डैशबोर्ड खोलें",
      demo: "डेमो देखें",
      step1: "किसान कॉल करे",
      step2: "पूल बने",
      step3: "खरीदार नीलामी",
      step4: "किसान को कॉलबैक",
      step5: "निपटान",
    },
    ta: {
      eyebrow: "AI-ஒருங்கிணைந்த ஃபிளாஷ் பேரம் நெட்வொர்க்",
      line1: "FPO-நிலை பேரம் பேசும் சக்தி.",
      line2: "ஒரு அழைப்பு. தொண்ணூறு நிமிடங்கள்.",
      sub: "சிறு விவசாயிகள் தங்கள் பயிர் மற்றும் அளவை தெரிவிக்க அழைக்கிறார்கள். எங்கள் அமைப்பு அவர்களை தொகுத்து, மொத்த வாங்குபவர்களுக்கு ஏலம் விட்டு, ஒவ்வொரு விவசாயிக்கும் உறுதிப்படுத்தப்பட்ட விலையுடன் திரும்ப அழைக்கிறது.",
      cta: "டாஷ்போர்டு திற",
      demo: "டெமோ பார்",
      step1: "விவசாயி அழைக்கிறார்",
      step2: "குழு உருவாகிறது",
      step3: "வாங்குபவர் ஏலம்",
      step4: "விவசாயிக்கு திரும்ப அழைப்பு",
      step5: "தீர்வு",
    },
    kn: {
      eyebrow: "AI-ಸಂಘಟಿತ ಫ್ಲ್ಯಾಶ್ ಚೌಕಾಸಿ ನೆಟ್ವರ್ಕ್",
      line1: "FPO-ಮಟ್ಟದ ಚೌಕಾಸಿ ಶಕ್ತಿ.",
      line2: "ಒಂದು ಕರೆ. ತೊಂಬತ್ತು ನಿಮಿಷ.",
      sub: "ಸಣ್ಣ ರೈತರು ತಮ್ಮ ಬೆಳೆ ಮತ್ತು ಪ್ರಮಾಣವನ್ನು ತಿಳಿಸಲು ಕರೆ ಮಾಡುತ್ತಾರೆ. ನಮ್ಮ ವ್ಯವಸ್ಥೆ ಅವರನ್ನು ಒಟ್ಟುಗೂಡಿಸಿ, ಸಗಟು ಖರೀದಿದಾರರಿಗೆ ಹರಾಜು ಮಾಡಿ, ಪ್ರತಿ ರೈತರಿಗೆ ದೃಢೀಕರಿಸಿದ ಬೆಲೆಯೊಂದಿಗೆ ಮರಳಿ ಕರೆ ಮಾಡುತ್ತದೆ.",
      cta: "ಡ್ಯಾಶ್ಬೋರ್ಡ್ ತೆರೆಯಿರಿ",
      demo: "ಡೆಮೋ ನೋಡಿ",
      step1: "ರೈತ ಕರೆ ಮಾಡುತ್ತಾರೆ",
      step2: "ಪೂಲ್ ರಚನೆ",
      step3: "ಖರೀದಿದಾರ ಹರಾಜು",
      step4: "ರೈತರಿಗೆ ಮರಳಿ ಕರೆ",
      step5: "ಇತ್ಯರ್ಥ",
    },
  };

  const getStepTitle = (num: number) => {
    switch (num) {
      case 1:
        return t[lang].step1;
      case 2:
        return t[lang].step2;
      case 3:
        return t[lang].step3;
      case 4:
        return t[lang].step4;
      case 5:
        return t[lang].step5;
      default:
        return "";
    }
  };

  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    activePoolsCount: 3,
    farmersCalledTodayCount: 47,
    settlementsCount: 128,
    avgPricePremiumPct: 18,
    liveBuyerCallsCount: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch live statistics
    fetch("/api/stats")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

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
          <button
            onClick={() => setLang("en")}
            className={`border rounded-md px-2.5 py-0.5 text-xs font-semibold font-sans cursor-pointer transition-colors ${
              lang === "en"
                ? "bg-soil-brown text-white border-soil-brown"
                : "border-gray-300 text-gray-500 hover:bg-gray-50 bg-white"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("hi")}
            className={`border rounded-md px-2.5 py-0.5 text-xs font-semibold font-sans cursor-pointer transition-colors ${
              lang === "hi"
                ? "bg-soil-brown text-white border-soil-brown"
                : "border-gray-300 text-gray-500 hover:bg-gray-50 bg-white"
            }`}
          >
            नमस्ते
          </button>
          <button
            onClick={() => setLang("ta")}
            className={`border rounded-md px-2.5 py-0.5 text-xs font-semibold font-sans cursor-pointer transition-colors ${
              lang === "ta"
                ? "bg-soil-brown text-white border-soil-brown"
                : "border-gray-300 text-gray-500 hover:bg-gray-50 bg-white"
            }`}
          >
            வணக்கம்
          </button>
          <button
            onClick={() => setLang("kn")}
            className={`border rounded-md px-2.5 py-0.5 text-xs font-semibold font-sans cursor-pointer transition-colors ${
              lang === "kn"
                ? "bg-soil-brown text-white border-soil-brown"
                : "border-gray-300 text-gray-500 hover:bg-gray-50 bg-white"
            }`}
          >
            ಹಲೋ
          </button>
        </div>
      </nav>

      {/* SECTION 2: HERO */}
      <section className="flex flex-col items-center justify-center text-center px-4 md:px-8 py-16 md:py-24 min-h-[80vh] max-w-6xl mx-auto w-full">
        {/* Eyebrow Line */}
        <div className="flex items-center gap-4 w-full max-w-2xl mb-6">
          <div className="flex-1 h-[1px] bg-gray-300" />
          <span className="font-sans text-xs md:text-sm font-semibold tracking-widest uppercase text-harvest-gold whitespace-nowrap transition-opacity duration-200">
            {t[lang].eyebrow}
          </span>
          <div className="flex-1 h-[1px] bg-gray-300" />
        </div>

        {/* Headlines */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-charcoal tracking-tight leading-none mt-2 transition-opacity duration-200">
          {t[lang].line1}
          <br />
          <span className="text-soil-brown mt-1 block">{t[lang].line2}</span>
        </h1>

        <p className="font-sans text-stone-500 text-base sm:text-lg max-w-2xl mt-6 leading-relaxed font-medium transition-opacity duration-200">
          {t[lang].sub}
        </p>

        {/* CTA Row */}
        <div className="flex items-center gap-4 justify-center mt-10 flex-wrap">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-charcoal text-white px-6 py-3 rounded-lg font-sans font-medium text-sm hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            {t[lang].cta}
            <ArrowRight size={14} strokeWidth={2} />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-600 px-6 py-3 rounded-lg font-sans font-medium text-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            {t[lang].demo}
          </Link>
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
                {stats.activePoolsCount}
              </span>
            </div>
            <span className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
              Active Pools Right Now
            </span>
          </div>

          {/* Metric 2 */}
          <div className="flex flex-col items-center justify-center py-6 md:py-0 md:px-4">
            <span className="font-display font-extrabold text-4xl text-charcoal">
              {stats.farmersCalledTodayCount}
            </span>
            <span className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
              Farmers Called In Today
            </span>
          </div>

          {/* Metric 3 */}
          <div className="flex flex-col items-center justify-center pt-6 md:pt-0 md:px-4">
            <span className="font-display font-extrabold text-4xl text-charcoal">
              {stats.settlementsCount}
            </span>
            <span className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mt-2">
              Settlements This Week
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
          <p className="font-sans text-sm text-gray-400 mt-2">
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
                {getStepTitle(step.num)}
              </h3>
              <p className="font-sans text-[11px] text-gray-400 mt-2 leading-relaxed max-w-[130px]">
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
                  {getStepTitle(step.num)}
                </h3>
                <p className="font-sans text-xs text-gray-400 mt-2 leading-relaxed">
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
                ₹0
              </div>
              <div className="font-sans font-semibold text-sm text-charcoal mt-2">
                Zero platform fee for farmers
              </div>
            </div>
            <p className="font-sans text-[11px] text-gray-400 mt-4 leading-relaxed">
              Revenue comes from verified buyer subscriptions
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
            <div>
              <div className="font-display font-bold text-3xl text-soil-brown">
                6 Languages
              </div>
              <div className="font-sans font-semibold text-sm text-charcoal mt-2">
                Tamil, Telugu, Hindi, Kannada, Marathi, Bengali
              </div>
            </div>
            <p className="font-sans text-[11px] text-gray-400 mt-4 leading-relaxed">
              Fully interactive speaking calls processed in native dialects
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors">
            <div>
              <div className="font-display font-bold text-3xl text-soil-brown">
                &lt; 90 min
              </div>
              <div className="font-sans font-semibold text-sm text-charcoal mt-2">
                From first call to confirmed deal
              </div>
            </div>
            <p className="font-sans text-[11px] text-gray-400 mt-4 leading-relaxed">
              Immediate callbacks with verified wholesale auction prices
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM BAR */}
      <footer className="w-full border-t border-gray-200 py-6 text-center bg-white">
        <p className="font-sans text-[11px] text-gray-400 tracking-wide">
          Mandi Mitra &middot; Built for the Sarvam AI Track Hackathon &middot; Mandi = Market, Mitra = Friend
        </p>
      </footer>
    </div>
  );
}
