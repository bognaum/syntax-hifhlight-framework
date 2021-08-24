const 
	sass$ = require("sass"),
	fs$   = require("fs"),
	path$ = require("path");

const 
	filename = "./highlighter.scss",
	pSep = path$.sep;

const 
	compOb = sass$.renderSync({
		file: "./highlighter.scss",
		outFile: './highlighter.css',
		sourceMap: true,
		sourceMapEmbed: true,
	}),
	cssCode = compOb.css.toString(),
	mapCode = compOb.map?.toString(),
	prretifiedMap = mapCode? JSON.stringify(JSON.parse(mapCode), null, 4) : null,
	templ = fs$.readFileSync([__dirname, "template.js"].join(pSep)).toString(),
	resultCode = templ.replace("-xxx-inserting-tag-xxx-", "\n\n"+cssCode+"\n\n");

console.log(`prretifiedMap :`, prretifiedMap);

fs$.writeFileSync([__dirname, filename+".js"].join(pSep), resultCode);

// setInterval(() => {},1000);