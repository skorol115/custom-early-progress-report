import '@brightspace-ui-labs/wizard/d2l-wizard.js';
import '@brightspace-ui-labs/wizard/d2l-step.js';
import '@brightspace-ui/core/components/alert/alert.js';
import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/button/floating-buttons.js';
import './cepr-user-selection-page.js';
import './cepr-grade-item-selection-page';
import { css, html, LitElement } from 'lit-element/lit-element';
import { LocalizeMixin } from '../../mixins/localize-mixin';
import { UserServiceFactory } from '../../services/user-service-factory';

class CeprWizardManager extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			currentStep: {
				type: Number
			},
			orgUnitId: {
				type: String
			},
			gradeItemQueries: {
				type: Array
			},
			gradeItemInvalid: {
				type: Boolean
			},
			hideNoUsersAlert: {
				type: Boolean
			}
		};
	}

	static get styles() {
		return [
			css`
				#no-users-alert {
					margin-bottom: 0.75rem;
				}
			`
		];
	}

	constructor() {
		super();

		this.userService = UserServiceFactory.getUserService();

		this.currentStep = 0;
		this.gradeItemQueries = [];
		this.gradeItemInvalid = false;
		this.hideNoUsersAlert = true;
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

	_gradeItemQueryChange(e) {
		this.gradeItemQueries = e.detail.gradeItemQueries;
		this.gradeItemInvalid = e.detail.gradeItemInvalid;
		this.hideNoUsersAlert = true;
	}

	_handleRestart() {
		this.wizard.restart();
		this.currentStep = this.wizard.currentStep();
	}

	async _handleStepOneNext() {
		const numUsers = await this.userService.getNumUsers(this.orgUnitId, this.gradeItemQueries);
		if (numUsers === 0) {
			this.hideNoUsersAlert = false;
			return;
		}

		this.wizard.next();
		this.currentStep = this.wizard.currentStep();
	}

	_renderFloatingButtons() {
		return this.currentStep === 0 ?
			html`
			<d2l-floating-buttons>
				<d2l-alert id="no-users-alert" type="critical" ?hidden=${this.hideNoUsersAlert} style>
					${this.localize('noUsersAlert')}
				</d2l-alert>
				<d2l-button
					primary
					@click="${ this._handleStepOneNext }"
					?disabled=${this.gradeItemQueries.length === 0 || this.gradeItemInvalid}>
					${ this.localize('nextButton') }
				</d2l-button>
				<d2l-button>
					${ this.localize('cancelButton') }
				</d2l-button>
				<d2l-button-subtle
					text="${ this.localize('numberOfSelectedGradeItems', { selectedGradeItemsCount: this.gradeItemQueries.length }) }">
				</d2l-button-subtle>
			</d2l-floating-buttons>
			`
			: html`
			<d2l-floating-buttons>
				<d2l-button
					primary>
					${ this.localize('selectFeedbackButton') }
				</d2l-button>
				<d2l-button
					@click="${ this._handleRestart }">
					${ this.localize('restartButton') }
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
					<cepr-grade-item-selection-page
						orgUnitId=${this.orgUnitId}
						@change=${this._gradeItemQueryChange}>
					</cepr-grade-item-selection-page>
				</d2l-labs-step>

				<d2l-labs-step title="Select Users" hide-restart-button="true" hide-next-button="true">
					<h2> User Selection Page </h2>
					<cepr-user-selection-page
						orgUnitId=${this.orgUnitId}>
					</cepr-user-selection-page>
				</d2l-labs-step>
			</d2l-labs-wizard>
		`;
	}
}
customElements.define('cepr-wizard-manager', CeprWizardManager);