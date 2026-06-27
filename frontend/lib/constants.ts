export const CROPS = [
  "Tomatoes",
  "Onions",
  "Potatoes",
  "Chillies",
  "Brinjal",
] as const;

export const DISTRICTS = [
  "Kanchipuram",
  "Vellore",
  "Tiruvannamalai",
  "Chengalpattu",
  "Salem",
] as const;

export const LANGUAGES = {
  ta: "Tamil",
  te: "Telugu",
  hi: "Hindi",
  kn: "Kannada",
  mr: "Marathi",
  bn: "Bengali",
} as const;

export const STATUS_COLORS = {
  filling: "amber",
  auctioning: "blue",
  settled: "green",
  expired: "gray",
  closed: "rose", // fallback/red
} as const;
