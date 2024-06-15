useradd --create-home --uid 1001 guest
cp /app/WELCOME.md /home/guest/README.md
chmod 644 /home/guest/README.md
npm start
