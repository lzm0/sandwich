# 🥪 Sandwich

A simple sandboxed Bash environment for running untrusted code.

## Features

- 🏖️ **Sandboxed**: Users are connected as `guest`. It not have `sudo` access and should not be able to kill the server process.
- 🔐 **Secure**: Even if the user manages to elevate their privileges, they are still in a Docker container.
- 💪 **Resilient**: The server will restart every 30 minutes to reset the state.
- 🗑️ **Garbage Collection**: The server will kill the user's process and child processes once the user disconnects.

## Usage

```bash
docker compose up
```

Open `src/index.html` in your browser and start Bash-ing!
