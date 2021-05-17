import { css, html, LitElement } from 'lit-element/lit-element.js';
import { LocalizeDynamicMixin } from '@brightspace-ui/core/mixins/localize-dynamic-mixin.js';

import "../text/cepr-page-title";

class CeprUserSelectionPage extends LocalizeDynamicMixin(LitElement) {
	static get localizeConfig() {
		return {
			importFunc: async lang => (await import(`../../../lang/${lang}.js`)).default
		};
	}

	render() {
		return html`
			<cepr-page-title>${this.localize('toolTitle')}</cepr-page-title>
		`;
	}
}
customElements.define('cepr-user-selection-page', CeprUserSelectionPage);
