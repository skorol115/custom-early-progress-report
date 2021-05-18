import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import '@brightspace-ui-labs/pagination/pagination.js';
import 'd2l-table/d2l-table-wrapper.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { d2lTableStyles } from '../../style/d2l-table-styles.js';
import { heading1Styles  } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../../mixins/localize-mixin';

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
			// TODO - convert to array if Map isn't necessary
			users: {
				type: Map
			},
			isLoading: {
				type: Boolean
			},
			isQuerying: {
				type: Boolean
			},
			selectedUsers: {
				type: Set
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
		this.users = new Map();
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
		this.users.set(1, {
			id: 1,
			name: "last 1, first 1",
			userName: "user1",
			orgId: 6606,
			role: 123,
			lastAccessed: "date 1"
		});

		this.users.set(2, {
			id: 2,
			name: "last 2, first 2",
			userName: "user2",
			orgId: 6606,
			role: 1234,
			lastAccessed: "date 2"
		});

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
			this.users.forEach(user => this.selectedUsers.add(user.id));
		} else {
			this.selectedUsers.clear();
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

	_renderUser(user) {
		return html`
			<tr>
				<td>
					<!-- TODO - add aria label to checkbox -->
					<d2l-input-checkbox
						@change="${this._selectUser}"
						id="${user.id}"
						?checked="${this.selectedUsers.has(user.id)}"
					></d2l-input-checkbox>
				</td>
				<td>${user.name}</td>
				<td>${user.userName}</td>
				<td>${user.orgId}</td>
				<td>${user.role}</td>
				<td>${user.lastAccessed}</td>
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
								@change="${this._selectAllItemsEvent}"
								ariaLabel="${this.localize('selectAllAriaLabel')}"
							></d2l-input-checkbox>
						</th>
						<th>${this.localize('nameTableHeader')}</th>
						<th>${this.localize('userNameTableHeader')}</th>
						<th>${this.localize('orgTableHeader')}</th>
						<th>${this.localize('roleTableHeader')}</th>
						<th>${this.localize('lastAccessedTableHeader')}</th>
					</thead>
					<tbody>
						${ this.isQuerying ? '' : Array.from( this.users ).map(([userId, user]) => this._renderUser(user)) }
					</tbody>
				</table>
				${ this.isQuerying ? this._renderSpinner() : '' }
			</d2l-table-wrapper>
			<d2l-labs-pagination
				id="user-pagination"
				page-number="${ this.pageNumber }"
				max-page-number="${ this.maxPage }"
				show-item-count-select
				item-count-options="[1, 2, 3]"
				selected-count-option="${ this.pageSize }"
				@pagination-page-change="${ this._handlePageChange }"
				@pagination-item-counter-change="${ this._handleItemsPerPageChange }"
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
