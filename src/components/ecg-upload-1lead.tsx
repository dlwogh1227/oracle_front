import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Loader2 } from "lucide-react"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"

interface AnalysisResult {
    label: number
    probability: number
    ecg_signal: {
        "Time (s)": number
        "Voltage (mV)": number
    }[]
    heatmap: string
    feature_importance: {
        image: number,
        signal: number,
        crf: number,
        wt: number,
        age: number,
        "sbp"?: number,
        "dbp"?: number
    };
    gpt_result?: {
        "RR 간격": string,
        "QRS 파형": string,
        "T파": string,
        "P파": string,
        "임상 권고": string
    };
    pwv_shap_prob?: number[]
    pwv_shap_report?: string
    pwv_shap_img_base64?: string
}

interface EcgUploadProps {
    onUploadSuccess?: (result: AnalysisResult) => void
}

export default function EcgUpload1lead({ onUploadSuccess }: EcgUploadProps) {
    const [loading, setLoading] = useState(false)
    const [uploadMessage, setUploadMessage] = useState("")
    const [ecgImage, setEcgImage] = useState<File | null>(null)
    const [checkupImage, setCheckupImage] = useState<File | null>(null)

    const questionnaireFields = [
        { key: "age", label: "나이 (세)", type: "number", placeholder: "예: 45" },
        { key: "height", label: "키 (cm)", type: "number", placeholder: "예: 170" },
        { key: "weight", label: "체중 (kg)", type: "number", placeholder: "예: 60" },
        { key: "gender", label: "성별", type: "radio", options: ["0", "1"] },
        { key: "hx_stroke", label: "뇌졸중 과거력", type: "checkbox" , value: "뇌졸중"},
        { key: "hx_mi", label: "심근경색 과거력", type: "checkbox", value: "심근경색"},
        { key: "hx_htn", label: "고혈압 과거력", type: "checkbox", value: "고혈압" },
        { key: "hx_dm", label: "당뇨병 과거력", type: "checkbox", value: "당뇨병" },
        { key: "hx_dysli", label: "이상지질혈증 과거력", type: "checkbox", value: "이상지질혈증" },
        { key: "hx_athero", label: "중상경화증 과거력", type: "checkbox", value: "중상경화증" },
        { key: "fhx_stroke", label: "뇌졸증 가족력", type: "checkbox", value: "뇌졸중" },
        { key: "fhx_mi", label: "심근경색 가족력", type: "checkbox", value: "심근경색" },
        { key: "fhx_htn", label: "고혈압 가족력", type: "checkbox", value: "고혈압" },
        { key: "fhx_dm", label: "당뇨병 가족력", type: "checkbox", value: "당뇨병" },
        { key: "smoke", label: "흡연 여부", type: "radio", options: ["0", "1", "2"] },
        { key: "alcohol", label: "음주 여부", type: "radio", options: ["0", "1"] },
        { key: "phy_act", label: "운동 여부", type: "radio", options: ["0", "1", "2", "3"] }
    ]

    const labelMap: Record<string, Record<string, string>> = {
        gender: { "0": "남", "1": "여" },
        smoke: { "0": "무", "1": "과거", "2": "현재" },
        alcohol: { "0": "무", "1": "유" },
        phy_act: { "0": "무", "1": "저강도", "2": "중강도", "3": "고강도" }
    }

    const [questionnaire, setQuestionnaire] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {}
        for (const field of questionnaireFields) {
            if (field.type === "radio") {
                initial[field.key] = field.options?.[0] || ""
            } else if (field.type === "checkbox") {
                initial[field.key] = ""
            } else {
                initial[field.key] = ""
            }
        }
        return initial
    })

    const handleInputChange = (key: string, value: string) => {
        setQuestionnaire(prev => ({ ...prev, [key]: value }))
    }

    const hasMissingFields = () => {
        return questionnaireFields.some(field =>
            field.type !== "checkbox" && !questionnaire[field.key]?.trim()
        )
    }

    const handleEcgDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) setEcgImage(acceptedFiles[0])
    }, [])

    const handleCheckupDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) setCheckupImage(acceptedFiles[0])
    }, [])

    const { getRootProps: getEcgRootProps, getInputProps: getEcgInputProps, isDragActive: isEcgDragActive } = useDropzone({
        onDrop: handleEcgDrop,
        accept: { "image/jpeg": [], "image/png": [] },
        multiple: false,
    })

    const { getRootProps: getCheckupRootProps, getInputProps: getCheckupInputProps, isDragActive: isCheckupDragActive } = useDropzone({
        onDrop: handleCheckupDrop,
        accept: { "image/jpeg": [], "image/png": [] },
        multiple: false,
    })

    const handleSubmit = async () => {
        if (!ecgImage) return setUploadMessage("❗ ECG 이미지를 업로드해주세요.")
        if (hasMissingFields()) return setUploadMessage("❗ 모든 문진 항목을 입력해주세요.")

        setLoading(true)
        setUploadMessage("")

        const formData = new FormData()
        formData.append("file", ecgImage)
        console.log(ecgImage)

        // ✅ 문진 전체를 JSON 문자열로 묶어서 하나의 필드로 추가
        formData.append("questionnaire", JSON.stringify(questionnaire))

        if (checkupImage) formData.append("checkup", checkupImage)

        const url = checkupImage
            ? "/api/public/upload-ecgImage-lead2only-with-checkup"
            : "/api/public/upload-ecgImage-lead2only"

        try {
            const res = await fetch(url, { method: "POST", body: formData })
            const json: AnalysisResult = await res.json()
            setUploadMessage(res.ok ? `✅ 업로드 성공` : `❌ 실패`)
            if (res.ok && onUploadSuccess) onUploadSuccess(json)
        } catch (err) {
            console.error(err)
            setUploadMessage("❌ 서버 오류 발생")
        } finally {
            setLoading(false)
        }
    }


    return <div className="w-full max-w-xl flex flex-col gap-6">
        {/* 문진 카드 */}
        <Card>
            <CardHeader><CardTitle>문진 정보 입력</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                {/* 기본정보 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {["age", "weight", "height"].map((key) => {
                        const field = questionnaireFields.find(f => f.key === key)!
                        return <div key={field.key}>
                            <Label className="mb-2 block" htmlFor={field.key}>{field.label}</Label>
                            <Input id={field.key} type="number" value={questionnaire[field.key] || ""} onChange={(e) => handleInputChange(field.key, e.target.value)} placeholder={field.placeholder} />
                        </div>
                    })}
                </div>

                {/* checkbox - 과거력 */}
                <Card className="p-4 border border-gray-300">
                    <Label className="font-bold mb-2 block">과거력</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {questionnaireFields.filter(f => f.key.startsWith("hx_")).map(field => (
                            <div key={field.key} className="flex items-center space-x-2">
                                <input id={field.key} type="checkbox" checked={Boolean(questionnaire[field.key])} onChange={(e) => handleInputChange(field.key, e.target.checked ? field.value || "1" : "")} />
                                <Label htmlFor={field.key}>{field.label}</Label>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* checkbox - 가족력 */}
                <Card className="p-4 border border-gray-300">
                    <Label className="font-bold mb-2 block">가족력</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {questionnaireFields.filter(f => f.key.startsWith("fhx_")).map(field => (
                            <div key={field.key} className="flex items-center space-x-2">
                                <input id={field.key} type="checkbox" checked={Boolean(questionnaire[field.key])} onChange={(e) => handleInputChange(field.key, e.target.checked ? field.value || "1" : "")} />
                                <Label htmlFor={field.key}>{field.label}</Label>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* 성별 */}
                {(() => {
                    const field = questionnaireFields.find(f => f.key === "gender")!
                    return <div className="space-y-2">
                        <Label>{field.label}</Label>
                        <RadioGroup defaultValue={questionnaire[field.key]} onValueChange={(val) => handleInputChange(field.key, val)} className="flex gap-4">
                            {field.options!.map(option => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${field.key}-${option}`} />
                                    <Label htmlFor={`${field.key}-${option}`}>{labelMap[field.key]?.[option]}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                })()}
                {/* 기타 라디오 항목 */}
                {["smoke", "alcohol", "phy_act"].map(key => {
                    const field = questionnaireFields.find(f => f.key === key)!
                    return <div key={field.key} className="space-y-2">
                        <Label htmlFor={field.key}>{field.label}</Label>
                        <RadioGroup defaultValue={questionnaire[field.key]} onValueChange={(val) => handleInputChange(field.key, val)} className="flex gap-4 flex-wrap">
                            {field.options!.map(option => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${field.key}-${option}`} />
                                    <Label htmlFor={`${field.key}-${option}`}>{labelMap[field.key]?.[option]}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                })}
            </CardContent>
        </Card>

        {/* 이미지 업로드 영역 */}
        <div className="flex flex-col md:flex-row gap-4">
            {[{ label: "ECG 이미지 (필수)", state: ecgImage, set: setEcgImage, drop: getEcgRootProps, input: getEcgInputProps, active: isEcgDragActive },
                { label: "건강검진 결과지 (선택)", state: checkupImage, set: setCheckupImage, drop: getCheckupRootProps, input: getCheckupInputProps, active: isCheckupDragActive }].map((props, i) => (
                <Card key={i} {...props.drop()} className="flex-1 min-h-[200px] cursor-pointer hover:border-blue-500 transition border-dashed border-2 border-gray-300 overflow-hidden">
                    <input {...props.input()} />
                    <CardHeader><CardTitle>{props.label}</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center space-y-2">
                        {props.state ? <img src={URL.createObjectURL(props.state)} alt="preview" className="w-full h-40 object-cover rounded" />
                            : props.active ? <p className="text-blue-500 font-semibold">여기에 이미지를 놓으세요...</p>
                                : <p className="text-gray-600 text-base sm:text-lg">이미지를 드래그하거나<br />클릭하여 업로드하세요</p>}
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* 제출 버튼 */}
        <div className="relative w-full flex items-center">
            <div className="absolute left-1/2 -translate-x-1/2 text-sm text-gray-700">{uploadMessage}</div>
            <div className="ml-auto">
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? (<><Loader2 className="animate-spin mr-2 h-4 w-4" />업로드 중...</>) : "제출"}
                </Button>
            </div>
        </div>
    </div>
}
