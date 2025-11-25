import { Disposable } from 'vs/base/common/lifecycle';
import * as editorBrowser from '../../editorBrowser';
import * as dom from 'vs/base/browser/dom';

export abstract class EditorWidget extends Disposable implements editorBrowser.ICodeEditor {
	protected editor: editorBrowser.ICodeEditor;
	protected domNode: HTMLElement;
	protected id: string;

	constructor(editor: editorBrowser.ICodeEditor, id: string) {
		super();
		this.editor = editor;
		this.id = id;
		this.domNode = this.createDomNode();
		this.addWidgetToEditor();
	}

	protected abstract createDomNode(): HTMLElement;

	protected addWidgetToEditor() {
		if ('addContentWidget' in this.editor) {
			this.editor.addContentWidget(this as any); // cast as IContentWidget
		}
	}

	public getId(): string {
		return this.id;
	}

	public getDomNode(): HTMLElement {
		return this.domNode;
	}

	public abstract getPosition(): editorBrowser.IContentWidgetPosition | null;

	dispose(): void {
		if ('removeContentWidget' in this.editor) {
			this.editor.removeContentWidget(this as any);
		}
		super.dispose();
	}
}
