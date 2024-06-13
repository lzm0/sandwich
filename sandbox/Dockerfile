FROM ubuntu:24.04

RUN yes | unminimize

RUN apt-get update && apt-get install -y curl python3 man
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash
RUN apt-get update && apt-get install -y nodejs

ENV TERM=xterm-256color
