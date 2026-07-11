import React, { useEffect, useState } from "react";

interface TrustScoreExplainerProps {
  phone?: string;
}

export default function TrustScoreExplainer({ phone }: TrustScoreExplainerProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!phone) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
    fetch(`${baseUrl}/farmers/${encodeURIComponent(phone)}/trust-score`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        console.error("Failed to load trust breakdown:", err);
        setError("Failed to load trust details.");
      })
      .finally(() => setIsLoading(false));
  }, [phone]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center font-sans text-xs text-gray-500">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
          <span>Loading trust details...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm text-center font-sans text-xs text-red-500">
        {error || "No data available"}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-colors">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
        <div>
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-1">
            Trust Score Profile
          </span>
          <h4 className="font-display font-bold text-lg text-charcoal">
            Score: {data.score} ({data.transaction_count} transactions)
          </h4>
        </div>
        <div className="shrink-0">
          <span className={`px-3 py-1 rounded-full text-xs font-bold font-sans ${
            data.score >= 80 ? "bg-green-100 text-green-800" :
            data.score >= 50 ? "bg-amber-100 text-amber-800" :
            "bg-red-100 text-red-800"
          }`}>
            {data.score >= 80 ? "High Trust" : data.score >= 50 ? "Medium Trust" : "Low Trust"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Quality Grades */}
        <div className="flex flex-col gap-2">
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Recorded Crop Quality Grades
          </span>
          {data.quality_grades && data.quality_grades.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-1">
              {data.quality_grades.map((grade: string, idx: number) => {
                const isA = grade.toUpperCase().startsWith("A") || ["5", "4"].includes(grade);
                const isC = grade.toUpperCase().startsWith("C") || ["1", "2"].includes(grade);
                return (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded font-bold font-mono text-xs uppercase ${
                      isA ? "bg-field-green/10 text-field-green" :
                      isC ? "bg-alert-red/10 text-alert-red" :
                      "bg-amber-100 text-amber-800"
                    }`}
                  >
                    Grade {grade}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="font-sans text-xs text-gray-400 italic">No quality grades recorded yet.</p>
          )}
        </div>

        {/* Recent Events */}
        <div className="flex flex-col gap-2">
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Recent Trust Events & Adjustments
          </span>
          {data.recent_events && data.recent_events.length > 0 ? (
            <ul className="list-disc pl-4 space-y-1.5 font-sans text-xs text-gray-655">
              {data.recent_events.map((event: string, idx: number) => (
                <li key={idx} className="leading-relaxed">
                  {event}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-xs text-gray-400 italic">No trust adjustments logged yet.</p>
          )}
        </div>
      </div>

      {/* Regulatory/Policy Callout Box */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mt-5">
        <p className="font-sans text-xs text-gray-500 leading-relaxed">
          Trust score affects pool weighting and buyer priorities. High trust score indicates consistent successful fulfillment and excellent produce quality.
        </p>
      </div>
    </div>
  );
}

