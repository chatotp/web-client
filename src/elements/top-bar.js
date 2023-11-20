import { LitElement, css, html } from "lit";
import '@material/web/switch/switch.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/icon/icon.js';
import '@material/web/dialog/dialog.js';
import '@material/web/textfield/filled-text-field';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-button.js';
import '@material/web/radio/radio.js';

export class Header extends LitElement {
    static get properties() {
        return {
            title: { type: String },
            cryptChoice: { type: String }
        }
    }

    constructor() {
        super();
        this.title = "ChatOTP Client (Beta)";
        this.cryptChoice = "Xor";
    }

    firstUpdated() {
        super.firstUpdated();
        this.toggleSettings();
    }

    render() {
        const usernameField = this.shadowRoot.querySelector('md-filled-text-field');
        const isUsernameEmpty = usernameField && !usernameField.value.trim();
        
        return html`
            <div class="header">
                <div class="program_title">
                    <slot name="top-bar">${this.title}</slot>
                </div>
                <!-- This is temporary -->
                <md-icon-button
                aria-label="Settings" toggle @click=${this.toggleSettings}>
                <md-icon>settings</md-icon>
                <md-icon slot="selected">close</md-icon>
                </md-icon-button>
            </div>
            
            <md-dialog aria-label="Settings" id="settings-dialog">
                <span slot="headline">
                    <md-icon-button form="settings-form" value="close" aria-label="Close dialog" ?disabled=${isUsernameEmpty}>
                        <md-icon>close</md-icon>
                    </md-icon-button>
                    <span class="headline">Settings</span>
                </span>
                <form id="settings-form" slot="content" method="dialog">
                    <div class="setting"><md-filled-text-field autofocus label="Username" required id="username"></md-filled-text-field></div>
                    <div class="encryption-radio">
                        <div>
                            <md-radio name="crypt" value="Xor" checked id="crypt-xor">Xor</md-radio>
                            <label for="crypt-xor">Xor</label>
                        </div>
                        
                        <div>
                            <md-radio name="crypt" value="Rc4" id="crypt-rc4">Rc4</md-radio>
                            <label for="crypt-rc4">Rc4</label>
                        </div>
                    </div>
                </form>

                <div slot="actions">
                    <md-text-button form="settings-form" value="connect" @click=${this._handleConnectClicked}>Connect</md-text-button>
                </div>
            </md-dialog>
            `
    }

    static get styles() {
       return css`
        .header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            text-align: center;
            height: 64px;
            padding: 0 16px;
            box-sizing: border-box;
            position: sticky;
            top: 0;
            z-index: 1;
        }

        .crypt-radio {
            display: flex;
            align-items: center;
        }

        .setting {
            margin: 16px;
            justify-content: center;
        }

        .encryption-radio {
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
        }
        `
    }

    toggleSettings() {
        const dialog = this.shadowRoot.querySelector('#settings-dialog');
        if (dialog) {
            dialog.show();
        }
    }

    _handleConnectClicked() {
        const usernameField = this.shadowRoot.querySelector('#username');
        const username = usernameField ? usernameField.value.trim() : '';
        
        const radios = this.shadowRoot.querySelectorAll('md-radio');
        let selectedRadioValue = '';
        radios.forEach(radio => {
            if (radio.checked) {
                selectedRadioValue = radio.value;
            }
        });

        const data = { username, selectedRadioValue };
        
        // Dispatching the custom event with the data
        this.dispatchEvent(new CustomEvent('connect-event', {
            detail: data,
            bubbles: true,
            composed: true // Allows the event to travel across shadow DOM boundaries
        }));
    }
}

window.customElements.define('top-bar', Header);