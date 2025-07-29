"use client"

import { Bar, BarChart, CartesianGrid, XAxis, Cell } from "recharts"
import { useEffect, useState } from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type ScoreHistory = {
    id: number
    patientId: number
    score: number
    timestamp: string
}

const chartConfig = {
    score: {
        label: "Score",
        color: "var(--chart-1)", // 사용은 안 됨 (개별 Cell에서 fill 적용)
    },
}

// 점수에 따라 색상 반환 함수
const getColorByScore = (score: number) => {
    if (score >= 80) return "#EF4444" // 고위험군: 빨간색
    if (score >= 50) return "#FACC15" // 위험군: 노란색
    return "#10B981" // 정상군: 초록색
}

export function ChartBarRecent({ patientId }: { patientId: number }) {
    const [chartData, setChartData] = useState<{ time: string; score: number }[]>([])

    useEffect(() => {
        if (!patientId) return

        fetch(`/api/professional/getScoreHistory?id=${patientId}`)
            .then((res) => res.json())
            .then((data: ScoreHistory[]) => {
                const formatted = data
                    .reverse() // 오래된 순으로 정렬
                    .map((item) => ({
                        time: new Date(item.timestamp).toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                        }),
                        score: item.score,
                    }))
                setChartData(formatted)
            })
            .catch((err) => console.error("최근 점수 조회 실패:", err))
    }, [patientId])

    if (chartData.length === 0) return null

    return (
        <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={chartData} width={250} height={180}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getColorByScore(entry.score)} />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    )
}
