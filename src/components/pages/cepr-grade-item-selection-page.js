import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/button/floating-buttons.js';
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
					margin-top: 30px;
				}

				.d2l-table-cell-first {
					width: 24px;
				}

				.grade-item-range-column {
					width: 5.5rem;
				}
			`
		];
	}

	constructor() {
		super();

		this.gradeItemService = GradeItemServiceFactory.getGradeItemService();

		this.gradeItems = new Map();

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
	}

	async _queryGradeItems() {
		this.isQuerying = true;

		const gradeItemsList = await this.gradeItemService.getGradeItems(this.orgUnitId);
		this.gradeItems.clear();
		gradeItemsList.forEach(gradeItem => {
			const gradeItemId = gradeItem.GradeItemId;
			this.gradeItems.set(gradeItemId, gradeItem);
			if (!this.gradeItemHash.has(gradeItemId)) {
				this.gradeItemHash.set(gradeItemId, {
					GradeItemId: gradeItemId,
					LowerBounds: 0,
					UpperBounds: 100
				});
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
				<td>${gradeItem.Name}</td>
				<td class="grade-item-range-column">
					<d2l-input-percent
						input-width="100%"
						label="${gradeItem.Name} ${this.localize('minGradeTableHeader')}"
						label-hidden
						value="${this.gradeItemHash.get(gradeItem.GradeItemId)?.LowerBounds}"
						id=${gradeItem.GradeItemId}
						?disabled=${!this.gradeItemSelection.has(gradeItem.GradeItemId)}
						@change=${this._setGradeItemLowerBounds}
						required>
					</d2l-input-percent>
				</td>
				<td class="grade-item-range-column">
					<d2l-input-percent
						input-width="100%"
						label="${gradeItem.Name} ${this.localize('maxGradeTableHeader')}"
						label-hidden
						value="${this.gradeItemHash.get(gradeItem.GradeItemId)?.UpperBounds}"
						id=${gradeItem.GradeItemId}
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
							?checked=${this.gradeItemSelection.size === this.gradeItems.size}
							@change=${this._selectAllItemsEvent}
							></d2l-input-checkbox>
						</th>
						<th>${this.localize('gradeItemTableHeader')}</th>
						<th>${this.localize('minGradeTableHeader')}</th>
						<th>${this.localize('maxGradeTableHeader')}</th>
					</thead>
					<tbody>
						${ this.isQuerying ? '' : Array.from(this.gradeItems.values()).map(gradeItem => this._renderGradeItem(gradeItem)) }
					</tbody>
				</table>
				${ this.isQuerying ? this._renderSpinner() : '' }
			</d2l-table-wrapper>
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
		this.gradeItems.forEach(gradeItem => {
			this._setGradeItemSelection(gradeItem.GradeItemId, checkAllItems);
		});
		this._dispatchOnChange();
		this.requestUpdate();
	}

	_setGradeItemLowerBounds(e) {
		const gradeItemId = parseInt(e.target.id);
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
		const gradeItemId = parseInt(e.target.id);
		this.gradeItemHash.get(gradeItemId).UpperBounds = e.target.value;
		this._dispatchOnChange();
	}

	_toggleGradeItemSelection(e) {
		const gradeItemSelected = e.target.checked;
		const gradeItemId = parseInt(e.target.id);
		this._setGradeItemSelection(gradeItemId, gradeItemSelected);
		this._dispatchOnChange();
		this.requestUpdate();
	}
}
customElements.define('cepr-grade-item-selection-page', CeprGradeItemSelectionPage);
