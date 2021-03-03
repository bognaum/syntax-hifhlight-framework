import SyntaxHlFk from "../../syntax-hl-fk.js"

const {
	seq,
	alter,
	q,
	not,
	domain,
	rule,
	token,
	deb,
} = SyntaxHlFk.describeAPI;

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

export default new SyntaxHlFk.SyntaxHighlightAPI(__main_);