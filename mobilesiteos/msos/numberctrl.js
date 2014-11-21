// Copyright Notice:
//					numberctrl.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile numeric input control

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.numberctrl");
msos.require("msos.common");
msos.require("jquery.tools.mousewheel");

msos.numberctrl.version = new msos.set_version(13, 11, 23);


msos.numberctrl.tool = function (input_el) {
    "use strict";

    var temp_name = 'msos.numberctrl.tool',
        debug = msos.config.verbose,
		$input_el = jQuery(input_el),
        num_obj = this;

    this.num_max_val = 999;
    this.num_min_val = 0;
    this.num_stp_val = 1;
    this.num_start_val = parseInt(input_el.value, 10) || 0;
    this.num_err_msg = '???';
    this.num_ctrl_id = 'number_ctrl';
    this.num_allow_blank = true;
    this.num_container = null;
    this.num_button_up = null;
    this.num_button_dn = null;
	// Dumby function
    this.after_change_function = function (nc_obj) {
        if (nc_obj) { return true; }
        return false;
    };

    this.generate_container_div = function () {
        var container_div = document.createElement("div"),
            z_index = input_el.style.zIndex || input_el.parentNode.style.zIndex || 0;

        z_index += 1;
        container_div.style.zIndex = z_index;
		container_div.className = 'html5_num_ctrl';

		jQuery(container_div).insertAfter(input_el);

        return container_div;
    };

    this.generate_num_ctrl = function () {
        var num_but_up, num_but_dn;

        if (debug) {
            msos.console.debug(temp_name + ' - generate_num_ctrl -> start!');
        }
        num_obj.num_container = num_obj.generate_container_div();

        // Increase input field
        num_but_up = new msos.common.generate_button(num_obj.num_container);

		num_but_up.icon_class = 'btn btn-primary fa fa-plus';

        num_but_up.btn_title = '+1';
        num_but_up.btn_id = num_obj.num_ctrl_id + '_up';
        num_but_up.btn_mouseup = num_obj.increase;

        num_but_up.generate_icon_button();

        // Decrease input field
        num_but_dn = new msos.common.generate_button(num_obj.num_container);

        num_but_dn.icon_class = 'btn btn-primary fa fa-minus';

        num_but_dn.btn_title = '-1';
        num_but_dn.btn_id = num_obj.num_ctrl_id + '_down';
        num_but_dn.btn_mouseup = num_obj.decrease;

        num_but_dn.generate_icon_button();

        num_obj.num_button_up = num_but_up;
        num_obj.num_button_dn = num_but_dn;

        input_el.num_input_obj = num_obj;

		// Bind events to input:text
        $input_el.keydown(num_obj.num_onkeypress);
        $input_el.blur(num_obj.num_onblur);
		$input_el.mousewheel(
			function (evt, delta) {
				delta = delta * num_obj.num_stp_val;
				delta = parseInt(delta, 10);
				num_obj.num_set_value(delta);
				return false;
			}
		);

        if (debug) {
            msos.console.debug(temp_name + " - generate_num_ctrl -> end num. ctrl: " + num_obj.num_ctrl_id + ", z-index -> " + num_obj.num_container.style.zIndex);
        }
    };

    this.increase = function () {
        num_obj.num_set_value(num_obj.num_stp_val);
    };
    this.decrease = function () {
        num_obj.num_set_value(-1 * num_obj.num_stp_val);
    };
    this.num_onblur = function () {
        num_obj.num_set_value();
    };

    this.num_set_value = function (delta) {
        var flag_select = false,
            flag_focus = delta ? true : false,
            // no delta for on_blur so no focus at end
            in_value = 0,
			def_value = parseInt(input_el.value, 10) || null,
			in_value = def_value || 0;

        if (debug) {
            msos.console.debug(temp_name + ' - num_set_value -> input value: ' + in_value + ', delta: ' + delta);
        }

        // Several special cases
        switch (input_el.value) {
        case '+':
        case '-':
            if (delta) {
                input_el.value = num_obj.compare_high_low(0 + delta);
            }
            break;
        case '':
            if (delta) {
                input_el.value = num_obj.compare_high_low(0 + delta);
            } else if (!num_obj.num_allow_blank) {
                input_el.value = num_obj.num_start_val;
            }
            break;
        case '0':
        case '-0':
        case '+0':
            if (delta) {
                input_el.value = num_obj.compare_high_low(0 + delta);
            } else {
                input_el.value = num_obj.compare_high_low(0);
            }
			if (input_el.value !== 0) {
                setTimeout(num_obj.after_change_function, 150);
            }
            break;
        case num_obj.num_err_msg:
            if (delta) {
                input_el.value = num_obj.compare_high_low(0 + delta);
            } else {
                flag_select = true;
            }
            break;
        default:
            if (!def_value) {
                input_el.value = num_obj.num_err_msg;
                flag_select = true;
            } else {
                if (delta) {
                    def_value = def_value + delta;
                }
                def_value = num_obj.compare_high_low(def_value);
                if (input_el.value !== def_value) {
                    input_el.value = def_value;
                    setTimeout(num_obj.after_change_function, 150);
                }
            }
        }

        if (flag_select) {
            input_el.select();
        } else if (flag_focus && !msos.config.mobile) {
            input_el.focus();
        }

		// Fire 'onchange' event, since the value was updated
		if (in_value !== input_el.value) { jQuery(input_el).trigger('change'); }
    };

    this.num_onkeypress = function (evt) {
        var key = '',
            key_char = '',
            debug_txt = '';

        if (evt.keyCode) {
            key = evt.keyCode;
        } else if (evt.which) {
            key = evt.which;
        }
        key_char = String.fromCharCode(key) || '';

        debug_txt = temp_name + ' - num_onkeypress -> ' + key + ' (' + key_char + ')';

        // Don't allow these
        if (key >= 65) {
            input_el.value = num_obj.num_err_msg;
            setTimeout(num_obj.num_onblur, 250);
            msos.console.debug(debug_txt + ' not allowed!');
            return false;
        } else {
			if (msos.config.verbose) { msos.console.debug(debug_txt); }
		}
        switch (key) {
        case null:
        case 0:
        case 8:
            // backspace
        case 46:
            // delete
            setTimeout(num_obj.num_onblur, 250);
            return true;
        case 43:
            // plus
        case 45:
            // minus
            setTimeout(num_obj.num_onblur, 250);
            return true;
        case 40:
            //down arrow
            num_obj.num_set_value(-1); // Don't need timeout since value is set in 'num_set_value'
            return true;
        case 38:
            //up arrow
            num_obj.num_set_value(1);
            return true;
        }
        if (/^\d$/.test(key_char)) {
            setTimeout(num_obj.num_onblur, 250); // Use 'num_onblur' so no delta is passed in to 'num_set_value'
            return true;
        }
        else {
            input_el.value = num_obj.num_err_msg;
            setTimeout(num_obj.num_onblur, 250);
            msos.console.debug(debug_txt + ' not an integer!');
            return false;
        }
    };

    this.compare_high_low = function (check_val) {
        if (check_val < num_obj.num_min_val) {
            check_val = num_obj.num_min_val;
        }
        if (check_val > num_obj.num_max_val) {
            check_val = num_obj.num_max_val;
        }
        return check_val;
    };

};