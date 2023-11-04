export class AppState {
	#eventHandlers = {}
	
	pushState(name,params=null) {}
	replaceState(name,params) {}
	changeParams(params) {}
	popState() {}
	peekState() {}

	on(eventName , func) {
		if(!(eventName in this.#eventHandlers)) {
			this.#eventHandlers[eventName] = []
		}
		this.#eventHandlers[eventName].push(func);
	}

	call(eventName , ev) {
		let list = this.#eventHandlers[eventName];
		if(list) {
			for(let l of list) {
				l(ev);
			}
		}
	}
}

/**
 * Helps track application state in a way that uses and is compatible with the browser
 * window's history.
 * 
 * https://developer.mozilla.org/en-US/docs/Web/API/History_API
 */
export class WebAddressAppState extends AppState {
	constructor() {
		super();
		
		this.pureAddr = window.location.href.match(/([^\#|\?]*)/)[1];
		
		//this.#purgeStack();
		this.initialHistoryStateLength = window.history.length;
		
		this.currentState = null;
		this.popStatePromiseObj = null;
		window.addEventListener('popstate' , (ev) => {
			let newState = ev.state;
			let oldState = this.currentState;
			this.currentState = newState;
			if(this.popStatePromiseObj) {
				let resolve = this.popStatePromiseObj.resolve;
				this.popStatePromiseObj = null;
				resolve({oldState:oldState,newState:newState});
			} else {
				this.call('statePopped',{
					originalEvent: ev ,
					oldState: oldState ,
					newState: newState
				});
			}
		});
	}

	get pureAppAddress() {
		return this.pureAddr;
	}

	/*#purgeStack() { / * private * /
		let st = window.history.state;
		while( ('appBase' in st) && (st.appBase === this.pureAddr) ) {
			window.history.back();
		}
	}*/

	/**
	 * Builds both the state oject, and a URL representing that state.
	 * 
	 * @param {*} name 
	 * @param {*} params 
	 * @returns  state object , state url 
	 */
	#buildState(name,params=null) {  /* private */
		if(!name) {
			throw new Error('Cannot build state without a name.');
		}
	
		// URL, should have pattern ?key=val&key=val#name although either/both query
		// and anchor can be ommitted (as such string can be empty.) 
		let url = '';
		if(params) {
			url = '';
			for(let p in params) {
				url = url + (url.length?'&':'') + encodeURIComponent(p) + '=' + encodeURIComponent(params[p]);
			}
			url = '?' + url;
		}
		url = url + '#' + name;

		// State object.
		let state = {
			//id: Date.now() + '-' + Math.floor(Math.random() * 1000000) ,
			appURLBase: this.pureAddr ,
			appURLState: url ,
			name: name ,
			params: params
		}
		
		return state;
	}

	/**
	 * Add state stack, or change the parameters of the current state.
	 * 
	 * @param {*} name 
	 * @param {*} params 
	 */
	pushState(name,params=null) {
		return new Promise((resolve,reject) => {
			let newState = this.#buildState(name,params);

			// If the name is the same as the current name (only the params have changed), 
			// replace the state rather than add to stack. There should never be multiple
			// consecutive states with the same name.
			let oldState = this.peekState();
			if((oldState) && (oldState.name === name)) {  // Same name.
				window.history.replaceState(newState,'',newState.appURLState);
			} else {  // Different name, or empty stack.
				window.history.pushState(newState,'',newState.appURLState);
			}
			// Remember current state.
			this.currentState = newState;
			// Resolve promise.
			resolve({oldState:oldState,newState:newState});
		});
	}

	/**
	 * Replace current (topmost) state.
	 * 
	 * @param {*} name 
	 * @param {*} params 
	 */
	replaceState(name,params) {
		return new Promise((resolve,reject) => {
			let newState = this.#buildState(name,params);
				
			// Unlike pushState(), always replace topmost state, never add.
			let oldState = this.peekState();
			window.history.replaceState(newState,'',newState.appURLState);
			// Remember current state.
			this.currentState = newState;
			// Resolve promise.
			resolve({oldState:oldState,newState:newState});
		});
	}

	/**
	 * Convenience function to just change params of current state.
	 * 
	 * @param {*} params 
	 */
	changeParams(params) {
		let state = this.peekState();
		let name = state?state.name:null;
		if(!name) {
			throw new Error('No state set, stack empty.');
		}
		return this.replaceState(name,params);
	}

	/**
	 * Pop current state off of the state stack.
	 * 
	 * @returns state object
	 */
	popState() {
		if(this.popStatePromiseObj) {
			throw new Error('Pop already in progress.');
		}
		return new Promise((resolve,reject) => {
			let oldState = this.peekState();

			// When popstate event fires (see constructor) we can find the appropriate
			// resolve function to call.
			this.popStatePromiseObj = {
				resolve: resolve ,
				reject: reject
			}
			
			// Upon completion, this will cause a popstate event from the browser.
			window.history.back();
		});
	}

	/**
	 * Returns current state (topmost on state stack.)
	 * 
	 * @returns state object
	 */
	// FIXME: Do we need to need to permit peeking of states other then the topmost?
	peekState() {
		return window.history.state;
	}

	/**
	 * Returns the size of the state stack. If 'all' is true, returns the real
	 * length of the browser window history, including pages before our app. If 
	 * 'all' is false, discount pages on history that existed when this class was
	 * instanciated, giving only the number of pages actually created by our app.
	 * 
	 * @param {*} all
	 * @returns length of stack as int
	 */
	/*length(all=false) {
		return window.history.length - (all?0:this.initialHistoryStateLength);
	}*/
}

/*
 * TODO:
 * LocalStorageAppState : saves the state in LocalStorage of browser.
 * SessionStorageAppState : saves the state in SessionStorage of browser.
 * CookieAppState : saves the state in cookie in browser.
 * TransientAppState : saves the state in JavaScript objects.
 */