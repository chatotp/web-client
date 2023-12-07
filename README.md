# ChatOTP
ChatOTP is a chat protocol designed for anonymity and security through one-time pads. Each client generates a unique one-time key for encryption per session.

**Note:** This project was created as a part of term project for Cryptography and is not recommended for production purposes as of now.

# ChatOTP web-client
**(Note: Make sure you are running the server before running the web-client)**<br>
This repository contains source code for ChatOTP Web-Client. The web-client uses SignalR for robust and faster connection between multiple clients and servers.

## Screenshots
On connection, the web-client asks the user for username and encryption algorithm (Xor by default). Only after username is given, the SignalR connection is done over client and server.

![Options_Dialog](https://github.com/chatotp/web-client/assets/99819848/bf17b3ee-d850-49ad-9a14-9b637f7841f2)

This is a beta screenshot during testing of chat application over multiple clients and file transfer

![Inprogress_shot](https://github.com/chatotp/web-client/assets/99819848/2c1566e0-1f20-4e02-92ea-aca52b72de1e)

## Encryption Algorithms
1. Xor Cipher
2. Rc4 Cipher
**Note:** Rc4 cipher generates a keystream which can be used for encryption by combining it with plaintext using bitwise Xor.

## Running the client
1. You can directly run the client using `docker compose up` or use [VSCode Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers) to run the client.
2. In case of development environment, you must use `vite run dev` to run vite dev server.
