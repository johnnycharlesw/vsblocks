import { VSBlockShape, VSBlockParameterShape } from './enums.js';
import { VSBlock, VSBlockParameter } from './baseBlock.js';

export class VSBlockEngineCBlock extends VSBlock {
	constructor(type: string, language_id: string, is_in_toolbar: boolean = false) {
		super(type, language_id, VSBlockShape.c_block, is_in_toolbar);
	}
}

export class VSBlockEngineStatementBlock extends VSBlock {
	constructor(type: string, language_id: string, is_in_toolbar: boolean = false) {
		super(type, language_id, VSBlockShape.statement, is_in_toolbar);
	}
}

export class VSBlockEngineVariableDefinitionBlock extends VSBlock {
	constructor(type: string, language_id: string, is_in_toolbar: boolean = false) {
		super(type, language_id, VSBlockShape.variable_definition, is_in_toolbar);
	}
}

export class VSBlockEngineFunctionDefinitionBlock extends VSBlock {
	constructor(type: string, language_id: string, is_in_toolbar: boolean = false) {
		super(type, language_id, VSBlockShape.function_definition, is_in_toolbar);
	}
}

export class VSBlockEngineImportBlock extends VSBlock {
	constructor(type: string, language_id: string, is_in_toolbar: boolean = false) {
		super(type, language_id, VSBlockShape.import, is_in_toolbar);
	}
}

export class VSBlockEngineVariableReferenceBlock extends VSBlock {
	constructor(type: string, language_id: string, is_in_toolbar: boolean = false) {
		super(type, language_id, VSBlockShape.variable_reference, is_in_toolbar);
	}
}
