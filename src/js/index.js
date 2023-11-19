import Cipher from "./crypt";

export const domain = 'localhost';
export let port = '58684';
let user = 'test';
const algorithm = 4;
export let cipher = null;
let connection = new signalR.HubConnectionBuilder()
    .withUrl(`https://${domain}:${port}/chat`)
    .configureLogging(signalR.LogLevel.Information)
    .build();   
let key = null; 
let receivedMsg = null;

async function start() {
    try {
        connection = new signalR.HubConnectionBuilder()
        .withUrl(`https://${domain}:${port}/chat`)
        .configureLogging(signalR.LogLevel.Information)
        .build();

        await connection.start();
        console.log("SignalR Connected.");
        try {
            await connection.invoke("Connect", user, algorithm);
            await connection.invoke("SendJoinMsg", user)

            // now turn on toggles
            const onToggleEvent = new CustomEvent('ontoggle', { detail: { toggle: true }});
            document.dispatchEvent(onToggleEvent);
        } catch (err) {
            console.error(err);
        }
    } catch (err) {
        console.log(err);
        setTimeout(start, 5000);
    }
};

connection.onclose(async () => {
    await start();
});

// Start the connection.
start();

connection.on("JoinMessage", (user) => {
    const onJoinEvent = new CustomEvent('onjoin', { detail: { user }})
    document.dispatchEvent(onJoinEvent);
})

connection.on('StartKeyCall', () => {
    key = []
})

connection.on("ReceiveChar", (charValue) => {
    key.push(charValue);
})

connection.on("StopKeyCall", () => {
    // create a cipher with key
    cipher = new Cipher(key);
    key = null;
})

connection.on('StartMessage', () => {
    receivedMsg = [];
})

connection.on('ReceiveMessageChar', (charValue) => {
    receivedMsg.push(charValue);
})

connection.on('StopMessage', (user) => {
    const message = cipher.decrypt(receivedMsg);
    const onMessageEvent = new CustomEvent('onmessage', { detail: { user, message } });
    document.dispatchEvent(onMessageEvent);
    receivedMsg = null;
});

document.addEventListener('onsend', (event) => {
    const { message } = event.detail;
    const encryptedMsg = cipher.encrypt(message);

    // encryptedMsg is int array
    // convert to string with spaces in b/w
    const encryptedMsgStr = encryptedMsg.join(',');
    connection.invoke("SendMsgEncrypted", user, encryptedMsgStr);
});

document.addEventListener('onpyswitchpositionchanged', (event) => {
    if (event.detail.switchOn) {
        port = '42069';
    } else {
        port = '58684'
    }
    start();
    console.log("Switched to port " + port);
});

document.addEventListener('onfilesent', (event) => {
    const { fileName, hash } = event.detail;
    connection.invoke("SendFile", user, fileName, hash);
})

connection.on("ReceiveFile", (user, fileName, hash) => {
    const onFileEvent = new CustomEvent('onfilereceived', { detail: { user, fileName, hash }});
    document.dispatchEvent(onFileEvent);
})