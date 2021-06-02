import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/button/floating-buttons.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
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
				type: Array
			},
			isLoading: {
				type: Boolean
			},
			isQuerying: {
				type: Boolean
			},
			selectedGradeItems: {
				type: Set
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
			`
		];
	}

	constructor() {
		super();

		this.gradeItemService = GradeItemServiceFactory.getGradeItemService();

		this.gradeItems = [];
		this.selectedGradeItems = new Set();
		this.isLoading = true;
		this.isQuerying = false;
	}

	async connectedCallback() {
		super.connectedCallback();

		this.isLoading = true;

		await this._queryNumGradeItems();
		await this._queryGradeItems();

		this.isLoading = false;
	}

	render() {
		return html`
			${ this.isLoading ? this._renderSpinner() : this._renderGradeItems() }
		`;
	}

	async _queryGradeItems() {
		this.isQuerying = true;
		this.users = await this.gradeItemService.getGradeItems(this.orgUnitId);
		this.isQuerying = false;
	}

	async _queryNumGradeItems() {
		const numUsers = await this.userService.getNumUsers(this.orgUnitId);
		this.maxPage = Math.max(Math.ceil(numUsers / this.pageSize), 1);
	}

	_renderGradeItem(gradeItem) {
		return html`
			<tr ?selected=${this.selectedGradeItems.has(gradeItem.gradeItemId)}>
				<td>
					<d2l-input-checkbox
						@change=${this._selectGradeItem}
						id="${gradeItem.gradeItemId}"
						?checked=${this.selectedGradeItems.has(gradeItem.gradeItemId)}
					></d2l-input-checkbox>
				</td>
				<td>${gradeItem.name}</td>
				<td>TODO - Lower Bounds input</td>
				<td>TODO - Upper Bounds input</td>
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
								?checked=${this.selectedGradeItems.size === this.gradeItems.length}
								@change=${this._selectAllItemsEvent}
							></d2l-input-checkbox>
						</th>
						<th>${this.localize('TODO')}</th>
						<th>${this.localize('TODO')}</th>
						<th>${this.localize('TODO')}</th>
					</thead>
					<tbody>
						${ this.isQuerying ? '' : this.gradeItems.map(gradeItem => this._renderGradeItem(gradeItem)) }
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
		if (checkAllItems) {
			this.gradeItems.forEach(gradeItem => this.selectedGradeItems.add(gradeItem.gradeItemId));
		} else {
			this.gradeItems.forEach(gradeItem => this.selectedGradeItems.delete(gradeItem.gradeItemId));
		}
		// need to re-render table with new selection updates
		this.requestUpdate();
	}

	_selectGradeItem(e) {
		const gradeItemSelected = e.target.checked;
		const gradeItemId = parseInt(e.target.gradeItemId);
		if (gradeItemSelected) {
			this.selectedGradeItems.add(gradeItemId);
		} else {
			this.selectedGradeItems.delete(gradeItemId);
		}
		this.requestUpdate();
	}
}
customElements.define('cepr-grade-item-selection-page', CeprGradeItemSelectionPage);
