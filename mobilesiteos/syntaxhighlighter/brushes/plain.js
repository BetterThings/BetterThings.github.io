
// OpenSiteMobile SyntaxHighLighter brush

/*global
    msos: false,
    jQuery: false,
    SyntaxHighlighter: false
*/

msos.provide("syntaxhighlighter.brushes.plain");
msos.require("msos.syntaxhighlighter");

syntaxhighlighter.brushes.plain.version = new msos.set_version(13, 6, 14);


syntaxhighlighter.brushes.plain.brush = function () {

	function Brush() {};

	Brush.prototype	= new SyntaxHighlighter.Highlighter();
	Brush.aliases	= ['text', 'plain'];

	SyntaxHighlighter.brushes.Plain = Brush;

};
