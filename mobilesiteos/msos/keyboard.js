// Copyright Notice:
//			        keyboard.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile on-screen keyboard

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("msos.keyboard");
msos.require("msos.common");
msos.require("msos.diacritic");
msos.require("msos.i18n.keyboard");
msos.require("msos.iframe");
msos.require("msos.input.text");
msos.require("msos.input.select");
msos.require("msos.selection");
msos.require("msos.popdiv");

msos.keyboard.version = new msos.set_version(14, 3, 18);


// Start by loading our keyboard stylesheet
msos.keyboard.css = new msos.loader();
msos.keyboard.css.load('pop_keyboard_css', msos.resource_url('css', 'pop_keyboard.css'));

// Use msos.i18n and not Google Web Translate
msos.config.google.no_translate.by_id.push('#keyboard_container');


msos.keyboard.create_tool = function () {
    "use strict";

    var temp_tool = 'msos.keyboard.create_tool',
        keyboard_name = 'msos_keyboard',
        keyboard_obj = this;

    msos.console.debug(temp_tool + ' -> start.');

    // Create our standard 'tool' parameters
    this.tool_name = keyboard_name;
    this.tool_target = null;
    this.tool_iframe = null;
    this.tool_created = false;
    this.tool_on_success = [];
    this.tool_on_complete = [];
    this.tool_load_url = '';
    this.tool_loaded_url = '';
    this.tool_dialog = {};
    this.tool_popup = new msos.popdiv.create_tool(
        keyboard_name, // Tracking cookie name
        '_kbd', // Extension used for 'css/size/' file specification
        msos.resource_url('css', 'size'),
        msos.byid("keyboard_container"),
        msos.byid("keyboard_header"),
        msos.byid("keyboard_close"),
        msos.byid("keyboard_display"),
        {
            of: jQuery('#body'),
            my: 'left top',
            at: 'left+20 top+120',
            collision: 'none'
        },
        msos.i18n.keyboard.bundle,  // Use keyboard i18n instead of std popup div i18n
        undefined                   // Alternatively: specify a fixed size or leave 'undefined'
    );

    this.i18n = msos.i18n.keyboard.bundle;
    this.control_keys = {};
    this.character_keys = [];
    this.kbd_avail_inputs = ['text', 'file', 'password'].concat(msos.html5_inputs);
    this.kbd_char_url = msos.resource_url('msos', 'kbd');
    this.kbd_char_grps = null;
    this.kbd_char_idx = 0;
    this.kbd_lout_arry = [];
    this.kbd_lout_hash = {};

    // Control key flags: active is 'true'
    this.flag_caps = false;
    this.flag_shift = false;
    this.flag_alt = false;
    this.use_diac = '';

    // --------------------------
    // Helper Function
    // --------------------------

    // Textarea or text input only
    this.set_input_focus_end = function (target) {

        var sel_obj = new msos.input.select.text_ins_del(target);

        sel_obj.input_init_focus();

        // Force cursor to end of current text input
        sel_obj.input_set_cursor();

        // Set target so keyboard can insert text
        keyboard_obj.tool_target = target;

        if (msos.debug) {
            // Not actually an event, but for our purposes...
            msos.debug.write(sel_obj.debug);
        }
    };

    this.character_load = function () {

        var temp_cl = ' - character_load -> ',
            kbd_name = keyboard_obj.kbd_lout_arry[keyboard_obj.kbd_char_idx],
            kbd_url = keyboard_obj.kbd_char_url + '/' + kbd_name + '.json',
            load_layout = function (response) {
                var cfg = msos.config,
                    kbd_select = cfg.i18n.select_kbrds_msos;

                keyboard_obj.kbd_char_grps = response;

                if      (kbd_select[kbd_name])              { cfg.keyboard = kbd_name; }
                else if (kbd_select[kbd_name.slice(0, 2)])  { cfg.keyboard = kbd_name.slice(0, 2); }

                setTimeout(keyboard_obj.refresh_layout, 200);

                // Update select menu, if present
                keyboard_obj.on_character_change();

                msos.console.debug(temp_tool + temp_cl + 'success: ' + kbd_url);
            },
            load_complete = function () {
                msos.console.debug(temp_tool + temp_cl + 'completed: ' + kbd_url);
            };

        msos.console.debug(temp_tool + temp_cl + 'start, for: ' + kbd_name);

        jQuery.ajax({
            dataType: 'json',
            cache: msos.config.cache,
            // ** Very important: Cache required keyboard layouts. They are static!
            url: kbd_url,
            success: [load_layout, msos.ajax_success],
            error: msos.ajax_error,
            complete: [load_complete, msos.ajax_complete]
        });
    };

    this.set_keyboard_layouts = function () {

        var temp_kl = ' - set_keyboard_layouts -> ',
            kb_locales = _.uniq(msos.config.keyboard_locales),
            set_kb_layout = '',
            layouts = [],
            map_obj,
            j = 0,
            lay = '';

        msos.console.debug(temp_tool + temp_kl + 'start, index: + ' + keyboard_obj.kbd_char_idx);

        for (j = 0; j < kb_locales.length; j += 1) {
            map_obj = msos.i18n.logic(kb_locales[j]) || null;
            if (kb_locales[j] === msos.config.keyboard) {
                set_kb_layout = map_obj.keyboard_arry[0];
            }
            if (map_obj) {
                for (lay in map_obj.keyboard_hash) {
                    layouts.push(lay);
                    keyboard_obj.kbd_lout_hash[lay] = map_obj.keyboard_hash[lay];
                }
            }
        }

        // Clean up duplicates (ie: many languages use 'en' layout)
        keyboard_obj.kbd_lout_arry = _.uniq(layouts);

        // Set the current keyboard display character index 
        keyboard_obj.kbd_char_idx = _.indexOf(keyboard_obj.kbd_lout_arry, set_kb_layout);

        // Just reset to now unique array
        msos.config.keyboard_locales = kb_locales;

        msos.console.debug(temp_tool + temp_kl + 'done, index: + ' + keyboard_obj.kbd_char_idx + ', array:', keyboard_obj.kbd_lout_arry);
    };

    // --------------------------
    // Keyboard Event Functions
    // --------------------------

    this.on_character_change = function () {

        if (msos.intl) {
            msos.intl.keyboard_select_func();
        }

        msos.console.debug(temp_tool + ' - on_character_change -> fired!');
    };

    this.keyb_toggle_onmouseup = function () {

        var popup_kb = keyboard_obj.tool_popup;

        // Toggle display of keyboard
        if (popup_kb.visibile) {
            popup_kb.hide_popdiv();
        } else {
            popup_kb.display_popdiv();
        }

        msos.console.debug(temp_tool + ' - keyb_toggle_onmouseup -> toggled, set layout to: ' + keyboard_obj.kbd_char_idx);
        return true;
    };

    this.refresh_layout = function () {

        var temp_rf = ' - refresh_layout -> ',
            color = msos.config.color,
            grps = keyboard_obj.kbd_char_grps,
            idxl = keyboard_obj.kbd_char_idx,
            ctrl = keyboard_obj.control_keys,
            chrc = keyboard_obj.character_keys,
            kbdlh = keyboard_obj.kbd_lout_hash,
            kbdla = keyboard_obj.kbd_lout_arry,
            char_set = [],
            set_key_state = null,
            state = 'normal',
            i = 0,
            kbd_name = '';

        msos.console.debug(temp_tool + temp_rf + 'start, ');

        set_key_state = function (key, onoff, text_color, border_color, bg_color, bg_over, font_down, font_up) {
            // Our set key state function
            key.style.color = text_color;
            key.style.borderColor = border_color;
            key.style.backgroundColor = bg_color;
            key.style.fontWeight = font_up;

            // Set color for mouseover/out
            key.bg_color_over = bg_over;
            key.bg_color_out = bg_color;

            // Set font weight for mouseover/out
            key.font_up = font_up;
            key.font_down = font_down;

            key.is_active = onoff;
            return true;
        };

        // Determine the current state to render keyboard
        if (keyboard_obj.flag_caps) {
            if (keyboard_obj.flag_shift) {
                state = 'caps_shift';
            } else {
                state = 'caps';
            }
        } else if (keyboard_obj.flag_shift) {
            if (keyboard_obj.flag_alt) {
                state = 'alt_shift';
            } else {
                state = 'shift';
            }
        } else if (keyboard_obj.flag_alt) {
            state = 'alt';
        }

        msos.console.debug(temp_tool + ' - refresh_layout -> start for layout type: ' + state);

        if (state === 'alt' && grps[state].length !== 48) {
            // Generate character, based on a std alt (when none defined)
            for (i = 0; i < msos.i18n.alt.length; i += 1) {
                char_set[i] = msos.i18n.alt[i];
            }
        } else if (state === 'alt_shift' && grps[state].length !== 48) {
            // Generate character, based on a std alt_shift (when none defined)
            for (i = 0; i < msos.i18n.alt_shift.length; i += 1) {
                char_set[i] = msos.i18n.alt_shift[i];
            }
            // Note: see below switch logic which prevents alt_shift if alt exists, but no alt_shift
        } else {
            // Generate the character set to use, based on state
            for (i = 0; i < grps[state].length; i += 1) {
                char_set[i] = grps[state][i];
            }
        }

        // Quick check that key info is correct size
        if (char_set.length !== 48) {
            kbd_name = kbdla[idxl];
            kbd_name += '.js';
            msos.console.error(temp_tool + temp_rf + 'wrong # of keys: ' + ' for ' + kbd_name + ' and state: ' + state);
            return;
        }

        var num_found = null,
            k = 0,
            key = '',
            key_val = '',
            is_diac = false,
            name = '',
            alt_bg = '',
            caps_bg = '',
            sh_bg = '',
            prev_layout = '',
            prev_text = '',
            current_layout = '',
            next_layout = '',
            next_text = '';

        // Special case, replace std. characters w/ diacritic
        if (keyboard_obj.use_diac) {

            // Replace std. with diacritic characters in current character set
            num_found = msos.diacritic.find_replace(char_set, keyboard_obj.use_diac);
            msos.console.debug(temp_tool + temp_rf + 'replaced std w/ diacritic: ' + num_found);

        } else {

            // Or mark diacritic character(s)
            msos.diacritic.mark(char_set);
        }

        // Set key state for character keys
        for (k = 0; k < char_set.length; k += 1) {

            key = chrc[k];
            key_val = '';
            is_diac = false;

            if (typeof char_set[k] === 'object') {
                key_val = char_set[k][0];
                key.is_diacritic = char_set[k][1];
                is_diac = true;
            } else {
                key_val = char_set[k];
            }
            key.innerHTML = key_val;
            key.title = key_val + ' ' + keyboard_obj.i18n.key;
            if (is_diac) {
                set_key_state(key, true, color.rd, color.dg, color.wh, color.be, 'normal', 'bold');
            } else {
                set_key_state(key, true, color.bk, color.dg, color.wh, color.be, 'normal', 'bold');
            }
        }

        // Set key state for control keys
        for (name in ctrl) {

            key = ctrl[name];

            switch (name) {
            case "alt":
                key.innerHTML = "Alt";
                alt_bg = keyboard_obj.flag_alt ? color.lb : color.wh;
                set_key_state(key, true, color.bk, color.dg, alt_bg, color.be, 'bold', 'normal');
                break;
            case "caps":
                caps_bg = keyboard_obj.flag_caps ? color.lb : color.wh;
                set_key_state(key, true, color.bk, color.dg, caps_bg, color.be, 'bold', 'normal');
                break;
            case "shiftl":
            case "shiftr":
                if (state === 'alt' && grps.alt.length === 48 && grps.alt_shift.length !== 48) {
                    set_key_state(key, false, color.dg, color.lg, color.wh, color.be, 'normal', 'bold');
                } else {
                    sh_bg = keyboard_obj.flag_shift ? color.lb : color.wh;
                    set_key_state(key, true, color.bk, color.dg, sh_bg, color.be, 'bold', 'normal');
                }
                break;
            case "langprv":
                if (kbdla[idxl - 1]) {
                    set_key_state(key, true, color.bk, color.dg, color.sl, color.be, 'bold', 'normal');
                    prev_layout = kbdla[idxl - 1];
                    prev_text = prev_layout.replace(/_/, '-');
                    key.innerHTML = '« ' + prev_text;
                    key.title = keyboard_obj.i18n.previous_layout + ' ' + kbdlh[prev_layout][1];
                } else {
                    // Blank key
                    set_key_state(key, false, color.dg, color.lg, color.wh, color.be, 'normal', 'bold');
                    key.innerHTML = '';
                }
                break;
            case "langcrt":
                set_key_state(key, false, color.bk, color.dg, color.lb, color.be, 'bold', 'normal');
                current_layout = kbdla[idxl];
                key.innerHTML = current_layout.replace(/_/, '-');
                key.title = keyboard_obj.i18n.current_layout + ' ' + kbdlh[current_layout][1];
                msos.console.debug(temp_tool + ' - refresh_layout -> set kbd layout: ' + current_layout + ' - ' + kbdlh[current_layout][2]);
                break;
            case "langnxt":
                if (kbdla[idxl + 1]) {
                    set_key_state(key, true, color.bk, color.dg, color.sl, color.be, 'bold', 'normal');
                    next_layout = kbdla[idxl + 1];
                    next_text = next_layout.replace(/_/, '-');
                    key.innerHTML = next_text + ' »';
                    key.title = keyboard_obj.i18n.next_layout + ' ' + kbdlh[next_layout][1];
                } else {
                    // Blank key
                    set_key_state(key, false, color.dg, color.lg, color.wh, color.be, 'normal', 'bold');
                    key.innerHTML = '';
                }
                break;
            case "extra":
            case "open2":
                // Keys available for future functions, characters
                set_key_state(key, false, color.dg, color.lg, color.wh, color.be, 'normal', 'bold');
                break;
            default:
                set_key_state(key, true, color.bk, color.dg, color.wh, color.be, 'bold', 'normal');
            }

        }
        msos.console.debug(temp_tool + temp_rf + 'done!');
    };

    this.process_key_onclick = function (evt) {
        msos.do_nothing(evt);

        var in_el = evt.target,
            kbo = keyboard_obj,
            avail_inps = kbo.kbd_avail_inputs.concat('textarea'),
            targ_type =  kbo.tool_target ? kbo.tool_target.type : '',
            temp_nme = ' - process_key_onclick -> ',
            temp_txt = '',
            flag = '',
            sel_obj = null,
            ifr = null,
            space_val = " ",
            temp_act = false,
            temp_inn = '';

        msos.console.debug(temp_tool + temp_nme + 'start, key: ' + in_el.id + (targ_type ? ', target type: ' + targ_type : ''));

        // Is the key currently available?
        if (!in_el.is_active) {
            msos.console.debug(temp_tool + temp_nme + 'not active: ' + in_el.id);
            return false;
        }
        // Check for some control keys
        if (in_el.id === 'langprv') {
            // Decrement language by 1
            kbo.kbd_char_idx -= 1;

            msos.console.debug(temp_tool + temp_nme + 'increment layout index: ' + kbo.kbd_char_idx);

            // Load the character data
            kbo.character_load();
            return false;
        }

        if (in_el.id === 'langnxt') {
            // Increment language by 1
            kbo.kbd_char_idx += 1;

            msos.console.debug(temp_tool + temp_nme + 'increment language index: ' + kbo.kbd_char_idx);

            // Load the character data
            kbo.character_load();
            return false;
        }

        if (in_el.id === "caps") {
            flag = 'flag_caps';

            // 'caps' and 'alt' are mutually exclusive (no defined state)
            if (kbo.flag_alt) {
                msos.console.debug(temp_tool + temp_nme + 'caps not available.');
                return false;
            }
            kbo[flag] = kbo[flag] ? false : true;

            msos.console.debug(temp_tool + temp_nme + flag + ': ' + kbo[flag]);
            kbo.refresh_layout();
            return false;
        }

        if (in_el.id === "alt") {
            flag = 'flag_alt';

            // 'caps' and 'alt' are mutually exclusive (no defined state)
            if (kbo.flag_caps) {
                msos.console.debug(temp_tool + temp_nme + 'alt not available.');
                return false;
            }
            kbo[flag] = kbo[flag] ? false : true;

            msos.console.debug(temp_tool + temp_nme + flag + ': ' + kbo[flag]);
            kbo.refresh_layout();
            return false;
        }

        if ((in_el.id === "shiftl") || (in_el.id === "shiftr")) {
            flag = 'flag_shift';
            kbo[flag] = kbo[flag] ? false : true;

            msos.console.debug(temp_tool + temp_nme + flag + ': ' + kbo[flag]);
            kbo.refresh_layout();
            return false;
        }

        if (in_el.is_diacritic) {
            kbo.use_diac = in_el.is_diacritic;
            in_el.is_diacritic = '';

            msos.console.debug(temp_tool + temp_nme + 'apply diacritic: ' + kbo.use_diac);
            kbo.refresh_layout();
            return false;
        }

        // Check key based on input element (iframe or text input)
        if (targ_type && _.indexOf(avail_inps, targ_type) !== -1) {

            sel_obj = new msos.input.select.text_ins_del(kbo.tool_target);
            sel_obj.input_init_focus();

            switch (in_el.id) {
            case "backsp":
                sel_obj.input_del_character(false);
                break;
            case "del":
                sel_obj.input_del_character(true);
                break;
            case "tab":
                sel_obj.input_ins_character("\t");
                break;
            case "enter":
                sel_obj.input_ins_character("\n");
                break;
            case "space":
                sel_obj.input_ins_character(" ");
                break;
            case "extra":
                break;
            case "langcrt":
                break;
            case "open2":
                break;
            default:
                sel_obj.input_ins_character(in_el.innerHTML);
                // use shift only once for alphanumeric keys
                if (kbo.flag_shift === true) {
                    kbo.flag_shift = false;
                    kbo.refresh_layout();
                }
                // use diacritic replaced characters only once
                if (kbo.use_diac) {
                    kbo.use_diac = '';
                    kbo.refresh_layout();
                }
            }
            temp_txt = sel_obj.debug;

            // Otherwise, check for an iframe
        } else if (kbo.tool_iframe) {
            ifr = kbo.tool_iframe;
            switch (in_el.id) {
            case "backsp":
                msos.input.select.set_bksp_del_select(ifr, true);
                break;
            case "del":
                msos.input.select.set_bksp_del_select(ifr, false);
                break;
            case "tab":
                msos.input.select.edit_insert_html(ifr, "\t");
                break;
            case "enter":
                msos.input.select.edit_insert_html(ifr, "<br />");
                break;
            case "space":
                // For IE (not sure this is still needed since we no longer support < IE9)
                if (document.addEventListener) {
                    space_val = "&#160;";
                }
                msos.input.select.edit_insert_html(ifr, space_val);
                break;
            case "extra":
                break;
            case "langcrt":
                break;
            case "open2":
                break;
            default:
                msos.input.select.edit_insert_html(ifr, in_el.innerHTML);
                // use shift only once for alphanumeric keys
                if (kbo.flag_shift === true) {
                    kbo.flag_shift = false;
                    kbo.refresh_layout();
                }
                // use diacritic replaced characters only once
                if (kbo.use_diac) {
                    kbo.use_diac = '';
                    kbo.refresh_layout();
                }
            }
            temp_txt = "\nIframe detected";
        } else {
            msos.console.warn(temp_tool + temp_nme + 'failed: missing input or iframe!');
        }

        if (msos.debug) {
            temp_act = in_el.is_active ? 'true' : 'false';
            temp_inn = in_el.innerHTML || 'na';
            temp_txt = "\nProcess key:" + "\nInner  -> " + temp_inn + "\nActive -> " + temp_act + temp_txt;
            msos.debug.event(evt, temp_txt);
        }

        msos.console.debug(temp_tool + temp_nme + 'done!');
        return false;
    };

    this.vk_register_input = function (input_elm) {

        var temp_ri = ' - vk_register_input -> ',
            $input_elm = jQuery(input_elm),
            tag = $input_elm[0].tagName.toLowerCase(),
            type = '';

        msos.console.debug(temp_tool + temp_ri + 'start.');

        switch (tag) {
            case 'input':
                type = $input_elm.attr('type') || 'na';
                if (_.indexOf(keyboard_obj.kbd_avail_inputs, type) !== -1) {
                    // Create our 'onmousedown/up' events for text input elements, plus input_onfocus event
                    msos.input.text.set_event(keyboard_obj, [input_elm], 'focus', keyboard_obj.input_onfocus);
                } else {
                    msos.console.debug(temp_tool + temp_ri + 'wrong input type: ' + type);
                }
            break;
            case 'textarea':
                // Create our 'onmousedown/up' events for text input elements, plus input_onfocus event
                msos.input.text.set_event(keyboard_obj, [input_elm], 'focus', keyboard_obj.input_onfocus);
            break;
            case 'iframe':
                // Create our 'onmousedown/up' events for iframe elements
                msos.iframe.set_event(keyboard_obj, [input_elm]);
             break;
            default:
                msos.console.debug(temp_tool + temp_ri + 'not allowed: ' + tag);
        }

        msos.console.debug(temp_tool + temp_ri + 'done, for: ' + tag + (type ? '[type=' + type + ']' : ''));
    };

    // Generate layouts array and hash (used in 'this.refresh_layout')
    keyboard_obj.set_keyboard_layouts();

    msos.console.debug(temp_tool + ' -> created: keyboard popup');
};


// --------------------------
// Keyboard Generation Functions
// --------------------------
msos.keyboard.generate = function (kb_obj) {
    "use strict";

    var ctrl_keys = {},
        char_keys = [],
        lang = kb_obj.i18n,
        setup_keys = null,
        i = 0;

    // Build keys
    setup_keys = function (key_id, in_title, in_class) {

        var div_obj = document.createElement("div"),
            on_mouse_down = null,
            on_mouse_up = null,
            on_mouse_over = null,
            on_mouse_out = null;

        div_obj.id = key_id;
        div_obj.title = in_title;
        div_obj.className = in_class;
        div_obj.unselectable = "on";

        on_mouse_down = function (evt) {
            msos.do_nothing(evt);
            evt.target.style.borderStyle = 'inset';
            evt.target.style.fontWeight = evt.target.font_down;
        };
        on_mouse_up = function (evt) {
            msos.do_nothing(evt);
            evt.target.style.borderStyle = 'outset';
            evt.target.style.fontWeight = evt.target.font_up;
        };
        on_mouse_over = function (evt) {
            evt.target.style.backgroundColor = evt.target.bg_color_over;
        };
        on_mouse_out = function (evt) {
            evt.target.style.backgroundColor = evt.target.bg_color_out;
        };

        jQuery(div_obj).mouseover(on_mouse_over);
        jQuery(div_obj).mouseout(on_mouse_out);
        jQuery(div_obj).mousedown(on_mouse_down);
        jQuery(div_obj).mouseup(on_mouse_up);
        jQuery(div_obj).click(kb_obj.process_key_onclick);

        kb_obj.tool_popup.display.appendChild(div_obj);
        return div_obj;
    };

    for (i = 0; i < 48; i += 1) {
        char_keys[i] = setup_keys('key' + i, i, 'std_kb_cell');
    }

    ctrl_keys.backsp = setup_keys("backsp", lang.backsp, 'bk_space_cell');
    ctrl_keys.tab = setup_keys("tab", lang.tab, 'tab_cell');
    ctrl_keys.extra = setup_keys("extra", '', 'extra_cell');
    ctrl_keys.caps = setup_keys("caps", lang.caps, 'caps_cell');
    ctrl_keys.enter = setup_keys("enter", lang.enter, 'enter_cell');
    ctrl_keys.shiftl = setup_keys("shiftl", lang.shift, 'shift_cell');
    ctrl_keys.shiftr = setup_keys("shiftr", lang.shift, 'shift_cell');
    ctrl_keys.langprv = setup_keys("langprv", '', 'bottom_cell');
    ctrl_keys.langcrt = setup_keys("langcrt", '', 'bottom_cell');
    ctrl_keys.langnxt = setup_keys("langnxt", '', 'bottom_cell');
    ctrl_keys.space = setup_keys("space", lang.space, 'space_cell');
    ctrl_keys.del = setup_keys("del", lang.del, 'bottom_cell');
    ctrl_keys.alt = setup_keys("alt", lang.alt, 'bottom_cell');
    ctrl_keys.open2 = setup_keys("open2", '', 'bottom_cell');

    kb_obj.control_keys = ctrl_keys;
    kb_obj.character_keys = char_keys;

    // Register popup code insertion
    kb_obj.tool_popup.filled = true;

    // Load the initial keyboard css
    kb_obj.tool_popup.stylesheet_load();

    // Load character definition file and refresh layout
    kb_obj.character_load();
};

msos.keyboard.add_to_page = function () {
    "use strict";

    var container = jQuery(
            '<div id="keyboard_container" class="msos_popup">'
          +     '<div id="keyboard_header" class="header_popup">'
          +         '<button id="keyboard_close" class="btn btn-danger btn-small fa fa-times"></button>'
          +     '</div>'
          +     '<div id="keyboard_display"></div>'
          + '</div>'
        ),
        kb_obj;

    jQuery('body').append(container);

	// Create keyboard popup
	kb_obj = new msos.keyboard.create_tool();

    // Fill the keyboard container
    msos.keyboard.generate(kb_obj);

    // Register our debug popup div
    msos.popdiv.register_tool(kb_obj);

    kb_obj.tool_created = true;
};

msos.keyboard.get_tool = function () {
    "use strict";

    if (!msos.registered_tools.msos_keyboard) { msos.keyboard.add_to_page(); }

    return msos.registered_tools.msos_keyboard.base;
};
