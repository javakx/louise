export class Component {
	constructor(conf) {
		this.contents = [];
	
		if(('contents' in conf) && (Array.isArray(conf.contents))) {
			this.contents = conf.contents;
		}
	}
}

export class Border extends Component {
}

export class Button extends Component {
}