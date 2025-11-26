import { EditorWidget } from '../editorBaseClass/editorWidget.js';
import * as blocks from './blocks'
import './editor.css';
import * as editorBrowser from '../../editorBrowser';

class BlockEditorWidget extends EditorWidget {
	constructor(editor: editorBrowser.ICodeEditor, id: string) {
		super(editor, id);

		// Load the programming language specifics
		const model = editor.getModel();
		const languageId = model?.getLanguageId();
		let script = './languages/' + languageId;
		this.proglang_specifics = import * from script;

		this.domNode = this.createDomNode();

		let toolboxElement = this.createToolboxElement();

		let workspaceElement = document.createElement('main');
		workspaceElement.classList.add('workspace');

		let wrapperElement = document.createElement('div');
		wrapperElement.classList.add('vsblocks-block-editor-wrapper');
		wrapperElement.appendChild(toolboxElement);
		wrapperElement.appendChild(workspaceElement);

		this.domNode.appendChild(wrapperElement);

		this.addWidgetToEditor();
	}

	createToolboxElement() {
		let toolboxElement = document.createElement('aside');
		toolboxElement.classList.add('toolbox');

		// Fill it with blocks
		let blockList = document.createElement('ul');
		let blocks = this.proglang_specifics.getToolboxBlocks();
		blocks.forEach(block => {
			let li = document.createElement('li');
			li.appendChild(block);
			blockList.appendChild(li);
		});
		toolboxElement.appendChild(blockList);
		return toolboxElement;
	}

	createDomNode() {
		let domNode = document.createElement('div');
		domNode.classList.add('vsblocks-block-editor');
		return domNode;
	}

	getPosition() {
		return {
			"position": {
				"lineNumber": 1,
				"column": 1,
			},
			"preference": [0]
		};
	}
}
