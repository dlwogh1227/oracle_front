import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ 추가
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Pie, PieChart,
} from "recharts";
import {ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart";

interface AnalysisResult {
    label: number;
    probability: number;
    ecg_signal: { "Time (s)": number; "Voltage (mV)": number }[];
    heatmap: string;
    feature_importance: {
        "image": number,
        "signal": number,
        "crf": number,
        "wt": number,
        "age": number,
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

export default function Ecg1leadDashboard({ result }: { result: AnalysisResult }) {
    const [showHeatmap, setShowHeatmap] = useState(false);

    const report = result.pwv_shap_report ?? "";

    const splitKey = "권장드립니다.";
    const splitIndex = report.indexOf(splitKey);

    let part1 = "";
    let part2 = "";

    if (splitIndex !== -1) {
        // part1: 권장드립니다.까지 포함
        part1 = report.slice(23, splitIndex + splitKey.length).trim();

        // part2: 이후 내용
        part2 = report.slice(splitIndex + splitKey.length).trim();
    } else {
        // 권장 문장이 없으면 전체를 part1로
        part1 = report.trim();
        part2 = "";
    }

    const chartData = result.ecg_signal.map(d => ({
        time: d["Time (s)"],
        voltage: d["Voltage (mV)"],
    }));

    const maxTime = Math.max(...chartData.map(d => d.time));
    const xTicks = Array.from({ length: Math.floor(maxTime) + 1 }, (_, i) => i);

    return (
        <div className="w-full flex flex-col gap-6 items-center">
            <Card className="w-full max-w-6xl">
                <CardHeader>
                    <CardTitle>ECG</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] relative p-0 rounded-md overflow-hidden">
                    {/* ✅ Grad-CAM with animation */}
                    <AnimatePresence>
                        {showHeatmap && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "0px",
                                        bottom: "80px",
                                        left: "60px",
                                        right: "55px",
                                    }}
                                >
                                    <img
                                        src={`data:image/png;base64,${result.heatmap}`}
                                        alt="Grad-CAM"
                                        className="w-full h-full object-fill"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 🔵 Line Chart */}
                    <div className="absolute top-0 left-0 w-full h-full z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 60, bottom: 25, left: 0 }}>
                                <XAxis
                                    dataKey="time"
                                    ticks={xTicks}
                                    tick={{ dy: -5 }}
                                    tickMargin={12}
                                    axisLine={false}
                                    tickLine={{ stroke: "#888", strokeWidth: 1.5 }}
                                    label={{ value: "Time (s)", position: "insideBottom", offset: -20 }}
                                    tickFormatter={(value) => value.toFixed(1)}
                                />
                                <YAxis
                                    domain={[-1.0, 1.0]}
                                    axisLine={false}
                                    tick={false}
                                />
                                <Tooltip
                                    formatter={(value: number, name: string) => {
                                        if (name === "voltage") {
                                            return [`${value.toFixed(4)} mV`, "전압"];
                                        }
                                        return [value, name];
                                    }}
                                    labelFormatter={(label: number) => `${label.toFixed(2)} s`}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="voltage"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 📋 정보 박스들 */}
            <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4">
                <Card className="flex-[1] min-h-[180px]">
                    <CardHeader className="text-xl lg:text-2xl font-bold">
                        <CardTitle>진단 요약</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                        {/* 🟢 Text Section */}
                        <div className="mb-2 font-medium">
                            판정 결과: {result.label === 1 ? "이상 (Abnormal)" : "정상 (Normal)"}
                        </div>
                        <div className="mb-4 font-medium">
                            모델 예측 확률: {(result.probability * 100).toFixed(1)}%
                        </div>

                        {/* 🟠 Pie Chart Section */}
                        <ChartContainer
                            config={{
                                ECG_image: { label: "ECG image", color: "#3b82f6" },
                                ECG_signal: { label: "ECG signal", color: "#60a5fa" },
                                wt: { label: "wt", color: "var(--chart-3)" },
                                age: { label: "age", color: "var(--chart-3)" },
                            }}
                            className="mb-4 [&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    content={<ChartTooltipContent nameKey="value" hideLabel />}
                                />
                                <Pie
                                    data={[
                                        { name: "ECG image", value: Math.round(result.feature_importance.image * 10)/10, fill: "#facc15" },
                                        { name: "ECG signal", value: Math.round(result.feature_importance.signal * 10)/10, fill: "#4ade80" },
                                        { name: "wt", value: Math.round(result.feature_importance.wt * 10)/10, fill: "#60a5fa" },
                                        { name: "age", value: Math.round(result.feature_importance.age * 10)/10, fill: "#c084fc" },
                                        ...(result.feature_importance.sbp !== undefined
                                            ? [{ name: "sbp", value: Math.round(result.feature_importance.sbp * 10)/10, fill: "#f97316" }]
                                            : []),
                                        ...(result.feature_importance.dbp !== undefined
                                            ? [{ name: "dbp", value: Math.round(result.feature_importance.dbp * 10)/10, fill: "#38bdf8" }]
                                            : []),
                                    ]}
                                    dataKey="value"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                >
                                    <LabelList
                                        dataKey="name"
                                        className="fill-background"
                                        stroke="none"
                                        fontSize={11}
                                        formatter={(value: string) =>
                                            value.charAt(0).toUpperCase() + value.slice(1)
                                        }
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                        <div className="mb-2 text-red-400">
                            ※ 해당 결과는 심전도 이미지와 신호 데이터, 문진 결과가 각각 {Math.round(result.feature_importance.image * 10)/10}%, {Math.round(result.feature_importance.signal * 10)/10}%, {Math.round(result.feature_importance.crf * 10)/10}%의 중요도를 갖고 모델에 반영된 결과입니다.
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col gap-4 flex-[1.1]">

                    <Card className="flex-1">
                        <CardHeader className="text-xl lg:text-2xl font-bold">
                            <CardTitle>ECG 파형</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <div className="mb-2 font-medium">
                                {result.label === 0
                                ? "현재 신호는 정상 범위 내에 있습니다. 꾸준한 관리가 중요합니다.😊"
                                : result.probability < 0.85
                                    ? "ECG 결과 이상 신호가 감지되었습니다. 지속적으로 이상 징후가 감지되면 병원을 방문해주세요.😢"
                                    : "심장 박동에서 높은 이상 가능성이 발견되었습니다. 의료진 상담이 필요할 수 있습니다.😭"
                                }
                            </div>
                            <div className="text-red-400 mb-2">
                                ※ AI는 이미지에서 빨간색/노란색 부위를 가장 중요하게 참고하여 판단했습니다. 색이 진할수록 주목도가 높지만, 반드시 질환이 있다는 의미는 아닙니다
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowHeatmap(prev => !prev)}
                            >
                                {showHeatmap ? "주요영역 끄기" : "주요영역 보기"}
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle className="text-xl lg:text-2xl font-bold">임상 권고</CardTitle>
                        </CardHeader>
                        <CardContent className="max-w-full text-sm space-y-1">
                            <div className="w-full lg:flex-1 font-medium whitespace-pre-line">
                                {result.gpt_result?.["임상 권고"] ?? "내용없음"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="flex-[1.4]">
                    <CardHeader className="text-xl lg:text-2xl font-bold">
                        <CardTitle>ECG 파형 분석</CardTitle>
                    </CardHeader>

                    <CardContent className="text-sm space-y-4">
                        {/* 박스 1 */}
                        <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                            <div className="font-medium">{result.gpt_result?.["RR 간격"]  ?? "내용없음"}</div>
                        </div>

                        {/* 박스 2 */}
                        <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                            <div className="font-medium">{result.gpt_result?.["QRS 파형"] ?? "내용없음"}</div>
                        </div>

                        {/* 박스 3 */}
                        <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                            <div className="font-medium">{result.gpt_result?.["T파"] ?? "내용없음"}</div>
                        </div>

                        {/* 박스 4 */}
                        <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                            <div className="font-medium">{result.gpt_result?.["P파"] ?? "내용없음"}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {result.pwv_shap_report && result.pwv_shap_img_base64 && result.pwv_shap_prob && (
                <Card className="w-full max-w-6xl mt-4 overflow-visible">
                    <CardHeader>
                        <div className="flex items-center justify-start gap-4 relative">
                            <CardTitle className="text-xl lg:text-2xl font-bold">💡혈관 건강 고위험 예측 분석 리포트</CardTitle>

                            {/* 🔍 SHAP 해석 툴팁 */}
                            <div className="group inline-block relative">
                                <Button variant="outline" className="text-sm px-3 py-1.5">
                                    SHAP 그래프 보기
                                </Button>

                                {/* 🖼 툴팁 이미지 (더 큼 + overflow 해제) */}
                                <div className="absolute bottom-full left-0 mt-2 hidden group-hover:block z-50">
                                    <img
                                        src={`data:image/png;base64,${result.pwv_shap_img_base64}`}
                                        alt="SHAP 해석"
                                        className="w-[600px] max-w-none h-auto rounded-md shadow-xl border border-gray-300 bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="text-sm space-y-4">
                        <p className="font-medium whitespace-pre-line">
                            혈관 건강 저위험 확률: <span className="text-green-600 font-bold">{result.pwv_shap_prob[0].toFixed(4)}</span><br />
                            혈관 건강 고위험 확률: <span className="text-red-600 font-bold">{result.pwv_shap_prob[1].toFixed(4)}</span>
                        </p>
                        <p className="font-medium whitespace-pre-line">{part2}</p>
                        <p className="font-medium whitespace-pre-line text-red-400">※{part1}</p>
                    </CardContent>
                </Card>

            )}
        </div>
    );
}
