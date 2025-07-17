import mongoose from "mongoose"

// Define the shape of our connection object
interface ConnectionObject {
  isConnected: mongoose.ConnectionStates
}

// Create a connection object to track the connection status
const connection: ConnectionObject = {
  isConnected: mongoose.ConnectionStates.disconnected,
}

/**
 * Connects to the MongoDB database
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB(): Promise<typeof mongoose> {
  // If we're already connected, return the existing connection
  if (connection.isConnected === mongoose.ConnectionStates.connected) {
    console.log("Using existing database connection")
    return mongoose
  }

  // Check if we have a MongoDB URI
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be defined")
  }

  try {
    // Disconnect any existing connections first
    if (mongoose.connections[0].readyState !== 0) {
      await mongoose.disconnect()
    }

    // Attempt to connect to the database with improved settings
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Increased timeout to 30s
      connectTimeoutMS: 30000, // Connection timeout 30s
      socketTimeoutMS: 60000, // Socket timeout 60s
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain a minimum of 2 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      retryWrites: true, // Enable retry writes for better reliability
      directConnection: false, // Use replica set connection
    })

    // Update connection status
    connection.isConnected = db.connections[0].readyState

    if (connection.isConnected === mongoose.ConnectionStates.connected) {
      console.log("✅ Successfully connected to MongoDB")
    } else {
      console.log("⚠️ Failed to establish a stable connection to MongoDB")
    }

    return mongoose
  } catch (error: any) {
    console.error("❌ Error connecting to MongoDB:", error.message)
    connection.isConnected = mongoose.ConnectionStates.disconnected
    
    // For development, provide helpful error messages
    if (process.env.NODE_ENV === 'development') {
      if (error.message.includes('Server selection timed out')) {
        console.log("💡 Possible solutions:")
        console.log("   - Check if MongoDB is running")
        console.log("   - Verify MONGODB_URI in .env file")
        console.log("   - Check network connectivity")
        console.log("   - Ensure MongoDB allows connections from your IP")
      }
    }
    
    throw error
  }
}

/**
 * Closes the MongoDB connection
 */
async function disconnectDB(): Promise<void> {
  if (connection.isConnected !== mongoose.ConnectionStates.connected) {
    return
  }

  try {
    await mongoose.disconnect()
    connection.isConnected = mongoose.ConnectionStates.disconnected
    console.log("Disconnected from DB")
  } catch (error) {
    console.error("Error disconnecting from DB:", error)
    throw error
  }
}

/**
 * Get current connection status
 */
function getConnectionStatus(): mongoose.ConnectionStates {
  return connection.isConnected
}

/**
 * Check if database is connected
 */
function isConnected(): boolean {
  return connection.isConnected === mongoose.ConnectionStates.connected
}

export { connectDB, disconnectDB, getConnectionStatus, isConnected }
export default connectDB
