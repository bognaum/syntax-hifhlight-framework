import ParseContext from "./ParseContext.js";

export {
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