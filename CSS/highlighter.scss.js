export default function setStyle(clPref) {

	const cssCode = `.syntax-hl-fk {
  text-align: left;
  white-space: pre;
  background-color: #444;
  color: #ccc;
  -moz-tab-size: 4;
  tab-size: 4;
  overflow: auto;
  max-height: 500px;
  padding: 20px;
  font-family: consolas, monospace;
}
.syntax-hl-fk *::selection {
  background-color: #000;
  background-color: rgba(120, 120, 120, 0.5);
}
.syntax-hl-fk .syntax-hl-fk__line {
  margin-left: -20px;
}
.syntax-hl-fk .syntax-hl-fk__line > * {
  display: table-cell;
}
.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-number {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
  text-align: right;
  background-color: #333;
  padding-right: 10px;
  margin-right: 5px;
  transition: all 0.2s;
}
.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-number:before {
  content: attr(data-line-number) "";
}
.syntax-hl-fk .syntax-hl-fk__line span.syntax-hl-fk__line-number.error {
  color: #fff;
  background-color: #e48;
}
.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-indent {
  padding-left: 5px;
}
.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-text {
  padding-left: 20px;
  white-space: pre-wrap;
  word-break: break-word;
}
.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-text .error {
  color: #fff;
  background-color: #e48;
  box-shadow: inset 0 0 2px #fff;
}
.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-text:before {
  content: "";
  margin-left: -20px;
}

/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJmaWxlOi8vL0Q6L0dpdEh1Yi1teS9zeW50YXgtaGlnaGxpZ2h0LWZyYW1ld29yay9DU1MvaGlnaGxpZ2h0ZXIuc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtFQUNDO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUVBO0VBQ0E7RUFDQTtFQUNBOztBQUNBO0VBQ0M7RUFDQTs7QUFHRDtFQUNDOztBQUNBO0VBQ0M7O0FBRUQ7RUFDQztFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBOztBQUNBO0VBQ0M7O0FBR0Y7RUFDQztFQUFhOztBQUVkO0VBQ0M7O0FBRUQ7RUFDQztFQUNBO0VBQ0E7O0FBQ0E7RUFDQztFQUNBO0VBQ0E7O0FBRUQ7RUFDQztFQUNBIiwiZmlsZSI6ImhpZ2hsaWdodGVyLmNzcyJ9 */`.replaceAll(/json-err-hl/g, clPref);

	const styleClassName = `${clPref}__theme-style`;

	const styleAlreadyExists = [].some.call(
		document.querySelectorAll(`style.${styleClassName}`), 
		(v) => v.textContent === cssCode
	);

	if (! styleAlreadyExists) {
		const style = eHTML(`<style class="${styleClassName}"></style>`);
		style.textContent = cssCode;
		document.head.appendChild(style);
	}
}


function eHTML(code, shell=null) {
	const _shell = 
		! shell                  ? document.createElement("div") :
		typeof shell == "string" ? document.createElement(shell) :
		typeof shell == "object" ? shell :
			null;
	_shell.innerHTML = code;
	return _shell.children[0];
}