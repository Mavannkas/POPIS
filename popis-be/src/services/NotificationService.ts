interface SSEConnection {
  userId: string
  response: any // Generic response object that supports write() and on() methods
}

class NotificationService {
  private static instance: NotificationService
  private connections: Map<string, SSEConnection[]> = new Map()

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  addConnection(userId: string, response: any): void {
    const userConnections = this.connections.get(userId) || []
    userConnections.push({ userId, response })
    this.connections.set(userId, userConnections)

    console.log(`[NotificationService] User ${userId} connected. Total connections: ${userConnections.length}`)

    // Remove connection when client closes
    response.on('close', () => {
      this.removeConnection(userId, response)
    })
  }

  removeConnection(userId: string, response: any): void {
    const userConnections = this.connections.get(userId) || []
    const filtered = userConnections.filter((conn) => conn.response !== response)

    if (filtered.length === 0) {
      this.connections.delete(userId)
    } else {
      this.connections.set(userId, filtered)
    }

    console.log(`[NotificationService] User ${userId} disconnected. Remaining connections: ${filtered.length}`)
  }

  sendNotification(userId: string, notification: any): void {
    const userConnections = this.connections.get(userId)

    if (!userConnections || userConnections.length === 0) {
      console.log(`[NotificationService] No active connections for user ${userId}`)
      return
    }

    const data = JSON.stringify(notification)

    userConnections.forEach((connection) => {
      try {
        connection.response.write(`data: ${data}\n\n`)
        console.log(`[NotificationService] Sent notification to user ${userId}`)
      } catch (error) {
        console.error(`[NotificationService] Error sending notification to user ${userId}:`, error)
        this.removeConnection(userId, connection.response)
      }
    })
  }

  sendNotificationToMultiple(userIds: string[], notification: any): void {
    userIds.forEach((userId) => {
      this.sendNotification(userId, notification)
    })
  }

  getActiveConnectionsCount(userId?: string): number {
    if (userId) {
      return this.connections.get(userId)?.length || 0
    }
    return Array.from(this.connections.values()).reduce((sum, conns) => sum + conns.length, 0)
  }
}

export default NotificationService.getInstance()
