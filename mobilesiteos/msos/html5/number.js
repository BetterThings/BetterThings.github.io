// Copyright Notice:
//				html5/number.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile HTML5 form numbers spinner widget replacement

/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("msos.html5.number");
msos.require("msos.numberctrl");

msos.html5.number.version = new msos.set_version(14, 3, 13);


(function ($) {
	"use strict";

	var count = 0;

	$.fn.html5_number = function () {

		var input_array = this,
			num_ctrls = [],
			j = 0,
			in_elm,
			$in_elm;

		if (msos.config.force_shim.inputs.number || !Modernizr.inputtypes.number) {

			for (j = 0; j < input_array.length; j += 1) {

				count += 1;

				 in_elm = input_array[j];
				$in_elm = $(in_elm);

				num_ctrls[j] = new msos.numberctrl.tool(in_elm);
				num_ctrls[j].num_min_val = parseInt($in_elm.attr('min'),  10) || 0;
				num_ctrls[j].num_max_val = parseInt($in_elm.attr('max'),  10) || 99;
				num_ctrls[j].num_stp_val = parseInt($in_elm.attr('step'), 10) || 1;
				num_ctrls[j].num_ctrl_id = in_elm.id || 'html5_number_' + count;

				// Change input to type='text'
				in_elm.type = 'text';
				$in_elm.addClass('number');

				num_ctrls[j].generate_num_ctrl();
			}
		}
	};

	// Add MSOS DOM tracking
	msos.dom_tracking('html5_number');

}(jQuery));
