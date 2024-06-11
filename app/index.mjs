import process from "process";
import pty from "node-pty";
import { WebSocketServer } from "ws";

const HARD_TIMEOUT = 60 * 60 * 1000;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

const server = new WebSocketServer({ port: process.env.PORT });

server.on("listening", () => {
  console.log(`Listening on port ${server.address().port}`);
});

server.on("connection", (socket) => {
  const term = pty.spawn(
    "/usr/bin/docker",
    ["exec", "-it", "sandbox", "/bin/bash"],
    { name: "xterm-color" }
  );

  setTimeout(() => term.kill(), HARD_TIMEOUT);

  let inactivityTimeout = setTimeout(() => term.kill(), INACTIVITY_TIMEOUT);

  term.onData((data) => socket.send(data));

  socket.on("message", (data) => {
    term.write(data);
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => term.kill(), INACTIVITY_TIMEOUT);
  });

  socket.on("close", () => {
    term.kill();
  });
});
