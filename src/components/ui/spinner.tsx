import { Loader2 } from "lucide-react"

export function Spinner() {
    return (
        <div className="flex items-center justify-center h-full p-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    )
}