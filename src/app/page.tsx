"use client";

export default function Home() {
  const messages = [
    {
      id: "1",
      text: "Hey everyone, welcome to the chat!",
      senderId: "user1",
      timestamp: new Date(),
    },
    {
      id: "2",
      text: "Glad to be here!",
      senderId: "user2",
      timestamp: new Date(),
    },
    {
      id: "3",
      text: "This is a simple frontend skeleton.",
      senderId: "user1",
      timestamp: new Date(),
    },
    {
      id: "4",
      text: "No backend logic yet!",
      senderId: "user2",
      timestamp: new Date(),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-800 text-gray-100 font-inter">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 flex flex-col p-4 rounded-lg m-2 shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">Channels</h2>
        <ul className="space-y-2">
          <li className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors">
            # general
          </li>
          <li className="p-2 rounded-md hover:bg-gray-700 cursor-pointer transition-colors">
            # random
          </li>
          <li className="p-2 rounded-md hover:bg-gray-700 cursor-pointer transition-colors">
            # announcements
          </li>
        </ul>
        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="flex items-center text-sm">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-2">
              U
            </div>
            <span>User ID: agariomasster</span>
          </div>
        </div>
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-700 rounded-lg m-2 shadow-lg">
        {/* Chat Header */}
        <div className="p-4 bg-gray-900 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-bold text-white"># general</h2>
        </div>

        {/* Messages Display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div className="max-w-xl p-3 rounded-lg shadow">
                <div className="font-semibold text-sm mb-1">{msg.senderId}</div>
                <p className="text-base break-words">{msg.text}</p>
                {msg.timestamp && (
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
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
}
