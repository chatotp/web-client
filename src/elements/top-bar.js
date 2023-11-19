import { LitElement, css, html } from "lit";
import '@material/web/switch/switch.js';

export class Header extends LitElement {
    static get properties() {
        return {
            title: { type: String },
            is_python: { type: String }
        }
    }

    constructor() {
        super();
        this.title = "ChatOTP Client (Beta)";
        this.is_python = false;
    }

    render() {
        return html`
            <div class="header">
                <div class="program_title">
                    <slot name="top-bar">${this.title}</slot>
                </div>
                <!-- This is temporary -->
                <div class="python_support_slider">
                    <label id="switch_py">Use Python</label>
                    <md-switch icons show-only-selected-icon id="switch_py" @change="${this.handleSwitchChange}"></md-switch>
                </div>
            </div>
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
        
        #switch_py {
            padding-left: 5px;
        }
        `
    }

    handleSwitchChange(event) {
        this.is_python = !this.is_python;
        const customEvent = new CustomEvent('onpyswitchpositionchanged', { detail: { switchOn: this.is_python } });
        document.dispatchEvent(customEvent);
    }
}

window.customElements.define('top-bar', Header);