import { html, LitElement } from 'lit-element/lit-element.js';
import { heading1Styles  } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../../mixins/localize-mixin';

class CeprUserSelectionPage extends LocalizeMixin(LitElement) {
	static get styles() {
		return [ heading1Styles ];
	}

	render() {
		return html`
			<h1 class="d2l-heading-1">${this.localize('toolTitle')}</h1>
			${this.localize('toolDescription')}
		`;
	}
}
customElements.define('cepr-user-selection-page', CeprUserSelectionPage);
