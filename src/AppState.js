class AppState {
	constructor() {
		this.pureAddr = window.location.href.match(/([^\#|\?]*)/)[1];
		
		this.removedState = null;                              // During a pop, this is the state popped.
		this.eventHandlers = {};                               // Key'd list of handler arrays. { eventName:[func,func,...] , ... }
		window.addEventListener('popstate' , (ev) => {
			this.call('stateChanged',ev);
		});
	}

	get pureAppAddress() {
		return this.addrPure;
	}

	/**
	 * Add an event callback function.
	 *   stateChanged          Fired when state change completed.
	 * 
	 * @param {*} eventName 
	 * @param {*} func 
	 */
	on(eventName,func) {
		if(!(eventName in this.eventHandlers)) {
			this.eventHandlers[eventName] = [];
		}
		this.eventHandlers[eventName].push(func);
	}

	/**
	 * Call event handlers. (If this was invoked in response to a native history event,
	 * include the orignal native event object in our own.)
	 * 
	 * @param {*} eventName 
	 * @param {*} origEv 
	 */
	call(eventName,origEv=null) {  /* private */
		try {
			// Inject our own state objects into standard history event.
			let ev = {
				oldState: this.removedState ,
				newState: this.peekState() ,
				originalEvent: origEv
			}
			this.removedState = null;  // Important: must clear, or future pops will be rejected.
			
			let funcList = this.eventHandlers[eventName];
			if(funcList) {
				for(let f of funcList) {
					f(ev);
				}
			}
		} catch(err) {
			// Error shouldn't prevent us from popping.
			this.removedState = null;
		}
	}

	/**
	 * Builds both the state oject, and a URL representing that state.
	 * 
	 * @param {*} screen 
	 * @param {*} params 
	 * @returns  state object , state url 
	 */
	buildState(screen,params) {  /* private */
		// State object.
		let state = {
			screen: screen ,
			params: params
		}

		// URL, should have pattern ?key=val&key=val#screen although either/both query
		// and anchor can be ommitted (as such string can be empty.) 
		let url = '';
		if(params) {
			url = '?';
			for(let p in params) {
				url = url + (url.length?'&':'') + encodeURIComponent(p) + '=' + encodeURIComponent(params[p]);
			}
		}
		if(screen) {
			url = url + '#' + screen;
		}

		return { state , url }
	}

	/**
	 * Add screen to state stack, or change the parameters of the current screen.
	 * 
	 * @param {*} screen 
	 * @param {*} params 
	 */
	pushScreen(screen,params) {
		try {
			let { state , url } = this.buildState(screen,params);

			// If the screen is the same as the current screen (only the params have changed), 
			// replace the state rather than add to stack. There should never be multiple
			// consecutive states with the same screen.
			let currentState = this.peekState();
			if((currentState !==null) && (currentState.screen === screen)) {  // Same screen.
				window.history.replaceState(state,'',url);
			} else {  // Different screen, or empty stack.
				window.history.pushState(state,'',url);
			}
			// Fire event.
			this.removedState = currentState;
			this.call('stateChanged');
		} catch(err) {
			// Error shouldn't prevent us from popping.
			this.removedState = null;
		}
	}

	/**
	 * Replace current (topmost) screen state.
	 * 
	 * @param {*} screen 
	 * @param {*} params 
	 */
	replaceScreen(screen,params) {
		try {
			let { state , url } = this.buildState(screen,params);
			
			// Unlike pushScreen(), always replace topmost state, never add.
			window.history.replaceState(state,'',url);
			// Fire event.
			this.removedState = currentState;
			this.call('stateChanged');
		} catch(err) {
			// Error shouldn't prevent us from popping.
			this.removedState = null;
		}
	}

	/**
	 * Convenience function to just change params of current screen.
	 * 
	 * @param {*} params 
	 */
	changeParams(params) {
		let screen = peekState();
		if(!screen) {
			throw new Error('No screen set, stack empty.');
		}
		this.pushScreen(screen,params);
	}

	/**
	 * Pop current state off of the state stack, and return popped state of removed 
	 * screen.
	 * 
	 * @returns state object
	 */
	popScreen() {
		if(this.removedState !== null) {
			throw new Error('Cannot pop screen midway through existing pop operation.');
		}
		this.removedState = this.peekState();
		window.history.back();
		return this.removedState;
	}

	/**
	 * Returns current state (topmost on state stack.)
	 * 
	 * @returns state object.
	 */
	// FIXME: Do we need to need to permit peeking of states other then the topmost?
	peekState() {
		return window.history.state;
	}
}