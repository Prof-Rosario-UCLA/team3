import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        // Listen for 'chat message' event from clients
        socket.on("chat message", (msg) => {
            console.log(`Message received from ${socket.id}: ${msg}`);
            // Broadcast the message to all connected clients
            io.emit("chat message", msg);
        });

        // Listen for 'msg-send' event from clients
        socket.on("msg-send", (chat_id, user, timestamp, content) => {
            console.log(`Message received from ${user}: ${content}`);
            // Broadcast the message to all connected clients

            io.emit("msg-send", chat_id, user, timestamp, content);
        });

        // Listen for disconnect event
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