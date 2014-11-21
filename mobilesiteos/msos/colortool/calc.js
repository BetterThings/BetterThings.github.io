// Copyright Notice:
//			     colortool/calc.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile colortool calculation functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.colortool.calc");
msos.require("msos.common");
msos.require("msos.position");
msos.require("msos.tab");

msos.colortool.calc.version = new msos.set_version(14, 3, 16);

// --------------------------
// Helper Functions
// --------------------------
msos.colortool.calc.polar = function (x, y) {
    "use strict";

    var qx = (x < 0) ? 0 : 1,
        qy = (y < 0) ? 0 : 1,
        q_idx = 2 * qy + qx,
        quadrant = [180, 360, 180, 0],
        polar = {
            r: 0,
            theta: 0
        };

    polar.r = Math.floor(Math.pow((Math.pow(x, 2) + Math.pow(y, 2)), 0.5));
    polar.theta = quadrant[q_idx] + Math.floor(Math.atan(y / x) * 360 / 2 / Math.PI);
    return polar;
};

msos.colortool.calc.hsv2rgb = function (Hdeg, S, V) {
    "use strict";

    var R = 255,
        G = 255,
        B = 255,
        H = Hdeg / 360,
        var_h = 0,
        var_i = 0,
        var_1 = 0,
        var_2 = 0,
        var_3 = 0,
        var_r = 0,
        var_g = 0,
        var_b = 0;

    if (S === 0) {
        R *= V;
        G *= V;
        B *= V;
    }
    else {
        var_h = H * 6;
        var_i = Math.floor(var_h);
        var_1 = V * (1 - S);
        var_2 = V * (1 - S * (var_h - var_i));
        var_3 = V * (1 - S * (1 - (var_h - var_i)));

        if (var_i === 0) {
            var_r = V;
            var_g = var_3;
            var_b = var_1;
        }
        else if (var_i === 1) {
            var_r = var_2;
            var_g = V;
            var_b = var_1;
        }
        else if (var_i === 2) {
            var_r = var_1;
            var_g = V;
            var_b = var_3;
        }
        else if (var_i === 3) {
            var_r = var_1;
            var_g = var_2;
            var_b = V;
        }
        else if (var_i === 4) {
            var_r = var_3;
            var_g = var_1;
            var_b = V;
        }
        else {
            var_r = V;
            var_g = var_1;
            var_b = var_2;
        }

        R = var_r * 255;
        G = var_g * 255;
        B = var_b * 255;
    }
    return [Math.round(R), Math.round(G), Math.round(B)];
};

msos.colortool.calc.wheel_color = function (x, y) {
    "use strict";

    var pol = msos.colortool.calc.polar(x, y),
        sat = 0,
        val = 0,
        rgb = [0, 0, 0],
        norm_r = 0;

    if (pol.r === 0) {
        return rgb;
    }
    else {
        norm_r = pol.r / 80;
        if (norm_r > 1) { // outside color wheel
            rgb = [255, 255, 255];
            sat = 1;
            val = 1;
        }
        else if (norm_r >= 0.5) {
            sat = 1 - ((norm_r - 0.5) * 2);
            val = 1;
            rgb = msos.colortool.calc.hsv2rgb(pol.theta, sat, val);
        }
        else {
            sat = 1;
            val = norm_r * 2;
            rgb = msos.colortool.calc.hsv2rgb(pol.theta, sat, val);
        }
    }
    return rgb;
};

msos.colortool.calc.cartesian = function (r, theta) {
    "use strict";

    var cartesian = {
        x: 0,
        y: 0
    };

    cartesian.x = Math.floor(r * Math.cos(theta * 2 * Math.PI / 360));
    cartesian.y = Math.floor(r * Math.sin(theta * 2 * Math.PI / 360));
    return cartesian;
};

msos.colortool.calc.rgb2hsv = function (red, green, blue) {
    "use strict";

    red = red / 255;
    green = green / 255;
    blue = blue / 255;

    var myMax = Math.max(red, Math.max(green, blue)),
        myMin = Math.min(red, Math.min(green, blue)),
        myDiff = 0,
        rc = 0,
        gc = 0,
        bc = 0,
        h = 0,
        s = 0;

    if (myMax > 0) {
        s = (myMax - myMin) / myMax;
    }
    else {
        s = 0;
    }

    if (s > 0) {
        myDiff = myMax - myMin;
        rc = (myMax - red) / myDiff;
        gc = (myMax - green) / myDiff;
        bc = (myMax - blue) / myDiff;

        if (red === myMax) {
            h = (bc - gc) / 6;
        }
        if (green === myMax) {
            h = (2 + rc - bc) / 6;
        }
        if (blue === myMax) {
            h = (4 + gc - rc) / 6;
        }
    }
    else {
        h = 0;
    }
    if (h < 0) {
        h += 1;
    }
    return {
        'hue': Math.round(h * 360),
        'sat': s,
        'val': myMax
    };
};

msos.colortool.calc.toggle_dark_light = function (hexcolor) {
    "use strict";

    var overall = 0,
        digit1 = hexcolor.substr(0, 1),
        digit2 = hexcolor.substr(2, 1),
        digit3 = hexcolor.substr(4, 1);

    digit1 = msos.common.hex_eq_dec(digit1);
    digit2 = msos.common.hex_eq_dec(digit2);
    digit3 = msos.common.hex_eq_dec(digit3);

    digit1 = parseInt(digit1, 10);
    digit2 = parseInt(digit2, 10);
    digit3 = parseInt(digit3, 10);

    overall = digit1 + digit2 + digit3;
    if (overall < 13) {
        return true;
    }
    return false;
};

msos.colortool.calc.hex_to_rgb_array = function (hex_string) {
    "use strict";

    if (typeof hex_string === 'undefined') {
        return [255, 255, 255];
    }

    var r = msos.common.hex_to_dec(hex_string.substr(0, 2)),
        g = msos.common.hex_to_dec(hex_string.substr(2, 2)),
        b = msos.common.hex_to_dec(hex_string.substr(4, 2));

    return [r, g, b];
};

msos.colortool.calc.rgb_to_hex = function (rgb) {
    "use strict";

    if (typeof rgb === 'undefined') {
        return 'FFFFFF';
    }
    return String(msos.common.dec_to_hex(rgb[0])) + String(msos.common.dec_to_hex(rgb[1])) + String(msos.common.dec_to_hex(rgb[2]));
};


// --------------------------
// Main Tool Functions
// --------------------------
msos.colortool.calc.generate_colortool = function (ct_obj) {
    "use strict";

    var temp_name = 'msos.colortool.calc.generate_colortool',
        debug = msos.config.verbose,
        clt_cookie = msos.config.cookie.site_cltl,

        ct_elms = {
            ct_buttons:     msos.byid('ct_buttons'),
            ct_display:     msos.byid('ct_display'),
            ct_wheel_can:   msos.byid('ct_wheel_can'),
            ct_hex_inp:     msos.byid('ct_hex_inp'),
            ct_tabs_div:    msos.byid('ct_tabs_div'),
            ct_main_tab:    msos.byid('ct_main_tab'),
            ct_websafe_tab: msos.byid('ct_websafe_tab'),
            ct_saved_tab:   msos.byid('ct_saved_tab'),
            ct_update_main: msos.byid('ct_update_main'),
            ct_save_color:  msos.byid('ct_save_color'),
            ct_use_color:   msos.byid('ct_use_color'),
            ct_web_smart:   msos.byid('ct_web_smart'),
            rgb_r: msos.byid('rgb_r'),
            rgb_g: msos.byid('rgb_g'),
            rgb_b: msos.byid('rgb_b'),
            hsb_h: msos.byid('hsb_h'),
            hsb_s: msos.byid('hsb_s'),
            hsb_v: msos.byid('hsb_v'),
            pointer_circle: msos.byid('pointer_circle')
        },
        ctc_obj = this;

    msos.console.debug(temp_name + ' => start.');

    this.select_method = 'Rgb';
    this.saved_color_elm = null;
    this.web_safe_elm = null;
    this.pointer_offset = 3; // Compensate for image placement relative to center
    this.bg_indicator_color = '';
    this.bg_input_color = '';

    this.but_style_prs = 'button_press';

    // RGB color arrays
    this.saved_rgb_colors = [];
    this.current_rgb_color = [];

    // Set action to take on 'use' button click
    this.colortool_action = function () {
        msos.console.debug(' <== Fired colortool_action function ==> ');
    };

    // Set some language specific text
    ct_elms.ct_wheel_can.title = ct_obj.i18n.ct_wheel_can;
    ct_elms.rgb_r.title = ct_obj.i18n.rgb_r + ' (0 - 255)';
    ct_elms.hsb_h.title = ct_obj.i18n.hsb_h + ' (0 - 360)';
    ct_elms.rgb_g.title = ct_obj.i18n.rgb_g + ' (0 - 255)';
    ct_elms.hsb_s.title = ct_obj.i18n.hsb_s + ' (0 - 100)';
    ct_elms.rgb_b.title = ct_obj.i18n.rgb_b + ' (0 - 255)';
    ct_elms.hsb_v.title = ct_obj.i18n.hsb_v + ' (0 - 100)';
    ct_elms.ct_web_smart.title = ct_obj.i18n.ct_web_smart;
    ct_elms.ct_update_main.value = ct_obj.i18n.ct_update_main_value;
    ct_elms.ct_update_main.title = ct_obj.i18n.ct_update_main_title;
    ct_elms.ct_hex_inp.title = ct_obj.i18n.ct_hex_inp;
    ct_elms.ct_save_color.value = ct_obj.i18n.ct_save_color_value;
    ct_elms.ct_save_color.title = ct_obj.i18n.ct_save_color_title;
    ct_elms.ct_save_color.value = ct_obj.i18n.ct_save_color_value;
    ct_elms.ct_save_color.title = ct_obj.i18n.ct_save_color_title;
    ct_elms.ct_use_color.value = ct_obj.i18n.ct_use_color_value;
    ct_elms.ct_use_color.title = ct_obj.i18n.ct_use_color_title;

    this.run_input_update = function (evt) {
        if (ctc_obj.select_method === 'Rgb') {
            ctc_obj.rgb_form_set_color();
        }
        else if (ctc_obj.select_method === 'Hsb') {
            ctc_obj.hsb_form_set_color();
        }
        else if (ctc_obj.select_method === 'Hex') {
            ctc_obj.hex_form_set_color();
        }
        ctc_obj.on_click_but(evt);
        if (debug) {
            msos.console.debug(temp_name + ' - run_input_update -> method: ' + ctc_obj.select_method);
        }
    };

    this.set_hex_input = function (hex_color) {
        hex_color = hex_color.toUpperCase();
        if (msos.colortool.calc.toggle_dark_light(hex_color)) {
            ctc_obj.bg_input_color = 'white';
        }
        else {
            ctc_obj.bg_input_color = 'black';
        }
        ct_elms.ct_hex_inp.style.backgroundColor = '#' + hex_color;
        ct_elms.ct_hex_inp.style.color = ctc_obj.bg_input_color;
        ct_elms.ct_hex_inp.value = '#' + hex_color;
    };

    this.set_display = function (dis_color) {
        dis_color = dis_color.toUpperCase();
        if (msos.colortool.calc.toggle_dark_light(dis_color)) {
            ctc_obj.bg_indicator_color = 'white';
        }
        else {
            ctc_obj.bg_indicator_color = 'black';
        }
        ct_elms.ct_display.style.backgroundColor = '#' + dis_color;
        ct_elms.ct_display.style.color = ctc_obj.bg_indicator_color;
        ct_elms.ct_display.innerHTML = '#' + dis_color;

        // Final step - update msos.colortool object for color
        ct_obj.ct_color = dis_color;
    };

    this.clear_saved_colors = function (evt) {
        msos.do_nothing(evt);
        ctc_obj.saved_rgb_colors = [];
        msos.cookie(clt_cookie.name, null);
        clt_cookie.set = false;
        ctc_obj.display_saved_colors();
        if (msos.debug) {
            msos.debug.event(evt, "\n" + temp_name + " - clear_saved_colors");
        }
        return false;
    };

    this.clear_pointer = function () {
        ct_elms.pointer_circle.style.display = 'none';
    };

    this.safe_tab_reset = function () {
        if (ctc_obj.web_safe_elm) {
            ctc_obj.web_safe_elm.style.border = '1px inset';
            ctc_obj.web_safe_elm.style.cursor = 'crosshair';
        }
    };

    this.set_pointer = function () {
        var color = msos.colortool.calc.rgb_to_hex(ctc_obj.current_rgb_color),
            coord = ctc_obj.get_pointer_coordinates();

            ct_elms.pointer_circle.style.left = coord.x + 'px';
            ct_elms.pointer_circle.style.top = coord.y + 'px';
            ct_elms.pointer_circle.style.display = 'inline';

        if (msos.colortool.calc.toggle_dark_light(color)) {
            ct_elms.pointer_circle.style.color = '#FFF';
        } else {
            ct_elms.pointer_circle.style.color = '#000';
        }

        if (debug) {
            msos.console.debug(temp_name + ' - set_pointer -> left:' + coord.x + ', top:' + coord.y);
        }
    };

    this.generate_canvas_display = function () {
        var ct_canvas = ct_elms.ct_wheel_can || null,
            ctx = null,
            ctx_data = null,
            idx = 0,
            x = 0,
            y = 0,
            color = [];

        if (ct_canvas && ct_canvas.getContext && ct_canvas.getContext('2d')) {

            ctx = ct_canvas.getContext('2d');
            ctx_data = ctx.createImageData(160, 160);

            msos.console.debug(temp_name + ' - generate_canvas_display -> start, h: ' + ctx_data.height + ', w: ' + ctx_data.width);

            // Canvas top, left is (0,0) but calc_wheel_color uses polar coordinates
            for (y = -80; y < 80; y += 1) {
                for (x = -80; x < 80; x += 1) {
                    color = msos.colortool.calc.wheel_color(x, y);
                    ctx_data.data[idx] = color[0];
                    idx += 1;
                    ctx_data.data[idx] = color[1];
                    idx += 1;
                    ctx_data.data[idx] = color[2];
                    idx += 1;
                    ctx_data.data[idx] = 255;
                    idx += 1;
                }
            }
            ctx.putImageData(ctx_data, 0, 0);

            msos.console.debug(temp_name + ' - generate_canvas_display -> done!');
        }
        else {
            msos.console.warn(temp_name + ' - generate_canvas_display -> not available!');
        }
    };

    this.update_input_form = function (rgb, hsb) {
        if (debug) {
            msos.console.info(temp_name + ' - update_input_form -> Called!');
        }
        ctc_obj.clear_pointer();

        ct_elms.rgb_r.value = rgb[0];
        ct_elms.rgb_g.value = rgb[1];
        ct_elms.rgb_b.value = rgb[2];
        ct_elms.hsb_h.value = hsb[0];
        ct_elms.hsb_s.value = hsb[1];
        ct_elms.hsb_v.value = hsb[2];

        var hex_color = msos.colortool.calc.rgb_to_hex(rgb);

        ctc_obj.set_hex_input(hex_color);
        ctc_obj.set_display(hex_color);

        ctc_obj.current_rgb_color = rgb;
        ctc_obj.set_pointer();
    };

    this.rgb_form_set_color = function () {
        ctc_obj.rgb_set_color(ct_elms.rgb_r.value, ct_elms.rgb_g.value, ct_elms.rgb_b.value);
    };

    this.hsb_form_set_color = function () {
        ctc_obj.hsb_set_color(ct_elms.hsb_h.value, ct_elms.hsb_s.value, ct_elms.hsb_v.value);
    };

    this.hex_form_set_color = function () {
        var check_color = msos.colortool.check_hex_color(ct_elms.ct_hex_inp.value);
        if (!check_color) {
            if (msos.common.var_is_null(check_color)) {
                ctc_obj.set_hex_input(msos.colortool.calc.rgb_to_hex(ctc_obj.current_rgb_color));
            } else {
                window.alert(check_color + ' - ???');
            }

            if (!msos.config.browser.touch) {
                ct_elms.ct_hex_inp.focus();
            }
            return false;
        }
        ctc_obj.hex_set_color(check_color);
        return true;
    };

    this.hsb_set_color = function (h, s, v) {
        var rgb = msos.colortool.calc.hsv2rgb(h, s / 100, v / 100);
        ctc_obj.update_input_form(rgb, [h, s, v]);
        if (debug) {
            msos.console.debug(temp_name + ' - hsb_set_color -> called update_input_form!');
        }
    };

    this.rgb_set_color = function (r, g, b) {
        var hsb = msos.colortool.calc.rgb2hsv(r, g, b);
        ctc_obj.update_input_form([r, g, b], [parseInt(hsb.hue, 10), parseInt(hsb.sat * 100, 10), parseInt(hsb.val * 100, 10)]);
        if (debug) {
            msos.console.debug(temp_name + ' - rgb_set_color -> called update_input_form!');
        }
    };

    // Use this to set hex input from 'tool_target'
    this.hex_set_color = function (hex) {
        var r = msos.common.hex_to_dec(hex.substr(0, 2)),
            g = msos.common.hex_to_dec(hex.substr(2, 2)),
            b = msos.common.hex_to_dec(hex.substr(4, 2));

        ctc_obj.rgb_set_color(r, g, b);
        if (debug) {
            msos.console.debug(temp_name + ' - hex_set_color -> called rgb_set_color!');
        }
    };

    // --------------------------
    // Event functions
    // --------------------------
    // Add 'visual' click event
    this.on_click_but = function (evt) {
        jQuery(evt.target).addClass(ctc_obj.but_style_prs);
        setTimeout(function () {
            jQuery(evt.target).removeClass(ctc_obj.but_style_prs);
        }, 500);
    };

    this.update_safe_color = function (evt) {
        var tar = evt.target;
        if (ctc_obj.web_safe_elm) {
            ctc_obj.web_safe_elm.style.border = '1px inset';
            ctc_obj.web_safe_elm.style.cursor = 'crosshair';
        }
        ctc_obj.web_safe_elm = tar;
        tar.style.border = '1px outset';
        tar.style.cursor = 'default';
        ctc_obj.hex_set_color(tar.update_color);
        if (msos.debug) {
            msos.debug.event(evt, "\nupdate_safe_color:\nhex -> " + tar.style.backgroundColor);
        }
    };

    this.onclick_saved_colors = function (evt) {
        var tar = evt.target,
            temp_txt = '';

        if (ctc_obj.saved_color_elm) {
            ctc_obj.saved_color_elm.style.border = '2px inset';
            ctc_obj.saved_color_elm.style.cursor = 'crosshair';
        }
        ctc_obj.saved_color_elm = tar;
        tar.style.border = '2px outset';
        tar.style.cursor = 'default';
        ctc_obj.rgb_set_color(tar.r, tar.g, tar.b);
        temp_txt = "\nSaved color click:\nR -> " + tar.r + "\nG -> " + tar.g + "\nB -> " + tar.b;
        if (msos.debug) {
            msos.debug.event(evt, temp_txt);
        }
    };

    this.initiate_tabs = function () {
        // Generate our colortool tabs
        var tab_obj = new msos.tab.tool(ct_elms.ct_tabs_div),
            main_onclick = null,
            main_tab = {},
            safe_tab = {},
            save_tab = {};

        tab_obj.act_tab_style = 'tab_active';
        tab_obj.pas_tab_style = 'tab_passive';
        tab_obj.tab_cookie_name = 'colortool';

        main_onclick = function () {
            tab_obj.go_to_tab();
        };

        // Get the tab index if saved to a cookie
        tab_obj.get_tab_by_cookie();

        main_tab = {
            caption: ct_obj.i18n.ct_txt_6,
            tab_title: ct_obj.i18n.ct_txt_7,
            container: ct_elms.ct_main_tab
        };
        safe_tab = {
            caption: ct_obj.i18n.ct_txt_8,
            tab_title: ct_obj.i18n.ct_txt_9,
            container: ct_elms.ct_websafe_tab
        };
        save_tab = {
            caption: ct_obj.i18n.ct_txt_10,
            tab_title: ct_obj.i18n.ct_txt_11,
            container: ct_elms.ct_saved_tab
        };
        tab_obj.add_tab(main_tab);
        tab_obj.add_tab(safe_tab);
        tab_obj.add_tab(save_tab);

        tab_obj.generate_tabs();

        // Add specific colortool functions for when a tab is clicked
        tab_obj.tab_onclick = function () {
            var num = '';
            if (tab_obj.tab_set_active === 2) {
                ctc_obj.safe_tab_reset();
            }
        };

        msos.console.debug(temp_name + ' - initiate_tabs -> finished');
    };

    this.generate_web_safe = function () {
        msos.console.debug(temp_name + ' - generate_web_safe -> start.');
        var c = ['00', 'CC', '33', '66', '99', 'FF'],
            images_array = [],
            i = 0,
            j = 0,
            k = 0,
            l = '',
            m = 0,
            n = 0,
            color_image = null,
            img_top = 30,
            img_lft = 9,
            new_array = [],
            next_img = null;

        // Generate our image elements
        for (i = 0; i < 6; i += 1) {
            for (j = 0; j < 6; j += 1) {
                for (k = 0; k < 6; k += 1) {

                    // Generate hex color
                    l = c[i] + c[j] + c[k];

                    // Create image for each color
                    color_image = new Image();
                    color_image.src = msos.resource_url('images', 'shim.gif');
                    color_image.className = 'ws_img';
                    color_image.style.backgroundColor = '#' + l;
                    color_image.unselectable = "on";
                    color_image.alt = 'hex ' + l;
                    color_image.title = '#' + l;
                    color_image.update_color = l.toString();
                    jQuery(color_image).click(ctc_obj.update_safe_color);

                    images_array.push(color_image);
                }
            }
        }

        // Now set in the correct widget position
        for (m = 0; m < 18; m += 1) {
            new_array = images_array.splice(0, 12);
            for (n = 0; n < new_array.length; n += 1) {
                next_img = new_array[n];
                next_img.style.position = 'absolute';
                next_img.style.top = img_top + 'px';
                next_img.style.left = img_lft + 'px';
                if (n === 5) {
                    img_lft = img_lft + 5;
                }
                img_lft = img_lft + 14;
                ct_elms.ct_websafe_tab.appendChild(next_img);
            }
            img_top = img_top + 16;
            img_lft = 9;
        }
        msos.console.debug(temp_name + ' - generate_web_safe -> done!');
    };

    this.display_saved_colors = function () {
        msos.console.debug(temp_name + ' - display_saved_colors -> start.');

        var inner_div = document.createElement("div"),
            msg_div = document.createElement("div"),
            clear_button = document.createElement("div"),
            scd = [],
            i = 0,
            clr = '';

        jQuery(ct_elms.ct_saved_tab).empty();

        inner_div.className = 'tab_content_inner';
        msg_div.className = 'ct_saved_msg';

        if (ctc_obj.saved_rgb_colors.length === 0) {
            msg_div.innerHTML = ct_obj.i18n.ct_txt_1;
            inner_div.appendChild(msg_div);
            ct_elms.ct_saved_tab.appendChild(inner_div);
        } else {
            msg_div.innerHTML = ct_obj.i18n.ct_txt_2;
            inner_div.appendChild(msg_div);

            for (i = 0; i < ctc_obj.saved_rgb_colors.length; i += 1) {
                clr = msos.colortool.calc.rgb_to_hex(ctc_obj.saved_rgb_colors[i]);
                clr = clr.toUpperCase();

                scd[i] = document.createElement("div");
                scd[i].r = ctc_obj.saved_rgb_colors[i][0];
                scd[i].g = ctc_obj.saved_rgb_colors[i][1];
                scd[i].b = ctc_obj.saved_rgb_colors[i][2];
                scd[i].className = 'ct_saved_colors';
                scd[i].title = '#' + clr;
                scd[i].style.backgroundColor = '#' + clr;
                scd[i].unselectable = "on";
                if (msos.colortool.calc.toggle_dark_light(clr)) {
                    scd[i].style.color = 'white';
                }

                jQuery(scd[i]).click(ctc_obj.onclick_saved_colors);
                scd[i].innerHTML = ct_obj.i18n.ct_txt_3 + ' ' + scd[i].r + ', ' + scd[i].g + ', ' + scd[i].b;
                inner_div.appendChild(scd[i]);
            }
            // Add a button to clear all entries
            clear_button.className = 'ct_saved_colors';
            clear_button.title = ct_obj.i18n.ct_txt_5;
            clear_button.unselectable = "on";
            clear_button.innerHTML = ct_obj.i18n.ct_txt_4;
            jQuery(clear_button).click(ctc_obj.clear_saved_colors);
            inner_div.appendChild(clear_button);
            ct_elms.ct_saved_tab.appendChild(inner_div);
        }
        msos.console.debug(temp_name + ' - display_saved_colors -> done!');
    };

    this.save_to_cookie = function (evt) {
        var i = 0,
            clr_array = [];

        for (i = 0; i < ctc_obj.saved_rgb_colors.length; i += 1) {
            if ((ctc_obj.saved_rgb_colors[i][0] === ctc_obj.current_rgb_color[0]) && (ctc_obj.saved_rgb_colors[i][1] === ctc_obj.current_rgb_color[1]) && (ctc_obj.saved_rgb_colors[i][2] === ctc_obj.current_rgb_color[2])) {
                return;
            }
        }
        ctc_obj.saved_rgb_colors[ctc_obj.saved_rgb_colors.length] = ctc_obj.current_rgb_color;

        for (i = 0; i < ctc_obj.saved_rgb_colors.length; i += 1) {
            clr_array[clr_array.length] = msos.colortool.calc.rgb_to_hex(ctc_obj.saved_rgb_colors[i]);
        }
        clt_cookie.value = JSON.stringify(clr_array)
        msos.cookie(
            clt_cookie.name,
            clt_cookie.value,
            clt_cookie.params
        );
        clt_cookie.set = true;
        ctc_obj.display_saved_colors();
        ctc_obj.on_click_but(evt);
    };

    this.use_color = function (evt) {
        // Run output action when user clicks 'Use' button
        ct_obj.popup_action();
        ctc_obj.on_click_but(evt);
    };

    this.start_colortool = function () {

        msos.console.debug(temp_name + ' - start_colortool => start.');

        // Store a computed hex value
        var calc_color = '000000',
            saved_cookie = msos.cookie(clt_cookie.name) || '',
            colors_array = saved_cookie ? JSON.parse(saved_cookie) : [],
            j = 0,
            colorwheel_move = null,
            onfocus_hex_inp = null,
            onfocus_rgb_inp = null,
            onfocus_hsb_inp = null,
            use_hover_color = null,
            clear_hover_color = null,
            initial_color = '',
            checked_color = '',
            fire_on = 'keyup change click mousewheel';

        for (j = 0; j < colors_array.length; j += 1) {
            ctc_obj.saved_rgb_colors[ctc_obj.saved_rgb_colors.length] = msos.colortool.calc.hex_to_rgb_array(colors_array[j]);
        }

        colorwheel_move = function (evt) {
            var pos = msos.position.absolute(evt.target, true),
                temp_txt = "Colorwheel Coordinates:\n",
                x = 0,
                y = 0,
                rgb_color = [],
                hex_color = '';

            temp_txt += 'Canvas x:' + pos.x + ', y:' + pos.y + "\n";
            temp_txt += 'Client  x:' + evt.clientX + ', y:' + evt.clientY + "\n";

            // Get x,y coordinates from center of color wheel 
            x = (evt.clientX - pos.x) - 80;
            y = (evt.clientY - pos.y) - 80;

            temp_txt += 'Calc  x:' + x + ', y:' + y;

            rgb_color = msos.colortool.calc.wheel_color(x, y);
            hex_color = msos.colortool.calc.rgb_to_hex(rgb_color);
            if (ct_elms.ct_web_smart.checked) {
                calc_color = hex_color.charAt(0) + hex_color.charAt(0) + hex_color.charAt(2) + hex_color.charAt(2) + hex_color.charAt(4) + hex_color.charAt(4);
            } else {
                calc_color = hex_color;
            }
            ctc_obj.set_hex_input(calc_color);
            if (msos.debug) {
                msos.debug.event(evt, temp_txt);
            }
            return false;
        };

        use_hover_color = function () {
            ctc_obj.hex_set_color(calc_color);
            return false;
        };

        clear_hover_color = function () {
            ctc_obj.set_hex_input(msos.colortool.calc.rgb_to_hex(ctc_obj.current_rgb_color));
            return false;
        };

        jQuery(ct_elms.ct_wheel_can).click(use_hover_color);
        jQuery(ct_elms.ct_wheel_can).mouseout(clear_hover_color);
        jQuery(ct_elms.ct_wheel_can).mousemove(colorwheel_move);

        onfocus_hex_inp = function () {
            ctc_obj.select_method = 'Hex';
        };
        onfocus_rgb_inp = function () {
            ctc_obj.select_method = 'Rgb';
        };
        onfocus_hsb_inp = function () {
            ctc_obj.select_method = 'Hsb';
        };

        jQuery(ct_elms.ct_hex_inp).focus(onfocus_hex_inp);

        jQuery(ct_elms.rgb_r).focus(onfocus_rgb_inp);
        jQuery(ct_elms.rgb_g).focus(onfocus_rgb_inp);
        jQuery(ct_elms.rgb_b).focus(onfocus_rgb_inp);
        jQuery(ct_elms.hsb_h).focus(onfocus_hsb_inp);
        jQuery(ct_elms.hsb_s).focus(onfocus_hsb_inp);
        jQuery(ct_elms.hsb_v).focus(onfocus_hsb_inp);

        // Set initial color
        checked_color = msos.colortool.check_hex_color(ct_elms.ct_hex_inp.value);
        if (checked_color) {
            ctc_obj.hex_set_color(checked_color);
        }
        else {
            ctc_obj.rgb_set_color(210, 26, 210);
        } // Some default value
        // Update main tab form
        jQuery(ct_elms.ct_update_main).click(ctc_obj.run_input_update);

        // Set the ct_use_color button to apply the current color
        jQuery(ct_elms.ct_use_color).click(ctc_obj.use_color);

        // Set ct_save_color button to store the current clr for later ref.
        jQuery(ct_elms.ct_save_color).click(ctc_obj.save_to_cookie);

        // Generate the Canvas Color Wheel
        ctc_obj.generate_canvas_display();

        // Generate the 'Web Safe' colors display
        ctc_obj.generate_web_safe();

        // Initialize the saved tabs's output
        ctc_obj.display_saved_colors();

        // Initialize tabs
        ctc_obj.initiate_tabs();

        // Add input onchange events
        jQuery(ct_elms.rgb_r).bind(fire_on, ctc_obj.rgb_form_set_color);
        jQuery(ct_elms.rgb_g).bind(fire_on, ctc_obj.rgb_form_set_color);
        jQuery(ct_elms.rgb_b).bind(fire_on, ctc_obj.rgb_form_set_color);

        jQuery(ct_elms.hsb_h).bind(fire_on, ctc_obj.hsb_form_set_color);
        jQuery(ct_elms.hsb_s).bind(fire_on, ctc_obj.hsb_form_set_color);
        jQuery(ct_elms.hsb_v).bind(fire_on, ctc_obj.hsb_form_set_color);

        msos.console.debug(temp_name + ' - start_colortool => done!');
        return true;
    };

    this.get_pointer_coordinates = function () {
        var temp_coor = ' - get_pointer_coordinates -> ',
            radius = 0,
            coordinates = {
                x: 0,
                y: 0
            },
            pos = msos.position.absolute(ct_elms.ct_wheel_can),
            mbox = msos.position.margin_box(ct_elms.ct_wheel_can),
            rgb_current = [],
            hsv = {},
            radius_gt_eq = 0,
            radius_lt = 0;

        if (debug) {
            msos.console.debug(temp_name + temp_coor + 'start, position x:' + pos.x + ', y:' + pos.y + ', margin box l: ' + mbox.l + ', t: ' + mbox.t);
        }

        rgb_current = ctc_obj.current_rgb_color;

        if ((rgb_current[0] === 0) && (rgb_current[1] === 0) && (rgb_current[2] === 0)) {
            coordinates.x = 0;
            coordinates.y = 0;
            if (debug) {
                msos.console.debug(temp_name + temp_coor + 'for rgb[0, 0, 0]');
            }
        }
        else if ((rgb_current[0] === 255) && (rgb_current[1] === 255) && (rgb_current[2] === 255)) {
            coordinates.x = -77;
            coordinates.y = -77; // outer colors too sensitive at -79, so use -77
            if (debug) {
                msos.console.debug(temp_name + temp_coor + 'for rgb[255, 255, 255]');
            }
        }
        else {
            hsv = msos.colortool.calc.rgb2hsv(rgb_current[0], rgb_current[1], rgb_current[2]);
            radius_gt_eq = -1 * ((hsv.sat - 2) / 2);
            radius_lt = hsv.val / 2;

            if (radius_lt == 0.5) {
                radius = radius_gt_eq;
            }
            else {
                radius = radius_lt;
            }

            if (debug) {
                msos.console.debug(temp_name + temp_coor + 'for hue:' + hsv.hue + ', sat:' + msos.common.round(hsv.sat, 4) + ', value:' + msos.common.round(hsv.val, 4) + ', radius:' + msos.common.round(radius, 4));
            }
            coordinates = msos.colortool.calc.cartesian(radius * 80, hsv.hue);
        }
        if (debug) {
            msos.console.debug(temp_name + temp_coor + 'relative to canvas center, x:' + coordinates.x + ', y:' + coordinates.y);
        }

        coordinates.x += mbox.l + 80 - ctc_obj.pointer_offset;
        coordinates.y += mbox.t + 80 - ctc_obj.pointer_offset;

        if (debug) {
            msos.console.debug(temp_name + temp_coor + 'calc w/pointer offset, x:' + coordinates.x + ', y:' + coordinates.y);
        }
        return coordinates;
    };

    msos.console.debug(temp_name + ' => done!');
};