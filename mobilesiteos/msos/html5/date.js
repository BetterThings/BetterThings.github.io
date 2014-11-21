// Copyright Notice:
//				html5/date.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile HTML5 form date widget replacement

/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("msos.html5.date");
msos.require("msos.common");
msos.require("msos.calendar");
msos.require("msos.intl");

msos.html5.date.version = new msos.set_version(14, 3, 13);


(function ($) {
	"use strict";

	var temp_dt = 'msos.html5.date -> ',
		count = 0;

	$.fn.html5_date = function () {

		var input_array = this,
			calendar_object = msos.calendar.get_tool(),
			valid_min_max = function (mm_date) {
				var date_arry = [],
					num_mons = msos.intl.culture.calendar.months.names[12] ? 13 : 12;

				if (!mm_date
				 || !mm_date.split
				 || !mm_date.match(/\d{4}-\d{1,2}-\d{1,2}/)) {
					msos.console.error(temp_dt + 'invalid html5 min/max date format: ' + mm_date);
					return false;
				}

				date_arry = mm_date.split(/\u002D/);

				if (date_arry.length !== 3) {
					msos.console.error(temp_dt + 'invalid html5 min/max for date only: ' + mm_date);
					return false;
				}

				if (date_arry[1] > num_mons || date_arry[2] > 31){
					msos.console.error(temp_dt + 'invalid html5 min/max month: ' + date_arry[1] + ', or day: ' + date_arry[2] + ' count.');
					return false;
				}

				return true;
			},
			j = 0,
			in_elm,
			$in_elm,
			in_elm_min,
			in_elm_max,
			button_config = null,
			calendar_button = null,
			val = '',
			in_width = '';

		if (msos.config.force_shim.inputs.date || !Modernizr.inputtypes.date) {

			button_config = {
				btn_title:		calendar_object.i18n.button_title,
				icon_class:		'btn btn-primary fa fa-calendar',
				btn_class:		'html5_date_btn',
				btn_onclick:	null
			};

			for (j = 0; j < input_array.length; j += 1) {

				count += 1;

				 in_elm = input_array[j];
				$in_elm = jQuery(in_elm);

				// Note: Upper most and/or lower most "global" calendar tool dates are set in msos.calendar.config
				// calendar_object.cal_top_date = new Date(2015, 0, 1);	// Set upper
				// calendar_object.cal_bot_date = new Date(2006, 0, 1);	// Set lower	(year, month index, day)

				in_elm_min = in_elm.min || $in_elm.attr('min') || '';
				in_elm_max = in_elm.max || $in_elm.attr('max') || '';

				// Override with HTML5 min/max dates in msos.calendar, if specified.
				if (in_elm_min && valid_min_max(in_elm_min)) {
					in_elm.min_date = new Date(in_elm_min);
					if (msos.config.verbose) {
						msos.console.debug(temp_dt + 'min date: ' + in_elm.min_date);
					}
				}
				if (in_elm_max && valid_min_max(in_elm_max)) {
					in_elm.max_date = new Date(in_elm_max);
					if (msos.config.verbose) {
						msos.console.debug(temp_dt + 'max date: ' + in_elm.max_date);
					}
				}

				// Register this input as a 'date' input
				calendar_object.cal_register_input(in_elm);

				// Create a "Calendar" button for this input
				calendar_button = new msos.common.generate_button(in_elm.parentNode);

				if (!in_elm.id) { in_elm.id = 'html5_date_ipt_' + count; }

				button_config.btn_onclick = function () {
					// Set current target to this input
					calendar_object.tool_target = in_elm;
					calendar_object.cal_button_click();
				};

				// Add button configuration
				for (val in button_config) {
					calendar_button[val] = button_config[val];
				}

				calendar_button.generate_icon_button();

				in_width = $in_elm.css('width');
				in_elm.type = 'text';
				$in_elm.width(in_width);
			}
		}
	};

	// Add MSOS DOM tracking
	msos.dom_tracking('html5_date');

}(jQuery));