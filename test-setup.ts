import { GlobalWindow } from 'happy-dom';

// GlobalWindow (unlike Window) exposes the JS global constructors — including
// SyntaxError — that happy-dom's query-selector parser references internally.
const window = new GlobalWindow();

// @ts-expect-error - happy-dom Window types don't fully match DOM Window, but this is expected for testing
global.window = window;
// @ts-expect-error - happy-dom Document types don't fully match DOM Document, but this is expected for testing
global.document = window.document;
// @ts-expect-error - happy-dom Navigator types don't fully match DOM Navigator, but this is expected for testing
global.navigator = window.navigator;
// @ts-expect-error - happy-dom HTMLElement types don't fully match DOM HTMLElement, but this is expected for testing
global.HTMLElement = window.HTMLElement;
// @ts-expect-error - happy-dom CustomElementRegistry types don't fully match DOM CustomElementRegistry, but this is expected for testing
global.customElements = window.customElements;
