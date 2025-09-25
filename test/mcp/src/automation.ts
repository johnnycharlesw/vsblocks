/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ApplicationService } from './application';
import { applyAllTools } from './automationTools/index.js';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

export async function getServer(appService: ApplicationService): Promise<Server> {
	const server = new McpServer({
		name: 'VSBlocks Automation Server',
		version: '1.0.0',
		title: 'An MCP Server that can interact with a local build of VSBlocks. Used for verifying UI behavior.'
	}, { capabilities: { logging: {} } });

	server.tool(
		'vscode_automation_start',
		'Start VSBlocks Build',
		{},
		async () => {
			const app = await appService.getOrCreateApplication();
			return {
				content: [{
					type: 'text' as const,
					text: app ? `VSBlocks started successfully` : `Failed to start VSBlocks`
				}]
			};
		}
	);

	// Apply all VSBlocks automation tools using the modular structure
	const registeredTools = applyAllTools(server, appService);
	const app = appService.application;
	if (app) {
		registeredTools.forEach(t => t.enable());
	} else {
		registeredTools.forEach(t => t.disable());
	}

	appService.onApplicationChange(app => {
		if (app) {
			registeredTools.forEach(t => t.enable());
		} else {
			registeredTools.forEach(t => t.disable());
		}
	});

	return server.server;
}
