import { domain, port, cipher } from '../js/index.js'

import { LitElement, css, html } from "lit";
import '@material/web/textfield/outlined-text-field'
import '@material/web/button/filled-tonal-button'
import '@material/web/button/outlined-button'

export class ChatContainer extends LitElement {
    constructor() {
        super();
        this.messages = [];
        this.addEventListener('onmessage', this.handleMessageEvent);
        this.addEventListener('onjoin', this.handleJoinEvent);
        this.addEventListener('ontoggle', this.handleToggleOnEvent);
        this.addEventListener('onfilesent', this.handleFileSentEvent);
        this.addEventListener('onfilereceived', this.handleFileReceivedEvent);
    }

    render() {
        return html`
        <div class="panes">
            <div class="content-pane">
                <div class="scroll-wrapper">
                    <div class="content">
                        ${this.messages.map(message => {
                            if (message.type === 'file') {
                                return html`
                                    <div class="message fileMessage">
                                        <div class="options">
                                            <div class="user">${message.user}</div>
                                            <div class="text">${message.fileName}</div>
                                            <div class="text"><b>SHA256: </b>${message.hash}</div>
                                        </div>
                                        
                                        <!-- Download icon -->
                                        <md-outlined-button label="Download" @click="${() => this._handleDownloadClick(message.fileName, message.hash)}">
                                            <md-icon>Download</md-icon>
                                        </md-outlined-button>
                                    </div>`;
                            } else {
                                return html`
                                    <div class="message">
                                        <div class="user">${message.user}</div>
                                        <div class="text">${message.message}</div>
                                        <div class="join"><i>${message.joinmsg}</i></div>
                                    </div>`;
                            }
                        })}
                    </div>
                </div>
                    
                <div class="send-controls">
                    <md-outlined-button label="Upload" @click="${this._handleUploadClick}" disabled=true>
                        <md-icon>Upload</md-icon>
                    </md-outlined-button>
                    <md-outlined-text-field id="message-input" placeholder="Type a message" maxlength="1000" @keydown="${this._handleKeyDown}" disabled=true>
                    </md-outlined-text-field>
                    
                    <md-filled-tonal-button @click="${this._handleButtonClick}" disabled=true>
                        Send
                        <svg slot="icon" viewBox="0 0 48 48"><path d="M6 40V8l38 16Zm3-4.65L36.2 24 9 12.5v8.4L21.1 24 9 27Zm0 0V12.5 27Z"/></svg>
                    </md-filled-tonal-button>
                </div>
        </div>
        `
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("onmessage", this.handleMessage.bind(this));
        document.addEventListener("onjoin", this.handleJoin.bind(this));
        document.addEventListener("ontoggle", this.handleToggleOnEvent.bind(this));
        document.addEventListener("onfilesent", this.handleFileSentEvent.bind(this));
        document.addEventListener("onfilereceived", this.handleFileReceivedEvent.bind(this));
      }
    
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("onmessage", this.handleMessage.bind(this));
        document.removeEventListener("onjoin", this.handleJoin.bind(this));
        document.removeEventListener("ontoggle", this.handleToggleOnEvent.bind(this));
        document.removeEventListener("onfilesent", this.handleFileSentEvent.bind(this));
        document.removeEventListener("onfilereceived", this.handleFileReceivedEvent.bind(this));
    }

    handleMessage(event) {
        // Check if the event is the "message" event
        const { user, message } = event.detail;
        this.messages = [...this.messages, { user, type:"message", message }];
        this.requestUpdate();
        this.scrollToBottom();
    }

    handleJoin(event) {
        const { user } = event.detail;
        let joinmsg = user + " has joined the chat!";
        this.messages = [...this.messages, { type:"message", joinmsg }];
        this.requestUpdate();
        this.scrollToBottom();
    }

    handleToggleOnEvent(event) {
        const { toggle } = event.detail;
        this.shadowRoot.querySelector('#message-input').disabled = !toggle;
        this.shadowRoot.querySelector('md-filled-tonal-button').disabled = !toggle;
        this.shadowRoot.querySelector('md-outlined-button').disabled = !toggle;
        this.shadowRoot.querySelector('#message-input').focus();
    }

    handleFileSentEvent(event) {
        // detail only contains hash of file
        const { fileName, hash } = event.detail;
        this.messages = [...this.messages, { user: "You", type: 'file', fileName: fileName, hash: hash }];
        this.requestUpdate();
        this.scrollToBottom();
    }

    handleFileReceivedEvent(event) {
        const { user, fileName, hash } = event.detail;
        this.messages = [...this.messages, { user: user, type: 'file', fileName: fileName, hash: hash }];
        this.requestUpdate();
        this.scrollToBottom();
    }

    _handleButtonClick() {
        const message = this.shadowRoot.querySelector('#message-input').value;
        
        if (message.length > 0) {
            const onSendEvent = new CustomEvent('onsend', { detail: { message } });
            document.dispatchEvent(onSendEvent);

            const onMessageEvent = new CustomEvent('onmessage', { detail: { user: 'You', message } });
            document.dispatchEvent(onMessageEvent);
            this.shadowRoot.querySelector('#message-input').reset();
            this.shadowRoot.querySelector('#message-input').focus()
        }
    }

    _handleKeyDown(event) {
        if (event.key === 'Enter') {
            this._handleButtonClick();
        }
    }

    _handleUploadClick() {
        // on click, open file dialog
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
            const file = e.target.files[0];

            // Calculate SHA256 hash of the file
            const hash = await this.calculateSHA256(file);
            
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async (readerEvent) => {
                const fileBytes = readerEvent.target.result;
                const byteArray = new Uint8Array(fileBytes);

                // Convert the byte array to a Blob
                const blob = new Blob([byteArray], { type: 'application/octet-stream' });

                // Create FormData to append file and hash
                const formData = new FormData();
                formData.append('file', blob, file.name);
                formData.append('hash', hash);

                try {
                    const response = await fetch(`https://${domain}:${port}/api/upload`, {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const fileName = file.name;
                        const onfilesentEvent = new CustomEvent('onfilesent', { detail: { fileName, hash } });
                        document.dispatchEvent(onfilesentEvent);
                    } else {
                        console.error('Failed to upload file:', response.status, response.text());
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            };
        };
        input.click();
    }

    _handleDownloadClick(name, hash) {
        // Send GET request to download file
        // on click, download file
        const downloadLink = `https://${domain}:${port}/api/download/${hash}\?name=${name}`;
        window.open(downloadLink, '_blank');
    }

    scrollToBottom() {
        const messageContainer = this.shadowRoot.querySelector('.content');
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    async calculateSHA256(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                resolve(hashHex);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    static get styles() {
        return css`
        .panes {
            background-color: var(--md-sys-color-surface);
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            margin-block: 1px 24px;
            margin-inline: 56px;
            overflow: hidden;
            flex: 1;
        }

        .content-pane {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .scroll-wrapper {
            display: flex;
            flex-direction: column-reverse;
            overflow: hidden;
            flex: 1;
            max-height: 545px;
        }

        .content {
            max-height: 100%;
            overflow-y: auto;
            padding: 24px 24px 4px 24px;
            margin: 24px 24px 24px 24px;
        }

        .message {
            display: flex;
            flex-direction: column;
            margin-bottom: 16px;
            animation: slideInFromTop 0.5s ease-in-out;
        }

        .message.fileMessage {
            background-color: var(--md-sys-color-surface-bright);
            border-radius: 24px;
            padding: 16px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }

        .user {
            font-weight: bold;
            margin-bottom: 4px;
        }

        .text {
            white-space: pre-wrap;
        }

        .send-controls {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 0 24px 24px 24px;
        }

        .send-controls md-outlined-text-field {
            flex: 1;
        }

        .send-controls md-filled-tonal-button {
            border-radius: 28px;
            padding-inline-start: 10px;
            margin-top: 0;
            margin-inline-start: 0;
            padding-bottom: 24px;
        }

        .send-controls md-outlined-button {
            border-radius: 28px;
            padding-inline-end: 10px;
            margin-top: 0;
            margin-inline-start: 0;
            padding-bottom: 24px;
        }

        @keyframes slideInFromTop {
            0% {
                transform: translateY(0);
                opacity: 0;
            }
            100% {
                transform: translateY(-10%);
                opacity: 1;
            }
        }
        `
    }
}

window.customElements.define('chat-container', ChatContainer)