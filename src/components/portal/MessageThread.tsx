"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, User } from 'lucide-react'

interface Message {
    id: string
    content: string
    senderType: string
    createdAt: Date | string
}

interface MessageThreadProps {
    messages: Message[]
    clientId: string
    freelancerName: string
    clientName: string
}

function formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date)
}

export default function MessageThread({
    messages: initialMessages,
    clientId,
    freelancerName,
    clientName
}: MessageThreadProps) {
    const [messages, setMessages] = useState(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || sending) return

        setSending(true)
        const content = newMessage.trim()
        setNewMessage('')

        try {
            const res = await fetch('/api/portal/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })

            if (!res.ok) throw new Error('Failed to send')

            const message = await res.json()
            setMessages([...messages, message])
        } catch (err) {
            alert('Failed to send message. Please try again.')
            setNewMessage(content)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No messages yet. Start a conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isClient = message.senderType === 'client'
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex items-start gap-2 max-w-[70%] ${isClient ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isClient ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                        <User className={`w-4 h-4 ${isClient ? 'text-blue-600' : 'text-gray-600'}`} />
                                    </div>
                                    <div>
                                        <div className={`px-4 py-2 rounded-2xl ${isClient
                                            ? 'bg-blue-600 text-white rounded-br-md'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                            }`}>
                                            <p>{message.content}</p>
                                        </div>
                                        <p className={`text-xs text-gray-400 mt-1 ${isClient ? 'text-right' : ''}`}>
                                            {isClient ? clientName : freelancerName} • {formatDateTime(new Date(message.createdAt))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
