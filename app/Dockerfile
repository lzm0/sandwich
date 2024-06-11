FROM ubuntu:24.04

RUN apt-get update && apt-get install -y curl make g++ python3
RUN curl -fsSL https://get.docker.com | bash
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash
RUN apt-get update && apt-get install -y nodejs

WORKDIR /app
COPY index.mjs package.json package-lock.json /app/
RUN npm ci

ENV PORT=3000
CMD ["node", "index.mjs"]
EXPOSE 3000
