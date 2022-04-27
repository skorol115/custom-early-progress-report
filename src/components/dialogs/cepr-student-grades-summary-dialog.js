import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/button/button-subtle.js';
import '@brightspace-ui/core/components/button/floating-buttons.js';
import '@brightspace-ui/core/components/dialog/dialog.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/loading-spinner/loading-spinner.js';
import '@brightspace-ui/core/components/table/table-col-sort-button.js';
import '@brightspace-ui-labs/pagination/pagination.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { GradeItemServiceFactory } from '../../services/grade-item-service-factory';
import { LocalizeMixin } from '../../mixins/localize-mixin';
import { tableStyles } from '@brightspace-ui/core/components/table/table-wrapper.js';

class CeprStudentGradesSummaryDialog extends LocalizeMixin(LitElement) {
	static get properties() {
		return {
			orgUnitId: {
				type: String
			},
			opened: {
				type: Boolean
			},
			gradeItemIds: {
				attribute: false
			},
			studentsWithGrades: {
				attribute: false
			},
			_allGradeItemsData: {
				attribute: false
			},
			pageNumber: {
				type: Number
			},
			pageSize: {
				type: Number
			},
			_gradeItems: {
				attribute: false
			},
			_sortedStudents: {
				attribute: false
			},
			bounds: {
				attribute: false
			},
			enableEprEnhancements: {
				type: Boolean
			},
		};
	}

	static get styles() {
		return [
			tableStyles,
			css`
				table {
					padding-right: 10px;
				}
				td:first-child, th:first-child {
					left: -21px;
					position: sticky;
				}
				th:first-child {
					z-index: 100;
				}
				td:first-child {
					background: white;
					z-index: 50;
				}
				.d2l-student-name {
					font-weight: bold;
					white-space: nowrap;
				}
				.d2l-tableHeader-container {
					display: flex;
					flex-direction: column;
				}
			`
		];
	}

	constructor() {
		super();

		this.opened = false;
		this.studentsWithGrades = [];
		this.gradeItemIds = [];
		this.bounds = [];
		this._allGradeItemsData = null;
		this.pageNumber = 1;
		this.pageSize = 25;
	}

	get maxPage() {
		return Math.floor((this.studentsWithGrades.length - 1) / this.pageSize) + 1;
	}

	async connectedCallback() {
		super.connectedCallback();

		this._loadAllGradeItemsData();
	}

	render() {
		const title = this.localize('studentGradesSummaryDialogTitle', {
			selectedStudentsCount: this.studentsWithGrades.length
		});
		const isLoading = !this._allGradeItemsData
			|| !this._gradeItems
			|| !this._sortedStudents
			|| this.gradeItemIds.length != this._gradeItems.length;

		return html`
		<d2l-dialog
			title-text="${title}"
			width="1028"
			?opened=${this.opened}
			@d2l-dialog-close=${this._handleDialogClose}
		>
			${ isLoading ? this._renderSpinner() : this._renderTable() }
			<d2l-button
				slot="footer"
				primary
				@click=${this._handleContinueToSalesforce}
			>
				${this.localize('continueToSalesforceButton')}
			</d2l-button>
			<d2l-button slot="footer" data-dialog-action>
				${this.localize('closeButton')}
			</d2l-button>
		</d2l-dialog>
		`;
	}

	updated(changedProperties) {
		// Compute _gradeItems based on _allGradeItemsData and gradeItemIds
		if (changedProperties.has('_allGradeItemsData') ||
			changedProperties.has('gradeItemIds')
		) {
			this._gradeItems = this._getGradeItems();
		}

		if (changedProperties.has('studentsWithGrades')) {
			// Compute _sortedStudents based on studentsWithGrades
			this._sortedStudents = this._getSortedStudents();

			// Reset current page when students change
			this.pageNumber = 1;
		}
	}

	_getGradeItems() {
		if (!this._allGradeItemsData) return null;

		const gradeItems = this.gradeItemIds.map((gradeItemId) =>
			this._allGradeItemsData.find((gradeItemData) =>
				gradeItemData.GradeItemId === gradeItemId
			)
		);

		return gradeItems;
	}

	_getSortedStudents() {
		if (!this.studentsWithGrades) return null;

		return this.studentsWithGrades.sort((a, b) => {
			const aFullName = a.LastName + a.FirstName;
			const bFullName = b.LastName + b.FirstName;

			if (aFullName < bFullName) {
				return -1;
			}
			if (aFullName > bFullName) {
				return 1;
			}

			return 0;
		});
	}

	_handleContinueToSalesforce() {
		this.dispatchEvent(new CustomEvent('continue-to-salesforce'));
	}

	_handleDialogClose() {
		this.dispatchEvent(new CustomEvent('close'));
	}

	async _handleItemsPerPageChange(event) {
		this.pageSize = event.detail.itemCount;
		this.pageNumber = 1;
	}

	async _handlePageChange(event) {
		this.pageNumber = event.detail.page;
	}

	async _loadAllGradeItemsData() {
		this._allGradeItemsData = await GradeItemServiceFactory
			.getGradeItemService()
			.getGradeItems(this.orgUnitId);
	}

	_renderSpinner() {
		return html`
			<d2l-loading-spinner
				class="d2l-spinner"
				size=100>
			</d2l-loading-spinner>
		`;
	}

	_renderTable() {
		return html`
			<d2l-table-wrapper sticky-headers>
				<table class="d2l-table" tabindex="0">
					${this._renderTableHeader()}
					${this._renderTableBody()}
				</table>
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

	_renderTableBody() {
		const currentOffset = (this.pageNumber - 1) * this.pageSize;
		const currentPageStudents = this._sortedStudents.slice(
			currentOffset,
			currentOffset + this.pageSize
		);

		return html`
			<tbody>
				${currentPageStudents.map((student) => html`
					<tr>
						<td>
							<div class="d2l-student-name">
								${student.LastName}, ${student.FirstName}
							</div>
							<div>${student.OrgDefinedId}</div>
							<div>${student.SectionName}</div>
						</td>
						${this._renderTableRowGradeItems(student)}
					</tr>
				`)}
			</tbody>
		`;
	}

	_renderTableHeader() {
		return html`
			<thead>
				<th>
					${this.localize('studentTableHeader')}
				</th>
				${this._renderTableHeaderGradeItems()}
			</thead>
		`;
	}

	_renderTableHeaderBounds(id) {
		const bounds = this.bounds.find((bound) => bound.GradeItemId === id);

		const LowerBounds = Math.round(bounds.LowerBounds * 100);
		const UpperBounds = Math.round(bounds.UpperBounds * 100);

		return html`${LowerBounds}% - ${UpperBounds}%`;
	}

	_renderTableHeaderGradeItems() {
		if (!this._gradeItems) return null;

		return this._gradeItems.map((gradeItem) => html`
			<th>
				<div class="d2l-tableHeader-container">
					<b>${gradeItem.Name}</b>
					${this.enableEprEnhancements ? this._renderTableHeaderBounds(gradeItem.GradeItemId) : html``}
				</div>
			</th>
		`);
	}

	_renderTableRowGradeItems(student) {
		return this._gradeItems.map((gradeItem) => {
			const grade = student.Grades[gradeItem.GradeItemId];

			return html`
				<td>
					${isNaN(grade) ? null : `${Math.round(grade * 100)}%`}
				</td>
			`;
		});
	}
}

customElements.define('cepr-student-grades-summary-dialog', CeprStudentGradesSummaryDialog);
