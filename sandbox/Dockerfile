FROM ubuntu:24.04

RUN apt-get update && apt-get install -y curl python3
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash
RUN apt-get update && apt-get install -y nodejs

RUN useradd --create-home --no-log-init guest
ENV TERM=xterm-256color
WORKDIR /home/guest
USER guest
