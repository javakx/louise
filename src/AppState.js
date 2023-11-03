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
		
		this.popStatePromiseObj = null;
		window.addEventListener('popstate' , (ev) => {
			if(!this.popStatePromiseObj) {
				throw new Error("No pop object.");
			}
			let newState = ev.state;
			let oldState = this.popStatePromiseObj.oldState;
			let resolve = this.popStatePromiseObj.resolve;
			this.popStatePromiseObj = null;
			resolve({oldState:oldState,newState:newState});
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
	 * Builds both the state oject, and a URL representing that state.
	 * 
	 * @param {*} screen 
	 * @param {*} params 
	 * @returns  state object , state url 
	 */
	buildState(screen,params=null) {  / * private * /
		if(!screen) {
			throw new Error('Cannot build state without a screen name.');
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

		// State object.
		let state = {
			//id: Date.now() + '-' + Math.floor(Math.random() * 1000000) ,
			appURLBase: this.pureAddr ,
			appURLState: url ,
			screen: screen ,
			params: params
		}
		
		return state;
	}

	/**
	 * Add screen to state stack, or change the parameters of the current screen.
	 * 
	 * @param {*} screen 
	 * @param {*} params 
	 */
	pushScreen(screen,params=null) {
		return new Promise((resolve,reject) => {
			let newState = this.buildState(screen,params);

			// If the screen is the same as the current screen (only the params have changed), 
			// replace the state rather than add to stack. There should never be multiple
			// consecutive states with the same screen.
			let oldState = this.peekScreen();
			if((oldState) && (oldState.screen === screen)) {  // Same screen.
				window.history.replaceState(newState,'',newState.appURLState);
			} else {  // Different screen, or empty stack.
				window.history.pushState(newState,'',newState.appURLState);
			}
			// Resolve promise.
			resolve({oldState:oldState,newState:newState});
		});
	}

	/**
	 * Replace current (topmost) screen state.
	 * 
	 * @param {*} screen 
	 * @param {*} params 
	 */
	replaceScreen(screen,params) {
		return new Promise((resolve,reject) => {
			let newState = this.buildState(screen,params);
				
			// Unlike pushScreen(), always replace topmost state, never add.
			let oldState = this.peekScreen();
			window.history.replaceState(newState,'',newState.appURLState);
			// Resolve promise.
			resolve({oldState:oldState,newState:newState});
		});
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
		return this.replaceScreen(screen,params);
	}

	/**
	 * Pop current state off of the state stack, and return popped state of removed 
	 * screen.
	 * 
	 * @returns state object
	 */
	popScreen() {
		if(this.popStatePromiseObj) {
			throw new Error('Pop already in progress.');
		}
		return new Promise((resolve,reject) => {
			let oldState = this.peekScreen();

			// When popstate event fires (see constructor) we can find the appropriate
			// resolve function to call.
			this.popStatePromiseObj = {
				resolve: resolve ,
				reject: reject ,
				oldState: oldState	
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