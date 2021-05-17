import '../text/cepr-page-title';

import { html, LitElement } from 'lit-element/lit-element.js';
import { LocalizeMixin } from '../../mixins/localize-mixin';

class CeprUserSelectionPage extends LocalizeMixin(LitElement) {
	render() {
		return html`
			<cepr-page-title>${this.localize('toolTitle')}</cepr-page-title>
			${this.localize('toolDescription')}
		`;
	}
}
customElements.define('cepr-user-selection-page', CeprUserSelectionPage);
