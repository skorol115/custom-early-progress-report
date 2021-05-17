import './pages/cepr-user-selection-page';

import { html, LitElement } from 'lit-element/lit-element.js';

class CustomEarlyProgressReport extends LitElement {
	render() {
		return html`
			<cepr-user-selection-page></cepr-user-selection-page>
		`;
	}
}
customElements.define('d2l-custom-early-progress-report', CustomEarlyProgressReport);
