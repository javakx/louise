


/*
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
 */

class UIElement extends HTMLElement {
	constructor() {
		super();
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
				}
				.uiBorderLayout > .vertical {
					display: Flex;  flex-direction: Column;  flex-wrap: NoWrap;
					justify-content: Space-Between;  
					width: 100%;  height: 100%;
					align-items: Stretch;  /* Stretch north/horizontal/south to fill horizontal space. */
				}
				.uiBorderLayout >.vertical > .north {
				}
				.uiBorderLayout > .vertical > .horizontal {
					display: Flex;  flex-direction: Row;  flex-wrap: NoWrap;
					justify-content: Space-Between;  
					align-items: Stretch;  /* Stretch west/center/east to fill vertical space. */
					flex-grow: 1;  /* Expand to fill vertical flex. */
				}
				.uiBorderLayout > .vertical > .horizontal > .west {
				}
				.uiBorderLayout > .vertical > .horizontal > .center {
					flex-grow: 1;  /* Expand to fill horizontal flex. */
				}
				.uiBorderLayout > .vertical > .horizontal > .east {
				}
				.uiBorderLayout >.vertical > .south {
				}				
			</style>
			<div class="uiBorderLayout">
				<div class="vertical">
					<div class="north">
						<slot name="north"></slot>
					</div>
					<div class="horizontal">
						<div class="west">
							<slot name="west"></slot>
						</div>
						<div class="center">
							<slot name="center"></slot>
						</div>
						<div class="east">
							<slot name="east"></slot>
						</div>
					</div>
					<div class="south">
						<slot name="south"></slot>
					</div>
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

class GridLayout extends UIElement {
	constructor() {
		super();
	}

	connectedCallback() {
		// Define component markup.
		let templateEl = document.createElement('template');
		templateEl.innerHTML = 
			`
			<style>
				.uiGridLayout {
					display: Grid;
				}
			</style>
			<div class="uiGridLayout">
			</div>
			`;
		
		// Read attr and add context into markup.
		let rows = this.getAttribute('rows');
		let columns = this.getAttribute('columns');
		//templateEl.content.querySelector('div').textContent = text;

		// Add to shadow DOM.
		let shadow = this.attachShadow({ mode: "open" }); // Sets and returns this.shadowRoot .
		shadow.appendChild(templateEl.content.cloneNode(true));
	}
}

customElements.define("ui-gridlayout" , GridLayout);