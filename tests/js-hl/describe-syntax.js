import SyntaxHlFk from "../../index.js"

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
	d = {
		comment : domain("comment", function(pc) {
			return r.comment_line(pc) || r.comment_snippet(pc);
		}),
		string  : domain("string" , function(pc) {
			return r.string_single(pc) || r.string_dowble(pc) || r.string_slash(pc);
		}),
		re      : domain("re"     , function(pc) {
			return pc.match(/\/(\\\/|[^\/\n])+\/[migy]{0,4}/y);
		}),
		slashed : domain("slashed", function(pc) {
			return pc.match(/\\[\\ntbu'"`]/y);
		}),
		keyword : domain("keyword", function(pc) {
			return pc.match(/\bvar\b|\blet\b|\bconst\b|\bclass\b|\bextends\b|\btypeof\b|\binstanceof\b|\bnew\b|\breturn\b|\bif\b|\belse\b|\bfor\b|\bin\b|\bof\b|\bwhile\b|\bbreak\b|\bdo\b|\bcontinue\b|\bswitch\b|\bcase\b|\bthrow\b|\byield\b|\bimport\b|\bexport\b|\bdefault\b|\bfrom\b|\bas\b/y);
		}),
		string_tag      : domain("string_tag", function(pc) {
			return pc.match("${")
				// && q(pc => pc.notMatch("}"), "*")(pc)
				// && domain("s_t_content", q(r.main_inner, "*"))(pc)
				&& q(r.main_inner, "*")(pc)
				&& pc.match("}");
		}),
		word          : domain("word", function(pc) {
			return pc.match(/\b[a-zA-Z_$][0-9a-zA-Z_$]*\b/y);
		}),
		operator        : domain("operator", function(pc) {
			return pc.match(/\?\.|\?|=>|!|%|&&|&|\*|-|\+|=|\|\||\||:|<|>/y);
		}),
		punctuation     : domain("punctuation", function(pc) {
			return pc.match(/\.|,|;/y);
		}),
		number          : domain("number", function(pc) {
			return pc.match(/\b\d+\.|\.\d+\b|\b\d+\.?\d*\b/y);
		}),
		bool            : domain("bool", function(pc) {
			return pc.match(/\btrue\b|\bfalse\b/y);
		}),
		sp_const        : domain("sp_const", function(pc) {
			return pc.match(/\bundefined\b|\bnull\b|\bInfinity\b/y);
		}),
		paren           : domain("paren", function(pc) {
			return pc.match("(")
				&& q(pc => r.main_inner(pc), "*")(pc)
				&& pc.match(")");
		}),
		curly           : domain("curly", function(pc) {
			return pc.match("{")
				&& q(pc => r.main_inner(pc), "*")(pc)
				&& pc.match("}");
		}),
		bracket         : domain("bracket", function(pc) {
			return pc.match("[")
				&& q(pc => r.main_inner(pc), "*")(pc)
				&& pc.match("]");
		}),
		f_sign          : domain("f_sign", function(pc) {
			return d.word.as("f_name")(pc)
				&& q(pc => r.space(pc), "*")(pc)
				&& d.paren(pc);
		}),
		f_decl          : domain("f_decl", function(pc) {
			return seq(
				token("async").in("keyword").q("*"),
				r.space.q("*"),
				token("function").in("keyword"),
				r.space.q("+"),
				d.word.as("f_name"),
				r.space.q("*"),
				d.paren,
				r.space.q("*"),
				d.curly,
			)(pc);
		}),
	},
	r = {
		main            : rule(function(pc) {
			return q(
				pc => {
					return r.main_inner(pc)
						|| r.simple(pc);
				},
				"*"
			)(pc);
		}),
		main_inner       : rule(function(pc) {
			return r.space(pc)
				|| d.keyword(pc)
				|| d.operator(pc)
				|| d.f_decl(pc)
				|| d.f_sign(pc)
				|| d.bool(pc)
				|| d.sp_const(pc)
				|| d.word(pc)
				|| d.paren(pc)
				|| d.curly(pc)
				|| d.bracket(pc)
				|| d.number(pc)
				|| d.punctuation(pc)
				|| d.comment(pc)
				|| d.string(pc)
				|| d.re(pc);
		}),
		space           : rule(function(pc) {
			return pc.match(/\s+/y);
		}),
		simple          : rule(function(pc) {
			return pc.match(/./y);
		}),
		comment_line    : rule(function(pc) {
			return pc.match("//")
				&& q(pc => pc.notMatch("\n"), "*")(pc);
		}),
		comment_snippet : rule(function(pc) {
			return pc.match("/*")
				&& q(pc => pc.notMatch("*/"), "*")(pc)
				&& pc.match("*/");
		}),
		string_single   : rule(function(pc) {
			return pc.match("'")
				&& q(pc => d.slashed(pc) || pc.notMatch("'"), "*")(pc) 
				&& pc.match("'");
		}),
		string_dowble   : rule(function(pc) {
			return pc.match('"')
				&& q(pc => d.slashed(pc) || pc.notMatch('"'), "*")(pc) 
				&& pc.match('"');
		}),
		string_slash    : rule(function(pc) {
			return pc.match("`")
				&& q(pc => d.slashed(pc) || d.string_tag(pc) || pc.notMatch("`"), "*")(pc) 
				&& pc.match("`");
		}),
	};

export default new SyntaxHlFk.SyntaxHighlightAPI(r.main);