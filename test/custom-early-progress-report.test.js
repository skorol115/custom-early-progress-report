import '../custom-early-progress-report.js';
import { expect, fixture, html } from '@open-wc/testing';
import { runConstructor } from '@brightspace-ui/core/tools/constructor-test-helper.js';

describe('CustomEarlyProgressReport', () => {

	describe('accessibility', () => {
		it('should pass all aXe tests', async() => {
			const el = await fixture(html`<d2l-custom-early-progress-report></d2l-custom-early-progress-report>`);
			await expect(el).to.be.accessible();
		});
	});

	describe('constructor', () => {
		it('should construct', () => {
			runConstructor('d2l-custom-early-progress-report');
		});
	});

});
