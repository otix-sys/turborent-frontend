'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Send, MessageSquare, Loader2 } from 'lucide-react'
import { messagesApi } from '../../../lib/api'
import { Conversation, Message } from '../../../types'
import { useAuth } from '../../../hooks/useAuth'
import { io } from 'socket.io-client'

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConv, setActiveConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<ReturnType<typeof io> | null>(null)

  // Charger conversations
  useEffect(() => {
    messagesApi.getConversations()
      .then(r => setConversations(r.data.conversations || []))
      .catch(() => {})
      .finally(() => setLoadingConvs(false))
  }, [])

  // Socket.IO pour temps réel
  useEffect(() => {
    if (!user) return
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true
    })
    socketRef.current = socket

    socket.on('new_message', ({ conversationId, senderId, preview }) => {
      if (activeConv?.id === conversationId) {
        loadMessages(conversationId)
      }
      // Mettre à jour la conversation dans la liste
      setConversations(convs => convs.map(c =>
        c.id === conversationId ? { ...c, last_message: preview, unread_count: c.id === activeConv?.id ? 0 : c.unread_count + 1 } : c
      ))
    })

    return () => { socket.disconnect() }
  }, [user, activeConv])

  const loadMessages = useCallback((convId: string) => {
    setLoadingMsgs(true)
    messagesApi.getMessages(convId)
      .then(r => setMessages(r.data.messages || []))
      .catch(() => {})
      .finally(() => setLoadingMsgs(false))
  }, [])

  const openConversation = (conv: Conversation) => {
    setActiveConv(conv)
    loadMessages(conv.id)
    // Rejoindre la room socket
    socketRef.current?.emit('join_conversation', conv.id)
    // Marquer comme lu
    setConversations(convs => convs.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c))
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)
    try {
      const res = await messagesApi.send(activeConv.id, content)
      setMessages(m => [...m, res.data.message])
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    } catch { setInput(content) }
    finally { setSending(false) }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace('/api/v1', '')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Liste conversations */}
          <div className="w-80 border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="p-4 space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Aucune conversation</p>
                </div>
              ) : conversations.map(conv => (
                <button key={conv.id} onClick={() => openConversation(conv)}
                  className={`w-full flex items-center gap-3 p-4 text-left border-b border-gray-50 hover:bg-gray-50 transition-colors ${activeConv?.id === conv.id ? 'bg-blue-50 border-l-2 border-l-blue-600' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {conv.first_name[0]}{conv.last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">{conv.first_name} {conv.last_name}</p>
                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">{conv.unread_count}</span>
                      )}
                    </div>
                    {conv.brand && <p className="text-xs text-blue-600 truncate">{conv.brand} {conv.model}</p>}
                    <p className="text-xs text-gray-400 truncate mt-0.5">{conv.last_message || 'Démarrer la conversation…'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Zone de chat */}
          <div className="flex-1 flex flex-col min-w-0">
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-14 h-14 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Sélectionnez une conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                    {activeConv.first_name[0]}{activeConv.last_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{activeConv.first_name} {activeConv.last_name}</p>
                    {activeConv.brand && <p className="text-xs text-blue-600">{activeConv.brand} {activeConv.model}</p>}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMsgs ? (
                    <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className={`skeleton h-10 rounded-2xl ${i%2===0 ? 'w-2/3' : 'w-1/2 ml-auto'}`} />)}</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Démarrez la conversation</div>
                  ) : messages.map(msg => {
                    const isMe = msg.sender_id === user?.id
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                      placeholder="Votre message… (Entrée pour envoyer)"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={2000}
                    />
                    <button onClick={sendMessage} disabled={!input.trim() || sending}
                      className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
