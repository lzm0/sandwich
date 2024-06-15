FROM ubuntu:24.04

RUN yes | unminimize

RUN apt-get update && apt-get install -y sudo man curl make g++ python3 vim jq

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash
RUN apt-get update && apt-get install -y nodejs

COPY . .
RUN npm ci
RUN npm run build

ENV PORT=3000
ENTRYPOINT ["sh", "entrypoint.sh"]
