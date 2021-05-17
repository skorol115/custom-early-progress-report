import '../text/cepr-page-title';

import { html, LitElement } from 'lit-element/lit-element.js';
import { LocalizeDynamicMixin } from '@brightspace-ui/core/mixins/localize-dynamic-mixin.js';

class CeprUserSelectionPage extends LocalizeDynamicMixin(LitElement) {
	static get localizeConfig() {
		return {
			importFunc: async lang => (await import(`../../../lang/${lang}.js`)).default
		};
	}

	render() {
		return html`
			<cepr-page-title>${this.localize('toolTitle')}</cepr-page-title>
			${this.localize('toolDescription')}
		`;
	}
}
customElements.define('cepr-user-selection-page', CeprUserSelectionPage);
