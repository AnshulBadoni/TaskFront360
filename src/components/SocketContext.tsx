  // context/SocketContext.tsx
  'use client'

  import { getAuthToken } from '@/utils/cookies'
  import { createContext, useContext, useEffect, useState } from 'react'
  import { io as ClientIO, io, Socket } from 'socket.io-client'

  type SocketContextType = {
    socket: Socket | null
    isConnected: boolean
  }

  const SOCKET = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL

  const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
  })


  export const useSocket = () => {
    return useContext(SocketContext)
  }

  export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
      // In your frontend SocketContext
      const socketInstance = io(SOCKET, {
        path: "/socket.io",
        autoConnect: true,
        transports: ["websocket", "polling"],
        withCredentials: true,
        auth: {
          token: typeof window !== "undefined" ? getAuthToken() : null
        }
      });

      socketInstance.on('connect', () => {
        setIsConnected(true)
      })

      socketInstance.on('disconnect', () => {
        setIsConnected(false)
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }, [])

    return (
      <SocketContext.Provider value={{ socket, isConnected }}>
        {children}
      </SocketContext.Provider>
    )
  }
