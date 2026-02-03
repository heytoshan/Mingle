"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websocketClasses = void 0;
const ws_1 = require("ws");
class websocketClasses {
    constructor(port) {
        const server = new ws_1.WebSocket.Server({ port: port });
        websocketClasses.wss = server;
        console.log(`server running at ${port}`);
    }
    start() {
        websocketClasses.wss.on("connection", (ws) => {
            console.log('Ping');
            ws.send("pong");
            return this.handleConnection(ws);
        });
    }
    handleConnection(ws) {
        ws.on("message", (data) => {
            const msg = JSON.parse(data);
            switch (msg.type) {
                case "connect":
                    this.connectServer(ws, msg.userId);
                    break;
                case "join":
                    this.joinRoom(msg.roomId, ws);
                    break;
                case "message":
                    this.broadcast(msg.message, msg.roomId, ws, msg.from);
                    break;
                case "onType":
                    this.broadcastTyping(ws, msg.roomId);
                    break;
                case "global":
                    this.joinRoom("global", ws);
                    break;
                default: console.log("wrong input");
            }
        });
        ws.on("close", () => {
            this.disconnect(ws);
        });
        ws.on("error", (err) => {
            console.error("WebSocket error:", err);
            this.disconnect(ws);
        });
    }
    //to connect 
    connectServer(ws, userId) {
        const existingConnection = websocketClasses.userConnections.get(userId);
        if (existingConnection) {
            existingConnection.close();
        }
        websocketClasses.userConnections.set(userId, ws);
        if (!websocketClasses.users.includes(userId)) {
            websocketClasses.users.push(userId);
        }
        ws.userId = userId;
        ws.send(JSON.stringify({
            "type": "connection",
            "message": "you have connected to server",
        }));
        this.broadcastUsers();
    }
    //on typing
    broadcastTyping(ws, roomId) {
        // const userRoom = websocketClasses.userRooms.get(ws);
        // if (!userRoom || userRoom !== roomId) {
        //   ws.send(JSON.stringify({ type: "error", messsage: "first join the room" }));
        // }
        // const roomUsers = websocketClasses.rooms[roomId];
        // roomUsers.forEach(user => {
        //   user.send(JSON.stringify({ type: "isTyping", message: true }))
        // })
    }
    //on join room
    joinRoom(roomId, ws) {
        if (websocketClasses.userRooms.has(ws)) {
            const prevRoom = websocketClasses.userRooms.get(ws);
            if (prevRoom) {
                websocketClasses.rooms[prevRoom].delete(ws);
                if (websocketClasses.rooms[prevRoom].size === 0) {
                    delete websocketClasses.rooms[prevRoom];
                }
            }
        }
        websocketClasses.userRooms.set(ws, roomId);
        if (!websocketClasses.rooms[roomId]) {
            websocketClasses.rooms[roomId] = new Set();
        }
        websocketClasses.rooms[roomId].add(ws);
        ws.send(JSON.stringify({
            "type": "join",
            "message": `you have joined ${roomId}`,
        }));
    }
    //disconnect
    disconnect(ws) {
        var _a, _b;
        const userId = ws.userId;
        if (!userId) {
            console.log("Disconnecting websocket without userId");
            return;
        }
        if (websocketClasses.userRooms.has(ws)) {
            const roomId = websocketClasses.userRooms.get(ws);
            if (roomId) {
                (_a = websocketClasses.rooms[roomId]) === null || _a === void 0 ? void 0 : _a.delete(ws);
                if (((_b = websocketClasses.rooms[roomId]) === null || _b === void 0 ? void 0 : _b.size) === 0) {
                    delete websocketClasses.rooms[roomId];
                }
            }
            websocketClasses.userRooms.delete(ws);
        }
        websocketClasses.userConnections.delete(userId);
        websocketClasses.users = websocketClasses.users.filter(user => user !== userId);
        this.broadcastUsers();
        console.log(`User ${userId} disconnected`);
        console.log("Remaining users:", websocketClasses.users);
    }
    //broadcast
    broadcast(message, roomId, ws, from) {
        const userRoom = websocketClasses.userRooms.get(ws);
        if (!userRoom || userRoom !== roomId) {
            ws.send(JSON.stringify({ type: "error", message: "first join the room" }));
            return;
        }
        const roomUsers = websocketClasses.rooms[roomId];
        roomUsers.forEach((user) => {
            if (user !== ws && user.readyState === ws_1.WebSocket.OPEN) {
                user.send(JSON.stringify({
                    type: "message",
                    message: {
                        from: from,
                        roomId: roomId,
                        content: message
                    }
                }));
            }
        });
    }
    broadcastUsers() {
        websocketClasses.wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "connectedUsers",
                    message: [...websocketClasses.users],
                }));
            }
        });
        console.log("Broadcasting users:", websocketClasses.users);
    }
}
exports.websocketClasses = websocketClasses;
websocketClasses.rooms = {};
websocketClasses.users = [];
websocketClasses.userRooms = new Map();
websocketClasses.userConnections = new Map();
