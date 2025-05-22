// socketEvents.js
const userSockets = new Map() // Store user_id to socket IDs

module.exports = (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Register user ID with socket ID
  socket.on("register", (user_id) => {
    const userId = user_id.toString()
    console.log("Connected User Id:", userId)
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set())
    }
    userSockets.get(userId).add(socket.id)

    socket.join(userId) // Join the user-specific room
    console.log(`User registered with ID: ${userId}`)
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const [userId, sockets] of userSockets.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          userSockets.delete(userId) // Clean up if no sockets remain
        }
        break
      }
    }
    console.log(`User disconnected: ${socket.id}`)
  })

  // Optional: Handle explicit logout
  socket.on("logout", (user_id) => {
    const userId = user_id.toString()
    if (userSockets.has(userId)) {
      userSockets.get(userId).delete(socket.id)
      if (userSockets.get(userId).size === 0) {
        userSockets.delete(userId)
      }
      console.log(`User logged out with ID: ${userId}`)
    }
  })
}
