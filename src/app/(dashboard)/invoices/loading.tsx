import { SkeletonKPICards, SkeletonTable } from '@/components/ui/Skeleton'

export default function InvoicesLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <SkeletonKPICards />
            <SkeletonTable rows={10} />
        </div>
    )
}
