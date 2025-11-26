import { VSBlockShape, VSBlockParameterShape } from './enums.js';
import { Compiler } from './compiler.js'
export class VSBlock extends HTMLElement {
	private _children: VSBlock[] = [];
	public _type: string;
	public language_id: string;
	public shape: VSBlockShape;
	public is_in_toolbar: boolean;

	constructor(type: string, language_id: string, shape: VSBlockShape, is_in_toolbar: boolean = false) {
		super();
		this._type = type;
		this.language_id = language_id;
		this.shape = shape;
		this.is_in_toolbar = is_in_toolbar;
		this.attachShadow({ mode: 'open' }); // Optional: encapsulated styling
		this.render();
	}

	connectedCallback() {
		this.render();
	}

	disconnectedCallback() {
		// Cleanup if needed
	}

	get type() {
		return this._type;
	}

	get childrenBlocks() {
		return this._children;
	}

	appendBlock(block: VSBlock) {
		this._children.push(block);
		this.shadowRoot?.appendChild(block);
	}

	render() {
		if (!this.shadowRoot) return;
		this.shadowRoot.innerHTML = `
	  <div class="vsblock vsblock-shape-${this.shape}">
		<span class="block-type">${this._type}</span>
		<div class="children"></div>
	  </div>
	`;
	}

	ondragstart(event: DragEvent) {
		if (this.is_in_toolbar) {
			event.preventDefault();
			let clone = new VSBlock(this._type, this.language_id, this.shape, false);
			clone.draggable = true;
			clone.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }));
			this.parentElement?.appendChild(clone);
			this.dispatchEvent(new DragEvent("dragend", { bubbles: true, cancelable: true }));
		} else {
			// If dropped into another block, become a child of that block
			let parentBlock = this.parentElement as VSBlock;
			parentBlock.appendBlock(this);
		}
	}

	toString() {

		const compiler = new Compiler(this.language_id);
		return compiler.compile(this);
	}
}


export class VSBlockParameter extends VSBlock {
	constructor(name: string, type: string, language_id: string, shape: VSBlockParameterShape) {
		super(type, language_id, shape);
		this.name = name;
	}

	render() {
	\
		this.shadowRoot.innerHTML = `
	  <div class="vsblock-parameter vsblock-parameter-shape-${this.shape}">
		<span class="block-type">${this.name}</span>
		<span class="block-type">${this.type}</span>
	  </div>
	}
}
