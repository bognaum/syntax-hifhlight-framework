import ModelNode    from "./ModelNode.js";

export default class ParseContext {
	constructor(pc) {
		Object.defineProperties(this,{
			text:   {value: pc.text},
			mSlot:  {value: pc.mSlot},
			dStack: {value: pc.dStack},
			lFStack: {value: pc.lFStack},
			errC: {value: pc.errC || {eFlag: false}},
		});
		this.i = pc.i;
		this.i0 = pc.i0;
		this.selfMN = pc.selfMN;
		this.monitor = pc.monitor;
		// this.debugDomain = pc.debugDomain;
	}
	match (templ) {
		const {mSubstr, len} = this._getMatchSubstr(templ);

		if (mSubstr) {
			this.i += len;
			push(this.mSlot, mSubstr);
			this.monitor = this.i+ " : "+this.text.substr(this.i, 20)
			return mSubstr;
		} else
			return "";
	}
	notMatch (templ) {
		const {mSubstr, len} = this._getMatchSubstr(templ);

		if (mSubstr) {
			return false;
		} else {
			const simbol = this.text[this.i];
			push(this.mSlot, simbol);
			this.i += 1;
			this.monitor = this.i+ " : "+this.text.substr(this.i, 20);
			return simbol;
		}


		const hpc = this.createHypo();
		if (! hpc.match(templ)) {
			this.match(this.text[this.i]);
			return true;
		} else
			return false;
	}
	createHypo () {
		const 
			{text, i, mSlot, dStack, errC} = this,
			hpc = {text, i, mSlot: [], dStack, errC};
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
			{text, i, dStack, errC} = this,
			mSlot = [],
			mn = new ModelNode(name, mSlot),
			hpc = {text, i, i0: i, mSlot, selfMN: mn, dStack, errC};
		mn.i0 = i;
		return new ParseContext(hpc);
	}
	acceptChildHypo (hpc) {
		this.i = this.i1 = hpc.i;
		push(this.mSlot, hpc.selfMN);
		hpc.selfMN.i1 = hpc.i;
		if (hpc.msg)
			hpc.selfMN.msg = hpc.msg;
		hpc.selfMN = null;
		return true;
	}
	_getMatchSubstr (templ) {
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

		return {mSubstr, len};
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