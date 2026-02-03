"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importStar(require("ws"));
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer((req, res) => {
    // console.log(new Date() + ` received request for ` + req.url);
    res.end("hi there");
});
const wss = new ws_1.WebSocketServer({ server });
const room = new Event("room");
const users = [];
let userCount = 0;
// Store clients by room
const rooms = {};
wss.on('connection', function connection(ws) {
    // Error handling
    ws.on('error', console.error);
    ws.on("room", () => {
        console.log("room event trigger");
    });
    // ws.emit("room", () => {
    //   console.log("room event trigger")
    // })
    // ws.addEventListener("message" , () => {
    //   console.log("room event trigger")
    // })
    // Room variable to store the room of this client
    let currentRoom = null;
    ws.on('message', function message(data) {
        const message = JSON.parse(data);
        const userId = message.myId;
        if (message.type === 'join') {
            const roomId = message.roomId;
            if (currentRoom && rooms[currentRoom]) {
                rooms[currentRoom].delete(ws);
                if (rooms[currentRoom].size === 0) {
                    delete rooms[currentRoom]; // Delete empty room
                }
            }
            // Join the new room
            currentRoom = roomId;
            if (!roomId)
                currentRoom = "global";
            if (!rooms[roomId]) {
                rooms[roomId] = new Set();
            }
            rooms[roomId].add(ws);
            if (!users.find((id) => id === userId)) {
                users.push(userId);
            }
            ws.send(JSON.stringify({ message: `You joined room: ${currentRoom}` }));
            ;
            const roomClients = rooms[currentRoom];
            if (roomClients) {
                roomClients.forEach((client) => {
                    if (client !== ws && client.readyState === ws_1.default.OPEN) {
                        client.send(JSON.stringify({
                            roomId: currentRoom,
                            message: "",
                            currentRoom: users
                        }));
                    }
                });
            }
        }
        else if (message.type === 'message' && currentRoom) {
            const roomClients = rooms[currentRoom];
            if (roomClients) {
                roomClients.forEach(client => {
                    if (client !== ws && client.readyState === ws_1.default.OPEN) {
                        client.send(JSON.stringify({
                            message: message.content,
                            roomId: currentRoom,
                        }));
                    }
                });
            }
        }
    });
    console.log("user connected", ++userCount);
    ws.send(JSON.stringify({ message: "hello message from server" }));
});
server.listen(8080, () => {
    console.log(new Date() + ` Server is listening on port 8080`);
});
