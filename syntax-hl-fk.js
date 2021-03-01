!function() {
	const {
		ParseContext,
		seq,
		alter,
		q,
		not,
		domain,
		rule,
		token,
		deb,
	} = makeDescribeAPI(),
	getSyntaxHighlightAPI = makeHighlighter(ParseContext);
	
	return window.SyntaxHlFk = {
		version: "2.0.0-alpha",
		describeAPI: {
			seq,
			alter,
			q,
			not,
			domain,
			rule,
			token,
			deb,
		},
		getSyntaxHighlightAPI, // (mainRule, clPref="syntax-hl-fk")
	};



	function makeHighlighter(ParseContext) {

		return function getSyntaxHighlightAPI (mainRule, clPref="syntax-hl-fk") {

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

			function evaluate (code) {
				const shell = document.createElement("div");
				shell.innerHTML = code;
				return shell.children[0];
			}

			function setMainRule(rule) {
				mainRule = rule;
			}
		}
	}



	function makeDescribeAPI () {

		const Analyzer_proto = _make_Analizer_proto();
		const {ParseContext, ModelNode} = _make_classes();

		return {
			ParseContext,
			seq,
			alter,
			q,
			not,
			domain,
			rule,
			token,
			deb,
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

		function _make_Analizer_proto() {
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

			return Analyzer_proto;
		}

		function _make_classes() {
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
						mn = new ModelNode(name, mSlot),
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

			return {
				ParseContext,
				ModelNode,
			};
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

	}
}();