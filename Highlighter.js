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
		if (["executing", "executed", "exec-error"].some((v) => contentEl.classList.contains(v)))
			throw new Error("(!) Highlighter. Already handled.", contentEl);
		
		contentEl.classList.add("executing");
		contentEl.innerHTML = "";
		try {
			const
				model    = buildModel(text),
				contents = renderToHighlight(model, firstLineNum);
			contents.forEach((lineOb) => lineOb.appendTo(contentEl));
			contentEl.classList.remove("executing");
			contentEl.classList.add("executed");
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
			contentEl.classList.remove("executing");
			contentEl.classList.add("exec-error");
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
		const content = [], nodeStack = [];
		let lNum = firstLineNum, indentZoneFlag = true, lastLine;
		nodeStack.last = () => nodeStack[nodeStack.length - 1];
		content.push(lastLine = makeLine(lNum ++));
		recur(model);
		return content;
		function recur(sb) {
			if (sb instanceof Array) {
				sb.forEach(recur);
			} else if (typeof sb == "object") {
				sb.parent = nodeStack.last() || null;

				nodeStack.push(sb);
				recur(sb.ch);
				nodeStack.pop();

			} else if (typeof sb == "string") {
				if (sb == "\n") {
					lastLine.setEol();
					content.push(lastLine = makeLine(lNum ++));
					indentZoneFlag = true;
				} else if (indentZoneFlag && sb.match(/^\s+$/)) {
					lastLine.indent.innerHTML += sb;
				} else {
					let _sb = sb;
					if (indentZoneFlag) {
						const m = sb.match(/^(\s*)(.*)/);
						if (! m)
							throw new Error(`sb not matched with /^(\\s+)(.*)/. sb = ${sb}`)
						const
							indent = m[1],
							theText = m[2];
						lastLine.indent.innerHTML += indent;
						_sb = theText;
						indentZoneFlag = false;
					}
					const 
						lastDomainNode = nodeStack.last(),
						className = nodeStack.map(v => v.name).filter(v => v).join("- "),
						el = evaluate(`<span class="${className || ""}"></span>`);
					if (nodeStack.last()?.name == "error") {
						lastLine.guter.classList.add("error");
						lastLine.guter.title = nodeStack.last()?.msg;
					}
					if (nodeStack.last()?.name == "after-error") {
						lastLine.guter.classList.add("after-error");
						lastLine.guter.title = nodeStack.last()?.msg;
					}
					lastLine.content.appendChild(el);
					el.textContent = _sb;
					el.astNode = nodeStack.last();
					const msgStr = nodeStack.reduce((a,v) => {
						if (v.msg) 
							a += `${v.name} : ${v.msg} \n`;
						return a;
					}, "");
					if (msgStr) {
						el.title = msgStr;
						el.style.cursor = "pointer";
					}
					if (lastDomainNode) {
						el.dataset.region = `${lastDomainNode.i0}:${lastDomainNode.i1}`;
						el.domain = lastDomainNode;
					}
				}
			} else {
				console.error("Invalid model node", sb);
				throw new Error("Invalid model node.")
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
				get guter  () {return this.line.children[0]},
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
		
		const cssCode = `
			.syntax-hl-fk {
			  text-align: left;
			  white-space: pre;
			  background-color: #444;
			  color: #ccc;
			  -moz-tab-size: 4;
			  tab-size: 4;
			  overflow: auto;
			  max-height: 500px;
			  padding: 20px;
			  font-family: consolas, monospace; }
			  .syntax-hl-fk *::selection {
			    background-color: #000;
			    background-color: rgba(120, 120, 120, 0.5); }
			  .syntax-hl-fk .syntax-hl-fk__line {
			    margin-left: -20px; }
			    .syntax-hl-fk .syntax-hl-fk__line > * {
			      display: table-cell; }
			    .syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-number {
			      width: 50px;
			      min-width: 50px;
			      max-width: 50px;
			      text-align: right;
			      background-color: #333;
			      padding-right: 10px;
			      margin-right: 5px;
			      transition: all .2s; }
			      .syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-number:before {
			        content: attr(data-line-number) ""; }
			    .syntax-hl-fk .syntax-hl-fk__line span.syntax-hl-fk__line-number.error {
			      color: #fff;
			      background-color: #e48; }
			    .syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-indent {
			      padding-left: 5px; }
			    .syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-text {
			      padding-left: 20px;
			      white-space: pre-wrap;
			      word-break: break-word; }
			      .syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-text .error {
			        color: #fff;
			        background-color: #e48;
			        box-shadow: inset 0 0 2px #fff; }
			      .syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-text:before {
			        content: "";
			        margin-left: -20px; }

		`.replace(/syntax-hl-fk/g, clPref);

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