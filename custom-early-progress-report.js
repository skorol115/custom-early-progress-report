import './src/components/pages/cepr-wizard-manager';
import { css, html, LitElement } from 'lit-element/lit-element.js';

class CustomEarlyProgressReport extends LitElement {
	static get properties() {
		return {
			orgUnitId: {
				type: String
			}
		};
	}

	static get styles() {
		return css`
			:host {
				display: inline-block;
			}
			:host([hidden]) {
				display: none;
			}
		`;
	}

	render() {
		return html`
			<cepr-wizard-manager
				orgUnitId="${this.orgUnitId}"
			></cepr-wizard-manager>
		`;
	}
}
customElements.define('d2l-custom-early-progress-report', CustomEarlyProgressReport);
