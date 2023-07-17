
/*
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
 */

class BorderLayout extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		let shadow = this.attachShadow({ mode: "open" }); // Sets and returns this.shadowRoot .
		let text = this.getAttribute('text');
		let el = document.createElement('div');
		el.setAttribute("class", "uiborderlayout")
		el.textContent = text;
		shadow.append(el);
	}
}

customElements.define("ui-borderlayout" , BorderLayout);