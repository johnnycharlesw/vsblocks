import { VSBlock } from '../../blocks/index.js';
import { VSBlockParameter } from '../../blocks/index.js';

// TypeScript language-specifics for VSBlocks
export function wrap(type: string, content: string[], isFunction: boolean, name?: string): string {
	let result = '';
	if (isFunction) {
		result += 'function ';
		result += type;
		result += '(';
		let isDoneWithParams = false;
		let isDoneWithFunctionBody = false;
		content.forEach((contentPiece: any) => {
			if (typeof contentPiece === 'string') {
				if (!isDoneWithParams) {
					isDoneWithParams = true;
					result += ')';
					result += '{';
				}
				result += contentPiece;
				if (!isDoneWithFunctionBody && contentPiece.parameters.length > 0) {
					result += '};';

				}

			} else if (typeof contentPiece === 'object') {
				result += contentPiece.name;
				result += `: ${contentPiece.type}`;
				contentPiece.parameters.forEach((param) => {
					result += param.name;
					result += ', ';
				});
				result = result.slice(0, -2);

			}
		});
	} else {
		return `${type} ${name} {${content.join(' ')}};`;
	}
}

// Generic statement

export function write_statement(type: string, childrenBlocks: VSBlockParameter[]): string {
	let result = type;
	for (let childBlock of childrenBlocks) {
		result += childBlock.toString();
	}
	return result;
}

// Variable definition
export function write_variable_definition(type: string, childrenBlocks: VSBlockParameter[]): string {
	// Check if this is static or non-static
	if (type === "const") {
		return `const ${childrenBlocks[0].toString()}: ${childrenBlocks[1].type} = ${childrenBlocks[1].toString()};`;
	} else if (type === "let") {
		return `let ${childrenBlocks[0].toString()}: ${childrenBlocks[1].type} = ${childrenBlocks[1].toString()};`;
	}

}

// Importing modules
export function write_import(type: string, childrenBlocks: VSBlockParameter[]): string {
	return `import ${childrenBlocks[0].toString()};`;
}


// Reference a variable later after defining it
export function write_variable_reference(type: string, childrenBlocks: VSBlockParameter[]): string {
	if (type === "function_parameter") {
		return `${childrenBlocks[0].toString()}`;
	} else {
		return `globalThis.${childrenBlocks[0].toString()}`;
	}
}


//
