/*eslint-env mocha*/
import * as assert from 'assert';

// The unit test environment runs in an Electron renderer with DOM support (per test/unit setup),
// so we can use customElements and Shadow DOM APIs directly.

// Import the module under test
import { VSBlock, VSBlockShape } from '../../../../../src/vs/editor/browser/widget/blockEditor/blockEditorBlock.js';

// Stub the Compiler used internally by VSBlock.toString to avoid depending on implementation details
// We will monkey-patch the module system by temporarily overriding the global class that the module uses.
// Since blockEditorBlock imports Compiler by path, we cannot easily intercept the import here without a bundler.
// Instead, we exercise VSBlock behavior that does not require calling toString except where we explicitly stub.

// To test toString deterministically, we inject a fake Compiler by monkey-patching globalThis and re-defining
// a minimal wrapper. However, since the module under test already imported Compiler, direct replacement is not trivial.
// Therefore, the toString-related test will simply assert that calling toString returns a string and does not throw,
// without asserting exact compilation output.

describe('VSBlock', () => {
	function createBlock(type = 'if', language = 'javascript', shape: VSBlockShape = VSBlockShape.c_block) {
		return new VSBlock(type, language, shape);
	}

	it('Should initialize with provided type, language_id, and shape', () => {
		const b = createBlock('for', 'typescript', VSBlockShape.statement);
		assert.strictEqual(b.type, 'for');
		assert.strictEqual(b.language_id, 'typescript');
		assert.strictEqual(b.shape, VSBlockShape.statement);
	});

	it('Should render with shadow DOM and include type and shape class', () => {
		const b = createBlock('while', 'javascript', VSBlockShape.c_block);
		assert.ok(b.shadowRoot, 'shadowRoot should exist');
		const container = b.shadowRoot!.querySelector('.vsblock');
		assert.ok(container, 'container should be rendered');
		assert.ok(container!.classList.contains(`vsblock-shape-${b.shape}`), 'shape class should be applied');
		const typeSpan = b.shadowRoot!.querySelector('.block-type');
		assert.strictEqual(typeSpan?.textContent, 'while');
	});

	it('Should re-render on connectedCallback without errors', () => {
		const b = createBlock('if', 'javascript', VSBlockShape.c_block);
		// Simulate attaching to DOM
		document.body.appendChild(b);
		// connectedCallback should have been called implicitly by browser when attached
		assert.ok(b.shadowRoot, 'shadowRoot should still exist after connecting');
		// Clean up
		document.body.removeChild(b);
	});

	it('Should append child blocks and track them in childrenBlocks', () => {
		const parent = createBlock('parent', 'javascript', VSBlockShape.c_block);
		const child1 = createBlock('child1', 'javascript', VSBlockShape.statement);
		const child2 = createBlock('child2', 'javascript', VSBlockShape.variable_definition);

		parent.appendBlock(child1);
		parent.appendBlock(child2);

		assert.strictEqual(parent.childrenBlocks.length, 2);
		assert.strictEqual(parent.childrenBlocks[0], child1);
		assert.strictEqual(parent.childrenBlocks[1], child2);

		// Ensure child nodes are appended to shadowRoot
		assert.ok(parent.shadowRoot!.contains(child1));
		assert.ok(parent.shadowRoot!.contains(child2));
	});

	it('toString should return a string and not throw (Compiler delegated)', () => {
		const b = createBlock('compile', 'javascript', VSBlockShape.function_definition);
		let compiled: string;
		assert.doesNotThrow(() => { compiled = b.toString(); });
		assert.strictEqual(typeof (compiled as unknown as string), 'string');
	});
});
