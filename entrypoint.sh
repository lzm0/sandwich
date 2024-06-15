#!/bin/sh
set -e

useradd --create-home --uid 1001 guest
cp WELCOME.md /home/guest/README.md
chmod 644 /home/guest/README.md
node dist/index.js
