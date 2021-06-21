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
import { RecordServiceFactory } from '../../services/record-service-factory';
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
			},
			importCsvUrl: {
				type: String
			},
			previousReportsURL: {
				type: String
			},
			selectedUsers: {
				type: Array
			},
			studentGradesSummaryOpened: {
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
				.d2l-action-bar {
					align-items: center;
					display: flex;
					justify-content: space-between;
				}
			`
		];
	}

	constructor() {
		super();

		this.userService = UserServiceFactory.getUserService();
		this.recordService = RecordServiceFactory.getRecordService();

		this.currentStep = 0;
		this.gradeItemQueries = [];
		this.gradeItemInvalid = false;
		this.hideNoUsersAlert = true;
		this.selectedUsers = [];
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

	closeStudentGradesSummary() {
		this.studentGradesSummaryOpened = false;
	}

	openStudentGradesSummary() {
		this.studentGradesSummaryOpened = true;
	}

	get _getGradeItems() {
		return JSON.stringify(this.gradeItemQueries);
	}

	_gradeItemQueryChange(e) {
		this.gradeItemQueries = e.detail.gradeItemQueries;
		this.gradeItemInvalid = e.detail.gradeItemInvalid;
		this.hideNoUsersAlert = true;
	}

	async _handleContinueToSalesforce() {
		const redirectUrl = await this.recordService.createRecord(this.orgUnitId, this.selectedUsers);
		window.open(redirectUrl, '_blank');
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

	_openImportCsvLink() {
		window.open(this.importCsvUrl);
	}

	_openPreviousReportsLink() {
		window.open(this.previousReportsURL);
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
					primary
					@click=${this._handleContinueToSalesforce}
					?disabled=${this.selectedUsers.length === 0}>
					${ this.localize('selectFeedbackButton') }
				</d2l-button>
				<d2l-button
					@click="${ this._handleRestart }">
					${ this.localize('restartButton') }
				</d2l-button>
				<d2l-button-subtle
					@click="${this.openStudentGradesSummary}"
					?disabled="${this.selectedUsers.length === 0}"
					text="${ this.localize('numberOfSelectedStudents', { selectedStudentsCount: this.selectedUsers.length }) }">
				</d2l-button-subtle>
			</d2l-floating-buttons>`;
	}

	_renderHeaderDescription() {
		return html`
			<h1 class="d2l-heading-1">${ this.localize('toolTitle')}</h1>
			${this.localize('toolDescription') }
		`;
	}

	_renderImportCsvButton() {
		if (!this.importCsvUrl) return html``;

		return html`
			<d2l-button-subtle
				text="${this.localize('importCsvButton')}"
				icon="tier1:import"
				@click="${this._openImportCsvLink}"
			></d2l-button-subtle>
		`;
	}

	_renderPreviousReportsButton() {
		if (!this.previousReportsURL) return html``;

		return html`
			<d2l-button-subtle
				text="${this.localize('previousReportsButton')}"
				@click="${this._openPreviousReportsLink}"
			></d2l-button-subtle>
		`;
	}

	_renderWizard() {
		return html`
			<d2l-labs-wizard id="wizard" class="d2l-wizard">
				<d2l-labs-step title=${ this.localize('wizardStep1Title') }  hide-restart-button="true" hide-next-button="true">
					<h2> ${ this.localize('wizardStep1Header') } </h2>
					<div class="d2l-action-bar">
						<div>${this._renderImportCsvButton()}</div>
						<div>${this._renderPreviousReportsButton()}</div>
					</div>
					<cepr-grade-item-selection-page
						title=""
						orgUnitId=${this.orgUnitId}
						@change=${this._gradeItemQueryChange}>
					</cepr-grade-item-selection-page>
				</d2l-labs-step>

				<d2l-labs-step title=${ this.localize('wizardStep2Title') }  hide-restart-button="true" hide-next-button="true">
					<h2> ${ this.localize('wizardStep2Header') } </h2>
					<cepr-user-selection-page
						id="cepr-user-selection"
						@change="${ this._userSelectionChange }"
						orgUnitId=${ this.orgUnitId }
						gradeItemQueries="${ this._getGradeItems }"
						previousReportsURL="${this.previousReportsURL}"
						?studentGradesSummaryOpened="${this.studentGradesSummaryOpened}"
						@student-grades-summary-close=${this.closeStudentGradesSummary}
						@student-grades-summary-continue-to-salesforce=${this._handleContinueToSalesforce}
					></cepr-user-selection-page>
				</d2l-labs-step>
			</d2l-labs-wizard>
		`;
	}

	_userSelectionChange(e) {
		this.selectedUsers = e.detail.selectedUsers;
	}

}
customElements.define('cepr-wizard-manager', CeprWizardManager);
