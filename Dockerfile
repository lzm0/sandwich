FROM ubuntu:24.04

RUN apt-get update && apt-get install -y curl make g++ python3
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash
RUN apt-get update && apt-get install -y nodejs

RUN useradd --create-home --no-log-init guest

USER guest

CMD ["node", "index.mjs"]
