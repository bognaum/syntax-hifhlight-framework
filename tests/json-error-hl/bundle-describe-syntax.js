/******/ "use strict";
/******/ var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _syntax_hl_fk_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_syntax_hl_fk_js__WEBPACK_IMPORTED_MODULE_0__.default);

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _describeAPI_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _SyntaxHighlightAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
	version: "3.0.0-alpha",
	describeAPI: _describeAPI_js__WEBPACK_IMPORTED_MODULE_0__.default,
	SyntaxHighlightAPI: _SyntaxHighlightAPI_js__WEBPACK_IMPORTED_MODULE_1__.default, // (mainRule, clPref="syntax-hl-fk")
});

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
	seq,
	alter,
	q,
	not,
	domain,
	rule,
	token,
	deb,
});

const Analyzer_proto = {
	q : function wr_q(quanto, sepCallb=null) {
		return q(this, quanto, sepCallb);
	},
	in : function wr_inDomainin(name) {
		return domain(name, this);
	},
	and : function wr_and(callb) {
		return seq(this, callb);
	},
	or : function wr_or(callb) {
		return alter(this, callb);
	},
	deb : function wr_deb(i0=0, i1=0) {
		return deb(this, i0, i1);
	},
};

function seq(...callbs) {
	function _seq_(pc) {
		const hpc = pc.createHypo();
		for (let [k, callb] of callbs.entries()) {
			chekToAnaliser(callb);
			const res = callb(hpc);
			if (res) 
				continue;
			else 
				return false;
		}
		pc.acceptHypo(hpc);
		return true;
	}
	insertProto(Analyzer_proto, _seq_);
	return _seq_;
}

function alter(...callbs) {
	function _alter_(pc) {
		let res;
		for (let [k, callb] of callbs.entries()) {
			chekToAnaliser(callb);
			const res = callb(pc);
			if (res)
				return true;
		}
		return false;
	}
	insertProto(Analyzer_proto, _alter_);
	return _alter_;
}

function q(callb, quanto, callb2=null) {
	let _q_;
	if (quanto == "*") {
		_q_ = function _q_zero_or_many_(pc) {
			while (pc.text[pc.i]) {
				let i0 = pc.i, status;
				status = callb(pc);
				if (status) {
					if (i0 != pc.i) {
						continue;
					} else {
						/**
						 * Not strict variant. Mismatches allowed throw error message in console.
						 */
						console.error(`(!)`, `i0 == pc.i`, 
							"\n\tpc.i :", pc.i, "\n\tpc.monitor :", pc.monitor); 
						pc.i ++;
						return true;

						/**
						 * Strict variant. Mismatches forbidden. Script will stoped.
						 */
						// console.error(`(!)`, `i0 == pc.i`, pc); debugger; throw new Error();
					}
				} else 
					return true;
			}
			return true;
		}
	} else if (quanto == "+") {
		_q_ = function _q_one_or_many_(pc) {
			return callb(pc) && q(callb(pc), "*");
		}
	} else if (quanto == "?") {
		_q_ = function _q_zero_or_one_(pc) {
			return callb(pc) || true;
		}
	} else if (quanto == "*/") {
		_q_ = function _q_zero_or_many_sep_(pc) {
			seq(
				callb,
				seq(callb2, callb).q("*")
			)(pc);
			return true;
		}
	} else if (quanto == "+/") {
		_q_ = function _q_one_or_many_sep_(pc) {
			return seq(
					callb,
					seq(callb2, callb).q("*")
				)(pc);
		}
	} else {
		console.error(`(!)`, `Invalid quantifier`, `'${quanto}'`); debugger; throw new Error();
	}

	insertProto(Analyzer_proto, _q_);
	return _q_;
}

function not(callb) {
	const _not_ = function _not_(pc) {
		const hpc = pc.createHypothesis();
		const res = callb(hpc);
		if (! res) {
			pc.match(pc.text[pc.i]);
			return true;
		} else 
			return false;
	}
	insertProto(Analyzer_proto, _not_);
	return _not_;
}

function domain(name, callb, msg=null) {
	const _domain_ = function _domain_(pc) {
		const
			chpc = pc.createChildHypo(name),
			status = callb(chpc)
		if (msg) 
			chpc.msg = msg;
		if (status) 
			pc.acceptChildHypo(chpc);
		return !! status;
	}
	_domain_.msg = function (text) {
		return domain(name, callb, text);
	}
	_domain_.as = function(otherName, msg=null) {
		return domain(otherName, callb);
	}
	insertProto(Analyzer_proto, _domain_);
	return _domain_;
}

function rule(callb) {
	const _rule_ = function _rule_(pc) {
		const 
			hpc    = pc.createHypo(),
			status = callb(hpc);
		if (status) 
			pc.acceptHypo(hpc);
		return !! status;
	}
	insertProto(Analyzer_proto, _rule_);
	return _rule_;
}

function token(templ) {
	const _token_ = function _token_(pc) {
		return pc.match(templ);
	}
	insertProto(Analyzer_proto, _token_);
	return _token_;
}

function deb(callb, a=0, b=0) {
	function _deb_(pc) {
		b = b || pc.text.length;
		if (a <= pc.i && pc.i <= b) {
			debugger;
			const res = callb(pc);
			console.log(`res`, res);
			debugger;
			return res;
		}
	}
	insertProto(Analyzer_proto, _deb_);
	return _deb_;
}

function insertProto(proto, ob) {
	return Object.setPrototypeOf(ob, Object.setPrototypeOf(proto, Object.getPrototypeOf(ob)));
}

function chekToAnaliser(fn) {
	if (! fn || Object.getPrototypeOf(fn) != Analyzer_proto) {
		console.error(fn);
		if (fn && fn.toString)
			console.error(fn.toString());
		debugger;
		throw new Error("Invalid callback.");
	} else
		return true;
}

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ SyntaxHighlightAPI)
/* harmony export */ });
/* harmony import */ var _ParseContext_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);


function SyntaxHighlightAPI (mainRule, clPref="syntax-hl-fk") {

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
		mainRule(new _ParseContext_js__WEBPACK_IMPORTED_MODULE_0__.default({
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

	function evaluate (code) {
		const shell = document.createElement("div");
		shell.innerHTML = code;
		return shell.children[0];
	}

	function setMainRule(rule) {
		mainRule = rule;
	}
}

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ParseContext)
/* harmony export */ });
/* harmony import */ var _ModelNode_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);


class ParseContext {
	constructor(pc) {
		Object.defineProperties(this,{
			text:   {value: pc.text},
			mSlot:  {value: pc.mSlot},
			dStack: {value: pc.dStack},
			lFStack: {value: pc.lFStack},
		});
		this.i = pc.i;
		this.i0 = pc.i0;
		this.selfMN = pc.selfMN;
		this.monitor = pc.monitor;
		// this.debugDomain = pc.debugDomain;
	}
	match (templ) {
		let mSubstr = "", len;
		if (typeof templ == "string") {
			len = templ.length;
			const substr = this.text.substr(this.i, len);
			if (substr === templ)
				mSubstr = substr;
			
		} else if (templ instanceof RegExp) {
			templ.lastIndex = this.i;
			const mOb    = this.text.match(templ);
			mSubstr =  mOb && mOb[0] || "";
			len = mSubstr.length;

		}

		if (mSubstr) {
			this.i += len;
			push(this.mSlot, mSubstr);
			this.monitor = this.i+ " : "+this.text.substr(this.i, 20)
			return mSubstr;
		} else
			return "";
	}
	notMatch (templ) {
		const hpc = this.createHypo();
		if (! hpc.match(templ)) {
			this.match(this.text[this.i]);
			return true;
		} else
			return false;
	}
	createHypo () {
		const 
			{text, i, mSlot, dStack} = this,
			hpc = {text, i, mSlot: [], dStack};
		return new ParseContext(hpc);
	}
	acceptHypo (hpc) {
		this.i = hpc.i;
		this.monitor = hpc.monitor;
		// this.mSlot.push(...hpc.mSlot);
		hpc.mSlot.forEach((v) => push(this.mSlot, v));
		return true;
	}
	createChildHypo (name) {
		const 
			{text, i, dStack} = this,
			mSlot = [],
			mn = new _ModelNode_js__WEBPACK_IMPORTED_MODULE_0__.default(name, mSlot),
			hpc = {text, i, i0: i, mSlot, selfMN: mn, dStack};
		mn.i0 = i;
		return new ParseContext(hpc);
	}
	acceptChildHypo (hpc) {
		this.i = this.i1 = hpc.i;
		push(this.mSlot, hpc.selfMN);
		hpc.selfMN.i1 = hpc.i - 1;
		if (hpc.msg)
			hpc.selfMN.msg = hpc.msg;
		hpc.selfMN = null;
		return true;
	}
}



function push(arr, subj) {
	if (typeof subj == "string") {
		let lines = subj.split("\n");
		for (let [k, line] of lines.entries()) {
			if (k)
				arr.push("\n");
			if (line)
				pushOneLineText(arr, line);
		}
	} else 
		arr.push(subj);
}

function pushOneLineText(arr, subj) {
	let i = arr.length - 1;
	if (
		typeof arr[i] == "string" 
		&& typeof subj == "string" 
		&& arr[i] !== "\n" 
		&& subj !== "\n"
		&& (
			subj.match(/^\s+$/) && arr[i].match(/^\s+$/) 
			||
			! subj.match(/^\s+$/) && ! arr[i].match(/^\s+$/) 
		)
	)
		arr[i] += subj;
	else
		arr.push(subj);
}

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ModelNode)
/* harmony export */ });
class ModelNode {
	constructor (name, ch) {
		Object.defineProperties(this,{
			name: {value: name},
			ch  : {value: ch},
		});
	}

	get text () {
		let res = "";
		recur(this.ch);
		return res;
		function recur(sb) {
			if (sb instanceof Array) {
				sb.forEach(recur);
			} else if (typeof sb == "object") {
				recur(sb.ch);
			} else {
				res += sb;
			}
		}
	}
}

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_syntax_hl_fk_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_syntax_hl_fk_scss__WEBPACK_IMPORTED_MODULE_1__.default, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_syntax_hl_fk_scss__WEBPACK_IMPORTED_MODULE_1__.default.locals || {});

/***/ }),
/* 8 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



var isOldIE = function isOldIE() {
  var memo;
  return function memorize() {
    if (typeof memo === 'undefined') {
      // Test for IE <= 9 as proposed by Browserhacks
      // @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
      // Tests for existence of standard globals is to allow style-loader
      // to operate correctly into non-standard environments
      // @see https://github.com/webpack-contrib/style-loader/issues/177
      memo = Boolean(window && document && document.all && !window.atob);
    }

    return memo;
  };
}();

var getTarget = function getTarget() {
  var memo = {};
  return function memorize(target) {
    if (typeof memo[target] === 'undefined') {
      var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

      if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
        try {
          // This will throw an exception if access to iframe is blocked
          // due to cross-origin restrictions
          styleTarget = styleTarget.contentDocument.head;
        } catch (e) {
          // istanbul ignore next
          styleTarget = null;
        }
      }

      memo[target] = styleTarget;
    }

    return memo[target];
  };
}();

var stylesInDom = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDom.length; i++) {
    if (stylesInDom[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var index = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3]
    };

    if (index !== -1) {
      stylesInDom[index].references++;
      stylesInDom[index].updater(obj);
    } else {
      stylesInDom.push({
        identifier: identifier,
        updater: addStyle(obj, options),
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function insertStyleElement(options) {
  var style = document.createElement('style');
  var attributes = options.attributes || {};

  if (typeof attributes.nonce === 'undefined') {
    var nonce =  true ? __webpack_require__.nc : 0;

    if (nonce) {
      attributes.nonce = nonce;
    }
  }

  Object.keys(attributes).forEach(function (key) {
    style.setAttribute(key, attributes[key]);
  });

  if (typeof options.insert === 'function') {
    options.insert(style);
  } else {
    var target = getTarget(options.insert || 'head');

    if (!target) {
      throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
    }

    target.appendChild(style);
  }

  return style;
}

function removeStyleElement(style) {
  // istanbul ignore if
  if (style.parentNode === null) {
    return false;
  }

  style.parentNode.removeChild(style);
}
/* istanbul ignore next  */


var replaceText = function replaceText() {
  var textStore = [];
  return function replace(index, replacement) {
    textStore[index] = replacement;
    return textStore.filter(Boolean).join('\n');
  };
}();

function applyToSingletonTag(style, index, remove, obj) {
  var css = remove ? '' : obj.media ? "@media ".concat(obj.media, " {").concat(obj.css, "}") : obj.css; // For old IE

  /* istanbul ignore if  */

  if (style.styleSheet) {
    style.styleSheet.cssText = replaceText(index, css);
  } else {
    var cssNode = document.createTextNode(css);
    var childNodes = style.childNodes;

    if (childNodes[index]) {
      style.removeChild(childNodes[index]);
    }

    if (childNodes.length) {
      style.insertBefore(cssNode, childNodes[index]);
    } else {
      style.appendChild(cssNode);
    }
  }
}

function applyToTag(style, options, obj) {
  var css = obj.css;
  var media = obj.media;
  var sourceMap = obj.sourceMap;

  if (media) {
    style.setAttribute('media', media);
  } else {
    style.removeAttribute('media');
  }

  if (sourceMap && typeof btoa !== 'undefined') {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    while (style.firstChild) {
      style.removeChild(style.firstChild);
    }

    style.appendChild(document.createTextNode(css));
  }
}

var singleton = null;
var singletonCounter = 0;

function addStyle(obj, options) {
  var style;
  var update;
  var remove;

  if (options.singleton) {
    var styleIndex = singletonCounter++;
    style = singleton || (singleton = insertStyleElement(options));
    update = applyToSingletonTag.bind(null, style, styleIndex, false);
    remove = applyToSingletonTag.bind(null, style, styleIndex, true);
  } else {
    style = insertStyleElement(options);
    update = applyToTag.bind(null, style, options);

    remove = function remove() {
      removeStyleElement(style);
    };
  }

  update(obj);
  return function updateStyle(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap) {
        return;
      }

      update(obj = newObj);
    } else {
      remove();
    }
  };
}

module.exports = function (list, options) {
  options = options || {}; // Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
  // tags it will allow on a page

  if (!options.singleton && typeof options.singleton !== 'boolean') {
    options.singleton = isOldIE();
  }

  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    if (Object.prototype.toString.call(newList) !== '[object Array]') {
      return;
    }

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDom[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDom[_index].references === 0) {
        stylesInDom[_index].updater();

        stylesInDom.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),
/* 9 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "pre.syntax-hl-fk {\n  background-color: #444;\n  color: #ccc;\n  -moz-tab-size: 4;\n  tab-size: 4;\n  overflow: auto;\n  max-height: 500px;\n  padding: 20px;\n  font-family: consolas, monospace;\n}\npre.syntax-hl-fk *::selection {\n  background-color: #000;\n  background-color: #7777;\n}\npre.syntax-hl-fk .syntax-hl-fk__line {\n  margin-left: -20px;\n}\npre.syntax-hl-fk .syntax-hl-fk__line > * {\n  display: table-cell;\n}\npre.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-number {\n  width: 50px;\n  min-width: 50px;\n  max-width: 50px;\n  text-align: right;\n  background-color: #333;\n  padding-right: 10px;\n  margin-right: 5px;\n  transition: all 0.2s;\n}\npre.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-number:before {\n  content: attr(data-line-number) \"\";\n}\npre.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-indent {\n  padding-left: 5px;\n}\npre.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-text {\n  padding-left: 20px;\n  white-space: pre-wrap;\n  word-break: break-word;\n}\npre.syntax-hl-fk .syntax-hl-fk__line .syntax-hl-fk__line-text:before {\n  content: \"\";\n  margin-left: -20px;\n}", "",{"version":3,"sources":["webpack://./../syntax-hl-fk.scss"],"names":[],"mappings":"AACA;EACC,sBAAA;EACA,WAAA;EACA,gBAAA;EACA,WAAA;EAEA,cAAA;EACA,iBAAA;EACA,aAAA;EACA,gCAAA;AADD;AAEC;EACC,sBAAA;EACA,uBAAA;AAAF;AAGC;EACC,kBAAA;AADF;AAEE;EACC,mBAAA;AAAH;AAEE;EACC,WAAA;EACA,eAAA;EACA,eAAA;EACA,iBAAA;EACA,sBAAA;EACA,mBAAA;EACA,iBAAA;EACA,oBAAA;AAAH;AACG;EACC,kCAAA;AACJ;AAEE;EACC,iBAAA;AAAH;AAEE;EACC,kBAAA;EACA,qBAAA;EACA,sBAAA;AAAH;AACG;EACC,WAAA;EACA,kBAAA;AACJ","sourcesContent":["$pref : \"syntax-hl-fk\";\r\npre.#{$pref} {\r\n\tbackground-color: #444;\r\n\tcolor: #ccc;\r\n\t-moz-tab-size: 4;\r\n\ttab-size: 4;\r\n\t// color: #eee;\r\n\toverflow: auto; \r\n\tmax-height: 500px;\r\n\tpadding: 20px;\r\n\tfont-family: consolas, monospace;\r\n\t*::selection {\r\n\t\tbackground-color: #000;\r\n\t\tbackground-color: #7777;\r\n\t}\r\n\r\n\t.#{$pref}__line {\r\n\t\tmargin-left: -20px;\r\n\t\t>* {\r\n\t\t\tdisplay: table-cell;\r\n\t\t}\r\n\t\t.#{$pref}__line-number {\r\n\t\t\twidth: 50px;\r\n\t\t\tmin-width: 50px;\r\n\t\t\tmax-width: 50px;\r\n\t\t\ttext-align: right;\r\n\t\t\tbackground-color: #333;\r\n\t\t\tpadding-right: 10px;\r\n\t\t\tmargin-right: 5px;\r\n\t\t\ttransition: all .2s;\r\n\t\t\t&:before {\r\n\t\t\t\tcontent: attr(data-line-number)\"\";\r\n\t\t\t}\r\n\t\t}\r\n\t\t.#{$pref}__line-indent {\r\n\t\t\tpadding-left: 5px;\r\n\t\t}\r\n\t\t.#{$pref}__line-text {\r\n\t\t\tpadding-left: 20px;\r\n\t\t\twhite-space: pre-wrap;\r\n\t\t\tword-break: break-word;\r\n\t\t\t&:before {\r\n\t\t\t\tcontent: \"\";\r\n\t\t\t\tmargin-left: -20px;\r\n\t\t\t}\r\n\t\t}\r\n\t}\r\n}"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),
/* 10 */
/***/ ((module) => {



function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

module.exports = function cssWithMappingToString(item) {
  var _item = _slicedToArray(item, 4),
      content = _item[1],
      cssMapping = _item[3];

  if (typeof btoa === "function") {
    // eslint-disable-next-line no-undef
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),
/* 11 */
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join("");
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === "string") {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, ""]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_themes_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(13);

            

var options = {};

options.insert = "head";
options.singleton = false;

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_themes_scss__WEBPACK_IMPORTED_MODULE_1__.default, options);



/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_themes_scss__WEBPACK_IMPORTED_MODULE_1__.default.locals || {});

/***/ }),
/* 13 */
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var _node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_cssWithMappingToString_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "pre.syntax-hl-fk.calm-theme {\n  background-color: #222;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text {\n  color: #eee;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .string_v {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .string_n {\n  color: #78a;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text ._null {\n  color: #98f;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .error {\n  color: #fff;\n  background-color: #e48;\n  box-shadow: inset 0 0 2px #fff;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .f_name {\n  color: #eee;\n  font-weight: bold;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .comment {\n  color: #777;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .string {\n  color: #a98;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .re {\n  color: #78a;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .slashed {\n  color: #f90;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .number {\n  color: #f90;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .bool {\n  color: #f90;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .sp_const {\n  color: #f90;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .keyword {\n  color: #78a;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .operator {\n  color: #78a;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .punctuation {\n  color: #eee;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .paren {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .curly {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .bracket {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .word {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-theme .syntax-hl-fk__line-text .string_tag {\n  color: #ddc;\n}\n\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-number {\n  background-color: #444;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text {\n  color: #eee;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .string_v {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .string_n {\n  color: #78a;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text ._null {\n  color: #98f;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .error {\n  color: #fff;\n  background-color: #e48;\n  box-shadow: inset 0 0 2px #fff;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .f_name {\n  color: #eee;\n  font-weight: bold;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .comment {\n  color: #777;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .string {\n  color: #b98;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .re {\n  color: #78a;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .slashed {\n  color: #fb6;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .number {\n  color: #fb6;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .bool {\n  color: #fb6;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .sp_const {\n  color: #fb6;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .keyword {\n  color: #78a;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .operator {\n  color: #78a;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .punctuation {\n  color: #eee;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .paren {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .curly {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .bracket {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .word {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-clarified-theme .syntax-hl-fk__line-text .string_tag {\n  color: #ddc;\n}\n\npre.syntax-hl-fk.calm-clarified-json-theme .syntax-hl-fk__line-number {\n  background-color: #444;\n}\npre.syntax-hl-fk.calm-clarified-json-theme .syntax-hl-fk__line-text {\n  color: #eee;\n}\npre.syntax-hl-fk.calm-clarified-json-theme .syntax-hl-fk__line-text .string_v {\n  color: #ddc;\n}\npre.syntax-hl-fk.calm-clarified-json-theme .syntax-hl-fk__line-text .string_n {\n  color: #78a;\n}\npre.syntax-hl-fk.calm-clarified-json-theme .syntax-hl-fk__line-text .bool {\n  color: #fb6;\n}\npre.syntax-hl-fk.calm-clarified-json-theme .syntax-hl-fk__line-text .number {\n  color: #fb6;\n}\npre.syntax-hl-fk.calm-clarified-json-theme .syntax-hl-fk__line-text .slashed {\n  color: #fb6;\n}\npre.syntax-hl-fk.calm-clarified-json-theme .syntax-hl-fk__line-text ._null {\n  color: #98f;\n}\npre.syntax-hl-fk.calm-clarified-json-theme .syntax-hl-fk__line-text .error {\n  color: #fff;\n  background-color: #e48;\n  box-shadow: inset 0 0 2px #fff;\n}\n\npre.syntax-hl-fk.monokai-theme {\n  background-color: #333;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .f_name {\n  color: #3bd;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .comment {\n  color: #888;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .string {\n  color: #da5;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .re {\n  color: #da5;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .slashed {\n  color: #98f;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .number {\n  color: #98f;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .bool {\n  color: #98f;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .sp_const {\n  color: #98f;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .keyword {\n  color: #e48;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .operator {\n  color: #e48;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .punctuation {\n  color: #eee;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .paren {\n  color: #eee;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .curly {\n  color: #eee;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .bracket {\n  color: #eee;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .word {\n  color: #eee;\n}\npre.syntax-hl-fk.monokai-theme .syntax-hl-fk__line-text .string_tag {\n  color: #eee;\n}\n\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .f_name {\n  color: #3bd;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .comment {\n  color: #888;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .string {\n  color: #da5;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .re {\n  color: #da5;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .slashed {\n  color: #98f;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .number {\n  color: #98f;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .bool {\n  color: #98f;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .sp_const {\n  color: #98f;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .keyword {\n  color: #e48;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .operator {\n  color: #e48;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .punctuation {\n  color: #eee;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .paren {\n  color: #eee;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .curly {\n  color: #eee;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .bracket {\n  color: #eee;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .word {\n  color: #eee;\n}\npre.syntax-hl-fk.monokai-clarified-theme .syntax-hl-fk__line-text .string_tag {\n  color: #eee;\n}\n\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .f_name {\n  color: #3bd;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .comment {\n  color: #777;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .string {\n  color: #da5;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .re {\n  color: #da5;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .slashed {\n  color: #98f;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .number {\n  color: #98f;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .bool {\n  color: #98f;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .sp_const {\n  color: #98f;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .keyword {\n  color: #e48;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .operator {\n  color: #3db;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .punctuation {\n  color: #3db;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .paren {\n  color: #3db;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .curly {\n  color: #3db;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .bracket {\n  color: #3db;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .word {\n  color: #eee;\n}\npre.syntax-hl-fk.t1-theme .syntax-hl-fk__line-text .string_tag {\n  color: #eee;\n}\n\npre.syntax-hl-fk.t2-theme .syntax-hl-fk__line-text {\n  color: #eee;\n}\npre.syntax-hl-fk.t2-theme .syntax-hl-fk__line-text .string_v {\n  color: #fd8;\n}\npre.syntax-hl-fk.t2-theme .syntax-hl-fk__line-text .string_n {\n  color: #78a;\n}\npre.syntax-hl-fk.t2-theme .syntax-hl-fk__line-text .bool {\n  color: #98f;\n}\npre.syntax-hl-fk.t2-theme .syntax-hl-fk__line-text .number {\n  color: #f90;\n}\npre.syntax-hl-fk.t2-theme .syntax-hl-fk__line-text ._null {\n  color: #98f;\n}\npre.syntax-hl-fk.t2-theme .syntax-hl-fk__line-text .error {\n  color: #fff;\n  background-color: #e48;\n  box-shadow: inset 0 0 2px #fff;\n}\npre.syntax-hl-fk.t2-theme .syntax-hl-fk__line-text .slashed {\n  color: #98f;\n}", "",{"version":3,"sources":["webpack://./themes.scss"],"names":[],"mappings":"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","sourcesContent":["$pref : \"syntax-hl-fk\";\r\n\r\npre.#{$pref}.calm-theme {\r\n\tbackground-color: #222;\r\n\t.#{$pref}__line-text {\r\n\t\tcolor: #eee;\r\n\t\t// .string_v    {color: #FAF4C6;}\r\n\t\t// .string_v    {color: #ffc;}\r\n\t\t.string_v    {color: #ddc;}\r\n\t\t.string_n    {color: #78a;}\r\n\t\t// .bool        {color: #98f;}\r\n\t\t// .number      {color: #f90;}\r\n\t\t._null       {color: #98f;}\r\n\t\t.error       {color: #fff; background-color: #e48; box-shadow: inset 0 0 2px #fff;}\r\n\t\t// .slashed     {color: #98f;}\r\n\r\n\t\t// .comment     {color: #888;}\r\n\t\t.f_name        {color: #eee; font-weight: bold;}\r\n\t\t.comment       {color: #777;}\r\n\t\t.string        {color: #a98;}\r\n\t\t.re            {color: #78a;}\r\n\t\t.slashed       {color: #f90;}\r\n\t\t.number        {color: #f90;}\r\n\t\t.bool          {color: #f90;}\r\n\t\t.sp_const      {color: #f90;}\r\n\t\t.keyword       {color: #78a;}\r\n\t\t.operator      {color: #78a;}\r\n\t\t.punctuation   {color: #eee;}\r\n\t\t.paren         {color: #ddc;}\r\n\t\t.curly         {color: #ddc;}\r\n\t\t.bracket       {color: #ddc;}\r\n\t\t.word          {color: #ddc;}\r\n\t\t.string_tag    {color: #ddc;}\r\n\t}\r\n\r\n}\r\n\r\npre.#{$pref}.calm-clarified-theme {\r\n\t.#{$pref}__line-number {\r\n\t\tbackground-color: #444;\r\n\t\t// border-right: 3px solid #ccc;\r\n\t}\r\n\t.#{$pref}__line-text {\r\n\t\tcolor: #eee;\r\n\t\t// .string_v      {color: #FAF4C6;}\r\n\t\t// .string_v      {color: #ffc;}\r\n\t\t.string_v      {color: #ddc;}\r\n\t\t.string_n      {color: #78a;}\r\n\t\t._null         {color: #98f;}\r\n\t\t.error         {color: #fff; background-color: #e48; box-shadow: inset 0 0 2px #fff;}\r\n\t\t.f_name        {color: #eee; font-weight: bold;}\r\n\t\t.comment       {color: #777;}\r\n\t\t.string        {color: #b98;}\r\n\t\t.re            {color: #78a;}\r\n\t\t.slashed       {color: #fb6;}\r\n\t\t.number        {color: #fb6;}\r\n\t\t.bool          {color: #fb6;}\r\n\t\t.sp_const      {color: #fb6;}\r\n\t\t.keyword       {color: #78a;}\r\n\t\t.operator      {color: #78a;}\r\n\t\t.punctuation   {color: #eee;}\r\n\t\t.paren         {color: #ddc;}\r\n\t\t.curly         {color: #ddc;}\r\n\t\t.bracket       {color: #ddc;}\r\n\t\t.word          {color: #ddc;}\r\n\t\t.string_tag    {color: #ddc;}\r\n\t}\r\n\r\n}\r\n\r\npre.#{$pref}.calm-clarified-json-theme {\r\n\t.#{$pref}__line-number {\r\n\t\tbackground-color: #444;\r\n\t\t// border-right: 3px solid #ccc;\r\n\t}\r\n\t.#{$pref}__line-text {\r\n\t\tcolor: #eee;\r\n\t\t.string_v      {color: #ddc;}\r\n\t\t.string_n      {color: #78a;}\r\n\t\t.bool          {color: #fb6;}\r\n\t\t.number        {color: #fb6;}\r\n\t\t.slashed       {color: #fb6;}\r\n\t\t._null         {color: #98f;}\r\n\t\t.error         {color: #fff; background-color: #e48; box-shadow: inset 0 0 2px #fff;}\r\n\t}\r\n\r\n}\r\n\r\n\r\npre.#{$pref}.monokai-theme {\r\n\tbackground-color: #333;\r\n\t.#{$pref}__line-text {\r\n\t\t// .f_name      {color: #8d1;}\r\n\t\t.f_name      {color: #3bd;}\r\n\t\t.comment     {color: #888;}\r\n\t\t.string      {color: #da5;}\r\n\t\t.re          {color: #da5;}\r\n\t\t.slashed     {color: #98f;}\r\n\t\t.number      {color: #98f;}\r\n\t\t.bool        {color: #98f;}\r\n\t\t.sp_const    {color: #98f;}\r\n\t\t.keyword     {color: #e48;}\r\n\t\t.operator    {color: #e48;}\r\n\t\t.punctuation {color: #eee;}\r\n\t\t.paren       {color: #eee;}\r\n\t\t.curly       {color: #eee;}\r\n\t\t.bracket     {color: #eee;}\r\n\t\t.word        {color: #eee;}\r\n\t\t.string_tag  {color: #eee;}\r\n\t}\r\n}\r\n\r\npre.#{$pref}.monokai-clarified-theme {\r\n\t// background-color: #333;\r\n\t.#{$pref}__line-text {\r\n\t\t// .f_name      {color: #A3C266;}\r\n\t\t.f_name      {color: #3bd;}\r\n\t\t// .comment     {color: #777;}\r\n\t\t.comment     {color: #888;}\r\n\t\t.string      {color: #da5;}\r\n\t\t.re          {color: #da5;}\r\n\t\t.slashed     {color: #98f;}\r\n\t\t.number      {color: #98f;}\r\n\t\t.bool        {color: #98f;}\r\n\t\t.sp_const    {color: #98f;}\r\n\t\t.keyword     {color: #e48;}\r\n\t\t.operator    {color: #e48;}\r\n\t\t.punctuation {color: #eee;}\r\n\t\t.paren       {color: #eee;}\r\n\t\t.curly       {color: #eee;}\r\n\t\t.bracket     {color: #eee;}\r\n\t\t.word        {color: #eee;}\r\n\t\t.string_tag  {color: #eee;}\r\n\t}\r\n}\r\n\r\npre.#{$pref}.t1-theme {\r\n\t.#{$pref}__line-text {\r\n\t\t// .f_name      {color: #8d1;}\r\n\t\t.f_name      {color: #3bd;}\r\n\t\t.comment     {color: #777;}\r\n\t\t.string      {color: #da5;}\r\n\t\t.re          {color: #da5;}\r\n\t\t.slashed     {color: #98f;}\r\n\t\t.number      {color: #98f;}\r\n\t\t.bool        {color: #98f;}\r\n\t\t.sp_const    {color: #98f;}\r\n\t\t.keyword     {color: #e48;}\r\n\t\t.operator    {color: #3db;}\r\n\t\t.punctuation {color: #3db;}\r\n\t\t.paren       {color: #3db;}\r\n\t\t.curly       {color: #3db;}\r\n\t\t.bracket     {color: #3db;}\r\n\t\t.word        {color: #eee;}\r\n\t\t.string_tag  {color: #eee;}\r\n\t}\r\n}\r\n\r\npre.#{$pref}.t2-theme {\r\n\t.#{$pref}__line-text {\r\n\t\tcolor: #eee;\r\n\t\t.string_v    {color: #fd8;}\r\n\t\t.string_n    {color: #78a;}\r\n\t\t.bool        {color: #98f;}\r\n\t\t.number      {color: #f90;}\r\n\t\t._null       {color: #98f;}\r\n\t\t.error       {color: #fff; background-color: #e48; box-shadow: inset 0 0 2px #fff;}\r\n\t\t.slashed     {color: #98f;}\r\n\t}\r\n}\r\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ })
/******/ ]);
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		id: moduleId,
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/compat get default export */
/******/ (() => {
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = (module) => {
/******/ 		var getter = module && module.__esModule ?
/******/ 			() => (module['default']) :
/******/ 			() => (module);
/******/ 		__webpack_require__.d(getter, { a: getter });
/******/ 		return getter;
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _syntax_hl_fk_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/* harmony import */ var _themes_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);





const {
	seq,
	alter,
	q,
	not,
	domain,
	rule,
	token,
	deb,
} = _index_js__WEBPACK_IMPORTED_MODULE_0__.default.describeAPI;

const
	__main_ = rule(function(pc) {
		return seq(
			r.space.q("*"),
			alter(
				r.subject,
				err.msg("expected subject")
			),
			r.space.q("*"),
			err.msg("unwanted symbol after end of code").q("*"),
		)(pc);
	}),
	list = rule(function(pc) {
		if (token("[").in("list__open")(pc)) {
			r.space.q("*")(pc);
			r.subject.q("*/", r.coma_sep.in("list__coma"))(pc);
			r.space.q("*")(pc);
			token("]").in("list__close").or(err.msg("expected closing bracket ' ] ' or coma ' , '"))(pc);
			return true;
		} else
			return false;
	}),
	dict = rule(function(pc) {
		if (r.curly_op(pc)) {
			alter(
				seq(r.curly_cl),
				seq(
					seq(
						d.string_n.or(err.msg("expected string name of field")),
						r.colon_sep.or(err.msg("expected colon ' : '")),
						r.subject.or(err.msg("expected subject - (null | boll | number | string | list | dict)"))
					).q("*/", r.coma_sep),
					seq(r.curly_cl).or(err.msg("expected closing curly ' } ' or coma ' , '")),
				),
			)(pc);
			return true;
		} else
			return false;
	}),
	err = domain("error", function(pc) {
		return pc.match(/\s*.*/y);
	}),
	d = {
		string_v : domain("string_v" , function(pc) {
			return r.string(pc);
		}),
		string_n : domain("string_n" , function(pc) {
			return r.string(pc);
		}),
		slashed : domain("slashed", function(pc) {
			return pc.match(/\\[\\ntbu'"`]/y);
		}),
		number          : domain("number", function(pc) {
			return pc.match(/\b\d+\.|\.\d+\b|\b\d+\.?\d*\b/y);
		}),
		bool            : domain("bool", function(pc) {
			return pc.match(/\btrue\b|\bfalse\b/y);
		}),
		_null           : domain("_null", function(pc) {
			return pc.match(/\bnull\b/y);
		}),
	},
	r = {
		subject         : rule(function(pc) {
			return alter(
				d._null,
				d.bool,
				d.number,
				d.string_v,
				list,
				dict
			)(pc);
		}),
		coma_sep      : rule(function(pc) {
			return seq(
				r.space.q("*"),
				token(","),
				r.space.q("*"),
				)(pc);
		}),
		colon_sep      : rule(function(pc) {
			return seq(
				r.space.q("*"),
				token(":"),
				r.space.q("*"),
				)(pc);
		}),
		curly_op      : rule(function(pc) {
			return seq(token("{"), r.space.q("*"))(pc);
		}),
		curly_cl      : rule(function(pc) {
			return seq(r.space.q("*"), token("}"))(pc);
		}),
		string        : rule(function(pc) {
			return pc.match('"')
				&& q(pc => d.slashed(pc) || pc.notMatch('"'), "*")(pc) 
				&& pc.match('"');
		}),
		space           : rule(function(pc) {
			return pc.match(/\s+/y);
		}),
	};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new _index_js__WEBPACK_IMPORTED_MODULE_0__.default.SyntaxHighlightAPI(__main_));
})();

var __webpack_exports__default = __webpack_exports__.default;
export { __webpack_exports__default as default };

//# sourceMappingURL=bundle-describe-syntax.js.map