
// OpenSiteMobile SyntaxHighLighter brush

/*global
    msos: false,
    jQuery: false,
    SyntaxHighlighter: false
*/

msos.provide("syntaxhighlighter.brushes.diff");
msos.require("msos.syntaxhighlighter");

syntaxhighlighter.brushes.diff.version = new msos.set_version(13, 6, 14);


syntaxhighlighter.brushes.diff.brush = function () {

	function Brush() {

		this.regexList = [
			{ regex: /^\+\+\+ .*$/gm,	css: 'color2' },	// new file
			{ regex: /^\-\-\- .*$/gm,	css: 'color2' },	// old file
			{ regex: /^\s.*$/gm,		css: 'color1' },	// unchanged
			{ regex: /^@@.*@@.*$/gm,	css: 'variable' },	// location
			{ regex: /^\+.*$/gm,		css: 'string' },	// additions
			{ regex: /^\-.*$/gm,		css: 'color3' }		// deletions
			];
	};

	Brush.prototype	= new SyntaxHighlighter.Highlighter();
	Brush.aliases	= ['diff', 'patch'];

	SyntaxHighlighter.brushes.Diff = Brush;

};
