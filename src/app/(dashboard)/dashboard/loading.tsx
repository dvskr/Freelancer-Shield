import { SkeletonKPICards, SkeletonChart, SkeletonList } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
    return (
        <div className="space-y-6">
            <div>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
            </div>

            <SkeletonKPICards />

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <SkeletonList items={5} />
                </div>
                <div className="lg:col-span-2">
                    <SkeletonChart />
                </div>
            </div>
        </div>
    )
}
