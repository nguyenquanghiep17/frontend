import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'

const HUB_URL = 'https://localhost:44367/hub/mail'

let connection = null
const accountHandlers = new Map()

const ensureConnection = async () => {
  if (connection && connection.state === HubConnectionState.Connected) {
    return connection
  }

  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build()

    connection.on('NewEmail', payload => {
      const { account, email } = payload
      const handlers = accountHandlers.get(account)
      if (!handlers) return

      handlers.forEach(handler => {
        try {
          handler(email)
        } catch (err) {
          console.error('Realtime handler error', err)
        }
      })
    })

    connection.onreconnected(async () => {
      for (const account of accountHandlers.keys()) {
        try {
          await connection.invoke('Subscribe', account)
        } catch (err) {
          console.error('Failed to resubscribe to account', account, err)
        }
      }
    })
  }

  if (connection.state === HubConnectionState.Disconnected) {
    await connection.start()
  }

  return connection
}

export const subscribeToMail = async (accountEmail, handler) => {
  if (!accountEmail) {
    throw new Error('Account email is required to subscribe to realtime updates')
  }

  const conn = await ensureConnection()

  let handlers = accountHandlers.get(accountEmail)
  const isFirstSubscriber = !handlers

  if (!handlers) {
    handlers = new Set()
    accountHandlers.set(accountEmail, handlers)
  }

  handlers.add(handler)

  if (isFirstSubscriber) {
    await conn.invoke('Subscribe', accountEmail)
  }

  return async () => {
    const currentHandlers = accountHandlers.get(accountEmail)
    if (!currentHandlers) return

    currentHandlers.delete(handler)

    if (currentHandlers.size === 0) {
      accountHandlers.delete(accountEmail)
      try {
        await conn.invoke('Unsubscribe', accountEmail)
      } catch (err) {
        console.warn('Failed to unsubscribe from account', accountEmail, err)
      }
    }

    if (accountHandlers.size === 0 && connection) {
      try {
        await connection.stop()
      } catch (err) {
        console.warn('Failed to stop realtime connection', err)
      } finally {
        connection = null
      }
    }
  }
}


