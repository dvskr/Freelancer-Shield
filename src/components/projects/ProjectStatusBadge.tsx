interface ProjectStatusBadgeProps {
    status: string
    size?: 'sm' | 'md'
}

export default function ProjectStatusBadge({ status, size = 'md' }: ProjectStatusBadgeProps) {
    const getStatusStyles = () => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700 border-green-200'
            case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'on_hold': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

    return (
        <span className={`inline-flex items-center font-medium rounded-full border ${getStatusStyles()} ${sizeClasses}`}>
            {status.replace('_', ' ')}
        </span>
    )
}
