const { io } = require("socket.io-client");

// Connect to the server root, not an API route
const socket = io("http://localhost:3010", {
  query: { attendeeId: 1 } // your test attendee ID
});

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server, socket id:", socket.id);
});

socket.on("disconnect", () => {
  console.log("⚠️ Disconnected from server");
});

socket.on("newAnnouncement", (announcement) => {
  console.log("📢 New announcement received:", announcement);
});

// Optional: debug connection errors
socket.on("connect_error", (err) => {
  console.log("❌ Connection error:", err.message);
});

process.stdin.resume();