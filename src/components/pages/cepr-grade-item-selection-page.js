import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/button/floating-buttons.js';
import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/inputs/input-percent.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import '@brightspace-ui-labs/pagination/pagination.js';
import '@brightspace-ui/core/components/table/table-col-sort-button.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { GradeItemServiceFactory } from '../../services/grade-item-service-factory';
import { heading1Styles  } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../../mixins/localize-mixin';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';

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
			}
		};
	}

	static get styles() {
		return [
			heading1Styles,
			tableStyles,
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
					margin: 0;
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
			`
		];
	}

	constructor() {
		super();

		this.gradeItemService = GradeItemServiceFactory.getGradeItemService();

		this.gradeItemList = [];

		// A hashmap for holding grade item state, which will be maintained through subsequent Grade Item queries
		this.gradeItemHash = new Map();

		this.gradeItemSelection = new Set();

		this.isLoading = true;
		this.isQuerying = false;
	}

	async connectedCallback() {
		super.connectedCallback();

		this.isLoading = true;

		await this._queryGradeItems();

		this.isLoading = false;
	}

	render() {
		return html`
			${ this.isLoading ? this._renderSpinner() : this._renderGradeItems() }
			`;
	}

	_dispatchOnChange() {

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
				this._setPercentInputInvalidState(`#lower_${gradeItemId}`, true, errorMsg);
				this._setPercentInputInvalidState(`#upper_${gradeItemId}`, true, errorMsg);
				gradeItemInvalid = true;

			} else {

				// Clear any existing invalid states
				this._setPercentInputInvalidState(`#lower_${gradeItemId}`, false);
				this._setPercentInputInvalidState(`#upper_${gradeItemId}`, false);

			}

			gradeItemQueries.push({
				GradeItemId: gradeItemId,
				LowerBounds: gradeItem.LowerBounds,
				UpperBounds: gradeItem.UpperBounds
			});
		});

		// Dispatch change event to wizard wrapper
		const event = new CustomEvent('change', {
			detail: {
				gradeItemInvalid: gradeItemInvalid,
				gradeItemQueries: gradeItemQueries
			}
		});
		this.dispatchEvent(event);
		this.requestUpdate();
	}

	async _queryGradeItems() {
		this.isQuerying = true;

		const gradeItems = await this.gradeItemService.getGradeItems(this.orgUnitId);

		// Build a list of grade items to render, and a hash of query data to reference in constant time
		this.gradeItemList = [];
		gradeItems.forEach(gradeItem => {
			const gradeItemId = gradeItem.GradeItemId;
			this.gradeItemList.push(gradeItem);
			if (!this.gradeItemHash.has(gradeItemId)) {
				this.gradeItemHash.set(gradeItemId, {
					GradeItemId: gradeItemId,
					LowerBounds: 0,
					UpperBounds: 100
				});
			}
		});

		// Sort grade items alphabetically
		this.gradeItemList = this.gradeItemList.sort((a, b) => {
			const nameA = a.Name.toUpperCase();
			const nameB = b.Name.toUpperCase();
			if (nameA < nameB) {
				return -1;
			} else if (nameA > nameB) {
				return 1;
			} else {
				return 0;
			}
		});

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
					<d2l-input-percent
						input-width="100%"
						label="${gradeItem.Name} ${this.localize('minGradeTableHeader')}"
						label-hidden
						value="${this.gradeItemHash.get(gradeItem.GradeItemId)?.LowerBounds}"
						id="lower_${gradeItem.GradeItemId}"
						gradeItemId=${gradeItem.GradeItemId}
						?disabled=${!this.gradeItemSelection.has(gradeItem.GradeItemId)}
						@change=${this._setGradeItemLowerBounds}
						required>
					</d2l-input-percent>
				</td>
				<td class="d2l-grade-item-range-column">
					<d2l-input-percent
						input-width="100%"
						label="${gradeItem.Name} ${this.localize('maxGradeTableHeader')}"
						label-hidden
						value="${this.gradeItemHash.get(gradeItem.GradeItemId)?.UpperBounds}"
						id="upper_${gradeItem.GradeItemId}"
						gradeItemId=${gradeItem.GradeItemId}
						?disabled=${!this.gradeItemSelection.has(gradeItem.GradeItemId)}
						@change=${this._setGradeItemUpperBounds}
						required>
					</d2l-input-percent>
				</td>
			</tr>
		`;
	}

	_renderGradeItems() {
		return html`
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
		this._dispatchOnChange();
	}

	_setGradeItemLowerBounds(e) {
		const gradeItemId = parseInt(e.target.getAttribute('gradeItemId'));
		this.gradeItemHash.get(gradeItemId).LowerBounds = e.target.value;
		this._dispatchOnChange();
	}

	_setGradeItemSelection(gradeItemId, selected) {
		if (selected) {
			this.gradeItemSelection.add(gradeItemId);
		} else {
			this.gradeItemSelection.delete(gradeItemId);
		}
	}

	_setGradeItemUpperBounds(e) {
		const gradeItemId = parseInt(e.target.getAttribute('gradeItemId'));
		this.gradeItemHash.get(gradeItemId).UpperBounds = e.target.value;
		this._dispatchOnChange();
	}

	_setPercentInputInvalidState(percentInputId, invalid, validationError = null) {

		// NOTE: This is a hack, to get around the fact that d2l-input-percent doesn't expose custom validation hooks

		// Red outline on d2l-input-percent element
		const percentInput = this.shadowRoot.querySelector(percentInputId);
		percentInput.invalid = invalid;

		// Validation error message on inner d2l-input-number element
		const innerNumberInput = percentInput?.shadowRoot.querySelector('d2l-input-number');
		if (innerNumberInput) {
			innerNumberInput.hideInvalidIcon = true;
			innerNumberInput.validationError = validationError;
		}
	}

	_toggleGradeItemSelection(e) {
		const gradeItemSelected = e.target.checked;
		const gradeItemId = parseInt(e.target.id);
		this._setGradeItemSelection(gradeItemId, gradeItemSelected);
		this._dispatchOnChange();
	}
}
customElements.define('cepr-grade-item-selection-page', CeprGradeItemSelectionPage);
