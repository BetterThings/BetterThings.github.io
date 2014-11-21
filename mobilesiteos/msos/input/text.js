// Copyright Notice:
//				input/text.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile 'text input' helper functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.input.text");
msos.require("msos.common");

msos.input.text.version = new msos.set_version(13, 11, 6);


// --------------------------
// Input event bundling functions
// --------------------------
msos.input.text.set_event = function (tool_obj, input_array, add_event, add_function) {
    "use strict";

    var temp_tool = 'msos.input.text.set_event -> ',
        j = 0,
        input_el = null,
        node_name = '',
        temp_text = '',
        inp_val = '';

    msos.console.debug(temp_tool + 'start.');

    for (j = 0; j < input_array.length; j += 1) {

        input_el = input_array[j];
        node_name = input_el.id || input_el.nodeName;
        temp_text = 'failed';

        if (/textarea|text|password/i.test(input_el.type)) {

            // Do some cross browser conditioning of the input field text
            inp_val = input_el.value;
            input_el.value = jQuery.trim(inp_val);

            jQuery(input_el).mousedown(

            function (evt) {
                tool_obj.tool_target = null;
                tool_obj.tool_iframe = null;
                if (msos.debug) {
                    msos.debug.event(evt, "\nmousedown - " + input_el.type);
                }
                return true;
            });

            jQuery(input_el).mouseup(

            function (evt) {
                tool_obj.tool_target = evt.target;
                tool_obj.tool_iframe = null;
                if (msos.debug) {
                    msos.debug.event(evt, "\nmouseup - " + input_el.type + ":\ntool target -> " + evt.target.nodeName);
                }
                return true;
            });

            temp_text = 'added';

            if (add_event && add_function && typeof add_function === 'function') {
                jQuery(input_el).bind(add_event, add_function);
                temp_text += ' with additional event: ' + add_event;
            }
        }
        if (msos.config.verbose) {
            msos.console.debug(temp_tool + node_name + ', input_array[' + j + '] ' + temp_text);
        }
    }
    msos.console.debug(temp_tool + 'done, for ' + input_array.length + ' input elements.');
};