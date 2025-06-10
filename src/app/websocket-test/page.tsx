"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { io, Socket } from "socket.io-client"; // Import Socket type for better type inference

// IMPORTANT: Initialize socket outside the component to prevent
// multiple connections on re-renders, and manage its lifecycle.
// If you navigate between pages with this component, it will
// maintain a single connection.
let socket: Socket | null = null;
if (typeof window !== "undefined") {
  // Only initialize in the browser environment
  socket = io("http://localhost:3000");
}

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]); // State to store chat messages
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

  // Effect for managing socket connection status and listeners
  useEffect(() => {
    if (!socket) return; // Ensure socket is initialized

    if (socket.connected) {
      onConnect();
    }

    // Helper function to scroll to the bottom of the messages
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    function onConnect() {
      setIsConnected(true);
      setTransport(socket!.io.engine.transport.name); // Using socket! as it's checked above

      socket!.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
      console.log("Socket connected:", socket!.id);
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
      console.log("Socket disconnected:", socket!.id);
    }

    function onChatMessage(msg: string) {
      setMessages((prevMessages) => [...prevMessages, msg]);
      scrollToBottom(); // Scroll after new message
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat message", onChatMessage); // Listen for incoming chat messages

    // Cleanup function
    return () => {
      socket!.off("connect", onConnect);
      socket!.off("disconnect", onDisconnect);
      socket!.off("chat message", onChatMessage);
      // IMPORTANT: Do NOT disconnect the socket here if you want it to persist across page navigations.
      // Only disconnect if you truly want to close the connection when this component unmounts for good.
      // socket.disconnect(); // Uncomment only if you want to close the connection here
    };
  }, []); // Empty dependency array ensures this effect runs once on mount

  // Handle sending messages
  const sendMessage = (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (socket && messageInput.trim()) {
      socket.emit("chat message", messageInput.trim()); // Emit the message to the server
      setMessageInput(""); // Clear the input field
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "auto",
        border: "1px solid #ccc",
        borderRadius: "8px",
      }}
    >
      <h1>Basic Chat App</h1>
      <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
      <p>Transport: {transport}</p>

      <div
        style={{
          border: "1px solid #eee",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
          marginBottom: "15px",
          backgroundColor: "#f9f9f9",
          borderRadius: "4px",
        }}
      >
        {messages.map((msg, index) => (
          <p key={index} style={{ margin: "5px 0" }}>
            {msg}
          </p>
        ))}
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </div>

      <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flexGrow: 1,
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
