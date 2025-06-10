"use client";

import { useAuth } from "@/lib/authContext";
import { useState, useEffect } from "react";

export default function Home() {
  const { user, token, signInWithGoogle, signOutUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);

  const [selectedChat, setSelectedChat] = useState("Selected Chat");

  const [selectedChatId, setSelectedChatId] = useState("awoooga");

  const [newChatName, setNewChatName] = useState();

  const [chatsLoading, setChatsLoading] = useState(false);

  async function createUser() {
    await fetch("/api/user/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function createChat() {
    const response = await fetch("/api/chat/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: "Group Chat 2",
      }),
    });

    const { result, error } = await response.json();

    if (result && !error) {
      alert("Chat Added!");
    }
  }

  async function getChatContents(chat_id: string) {
    if (chat_id) {
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
    }
  }

  async function loadMessages(chat_id: string) {
    console.log("Loading chat messages for " + chat_id);
    await getChatContents(chat_id);
    setSelectedChatId(chat_id);
  }

  async function getChatsForUser() {
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
    }
  }

  async function addMemberToChat() {
    const member_email = "kevinbowditch11@gmail.com";

    const response = await fetch("/api/chat/add-member", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: member_email,
        chat_id: selectedChatId,
      }),
    });

    const { result, error } = await response.json();

    if (result && !error) {
      alert("Chat Added!");
    }
  }

  useEffect(() => {
    if (user === null || user === undefined) {
      return;
    }

    createUser();

    console.log("Fetching Channels for user");
    getChatsForUser();

    setChatsLoading(false);

    getChatContents();
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
        <button onClick={createChat}>Click me!</button>\
        <button onClick={getChatsForUser}>Fetch all chats!</button>
        <button onClick={addMemberToChat}>
          Add kevinbowditch11@gmail.com to chat!
        </button>
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 flex flex-col p-4 rounded-lg m-2 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-white">Channels</h2>
          {chatsLoading === true ? (
            <p className="text-white">Loading your Channels...</p>
          ) : (
            <ul className="space-y-2">
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  className={`p-2 rounded-md ${
                    selectedChatId === chat.id ? "bg-gray-700" : ""
                  } hover:bg-gray-600 cursor-pointer transition-colors`}
                  onClick={() => {
                    loadMessages(chat.id);
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
                U
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
        <div className="flex-1 flex flex-col bg-gray-700 rounded-lg m-2 shadow-lg">
          {/* Chat Header */}
          <div className="p-4 bg-gray-900 rounded-t-lg flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">{selectedChat}</h2>
          </div>

          {/* Messages Display */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index}>
                <div className="max-w-xl p-3 rounded-lg shadow">
                  <div className="font-semibold text-sm mb-1">{msg.user}</div>
                  <p className="text-base break-words">{msg.content}</p>

                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div /> {/* Empty div for scrolling */}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-gray-900 rounded-b-lg flex items-center">
            <input
              type="text"
              className="flex-1 p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
            />
            <button className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Send
            </button>
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
