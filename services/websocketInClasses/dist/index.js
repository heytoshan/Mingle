"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocketClasses_1 = require("./websocketClasses");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const port = process.env.PORT;
console.log(port);
let correctPort;
if (typeof port == "string")
    correctPort = parseInt(port);
else
    correctPort = port;
const server = new websocketClasses_1.websocketClasses(correctPort);
server.start();
