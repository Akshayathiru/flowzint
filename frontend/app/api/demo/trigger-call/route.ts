import { NextResponse } from "next/server";

const VOICE_LAYER_URL = process.env.VOICE_LAYER_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const formData = new FormData();
    formData.append("phone_number", body.phone || "+919876540001");
    
    if (body.crop) formData.append("crop", body.crop);
    if (body.qtyKg) formData.append("quantity", String(body.qtyKg));
    if (body.language) formData.append("language", body.language);
    
    if (body.districtCode) {
      let locationName = "Kanchipuram";
      if (body.districtCode === "VEL") locationName = "Vellore";
      else if (body.districtCode === "SAL") locationName = "Salem";
      else if (body.districtCode === "CHE") locationName = "Chengalpattu";
      else if (body.districtCode === "TIR") locationName = "Tiruvannamalai";
      formData.append("location", locationName);
    }
    
    const dummyBlob = new Blob([Buffer.from("dummy audio content")], { type: "audio/wav" });
    formData.append("audio", dummyBlob, "audio.wav");

    const res = await fetch(`${VOICE_LAYER_URL}/inbound-call`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Voice Layer responded with ${res.status}: ${errText}`);
    }

    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Failed to proxy trigger-call to Voice Layer:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
