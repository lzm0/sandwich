FROM ubuntu:24.04

RUN yes | unminimize

RUN apt-get update && apt-get install -y sudo man curl make g++ python3 vim jq

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash
RUN apt-get update && apt-get install -y nodejs

WORKDIR /app
COPY . /app/
RUN npm ci
RUN npm run build

RUN useradd --create-home --uid 1001 guest
COPY WELCOME.md /home/guest/README.md
RUN chmod 644 /home/guest/README.md

ENV PORT=3000
CMD ["npm", "start"]
EXPOSE 3000
