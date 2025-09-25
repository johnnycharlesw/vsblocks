/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { StorageServiceInterface } from '../../../../platform/storage/common/storage.js';
import { WorkspaceContextServiceInterface } from '../../../../platform/workspace/common/workspace.js';
import { BaseConfigurationResolverService } from './baseConfigurationResolverService.js';
import { IConfigurationResolverService } from '../common/configurationResolver.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { PathInterfaceService } from '../../path/common/pathService.js';

export class ConfigurationResolverService extends BaseConfigurationResolverService {

	constructor(
		@IEditorService editorService: IEditorService,
		@IConfigurationService configurationService: IConfigurationService,
		@ICommandService commandService: ICommandService,
		@WorkspaceContextServiceInterface workspaceContextService: WorkspaceContextServiceInterface,
		@IQuickInputService quickInputService: IQuickInputService,
		@ILabelService labelService: ILabelService,
		@PathInterfaceService pathService: PathInterfaceService,
		@IExtensionService extensionService: IExtensionService,
		@StorageServiceInterface storageService: StorageServiceInterface,
	) {
		super({ getAppRoot: () => undefined, getExecPath: () => undefined },
			Promise.resolve(Object.create(null)), editorService, configurationService,
			commandService, workspaceContextService, quickInputService, labelService, pathService, extensionService, storageService);
	}
}

registerSingleton(IConfigurationResolverService, ConfigurationResolverService, InstantiationType.Delayed);
