import json
import os

messages_dir = r"c:\Users\Admin\OneDrive\Desktop\flowzint-new\frontend\messages"

# 1. Translate keys for all 6 files
translations = {
    "en": {
        "farmerAnalytics": {
            "title": "My Earnings",
            "subtitle": "Track your earnings across all pools",
            "total_earnings": "Total Earnings",
            "from_pools": "from {count} pools",
            "earnings_chart": "Earnings Over Time",
            "your_price": "Your Price (₹/kg)",
            "mandi_rate": "Mandi Rate (₹/kg)",
            "premium_area": "Premium Earned",
            "no_settlements": "No settlements yet",
            "no_settlements_hint": "Settlements will appear here once your pools are auctioned",
            "pool": "Pool",
            "crop": "Crop",
            "date": "Date",
            "your_qty": "Your Qty",
            "price_per_kg": "Price/kg",
            "mandi_rate_col": "Mandi Rate",
            "premium": "Premium",
            "earnings": "Earnings",
            "error_title": "Could not load earnings data",
            "retry": "Retry"
        },
        "buyerAnalytics": {
            "title": "My Portfolio",
            "subtitle": "Your auction activity and performance",
            "total_bids": "Total Bids Placed",
            "auctions_won": "Auctions Won",
            "avg_price": "Avg Price Paid",
            "total_volume": "Total Volume",
            "bid_chart": "Bid History by Pool",
            "price_per_kg": "Price (₹/kg)",
            "no_bids": "No bids yet",
            "no_bids_hint": "Head to Live Auctions to place your first bid",
            "pool": "Pool",
            "crop": "Crop",
            "your_bid": "Your Bid",
            "status": "Status",
            "qty_won": "Qty Won",
            "date": "Date"
        },
        "sarvamShowcase": {
            "hero_title": "Powered by Sarvam AI",
            "hero_subtitle": "A farmer who can't read runs an entire marketplace transaction using only their voice.",
            "step1_title": "Farmer Calls",
            "step1_desc": "Saaras v2.5 listens in Tamil, Hindi, Telugu, Kannada, Marathi, or English",
            "step2_title": "AI Understands",
            "step2_desc": "Sarvam-2 LLM extracts crop, quantity, and location from natural speech",
            "step3_title": "Settlement Callback",
            "step3_desc": "Bulbul v3 calls the farmer back with the final price — in their own language",
            "comparison_title": "Why Voice-First?",
            "without_sarvam": "Without Sarvam",
            "with_sarvam": "With Sarvam",
            "compare_app": "Requires a smartphone app",
            "compare_app_alt": "One phone call — any phone",
            "compare_literacy": "Requires ability to read",
            "compare_literacy_alt": "Works in 6 Indian languages",
            "compare_form": "Manual form entry",
            "compare_form_alt": "AI understands natural speech",
            "compare_signup": "Registration and paperwork",
            "compare_signup_alt": "Phone number is the identity",
            "quote": "I don't have a smartphone. I can't read. But this works. My tomatoes sold for ₹17 per kilo — 25% more than the trader offered.",
            "quote_author": "Ravi Kumar, Kanchipuram",
            "tech_title": "The Sarvam Stack",
            "saaras_desc": "Speech-to-text in 6 Indian languages — Tamil, Hindi, Telugu, Kannada, Marathi, English",
            "sarvam2_desc": "Extracts structured data (crop, quantity, location) from natural voice conversations",
            "bulbul_desc": "Text-to-speech callbacks in the farmer's original language with verified price details",
            "cta": "Experience the Demo",
            "how_it_works": "How It Works",
            "one_call": "One phone call. Three AI steps. Zero literacy required."
        },
        "farmerNav": {
            "analytics": "My Earnings"
        },
        "buyerNav": {
            "analytics": "My Portfolio"
        },
        "landing": {
            "sarvam_link": "See how Sarvam AI powers Mandi Mitra →"
        }
    },
    "hi": {
        "farmerAnalytics": {
            "title": "मेरी कमाई",
            "subtitle": "सभी समूहों में अपनी कमाई को ट्रैक करें",
            "total_earnings": "कुल कमाई",
            "from_pools": "{count} समूहों से",
            "earnings_chart": "समय के साथ कमाई",
            "your_price": "आपका मूल्य (₹/किग्रा)",
            "mandi_rate": "मंडी दर (₹/किग्रा)",
            "premium_area": "अर्जित प्रीमियम",
            "no_settlements": "अभी तक कोई निपटान नहीं",
            "no_settlements_hint": "आपके समूहों की नीलामी होने के बाद भुगतान यहाँ दिखाई देंगे",
            "pool": "समूह",
            "crop": "फसल",
            "date": "तारीख",
            "your_qty": "आपकी मात्रा",
            "price_per_kg": "मूल्य/किग्रा",
            "mandi_rate_col": "मंडी दर",
            "premium": "प्रीमियम",
            "earnings": "कमाई",
            "error_title": "कमाई का डेटा लोड नहीं किया जा सका",
            "retry": "पुनः प्रयास"
        },
        "buyerAnalytics": {
            "title": "मेरा पोर्टफोलियो",
            "subtitle": "आपकी नीलामी गतिविधि और प्रदर्शन",
            "total_bids": "लगाई गई कुल बोलियां",
            "auctions_won": "जीती गई नीलामियां",
            "avg_price": "औसत भुगतान मूल्य",
            "total_volume": "कुल मात्रा",
            "bid_chart": "समूह द्वारा बोली का इतिहास",
            "price_per_kg": "मूल्य (₹/किग्रा)",
            "no_bids": "अभी तक कोई बोली नहीं",
            "no_bids_hint": "अपनी पहली बोली लगाने के लिए लाइव नीलामी पर जाएं",
            "pool": "समूह",
            "crop": "फसल",
            "your_bid": "आपकी बोली",
            "status": "स्थिति",
            "qty_won": "जीती गई मात्रा",
            "date": "तारीख"
        },
        "sarvamShowcase": {
            "hero_title": "Sarvam AI द्वारा संचालित",
            "hero_subtitle": "एक किसान जो पढ़ नहीं सकता, वह केवल अपनी आवाज़ का उपयोग करके संपूर्ण बाजार लेनदेन चलाता है।",
            "step1_title": "किसान की कॉल",
            "step1_desc": "Saaras v2.5 तमिल, हिंदी, तेलुगु, कन्नड़, मराठी या अंग्रेजी में सुनता है",
            "step2_title": "AI समझता है",
            "step2_desc": "Sarvam-2 LLM प्राकृतिक बातचीत से फसल, मात्रा और स्थान की जानकारी निकालता है",
            "step3_title": "निपटान कॉलबैक",
            "step3_desc": "Bulbul v3 किसान को उसकी अपनी भाषा में अंतिम मूल्य के साथ वापस कॉल करता है",
            "comparison_title": "आवाज़-प्रथम क्यों?",
            "without_sarvam": "Sarvam के बिना",
            "with_sarvam": "Sarvam के साथ",
            "compare_app": "स्मार्टफोन ऐप की आवश्यकता है",
            "compare_app_alt": "एक फोन कॉल — कोई भी फोन",
            "compare_literacy": "पढ़ने की क्षमता की आवश्यकता है",
            "compare_literacy_alt": "6 भारतीय भाषाओं में काम करता है",
            "compare_form": "मैनुअल फॉर्म प्रविष्टि",
            "compare_form_alt": "AI प्राकृतिक बातचीत को समझता है",
            "compare_signup": "पंजीकरण और कागजी कार्रवाई",
            "compare_signup_alt": "फोन नंबर ही पहचान है",
            "quote": "मेरे पास स्मार्टफोन नहीं है। मैं पढ़ नहीं सकता। लेकिन यह काम करता है। मेरे टमाटर ₹17 प्रति किलो बिके — व्यापारी द्वारा दिए गए मूल्य से 25% अधिक।",
            "quote_author": "रवि कुमार, कांचीपुरम",
            "tech_title": "Sarvam स्टैक",
            "saaras_desc": "6 भारतीय भाषाओं में स्पीच-टू-टेक्स्ट — तमिल, हिंदी, तेलुगु, कन्नड़, मराठी, अंग्रेजी",
            "sarvam2_desc": "प्राकृतिक बातचीत से संरचित डेटा (फसल, मात्रा, स्थान) निकालता है",
            "bulbul_desc": "सत्यापित मूल्य विवरण के साथ किसान की मूल भाषा में टेक्स्ट-टू-स्पीच कॉलबैक",
            "cta": "Demo का अनुभव करें",
            "how_it_works": "यह कैसे काम करता है",
            "one_call": "एक फोन कॉल। तीन AI चरण। शून्य साक्षरता की आवश्यकता।"
        },
        "farmerNav": {
            "analytics": "मेरी कमाई"
        },
        "buyerNav": {
            "analytics": "मेरा पोर्टफोलियो"
        },
        "landing": {
            "sarvam_link": "देखें कि कैसे Sarvam AI Mandi Mitra को संचालित करता है →"
        }
    },
    "ta": {
        "farmerAnalytics": {
            "title": "என் வருவாய்",
            "subtitle": "அனைத்து குழுக்களிலும் உங்கள் வருவாயைக் கண்காணிக்கவும்",
            "total_earnings": "மொத்த வருவாய்",
            "from_pools": "{count} குழுக்களில் இருந்து",
            "earnings_chart": "காலப்போக்கில் வருவாய்",
            "your_price": "உங்கள் விலை (₹/கிலோ)",
            "mandi_rate": "மண்டி விலை (₹/கிலோ)",
            "premium_area": "ஈட்டிய பிரீமியம்",
            "no_settlements": "இன்னும் கொடுப்பனவுகள் இல்லை",
            "no_settlements_hint": "உங்கள் குழுக்கள் ஏலம் விடப்பட்டதும் கொடுப்பனவுகள் இங்கே தோன்றும்",
            "pool": "குழு",
            "crop": "பயிர்",
            "date": "தேதி",
            "your_qty": "உங்களுடைய அளவு",
            "price_per_kg": "விலை/கிலோ",
            "mandi_rate_col": "மண்டி விலை",
            "premium": "பிரீமியம்",
            "earnings": "வருவாய்",
            "error_title": "வருவாய் தரவை ஏற்ற முடியவில்லை",
            "retry": "மீண்டும் முயற்சி"
        },
        "buyerAnalytics": {
            "title": "எனது போர்ட்ஃபோலியோ",
            "subtitle": "உங்கள் ஏல நடவடிக்கை மற்றும் செயல்திறன்",
            "total_bids": "அளிக்கப்பட்ட மொத்த ஏலங்கள்",
            "auctions_won": "வென்ற ஏலங்கள்",
            "avg_price": "சராசரி செலுத்திய விலை",
            "total_volume": "மொத்த அளவு",
            "bid_chart": "குழு வாரியாக ஏல வரலாறு",
            "price_per_kg": "விலை (₹/கிலோ)",
            "no_bids": "இன்னும் ஏலங்கள் இல்லை",
            "no_bids_hint": "உங்கள் முதல் ஏலத்தை வைக்க நேரடி ஏலங்களுக்குச் செல்லவும்",
            "pool": "குழு",
            "crop": "பயிர்",
            "your_bid": "உங்கள் ஏலம்",
            "status": "நிலை",
            "qty_won": "வென்ற அளவு",
            "date": "தேதி"
        },
        "sarvamShowcase": {
            "hero_title": "Sarvam AI மூலம் இயக்கப்படுகிறது",
            "hero_subtitle": "படிக்கத் தெரியாத ஒரு விவசாயி தன் குரலை மட்டுமே கொண்டு முழு சந்தை பரிவர்த்தனையையும் நடத்துகிறார்.",
            "step1_title": "விவசாயி அழைப்புகள்",
            "step1_desc": "Saaras v2.5 தமிழ், இந்தி, தெலுங்கு, கன்னடம், மராத்தி அல்லது ஆங்கிலத்தில் கேட்கிறது",
            "step2_title": "AI புரிந்து கொள்கிறது",
            "step2_desc": "Sarvam-2 LLM இயல்பான பேச்சிலிருந்து பயிர், அளவு மற்றும் இருப்பிடத்தை பிரித்தெடுக்கிறது",
            "step3_title": "கொடுப்பனவு அழைப்பு",
            "step3_desc": "Bulbul v3 இறுதி விலையுடன் விவசாயிக்கு அவர்களின் சொந்த மொழியில் மீண்டும் அழைக்கிறது",
            "comparison_title": "ஏன் குரல்-முதன்மையானது?",
            "without_sarvam": "Sarvam இல்லாமல்",
            "with_sarvam": "Sarvam உடன்",
            "compare_app": "ஸ்மார்ட்போன் செயலி தேவைப்படுகிறது",
            "compare_app_alt": "ஒரு தொலைபேசி அழைப்பு — எந்த தொலைபேசியும்",
            "compare_literacy": "படிக்கத் தெரிந்திருக்க வேண்டும்",
            "compare_literacy_alt": "6 இந்திய மொழிகளில் வேலை செய்கிறது",
            "compare_form": "கைமுறை படிவ உள்ளீடு",
            "compare_form_alt": "AI இயல்பான பேச்சை புரிந்து கொள்கிறது",
            "compare_signup": "பதிவு மற்றும் ஆவண வேலைகள்",
            "compare_signup_alt": "தொலைபேசி எண்தான் அடையாளம்",
            "quote": "என்னிடம் ஸ்மார்ட்போன் இல்லை. எனக்கு படிக்கத் தெரியாது. ஆனால் இது வேலை செய்கிறது. எனது தக்காளி கிலோ ₹17-க்கு விற்றது — வியாபாரி வழங்கியதை விட 25% அதிகம்.",
            "quote_author": "ரவி குமார், காஞ்சிபுரம்",
            "tech_title": "Sarvam அடுக்ககம்",
            "saaras_desc": "6 இந்திய மொழிகளில் பேச்சு-உரை — தமிழ், இந்தி, தெலுங்கு, கன்னடம், மராத்தி, ஆங்கிலம்",
            "sarvam2_desc": "இயல்பான குரல் உரையாடல்களில் இருந்து கட்டமைக்கப்பட்ட தரவை (பயிர், அளவு, இருப்பிடம்) பிரித்தெடுக்கிறது",
            "bulbul_desc": "சரிபார்க்கப்பட்ட விலை விவரங்களுடன் விவசாயியின் அசல் மொழியில் உரை-பேச்சு அழைப்புகள்",
            "cta": "Demo-வை அனுபவிக்கவும்",
            "how_it_works": "இது எப்படி வேலை செய்கிறது",
            "one_call": "ஒரு தொலைபேசி அழைப்பு. மூன்று AI படிகள். பூஜ்ஜிய கல்வியறிவு தேவை."
        },
        "farmerNav": {
            "analytics": "என் வருவாய்"
        },
        "buyerNav": {
            "analytics": "எனது போர்ட்ஃபோலியோ"
        },
        "landing": {
            "sarvam_link": "Sarvam AI எவ்வாறு Mandi Mitra-ஐ இயக்குகிறது என்று பாருங்கள் →"
        }
    },
    "te": {
        "farmerAnalytics": {
            "title": "నా ఆదాయం",
            "subtitle": "అన్ని సమూహాలలో మీ ఆదాయాన్ని ట్రాక్ చేయండి",
            "total_earnings": "మొత్తం ఆదాయం",
            "from_pools": "{count} సమూహాల నుండి",
            "earnings_chart": "కాలక్రమేణా ఆదాయం",
            "your_price": "మీ ధర (₹/కిలో)",
            "mandi_rate": "మండి ధర (₹/కిలో)",
            "premium_area": "ఆర్జించిన ప్రీమియం",
            "no_settlements": "ఇంకా ఎటువంటి చెల్లింపులు లేవు",
            "no_settlements_hint": "మీ సమూహాలు వేలం వేయబడిన తర్వాత చెల్లింపులు ఇక్కడ కనిపిస్తాయి",
            "pool": "సమూహం",
            "crop": "పంట",
            "date": "తేదీ",
            "your_qty": "మీ పరిమాణం",
            "price_per_kg": "ధర/కిలో",
            "mandi_rate_col": "మండి ధర",
            "premium": "ప్రీమియం",
            "earnings": "ఆదాయం",
            "error_title": "ఆదాయ డేటాను లోడ్ చేయలేకపోయాము",
            "retry": "మళ్లీ ప్రయత్నించండి"
        },
        "buyerAnalytics": {
            "title": "నా పోర్ట్‌ఫోలియో",
            "subtitle": "మీ వేలం కార్యాచరణ మరియు పనితీరు",
            "total_bids": "వేసిన మొత్తం బిడ్లు",
            "auctions_won": "గెలిచిన వేలాలు",
            "avg_price": "చెల్లించిన సగటు ధర",
            "total_volume": "మొత్తం పరిమాణం",
            "bid_chart": "సమూహం వారీగా బిడ్ చరిత్ర",
            "price_per_kg": "ధర (₹/కిలో)",
            "no_bids": "ఇంకా ఎటువంటి బిడ్లు లేవు",
            "no_bids_hint": "మీ మొదటి బిడ్ వేయడానికి ప్రత్యక్ష వేలానికి వెళ్లండి",
            "pool": "సమూహం",
            "crop": "పంట",
            "your_bid": "మీ బిడ్",
            "status": "స్థితి",
            "qty_won": "గెలిచిన పరిమాణం",
            "date": "తేదీ"
        },
        "sarvamShowcase": {
            "hero_title": "Sarvam AI ద్వారా నడుస్తుంది",
            "hero_subtitle": "చదువుకోలేని ఒక రైతు కేవలం తన వాయిస్‌ని ఉపయోగించి మార్కెట్ లావాదేవీని నిర్వహిస్తున్నాడు.",
            "step1_title": "రైతు కాల్స్",
            "step1_desc": "Saaras v2.5 తమిళం, హిందీ, తెలుగు, కన్నడ, మరాఠీ లేదా ఇంగ్లీషులో వింటుంది",
            "step2_title": "AI అర్థం చేసుకుంటుంది",
            "step2_desc": "Sarvam-2 LLM సహజ సంభాషణ నుండి పంట, పరిమాణం మరియు స్థానాన్ని సేకరిస్తుంది",
            "step3_title": "చెల్లింపు కాల్‌బ్యాక్",
            "step3_desc": "Bulbul v3 రైతుకు వారి స్వంత భాషలో తుది ధరతో తిరిగి కాల్ చేస్తుంది",
            "comparison_title": "వాయిస్-ఫస్ట్ ఎందుకు?",
            "without_sarvam": "Sarvam లేకుండా",
            "with_sarvam": "Sarvam తో",
            "compare_app": "స్మార్ట్‌ఫోన్ యాప్ అవసరం",
            "compare_app_alt": "ఒక ఫోన్ కాల్ — ఏదైనా ఫోన్",
            "compare_literacy": "చదివే సామర్థ్యం అవసరం",
            "compare_literacy_alt": "6 భారతీయ భాషలలో పనిచేస్తుంది",
            "compare_form": "మాన్యువల్ ఫారమ్ నమోదు",
            "compare_form_alt": "AI సహజ సంభాషణను అర్థం చేసుకుంటుంది",
            "compare_signup": "రిజిస్ట్రేషన్ మరియు కాగితపు పనులు",
            "compare_signup_alt": "ఫోన్ నంబరే గుర్తింపు",
            "quote": "నా దగ్గర స్మార్ట్‌ఫోన్ లేదు. నాకు చదవడం రాదు. కానీ ఇది పనిచేస్తుంది. నా టమాటాలు కిలో ₹17 చొప్పున అమ్ముడయ్యాయి — వ్యాపారి ఇచ్చిన దానికంటే 25% ఎక్కువ.",
            "quote_author": "రవి కుమార్, కాంచీపురం",
            "tech_title": "Sarvam స్టాక్",
            "saaras_desc": "6 భారతీయ భాషలలో స్పీచ్-టు-టెక్స్ట్ — తమిళం, హిందీ, తెలుగు, కన్నడ, మరాఠీ, ఇంగ్లీష్",
            "sarvam2_desc": "సహజ వాయిస్ సంభాషణల నుండి నిర్మాణాత్మక డేటా (పంట, పరిమాణం, స్థానం) సేకరిస్తుంది",
            "bulbul_desc": "ధృవీకరించబడిన ధర వివరాలతో రైతు యొక్క అసలు భాషలో టెక్స్ట్-టు-స్పీచ్ కాల్‌బ్యాక్‌లు",
            "cta": "Demo అనుభవించండి",
            "how_it_works": "ఇది ఎలా పనిచేస్తుంది",
            "one_call": "ఒక ఫోన్ కాల్. మూడు AI దశలు. సున్నా అక్షరాస్యత అవసరం."
        },
        "farmerNav": {
            "analytics": "నా ఆదాయం"
        },
        "buyerNav": {
            "analytics": "నా పోర్ట్‌ఫోలియో"
        },
        "landing": {
            "sarvam_link": "Sarvam AI Mandi Mitraను ఎలా నడుపుతుందో చూడండి →"
        }
    },
    "kn": {
        "farmerAnalytics": {
            "title": "ನನ್ನ ಆದಾಯ",
            "subtitle": "ಎಲ್ಲಾ ಗುಂಪುಗಳಲ್ಲಿ ನಿಮ್ಮ ಆದಾಯವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
            "total_earnings": "ಒಟ್ಟು ಆದಾಯ",
            "from_pools": "{count} ಗುಂಪುಗಳಿಂದ",
            "earnings_chart": "ಸಮಯದ ಆದಾಯದ ವಿವರ",
            "your_price": "ನಿಮ್ಮ ಬೆಲೆ (₹/ಕೆಜಿ)",
            "mandi_rate": "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ (₹/ಕೆಜಿ)",
            "premium_area": "ಗಳಿಸಿದ ಪ್ರೀಮಿಯಂ",
            "no_settlements": "ಇನ್ನೂ ಯಾವುದೇ ಪಾವತಿಗಳಿಲ್ಲ",
            "no_settlements_hint": "ನಿಮ್ಮ ಗುಂಪುಗಳು ಹರಾಜಾದ ನಂತರ ಪಾವತಿಗಳು ಇಲ್ಲಿ ಗೋಚರಿಸುತ್ತವೆ",
            "pool": "ಗುಂಪು",
            "crop": "ಬೆಳೆ",
            "date": "ದಿನಾಂಕ",
            "your_qty": "ನಿಮ್ಮ ಪ್ರಮಾಣ",
            "price_per_kg": "ಬೆಲೆ/ಕೆಜಿ",
            "mandi_rate_col": "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ",
            "premium": "ಪ್ರೀಮಿಯಂ",
            "earnings": "ಆದಾಯ",
            "error_title": "ಆದಾಯದ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ",
            "retry": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ"
        },
        "buyerAnalytics": {
            "title": "ನನ್ನ ಪೋರ್ಟ್ಫೋಲಿಯೋ",
            "subtitle": "ನಿಮ್ಮ ಹರಾಜು ಚಟುವಟಿಕೆ ಮತ್ತು ಕಾರ್ಯಕ್ಷಮತೆ",
            "total_bids": "ಒಟ್ಟು ಸಲ್ಲಿಸಿದ ಬಿಡ್ಗಳು",
            "auctions_won": "ಗೆದ್ದ ಹರಾಜುಗಳು",
            "avg_price": "ಪಾವತಿಸಿದ ಸರಾಸರಿ ಬೆಲೆ",
            "total_volume": "ಒಟ್ಟು ಪ್ರಮಾಣ",
            "bid_chart": "ಗುಂಪಿನ ಮೂಲಕ ಬಿಡ್ ಇತಿಹಾಸ",
            "price_per_kg": "ಬೆಲೆ (₹/ಕೆಜಿ)",
            "no_bids": "ಇನ್ನೂ ಯಾವುದೇ ಬಿಡ್ಗಳಿಲ್ಲ",
            "no_bids_hint": "ನಿಮ್ಮ ಮೊದಲ ಬಿಡ್ ಸಲ್ಲಿಸಲು ನೇರ ಹರಾಜಿಗೆ ಹೋಗಿ",
            "pool": "ಗುಂಪು",
            "crop": "ಬೆಳೆ",
            "your_bid": "ನಿಮ್ಮ ಬಿಡ್",
            "status": "ಸ್ಥಿತಿ",
            "qty_won": "ಗೆದ್ದ ಪ್ರಮಾಣ",
            "date": "ದಿನಾಂಕ"
        },
        "sarvamShowcase": {
            "hero_title": "Sarvam AI ಮೂಲಕ ಚಾಲಿತವಾಗಿದೆ",
            "hero_subtitle": "ಓದಲು ಬರೆಯಲು ತಿಳಿಯದ ರೈತನೊಬ್ಬ ಕೇವಲ ತನ್ನ ಧ್ವನಿಯ ಮೂಲಕ ಇಡೀ ಮಾರುಕಟ್ಟೆ ವಹಿವಾಟನ್ನು ನಡೆಸುತ್ತಾನೆ.",
            "step1_title": "ರೈತ ಕರೆ ಮಾಡುವುದು",
            "step1_desc": "Saaras v2.5 ತಮಿಳು, ಹಿಂದಿ, ತೆಲುಗು, ಕನ್ನಡ, ಮರಾಠಿ ಅಥವಾ ಇಂಗ್ಲಿಷ್ ಭಾಷೆಯಲ್ಲಿ ಕೇಳುತ್ತದೆ",
            "step2_title": "AI ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು",
            "step2_desc": "Sarvam-2 LLM ನೈಸರ್ಗಿಕ ಸಂಭಾಷಣೆಯಿಂದ ಬೆಳೆ, ಪ್ರಮಾಣ ಮತ್ತು ಸ್ಥಳವನ್ನು ಹೊರತೆಗೆಯುತ್ತದೆ",
            "step3_title": "ಪಾವತಿಯ ಕಾಲ್ಬ್ಯಾಕ್",
            "step3_desc": "Bulbul v3 ರೈತನಿಗೆ ಅವರದ್ದೇ ಭಾಷೆಯಲ್ಲಿ ಅಂತಿಮ ಬೆಲೆಯೊಂದಿಗೆ ಮರಳಿ ಕರೆ ಮಾಡುತ್ತದೆ",
            "comparison_title": "ಧ್ವನಿ-ಮೊದಲಿಗೆ ಏಕೆ?",
            "without_sarvam": "Sarvam ಇಲ್ಲದೆ",
            "with_sarvam": "Sarvam ನೊಂದಿಗೆ",
            "compare_app": "ಸ್ಮಾರ್ಟ್ಫೋನ್ ಅಪ್ಲಿಕೇಶನ್ ಅಗತ್ಯವಿದೆ",
            "compare_app_alt": "ಒಂದೇ ಒಂದು ಫೋನ್ ಕರೆ — ಯಾವುದೇ ಫೋನ್",
            "compare_literacy": "ಓದುವ ಸಾಮರ್ಥ್ಯದ ಅಗತ್ಯವಿದೆ",
            "compare_literacy_alt": "6 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
            "compare_form": "ಹಸ್ತಚಾಲಿತ ಫಾರ್ಮ್ ಪ್ರವೇಶ",
            "compare_form_alt": "AI ನೈಸರ್ಗಿಕ ಧ್ವನಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುತ್ತದೆ",
            "compare_signup": "ನೋಂದಣಿ ಮತ್ತು ಕಾಗದದ ಕೆಲಸ",
            "compare_signup_alt": "ಫೋನ್ ಸಂಖ್ಯೆಯೇ ಗುರುತು",
            "quote": "ನನ್ನ ಬಳಿ ಸ್ಮಾರ್ಟ್ಫೋನ್ ಇಲ್ಲ. ನನಗೆ ಓದಲು ಬರೆಯಲು ಬರುವುದಿಲ್ಲ. ಆದರೆ ಇದು ಕೆಲಸ ಮಾಡುತ್ತದೆ. ನನ್ನ ಟೊಮೆಟೊಗಳು ಕೆಜಿಗೆ ₹17 ರಂತೆ ಮಾರಾಟವಾದವು — ವ್ಯಾಪಾರಿ ನೀಡಿದ್ದಕ್ಕಿಂತ 25% ಹೆಚ್ಚು.",
            "quote_author": "ರವಿ ಕುಮಾರ್, ಕಾಂಚೀಪುರಂ",
            "tech_title": "Sarvam ಸ್ಟ್ಯಾಕ್",
            "saaras_desc": "6 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಸ್ಪೀಚ್-ಟು-ಟೆಕ್ಸ್ಟ್ — ತಮಿಳು, ಹಿಂದಿ, ತೆಲುಗು, ಕನ್ನಡ, ಮರಾಠಿ, ಇಂಗ್ಲಿಷ್",
            "sarvam2_desc": "ನೈಸರ್ಗಿಕ ಧ್ವನಿ ಸಂಭಾಷಣೆಗಳಿಂದ ರಚನಾತ್ಮಕ ಡೇಟಾವನ್ನು (ಬೆಳೆ, ಪ್ರಮಾಣ, ಸ್ಥಳ) ಹೊರತೆಗೆಯುತ್ತದೆ",
            "bulbul_desc": "ಖಚಿತಪಡಿಸಿದ ಬೆಲೆಯ ವಿವರಗಳೊಂದಿಗೆ ರೈತನ ಮೂಲ ಭಾಷೆಯಲ್ಲಿ ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್ ಕಾಲ್ಬ್ಯಾಕ್ಗಳು",
            "cta": "Demo ಅನುಭವಿಸಿ",
            "how_it_works": "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
            "one_call": "ಒಂದು ಫೋನ್ ಕರೆ. ಮೂರು AI ಹಂತಗಳು. ಶೂನ್ಯ ಸಾಕ್ಷರತೆಯ ಅಗತ್ಯವಿದೆ."
        },
        "farmerNav": {
            "analytics": "ನನ್ನ ಆದಾಯ"
        },
        "buyerNav": {
            "analytics": "ನನ್ನ ಪೋರ್ಟ್ಫೋಲಿಯೋ"
        },
        "landing": {
            "sarvam_link": "Sarvam AI ಹೇಗೆ Mandi Mitra ಅನ್ನು ನಡೆಸುತ್ತದೆ ಎಂದು ನೋಡಿ →"
        }
    },
    "mr": {
        "farmerAnalytics": {
            "title": "माझी कमाई",
            "subtitle": "सर्व समूहांमधील तुमच्या कमाईचा मागोवा घ्या",
            "total_earnings": "एकूण कमाई",
            "from_pools": "{count} समूहांमधून",
            "earnings_chart": "काळाच्या ओघात कमाई",
            "your_price": "तुमचा दर (₹/किग्रॅ)",
            "mandi_rate": "बाजार दर (₹/किग्रॅ)",
            "premium_area": "मिळालेला प्रीमियम",
            "no_settlements": "अद्याप कोणतेही व्यवहार नाहीत",
            "no_settlements_hint": "तुमच्या समूहांचा लिलाव झाल्यावर व्यवहार येथे दिसू लागतील",
            "pool": "समूह",
            "crop": "पीक",
            "date": "दिनांक",
            "your_qty": "तुमची मात्रा",
            "price_per_kg": "दर/किग्रॅ",
            "mandi_rate_col": "बाजार दर",
            "premium": "प्रीमियम",
            "earnings": "कमाई",
            "error_title": "कमाईचा डेटा लोड करता आला नाही",
            "retry": "पुन्हा प्रयत्न करा"
        },
        "buyerAnalytics": {
            "title": "माझे पोर्टफोलिओ",
            "subtitle": "तुमची लिलाव क्रियाकलाप आणि कामगिरी",
            "total_bids": "दिलेल्या एकूण बोली",
            "auctions_won": "जिंकलेले लिलाव",
            "avg_price": "दिलेला सरासरी दर",
            "total_volume": "एकूण मात्रा",
            "bid_chart": "समूहानुसार बोलीचा इतिहास",
            "price_per_kg": "किंमत (₹/किग्रॅ)",
            "no_bids": "अद्याप बोली नाही",
            "no_bids_hint": "पहिली बोली लावण्यासाठी थेट लिलावांवर जा",
            "pool": "समूह",
            "crop": "पीक",
            "your_bid": "तुमची बोली",
            "status": "स्थिती",
            "qty_won": "जिंकलेली मात्रा",
            "date": "दिनांक"
        },
        "sarvamShowcase": {
            "hero_title": "Sarvam AI द्वारे समर्थित",
            "hero_subtitle": "एक शेतकरी ज्याला वाचता येत नाही, तो फक्त स्वतःच्या आवाजाचा वापर करून संपूर्ण बाजार व्यवहार चालवतो.",
            "step1_title": "शेतकरी कॉल करतो",
            "step1_desc": "Saaras v2.5 तमिळ, हिंदी, तेलुगु, कन्नड, मराठी किंवा इंग्रजी भाषेत ऐकतो",
            "step2_title": "AI समजते",
            "step2_desc": "Sarvam-2 LLM नैसर्गिक संभाषणातून पीक, प्रमाण आणि ठिकाण शोधून काढतो",
            "step3_title": "व्यवहार कॉलबॅक",
            "step3_desc": "Bulbul v3 शेतकऱ्याला त्याच्या स्वतःच्या भाषेत अंतिम दरासह पुन्हा कॉल करतो",
            "comparison_title": "आवाज-प्रथम का?",
            "without_sarvam": "Sarvam शिवाय",
            "with_sarvam": "Sarvam सह",
            "compare_app": "स्मार्टफोन ॲपची आवश्यकता आहे",
            "compare_app_alt": "एक फोन कॉल — कोणताही फोन",
            "compare_literacy": "वाचण्याची क्षमता आवश्यक आहे",
            "compare_literacy_alt": "6 भारतीय भाषांमध्ये काम करते",
            "compare_form": "मॅन्युअल फॉर्म भरणे",
            "compare_form_alt": "AI नैसर्गिक संभाषण समजतो",
            "compare_signup": "नोंदणी आणि कागदपत्रे",
            "compare_signup_alt": "फोन नंबर हीच ओळख",
            "quote": "माझ्याकडे स्मार्टफोन नाही. मला वाचता येत नाही. पण हे काम करते. माझे टोमॅटो ₹17 प्रति किलो विकले गेले — व्यापाऱ्याने दिलेल्या दरापेक्षा 25% जास्त.",
            "quote_author": "रवी कुमार, कांचीपुरम",
            "tech_title": "Sarvam स्टॅक",
            "saaras_desc": "6 भारतीय भाषांमध्ये स्पीच-टू-टेक्स्ट — तमिळ, हिंदी, तेलुगु, कन्नड, मराठी, इंग्रजी",
            "sarvam2_desc": "नैसर्गिक आवाज संभाषणांमधून संरचित डेटा (पीक, प्रमाण, ठिकाण) काढतो",
            "bulbul_desc": "सत्यापित दराच्या तपशीलांसह शेतकऱ्याच्या मूळ भाषेत टेक्स्ट-टू-स्पीच कॉलबॅक",
            "cta": "Demo चा अनुभव घ्या",
            "how_it_works": "हे कसे काम करते",
            "one_call": "एक फोन कॉल. तीन AI पायऱ्या. शून्य साक्षरतेची आवश्यकता."
        },
        "farmerNav": {
            "analytics": "माझी कमाई"
        },
        "buyerNav": {
            "analytics": "माझे पोर्टफोलिओ"
        },
        "landing": {
            "sarvam_link": "Sarvam AI कसे Mandi Mitra चालवते ते पहा →"
        }
    }
}

for lang in translations:
    file_path = os.path.join(messages_dir, f"{lang}.json")
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Inject namespaces
        for ns, values in translations[lang].items():
            if isinstance(values, dict):
                if ns not in data:
                    data[ns] = {}
                for key, val in values.items():
                    data[ns][key] = val
            else:
                data[ns] = values
                
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Successfully updated translation file: {lang}.json")

print("All translations updated successfully!")
