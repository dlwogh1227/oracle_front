import { useUser } from "@/context/UserContext"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { DataTable } from "@/components/data-table.tsx";
import type { ColumnDef } from "@tanstack/react-table"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {ChartRadialText} from "@/components/chart-radial-text-props.tsx";
import {ChartBarRecent} from "@/components/chart-bar-recent.tsx";
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"


type Patient = {
    id: number;
    name: string
    status: "정상군" | "위험군" | "고위험군" | "미분류"
}

type ScoreDict = Record<
    | "ECG 리듬 이상 점수"
    | "고혈압 (혈압 기준)"
    | "뇌졸중 과거력"
    | "당뇨병 (혈당 기준)"
    | "비만 (BMI ≥ 25)"
    | "음주"
    | "이상지질혈증 (지질 기준)"
    | "좌심실비대 점수"
    | "죽상동맥경화증"
    | "흡연",
    number
>

type PatientDetail = {
    patient_id: number
    total_score: number
    risk_class: "정상군" | "위험군" | "고위험군" | "미분류"
    score_dict: ScoreDict
}

const columns: ColumnDef<Patient>[] = [
    {
        accessorKey: "name",
        header: "환자명",
        cell: ({ row }) => <span>{row.getValue("name")}</span>,
    },
    {
        accessorKey: "status",
        header: "상태",
        cell: ({ row }) => {
            const status = row.getValue("status") as Patient["status"];
            const color =
                status === "정상군"
                    ? "text-green-600"
                    : status === "위험군"
                        ? "text-yellow-600"
                        : status === "고위험군"
                            ? "text-red-600"
                            : "text-black"

            return <span className={color}>{status}</span>
        },
    },
]

export function ProfessionalSection() {
    const { user } = useUser()
    const navigate = useNavigate()
    const [showDialog, setShowDialog] = useState(false)
    const [patients, setPatients] = useState<Patient[]>([])
    const [hovered, setHovered] = useState(false)

    const [selectedPatientDetail, setSelectedPatientDetail] = useState<PatientDetail | null>(null)
    const [loading, setLoading] = useState(false)

    const handleRowClick = async (id: number) => {
        if (loading) return // 이미 로딩 중이면 무시

        setLoading(true)

        try {
            const res = await fetch(`/api/professional/getPatientInfo?id=${id}`)
            const data = await res.json()

            setSelectedPatientDetail(data) // 왼쪽 카드 내용 변경
        } catch (error) {
            console.error("환자 정보 조회 실패:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // 권한 없으면 모달 띄우고 뒤로가기
        if (!user || user.role !== "ROLE_PRO") {
            setShowDialog(true)

            const timer = setTimeout(() => {
                if (window.history.length <= 1) {
                    navigate("/", { replace: true }) // 브라우저 히스토리가 없으면 홈으로
                } else {
                    navigate(-1)
                }
            }, 1500)

            return () => clearTimeout(timer)
        }
    }, [user, navigate])

    useEffect(() => {
        if (user?.role === "ROLE_PRO") {
            fetch("/api/professional/getPatientsList")
                .then(res => res.json())
                .then(data => setPatients(data))
                .catch(err => console.error("환자 목록 로드 실패:", err))
        }
    }, [user, selectedPatientDetail])

    useEffect(() => {
        if (patients.length > 0 && selectedPatientDetail === null) {
            handleRowClick(patients[0].id);
        }
    }, [patients, selectedPatientDetail]);

    if (!user || user.role !== "ROLE_PRO") {
        return (
            <Dialog open={showDialog}>
                <DialogContent className="text-center">
                    <DialogHeader>
                        <DialogTitle>접근 권한이 없습니다</DialogTitle>
                        <DialogDescription>
                            이 페이지는 전문가 전용입니다.<br />
                            이전 화면으로 돌아갑니다...
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
        <div className="flex flex-col lg:flex-row gap-6 p-6">
            {/* 왼쪽 카드 */}
            <Card className="w-full flex-[4] shadow-md bg-gray-100">
                <CardHeader>
                    <CardTitle>환자 {selectedPatientDetail?.patient_id}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-full min-h-[400px]">
                            <Spinner />
                        </div>
                    ) : selectedPatientDetail ? (
                        <div className="flex flex-row gap-4">
                            {/* 왼쪽 하위 카드 (왼쪽 절반) */}
                            <Card className="flex-[1.5] w-1/2">
                                <CardContent className="space-y-2">
                                    <ul className="list-disc list-outside pl-5 text-sm space-y-4">
                                        <li>
                                            <span className="font-medium">ECG 리듬 이상 점수</span>: <span className="text-red-500">{selectedPatientDetail?.score_dict["ECG 리듬 이상 점수"]}</span>
                                            <ul className="list-none pl-6 text-sm text-muted-foreground mt-1 space-y-1">
                                                <li>Normal: Sinus Rhythm (0점)</li>
                                                <li>AF: ECG상 심방세동 발견 (22점)</li>
                                                <li>Arrhythmia: ECG상 Arrhythmia발견 (15점)</li>
                                                <li>Abnormal: ECG상 Arrhythmia, AF를 제외한 모든 리듬이상 (8점)</li>
                                            </ul>
                                        </li>

                                        <li>
                                            <span className="font-medium">좌심실비대 점수</span>: <span className="text-red-500">{selectedPatientDetail?.score_dict["좌심실비대 점수"]}</span>
                                            <ul className="list-none pl-6 text-sm text-muted-foreground mt-1 space-y-1">
                                                <li>ECG상 LVH 위험요소 발견 (13점)</li>
                                                <li>X-ray상 CTR &gt; 0.5인 경우 심비대 의심, 초음파를 통해 LVH 확인 권장 (7점)</li>
                                            </ul>
                                        </li>

                                        <li>
                                            <span className="font-medium">뇌졸중 과거력</span>: <span className="text-red-500">{selectedPatientDetail?.score_dict["뇌졸중 과거력"]}</span>
                                            <ul className="list-none pl-6 text-sm text-muted-foreground mt-1">
                                                <li>과거 뇌졸중 병력 (15점)</li>
                                            </ul>
                                        </li>

                                        <li>
                                            <span className="font-medium">이상지질혈증 (지질 기준)</span>: <span className="text-red-500">{selectedPatientDetail?.score_dict["이상지질혈증 (지질 기준)"]}</span>
                                            <ul className="list-none pl-6 text-sm text-muted-foreground mt-1">
                                                <li>총 콜레스테롤 240 mg/dL 이상, 고 콜레스테롤혈증 (12점)</li>
                                            </ul>
                                        </li>

                                        <li>
                                            <span className="font-medium">당뇨병 (혈당 기준)</span>: <span className="text-red-500">{selectedPatientDetail?.score_dict["당뇨병 (혈당 기준)"]}</span>
                                            <ul className="list-none pl-6 text-sm text-muted-foreground mt-1">
                                                <li>공복 혈당 126 mg/dL 이상 (10점)</li>
                                            </ul>
                                        </li>

                                        <li>
                                            <span className="font-medium">죽상동맥경화증</span>: <span className="text-red-500">{selectedPatientDetail?.score_dict["죽상동맥경화증"]}</span>
                                            <ul className="list-none pl-6 text-sm text-muted-foreground mt-1 space-y-1">
                                                <li>죽상동맥경화증 진단 (10점)</li>
                                                <li>진단 받지 않은 사람은 모델링 기반 예측 점수 (10점 이하)</li>
                                            </ul>
                                        </li>

                                        <li>
                                            <span className="font-medium">고혈압 (혈압 기준)</span >: <span className="text-red-500">{selectedPatientDetail?.score_dict["고혈압 (혈압 기준)"]}</span>
                                            <ul className="list-none pl-6 text-sm text-muted-foreground mt-1">
                                                <li>SBP &gt;= 140 또는 DBP &gt;= 90 (8점)</li>
                                            </ul>
                                        </li>

                                        <li>
                                            <span className="font-medium">흡연</span>: <span className="text-red-500">{selectedPatientDetail?.score_dict["흡연"]}</span>
                                            <ul className="list-none pl-6 text-sm text-muted-foreground mt-1">
                                                <li>과거 또는 현재 흡연력 (5점)</li>
                                            </ul>
                                        </li>

                                        <li>
                                            <span className="font-medium">비만 (BMI ≥ 25)</span>: <span className="text-red-500">{selectedPatientDetail?.score_dict["비만 (BMI ≥ 25)"]}</span>
                                            <ul className="list-none pl-6 text-sm text-muted-foreground mt-1">
                                                <li>BMI &gt;= 25 (3점)</li>
                                            </ul>
                                        </li>

                                        <li>
                                            <span className="font-medium">음주</span>: <span className="text-red-500">{selectedPatientDetail?.score_dict["음주"]}</span>
                                            <ul className="list-none pl-6 text-sm text-muted-foreground mt-1">
                                                <li>음주력 (2점)</li>
                                            </ul>
                                        </li>


                                    </ul>
                                </CardContent>
                            </Card>

                            {/* 오른쪽 하위 카드 2개 (오른쪽 절반 상하 분할) */}
                            <div className="flex-[1] flex flex-col w-1/2 gap-4">
                                <Card>
                                    <CardContent>
                                        <span className="font-medium">위험총점수</span>: <span className="text-red-500 font-bold">{selectedPatientDetail?.total_score}</span>
                                        <ChartRadialText score={selectedPatientDetail?.total_score ?? 0} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent>
                                        <span className="font-medium">분류 : </span>
                                        <span
                                            className={
                                                selectedPatientDetail?.risk_class === "정상군"
                                                    ? "text-green-600 font-bold"
                                                    : selectedPatientDetail?.risk_class === "위험군"
                                                        ? "text-yellow-600 font-bold"
                                                        : selectedPatientDetail?.risk_class === "고위험군"
                                                            ? "text-red-600 font-bold"
                                                            : "text-muted-foreground"
                                                }
                                            >
                                            {selectedPatientDetail?.risk_class}
                                        </span>
                                        {selectedPatientDetail?.patient_id && (
                                            <div className="mt-4">
                                                <ChartBarRecent patientId={selectedPatientDetail.patient_id} />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                                <Card className="relative overflow-visible"> {/* overflow-visible 추가 */}
                                    <CardContent>
                                        <div
                                            className="relative w-full flex flex-col items-center"
                                            onMouseEnter={() => setHovered(true)}
                                            onMouseLeave={() => setHovered(false)}
                                        >
                                            {hovered && (
                                                <div className="absolute bottom-full mb-4 z-30 max-w-[90vw] w-[900px] bg-white border shadow-xl rounded-lg p-2">
                                                    <img
                                                        src="/output_video/frame_016.png"
                                                        alt="MRI 미리보기"
                                                        className="w-full h-auto object-contain rounded-md"
                                                    />
                                                </div>
                                            )}

                                            <Button className="w-full bg-gray-300 text-black hover:bg-gray-400 text-xl py-8">
                                                MRI 보기
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            환자를 선택하면 상세 정보가 표시됩니다.
                        </div>
                    )}
                </CardContent>
            </Card>


            {/* 오른쪽 카드 */}
            <Card className="w-full flex-[1] shadow-md">
                <CardHeader>
                    <CardTitle>환자 목록</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={patients}
                        onRowClick={(patient) => handleRowClick(patient.id)}
                        disabled={loading}
                    />
                </CardContent>
            </Card>
        </div>
        </motion.div>
    )
}
