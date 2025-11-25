import { EditorWidget } from '../editorBaseClass/editorWidget.js';

class BlockEditorWidget extends EditorWidget {
	createDomNode() {
		let domNode = document.createElement('div');
		domNode.classList.add('vsblocks-block-editor');

	}
}
