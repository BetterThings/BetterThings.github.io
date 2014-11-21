// Copyright Notice:
//				    colortool.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile colortool div main object functions

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("msos.colortool");
msos.require("msos.colortool.calc");
msos.require("msos.i18n.colortool");
msos.require("msos.common");
msos.require("msos.popdiv");
msos.require("msos.html5.number");
msos.require("msos.input.text");

msos.template("msos.colortool.widget");

msos.colortool.version = new msos.set_version(14, 3, 16);


// Start by loading our colortool specific stylesheet
msos.colortool.css = new msos.loader();
msos.colortool.css.load('pop_colortool_css', msos.resource_url('css', 'pop_colortool.css'));

// Use msos.i18n and not Google Web Translate
msos.config.google.no_translate.by_id.push('#colortool_container');

msos.colortool.create_tool = function (options_hash) {
    "use strict";

    var temp_tool = 'msos.colortool.create_tool',
        ct_name = 'msos_colortool',
        colortool_obj = this,
        default_after_change = function () {
            msos.console.debug(' <== Fired default after_change. Assign specfic to [ct_object].after_change ==> ');
        };

    msos.console.debug(temp_tool + ' => start.');

    // Create our standard 'tool' parameters
    this.tool_name = ct_name;
    this.tool_target = null;
    this.tool_iframe = null;
    this.tool_created = false;
    this.tool_on_success = [];
    this.tool_on_complete = [];
    this.tool_load_url = '';
    this.tool_loaded_url = '';
    this.tool_popup = new msos.popdiv.create_tool(
        ct_name, // Tracking cookie name
        '_clt', // Extension used for 'css/size/' file specification
        msos.resource_url('css', 'size'),
        msos.byid('colortool_container'),
        msos.byid('colortool_header'),
        msos.byid('colortool_close'),
        msos.byid('colortool_display'),
        {
            of: jQuery('#body'),
            my: 'left top',
            at: 'left+20 top+120',
            collision: 'none'
        },                          // Popup position relative to window
        msos.i18n.colortool.bundle, // Use colortool i18n instead of std. popup div i18n
        'small'                     // Fixed popup size (colortool doesn't have sizing capability)
    );

    // Add our specific paramenters
    this.tool_calc = null;
    this.ct_color_default = '000000';
    this.ct_color_valid = true;
    this.ct_color_previous = {};

    this.colortool_add_buttons = true;
    this.colortool_close_on_use = true;

    this.i18n = msos.i18n.colortool.bundle;
    this.after_change = {};

    // Std. start button configuration...
    this.colortool_button_cfg = {
        btn_title: colortool_obj.i18n.button_title,
        icon_class: 'btn fa fa-tint'
    };

    // --------------------------
    // Colortool button function
    // --------------------------
    this.ct_button_onclick = function (evt) {

        var target = evt.target,
            temp_bt = temp_tool + ' - ct_button_onclick -> ',
            input_elm = jQuery('#' + target.input_id)[0];

        msos.console.debug(temp_bt + 'called, for input: ' + target.input_id);

        // Set corresponding input as current target
        if (input_elm) {
            colortool_obj.tool_target = input_elm;
            colortool_obj.ct_toggle();
        } else {
            msos.console.warn(temp_bt + 'failed, no target!');
            colortool_obj.tool_target = null;
        }
    };

    // --------------------------
    // Colortool input functions
    // --------------------------
    this.ct_input_ondblclick = function (evt) {

        if (colortool_obj.tool_target && evt.type === 'dblclick') {
            colortool_obj.ct_toggle();
        }
    };

    this.ct_input_onblur = function (evt) {
        var target = evt.target || null;

        msos.console.debug(temp_tool + ' - ct_input_onblur -> called, for: ' + target.id);

        if (target) {
            // Check the inputed color
            colortool_obj.ct_get_color(target);

            // If not valid, allow mouseup/down/click to end, then open colortool
            if (!colortool_obj.ct_color_valid) {
                setTimeout(

                function () {
                    // Revert back to the last valid color
                    target.value = '#' + colortool_obj.ct_color_previous[target.id];
                    // Don't focus if touch device (no soft keyboard)
                    if (!msos.config.browser.touch) { target.focus(); }
                    colortool_obj.tool_target = target;
                    colortool_obj.ct_toggle();
                }, 200);
            }
        }
    };

    // --------------------------
    // Colortool toggle function
    // --------------------------
    this.ct_toggle = function () {

        var temp_tg = temp_tool + ' - ct_toggle -> ',
            action = '';

        msos.console.debug(temp_tg + 'start.');

        colortool_obj.ct_get_color();

        // Toggle display of colortool
        if (colortool_obj.tool_popup.visibile) {
            colortool_obj.tool_popup.hide_popdiv();
            action = 'hide';
        } else {
            colortool_obj.tool_popup.display_popdiv();
            action = 'display';
        }
        msos.console.debug(temp_tg + 'done, popup: ' + action);
    };

    this.popup_action = function () {

        var inp_param = { ct_hex_inp: colortool_obj.tool_target.value },
            out_param = {},
            field = '',
            validate_func = function (field_name, o_parm_obj) {
                var inp_elm = msos.byid(field_name);
                o_parm_obj[field_name] = inp_elm.value || '';
            };

        for (field in inp_param) {
            validate_func(field, out_param);
        }

        for (field in colortool_obj.inp_param) {
            if (inp_param[field] === out_param[field]) { out_param[field] = ''; }
        }

        colortool_obj.ct_out_action(out_param);
    };

    this.ct_get_color = function (in_el) {

        var temp_ctg = temp_tool + ' - ct_get_color -> ',
            ct_tar_elm = in_el || colortool_obj.tool_target,
            ct_but_elm = jQuery('#' + ct_tar_elm.button_id)[0],
            ct_got_color, hex = '';

        msos.console.debug(temp_ctg + 'start, initial: ' + (ct_tar_elm.value || 'na') + ', for : ' + ct_tar_elm.id);

        // Reset each time we try...
        colortool_obj.ct_color_valid = true;

        hex = msos.colortool.check_hex_color(ct_tar_elm.value);

        if (hex === false) {
            ct_tar_elm.value = '#' + colortool_obj.ct_color_default;
            ct_got_color = colortool_obj.ct_color_default;
            colortool_obj.ct_color_valid = false; // flag we set color to default
        } else {
            ct_tar_elm.value = '#' + hex;
            ct_got_color = hex;
            // Set to use as "previous" valid color
            colortool_obj.ct_color_previous[ct_tar_elm.id] = hex;
        }

        // Set the current valid color to 'previous'
        // Set colortool controls to this 'ct_got_color' (if tool has been created)
        if (colortool_obj.tool_calc) {
            colortool_obj.tool_calc.hex_set_color(ct_got_color);
        }

        // Change indicator
        if (ct_but_elm && ct_got_color) {
            jQuery(ct_but_elm).css('background-color', '#' + ct_got_color);
        }

        msos.console.debug(temp_ctg + 'done, final: ' + ct_tar_elm.value);
    };

    this.ct_in_action = function () {
        msos.console.debug(temp_tool + ' - ct_in_action -> start.');

        // 'ct_get_color' starts the 'colortool_calc' function to set displays
        colortool_obj.ct_get_color();

        msos.console.debug(temp_tool + ' - ct_in_action -> done!');
    };

    this.ct_out_action = function (output_obj) {
        var temp_cto = temp_tool + ' - ct_out_action -> ',
            ct_tar_elm = colortool_obj.tool_target,
            ct_but_elm = jQuery('#' + ct_tar_elm.button_id)[0];

        if (msos.config.verbose) {
            msos.console.debug(temp_cto + 'start, output: ', output_obj);
        } else {
            msos.console.debug(temp_cto + 'start, for: ' + ct_tar_elm.id);
        }

        // Check output (undefined if no change)
        if (output_obj.ct_hex_inp) {

            // Set the input field to new value and update ct_color_previous
            ct_tar_elm.value = output_obj.ct_hex_inp;
            colortool_obj.ct_color_previous[ct_tar_elm.id] = output_obj.ct_hex_inp.substr(1);

            if (ct_but_elm) {
                jQuery(ct_but_elm).css('background-color', output_obj.ct_hex_inp);
            }

            if (colortool_obj.colortool_close_on_use) {
                colortool_obj.tool_popup.hide_popdiv();
            }

            if (colortool_obj.after_change[ct_tar_elm.id]
             && typeof colortool_obj.after_change[ct_tar_elm.id] === 'function') {
                colortool_obj.after_change[ct_tar_elm.id]();
            } else {
                msos.console.error(temp_cto + 'after_change failed for: ' + ct_tar_elm.id);
              }
        } else {
            msos.console.debug(temp_cto + 'no change!');
        }
        msos.console.debug(temp_cto + 'done!');
        return true;
    };

    this.ct_register_input = function (input_elm) {
        var button_obj,
            button_elm,
            button_cfg = colortool_obj.colortool_button_cfg,
            val = '';

        // Build a hash with a default 'after_change' action
        colortool_obj.after_change[input_elm.id] = default_after_change;

        // Build a hash with the previously valid color for a given input (default for now)
        colortool_obj.ct_color_previous[input_elm.id] = colortool_obj.ct_color_default;

        if (colortool_obj.colortool_add_buttons) {
            // Create a new start button
            button_obj = new msos.common.generate_button(input_elm.parentNode);

            // Add button configuration
            for (val in button_cfg) {
                button_obj[val] = button_cfg[val];
            }

            // Add button click events
            button_obj.btn_onclick = colortool_obj.ct_button_onclick;

            // Add button to page
            button_obj.generate_icon_button();

            // Add input and button identifiers
            button_elm = button_obj.btn_elm;

            button_elm.input_id = input_elm.id;
            input_elm.button_id = button_elm.id;

            // Add std colortool button class
            jQuery(button_elm).addClass('html5_color_btn');
        }

        // Add blur and dblclick events
        jQuery(input_elm).bind('dblclick', colortool_obj.ct_input_ondblclick);
        jQuery(input_elm).bind('blur', colortool_obj.ct_input_onblur);

        // Set indicator colors (if option is true)
        colortool_obj.ct_get_color(input_elm);

        // Add our std 'onmousedown/up' text input events for colortool inputs
        msos.input.text.set_event(colortool_obj, [input_elm]);
    };

    // Extend our object with option settings
    _.extend(colortool_obj, options_hash);

    // Use colortool i18n instead of popdiv
    colortool_obj.tool_popup.i18n = colortool_obj.i18n;

    // Add our template html to popup
    jQuery(colortool_obj.tool_popup.display).html(msos.colortool.widget.text);

    // Acknowledge that div is filled
    colortool_obj.tool_popup.filled = true;

    // Add our HTML5 replacement number control
    jQuery(colortool_obj.tool_popup.container).find('input[type=number]').html5_number();

    // Add new colortool_calc object into base tool
    colortool_obj.tool_calc = new msos.colortool.calc.generate_colortool(colortool_obj);

    colortool_obj.tool_calc.start_colortool();

    msos.console.debug(temp_tool + ' => done!');
};

msos.colortool.check_hex_color = function (hex) {
    "use strict";

    var i = 0,
        chars = '0123456789ABCDEF',
        out = '',
        schar;

    if (msos.var_is_empty(hex)) {
        return false;
    }

    hex = hex.toString();

    if (hex.length === 7) {
        hex = hex.substr(1);
    }
    if (hex.length !== 6) {
        return false;
    }

    hex = hex.toUpperCase();

    for (i = 0; i < hex.length; i += 1) {
        schar = hex.charAt(i);
        if (chars.indexOf(schar) !== -1) {
            out += schar;
        }
    }

    if (out.length !== 6) {
        return false;
    }
    return out;
};

msos.colortool.add_to_page = function () {
    "use strict";

    var container = jQuery(
            '<div id="colortool_container" class="msos_popup">'
          +     '<div id="colortool_header" class="header_popup">'
          +         '<button id="colortool_close" class="btn btn-small btn-danger fa fa-times"></button>'
          +     '</div>'
          +     '<div id="colortool_display"></div>'
          + '</div>'
        ),
        ct_obj;

    jQuery('body').append(container);

    // Now create colortool
    ct_obj = new msos.colortool.create_tool();

    // Register tool object
    msos.popdiv.register_tool(ct_obj);

    // Set body onclick event
    jQuery('#body').click(ct_obj.tool_popup.popup_auto_hide);

    ct_obj.tool_created = true;
};

msos.colortool.get_tool = function () {
    "use strict";

    if (!msos.registered_tools.msos_colortool) { msos.colortool.add_to_page(); }

    return msos.registered_tools.msos_colortool.base;
};