import * as pty from "node-pty";
import { WebSocketServer, WebSocket } from "ws";
import { generateUsername } from "./username-generator";

const SWEEP_INTERVAL = 5 * 1000;
const MAX_SESSIONS = 10;
const PORT = parseInt(process.env.PORT!);

const server = new WebSocketServer({
  host: "0.0.0.0",
  port: PORT,
});

server.on("listening", () => {
  console.log(`Listening on port ${PORT}`);
});

const sessions = new Map<
  string,
  { socket: WebSocket; term: pty.IPty; isAlive: boolean }
>();

server.on("connection", (socket, req) => {
  if (server.clients.size >= MAX_SESSIONS) {
    socket.send("Maximum number of clients reached\n");
    socket.terminate();
    return;
  }

  let user = generateUsername();
  while (sessions.has(user)) {
    user = generateUsername();
  }

  const term = pty.spawn(
    "/usr/bin/su",
    ["guest", "--pty", "--login", "--shell", "/bin/bash"],
    { name: "xterm-color" }
  );
  console.log(
    `User ${user} with pid ${term.pid} connected from ${req.socket.remoteAddress}`
  );
  sessions.set(user, { socket, term, isAlive: true });
  term.onData((data) => socket.send(data));

  socket.on("message", (data) => term.write(data.toString()));

  socket.on("close", () => {
    disconnect(user);
    console.log(`User ${user} disconnected`);
  });

  socket.on("pong", () => heartbeat(user));

  socket.on("error", (error) => {
    disconnect(user);
    console.error(error);
  });
});

const sweepTask = setInterval(() => {
  sessions.forEach((session, user) => {
    if (!session.isAlive) {
      disconnect(user);
    }
    session.isAlive = false;
    session.socket.ping();
  });
}, SWEEP_INTERVAL);

server.on("close", () => {
  clearInterval(sweepTask);
});

function heartbeat(user: string) {
  sessions.get(user)!.isAlive = true;
}

function disconnect(user: string) {
  const { socket, term } = sessions.get(user)!;
  socket.terminate();
  term.kill("SIGKILL");
  sessions.delete(user);
}
