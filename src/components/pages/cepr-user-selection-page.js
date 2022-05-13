import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/button/floating-buttons.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/inputs/input-search.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import '@brightspace-ui-labs/pagination/pagination.js';
import '@brightspace-ui/core/components/table/table-col-sort-button.js';
import '../dialogs/cepr-student-grades-summary-dialog';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { getDateFromISODateTime } from '@brightspace-ui/core/helpers/dateTime.js';
import { guard } from 'lit-html/directives/guard.js';
import { heading1Styles  } from '@brightspace-ui/core/components/typography/styles.js';
import { LocalizeMixin } from '../../mixins/localize-mixin';
import { SortableColumn } from '../../constants';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';
import { UserServiceFactory } from '../../services/user-service-factory';

function filterSelectedUsers(allUsers, selectedUsers) {
	return allUsers.filter((user) => selectedUsers.has(user.UserId));
}

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
			},
			gradeItemQueries: {
				type: Array
			},
			allUsers: {
				type: Array
			},
			previousReportsURL: {
				type: String
			},
			gradedStudentCount: {
				type: Map
			},
			studentGradesSummaryOpened: {
				type: Boolean
			},
			enableEprEnhancements: {
				type: Boolean
			},
			searchOption: {
				type: Number
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

				.d2l-action-bar {
					align-items: center;
					display: flex;
					justify-content: space-between;
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

				.d2l-actions-right {
					display: flex;
				}

				#user-search {
					margin-left: 0.5rem;
					width: 15rem;
				}

				.d2l-selected-grades {
					margin-left: 1rem;
				}

				.d2l-grade-range {
					color: gray;
					font-size: 15px;
					margin-top: -0.5rem;
				}

				.d2l-grade-items-container {
					display: grid;
					grid-gap: 0 12px;
					grid-template-columns: 1fr 1fr 1fr;
					margin-bottom: 1rem;
				}

				.d2l-grade-item-block {
					border-bottom: 1px solid #dddddd;
					border-top: 1px solid #dddddd;
					margin-bottom: -1px;
					padding: 0.5rem;
				}

				h3 {
					margin: 0 0 10px 0;
				}
			`
		];
	}

	constructor() {
		super();

		this.userService = UserServiceFactory.getUserService();

		this.pageNumber = 1;
		this.pageSize = 25;
		this.sortField = SortableColumn.LastName;
		this.sortDesc = false;
		this.users = [];
		this.selectedUsers = new Set();
		this.selectAll = false;
		this.isLoading = true;
		this.isQuerying = false;
		this.allUsers = [];
		this.searchTerm = '';
		this.gradedStudentCount = new Map();
		this.studentGradesSummaryOpened = false;
		this._studentGradesSummaryData = [];
		this.previousSearchOption = 0;
	}

	async connectedCallback() {
		super.connectedCallback();

		this._getUserList();
	}

	render() {
		return html`
			${ this.isLoading ? this._renderSpinner() : this._renderUsers() }
		`;
	}

	updated(changedProperties) {
		super.updated(changedProperties);
		let criteriaChanged = false;
		if (this.enableEprEnhancements) {
			criteriaChanged = this.checkForGradeSelectionCriteriaUpdated(changedProperties);
		}
		if (this.checkForGradeQueriesUpdated(changedProperties) || criteriaChanged) {
			this._getUserList();
		}
	}

	checkForGradeQueriesUpdated(changedProperties) {
		return changedProperties.has('gradeItemQueries') && changedProperties.get('gradeItemQueries');
	}

	checkForGradeSelectionCriteriaUpdated(changedProperties) {
		const changedSearchOption = changedProperties.get('searchOption');

		if (changedProperties.has('searchOption') &&
			changedSearchOption !== undefined &&
			changedSearchOption !== this.previousSearchOption
		) {
			this.previousSearchOption = changedSearchOption;
			return true;
		}
		return false;
	}

	_defaultSelectAll() {
		this.selectedUsers = new Set();

		this._setUserSelection(this.allUsers.map(item => item.UserId), true);

		this._dispatchOnChange();
	}

	_dispatchOnChange() {
		// Dispatch change event to wizard wrapper
		const event = new CustomEvent('change', {
			detail: {
				selectedUsers: Array.from(this.selectedUsers)
			}
		});
		this.dispatchEvent(event);
	}

	async _getUserList() {
		this.isLoading = true;
		await this._queryNumUsers();
		await this._queryUsers();
		await this._queryAllUsers();
		this._defaultSelectAll();
		this._queryGradedStudentCount();
		this.isLoading = false;
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

	_handleSelectAllButton() {
		const checkAll = this.selectedUsers.size !== this.allUsers.length;

		this._setUserSelection(this.allUsers.map(user => user.UserId), checkAll);

		this._dispatchOnChange();
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

	_handleStudentGradesSummaryClose() {
		this.dispatchEvent(new CustomEvent('student-grades-summary-close'));
	}

	_handleStudentGradesSummaryContinueToSalesforce() {
		this.dispatchEvent(new CustomEvent('student-grades-summary-continue-to-salesforce'));
	}

	_openPreviousReportsLink() {
		window.open(this.previousReportsURL);
	}

	async _queryAllUsers() {
		this.isQuerying = true;
		this.allUsers = await this.userService.getAllUsers(this.orgUnitId, this.gradeItemQueries, this.searchOption);
		this.isQuerying = false;
	}

	_queryGradedStudentCount() {
		this.gradeItemQueries.map((gradeItem) => {
			let studentCount = 0;
			const gradeItemId = gradeItem.GradeItemId;
			this.gradedStudentCount.set(gradeItemId, studentCount);
			this.allUsers.map((student) => {
				if (!isNaN(student.Grades[gradeItemId])) {
					this.gradedStudentCount.set(gradeItemId, ++studentCount);
				}
			});
		});
	}

	async _queryNumUsers() {
		const numUsers = await this.userService.getNumUsers(this.orgUnitId, this.gradeItemQueries, this.searchTerm, this.searchOption);
		this.maxPage = Math.max(Math.ceil(numUsers / this.pageSize), 1);
		this.pageNumber = 1;
	}

	async _queryUsers() {
		this.isQuerying = true;
		this.users = await this.userService.getUsers(this.orgUnitId, this.pageNumber, this.pageSize, this.sortField, this.sortDesc, this.gradeItemQueries, this.searchTerm, this.searchOption);
		this.isQuerying = false;
	}

	_renderGradeItems(gradeItem) {
		const gradeName = gradeItem.GradeItemName;
		const lowerBound = Math.round(gradeItem.LowerBounds * 100);
		const upperBound = Math.round(gradeItem.UpperBounds * 100);

		return html`
			<div class="d2l-grade-item-block">
				<b>${gradeName}</b>
				<div class="d2l-grade-range">
					${lowerBound}% - ${upperBound}% (${(this.localize('numberOfStudentsPerGrade', { studentCount: this.gradedStudentCount.get(gradeItem.GradeItemId) }))})
				</div>
			</div>
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

	_renderSearchBar() {
		return html`
			<d2l-input-search
				id="user-search"
				label="Search"
				placeholder="${this.localize('searchUserPlaceholder')}"
				value="${this.searchTerm}"
				@d2l-input-search-searched="${this._search}">
			</d2l-input-search>
		`;
	}

	_renderSelectAllButton() {
		const buttonText = this.selectedUsers.size !== this.allUsers.length ?
			this.localize('SelectAllButton', { selectedStudentCount: this.allUsers.length })
			: this.localize('DeselectAllButton', { selectedStudentCount: this.allUsers.length });

		return html`
			<d2l-button-subtle
				text="${buttonText}"
				icon="${this.selectedUsers.size !== this.allUsers.length ? 'tier1:check-circle' : 'tier1:close-circle'}"
				@click="${this._handleSelectAllButton}"
			></d2l-button-subtle>
		`;
	}

	_renderSelectedGradeItems() {
		if (this.gradeItemQueries.length === 0) {
			return html`<h3>${this.localize('emptyGradeFilter')}</h3>`;
		}

		return html`
			<h3>${this.localize('selectedGradeItemsHeader')}</h3>
			<div class="d2l-grade-items-container">
				${this.gradeItemQueries.map(gradeItem => this._renderGradeItems(gradeItem))}
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
		const studentsWithGrades = guard(
			[this.allUsers, this.selectedUsers],
			() => filterSelectedUsers(this.allUsers, this.selectedUsers)
		);

		const gradeItemIds = guard(
			[this.gradeItemQueries],
			() => this.gradeItemQueries.map(({ GradeItemId }) => GradeItemId)
		);

		const bounds = guard(
			[this.gradeItemQueries],
			() => this.gradeItemQueries.map(({ GradeItemId, LowerBounds, UpperBounds }) => ({
				GradeItemId,
				LowerBounds,
				UpperBounds
			}))
		);

		return html`
			${this._renderSelectedGradeItems()}
			<div class="d2l-action-bar">
				<div>${this._renderSelectAllButton()}</div>
				<div class="d2l-actions-right">
					${this._renderPreviousReportsButton()}
					${this._renderSearchBar()}
				</div>
			</div>
			<d2l-table-wrapper sticky-headers>
				<table class="d2l-table">
					<thead>
						<th>
							<d2l-input-checkbox
								?checked=${this.selectedUsers.size === this.users.length || this.selectedUsers.size === this.allUsers.length}
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
			<cepr-student-grades-summary-dialog
				orgUnitId=${this.orgUnitId}
				?enableEprEnhancements="${this.enableEprEnhancements}"
				?opened="${this.studentGradesSummaryOpened}"
				.studentsWithGrades=${studentsWithGrades}
				.gradeItemIds=${gradeItemIds}
				.bounds=${bounds}
				@close=${this._handleStudentGradesSummaryClose}
				@continue-to-salesforce=${this._handleStudentGradesSummaryContinueToSalesforce}
			></cepr-student-grades-summary-dialog>
		`;
	}

	async _search(e) {
		this.searchTerm = e.target.value;
		await this._queryNumUsers();
		await this._queryUsers();
	}

	_selectAllItemsEvent(e) {
		const checkAllItems = e.target.checked;
		this._setUserSelection(this.users.map(user => user.UserId), checkAllItems);
		this._dispatchOnChange();
	}

	_selectUser(e) {
		const userSelected = e.target.checked;
		const userId = parseInt(e.target.id);
		this._setUserSelection(userId, userSelected);
		this._dispatchOnChange();
	}

	_setUserSelection(userIds, selected) {
		if (!Array.isArray(userIds)) {
			userIds = [userIds];
		}

		const newSelectedUsers = new Set(this.selectedUsers);

		userIds.forEach((userId) => {
			if (selected) {
				newSelectedUsers.add(userId);
			} else {
				newSelectedUsers.delete(userId);
			}
		});

		this.selectedUsers = newSelectedUsers;
	}
}
customElements.define('cepr-user-selection-page', CeprUserSelectionPage);
