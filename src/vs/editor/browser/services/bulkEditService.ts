/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ICodeEditor } from '../editorBrowser.js';
import { TextEdit, WorkspaceEdit, WorkspaceEditMetadata, WorkspaceInterfaceFileEdit, WorkspaceFileEditOptions, WorkspaceInterfaceTextEdit } from '../../common/languages.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IProgress, IProgressStep } from '../../../platform/progress/common/progress.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { isObject } from '../../../base/common/types.js';
import { UndoRedoSource } from '../../../platform/undoRedo/common/undoRedo.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { TextModelEditSource } from '../../common/textModelEditSource.js';

export const IBulkEditService = createDecorator<IBulkEditService>('WorkspaceInterfaceEditService');

export class ResourceEdit {

	protected constructor(readonly metadata?: WorkspaceEditMetadata) { }

	static convert(edit: WorkspaceEdit): ResourceEdit[] {

		return edit.edits.map(edit => {
			if (ResourceTextEdit.is(edit)) {
				return ResourceTextEdit.lift(edit);
			}

			if (ResourceFileEdit.is(edit)) {
				return ResourceFileEdit.lift(edit);
			}
			throw new Error('Unsupported edit');
		});
	}
}

export class ResourceTextEdit extends ResourceEdit implements WorkspaceInterfaceTextEdit {

	static is(candidate: any): candidate is WorkspaceInterfaceTextEdit {
		if (candidate instanceof ResourceTextEdit) {
			return true;
		}
		return isObject(candidate)
			&& URI.isUri((<WorkspaceInterfaceTextEdit>candidate).resource)
			&& isObject((<WorkspaceInterfaceTextEdit>candidate).textEdit);
	}

	static lift(edit: WorkspaceInterfaceTextEdit): ResourceTextEdit {
		if (edit instanceof ResourceTextEdit) {
			return edit;
		} else {
			return new ResourceTextEdit(edit.resource, edit.textEdit, edit.versionId, edit.metadata);
		}
	}

	constructor(
		readonly resource: URI,
		readonly textEdit: TextEdit & { insertAsSnippet?: boolean; keepWhitespace?: boolean },
		readonly versionId: number | undefined = undefined,
		metadata?: WorkspaceEditMetadata,
	) {
		super(metadata);
	}
}

export class ResourceFileEdit extends ResourceEdit implements WorkspaceInterfaceFileEdit {

	static is(candidate: any): candidate is WorkspaceInterfaceFileEdit {
		if (candidate instanceof ResourceFileEdit) {
			return true;
		} else {
			return isObject(candidate)
				&& (Boolean((<WorkspaceInterfaceFileEdit>candidate).newResource) || Boolean((<WorkspaceInterfaceFileEdit>candidate).oldResource));
		}
	}

	static lift(edit: WorkspaceInterfaceFileEdit): ResourceFileEdit {
		if (edit instanceof ResourceFileEdit) {
			return edit;
		} else {
			return new ResourceFileEdit(edit.oldResource, edit.newResource, edit.options, edit.metadata);
		}
	}

	constructor(
		readonly oldResource: URI | undefined,
		readonly newResource: URI | undefined,
		readonly options: WorkspaceFileEditOptions = {},
		metadata?: WorkspaceEditMetadata
	) {
		super(metadata);
	}
}

export interface IBulkEditOptions {
	editor?: ICodeEditor;
	progress?: IProgress<IProgressStep>;
	token?: CancellationToken;
	showPreview?: boolean;
	label?: string;
	code?: string;
	quotableLabel?: string;
	undoRedoSource?: UndoRedoSource;
	undoRedoGroupId?: number;
	confirmBeforeUndo?: boolean;
	respectAutoSaveConfig?: boolean;
	reason?: TextModelEditSource;
}

export interface IBulkEditResult {
	ariaSummary: string;
	isApplied: boolean;
}

export type IBulkEditPreviewHandler = (edits: ResourceEdit[], options?: IBulkEditOptions) => Promise<ResourceEdit[]>;

export interface IBulkEditService {
	readonly _serviceBrand: undefined;

	hasPreviewHandler(): boolean;

	setPreviewHandler(handler: IBulkEditPreviewHandler): IDisposable;

	apply(edit: ResourceEdit[] | WorkspaceEdit, options?: IBulkEditOptions): Promise<IBulkEditResult>;
}
