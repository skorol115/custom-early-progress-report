import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import '@brightspace-ui-labs/pagination/pagination.js';
import 'd2l-table/d2l-table-wrapper.js';
import 'd2l-table/d2l-table-col-sort-button';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { d2lTableStyles } from '../../style/d2l-table-styles.js';
import { heading1Styles  } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../../mixins/localize-mixin';

const SortableColumn = {
	LastName: 0,
	FirstName: 1,
	OrgDefinedId: 2,
	Role: 3,
	LastAccessed: 4
};

// TODO delete the test data
const TestUsers = [
    {
        UserId: 414,
        LastName: 'IPSIS',
        FirstName: 'LIS_STUDENT_04',
        UserName: 'LIS_STUDENT_04',
        OrgDefinedId: 'LIS_STUDENT_04.IPSIS',
        RoleId: 578,
        RoleName: 'End User',
        LastCourseHomepageAccess: null
    },
    {
        UserId: 415,
        LastName: 'IPSIS',
        FirstName: 'LIS_STUDENT_05',
        UserName: 'LIS_STUDENT_05',
        OrgDefinedId: 'LIS_STUDENT_05.IPSIS',
        RoleId: 578,
        RoleName: 'End User',
        LastCourseHomepageAccess: null
    },
    {
        UserId: 416,
        LastName: 'IPSIS',
        FirstName: 'LIS_STUDENT_06',
        UserName: 'LIS_STUDENT_06',
        OrgDefinedId: 'LIS_STUDENT_06.IPSIS',
        RoleId: 578,
        RoleName: 'End User',
    	LastCourseHomepageAccess: null
    }
];

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
			}
		};
	}

	static get styles() {
		return [
			heading1Styles,
			d2lTableStyles,
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
					margin: 0px;
				}
			`
		];
	}

	constructor() {
		super();
		this.pageNumber = 1;
		this.maxPage = 5;
		this.pageSize = 1;
		this.sortField = SortableColumn.LastName;
		this.sortDesc = false;
		this.users = [];
		this.selectedUsers = new Set();

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

	async _queryNumUsers() {
		// TODO: actually fetch the number of users
		const numUsers = 100;
		this.maxPage = Math.max(Math.ceil(numUsers / this.pageSize), 1);
	}

	async _queryUsers() {
		this.isQuerying = true;

		// TODO: actually fetch users
		this.users = TestUsers;

		this.isQuerying = false;
	}

	async _handleItemsPerPageChange(event) {

		// Update the page count and total # of logs
		this.pageSize = event.detail.itemCount;
		await this._queryNumUsers();

		// If the number of total logs and the new page size no longer support the current page, adjust it
		this.pageNumber = Math.min(this.pageNumber, this.maxPage);

		// Re-query the page of logs with new pagination values
		await this._queryUsers();
	}

	async _handlePageChange(event) {
		this.pageNumber = event.detail.page;
		await this._queryUsers();
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
			// TODO: are we adding all on this page or ALL users
			this.users.forEach(user => this.selectedUsers.add(user.UserId));
		} else {
			// TODO: are we clearing ALL selected or just those selected on this page?
			this.users.forEach(user => this.selectedUsers.delete(user.UserId));
		}
		this.requestUpdate();
	}

	_selectUser(e) {
		const userSelected = e.target.checked;
		const userId = e.target.id;
		if (userSelected) {
			this.selectedUsers.add(userId);
		} else {
			this.selectedUsers.delete(userId);
		}
	}

	_handleSort(e) {
		console.dir(e);
		const sortHeaderElement = e.target;
 		const selectedSortField = parseInt(sortHeaderElement.getAttribute('value'));
		if (selectedSortField === this.sortField) {
			this.sortDesc = !this.sortDesc;
		} else {
			this.sortField = selectedSortField;
			this.sortDesc = false;
		}
		// TODO - fetch new results based on updated sort info
	}

	_renderUser(user) {
		return html`
			<tr>
				<td>
					<d2l-input-checkbox
						@change=${this._selectUser}
						id="${user.UserId}"
						?checked=${this.selectedUsers.has(user.UserId)}
					></d2l-input-checkbox>
				</td>
				<td>${user.LastName}, ${user.FirstName}</td>
				<td>${user.UserName}</td>
				<td>${user.OrgDefinedId}</td>
				<td>${user.RoleId}</td>
				<td>${user.LastCourseHomepageAccess}</td>
			</tr>
		`;
	}

	_renderUsers() {
		return html`
			<d2l-table-wrapper>
				<table class="d2l-table">
					<thead>
						<th>
							<d2l-input-checkbox
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
						<th>${this.localize('userNameTableHeader')}</th>
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
								?nosort=${this.sortField !== SortableColumn.Role}
								?desc=${this.sortDesc}
								value=${SortableColumn.Role}
								@click=${this._handleSort}
							>
								${this.localize('roleTableHeader')}
							</d2l-table-col-sort-button>
						</th>
						<th>
							<d2l-table-col-sort-button
								?nosort=${this.sortField !== SortableColumn.LastAccessed}
								?desc=${this.sortDesc}
								value=${SortableColumn.LastAccessed}
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
				item-count-options="[1, 2, 3]"
				selected-count-option="${this.pageSize}"
				@pagination-page-change=${this._handlePageChange}
				@pagination-item-counter-change=${this._handleItemsPerPageChange}
			></d2l-labs-pagination>
		`;
	}

	render() {
		return html`
			<h1 class="d2l-heading-1">${this.localize('toolTitle')}</h1>
			${this.localize('toolDescription')}
			${ this.isLoading ? this._renderSpinner() : this._renderUsers() }
		`;
	}
}
customElements.define('cepr-user-selection-page', CeprUserSelectionPage);
