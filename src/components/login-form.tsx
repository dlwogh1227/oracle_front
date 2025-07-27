import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useState } from "react"
import { useUser } from "@/context/UserContext"
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group"

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {

    const { setUser } = useUser()
    const [id, setId] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [token, setToken] = useState("")
    const [mode, setMode] = useState<"login" | "signup">("login")


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        const endpoint = mode === "login" ? "/api/login" : "/api/public/insertUser";
        const payload = mode === "login"
            ? { username: id, password }
            : { username: id, password, token };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const data = await response.json();  // 👈 문자열 응답 읽기
                throw new Error(data.message || "회원가입 실패");
            }

            const data = await response.json() // 서버에서 LoginResponse 형태로 응답
            if (mode === "login") {
                setUser(data); // 서버 응답이 LoginResponse 형식일 경우
            } else {
                alert(data.message || "회원가입 성공");
            }

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "오류 발생")
            } else {
                setError("알 수 없는 오류 발생")
            }
        }
    }


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>{mode === "login" ? "계정에 로그인" : "회원가입"}</CardTitle>
                    <CardDescription>
                        {mode === "login" ? "아이디와 비밀번호를 입력해 주세요" : "회원가입을 위해 정보를 입력하세요"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="id">아이디</Label>
                                <Input
                                    id="id"
                                    type="text"
                                    required
                                    value={id}
                                    autoComplete="off"
                                    onChange={(e) => setId(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">비밀번호</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    autoComplete="off"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {mode === "signup" && (
                                <div className="grid gap-3">
                                    <Label>회원 유형</Label>
                                    <RadioGroup
                                        value={token}
                                        onValueChange={setToken}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="user" id="user" />
                                            <Label htmlFor="user">일반 사용자</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="pro" id="pro" />
                                            <Label htmlFor="pro">의사</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            )}
                            <div className="flex flex-col gap-3">
                                <Button type="submit" className="w-full">
                                    {mode === "login" ? "로그인" : "회원가입"}
                                </Button>
                            </div>
                            {error && (
                                <p className="text-sm text-center text-red-500 mt-2">{error}</p>
                            )}
                        </div>
                        <div className="mt-4 text-center text-sm">
                            {mode === "login" ? (
                                <>
                                    회원이 아니십니까?{" "}
                                    <span
                                        className="underline underline-offset-4 cursor-pointer text-blue-600"
                                        onClick={() => setMode("signup")}
                                    >
                                        회원가입
                                    </span>
                                </>
                            ) : (
                                <>
                                    이미 회원이신가요?{" "}
                                    <span
                                        className="underline underline-offset-4 cursor-pointer text-blue-600"
                                        onClick={() => setMode("login")}
                                    >
                                        로그인
                                    </span>
                                </>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
