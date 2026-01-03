import { requireAuth } from '@/lib/auth'
import Link from 'next/link'
import {
    HelpCircle,
    Book,
    MessageCircle,
    Mail,
    FileText,
    Users,
    CreditCard,
    Clock,
    Shield,
    ChevronRight,
    ExternalLink,
    Search
} from 'lucide-react'

export const metadata = {
    title: 'Help & Support | FreelancerShield',
}

const helpTopics = [
    {
        title: 'Getting Started',
        icon: Book,
        description: 'Learn the basics of FreelancerShield',
        articles: [
            { title: 'Creating your first client', href: '#' },
            { title: 'Setting up your business profile', href: '#' },
            { title: 'Understanding the dashboard', href: '#' },
        ]
    },
    {
        title: 'Invoicing',
        icon: FileText,
        description: 'Create and manage invoices',
        articles: [
            { title: 'Creating an invoice', href: '#' },
            { title: 'Sending invoices to clients', href: '#' },
            { title: 'Setting up payment reminders', href: '#' },
            { title: 'Recording manual payments', href: '#' },
        ]
    },
    {
        title: 'Clients & Projects',
        icon: Users,
        description: 'Manage your clients and projects',
        articles: [
            { title: 'Adding a new client', href: '#' },
            { title: 'Creating project milestones', href: '#' },
            { title: 'Tracking project progress', href: '#' },
        ]
    },
    {
        title: 'Payments & Billing',
        icon: CreditCard,
        description: 'Accept payments and manage billing',
        articles: [
            { title: 'Connecting Stripe', href: '#' },
            { title: 'Accepting online payments', href: '#' },
            { title: 'Understanding fees', href: '#' },
        ]
    },
    {
        title: 'Time Tracking',
        icon: Clock,
        description: 'Track your time and create invoices',
        articles: [
            { title: 'Using the timer', href: '#' },
            { title: 'Manual time entries', href: '#' },
            { title: 'Converting time to invoices', href: '#' },
        ]
    },
    {
        title: 'Contracts',
        icon: Shield,
        description: 'Create and manage contracts',
        articles: [
            { title: 'Creating a contract', href: '#' },
            { title: 'Using contract templates', href: '#' },
            { title: 'Getting client signatures', href: '#' },
        ]
    },
]

const faqs = [
    {
        question: 'How do I get paid through FreelancerShield?',
        answer: 'Connect your Stripe account in Settings, then send invoices with a payment link. Clients can pay with credit card, and funds are deposited to your bank account.'
    },
    {
        question: 'Can I customize my invoices?',
        answer: 'Yes! Go to Settings > Invoicing to customize your invoice appearance, add your logo, set default payment terms, and more.'
    },
    {
        question: 'How do automatic reminders work?',
        answer: 'FreelancerShield automatically sends payment reminders to clients before and after invoice due dates. Configure reminder schedules in Settings > Notifications.'
    },
    {
        question: 'Is my data secure?',
        answer: 'Yes. We use industry-standard encryption, secure payment processing through Stripe, and never store sensitive payment information on our servers.'
    },
]

export default async function HelpPage() {
    await requireAuth()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
                <p className="text-gray-600">
                    Find answers to your questions and learn how to get the most out of FreelancerShield
                </p>
            </div>

            {/* Search */}
            <div className="max-w-xl mx-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search help articles..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                    href="mailto:support@freelancershield.com"
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                >
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Email Support</p>
                        <p className="text-sm text-gray-500">Get help via email</p>
                    </div>
                </a>

                <Link
                    href="/settings"
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                >
                    <div className="p-3 bg-green-100 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Account Settings</p>
                        <p className="text-sm text-gray-500">Manage your account</p>
                    </div>
                </Link>

                <a
                    href="https://docs.freelancershield.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                >
                    <div className="p-3 bg-purple-100 rounded-lg">
                        <ExternalLink className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">Documentation</p>
                        <p className="text-sm text-gray-500">Browse full docs</p>
                    </div>
                </a>
            </div>

            {/* Help Topics */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by Topic</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {helpTopics.map((topic) => (
                        <div
                            key={topic.title}
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <topic.icon className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">{topic.description}</p>
                            <ul className="space-y-2">
                                {topic.articles.map((article) => (
                                    <li key={article.title}>
                                        <a
                                            href={article.href}
                                            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
                                        >
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                            {article.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQs */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-xl p-5"
                        >
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                {faq.question}
                            </h3>
                            <p className="text-gray-600 pl-7">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
                <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
                <p className="text-blue-100 mb-6 max-w-md mx-auto">
                    Our support team is here to help you with any questions or issues.
                </p>
                <a
                    href="mailto:support@freelancershield.com"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                    <Mail className="w-5 h-5" />
                    Contact Support
                </a>
            </div>
        </div>
    )
}
