'use client'
import { useState, useEffect, useRef } from 'react'
import { useSocket } from './SocketContext'

type Message = {
  id: string | number
  content: string
  senderId: number
  sender: {
    id: number
    username: string
    avatar?: string
  }
  createdAt: string | Date
}

export const ChatContainer = ({
  roomId,
  roomType,
  currentUserId
}: {
  roomId: string | number
  roomType: 'project' | 'direct'
  currentUserId: number
}) => {
  const { socket } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!socket) return

    console.log('Joining room:', roomId, roomType) // Debug log

    // Join room
    socket.emit('joinRoom', {
      roomId,
      roomType,
      currentUserId
    })

    // Message listeners
    const handleNewMessage = (newMessage: Message) => {
      console.log('New message received:', newMessage) // Debug log
      setMessages(prev => [...prev, newMessage])
      scrollToBottom()
    }

    const handleMessageHistory = (history: Message[]) => {
      console.log('Message history received:', history) // Debug log
      setMessages(history)
      scrollToBottom()
    }

    socket.on('newMessage', handleNewMessage)
    socket.on('messageHistory', handleMessageHistory)

    // Request message history
    socket.emit('getMessages', { roomId, roomType })

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('messageHistory', handleMessageHistory)
      socket.emit('leaveRoom', { roomId, roomType })
    }
  }, [socket, roomId, roomType, currentUserId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (message.trim() && socket) {
      console.log('Sending message:', message) // Debug log
      socket.emit('sendMessage', {
        content: message,
        roomId,
        roomType,
        senderId: currentUserId
      })
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs md:max-w-md rounded-lg p-3 ${msg.senderId === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}>
              <div className="flex items-center gap-2 mb-1">
                <div className="font-semibold">{msg.sender.username}</div>
                <div className="text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div>{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Type a message..."
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
