import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
// For deployment, use process.env.HOST or '0.0.0.0' to listen on all network interfaces
const hostname = process.env.HOST || "0.0.0.0"; // Change 1: Listen on all interfaces
// For deployment, use the PORT environment variable provided by the platform
const port = parseInt(process.env.PORT || "3000", 10); // Change 2: Use dynamic port

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port }); // Pass dynamic hostname and port to Next.js
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
        cors: {
            // For production, you'll need to set the actual domain(s) where your client app will be hosted.
            // For development, it's still localhost:3000.
            // In production, this would be e.g., "https://your-app-domain.com"
            origin: ["https://campfire.howard-zhu.com", "https://www.campfire.howard-zhu.com", `http://localhost:${port}`, "https://cf.howard-zhu.com"],
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("chat message", (msg) => {
            console.log(`Message received from ${socket.id}: ${msg}`);
            io.emit("chat message", msg);
        });

        socket.on("msg-send", (chat_id, user, timestamp, content) => {
            console.log(`Message received from ${user}: ${content}`);
            io.emit("msg-send", chat_id, user, timestamp, content);
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    httpServer
        .once("error", (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});