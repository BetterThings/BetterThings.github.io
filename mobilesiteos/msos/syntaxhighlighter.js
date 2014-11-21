// Copyright Notice:
//				syntaxhighlighter.js
//			Copyright©2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile SyntaxHighLighter loader script

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.syntaxhighlighter");

msos.syntaxhighlighter.version = new msos.set_version(14, 3, 31);


// Start by loading our SyntaxHighLighter stylesheets
msos.syntaxhighlighter.css = new msos.loader();

// Get it started by loading the CSS
msos.syntaxhighlighter.css.load('syntaxhighlighter_css_core',		msos.resource_url('syntaxhighlighter', 'css/core.css'),		'css');
msos.syntaxhighlighter.css.load('syntaxhighlighter_css_default',	msos.resource_url('syntaxhighlighter', 'css/default.css'),	'css');

msos.syntaxhighlighter.is_loaded = false;

msos.syntaxhighlighter.loader = function () {
	"use strict";

	var temp_sl = 'msos.syntaxhighlighter.loader -> ',
        sh_load_js = new msos.loader(),
        xp_load_js = new msos.loader(),
        sh_load_js_onload = null,
        xp_load_js_onload = null,
        xp_uri = 'v300.min.js';

    msos.console.debug(temp_sl + 'start.');

    xp_load_js_onload = function () {
        var sh_uri = 'v3083.min.js';

        msos.console.debug(temp_sl + 'xregexp loaded!');

        if (msos.config.debug_script) { sh_uri = 'v3083.uc.js'; }
        sh_load_js.load('syntaxhighlighter_js', msos.resource_url('syntaxhighlighter', sh_uri), 'js');
    };

    xp_load_js.add_resource_onload.push(xp_load_js_onload);

    sh_load_js_onload = function () {
        var brushes = [
                'applescript', 'as3', 'bash', 'coldfusion', 'cpp', 'csharp', 'css',
                'delphi', 'diff', 'erlang', 'groovy', 'haxe', 'java', 'javafx',
                'jscript', 'perl', 'php', 'plain', 'powershell', 'python',
                'ruby', 'sass', 'scala', 'sql', 'typescript', 'vb', 'xml'
            ],
            loaded = [],
            name = '',
            i = 0;

        // Run all previously loaded "brushes" functions
        for (i = 1; i < brushes.length; i += 1) {
            name = brushes[i];
            if (syntaxhighlighter.brushes[name]
			 && syntaxhighlighter.brushes[name].brush) {
                syntaxhighlighter.brushes[name].brush();
                loaded.push(name);
            }
        }

        if (loaded.length < 1) {
            msos.console.warn(temp_sl + 'syntaxhighlighter, but w/o any brushes!');
        } else {
            msos.console.debug(temp_sl + 'syntaxhighlighter loaded for: ', loaded);
            msos.syntaxhighlighter.is_loaded = true;
        }
    };

    sh_load_js.add_resource_onload.push(sh_load_js_onload);

	// Load the XRegExp.js script
    if (msos.config.debug_script) { xp_uri = 'v300.uc.js'; }
	xp_load_js.load('xregexp_js', msos.resource_url('xregexp', xp_uri), 'js');

    msos.console.debug(temp_sl + 'done!');
};

// Go ahead and run this now
msos.syntaxhighlighter.loader();