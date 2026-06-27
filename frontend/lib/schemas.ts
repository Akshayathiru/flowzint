import { z } from "zod";

export const BuyerSchema = z.object({
  name: z.string().min(3, "Business name must be at least 3 characters"),
  phone: z
    .string()
    .regex(/^\+91[0-9]{10}$/, "Format: +91 followed by 10 digits"),
  districts: z.array(z.string()).min(1, "Select at least one district"),
  crops: z
    .array(
      z.object({
        name: z.string(),
        minQtyKg: z.number().min(50, "Minimum 50kg"),
      })
    )
    .min(1, "Select at least one crop"),
  preferredHours: z.object({
    start: z.string(),
    end: z.string(),
  }),
});
export type BuyerFormData = z.infer<typeof BuyerSchema>;

export const DemoTriggerCallSchema = z.object({
  phone: z.string().regex(/^\+91[0-9]{10}$/),
  crop: z.string().min(1),
  qtyKg: z.number().min(1).max(10000),
  language: z.enum(["ta", "te", "hi", "kn", "mr", "bn", "ml"]),
  districtCode: z.string().min(1),
});
export type DemoTriggerCallData = z.infer<typeof DemoTriggerCallSchema>;

export const DemoInjectBidSchema = z.object({
  poolId: z.string().min(1),
  buyerName: z.string().min(1),
  pricePerKg: z.number().min(1).max(9999),
});
export type DemoInjectBidData = z.infer<typeof DemoInjectBidSchema>;

export const CatchmentZoneSchema = z.object({
  name: z.string().min(2),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusKm: z.number().min(1).max(100),
});
export type CatchmentZoneData = z.infer<typeof CatchmentZoneSchema>;

export const AdminThresholdsSchema = z.object({
  maxWindowMinutes: z.number().min(10).max(480),
  geoRadiusKm: z.number().min(1).max(100),
  minLotTomatoes: z.number().min(50),
  minLotOnions: z.number().min(50),
  minLotDefault: z.number().min(50),
});
export type AdminThresholdsData = z.infer<typeof AdminThresholdsSchema>;
