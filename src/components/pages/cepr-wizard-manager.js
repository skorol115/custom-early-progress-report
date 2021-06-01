import '@brightspace-ui-labs/wizard/d2l-wizard.js';
import '@brightspace-ui-labs/wizard/d2l-step.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/button/floating-buttons.js';
import './cepr-user-selection-page.js';
import { html, LitElement } from 'lit-element/lit-element';
import { LocalizeMixin } from '../../mixins/localize-mixin';

class CeprWizardManager extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			currentStep: {
				type: Number
			},
			orgUnitId: {
				type: String
			}
		};
	}

	constructor() {
		super();
		this.currentStep = 0;
	}

	render() {
		return html`
			${this._renderHeaderDescription()}
			${this._renderWizard()}
			${this._renderFloatingButtons()}
		`;
	}

	updated() {
		this.wizard = this.shadowRoot.getElementById('wizard');
	}

	_handleNext() {
		this.wizard.next();
		this.currentStep = this.wizard.currentStep();
	}

	_handleRestart() {
		this.wizard.restart();
		this.currentStep = this.wizard.currentStep();
	}

	_renderFloatingButtons() {
		return this.currentStep === 0 ?
			html`
			<d2l-floating-buttons>
				<d2l-button
					primary
					@click="${ this._handleNext }">
					${ this.localize('nextButton') }
				</d2l-button>
				<d2l-button-subtle>
					${ this.localize('cancelButton') }
				</d2l-button-subtle>
			</d2l-floating-buttons>
			`
			: html`
			<d2l-floating-buttons>
				<d2l-button-subtle
					@click="${ this._handleRestart }">
					${ this.localize('restartButton') }
				</d2l-button-subtle>

				<d2l-button
					primary>
					${ this.localize('selectFeedbackButton') }
				</d2l-button>

				<d2l-button-subtle
					text="${ this.localize('numberOfSelectedStudents', { selectedStudentsCount: 0 }) }"
				></d2l-button-subtle>
			</d2l-floating-buttons>`;
	}

	_renderHeaderDescription() {
		return html`
			<h1 class="d2l-heading-1">${ this.localize('toolTitle')}</h1>
			${this.localize('toolDescription') }
		`;
	}

	_renderWizard() {
		return html`
			<d2l-labs-wizard id="wizard" class="d2l-wizard">
				<d2l-labs-step title="Select Grade Items" hide-restart-button="true" hide-next-button="true">
					<h2> Select Grade Items </h2>
				</d2l-labs-step>

				<d2l-labs-step title="Select Users" hide-restart-button="true" hide-next-button="true">
					<h2> User Selection Page </h2>
				</d2l-labs-step>
			</d2l-labs-wizard>
		`;
	}
}
customElements.define('cepr-wizard-manager', CeprWizardManager);
