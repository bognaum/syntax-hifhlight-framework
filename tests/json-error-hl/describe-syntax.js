import SyntaxHlFk from "../../index.js"

// import "./../../syntax-hl-fk.scss";
// import "./../themes.scss";

const {
	seq,
	alter,
	q,
	not,
	domain,
	rule,
	token,
	nToken,
	deb,
} = SyntaxHlFk.describeAPI;

const
	__main_ = rule(function(pc) {
		return seq(
			r.space.q("*"),
			r.subject.or(err.msg("expected subject")),
			r.space.q("*"),
			err.msg("unwanted symbol after end of code").q("*"),
		)(pc);
	}),
	list = rule(function(pc) {
		if (token("[").in("list__open")(pc)) {
			seq(
				r.space.q("*"),
				r.subject.q("*/", r.coma_sep.in("list__coma")),
				r.space.q("*"),
				token("]").in("list__close")
					.or(err.msg("expected closing bracket ' ] ' or coma ' , '")),
			)(pc);
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
		return token(/\s*.*/y)(pc);
	}),
	d = {
		string_v : domain("string_v" , function(pc) {
			return r.string(pc);
		}),
		string_n : domain("string_n" , function(pc) {
			return r.string(pc);
		}),
		slashed : domain("slashed", function(pc) {
			return token(/\\[\\ntbu'"`]/y)(pc);
		}),
		number          : domain("number", function(pc) {
			return token(/\b\d+\.|\.\d+\b|\b\d+\.?\d*\b/y)(pc);
		}),
		bool            : domain("bool", function(pc) {
			return token(/\btrue\b|\bfalse\b/y)(pc);
		}),
		_null           : domain("_null", function(pc) {
			return token(/\bnull\b/y)(pc);
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
			return seq(
				token('"'),
				q(alter(d.slashed, nToken('"')), "*"),
				token('"'),
			)(pc);
		}),
		space           : rule(function(pc) {
			return token(/\s+/y)(pc);
		}),
	};

export default new SyntaxHlFk.Highlighter(__main_);