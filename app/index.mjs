import process from "process";
import pty from "node-pty";
import { WebSocketServer } from "ws";
import { exec } from "child_process";

const HARD_RESET_INTERVAL = 10 * 60 * 1000;
const SWEEP_INTERVAL = 30 * 1000;

const server = new WebSocketServer({ port: process.env.PORT });

server.on("listening", () => {
  console.log(`Listening on port ${server.address().port}`);
});

server.on("connection", (socket, req) => {
  console.log(`Connected to ${req.socket.remoteAddress}`);

  const term = pty.spawn(
    "/usr/bin/docker",
    ["exec", "--user", "guest", "-it", "sandbox", "/bin/bash"],
    { name: "xterm-color" }
  );
  socket.isAlive = true;
  socket.term = term;
  term.onData((data) => socket.send(data));

  socket.on("message", (data) => term.write(data));

  socket.on("close", () => {
    console.log(`Disconnected from ${req.socket.remoteAddress}`);
    term.kill();
  });

  socket.on("pong", heartbeat);

  socket.on("error", (error) => {
    term.kill();
    console.error(error);
  });
});

const sweepTask = setInterval(sweep, SWEEP_INTERVAL);

const hardResetTask = setInterval(() => {
  server.clients.forEach((socket) => {
    socket.terminate();
    socket.term.kill();
  });
  exec("/usr/bin/docker exec sandbox pkill -9 -u guest");
}, HARD_RESET_INTERVAL);

server.on("close", () => {
  clearInterval(sweepTask);
  clearInterval(hardResetTask);
});

function heartbeat() {
  this.isAlive = true;
}

function sweep() {
  server.clients.forEach((socket) => {
    if (socket.isAlive === false) {
      socket.terminate();
      socket.term.kill();
    }
    socket.isAlive = false;
    socket.ping();
  });
}
