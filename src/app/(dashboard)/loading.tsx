import { Card } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="h-32 bg-gray-100 border-none"></Card>
                <Card className="h-32 bg-gray-100 border-none"></Card>
                <Card className="h-32 bg-gray-100 border-none"></Card>
            </div>

            <div className="h-96 bg-gray-100 rounded-2xl"></div>
        </div>
    )
}
