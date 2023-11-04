import { AppState } from './AppState.js';

export class ScreenManager {
	constructor(appState) {
		this.appState = appState;
		this.appState.on('statePopped' , (ev) => {
			
		});
	}

	/*
	 * Events.
	 */
	
	#eventHandlers = {}

	addScreenEvent(screenName , eventName , func) {
		// If we don't have a structure for this named screen, add one...
		if(!(screenName in this.#eventHandlers)) {
			this.#eventHandlers[screenName] = {
			}
		}
		let screenEvents = this.#eventHandlers[screenName];
		
		// If we don't have a structure to hold events of this type in this screen, add one...
		if(!(eventName in screenEvents)) {
			screenEvents[eventName] = []
		}
		let screenEventFuncs = screenEvents[eventName];

		// Add callback function to list for this type, for this screen.
		screenEventFuncs.push(func);
	}

	#call(screenName , eventName , ev) {
		let list = this.#eventHandlers[eventName];
		if(list) {
			for(let l of list) {
				l(ev);
			}
		}
	}

	#createEvent(name) {
		return {
			type: name
		}
	}

	pushScreen(screenName,params=null) {
		// Put old screen to sleep.
		let ev1 = this.#createEvent('screenSleep');
		let currentState = this.appState.peekState();
		if(currentState) {
			this.#call(currentState.name,'screenSleep',ev1);
		}
		// Open new screen.
		this.appState.pushState(name,params).then((states) => {
			let ev2 = this.#createEvent('openScreen');
			this.#call(states.newState.name,'openScreen',ev2);
		});
	}

	replaceScreen(name,params=null) {
		// Close old screen.
		debugger;
		let ev1 = this.#createEvent('screenClose');
		this.#call(this.appState.peekState().name,'screenClose',ev1);
		// Open new screen.
		this.appState.replaceState(name,params).then((states) => {
			let ev2 = this.#createEvent('openScreen');
			this.#call(states.newState.name,'openScreen',ev2);
		});
	}
	
	popScreen() {
		// Close old screen.
		let ev1 = this.#createEvent('screenClose');
		this.#call(this.appState.peekState().name,'screenClose',ev1);
		// Awake new screen.
		this.appState.replaceState(name,params).then((states) => {
			let ev2 = this.#createEvent('awakeScreen');
			this.#call(states.newState.name,'awakeScreen',ev2);
		});
	}

	changeParams(params) {
		this.appState.changeParams(params);
	}
}

export class Screen {
	constructor(name,manager) {
		this.name = name;
		this.screenManager = manager;
	}
	
	open() {
	}

	close() {
	}

	sleep() {
	}

	awake() {
	}
}