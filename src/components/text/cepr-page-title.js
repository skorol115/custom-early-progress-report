import { css, html, LitElement } from 'lit-element/lit-element.js';

class CeprPageTitle extends LitElement {
	static get styles() {
		return css`
            h1 {
                font-size: 2rem;
                font-weight: 400;
                line-height: 2.4rem;
                margin: 0;
                padding-bottom: 1.2rem;
            }
		`;
	}

	render() {
		return html`
			<h1><slot></slot></h1>
		`;
	}
}
customElements.define('cepr-page-title', CeprPageTitle);
