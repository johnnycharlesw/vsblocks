/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Event } from '../../../base/common/event.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { IPartsSplash } from '../common/themeService.js';
import { IColorScheme } from '../../window/common/window.js';
import { SingleFolderWorkspaceIdentifierInterface, WorkspaceIdentifierInterface } from '../../workspace/common/workspace.js';

export const IThemeMainService = createDecorator<IThemeMainService>('themeMainService');

export interface IThemeMainService {

	readonly _serviceBrand: undefined;

	readonly onDidChangeColorScheme: Event<IColorScheme>;

	getBackgroundColor(): string;

	saveWindowSplash(windowId: number | undefined, workspace: WorkspaceIdentifierInterface | SingleFolderWorkspaceIdentifierInterface | undefined, splash: IPartsSplash): void;
	getWindowSplash(workspace: WorkspaceIdentifierInterface | SingleFolderWorkspaceIdentifierInterface | undefined): IPartsSplash | undefined;

	getColorScheme(): IColorScheme;
}
