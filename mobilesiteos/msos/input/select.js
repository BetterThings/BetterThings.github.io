// Copyright Notice:
//				input/select.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	OpenSiteMobile 'text input' selection/range functions
	and several 'iframe' related selection/range functions
*/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.input.select");
msos.require("msos.selection");
msos.require("msos.browser");

msos.input.select.version = new msos.set_version(13, 11, 6);


// --------------------------
// Get Selection start/end points (text input fields)
// --------------------------
msos.input.select.input_get_str_end = function (elm) {
    "use strict";

    var cursor_pos = {
        start: 0,
        end: 0,
        pos_debug: "\nstart/end -> na"
    },
        start_end_debug = "\nMethod: ",
        start = 0,
        end = 0,
        body_start = 0,
        body_end = 0,
        elm_end = 0,
        inp_rng = null,
        elm_rng = null,
        bod_rng = null,
        is_textarea = false,
        is_balanced = false;

    if (elm.selectionStart) { // for Mozilla/Opera/Safari: input text/textarea
        cursor_pos.start = elm.selectionStart;
        cursor_pos.end = elm.selectionEnd;
        start_end_debug += 'selectionStart-selectionEnd';
    }
    else if (elm.createTextRange && document.body.createTextRange) { // for IE: input text/textarea
        start_end_debug += 'moveStart-moveEnd IE';

        // Test for 'selection' (this thru an error for input field without any text)
        if (document.selection) {
            inp_rng = document.selection.createRange();
        }
        if (inp_rng) {
            while (inp_rng.moveStart("character", -1) !== 0) {
                start += 1;
            }
            while (inp_rng.moveEnd("character", -1) !== 0) {
                end += 1;
            }
        }
        start_end_debug += "\nDoc range: str - > " + start + ', end -> ' + end;

        elm_rng = elm.createTextRange();
        while (elm_rng.moveEnd("character", -1) !== 0) {
            elm_end += 1;
        }
        start_end_debug += "\nElm range: elm (real) end - > " + elm_end;

        bod_rng = msos.body.createTextRange();
        bod_rng.moveToElementText(elm);
        while (bod_rng.moveStart("character", -1) !== 0) {
            body_start += 1;
        }
        while (bod_rng.moveEnd("character", -1) !== 0) {
            body_end += 1;
        }
        start_end_debug += "\nBody range: str - > " + body_start + ', end -> ' + body_end;

        is_textarea = (elm.nodeName.toLowerCase() !== 'input') ? true : false;
        is_balanced = (body_end - elm_end === body_start) ? true : false;
        if ((start > 0) && is_textarea && is_balanced) {
            start -= body_start;
        }
        if ((end > 0) && is_textarea && is_balanced) {
            end -= body_start;
        }

        cursor_pos.start = start;
        cursor_pos.end = end;
    }
    start_end_debug = "\n\nGet str/end" + ': str -> ' + cursor_pos.start + ', end -> ' + cursor_pos.end + start_end_debug;

    cursor_pos.pos_debug = start_end_debug;
    cursor_pos.start = cursor_pos.start > 0 ? cursor_pos.start : 0;
    cursor_pos.end = cursor_pos.end > 0 ? cursor_pos.end : 0;
    cursor_pos.end = (cursor_pos.end < cursor_pos.start) ? cursor_pos.start : cursor_pos.end;

    return cursor_pos;
};


// --------------------------
// Insert/Delete Text at Cursor/Selection (text input fields)
// --------------------------
msos.input.select.text_ins_del = function (inp_elm) {
    "use strict";

    var self = this,
		temp_ist = 'msos.input.select.text_ins_del';

	this.input = inp_elm;
	this.cursor = {};
	this.debug = '';

    // Sets focus and sets cursor obj from current selection
    this.input_init_focus = function () {
		var temp_iif = ' - input_init_focus -> ';
        if (msos.config.browser.touch) {

            self.input.focus();					// Set focus, then immediately
			setTimeout(self.input.blur, 10);	// blur to stop device soft keyboard

			msos.console.debug(temp_ist + temp_iif + 'suppressed focus (touch).');
        } else {
            self.input.focus();
			msos.console.debug(temp_ist + temp_iif + 'set focus.');
        }
        self.cursor = msos.input.select.input_get_str_end(self.input);
        self.debug += self.cursor.pos_debug + "\nInit focus: str -> " + self.cursor.start + ', end -> ' + self.cursor.end;
    };

    this.input_get_selection = function () {
        // IE check, Opera uses '\r\n', but calculates position correctly
        var tmp = document.selection && !window.opera ? self.input.value.replace(/\r/g, "") : self.input.value;
        return tmp.substring(self.cursor.start, self.cursor.end);
    };

    this.input_set_cursor = function (start, end) {
        var inp_debug = "\nSet Method: ",
            ev = null,
            cc = null,
            inp_rng = null;

        if (!start) { // Set at end of avail text, regardless of 'dir'
            start = self.input.value.length;
            end = self.input.value.length;
        }
        if (self.input.setSelectionRange) {
            // scroll by simulating a user keypress (Moz only)
            if (window.KeyEvent) {
                self.input.setSelectionRange(start, start + 1);

                ev = document.createEvent('KeyEvents');
                cc = self.input.value.charCodeAt(start);

                ev.initKeyEvent('keypress', true, true, null, false, false, false, false, 0, cc);
                self.input.dispatchEvent(ev);
            }
            // Now set the 'real' selection range
            self.input.setSelectionRange(start, end);
            inp_debug += 'setSelectionRange';
        }
        else if (self.input.createTextRange) {
            inp_rng = self.input.createTextRange();
            inp_rng.collapse(true);
            inp_rng.moveStart("character", start);
            inp_rng.moveEnd("character", end - start);
            inp_rng.scrollIntoView(true);
            inp_rng.select();
            inp_debug += 'move';
        }
        inp_debug += "\nLast char code: " + self.input.value.charCodeAt(start - 1);
        self.debug += "\nSet cursor: start -> " + start + ', end -> ' + end + inp_debug;
    };

    this.input_del_character = function (is_del) {
        if (!is_del) {
            is_del = false;
        }
        var inp_val = self.input.value,
            start = self.cursor.start,
            end = self.cursor.end,
            tmp = '',
            char_length = 1,
            char_adj = 0;

        if (start === end) {
            if (window.opera) {
                if (is_del) {
                    char_adj += (inp_val.charCodeAt(start + 1) === 10) ? 1 : 0;
                }
                else {
                    char_adj += (inp_val.charCodeAt(start - 1) === 10) ? 1 : 0;
                }
            }
            // Delete char before (is_del == false), or after cursor (is_del == true)
            if (is_del) {
                self.debug += "\nChar code at delete: " + inp_val.charCodeAt(start + 1);
            }
            else {
                self.debug += "\nChar code at bkspace: " + inp_val.charCodeAt(start - 1);
            }
            char_length += char_adj;
            start = is_del ? start : start - char_length < 0 ? 0 : start - char_length;
            end = is_del ? end + char_length : end;
        }
        // IE: need to correct for '\r\n' cursor position counted as just '\n'
        tmp = document.selection && !window.opera ? inp_val.replace(/\r/g, "") : inp_val;

        self.input.value = tmp.substring(0, start) + tmp.substring(end, tmp.length);
        self.input_set_cursor(start, start);
    };

    this.input_ins_character = function (txt) {
        if (!txt) {
            return;
        }
        var inp_val = self.input.value,
            txt_length = txt.length,
            txt_adj = 0,
            set_curs = 0,
            tmp = '',
            i = 0;

        // Opera: need to adjustment for '\n' -> '\r\n' of input text
        if (window.opera) {
            for (i = 0; i < txt.length; i += 1) {
                txt_adj += (txt.charCodeAt(i) === 10) ? 1 : 0;
            }
            txt_length += txt_adj;
        }
        // IE: need to correct for '\r\n' cursor position counted as just '\n'
        tmp = document.selection && !window.opera ? inp_val.replace(/\r/g, "") : inp_val;

        self.input.value = tmp.substring(0, self.cursor.start) + txt + tmp.substring(self.cursor.end, tmp.length);
        if (self.cursor.end > self.cursor.start) {
            set_curs = self.cursor.start + txt_length;
        }
        else {
            set_curs = self.cursor.end + txt_length;
        }
        self.input_set_cursor(set_curs, set_curs);
    };
};


// --------------------------
// Insert HTML (editable elements)
// --------------------------
// Insert html into cursor position (replacing selection if any)
// Note: code use is limited to editable elements
msos.input.select.edit_insert_html = function (ifr, html) {
    "use strict";

    var debug_txt = 'msos.input.select.edit_insert_html -> ',
        sel_obj = new msos.selection.generate_object(ifr),
        win_sel = null,
        win_range = null;

    msos.console.debug(debug_txt + 'start.');

    win_sel = sel_obj.get_selection();
    win_range = sel_obj.get_range(win_sel);

    // If no range, quit
    if (!win_range) {
        msos.console.warn(debug_txt + 'failed, no range.');
        return;
    }

    if (window.getSelection && !msos.browser.is.IE) {
        debug_txt += 'Moz & Opera way using execCommand';
        ifr.contentWindow.document.execCommand('inserthtml', false, html);
    } else if (document.selection) {
        debug_txt += 'IE way using pasteHTML';
        if (win_range.pasteHTML) {
            if (win_sel.type.toLowerCase() !== "none") {
                win_sel.clear();
            }
            win_range.pasteHTML(html);
        }
    }
    else {
        msos.console.warn(debug_txt + 'failed!');
    }

    sel_obj.set_focus();
    msos.console.debug(debug_txt + ", Completed!");
};


// --------------------------
// Javascript backspace/delete function (editable elements)
// --------------------------
msos.input.select.set_bksp_del_select = function (ifr, bksp_rng) {
    "use strict";

    var debug_txt = "msos.input.select.set_bksp_del_select -> ",
        char_move = 0,
        flag_select = false,
        tag = 'body',
        sel_obj = new msos.selection.generate_object(ifr),
        // Get the current selection start/end/target etc cursor info.
        cursor = sel_obj.selection_str_end(),
        // Get a new cursor definition object
        start = 0,
        end = 0;

    // Should we continue
    if (typeof cursor !== "object") {
        return;
    }
    if (cursor.target && cursor.target.nodeName) {
        tag = cursor.target.nodeName.toLowerCase();
    }
    if (/body|html|head|base/.test(tag)) {
        return;
    }

    // Set default to delete character
    if (typeof (bksp_rng) === "undefined") {
        bksp_rng = false;
    }

    start = cursor.start + cursor.offset;
    end = cursor.end + cursor.offset;

    // Sort out logic for 'what to do'
    if (start !== end) { // Selected text, so just remove it
        flag_select = true;
    }
    else if (bksp_rng) { // Simulate backspace
        if (start > 0) {
            start -= 1;
            char_move = -1;
            flag_select = true;
        }
    }
    else { // Simulate delete
        if (end < cursor.max) {
            end += 1;
            char_move = 1;
            flag_select = true;
        }
    }

    if (window.getSelection) {
        debug_txt += "window.getSelection: ";

        if (flag_select) {

            // Create a new range with given start, end...
            cursor.range = sel_obj.set_start_end(cursor.target, start, end);

            // Set focus back to selection
            sel_obj.set_focus();

            // Add new range to the current selection
            cursor.select.removeAllRanges();
            cursor.select.addRange(cursor.range);

            // Now do the backspace/delete part
            sel_obj.remove();

            if (msos.browser.is.Opera || msos.browser.is.Chrome) {
                // For some reason, the 'remove' above leaves the cursor in the
                // wrong location (+1), so we force it back to the right place
                cursor.range = sel_obj.set_start_end(cursor.target, start, start);
                sel_obj.set_focus();
                cursor.select.removeAllRanges();
                cursor.select.addRange(cursor.range);
            }
        }
    }
    else if (document.selection) {
        debug_txt += "document.selection: ";

        if (flag_select) {

            // Create a new range with given start, end...
            cursor.range = sel_obj.set_start_end(cursor.target, start, end);

            // Set focus back to selection
            sel_obj.set_focus();

            // Set range to the current selection
            cursor.range.select();

            // Now do the backspace/delete part
            sel_obj.remove();
        }
    }
    // For advanced debugging -> initial selection vs. final one
    if (msos.config.verbose) {
        sel_obj.selection_str_end();
    }
    msos.console.debug(debug_txt + 'moved ' + char_move);
};

// --------------------------
// Insert html after a target element
// --------------------------
msos.input.select.insert_adj_html = function (target, win, html) {
    "use strict";

    var rng = null,
        fragment = null;

    if (target.insertAdjacentHTML) {
        target.insertAdjacentHTML('afterend', html);
    }
    else {
        // Gecko,NS,Mozilla code for insertAdjacentHTML 
        rng = win.document.createRange();
        fragment = rng.createContextualFragment(html);

        if (target.nextSibling) {
            target.parentNode.insertBefore(fragment, target.nextSibling);
        }
        else {
            target.parentNode.appendChild(fragment);
        }
    }
};

// --------------------------
// Insert caret into target contenteditable element
// --------------------------
// Insert caret into cursor position for mobile (replacing selection if any)
// Note: code use is intended for editable elements
msos.input.select.mobile_caret = function (evt) {
    "use strict";

    var temp_isi = 'msos.input.select.mobile_caret -> ',
        sel_obj = new msos.selection.generate_object(window),
        win_sel = null,
        win_range = null;

    msos.console.debug(temp_isi + 'start.');

	msos.do_abs_nothing(evt);

    win_sel = sel_obj.get_selection();
    win_range = sel_obj.get_range(win_sel);

    sel_obj.set_focus();

	msos.console.debug(temp_isi + 'done!');
};

// --------------------------
// Helper functions
// --------------------------
// Returns the deepest node that contains selection (allow 'body' true|false).
msos.input.select.get_sel_parent_element = function (ifr, allow_body) {
    "use strict";

    if (!allow_body) {
        allow_body = false;
    }

    var sel_obj = new msos.selection.generate_object(ifr),
        sel_par = sel_obj.get_parent_elem() || null;

    if (sel_par) {
        if (!/html|head|base|body/i.test(sel_par.nodeName)) {
            return sel_par;
        }
        else if ((!/html|head|base/i.test(sel_par.nodeName) && allow_body)) {
            return sel_par;
        }
        else {
            return null;
        }
    }
    else {
        return null;
    }
};

msos.input.select.scroll_test = function (if_el, node) {
    "use strict";

    var pos = {
        absLeft: 0,
        absTop: 0
    },
        h = if_el.clientHeight,
        w = if_el.clientWidth,
        grt_top = false,
        grt_lft = false;

    while (node) {
        pos.absLeft += node.offsetLeft;
        pos.absTop += node.offsetTop;
        node = node.offsetParent;
    }

    // Only scroll if out of visible area
    grt_top = (pos.absTop > h);
    grt_lft = (pos.absLeft > w);

    if (grt_top || grt_lft) {
        return true;
    }
    else {
        return false;
    }
};