import {
	ParseContext,
	seq,
	alter,
	q,
	not,
	domain,
	rule,
	token,
	deb,
} from "./describeAPI.js";

import getSyntaxHighlightAPI from "./getSyntaxHighlightAPI.js";


export default {
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