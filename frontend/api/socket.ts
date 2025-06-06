import { io } from "socket.io-client";

// Initialize the socket connection
export const socket = io(process.env.EXPO_PUBLIC_API_URL); // Replace with your socket server URL
