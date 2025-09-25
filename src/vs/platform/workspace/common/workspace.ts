/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize } from '../../../nls.js';
import { Event } from '../../../base/common/event.js';
import { basename, extname } from '../../../base/common/path.js';
import { TernarySearchTree } from '../../../base/common/ternarySearchTree.js';
import { extname as resourceExtname, basenameOrAuthority, joinPath, extUriBiasedIgnorePathCase } from '../../../base/common/resources.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { EnvironmentServiceInterface } from '../../environment/common/environment.js';
import { Schemas } from '../../../base/common/network.js';

export const WorkspaceContextServiceInterface = createDecorator<WorkspaceContextServiceInterface>('contextService');

export interface WorkspaceContextServiceInterface {

	readonly _serviceBrand: undefined;

	/**
	 * An event which fires on workbench state changes.
	 */
	readonly onDidChangeWorkbenchState: Event<WorkbenchState>;

	/**
	 * An event which fires on workspace name changes.
	 */
	readonly onDidChangeWorkspaceName: Event<void>;

	/**
	 * An event which fires before workspace folders change.
	 */
	readonly onWillChangeWorkspaceFolders: Event<WorkspaceInterfaceFoldersWillChangeEvent>;

	/**
	 * An event which fires on workspace folders change.
	 */
	readonly onDidChangeWorkspaceFolders: Event<WorkspaceInterfaceFoldersChangeEvent>;

	/**
	 * Provides access to the complete workspace object.
	 */
	getCompleteWorkspace(): Promise<WorkspaceInterface>;

	/**
	 * Provides access to the workspace object the window is running with.
	 * Use `getCompleteWorkspace` to get complete workspace object.
	 */
	getWorkspace(): WorkspaceInterface;

	/**
	 * Return the state of the workbench.
	 *
	 * WorkbenchState.EMPTY - if the workbench was opened with empty window or file
	 * WorkbenchState.FOLDER - if the workbench was opened with a folder
	 * WorkbenchState.WORKSPACE - if the workbench was opened with a workspace
	 */
	getWorkbenchState(): WorkbenchState;

	/**
	 * Returns the folder for the given resource from the workspace.
	 * Can be null if there is no workspace or the resource is not inside the workspace.
	 */
	getWorkspaceFolder(resource: URI): WorkspaceInterfaceFolder | null;

	/**
	 * Return `true` if the current workspace has the given identifier or root URI otherwise `false`.
	 */
	isCurrentWorkspace(workspaceIdOrFolder: WorkspaceIdentifierInterface | SingleFolderWorkspaceIdentifierInterface | URI): boolean;

	/**
	 * Returns if the provided resource is inside the workspace or not.
	 */
	isInsideWorkspace(resource: URI): boolean;
}

export interface IResolvedWorkspace extends WorkspaceIdentifierInterface, BaseWorkspaceInterface {
	readonly folders: WorkspaceInterfaceFolder[];
}

export interface BaseWorkspaceInterface {

	/**
	 * If present, marks the window that opens the workspace
	 * as a remote window with the given authority.
	 */
	readonly remoteAuthority?: string;

	/**
	 * Transient workspaces are meant to go away after being used
	 * once, e.g. a window reload of a transient workspace will
	 * open an empty window.
	 *
	 * See: https://github.com/microsoft/vscode/issues/119695
	 */
	readonly transient?: boolean;
}

export interface BaseWorkspaceInterfaceIdentifier {

	/**
	 * Every workspace (multi-root, single folder or empty)
	 * has a unique identifier. It is not possible to open
	 * a workspace with the same `id` in multiple windows
	 */
	readonly id: string;
}

/**
 * A single folder workspace identifier is a path to a folder + id.
 */
export interface SingleFolderWorkspaceIdentifierInterface extends BaseWorkspaceInterfaceIdentifier {

	/**
	 * Folder path as `URI`.
	 */
	readonly uri: URI;
}

/**
 * A multi-root workspace identifier is a path to a workspace file + id.
 */
export interface WorkspaceIdentifierInterface extends BaseWorkspaceInterfaceIdentifier {

	/**
	 * Workspace config file path as `URI`.
	 */
	configPath: URI;
}

export interface EmptyWorkspaceIdentifierInterface extends BaseWorkspaceInterfaceIdentifier { }

export type AnyWorkspaceIdentifierInterface = WorkspaceIdentifierInterface | SingleFolderWorkspaceIdentifierInterface | EmptyWorkspaceIdentifierInterface;

export function isSingleFolderWorkspaceIdentifier(obj: unknown): obj is SingleFolderWorkspaceIdentifierInterface {
	const singleFolderIdentifier = obj as SingleFolderWorkspaceIdentifierInterface | undefined;

	return typeof singleFolderIdentifier?.id === 'string' && URI.isUri(singleFolderIdentifier.uri);
}

export function isEmptyWorkspaceIdentifier(obj: unknown): obj is EmptyWorkspaceIdentifierInterface {
	const emptyWorkspaceIdentifier = obj as EmptyWorkspaceIdentifierInterface | undefined;
	return typeof emptyWorkspaceIdentifier?.id === 'string'
		&& !isSingleFolderWorkspaceIdentifier(obj)
		&& !isWorkspaceIdentifier(obj);
}

export const EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE: EmptyWorkspaceIdentifierInterface = { id: 'ext-dev' };
export const UNKNOWN_EMPTY_WINDOW_WORKSPACE: EmptyWorkspaceIdentifierInterface = { id: 'empty-window' };

export function toWorkspaceIdentifier(workspace: WorkspaceInterface): AnyWorkspaceIdentifierInterface;
export function toWorkspaceIdentifier(backupPath: string | undefined, isExtensionDevelopment: boolean): EmptyWorkspaceIdentifierInterface;
export function toWorkspaceIdentifier(arg0: WorkspaceInterface | string | undefined, isExtensionDevelopment?: boolean): AnyWorkspaceIdentifierInterface {

	// Empty workspace
	if (typeof arg0 === 'string' || typeof arg0 === 'undefined') {

		// With a backupPath, the basename is the empty workspace identifier
		if (typeof arg0 === 'string') {
			return {
				id: basename(arg0)
			};
		}

		// Extension development empty windows have backups disabled
		// so we return a constant workspace identifier for extension
		// authors to allow to restore their workspace state even then.
		if (isExtensionDevelopment) {
			return EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE;
		}

		return UNKNOWN_EMPTY_WINDOW_WORKSPACE;
	}

	// Multi root
	const workspace = arg0;
	if (workspace.configuration) {
		return {
			id: workspace.id,
			configPath: workspace.configuration
		};
	}

	// Single folder
	if (workspace.folders.length === 1) {
		return {
			id: workspace.id,
			uri: workspace.folders[0].uri
		};
	}

	// Empty window
	return {
		id: workspace.id
	};
}

export function isWorkspaceIdentifier(obj: unknown): obj is WorkspaceIdentifierInterface {
	const workspaceIdentifier = obj as WorkspaceIdentifierInterface | undefined;

	return typeof workspaceIdentifier?.id === 'string' && URI.isUri(workspaceIdentifier.configPath);
}

export interface ISerializedSingleFolderWorkspaceIdentifier extends BaseWorkspaceInterfaceIdentifier {
	readonly uri: UriComponents;
}

export interface ISerializedWorkspaceIdentifier extends BaseWorkspaceInterfaceIdentifier {
	readonly configPath: UriComponents;
}

export function reviveIdentifier(identifier: undefined): undefined;
export function reviveIdentifier(identifier: ISerializedWorkspaceIdentifier): WorkspaceIdentifierInterface;
export function reviveIdentifier(identifier: ISerializedSingleFolderWorkspaceIdentifier): SingleFolderWorkspaceIdentifierInterface;
export function reviveIdentifier(identifier: EmptyWorkspaceIdentifierInterface): EmptyWorkspaceIdentifierInterface;
export function reviveIdentifier(identifier: ISerializedWorkspaceIdentifier | ISerializedSingleFolderWorkspaceIdentifier | EmptyWorkspaceIdentifierInterface | undefined): AnyWorkspaceIdentifierInterface | undefined;
export function reviveIdentifier(identifier: ISerializedWorkspaceIdentifier | ISerializedSingleFolderWorkspaceIdentifier | EmptyWorkspaceIdentifierInterface | undefined): AnyWorkspaceIdentifierInterface | undefined {

	// Single Folder
	const singleFolderIdentifierCandidate = identifier as ISerializedSingleFolderWorkspaceIdentifier | undefined;
	if (singleFolderIdentifierCandidate?.uri) {
		return { id: singleFolderIdentifierCandidate.id, uri: URI.revive(singleFolderIdentifierCandidate.uri) };
	}

	// Multi folder
	const workspaceIdentifierCandidate = identifier as ISerializedWorkspaceIdentifier | undefined;
	if (workspaceIdentifierCandidate?.configPath) {
		return { id: workspaceIdentifierCandidate.id, configPath: URI.revive(workspaceIdentifierCandidate.configPath) };
	}

	// Empty
	if (identifier?.id) {
		return { id: identifier.id };
	}

	return undefined;
}

export const enum WorkbenchState {
	EMPTY = 1,
	FOLDER,
	WORKSPACE
}

export interface WorkspaceInterfaceFoldersWillChangeEvent {

	readonly changes: WorkspaceInterfaceFoldersChangeEvent;
	readonly fromCache: boolean;

	join(promise: Promise<void>): void;
}

export interface WorkspaceInterfaceFoldersChangeEvent {
	added: WorkspaceInterfaceFolder[];
	removed: WorkspaceInterfaceFolder[];
	changed: WorkspaceInterfaceFolder[];
}

export interface WorkspaceInterface {

	/**
	 * the unique identifier of the workspace.
	 */
	readonly id: string;

	/**
	 * Folders in the workspace.
	 */
	readonly folders: WorkspaceInterfaceFolder[];

	/**
	 * Transient workspaces are meant to go away after being used
	 * once, e.g. a window reload of a transient workspace will
	 * open an empty window.
	 */
	readonly transient?: boolean;

	/**
	 * the location of the workspace configuration
	 */
	readonly configuration?: URI | null;
}

export function isWorkspace(thing: unknown): thing is WorkspaceInterface {
	const candidate = thing as WorkspaceInterface | undefined;

	return !!(candidate && typeof candidate === 'object'
		&& typeof candidate.id === 'string'
		&& Array.isArray(candidate.folders));
}

export interface WorkspaceInterfaceFolderData {

	/**
	 * The associated URI for this workspace folder.
	 */
	readonly uri: URI;

	/**
	 * The name of this workspace folder. Defaults to
	 * the basename of its [uri-path](#Uri.path)
	 */
	readonly name: string;

	/**
	 * The ordinal number of this workspace folder.
	 */
	readonly index: number;
}

export interface WorkspaceInterfaceFolder extends WorkspaceInterfaceFolderData {

	/**
	 * Given workspace folder relative path, returns the resource with the absolute path.
	 */
	toResource: (relativePath: string) => URI;
}

export function isWorkspaceFolder(thing: unknown): thing is WorkspaceInterfaceFolder {
	const candidate = thing as WorkspaceInterfaceFolder;

	return !!(candidate && typeof candidate === 'object'
		&& URI.isUri(candidate.uri)
		&& typeof candidate.name === 'string'
		&& typeof candidate.toResource === 'function');
}

export class Workspace implements WorkspaceInterface {

	private foldersMap: TernarySearchTree<URI, WorkspaceFolder>;

	private _folders!: WorkspaceFolder[];
	get folders(): WorkspaceFolder[] { return this._folders; }
	set folders(folders: WorkspaceFolder[]) {
		this._folders = folders;
		this.updateFoldersMap();
	}

	constructor(
		private _id: string,
		folders: WorkspaceFolder[],
		private _transient: boolean,
		private _configuration: URI | null,
		private ignorePathCasing: (key: URI) => boolean,
	) {
		this.foldersMap = TernarySearchTree.forUris<WorkspaceFolder>(this.ignorePathCasing, () => true);
		this.folders = folders;
	}

	update(workspace: Workspace) {
		this._id = workspace.id;
		this._configuration = workspace.configuration;
		this._transient = workspace.transient;
		this.ignorePathCasing = workspace.ignorePathCasing;
		this.folders = workspace.folders;
	}

	get id(): string {
		return this._id;
	}

	get transient(): boolean {
		return this._transient;
	}

	get configuration(): URI | null {
		return this._configuration;
	}

	set configuration(configuration: URI | null) {
		this._configuration = configuration;
	}

	getFolder(resource: URI): WorkspaceInterfaceFolder | null {
		if (!resource) {
			return null;
		}

		return this.foldersMap.findSubstr(resource) || null;
	}

	private updateFoldersMap(): void {
		this.foldersMap = TernarySearchTree.forUris<WorkspaceFolder>(this.ignorePathCasing, () => true);
		for (const folder of this.folders) {
			this.foldersMap.set(folder.uri, folder);
		}
	}

	toJSON(): WorkspaceInterface {
		return { id: this.id, folders: this.folders, transient: this.transient, configuration: this.configuration };
	}
}

export interface IRawFileWorkspaceFolder {
	readonly path: string;
	name?: string;
}

export interface IRawUrWorkspaceInterfaceFolder {
	readonly uri: string;
	name?: string;
}

export class WorkspaceFolder implements WorkspaceInterfaceFolder {

	readonly uri: URI;
	readonly name: string;
	readonly index: number;

	constructor(
		data: WorkspaceInterfaceFolderData,
		/**
		 * Provides access to the original metadata for this workspace
		 * folder. This can be different from the metadata provided in
		 * this class:
		 * - raw paths can be relative
		 * - raw paths are not normalized
		 */
		readonly raw?: IRawFileWorkspaceFolder | IRawUrWorkspaceInterfaceFolder
	) {
		this.uri = data.uri;
		this.index = data.index;
		this.name = data.name;
	}

	toResource(relativePath: string): URI {
		return joinPath(this.uri, relativePath);
	}

	toJSON(): WorkspaceInterfaceFolderData {
		return { uri: this.uri, name: this.name, index: this.index };
	}
}

export function toWorkspaceFolder(resource: URI): WorkspaceFolder {
	return new WorkspaceFolder({ uri: resource, index: 0, name: basenameOrAuthority(resource) }, { uri: resource.toString() });
}

export const WORKSPACE_EXTENSION = 'code-workspace';
export const WORKSPACE_SUFFIX = `.${WORKSPACE_EXTENSION}`;
export const WORKSPACE_FILTER = [{ name: localize('codeWorkspace', "Code Workspace"), extensions: [WORKSPACE_EXTENSION] }];
export const UNTITLED_WORKSPACE_NAME = 'workspace.json';

export function isUntitledWorkspace(path: URI, environmentService: EnvironmentServiceInterface): boolean {
	return extUriBiasedIgnorePathCase.isEqualOrParent(path, environmentService.untitledWorkspacesHome);
}

export function isTemporaryWorkspace(workspace: WorkspaceInterface): boolean;
export function isTemporaryWorkspace(path: URI): boolean;
export function isTemporaryWorkspace(arg1: WorkspaceInterface | URI): boolean {
	let path: URI | null | undefined;
	if (URI.isUri(arg1)) {
		path = arg1;
	} else {
		path = arg1.configuration;
	}

	return path?.scheme === Schemas.tmp;
}

export const STANDALONE_EDITOR_WORKSPACE_ID = '4064f6ec-cb38-4ad0-af64-ee6467e63c82';
export function isStandaloneEditorWorkspace(workspace: WorkspaceInterface): boolean {
	return workspace.id === STANDALONE_EDITOR_WORKSPACE_ID;
}

export function isSavedWorkspace(path: URI, environmentService: EnvironmentServiceInterface): boolean {
	return !isUntitledWorkspace(path, environmentService) && !isTemporaryWorkspace(path);
}

export function hasWorkspaceFileExtension(path: string | URI) {
	const ext = (typeof path === 'string') ? extname(path) : resourceExtname(path);

	return ext === WORKSPACE_SUFFIX;
}
