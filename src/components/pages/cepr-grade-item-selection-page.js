import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/inputs/input-number.js';
import '@brightspace-ui/core/components/inputs/input-percent.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { GradeItemServiceFactory } from '../../services/grade-item-service-factory';
import { heading1Styles  } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../../mixins/localize-mixin';
import { radioStyles } from '@brightspace-ui/core/components/inputs/input-radio-styles.js';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';
import { UserServiceFactory } from '../../services/user-service-factory';

class CeprGradeItemSelectionPage extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			gradeItems: {
				type: Map
			},
			gradeItemHash: {
				type: Map
			},
			gradeItemSelection: {
				type: Set
			},
			isLoading: {
				type: Boolean
			},
			isQuerying: {
				type: Boolean
			},
			orgUnitId: {
				type: String
			},
			enableEprEnhancements: {
				type: Boolean
			}
		};
	}

	static get styles() {
		return [
			heading1Styles,
			tableStyles,
			radioStyles,
			css`
				:host {
					display: inline-block;
					width: 100%;
				}

				:host([hidden]) {
					display: none;
				}

				.d2l-spinner {
					display: flex;
					margin: 48px;
				}

				d2l-input-checkbox {
					margin: 0 0 0 10px;
				}

				d2l-table-wrapper {
					margin-top: 0.5rem;
				}

				.d2l-table-cell-first {
					width: 24px;
				}

				.d2l-grade-item-range-column {
					width: 5.5rem;
				}

				.d2l-is-hidden-icon {
					margin: 0 0.75rem;
				}

				.d2l-grade-item-input {
					--d2l-input-text-align: end;
				}

				.d2l-input-checkbox-label {
					margin-bottom: 0.4rem;
				}

				.d2l-selection-filter-header {
					font-size: 15px;
					font-weight: bold;
				}

				.d2l-selection-filter-container {
					margin-bottom: 1.5rem;
				}
			`
		];
	}

	constructor() {
		super();

		this.gradeItemService = GradeItemServiceFactory.getGradeItemService();
		this.userService = UserServiceFactory.getUserService();

		this.gradeItemList = [];

		// A hashmap for holding grade item state, which will be maintained through subsequent Grade Item queries
		this.gradeItemHash = new Map();

		this.gradeItemSelection = new Set();

		this.searchOption = 0;
		this.isLoading = true;
		this.isQuerying = false;
	}

	async connectedCallback() {
		super.connectedCallback();

		this.isLoading = true;

		await this._queryGradeItems();
		await this._queryUserPreferences();

		this.isLoading = false;
	}

	render() {
		return html`
			${ this.isLoading ? this._renderSpinner() : this._renderGradeItems() }
			`;
	}

	_dispatchOnGradesChange() {

		// Compile selected grade items & ranges into a gradeItemQueries array
		let gradeItemInvalid = false;
		const gradeItemQueries = [];

		this.gradeItemSelection.forEach(gradeItemId => {
			const gradeItem = this.gradeItemHash.get(gradeItemId);

			const invalidLowerBounds = gradeItem.LowerBounds === undefined || gradeItem.LowerBounds === null;
			const invalidUpperBounds = gradeItem.UpperBounds === undefined || gradeItem.UpperBounds === null;
			if (invalidLowerBounds || invalidUpperBounds) {
				gradeItemInvalid = true;
			}

			if (gradeItem.LowerBounds > gradeItem.UpperBounds) {

				// Set the validation state of the inner text inputs
				const errorMsg = this.localize('minMaxGradeError');
				this._setInputInvalidState(`#lower_${gradeItemId}`, errorMsg);
				this._setInputInvalidState(`#upper_${gradeItemId}`, errorMsg);
				gradeItemInvalid = true;

			} else {

				// Clear any existing invalid states
				this._setInputInvalidState(`#lower_${gradeItemId}`);
				this._setInputInvalidState(`#upper_${gradeItemId}`);

			}

			gradeItemQueries.push({
				GradeItemId: gradeItemId,
				GradeItemName: gradeItem.GradeItemName,
				LowerBounds: gradeItem.LowerBounds / 100,
				UpperBounds: gradeItem.UpperBounds / 100
			});
		});

		// Dispatch change event to wizard wrapper
		const change = new CustomEvent('grades-change', {
			detail: {
				gradeItemInvalid: gradeItemInvalid,
				gradeItemQueries: gradeItemQueries
			}
		});

		this.dispatchEvent(change);
		this.requestUpdate();
	}

	_dispatchOnPreferencesChange() {

		const change = new CustomEvent('user-preferences-change', {
			detail: {
				searchOption: this.searchOption,
			}
		});

		this.dispatchEvent(change);
	}

	async _queryGradeItems() {
		this.isQuerying = true;

		const gradeItems = await this.gradeItemService.getGradeItems(this.orgUnitId);

		// Build a list of grade items to render, and a hash of query data to reference in constant time
		this.gradeItemList = [];
		gradeItems.forEach(gradeItem => this._setGradeItem(gradeItem));

		this.isQuerying = false;
	}

	async _queryUserPreferences() {
		this.isQuerying = true;

		const response = await this.userService.getUserPreferences(this.orgUnitId);
		const searchOption = response.SearchOption;
		if (searchOption) {
			this.searchOption = searchOption;
			this._dispatchOnPreferencesChange();
		}

		this.isQuerying = false;
	}

	_renderGradeItem(gradeItem) {
		return html`
			<tr ?selected=${this.gradeItemSelection.has(gradeItem.GradeItemId)}>
				<td>
					<d2l-input-checkbox
						@change=${this._toggleGradeItemSelection}
						id="${gradeItem.GradeItemId}"
						?checked=${this.gradeItemSelection.has(gradeItem.GradeItemId)}
					></d2l-input-checkbox>
				</td>
				<td>
					${gradeItem.Name}
					${gradeItem.IsHidden ? this._renderHiddenIcon() : null}
				</td>
				<td class="d2l-grade-item-range-column">
					<d2l-input-number
						class="d2l-grade-item-input"
						input-width="100%"
						label="${gradeItem.Name} ${this.localize('minGradeTableHeader')}"
						label-hidden
						value="${this.gradeItemHash.get(gradeItem.GradeItemId).LowerBounds}"
						id="lower_${gradeItem.GradeItemId}"
						gradeItemId=${gradeItem.GradeItemId}
						?disabled=${!this.gradeItemSelection.has(gradeItem.GradeItemId)}
						@change=${this._setGradeItemLowerBounds}
						hide-invalid-icon
						min="0"
						max="100"
						unit="%"
						required>
					</d2l-input-number>
				</td>
				<td class="d2l-grade-item-range-column">
					<d2l-input-number
						class="d2l-grade-item-input"
						input-width="100%"
						label="${gradeItem.Name} ${this.localize('maxGradeTableHeader')}"
						label-hidden
						value="${this.gradeItemHash.get(gradeItem.GradeItemId).UpperBounds}"
						id="upper_${gradeItem.GradeItemId}"
						gradeItemId=${gradeItem.GradeItemId}
						?disabled=${!this.gradeItemSelection.has(gradeItem.GradeItemId)}
						@change=${this._setGradeItemUpperBounds}
						hide-invalid-icon
						min="0"
						max="100"
						unit="%"
						required>
					</d2l-input-number>
				</td>
			</tr>
		`;
	}

	_renderGradeItems() {
		return html`
			${ this.enableEprEnhancements && !this.isQuerying ? this._renderSelectionContainer() : html`` }
			<d2l-table-wrapper sticky-headers>
				<table class="d2l-table">
					<thead>
						<th>
							<d2l-input-checkbox
							?checked=${this.gradeItemSelection.size === this.gradeItemList.length}
							@change=${this._selectAllItemsEvent}
							></d2l-input-checkbox>
						</th>
						<th>${this.localize('gradeItemTableHeader')}</th>
						<th>${this.localize('minGradeTableHeader')}</th>
						<th>${this.localize('maxGradeTableHeader')}</th>
					</thead>
					<tbody>
						${ this.isQuerying ? '' : this.gradeItemList.map(gradeItem => this._renderGradeItem(gradeItem)) }
					</tbody>
				</table>
				${ this.isQuerying ? this._renderSpinner() : '' }
			</d2l-table-wrapper>
			`;
	}

	_renderHiddenIcon() {
		return html`
			<d2l-icon class="d2l-is-hidden-icon" icon="tier1:visibility-hide" title="${this.localize('hiddenIconTooltip')}"></d2l-icon>
		`;
	}

	_renderSelectionContainer() {
		return html`
			<div class="d2l-selection-filter-container">
				<span class="d2l-selection-filter-header">
					${this.localize('selectionCriteriaHeader')}
				</span>
				<div>
					<label class="d2l-input-radio-label d2l-input-checkbox-label">
						<input
							type="radio"
							name="selectCriteriaGroup"
							value="any"
							@change="${this._setCriteriaSelection}"
							checked
						>
						${this.localize('AnySelectionCriteria')}
					</label>
					<label class="d2l-input-radio-label d2l-input-checkbox-label">
						<input
							type="radio"
							name="selectCriteriaGroup"
							value="all"
							@change="${this._setCriteriaSelection}"
							?checked=${this.searchOption === 1}
						>
						${this.localize('AllSelectionCriteria')}
					</label>
				</div>
			</div>
		`;
	}

	_renderSpinner() {
		return html`
			<d2l-loading-spinner
				class="d2l-spinner"
				size=100>
			</d2l-loading-spinner>
		`;
	}

	_selectAllItemsEvent(e) {
		const checkAllItems = e.target.checked;
		this.gradeItemList.forEach(gradeItem => {
			this._setGradeItemSelection(gradeItem.GradeItemId, checkAllItems);
		});
		this._dispatchOnGradesChange();
	}

	async _setCriteriaSelection(e) {
		if (e.target.value === 'any') {
			this.searchOption = 0;
			this._dispatchOnPreferencesChange();
			return;
		}
		this.searchOption = 1;
		this._dispatchOnPreferencesChange();
	}

	_setGradeItem(gradeItem) {
		const gradeItemId = gradeItem.GradeItemId;
		const gradeItemName = gradeItem.Name;
		this.gradeItemList.push(gradeItem);
		if (!this.gradeItemHash.has(gradeItemId)) {
			this.gradeItemHash.set(gradeItemId, {
				GradeItemId: gradeItemId,
				GradeItemName: gradeItemName,
				LowerBounds: 0,
				UpperBounds: 100
			});
		}
	}

	async _setGradeItemLowerBounds(e) {
		const value = Math.min(Math.max(e.target.value, 0), 100);
		const gradeItemId = parseInt(e.target.getAttribute('gradeItemId'));

		this.gradeItemHash.get(gradeItemId).LowerBounds = e.target.value = value;
		await e.target.updateComplete;

		this._dispatchOnGradesChange();
	}

	_setGradeItemSelection(gradeItemId, selected) {
		if (selected) {
			this.gradeItemSelection.add(gradeItemId);
		} else {
			this.gradeItemSelection.delete(gradeItemId);
		}
	}

	async _setGradeItemUpperBounds(e) {
		const value = Math.min(Math.max(e.target.value, 0), 100);
		const gradeItemId = parseInt(e.target.getAttribute('gradeItemId'));

		this.gradeItemHash.get(gradeItemId).UpperBounds = e.target.value = value;
		await e.target.updateComplete;

		this._dispatchOnGradesChange();
	}

	_setInputInvalidState(percentInputId, validationError = null) {

		// NOTE: This is a hack, to get around the fact that d2l-input-number doesn't expose custom validation hooks

		const numberInput = this.shadowRoot.querySelector(percentInputId);
		numberInput.validationError = validationError;
	}

	_toggleGradeItemSelection(e) {
		const gradeItemSelected = e.target.checked;
		const gradeItemId = parseInt(e.target.id);
		this._setGradeItemSelection(gradeItemId, gradeItemSelected);
		this._dispatchOnGradesChange();
	}
}
customElements.define('cepr-grade-item-selection-page', CeprGradeItemSelectionPage);
