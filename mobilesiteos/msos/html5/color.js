// Copyright Notice:
//				html5/color.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile HTML5 form colorpicker replacement widget

/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("msos.html5.color");
msos.require("msos.colortool");

msos.html5.color.version = new msos.set_version(14, 3, 13);


(function ($) {
	"use strict";

	var count = 0;

	$.fn.html5_color = function () {

		var input_array = this,
			colortool_object = msos.colortool.get_tool(),
			j = 0,
			in_elm,
			$in_elm,
			in_width = '';

		if (msos.config.force_shim.inputs.color || !Modernizr.inputtypes.color) {

			for (j = 0; j < input_array.length; j += 1) {

				 in_elm = input_array[j];
				$in_elm = jQuery(in_elm);

				// Register this input as a 'color' input
				colortool_object.ct_register_input(in_elm);

				if (!in_elm.id) { in_elm.id = 'html5_color_' + count; }

				in_elm.type = 'text';
				$in_elm.addClass('color');
			}
		}
	};

	// Add MSOS DOM tracking
	msos.dom_tracking('html5_color');

}(jQuery));

