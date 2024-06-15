#!/bin/sh
set -e

if id "guest" > /dev/null 2>&1; then
  userdel -rf guest > /dev/null 2>&1
fi
useradd --create-home --uid 1001 guest
cp WELCOME.md /home/guest/README.md
chmod 644 /home/guest/README.md
node dist/index.js
