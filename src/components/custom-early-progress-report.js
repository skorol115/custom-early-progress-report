import './pages/cepr-user-selection-page';

import { css, html, LitElement } from 'lit-element/lit-element.js';

class CustomEarlyProgressReport extends LitElement {
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
			<cepr-user-selection-page></cepr-user-selection-page>
		`;
	}
}
customElements.define('d2l-custom-early-progress-report', CustomEarlyProgressReport);
