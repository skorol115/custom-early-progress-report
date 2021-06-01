import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/button/floating-buttons.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import '@brightspace-ui-labs/pagination/pagination.js';
import '@brightspace-ui/core/components/table/table-col-sort-button.js'
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { getDateFromISODateTime } from '@brightspace-ui/core/helpers/dateTime.js';
import { heading1Styles  } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../../mixins/localize-mixin';
import { SortableColumn } from '../../constants';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';
import { UserService } from '../../services/user-service';

class CeprUserSelectionPage extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			pageNumber: {
				type: Number
			},
			maxPage: {
				type: Number
			},
			pageSize: {
				type: Number
			},
			users: {
				type: Array
			},
			isLoading: {
				type: Boolean
			},
			isQuerying: {
				type: Boolean
			},
			selectedUsers: {
				type: Set
			},
			sortField: {
				type: Number
			},
			sortDesc: {
				type: Boolean
			},
			selectAll: {
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
			`
		];
	}

	constructor() {
		super();
		this.pageNumber = 1;
		this.pageSize = 25;
		this.sortField = SortableColumn.LastName;
		this.sortDesc = false;
		this.users = [];
		this.selectedUsers = new Set();
		this.selectAll = false;
		this.isLoading = true;
		this.isQuerying = false;
	}

	async connectedCallback() {
		super.connectedCallback();

		this.isLoading = true;

		await this._queryNumUsers();
		await this._queryUsers();

		this.isLoading = false;
	}

	render() {
		return html`
			<h1 class="d2l-heading-1">${this.localize('toolTitle')}</h1>
			${this.localize('toolDescription')}
			${ this.isLoading ? this._renderSpinner() : this._renderUsers() }
			${this._renderFloatingButtons()}
		`;
	}

	async _handleItemsPerPageChange(event) {
		// Update the page count and total # of users
		this.pageSize = event.detail.itemCount;
		await this._queryNumUsers();
		await this._queryUsers();
	}

	async _handlePageChange(event) {
		this.pageNumber = event.detail.page;
		// Users need to re-select all for new pages
		this.selectAll = false;
		await this._queryUsers();
	}

	_handleSort(e) {
		const sortHeaderElement = e.target;
		const selectedSortField = parseInt(sortHeaderElement.getAttribute('value'));
		if (selectedSortField === this.sortField) {
			this.sortDesc = !this.sortDesc;
		} else {
			this.sortField = selectedSortField;
			this.sortDesc = false;
		}
		this.pageNumber = 1;
		// Users need to re-select all for new pages and sort parameters
		this.selectAll = false;
		this._queryUsers();
	}

	async _queryNumUsers() {
		const numUsers = await UserService.getNumUsers(this.orgUnitId);
		this.maxPage = Math.max(Math.ceil(numUsers / this.pageSize), 1);
	}

	async _queryUsers() {
		this.isQuerying = true;
		this.users = await UserService.getUsers(this.orgUnitId, this.pageNumber, this.pageSize, this.sortField, this.sortDesc);
		this.isQuerying = false;
	}

	_renderFloatingButtons() {
		return html`
			<d2l-floating-buttons>
				<d2l-button
					primary
					?disabled=${!this.selectedUsers.size}
				>
					Select Feedback
				</d2l-button>
				<d2l-button-subtle
					text="${this.localize('numberOfSelectedStudents', { selectedStudentsCount: this.selectedUsers.size })}"
					?disabled=${!this.selectedUsers.size}
				></d2l-button-subtle>
			</d2l-floating-buttons>
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

	_renderUser(user) {
		const lastAccessedDate = user.LastCourseHomepageAccess ? getDateFromISODateTime(user.LastCourseHomepageAccess).toLocaleString() : null;
		return html`
			<tr ?selected=${this.selectedUsers.has(user.UserId)}>
				<td>
					<d2l-input-checkbox
						@change=${this._selectUser}
						id="${user.UserId}"
						?checked=${this.selectedUsers.has(user.UserId)}
					></d2l-input-checkbox>
				</td>
				<td>${user.LastName}, ${user.FirstName}</td>
				<td>${user.OrgDefinedId}</td>
				<td>${user.SectionName}</td>
				<td>${lastAccessedDate}</td>
			</tr>
		`;
	}

	_renderUsers() {
		return html`
			<d2l-table-wrapper sticky-headers>
				<table class="d2l-table">
					<thead>
						<th>
							<d2l-input-checkbox
								?checked=${this.selectAll}
								@change=${this._selectAllItemsEvent}
							></d2l-input-checkbox>
						</th>
						<th>
							<d2l-table-col-sort-button
								?nosort=${this.sortField !== SortableColumn.LastName}
								?desc=${this.sortDesc}
								value=${SortableColumn.LastName}
								@click=${this._handleSort}
							>
								${this.localize('lastNameTableHeader')}
							</d2l-table-col-sort-button>,
							<d2l-table-col-sort-button
								?nosort=${this.sortField !== SortableColumn.FirstName}
								?desc=${this.sortDesc}
								value=${SortableColumn.FirstName}
								@click=${this._handleSort}
							>
								${this.localize('firstNameTableHeader')}
							</d2l-table-col-sort-button>
						</th>
						<th>
							<d2l-table-col-sort-button
								?nosort=${this.sortField !== SortableColumn.OrgDefinedId}
								?desc=${this.sortDesc}
								value=${SortableColumn.OrgDefinedId}
								@click=${this._handleSort}
							>
								${this.localize('orgTableHeader')}
							</d2l-table-col-sort-button>
						</th>
						<th>
							<d2l-table-col-sort-button
								?nosort=${this.sortField !== SortableColumn.SectionName}
								?desc=${this.sortDesc}
								value=${SortableColumn.SectionName}
								@click=${this._handleSort}
							>
								${this.localize('sectionNameTableHeader')}
							</d2l-table-col-sort-button>
						</th>
						<th>
							<d2l-table-col-sort-button
								?nosort=${this.sortField !== SortableColumn.LastCourseHomepageAccess}
								?desc=${this.sortDesc}
								value=${SortableColumn.LastCourseHomepageAccess}
								@click=${this._handleSort}
							>
								${this.localize('lastAccessedTableHeader')}
							</d2l-table-col-sort-button>
						</th>
					</thead>
					<tbody>
						${ this.isQuerying ? '' : this.users.map(user => this._renderUser(user)) }
					</tbody>
				</table>
				${ this.isQuerying ? this._renderSpinner() : '' }
			</d2l-table-wrapper>
			<d2l-labs-pagination
				id="user-pagination"
				page-number="${this.pageNumber}"
				max-page-number="${this.maxPage}"
				show-item-count-select
				item-count-options="[25,50,75,100,200]"
				selected-count-option="${this.pageSize}"
				@pagination-page-change=${this._handlePageChange}
				@pagination-item-counter-change=${this._handleItemsPerPageChange}
			></d2l-labs-pagination>
		`;
	}

	_selectAllItemsEvent(e) {
		const checkAllItems = e.target.checked;
		this.selectAll = checkAllItems;
		if (checkAllItems) {
			this.users.forEach(user => this.selectedUsers.add(user.UserId));
		} else {
			this.users.forEach(user => this.selectedUsers.delete(user.UserId));
		}
		// need to re-render table with new selection updates
		this.requestUpdate();
	}

	_selectUser(e) {
		const userSelected = e.target.checked;
		const userId = parseInt(e.target.id);
		if (userSelected) {
			this.selectedUsers.add(userId);
		} else {
			this.selectedUsers.delete(userId);
		}
		this.requestUpdate();
	}
}
customElements.define('cepr-user-selection-page', CeprUserSelectionPage);
