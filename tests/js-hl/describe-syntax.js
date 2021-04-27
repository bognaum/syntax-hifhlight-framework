import SyntaxHlFk from "../../index.js"

// import "./../../syntax-hl-fk.scss";
// import "./../themes.scss";

const {
	token,
	nToken,
	spToken,
	rule,
	domain,
	seq,
	alter,
	q,
	not,
	spWrap,
	error,
	deb,
} = SyntaxHlFk.describeAPI;

const
	d = {
		comment : domain("comment", function(pc) {
			return alter(r.comment_line, r.comment_snippet)(pc);
		}),
		string  : domain("string" , function(pc) {
			return r.string_single(pc) || r.string_dowble(pc) || r.string_slash(pc);
		}),
		re      : domain("re"     , function(pc) {
			return token(/\/(\\\/|[^\/\n])+\/[migy]{0,4}/y)(pc);
		}),
		slashed : domain("slashed", function(pc) {
			return token(/\\[\\ntbu'"`]/y)(pc);
		}),
		keyword : domain("keyword", function(pc) {
			return token(/\bvar\b|\blet\b|\bconst\b|\bclass\b|\bextends\b|\btypeof\b|\binstanceof\b|\bnew\b|\breturn\b|\bif\b|\belse\b|\bfor\b|\bin\b|\bof\b|\bwhile\b|\bbreak\b|\bdo\b|\bcontinue\b|\bswitch\b|\bcase\b|\bthrow\b|\byield\b|\bimport\b|\bexport\b|\bdefault\b|\bfrom\b|\bas\b/y)(pc);
		}),
		string_tag      : domain("string_tag", function(pc) {
			return seq(
				token("${"),
				r.main_inner.q("*"),
				token("}"),
			)(pc);
		}),
		word          : domain("word", function(pc) {
			return token(/\b[a-zA-Z_$][0-9a-zA-Z_$]*\b/y)(pc);
		}),
		operator        : domain("operator", function(pc) {
			return token(/\?\.|\?|=>|!|%|&&|&|\*|-|\+|=|\|\||\||<|>/y)(pc);
		}),
		punctuation     : domain("punctuation", function(pc) {
			return token(/\.|,|:|;/y)(pc);
		}),
		number          : domain("number", function(pc) {
			return token(/\b\d+\.|\.\d+\b|\b\d+\.?\d*\b/y)(pc);
		}),
		bool            : domain("bool", function(pc) {
			return token(/\btrue\b|\bfalse\b/y)(pc);
		}),
		sp_const        : domain("sp_const", function(pc) {
			return token(/\bundefined\b|\bnull\b|\bInfinity\b/y)(pc);
		}),
		paren           : domain("paren", function(pc) {
			return seq(
				token("("),
				r.main_inner.q("*"),
				token(")"),
			)(pc);
		}),
		curly           : domain("curly", function(pc) {
			return seq(
				token("{"),
				r.main_inner.q("*"),
				token("}"),
			)(pc);
		}),
		bracket         : domain("bracket", function(pc) {
			return seq(
				token("["),
				r.main_inner.q("*"),
				token("]"),
			)(pc);
		}),
		f_sign          : domain("f_sign", function(pc) {
			return seq(
				spWrap(d.word.as("f_name")),
				spWrap(d.paren),
			)(pc);
		}),
		f_decl          : domain("f_decl", function(pc) {
			return seq(
				spWrap(token(/\basync\b/y).in("keyword").q("*")),
				spWrap(token(/\bfunction\b/y).in("keyword")),
				spWrap(token("*").in("keyword").q("*")),
				spWrap(d.word.as("f_name")),
				spWrap(d.paren),
				spWrap(d.curly),
			)(pc);
		}),
	},
	r = {
		main            : rule(function(pc) {
			return q( 
				alter(r.main_inner, r.simple), 
			"*" )(pc);
		}),
		main_inner       : rule(function(pc) {
			return alter(
				r.space,
				d.keyword,
				d.operator,
				d.f_decl,
				d.f_sign,
				d.bool,
				d.sp_const,
				d.word,
				d.paren,
				d.curly,
				d.bracket,
				d.number,
				d.punctuation,
				d.comment,
				d.string,
				d.re,
			)(pc);
		}),
		space           : rule(function(pc) {
			return token(/\s+/y)(pc);
		}),
		simple          : rule(function(pc) {
			return token(/./y)(pc);
		}),
		comment_line    : rule(function(pc) {
			return seq(
				token("//"),
				nToken("\n").q("*"),
			)(pc);
		}),
		comment_snippet : rule(function(pc) {
			return seq(
				token("/*"),
				nToken("*/").q("*"),
				token("*/"),
			)(pc);
		}),
		string_single   : rule(function(pc) {
			return seq(
				token("'"),
				alter(d.slashed, nToken("'")).q("*"),
				token("'"),
			)(pc);
		}),
		string_dowble   : rule(function(pc) {
			return seq(
				token('"'),
				alter(d.slashed, nToken('"')).q("*"),
				token('"'),
			)(pc);
		}),
		string_slash    : rule(function(pc) {
			return seq(
				token("`"),
				alter(d.slashed, d.string_tag, nToken("`")).q("*"),
				token("`"),
			)(pc);
		}),
	};

export default new SyntaxHlFk.Highlighter(r.main);