import ParseContext from "./ParseContext.js";

export default function HighlightAPI (mainRule, clPref="syntax-hl-fk") {

	setCSS();
	return {
		highlight,            // (contentEl, text, firstLineNum=1)
		highlightTextContent, // (el)
		setMainRule,          // (rule)
		scrollToFirstError,   // (el)
	}

	function highlightTextContent(el) {
		return highlight(el, el.textContent, (el.dataset.lineNum*1 + 1) || 1);
	}

	function scrollToFirstError(el) {
		const errEl = el.querySelector(".error");
		if (errEl) {
			// errEl.scrollIntoView();
			const 
				top = errEl.getBoundingClientRect().top - el.getBoundingClientRect().top,
				vpH = el.clientHeight,
				deltaScroll = top - vpH / 2;
			el.scrollTop = deltaScroll;
		}
	}

	function highlight(contentEl, text, firstLineNum=1) {
		contentEl.innerHTML = "";
		try {
			const
				model    = buildModel(text),
				contents = renderToHighlight(model, firstLineNum);
			contents.forEach((lineOb) => lineOb.appendTo(contentEl));
		} catch (e) {
			console.error(`(!)-CATCHED`, e);
			const lines = text.split("\n");
			lines.forEach((line, i, a) => {
				let lineOb = makeLine(firstLineNum + i);
				let m = line.match(/^(\s*)(.*)/);
				[lineOb.indent.textContent, lineOb.content.textContent] = [m[1], m[2]];
				if (i < a.length - 1)
					lineOb.setEol();
				lineOb.appendTo(contentEl);
			});
		}
	}


	function buildModel(text) {
		const mSlot = [];
		mainRule(new ParseContext({
			text, 
			i: 0, 
			mSlot, 
			dStack: []
		}));
		return mSlot;
	}

	function renderToHighlight (model, firstLineNum=1) {
		const content = [], dStack = [], msgStack = [], dNodeStack = [];
		let lNum = firstLineNum, indentZoneFlag = true, lastLine;
		content.push(lastLine = makeLine(lNum ++));
		recur(model);
		return content;
		function recur(sb) {
			if (sb instanceof Array) {
				sb.forEach(recur);
			} else if (typeof sb == "object") {
				sb.parent = dNodeStack[dNodeStack.length - 1];

				dStack.push(sb.name);
				dNodeStack.push(sb);
				msgStack.push(sb.msg || "");

				recur(sb.ch);

				msgStack.pop();
				dNodeStack.pop();
				dStack.pop();
			} else {
				if (sb == "\n") {
					lastLine.setEol();
					content.push(lastLine = makeLine(lNum ++));
					indentZoneFlag = true;
				} else {
					if (indentZoneFlag && sb.match(/^\s+$/)) {
						lastLine.indent.innerHTML += sb;
					} else {
						indentZoneFlag = false;
						const 
							lastDomainNode = dNodeStack[dNodeStack.length - 1],
							className = dStack.filter(v => v).join("- "),
							el = evaluate(`<span class="${className || ""}"></span>`);
						lastLine.content.appendChild(el);
						el.textContent = sb;
						if (msgStack.join("")) {
							let 
								msgStr = "";
							dStack.forEach((v,i,a) => {
								let pf = (i + 1 == a.length)? "" : "-";
								msgStr += `${v+pf} : ${msgStack[i]} \n`;
							});
							el.title = msgStr;
							el.style.cursor = "pointer";
						}
						if (lastDomainNode) {
							el.dataset.region = `${lastDomainNode.i0}:${lastDomainNode.i1}`;
							el.domain = lastDomainNode;
						}
					}
				}
			}
		}
	}

	function makeLine(num) {
		return Object.setPrototypeOf(
			{
				line: evaluate(
					`<span class="${clPref}__line">`+
						`<span class="${clPref}__line-number" data-line-number="${num}"></span>`+
						`<span class="${clPref}__line-indent"></span>`+
						`<span class="${clPref}__line-text"  ></span>`+
					`</span>`
				),
				eol: null,
				get indent () {return this.line.children[1]},
				get content() {return this.line.children[2]},
			},
			{
				appendTo: function(parent) {
					parent.appendChild(this.line);
					if (this.eol)
						parent.appendChild(this.eol);
				},
				setEol: function() {this.eol = evaluate(`<span>\n</span>`);}
			}
		) 
	}

	function setCSS() {
		
		const cssCode = [
			`pre.${clPref} {                                                 `,
			`    background-color: #444;                                     `,
			`    color: #ccc;                                                `,
			`    -moz-tab-size: 4;                                           `,
			`    tab-size: 4;                                                `,
			`    overflow: auto;                                             `,
			`    max-height: 500px;                                          `,
			`    padding: 20px;                                              `,
			`    font-family: consolas, monospace;                           `,
			`}                                                               `,
			`pre.${clPref} *::selection {                                    `,
			`    background-color: #000;                                     `,
			`    background-color: rgba(120, 120, 120, 0.5);                 `,
			`}                                                               `,
			`pre.${clPref} .${clPref}__line {                                `,
			`    margin-left: -20px;                                         `,
			`}                                                               `,
			`pre.${clPref} .${clPref}__line > * {                            `,
			`    display: table-cell;                                        `,
			`}                                                               `,
			`pre.${clPref} .${clPref}__line .${clPref}__line-number {        `,
			`    width: 50px;                                                `,
			`    min-width: 50px;                                            `,
			`    max-width: 50px;                                            `,
			`    text-align: right;                                          `,
			`    background-color: #333;                                     `,
			`    padding-right: 10px;                                        `,
			`    margin-right: 5px;                                          `,
			`    transition: all .2s;                                        `,
			`}                                                               `,
			`pre.${clPref} .${clPref}__line .${clPref}__line-number:before { `,
			`    content: attr(data-line-number) "";                         `,
			`}                                                               `,
			`pre.${clPref} .${clPref}__line .${clPref}__line-indent {        `,
			`    padding-left: 5px;                                          `,
			`}                                                               `,
			`pre.${clPref} .${clPref}__line .${clPref}__line-text {          `,
			`    padding-left: 20px;                                         `,
			`    white-space: pre-wrap;                                      `,
			`    word-break: break-word;                                     `,
			`}                                                               `,
			`pre.${clPref} .${clPref}__line .${clPref}__line-text:before {   `,
			`    content: "";                                                `,
			`    margin-left: -20px;                                         `,
			`}                                                               `,
		].join("\n");

		const styleClassName = `${clPref}__base-style`;

		const styleAlreadyExists = [].some.call(
			document.querySelectorAll(`style.${styleClassName}`), 
			(v) => v.textContent === cssCode
		);

		if (! styleAlreadyExists) {
			const style = evaluate(`<style class="${styleClassName}"></style>`);
			style.textContent = cssCode;
			document.head.appendChild(style);
		}
	}

	function evaluate (code) {
		const shell = document.createElement("div");
		shell.innerHTML = code;
		return shell.children[0];
	}

	function setMainRule(rule) {
		mainRule = rule;
	}
}