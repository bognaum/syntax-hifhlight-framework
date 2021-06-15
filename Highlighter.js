import ParseContext from "./ParseContext.js";

export default class HighlightAPI {

	constructor (mainRule, clPref="syntax-hl-fk") {
		this.mainRule = mainRule;
		this.clPref   = clPref  ;
		_setCSS(this);
	}

	/**
	 * getHighlighted       (template, firstLineNum, cssClasses)
	 * highlightTextContent (el)
	 * scrollToFirstError   (el)
	 * highlight            (el, template, firstLineNum)
	 * setMainRule          (rule)
	 */

	getHighlighted       (...args) { return getHighlighted       (this, ...args); }
	highlightTextContent (...args) { return highlightTextContent (this, ...args); }
	scrollToFirstError   (...args) { return scrollToFirstError   (this, ...args); }
	highlight            (...args) { return highlight            (this, ...args); }
	setMainRule          (...args) { return setMainRule          (this, ...args); }
}


function getHighlighted(self, text, firstLineNum=1, cssClasses="") {
	const el = document.createElement("div");
	if (typeof cssClasses == "string")
		el.className += " " + cssClasses;
	else if (cssClasses instanceof Array) 
		el.classList.add(...cssClasses);
	else 
		throw new Error([
			"(!) getHighlighted(). ",
			"Argument #3 must be a string, an array of strings, or undefined.",
			"",
			cssClasses+" given.",
			""
		].join("\n"));
	highlight(self, el, text, firstLineNum);
	return el;
}

function highlightTextContent(self, el) {
	return highlight(self, el, el.textContent, getFirstLineNum(el));
}

function scrollToFirstError(self, el) {
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

function highlight(self, contentEl, text, firstLineNum=1) {
	if (! (contentEl instanceof HTMLElement))
		throw new Error([
			"(!) highlight(). Argument #1 must be a HTMLElement.",
			"",
			contentEl + " given.",
			""
		].join("\n"));

	if (["executing", "executed", "exec-error"].some((v) => contentEl.classList.contains(v)))
		throw new Error([
			"(!) Highlighter. Already handled.", 
			"",
			contentEl
		].join("\n"));
	
	contentEl.classList.add(self.clPref);
	contentEl.classList.add("executing");
	contentEl.innerHTML = "";

	if (typeof text != "string")
		throw new Error([
			"(!) highlight(). Argument #2 must be a string.",
			"",
			text + " given.",
			""
		].join("\n"));

	try {
		const
			model    = _buildModel(self, text),
			contents = _renderToHighlight(self, model, firstLineNum);
		contents.forEach((lineOb) => lineOb.appendTo(contentEl));
		contentEl.classList.remove("executing");
		contentEl.classList.add("executed");
	} catch (e) {
		console.error(`(!)-CATCHED`, e);
		const lines = text.split("\n");
		lines.forEach((line, i, a) => {
			let lineOb = _makeLine(self, firstLineNum + i);
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

function setMainRule(self, rule) {
	self.mainRule = rule;
}

function _buildModel(self, text) {
	const mSlot = [];
	self.mainRule(new ParseContext({
		text, 
		i: 0, 
		mSlot, 
		dStack: []
	}));
	return mSlot;
}

function _renderToHighlight (self, model, firstLineNum=1) {
	const content = [], nodeStack = [];
	let lNum = firstLineNum, indentZoneFlag = true, lastLine;
	nodeStack.last = () => nodeStack[nodeStack.length - 1];
	content.push(lastLine = _makeLine(self, lNum ++));
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
				content.push(lastLine = _makeLine(self, lNum ++));
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
					el = _evaluate(`<span class="${className || ""}"></span>`);
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

function _makeLine(self, num) {
	return Object.setPrototypeOf(
		{
			line: _evaluate(
				`<span class="${self.clPref}__line">`+
					`<span class="${self.clPref}__line-number" data-line-number="${num}"></span>`+
					`<span class="${self.clPref}__line-indent"></span>`+
					`<span class="${self.clPref}__line-text"  ></span>`+
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
			setEol: function() {this.eol = _evaluate(`<span>\n</span>`);}
		}
	) 
}

function _setCSS(self) {
	
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

	`.replace(/syntax-hl-fk/g, self.clPref);

	const styleClassName = `${self.clPref}__base-style`;

	const styleAlreadyExists = [].some.call(
		document.querySelectorAll(`style.${styleClassName}`), 
		(v) => v.textContent === cssCode
	);

	if (! styleAlreadyExists) {
		const style = _evaluate(`<style class="${styleClassName}"></style>`);
		style.textContent = cssCode;
		document.head.appendChild(style);
	}
}

function _evaluate (code) {
	const shell = document.createElement("div");
	shell.innerHTML = code;
	return shell.children[0];
}


function getFirstLineNum(el) {
	const dln = parseInt(el.dataset.lineNum);
	if (! dln)
		return 1;
	else if (el.nodeName == "PRE")
		return dln + 1;
	else 
		return dln;
}