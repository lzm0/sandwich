import process from "process";
import pty from "node-pty";
import { WebSocketServer } from "ws";
import { execSync, exec } from "child_process";
import { generateUsername } from "./username-generator.mjs";

const HARD_RESET_INTERVAL = 30 * 60 * 1000;
const SWEEP_INTERVAL = 30 * 1000;
const MAX_SESSIONS = 10;

const server = new WebSocketServer({ port: process.env.PORT });

server.on("listening", () => {
  console.log(`Listening on port ${server.address().port}`);
});

const usernames = new Set();

server.on("connection", (socket, req) => {
  if (server.clients.size >= MAX_SESSIONS) {
    socket.send("Maximum number of clients reached\n");
    socket.terminate();
    return;
  }

  let username = generateUsername();
  while (usernames.has(username)) {
    username = generateUsername();
  }
  usernames.add(username);
  console.log(`User ${username} connected from ${req.socket.remoteAddress}`);

  execSync(`/usr/bin/docker exec sandbox useradd --create-home ${username}`);
  const term = pty.spawn(
    "/usr/bin/docker",
    [
      "exec",
      "--user",
      username,
      "--workdir",
      `/home/${username}`,
      "-it",
      "sandbox",
      "/bin/bash",
    ],
    { name: "xterm-color" }
  );
  term.username = username;
  socket.isAlive = true;
  socket.term = term;
  term.onData((data) => socket.send(data));

  socket.on("message", (data) => term.write(data));

  socket.on("close", () => {
    kill(term);
    console.log(`User ${username} disconnected`);
  });

  socket.on("pong", heartbeat);

  socket.on("error", (error) => {
    kill(term);
    console.error(error);
  });
});

const sweepTask = setInterval(sweep, SWEEP_INTERVAL);

const hardResetTask = setInterval(() => {
  server.clients.forEach((socket) => {
    socket.terminate();
    kill(socket.term);
  });
}, HARD_RESET_INTERVAL);

server.on("close", () => {
  clearInterval(sweepTask);
  clearInterval(hardResetTask);
});

function heartbeat() {
  this.isAlive = true;
}

function kill(term) {
  term.kill();
  exec(`/usr/bin/docker exec sandbox pkill -9 -u ${term.username}`, () => {
    exec(
      `/usr/bin/docker exec sandbox userdel --remove ${term.username}`,
      () => {
        usernames.delete(term.username);
      }
    );
  });
}

function sweep() {
  server.clients.forEach((socket) => {
    if (socket.isAlive === false) {
      socket.terminate();
      kill(socket.term);
    }
    socket.isAlive = false;
    socket.ping();
  });
}
