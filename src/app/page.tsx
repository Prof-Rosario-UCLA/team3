"use client";

import { useAuth } from "@/lib/authContext";
import { useState, useEffect, useRef } from "react";

import { io, Socket } from "socket.io-client"; // Import Socket type for better type inference

let socket: Socket | null = null;
if (typeof window !== "undefined") {
  // Use a public environment variable (NEXT_PUBLIC_ prefix)
  // for the client to know the server URL.
  // In production, this would be your deployed backend URL.
  const SOCKET_SERVER_URL = "http://localhost:3000";
  socket = io(SOCKET_SERVER_URL);
}

interface Chat {
  id: string; // Or number, depending on your actual ID type
  name: string;
  member_emails: string[];
  // Add any other properties your chat object might have
}

// Define an interface for your message object
interface Message {
  user: string;
  timestamp: string;
  content: string;
  // Add any other properties your message object might have
}

interface Chat {
  id: string; // Or number, depending on your actual ID type
  name: string;
  member_emails: string[];
  // Add any other properties your chat object might have
}

// Define an interface for your message object
interface Message {
  user: string;
  timestamp: string;
  content: string;
  // Add any other properties your message object might have
}

export default function Home() {
  // WEBSOCKET SETUP
  // const [isConnected, setIsConnected] = useState(false);
  // const [transport, setTransport] = useState("N/A");

  const { user, token, signInWithGoogle, signOutUser } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState([]);

  const [showSidebar, setShowSidebar] = useState(false);

  const [selectedChat, setSelectedChat] = useState("Selected Chat");

  const [selectedChatId, setSelectedChatId] = useState("");
  const [selectedChatEmails, setSelectedChatEmails] = useState([""]);

  const [messageContent, setMessageContent] = useState("");

  const [newChatName, setNewChatName] = useState("");

  const [newMemberName, setNewMemberName] = useState("");

  const [chatsLoading, setChatsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendMessageLoading, setSendMessageLoading] = useState(false);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect for managing socket connection status and listeners
  useEffect(() => {
    function onChatMessage(
      chat_id: string,
      user: string,
      timestamp: string,
      content: string
    ) {
      console.log("**********");
      console.log(chat_id);
      console.log(selectedChatId);
      console.log("**********");
      if (chat_id === selectedChatId) {
        setMessages((prevMsgs) => [
          ...prevMsgs,
          {
            user,
            timestamp,
            content,
          },
        ]);
        scrollToBottom(); // Scroll after new message
      }
    }

    function onConnect() {
      // setIsConnected(true);
      // setTransport(socket!.io.engine.transport.name); // Using socket! as it's checked above

      // socket!.io.engine.on("upgrade", (transport) => {
      //   setTransport(transport.name);
      // });
      console.log("Socket connected:", socket!.id);
    }

    function onDisconnect() {
      // setIsConnected(false);
      // setTransport("N/A");
      console.log("Socket disconnected:", socket!.id);
    }

    if (!socket) return; // Ensure socket is initialized

    if (socket.connected) {
      onConnect();
    }

    scrollToBottom();

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("msg-send", onChatMessage); // Listen for incoming chat messages

    // Cleanup function
    return () => {
      socket!.off("connect", onConnect);
      socket!.off("disconnect", onDisconnect);
      socket!.off("msg-send", onChatMessage);
      // IMPORTANT: Do NOT disconnect the socket here if you want it to persist across page navigations.
      // Only disconnect if you truly want to close the connection when this component unmounts for good.
      // socket.disconnect(); // Uncomment only if you want to close the connection here
    };
  }); // Empty dependency array ensures this effect runs once on mount

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function createUser() {
    await fetch("/api/user/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function createChat() {
    if (newChatName) {
      setChatsLoading(true);
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newChatName,
        }),
      });

      const { error } = await response.json();

      if (error) {
        alert(error);
      }

      await getChatsForUser();
      setNewChatName("");
    }
  }

  async function getChatContents(chat_id: string) {
    if (chat_id) {
      setMessagesLoading(true);
      setMessages([
        {
          user: "",
          timestamp: "",
          content: "",
        },
      ]);
      const response = await fetch("/api/chat/get-chat-contents/" + chat_id, {
        method: "GET",
      });

      const { result, error } = await response.json();

      if (error) {
        console.log(error);
        alert("ERROR " + error);
      } else {
        if (result) {
          setMessages(result.messages);
        }
      }
      setMessagesLoading(false);
    }
  }

  async function loadMessages(
    chat_id: string,
    chat_name: string,
    member_emails: string[]
  ) {
    console.log("Loading chat messages for " + chat_id);
    await getChatContents(chat_id);
    setSelectedChatId(chat_id);
    setSelectedChat(chat_name);
    setSelectedChatEmails(member_emails);
  }

  async function getChatsForUser() {
    setChatsLoading(true);

    const response = await fetch("/api/chat/get-user-chats", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { result, error } = await response.json();

    if (error) {
      console.log(error);
      alert("ERROR " + error);
    } else {
      setChats(result);
      setChatsLoading(false);
    }
  }

  async function addMemberToChat() {
    setMessagesLoading(true);
    const response = await fetch("/api/chat/add-member", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: newMemberName,
        chat_id: selectedChatId,
      }),
    });

    const { result, error } = await response.json();

    if (error) {
      alert(error);
    } else if (result === false) {
      alert("user not found!");
    } else if (result === true) {
      setNewMemberName("");
      setSelectedChatEmails((prev) => {
        if (!prev.includes(newMemberName)) {
          return [...prev, newMemberName];
        }
        return prev; // If it already exists, return the previous state unchanged
      });
    } else {
      alert("blehhh");
    }
    setMessagesLoading(false);
  }

  async function sendMessage() {
    if (messageContent && user) {
      setSendMessageLoading(true);
      const response = await fetch("/api/chat/add-message", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: selectedChatId,
          message: {
            user: user.email,
            content: messageContent,
          },
        }),
      });

      const { result, error } = await response.json();

      if (error) {
        alert(error);
      } else {
        console.log("Message Sent!");

        const timestamp = result.timestamp;

        if (socket && user) {
          socket.emit(
            "msg-send",
            selectedChatId,
            user.email,
            timestamp,
            messageContent
          );
          setMessageContent("");
          setSendMessageLoading(false);
        }
      }
    }
  }

  useEffect(() => {
    if (user === null || user === undefined) {
      return;
    }

    createUser();

    console.log("Fetching Channels for user");
    getChatsForUser();

    getChatContents(selectedChatId);
  }, [user]);

  // const messages = [
  //   {
  //     id: "1",
  //     text: "Hey everyone, welcome to the chat!",
  //     senderId: "user1",
  //     timestamp: new Date(),
  //   },
  //   {
  //     id: "2",
  //     text: "Glad to be here!",
  //     senderId: "user2",
  //     timestamp: new Date(),
  //   },
  //   {
  //     id: "3",
  //     text: "This is a simple frontend skeleton.",
  //     senderId: "user1",
  //     timestamp: new Date(),
  //   },
  //   {
  //     id: "4",
  //     text: "No backend logic yet!",
  //     senderId: "user2",
  //     timestamp: new Date(),
  //   },
  // ];

  // const chats = [
  //   { id: "chat-1", name: "Chat 1" },
  //   { id: "chat-2", name: "Chat 2" },
  //   { id: "chat-3", name: "Chat 3" },
  //   { id: "chat-4", name: "General Discussion" },
  // ];
  if (user !== null && user !== undefined) {
    return (
      <div className="flex h-screen bg-gray-800 text-gray-100 font-inter">
        {/* Sidebar */}
        <div
          className={`sm:w-64 bg-gray-900 flex flex-col p-4 rounded-lg m-2 shadow-lg max-sm:${
            showSidebar ? "flex-1 w-screen" : "hidden"
          }`}
        >
          <h2 className="text-xl font-bold mb-4 text-white">Channels</h2>
          <div className="flex">
            <input
              placeholder="Channel Name..."
              className="p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-3/4 mr-1"
              value={newChatName}
              onChange={(e) => {
                setNewChatName(e.target.value);
              }}
            ></input>
            <button
              onClick={createChat}
              className="bg-gray-700 hover:bg-gray-600 rounded-md p-2 text-2xl w-1/4"
            >
              +
            </button>
          </div>
          <br></br>
          {chatsLoading === true ? (
            <p className="text-white">Loading your Channels...</p>
          ) : (
            <ul className="space-y-2">
              {chats.map((chat: Chat) => (
                <li
                  key={chat.id}
                  className={`p-2 rounded-md ${
                    selectedChatId === chat.id ? "bg-gray-700" : ""
                  } hover:bg-gray-600 cursor-pointer transition-colors`}
                  onClick={() => {
                    loadMessages(chat.id, chat.name, chat.member_emails);
                    setShowSidebar(false);
                  }}
                >
                  {chat.name}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-2">
                {user && user.email && user.email[0]}
              </div>
              <span>User ID: {user.email}</span>
            </div>
          </div>
          <br></br>
          <button
            onClick={signOutUser}
            className="bg-gray-700 hover:bg-gray-600 rounded-md p-2"
          >
            Log out
          </button>
        </div>
        {/* Main Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-gray-700 rounded-lg m-2 shadow-lg max-sm:${
            showSidebar ? "hidden" : ""
          }`}
        >
          {/* Chat Header */}
          <button
            className="bg-gray-800 active:bg-gray-600 rounded-t-md p-2 sm:hidden"
            onClick={() => setShowSidebar(true)}
          >
            {`<`} Back to Channels/Account
          </button>
          <div className="p-4 bg-gray-900 flex items-center justify-between sm:rounded-t-lg">
            <h2 className="text-xl font-bold text-white">{selectedChat}</h2>
            {messages.length > 0 && (
              <div className="flex">
                <input
                  placeholder="Member Email..."
                  className="p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-3/4 mr-1"
                  value={newMemberName}
                  onChange={(e) => {
                    setNewMemberName(e.target.value);
                  }}
                ></input>
                <button
                  onClick={addMemberToChat}
                  className="bg-gray-700 hover:bg-gray-600 rounded-md p-2 text-2xl w-1/4"
                >
                  +
                </button>
              </div>
            )}
          </div>
          <div className="px-4 pb-4 bg-gray-900 items-center justify-between">
            {messagesLoading ? (
              <div>Loading Chat Members...</div>
            ) : (
              <div>
                <div className="font-bold">Members:</div>
                {selectedChatEmails &&
                  selectedChatEmails.map((email, index) => (
                    <div key={index}>{email}</div>
                  ))}
              </div>
            )}
          </div>

          {/* Messages Display */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((msg, index) => (
                <div key={index}>
                  <div className="max-w-xl p-3 rounded-lg shadow">
                    <div className="font-semibold text-sm mb-1">{msg.user}</div>
                    <p className="text-base break-words">{msg.content}</p>

                    <div className="text-xs text-gray-400 mt-1 text-right">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Please select or create a chat to view and send messages!</p>
            )}
            {messagesLoading && <div>Loading messages...</div>}
            <div ref={messagesEndRef} />
            <div /> {/* Empty div for scrolling */}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-gray-900 rounded-b-lg flex items-center">
            <input
              type="text"
              className="flex-1 p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value);
              }}
            />
            {messages.length === 0 || sendMessageLoading ? (
              <button className="ml-4 px-6 py-3 text-gray-400 rounded-md bg-gray-600">
                Send
              </button>
            ) : (
              <button
                onClick={sendMessage}
                className="ml-4 px-6 py-3 text-white rounded-md bg-blue-600 hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Send
              </button>
            )}
          </div>
        </div>
      </div>
    );
  } else if (user === null) {
    return (
      <div className="flex h-screen bg-gray-800 text-gray-100 font-inter justify-center items-center">
        <div>
          <p>Please Sign In!</p>
          <button
            onClick={() => {
              setChats([]);
              setMessages([]);
              setSelectedChatId("");
              signInWithGoogle();
            }}
            className="my-4 mr-2 inline-flex bg-[#3e72aa] items-center justify-between rounded-lg px-5 py-2.5 text-center text-white text-sm font-medium hover:bg-[#24476b]"
          >
            <svg
              className="-ml-1 mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              />
            </svg>
            Sign in with Google
            <div />
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex h-screen bg-gray-800 text-gray-100 font-inter justify-center items-center">
        <p>Loading Campfire...</p>
      </div>
    );
  }
}
