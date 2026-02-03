import { websocketClasses } from "./websocketClasses";
import { configDotenv } from "dotenv"

configDotenv()
const port = process.env.PORT!
console.log(port)
let correctPort: number;
if (typeof port == "string") correctPort = parseInt(port);
else correctPort = port
const server = new websocketClasses(correctPort);
server.start();
