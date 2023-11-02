/**
 * Helps track application state in a way that uses and is compatible with the browser
 * window's history.
 * 
 * https://developer.mozilla.org/en-US/docs/Web/API/History_API
 */
export class AppState {
	constructor() {
		this.pureAddr = window.location.href.match(/([^\#|\?]*)/)[1];
		
		//this.purgeStack();
		this.initialHistoryStateLength = window.history.length;
		
		this.removedState = null;                              // During a pop, this is the state popped.
		this.eventHandlers = {};                               // Key'd list of handler arrays. { eventName:[func,func,...] , ... }
		window.addEventListener('popstate' , (ev) => {
			this.call('stateChanged',ev);
		});
	}

	get pureAppAddress() {
		return this.pureAddr;
	}

	/*purgeStack() { / * private * /
		let st = window.history.state;
		while( ('appBase' in st) && (st.appBase === this.pureAddr) ) {
			window.history.back();
		}
	}*/

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
				newState: this.peekScreen() ,
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
			throw err;
		}
	}

	/**
	 * Builds both the state oject, and a URL representing that state.
	 * 
	 * @param {*} screen 
	 * @param {*} params 
	 * @returns  state object , state url 
	 */
	buildState(screen,params=null) {  /* private */
		if(!screen) {
			throw new Error('Cannot build state without a screen name.');
		}
	
		// State object.
		let state = {
			appBase: this.pureAddr ,
			screen: screen ,
			params: params
		}

		// URL, should have pattern ?key=val&key=val#screen although either/both query
		// and anchor can be ommitted (as such string can be empty.) 
		let url = '';
		if(params) {
			url = '';
			for(let p in params) {
				url = url + (url.length?'&':'') + encodeURIComponent(p) + '=' + encodeURIComponent(params[p]);
			}
			url = '?' + url;
		}
		url = url + '#' + screen;

		return { state , url }
	}

	/**
	 * Add screen to state stack, or change the parameters of the current screen.
	 * 
	 * @param {*} screen 
	 * @param {*} params 
	 */
	pushScreen(screen,params=null) {
		try {
			let { state , url } = this.buildState(screen,params);

			// If the screen is the same as the current screen (only the params have changed), 
			// replace the state rather than add to stack. There should never be multiple
			// consecutive states with the same screen.
			let currentState = this.peekScreen();
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
			throw err;
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
			let currentState = this.peekScreen();
			window.history.replaceState(state,'',url);
			// Fire event.
			this.removedState = currentState;
			this.call('stateChanged');
		} catch(err) {
			// Error shouldn't prevent us from popping.
			this.removedState = null;
			throw err;
		}
	}

	/**
	 * Convenience function to just change params of current screen.
	 * 
	 * @param {*} params 
	 */
	changeParams(params) {
		let state = this.peekScreen();
		let screen = state?state.screen:null;
		if(!screen) {
			throw new Error('No screen set, stack empty.');
		}
		this.replaceScreen(screen,params);
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
		this.removedState = this.peekScreen();
		window.history.back();
		// Don't fire event as browser will fire a popstate event, so react to that
		// event instead (see constructor.)
		return this.removedState;
	}

	/**
	 * Returns current state (topmost on state stack.)
	 * 
	 * @returns state object
	 */
	// FIXME: Do we need to need to permit peeking of states other then the topmost?
	peekScreen() {
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
	length(all=false) {
		return window.history.length - (all?0:this.initialHistoryStateLength);
	}
}