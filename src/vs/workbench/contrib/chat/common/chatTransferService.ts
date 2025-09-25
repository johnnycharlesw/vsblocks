/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { WorkspaceContextServiceInterface } from '../../../../platform/workspace/common/workspace.js';
import { StorageServiceInterface, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { WorkspaceInterfaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { areWorkspaceFoldersEmpty } from '../../../services/workspaces/common/workspaceUtils.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { URI } from '../../../../base/common/uri.js';

export const IChatTransferService = createDecorator<IChatTransferService>('chatTransferService');
const transferredWorkspacesKey = 'chat.transferedWorkspaces';

export interface IChatTransferService {
	readonly _serviceBrand: undefined;

	checkAndSetTransferredWorkspaceTrust(): Promise<void>;
	addWorkspaceToTransferred(workspace: URI): void;
}

export class ChatTransferService implements IChatTransferService {
	_serviceBrand: undefined;

	constructor(
		@WorkspaceContextServiceInterface private readonly workspaceService: WorkspaceContextServiceInterface,
		@StorageServiceInterface private readonly storageService: StorageServiceInterface,
		@IFileService private readonly fileService: IFileService,
		@WorkspaceInterfaceTrustManagementService private readonly workspaceTrustManagementService: WorkspaceInterfaceTrustManagementService
	) { }

	deleteWorkspaceFromTransferredList(workspace: URI): void {
		const transferredWorkspaces = this.storageService.getObject<string[]>(transferredWorkspacesKey, StorageScope.PROFILE, []);
		const updatedWorkspaces = transferredWorkspaces.filter(uri => uri !== workspace.toString());
		this.storageService.store(transferredWorkspacesKey, updatedWorkspaces, StorageScope.PROFILE, StorageTarget.MACHINE);
	}

	addWorkspaceToTransferred(workspace: URI): void {
		const transferredWorkspaces = this.storageService.getObject<string[]>(transferredWorkspacesKey, StorageScope.PROFILE, []);
		transferredWorkspaces.push(workspace.toString());
		this.storageService.store(transferredWorkspacesKey, transferredWorkspaces, StorageScope.PROFILE, StorageTarget.MACHINE);
	}

	async checkAndSetTransferredWorkspaceTrust(): Promise<void> {
		const workspace = this.workspaceService.getWorkspace();
		const currentWorkspaceUri = workspace.folders[0]?.uri;
		if (!currentWorkspaceUri) {
			return;
		}
		if (this.isChatTransferredWorkspace(currentWorkspaceUri, this.storageService) && await areWorkspaceFoldersEmpty(workspace, this.fileService)) {
			await this.workspaceTrustManagementService.setWorkspaceTrust(true);
			this.deleteWorkspaceFromTransferredList(currentWorkspaceUri);
		}
	}

	isChatTransferredWorkspace(workspace: URI, storageService: StorageServiceInterface): boolean {
		if (!workspace) {
			return false;
		}
		const chatWorkspaceTransfer: URI[] = storageService.getObject(transferredWorkspacesKey, StorageScope.PROFILE, []);
		return chatWorkspaceTransfer.some(item => item.toString() === workspace.toString());
	}
}
