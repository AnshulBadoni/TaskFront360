// app/api/socket/route.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { Server as NetServer } from 'http'

export const config = {
  api: {
    bodyParser: false,
  },
}
  
export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log('New Socket.io server...')
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
    })
    res.socket.server.io = io
  }
  res.end()
}
