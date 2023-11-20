import Cipher from "./crypt";

export const domain = 'localhost';
export let port = '58684';
let user = null;
let algorithm = null;
export let cipher = null;
let connection = new signalR.HubConnectionBuilder()
    .withUrl(`https://${domain}:${port}/chat`)
    .configureLogging(signalR.LogLevel.Information)
    .build();   
let key = null; 
let receivedMsg = null;

document.addEventListener("connect-event", async (event) => {
    user = event.detail.username;
    const selectedRadioValue = event.detail.selectedRadioValue;

    algorithm = selectedRadioValue === "Xor" ? 3 : 4;

    try {
        await connection.start();
        console.log("SignalR Connected.");
        await connection.invoke("Connect", user, algorithm);
        await connection.invoke("SendJoinMsg", user);

        const onToggleEvent = new CustomEvent('ontoggle', { detail: { toggle: true }});
        document.dispatchEvent(onToggleEvent);
    } catch (err) {
        console.error(err);
        setTimeout(start, 5000);
    }
});

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