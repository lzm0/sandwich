import process from "process";
import pty from "node-pty";
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: process.env.PORT || 3000 });

console.log(`Listening on port ${server.address().port}`);

server.on("connection", (socket) => {
  const term = pty.spawn("bash", [], { name: "xterm-color" });

  setTimeout(() => term.kill(), 60 * 60 * 1000);

  let inactivityTimeout = setTimeout(() => term.kill(), 60 * 1000);

  term.onData((data) => socket.send(data));

  socket.on("message", (data) => {
    term.write(data);
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => term.kill(), 60 * 1000);
  });
});
