import {useEffect, useState, useRef, type JSX} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useUser } from "@/context/UserContext"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Activity, FileText, ListChecks, Brain, HeartPulse, ScanLine, SquareStack, Image, ActivitySquare, ClipboardList, ScanEye } from "lucide-react";

const messages = [
    ["스마트한","건강 관리의 시작"],
    ["쉽고 편리하게", "내 건강을 확인하세요"],
    ["AI 기반", "건강 데이터 분석 솔루션"],
]

export default function MainIntro() {
    const [index, setIndex] = useState(0)
    const nextSectionRef = useRef<HTMLDivElement>(null)
    const [highlightContent, setHighlightContent] = useState<JSX.Element>(
        <DefaultMessage />
    );
    const [hoveredBox, setHoveredBox] = useState<"left" | "right" | null>(null)

    const navigate = useNavigate()

    const handleScroll = () => {
        nextSectionRef.current?.scrollIntoView({ behavior: "smooth"})
    }

    const { user } = useUser()
    const [showAlert, setShowAlert] = useState(false)

    useEffect(() => {
        const handleAutoScroll = () => {
            if (window.scrollY > 50 && nextSectionRef.current) {
                nextSectionRef.current.scrollIntoView({ behavior: "smooth" })
                window.removeEventListener("scroll", handleAutoScroll)
            }
        }
        window.addEventListener("scroll", handleAutoScroll)
        return () => window.removeEventListener("scroll", handleAutoScroll)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % messages.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    function DefaultMessage() {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-6 px-4">
                {/* 헤드라인 */}
                <h2 className="text-4xl font-bold leading-snug">
                    AI 기반 건강 데이터 통합 분석 솔루션
                </h2>

                {/* 아이콘 한 줄 */}
                <div className="flex flex-wrap justify-center gap-x-10 gap-y-6">
                    {/* ECG */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-blue-100 p-4 rounded-full shadow">
                            <HeartPulse className="w-10 h-10 text-blue-600" />
                        </div>
                        <span className="text-base font-semibold text-gray-700">ECG 분석</span>
                    </div>

                    {/* 건강검진/문진 */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-green-100 p-4 rounded-full shadow">
                            <FileText className="w-10 h-10 text-green-600" />
                        </div>
                        <span className="text-base font-semibold text-gray-700">건강검진 + 문진</span>
                    </div>

                    {/* AI 결과 */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-purple-100 p-4 rounded-full shadow">
                            <Brain className="w-10 h-10 text-purple-600" />
                        </div>
                        <span className="text-base font-semibold text-gray-700">AI 예측 결과</span>
                    </div>

                    {/* X-ray */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-amber-100 p-4 rounded-full shadow">
                            <ScanLine className="w-10 h-10 text-amber-600" />
                        </div>
                        <span className="text-base font-semibold text-gray-700">X-ray 분석</span>
                    </div>

                    {/* MRI */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-red-100 p-4 rounded-full shadow">
                            <SquareStack className="w-10 h-10 text-red-600" />
                        </div>
                        <span className="text-base font-semibold text-gray-700">MRI 분석</span>
                    </div>
                </div>

                {/* 설명 */}
                <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
                    ECG, 건강검진, 문진 정보를 기반으로<br />
                    AI가 심혈관 및 전신 건강 상태를 통합 분석해드립니다.
                </p>
            </div>
        );
    }


    function RegularUserMessage() {
        return (
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 px-6 py-6">
                {/* 좌측: 기능 아이콘들 */}
                <div className="grid grid-cols-2 gap-6">
                    {/* ECG */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-blue-100 p-4 rounded-full shadow">
                            <Activity className="w-10 h-10 text-blue-600" />
                        </div>
                        <span className="text-base font-medium">ECG 이미지 업로드</span>
                    </div>

                    {/* 건강검진 */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-green-100 p-4 rounded-full shadow">
                            <FileText className="w-10 h-10 text-green-600" />
                        </div>
                        <span className="text-base font-medium">건강검진 결과 분석</span>
                    </div>

                    {/* 문진 */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-amber-100 p-4 rounded-full shadow">
                            <ListChecks className="w-10 h-10 text-amber-600" />
                        </div>
                        <span className="text-base font-medium">문진 정보 입력</span>
                    </div>

                    {/* AI 분석 */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-purple-100 p-4 rounded-full shadow">
                            <Brain className="w-10 h-10 text-purple-600" />
                        </div>
                        <span className="text-base font-medium">AI 분석 결과</span>
                    </div>
                </div>

                {/* 우측: 설명 문구 */}
                <div className="max-w-xl text-center md:text-left space-y-4">
                    <h3 className="text-3xl font-bold leading-snug">
                        스마트워치 ECG와<br />건강검진 데이터로 건강 분석
                    </h3>
                    <p className="text-lg text-gray-800 leading-relaxed">
                        이미지 업로드와 간단한 문진만으로<br />
                        AI가 자동으로 심장 건강 상태를 분석해드립니다.<br />
                        누구나 <span className="text-blue-600 font-semibold">쉽고 빠르게</span> 건강을 확인할 수 있어요!
                    </p>
                </div>
            </div>
        );
    }

    function ProfessionalMessage() {
        return (
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 px-6 py-6">
                {/* 좌측: 기능 아이콘들 */}
                <div className="grid grid-cols-2 gap-6">
                    {/* 흉부 X-ray */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-indigo-100 p-4 rounded-full shadow">
                            <Image className="w-10 h-10 text-indigo-600" />
                        </div>
                        <span className="text-base font-medium">흉부 X-ray</span>
                    </div>

                    {/* 12유도 ECG */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-rose-100 p-4 rounded-full shadow">
                            <ActivitySquare className="w-10 h-10 text-rose-600" />
                        </div>
                        <span className="text-base font-medium">12유도 ECG</span>
                    </div>

                    {/* 건강검진 + 문진 */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-lime-100 p-4 rounded-full shadow">
                            <ClipboardList className="w-10 h-10 text-lime-600" />
                        </div>
                        <span className="text-base font-medium">건강검진 데이터</span>
                    </div>

                    {/* 뇌 MRI 세분화 */}
                    <div className="flex flex-col items-center space-y-2">
                        <div className="bg-cyan-100 p-4 rounded-full shadow">
                            <ScanEye className="w-10 h-10 text-cyan-600" />
                        </div>
                        <span className="text-base font-medium">뇌 MRI 세분화</span>
                    </div>
                </div>

                {/* 우측: 설명 문구 */}
                <div className="max-w-xl text-center md:text-left space-y-4">
                    <h3 className="text-3xl font-bold leading-snug">
                        다중 생체신호와 이미지를 활용한<br />뇌졸중 위험도 예측 서비스
                    </h3>
                    <p className="text-lg text-gray-800 leading-relaxed">
                        흉부 X-ray, 12유도 ECG, 건강검진 정보를 종합하여<br />
                        <span className="text-purple-600 font-semibold">고유 점수체계 기반</span>으로 뇌졸중 위험도를 예측합니다.<br />
                        추가로, 뇌 MRI 이미지를 통해 <span className="text-purple-600 font-semibold">세밀한 뇌 부위 분할</span> 결과도 확인할 수 있어요!
                    </p>
                </div>
            </div>
        );
    }



    return (
        <>
            <div
                className="relative w-full h-screen bg-cover bg-center flex items-center justify-start"
                style={{
                    backgroundImage: "url('/main_background.png')",
                }}
            >
                <div className="absolute inset-0 bg-white/20" />
                <div className="relative z-10 px-[5vw] md:px-[10vw] text-black max-w-[90vw] mb-30">
                    <div className="text-[1vw] text-rose-500 font-semibold mb-4">
                        Team 심봤다
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.h1
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6 }}
                            className="text-[3.5vw] font-bold mb-6 leading-tight"
                        >
                            {messages[index].map((line, i) => (
                                <div key={i}>{line}</div>
                            ))}
                        </motion.h1>
                    </AnimatePresence>

                    <p className="text-[1.2vw] text-gray-700">
                        스마트워치와 건강검진 데이터를 연동해<br />
                        매일 가족의 건강을 쉽게 관리해보세요.
                    </p>
                </div>
                {/* 아래로 스크롤 문구 + 화살표 */}
                <div
                    className="mb-4 absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 text-center cursor-pointer animate-bounce"
                    onClick={handleScroll}
                >
                    <div className="text-gray-800 text-sm mb-1">아래로 스크롤하세요</div>
                    <div className="text-2xl">↓</div>
                </div>
            </div>

            {/* ✅ 다음 섹션: 설명 박스 + 버튼 */}
            <div
                ref={nextSectionRef}
                className="h-screen bg-white/20 px-8 py-16 grid grid-rows-2 grid-cols-2 gap-4"
            >
                {/* 상단: 좌측 + 우측 결합 */}
                <div className="bg-white/20 row-span-1 col-span-2 rounded-xl shadow-lg flex items-center justify-center text-xl font-semibold">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={highlightContent.key} // 컴포넌트도 고유 키가 필요함
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="text-center px-4"
                        >
                            {highlightContent}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 하단: 좌측 박스 */}
                <motion.div
                    className="relative bg-cover bg-center bg-white rounded-xl shadow-lg flex items-center justify-center text-lg font-medium cursor-pointer hover:scale-105 hover:shadow-2xl transition-transform duration-300 group"
                    style={{ backgroundImage: "url('/regular_user.png')" }}
                    onMouseEnter={() => {
                        setHighlightContent(<RegularUserMessage key="regular" />)
                        setHoveredBox("left")
                    }}
                    onMouseLeave={() => {
                        setHighlightContent(<DefaultMessage key="default" />)
                        setHoveredBox(null)
                    }}
                    onClick={() => navigate("/user")}
                    animate={{
                        opacity: hoveredBox === "right" ? 0.6 : 1,
                        filter: hoveredBox === "right" ? "blur(4px)" : "blur(0px)",
                    }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="absolute inset-0 bg-white/30 group-hover:bg-white/10 transition-colors duration-300" />
                    <div className="relative z-10 text-4xl font-black text-white bg-black/70 rounded px-4 py-2 shadow-lg">
                        일반 사용자용
                    </div>
                </motion.div>

                {/* 하단: 우측 박스 */}
                <motion.div
                    className="relative bg-cover bg-center bg-white rounded-xl shadow-lg flex items-center justify-center text-lg font-medium cursor-pointer hover:scale-105 hover:shadow-2xl transition-transform duration-300 group"
                    style={{ backgroundImage: "url('/professional.png')" }}
                    onMouseEnter={() => {
                        setHighlightContent(<ProfessionalMessage key="pro" />)
                        setHoveredBox("right")
                    }}
                    onMouseLeave={() => {
                        setHighlightContent(<DefaultMessage key="default" />)
                        setHoveredBox(null)
                    }}
                    onClick={() => {
                        if (user?.role === "ROLE_PRO") {
                            navigate("/professional")
                        } else {
                            setShowAlert(true)
                        }
                    }}
                    animate={{
                        opacity: hoveredBox === "left" ? 0.6 : 1,
                        filter: hoveredBox === "left" ? "blur(4px)" : "blur(0px)",
                    }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="absolute inset-0 bg-white/30 group-hover:bg-white/10 transition-colors duration-300" />
                    <div className="relative z-10 text-4xl font-black text-white bg-black/70 rounded px-4 py-2 shadow-lg">
                        의사용
                    </div>
                </motion.div>
            </div>
            <Dialog open={showAlert} onOpenChange={setShowAlert}>
                <DialogContent>
                    <DialogHeader className="space-y-4">
                        <DialogTitle>접근 권한이 없습니다</DialogTitle>
                        <DialogDescription>
                            이 페이지는 전문가 전용입니다.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </>
    )
}
