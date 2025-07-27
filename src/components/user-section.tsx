import EcgUpload_1lead from "@/components/ecg-upload-1lead"
import Ecg1leadDashboard from "@/components/ecg-1lead-dashboard"
import { useState } from "react"

interface AnalysisResult {
    label: number
    probability: number
    ecg_signal: {
        "Time (s)": number
        "Voltage (mV)": number
    }[]
    heatmap: string;  // ✅ Grad-CAM 히트맵 (Base64)
    feature_importance: {
        "image": number,
        "signal": number,
        "crf": number,
        "wt": number,
        "age": number
    };
    gpt_result?: {
        "RR 간격": string,
        "QRS 파형": string,
        "T파": string,
        "P파": string,
        "임상 권고": string
    }
}

export function UserSection() {
    const [result, setResult] = useState<AnalysisResult | null>(null)

    return (
        <div className="w-full h-full flex items-center justify-center">
            {result ? (
                <Ecg1leadDashboard result={result} />
            ) : (
                <EcgUpload_1lead onUploadSuccess={setResult} />
            )}
            {/*<Ecg1leadDashboard result={tempResult} />*/}
        </div>
    )
}

