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

export function ProfessionalSection() {
    const { user } = useUser()
    const navigate = useNavigate()
    const [showDialog, setShowDialog] = useState(false)

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
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [user, navigate])

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
        <div className="p-6">
            <h1 className="text-2xl font-bold">전문가 전용 페이지</h1>
            <p>여기에 전문가용 콘텐츠가 들어갑니다.</p>
        </div>
    )
}
