import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { Marked } from "marked";
import * as vscode from 'vscode';
import { CodeHighlighter } from './codeHighlighter';

export class Renderer {

	private readonly _disposables: vscode.Disposable[] = [];

	private readonly _highlighter: CodeHighlighter;

	public readonly needsRender: vscode.Event<void>;

	private readonly _purify = DOMPurify(new JSDOM('').window);

	constructor() {
		this._highlighter = new CodeHighlighter();
		this._disposables.push(this._highlighter);

		this.needsRender = this._highlighter.needsRender;
	}

	dispose() {
		let item: vscode.Disposable | undefined;
		while ((item = this._disposables.pop())) {
			item.dispose();
		}
	}

	public async render(document: vscode.TextDocument, hovers: readonly vscode.Hover[], showDiagnostics: boolean): Promise<string> {
		const parts = (hovers)
			.flatMap(hover => hover.contents)
			.map(content => this.getMarkdown(content))
			.filter(content => content.length > 0);

		if (!parts.length) {
			return '';
		}

		const markdown = parts.join('\n---\n');

		const highlight = await this._highlighter.getHighlighter(document);
		const marked = new Marked({
			renderer: {
				code: (code: string, infostring: string | undefined, _escaped: boolean) => highlight(code, infostring ?? '')
			}
		});

		const renderedMarkdown = await marked.parse(markdown, {});
		let html = renderedMarkdown;
		if (showDiagnostics) {
			const ansiHighlight = await this._highlighter.getAnsiHighlighter();
			const diagnostic = this.getDiagnostics(document, hovers, ansiHighlight);
			html = diagnostic + '<hr>' + html;
		}
		return this._purify.sanitize(html, { USE_PROFILES: { html: true } });
	}

	public updateTheme() {
		this._highlighter.updateAnsiColors();
	}

	private getMarkdown(content: vscode.MarkedString | vscode.MarkdownString): string {
		if (typeof content === 'string') {
			return content;
		} else if (content instanceof vscode.MarkdownString) {
			return content.value;
		} else {
			const markdown = new vscode.MarkdownString();
			markdown.appendCodeblock(content.value, content.language);
			return markdown.value;
		}
	}

	private getDiagnostics(document: vscode.TextDocument, hovers: readonly vscode.Hover[], highlighter: (code: string) => string): string {
		const diagnostics = vscode.languages.getDiagnostics(document.uri);
		const range = hovers[0].range;
		if (!range) {
			return '';
		}
		const diagnostic =
			diagnostics
				.filter((diag) => {
					if (diag.range.intersection(range)) {
						return diag;
					}
				})
				.map((diag) => {
					let strbuf = '';
					const code = diag.code;
					if (typeof code === 'string') {
						strbuf += diag.message;
						strbuf += `[${code}]`;
					} else if (typeof code === 'object') {
						if (
							!(
								typeof code == 'object' &&
								typeof code.value == 'string' &&

								// exclude useless msg for rust-lang
								code.value.includes('Click for full compiler diagnostic') // TODO: use a filter setting for various languages
							)
						) {
							strbuf += diag.message;
							strbuf += `<a href="${code.target}">${code.value}</a>`;
						}
					}
					const rendered = (
						diag as unknown as { data?: { rendered?: string; }; }
					).data?.rendered;
					if (rendered) {
						const decolorized = highlighter(rendered);
						strbuf += decolorized;
					}
					return strbuf;
				})
			;
		return diagnostic.join('<hr>');
	}
}
