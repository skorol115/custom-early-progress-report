import './src/components/pages/cepr-wizard-manager';
import { css, html, LitElement } from 'lit-element/lit-element.js';

class CustomEarlyProgressReport extends LitElement {
	static get properties() {
		return {
			orgUnitId: {
				type: String
			},
			historyEndpoint: {
				type: String
			},
			importCsvUrl: {
				type: String
			},
			returnUrl: {
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
				importCsvUrl="${this.importCsvUrl}"
				previousReportsURL="${this.historyEndpoint}"
				returnUrl="${this.returnUrl}"
			></cepr-wizard-manager>
		`;
	}
}
customElements.define('d2l-custom-early-progress-report', CustomEarlyProgressReport);
