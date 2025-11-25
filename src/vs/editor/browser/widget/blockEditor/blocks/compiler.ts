import { VSBlock } from './blocks/blockEditorBlock.js';
export class Compiler {
	proglang: string;
	proglang_specifics: any;

	constructor(language_id: string) {
		this.proglang = language_id;
		let script = '../languages/' + this.proglang;
		this.proglang_specifics = import * from script;
	}
	compile(block: VSBlock) {
		if (block.shape = "c-block") { // c-blocks wrap blocks
			let content = string[];
			block.children.forEach(child => {
				content.append(this.compile(child));
			});
			return this.proglang_specifics.wrap(block.type, content, false);
		}
		else if (block.shape = "statement") { // Statements are statements in the compiled code
			return this.proglang_specifics.write_statement(block.type, block.childrenBlocks);
		}
		else if (block.shape = "variable_definition") {
			return this.proglang_specifics.write_variable_definition(block.type, block.childrenBlocks);
		}
		else if (block.shape = "function_definition") {
			return this.proglang_specifics.wrap(block.type, block.childrenBlocks, true);
		}
		else if (block.shape = "import") {
			return this.proglang_specifics.write_import(block.type, block.childrenBlocks);
		}
	}
}
