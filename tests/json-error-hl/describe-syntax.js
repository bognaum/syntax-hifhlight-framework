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
	spWrap,
	spToken,
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
				spWrap(r.subject.q("*/", spWrap(token(",").in("list__coma")))),
				token("]").in("list__close")
					.or(err.msg("expected closing bracket ' ] ' or coma ' , '")),
			)(pc);
			return true;
		} else
			return false;
	}),
	dict = rule(function(pc) {
		if (spToken("{")(pc)) {
			alter(
				seq(spToken("}")),
				seq(
					seq(
						d.string_n.or(err.msg("expected string name of field")),
						spToken(":").or(err.msg("expected colon ' : '")),
						r.subject.or(err.msg("expected subject - (null | boll | number | string | list | dict)"))
					).q("*/", spToken(",")),
					spToken("}").or(err.msg("expected closing curly ' } ' or coma ' , '")),
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