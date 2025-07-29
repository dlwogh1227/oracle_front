"use client"

import {
    PolarGrid,
    RadialBar,
    RadialBarChart,
} from "recharts"
import { PolarAngleAxis } from "recharts"

type ChartRadialTextProps = {
    score: number // 위험 총점수 (0~100 범위)
}

export function ChartRadialText({ score }: ChartRadialTextProps) {
    const getScoreColor = (score: number) => {
        if (score < 30) return "#22c55e"   // 초록
        if (score < 60) return "#eab308"   // 노랑
        return "#ef4444"                   // 빨강
    }

    const chartData = [
        { name: "risk", visitors: score, fill: getScoreColor(score) },
    ]

    return (
        <div className="mx-auto aspect-square max-w-[200px]">
            <RadialBarChart
                data={chartData}
                startAngle={90}           // 시작 위치: 12시 방향
                endAngle={-270}           // 시계방향으로 360도 회전
                innerRadius={70}
                outerRadius={100}
                width={200}
                height={200}
            >
                <PolarGrid gridType="circle" radialLines={false} stroke="none" />

                {/* ✅ 100점 만점 비율 기반 축 */}
                <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}        // ✅ 핵심: 0~100 기준 고정
                    angleAxisId={0}
                    tick={false}
                />

                {/* ✅ 비율에 따라 정확히 채워지는 바 */}
                <RadialBar
                    dataKey="visitors"
                    angleAxisId={0}          // ✅ 반드시 축과 연결
                    background
                    cornerRadius={10}
                />

                {/* ✅ 중앙 텍스트 표시 */}
                <text
                    x={100}
                    y={100}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground text-3xl font-bold"
                >
                    {score}
                </text>
            </RadialBarChart>
        </div>
    )
}
