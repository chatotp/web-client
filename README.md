# ChatOTP
ChatOTP is a chat protocol designed for anonymity and security through one-time pads. Each client generates a unique one-time key for encryption per session.

## ChatOTP web-client
**(Note: Make sure you are running the server before running the web-client)**
This repository contains source code for ChatOTP Web-Client. The web-client uses SignalR for robust and faster connection between multiple clients and servers.

## Encryption Algorithms
1. Xor Cipher
2. Rc4 Cipher
**Note:** Rc4 cipher generates a keystream which can be used for encryption by combining it with plaintext using bitwise Xor.

## Running the client
1. You can directly run the client using `docker compose up` or use [VSCode Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers) to run the client.
2. In case of development environment, you must use `vite run dev` to run vite dev server.
