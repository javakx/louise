


/*
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
 */

class UIElement extends HTMLElement {
	constructor() {
		super();
		this.northHeight = 0;
		this.eastWidth = 0;
		this.westWidth = 0;
		this.southHeight = 0;
	}
}

class BorderLayout extends UIElement {
	constructor() {
		super();
	}

	connectedCallback() {
		// Define component markup.
		let templateEl = document.createElement('template');
		templateEl.innerHTML = 
			`
			<style>
				.uiBorderLayout {
					position: Relative;
				}
				.uiBorderLayout .north {
					position: Absolute;  left: 0px;  top: 0px;  right: 0px;
				}
				.uiBorderLayout .west {
					position: Absolute;  left: 0px;;
				}
				.uiBorderLayout .center {
					position: Absolute;
				}
				.uiBorderLayout .east {
					position: Absolute;  right:0px;
				}
				.uiBorderLayout .south {
					position: Absolute;  left: 0px;  bottom;: 0px;  right:0px;
				}
			</style>
			<div class="uiBorderLayout">
				<div class="north">
					<slot name="north"></slot>
				</div>
				<div class="west">
					<slot name="west"></slot>
				</div>
				<div class="center">
					<slot name="cemter"></slot>
				</div>
				<div class="east">
					<slot name="east"></slot>
				</div>
				<div class="south">
					<slot name="south"></slot>
				</div>
			</div>
			`;
		
		// Read attr and add context into markup.
		//let text = this.getAttribute('text');
		//templateEl.content.querySelector('div').textContent = text;

		// Add to shadow DOM.
		let shadow = this.attachShadow({ mode: "open" }); // Sets and returns this.shadowRoot .
		shadow.appendChild(templateEl.content.cloneNode(true));
	}
}

customElements.define("ui-borderlayout" , BorderLayout);