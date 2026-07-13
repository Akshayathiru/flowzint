export const cropTranslations: Record<string, Record<string, string>> = {
  en: {
    tomatoes: "Tomatoes",
    onions: "Onions",
    potatoes: "Potatoes",
    chillies: "Chillies",
    brinjal: "Brinjal",
    tomato: "Tomatoes",
    onion: "Onions",
    potato: "Potatoes",
    chilli: "Chillies",
  },
  hi: {
    tomatoes: "टमाटर",
    onions: "प्याज़",
    potatoes: "आलू",
    chillies: "मिर्च",
    brinjal: "बैंगन",
    tomato: "टमाटर",
    onion: "प्याज़",
    potato: "आलू",
    chilli: "मिर्च",
  },
  ta: {
    tomatoes: "தக்காளி",
    onions: "வெங்காயம்",
    potatoes: "உருளைக்கிழங்கு",
    chillies: "மிளகாய்",
    brinjal: "கத்தரிக்காய்",
    tomato: "தக்காளி",
    onion: "வெங்காயம்",
    potato: "உருளைக்கிழங்கு",
    chilli: "மிளகாய்",
  },
  te: {
    tomatoes: "టమోటాలు",
    onions: "ఉల్లిపాయలు",
    potatoes: "బంగాళాదుంపలు",
    chillies: "మిరపకాయలు",
    brinjal: "వంకాయలు",
    tomato: "టమోటాలు",
    onion: "ఉల్లిపాయలు",
    potato: "బంగాళాదుంపలు",
    chilli: "మిరపకాయలు",
  },
  kn: {
    tomatoes: "ಟೊಮೆಟೊ",
    onions: "ಈರುಳ್ಳಿ",
    potatoes: "ಆಲೂಗಡ್ಡೆ",
    chillies: "ಮೆಣಸಿನಕಾಯಿ",
    brinjal: "ಬದನೆಕಾಯಿ",
    tomato: "ಟೊಮೆಟೊ",
    onion: "ಈರುಳ್ಳಿ",
    potato: "ಆಲೂಗಡ್ಡೆ",
    chilli: "ಮೆಣಸಿನಕಾಯಿ",
  },
  mr: {
    tomatoes: "टोमॅटो",
    onions: "कांदा",
    potatoes: "बटाटा",
    chillies: "मिरची",
    brinjal: "वांगे",
    tomato: "टोमॅटो",
    onion: "कांदा",
    potato: "बटाटा",
    chilli: "मिरची",
  },
};

export const statusTranslations: Record<string, Record<string, string>> = {
  en: {
    filling: "Collecting",
    auctioning: "Bidding",
    settled: "Settled",
    expired: "Expired",
    closed: "Closed",
  },
  hi: {
    filling: "संग्रह",
    auctioning: "नीलामी",
    settled: "निपटाया गया",
    expired: "समाप्त",
    closed: "बंद",
  },
  ta: {
    filling: "சேகரிப்பு",
    auctioning: "ஏலம்",
    settled: "தீர்க்கப்பட்டது",
    expired: "காலாவதியானது",
    closed: "மூடப்பட்டது",
  },
  te: {
    filling: "సేకరణ",
    auctioning: "వేలం",
    settled: "పరిష్కరించబడింది",
    expired: "గడువు ముగిసింది",
    closed: "మూసివేయబడింది",
  },
  kn: {
    filling: "ಸಂಗ್ರಹಣೆ",
    auctioning: "ಹರಾಜು",
    settled: "ಇತ್ಯರ್ಥಗೊಂಡಿದೆ",
    expired: "ಅವಧಿ ಮುಗಿದಿದೆ",
    closed: "ಮುಚ್ಚಲಾಗಿದೆ",
  },
  mr: {
    filling: "संकलन",
    auctioning: "लिलाव",
    settled: "निकाली काढलेले",
    expired: "कालबाह्य",
    closed: "बंद",
  },
};

export const languageTranslations: Record<string, Record<string, string>> = {
  en: {
    en: "English",
    hi: "Hindi",
    ta: "Tamil",
    te: "Telugu",
    kn: "Kannada",
    mr: "Marathi",
    bn: "Bengali",
  },
  hi: {
    en: "अंग्रेजी",
    hi: "हिंदी",
    ta: "तमिल",
    te: "तेलुगु",
    kn: "कन्नड़",
    mr: "मराठी",
    bn: "बंगाली",
  },
  ta: {
    en: "ஆங்கிலம்",
    hi: "இந்தி",
    ta: "தமிழ்",
    te: "தெலுங்கு",
    kn: "கன்னடம்",
    mr: "மராத்தி",
    bn: "பெங்காலி",
  },
  te: {
    en: "ఇంగ్లీష్",
    hi: "హిందీ",
    ta: "తమిళం",
    te: "తెలుగు",
    kn: "కన్నడ",
    mr: "మరాఠీ",
    bn: "బెంగాలీ",
  },
  kn: {
    en: "ಇಂಗ್ಲಿಷ್",
    hi: "ಹಿದಿ",
    ta: "ತಮಿಳು",
    te: "ತೆಲುಗು",
    kn: "ಕನ್ನಡ",
    mr: "ಮರಾಠಿ",
    bn: "ಬೆಂಗಾಲಿ",
  },
  mr: {
    en: "इंग्रजी",
    hi: "हिंदी",
    ta: "तमिळ",
    te: "तेलगू",
    kn: "कन्नड",
    mr: "मराठी",
    bn: "बंगाली",
  },
};

export function localizeValue(
  category: "crops" | "status" | "languages",
  value: string,
  locale: string
): string {
  if (!value) return "";
  const key = value.toLowerCase().trim();
  const dict =
    category === "crops"
      ? cropTranslations
      : category === "status"
      ? statusTranslations
      : languageTranslations;

  const localeDict = dict[locale] || dict["en"];
  return localeDict[key] || value;
}
