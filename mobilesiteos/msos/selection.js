// Copyright Notice:
//				    selection.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile window 'selection' related functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.selection");
msos.require("msos.browser");

msos.selection.version = new msos.set_version(13, 11, 6);


msos.selection.generate_object = function (ifr) {
    "use strict";

    var win = ifr.contentWindow,
        doc = win.document,
        temp_txt = 'msos.selection.generate_object',
        fb_sel = this;

    msos.console.debug(temp_txt + ' -> start.');

    // Returns the current selection object
    this.get_selection = function () {
        msos.console.debug(temp_txt + ' - get_selection -> called.');
        // Order is important here! (Opera)
        if (window.getSelection && !msos.browser.is.IE) {
            return win.getSelection();
        }
        else if (document.selection) {
            return win.document.selection;
        }
        else {
            msos.console.warn(temp_txt + ' - get_selection -> failed!');
            return null;
        }
    };

    // Returns a range for the current selection
    this.get_range = function (sel) {
        msos.console.debug(temp_txt + ' - get_range -> called.');
        if (!sel) {
            msos.console.warn(temp_txt + ' - get_range -> no selection input!');
            return null;
        }
        // Order is important here! (Opera)
        if (window.getSelection && !msos.browser.is.IE) {
            return sel.getRangeAt(0);
        }
        else if (document.selection) {
            return sel.createRange();
        }
        else {
            msos.console.warn(temp_txt + ' - get_range -> failed!');
            return null;
        }
    };

    // Returns a new (control?) range object
    this.create_range = function () {
        msos.console.debug(temp_txt + ' - create_range -> called.');
        // Order is important here! (Opera)
        if (window.getSelection) {
            return doc.createRange();
        }
        else if (document.selection) {
            return doc.body.createControlRange();
        }
        else {
            msos.console.warn(temp_txt + ' - create_range -> failed!');
            return null;
        }
    };

    this.set_focus = function () {
        msos.console.debug(temp_txt + ' - set_focus -> called.');
        // Setting focus is an absolute 'must' for Opera and Moz (maybe others)
        if (msos.browser.is.Opera) {
            setTimeout(function () { ifr.focus(); }, 1);    // was ifr.blur(); then ifr.focus(); which worked but...
        } else {
            win.focus();
        }
    };

    this.selection_str_end = function () {
        msos.console.debug(temp_txt + ' - selection_str_end -> start.');
        var cursor_pos = {
            start: 0,
            end: 0,
            offset: 0,
            offset_tar: 0,
            pos_debug: {},
            string: '',
            range: null,
            select: null,
            target: null,
            max: 0
        },
            start = 0,
            end = 0,
            child = null,
            target = null,
            win_sel = null,
            win_rng = null,
            offset = 0,
            current = null,
            str_cnt = 0,
            tmp_rng = null,
            cnt_rng = null;

        // Absolutely critical (3 day of f'ing around):
        // IE loses focus without this, but only for selection of '0' length
        if (msos.browser.is.IE) {
            fb_sel.set_focus();
        }

        // Get the current selection/range
        win_sel = fb_sel.get_selection();
        win_rng = fb_sel.get_range(win_sel);

        if (window.getSelection) {

            child = win_sel.anchorNode || null;
            target = child.parentNode || null;

            start = win_sel.anchorOffset;
            end = win_sel.focusOffset;
            cursor_pos.string = win_sel.toString() || 'no text selected';

            if (target && target.hasChildNodes()) {
                current = target.firstChild;
            }

            while (current && (current !== child)) {
                if (current.nodeType === 3) {
                    offset += current.nodeValue.length;
                }
                current = current.nextSibling;
            }
            cursor_pos.offset = offset;

            offset = 0;

            if (target) {
                current = target.parentNode.firstChild;
            }
            else {
                current = null;
            }

            while (current && (current !== target)) {
                if (current.nodeType === 3) {
                    offset += current.nodeValue.length;
                }
                current = current.nextSibling;
            }
            cursor_pos.offset_tar = offset;

        }
        else if (document.selection) {

            // clone our original range
            tmp_rng = win_rng.duplicate();
            target = win_rng.parentElement();
            if (tmp_rng) {
                while (tmp_rng.moveStart("character", -1) !== 0) {
                    start += 1;
                }
                while (tmp_rng.moveEnd("character", -1) !== 0) {
                    end += 1;
                }
            }
            // create an empty container range
            cnt_rng = win.document.body.createTextRange();
            cnt_rng.moveToElementText(target);
            if (cnt_rng) {
                while (cnt_rng.moveStart("character", -1) !== 0) {
                    str_cnt += 1;
                }
            }
            start = start - str_cnt;
            end = end - str_cnt;

            cursor_pos.string = win_rng.text || 'no text selected';
        }
        cursor_pos.range = win_rng;
        cursor_pos.select = win_sel;
        cursor_pos.start = start;
        cursor_pos.end = end;
        cursor_pos.target = target;
        cursor_pos.max = msos.selection.get_node_txt_length(target);

        cursor_pos.pos_debug = {
            str: cursor_pos.start,
            end: cursor_pos.end,
            max: cursor_pos.max,
            offset: cursor_pos.offset,
            tar_off: cursor_pos.offset_tar,
            string: cursor_pos.string
        };
        if (child) {
            cursor_pos.pos_debug.child_name = child.nodeName;
            cursor_pos.pos_debug.child_id = (child.id || 'na');
        }
        if (target) {
            cursor_pos.pos_debug.target_name = target.nodeName;
            cursor_pos.pos_debug.target_id = (target.id || 'na');
        }
        cursor_pos.start = cursor_pos.start > 0 ? cursor_pos.start : 0;
        cursor_pos.end = cursor_pos.end > 0 ? cursor_pos.end : 0;
        cursor_pos.end = (cursor_pos.end < cursor_pos.start) ? cursor_pos.start : cursor_pos.end;

        cursor_pos.pos_debug.str_rev = cursor_pos.start;
        cursor_pos.pos_debug.end_rev = cursor_pos.end;

        msos.console.debug(temp_txt + ' - selection_str_end -> complete: ', cursor_pos.pos_debug);
        return cursor_pos;
    };

    this.set_start_end = function (target, start, end) {

        var flag_start = true,
            offset = 0,
            range = null,
            child = null,
            sel = null;

        if (window.getSelection) {

            // Trick to reset sibiling '#text' nodes to one continuous node.
            // 'edit_insert_html' adds a '#text' node per character in Moz & Opera,
            target.innerHTML = target.innerHTML;

            range = fb_sel.create_range();

            if (target && target.hasChildNodes()) {
                child = target.firstChild;
            }

            while (child) {
                if (child.nodeType === 3) {
                    if (flag_start) {
                        // Find the child with start index position
                        if (start <= (child.nodeValue.length + offset)) {
                            range.setStart(child, start - offset);
                            flag_start = false;
                        }
                    }
                    if (!flag_start) {
                        // Then the child with end index position
                        if (end <= (child.nodeValue.length + offset)) {
                            range.setEnd(child, end - offset);
                            break;
                        }
                    }
                    offset += child.nodeValue.length;
                }
                child = child.nextSibling;
            }
        }
        else if (document.selection) {
            fb_sel.select_elem_children(target);

            // Get the current selection/range
            sel = fb_sel.get_selection();
            range = fb_sel.get_range(sel);

            range.moveStart('character', start);
            range.collapse('true');
            if (start != end) {
                range.moveEnd('character', (end - start));
            }
        }
        return range;
    };

    this.get_type = function () {

        msos.console.debug(temp_txt + ' - get_type -> called.');

        var stype = "text",
            oSel, oRange;

        if (window.getSelection) {

            // Check if the actual selection is a CONTROL (IMG, TABLE, HR, etc...).
            try {
                oSel = fb_sel.get_selection();
                oRange = fb_sel.get_range(oSel);
            }
            catch (e) {
                msos.console.error('generate_object - get_type -> failed: ' + e);
            }

            if (oSel && oSel.rangeCount === 1) {
                if ((oRange.startContainer == oRange.endContainer) && ((oRange.endOffset - oRange.startOffset) === 1) && (oRange.startContainer.nodeType !== 3)) {
                    stype = "control";
                }
            }
            return stype;

        }
        else if (document.selection) {
            return doc.selection.type.toLowerCase();
        }
        else {
            return null;
        }
    };

    this.get_selected_elem = function () {

        var selection = null,
            oSel = null,
            oRange = null;

        if (fb_sel.get_type() == "control") {
            if (window.getSelection) {
                selection = fb_sel.get_selection();
                return selection.anchorNode.childNodes[selection.anchorOffset];
            }
            else if (document.selection) {
                oSel = fb_sel.get_selection();
                oRange = fb_sel.get_range(oSel);
                if (oRange && oRange.item) {
                    return doc.selection.createRange().item(0);
                }
            }
        }
        return null;
    };

    this.get_parent_elem = function () {

        var p = null,
            selection = null,
            node = null,
            oSel = null,
            oRange = null;

        if (fb_sel.get_type() == "control") {
            p = fb_sel.get_selected_elem();
            if (p) {
                return p.parentNode;
            }
        }
        else {
            if (window.getSelection) {
                selection = fb_sel.get_selection();
                if (selection) {
                    node = selection.anchorNode;
                    while (node && (node.nodeType !== 1)) { // not an element
                        node = node.parentNode;
                    }
                    return node;
                }
            }
            else if (document.selection) {
                oSel = fb_sel.get_selection();
                oRange = fb_sel.get_range(oSel);
                return oRange.parentElement();
            }
        }
        return null;
    };

    this.is_tag = function (node, tags) {

        var n_lc = '',
            i = 0,
            t_lc = '';

        if (node && node.tagName) {
            n_lc = node.tagName.toLowerCase();
            for (i = 0; i < tags.length; i += 1) {
                t_lc = String(tags[i]).toLowerCase();
                if (n_lc == t_lc) {
                    return t_lc;
                }
            }
        }
        return "";
    };

    this.get_parent_of_type = function (node, tags) {

        while (node) {
            if (fb_sel.is_tag(node, tags).length) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    };

    this.collapse = function (beginning) {

        var selection = null,
            oSel = null,
            oRange = null;

        // summary: clear current selection
        if (window.getSelection) {
            selection = fb_sel.get_selection();
            if (selection.removeAllRanges) { // Mozilla
                if (beginning) {
                    selection.collapseToStart();
                }
                else {
                    selection.collapseToEnd();
                }
            }
            else { // Safari
                // pulled from WebCore/ecma/kjswin.cpp, line 2536
                selection.collapse(beginning);
            }
        }
        else if (document.selection) { // IE
            oSel = fb_sel.get_selection();
            oRange = fb_sel.get_range(oSel);
            oRange.collapse(beginning);
            oRange.select();
        }
    };

    this.remove = function () {

        // summary: delete current selection
        var sel = null,
            i = 0;

        if (window.getSelection) { // Opera && Moz
            sel = fb_sel.get_selection();
            for (i = 0; i < sel.rangeCount; i += 1) {
                sel.getRangeAt(i).deleteContents();
            }
            return sel;
        }
        else { //IE
            sel = fb_sel.get_selection();
            if (sel.type.toLowerCase() != "none") {
                sel.clear();
            }
            return sel;
        }
    };

    this.select_elem_children = function (element) {

        var selection = null,
            range = null;

        if (window.getSelection) {
            selection = fb_sel.get_selection();
            if (selection.setBaseAndExtent) { // Safari
                selection.setBaseAndExtent(element, 0, element, element.innerText.length - 1);
            }
            else if (selection.removeAllRanges) { // Opera && Mozilla
                range = fb_sel.create_range();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
        else if (document.selection && document.body.createTextRange) { // IE
            range = element.ownerDocument.body.createTextRange();
            range.moveToElementText(element);
            range.select();
        }
    };

    msos.console.debug(temp_txt + ' -> done!');
};


// --------------------------
// Helper functions
// --------------------------
msos.selection.disable_selection = function (element, block_event) {
    "use strict";

    var temp_txt = 'msos.selection.disable_selection -> ',
        e = null,
        i = 0;

    if (msos.browser.is.Mozilla) {
        element.style.MozUserSelect = "none";
    }
    else {
        if (msos.browser.is.WebKit) {
            element.style.KhtmlUserSelect = "none";
        }
        else {
            if (msos.browser.is.IE || msos.browser.is.Opera) {
                element.unselectable = 'on';
                e = element.all[i];
                while (e) {
                    switch (e.tagName.toLowerCase()) {
                    case 'iframe':
                    case 'textarea':
                    case 'input':
                    case 'select':
                        /* Ignore the above tags */
                        break;
                    default:
                        e.unselectable = 'on';
                    }
                    i += 1;
                    e = element.all[i] || null;
                }
                element.unselectable = "on";
            }
            else {
                msos.console.warn(temp_txt + 'na for ' + navigator.userAgent);
                return false;
            }
        }
    }

    // This may not be necessary
    if (block_event) {
        jQuery(element).bind('mousedown', msos.do_nothing);
        jQuery(element).bind('mouseup', msos.do_nothing);
    }

    if (msos.config.verbose) {
        msos.console.debug(temp_txt + 'success: ' + (element.id || element.tagName.toLowerCase()));
    }
    return true;
};

// Get the text length of a node
msos.selection.get_node_txt_length = function (element) {
    "use strict";

    var elm_length = 0,
        tmp_node = null;

    if (element && element.hasChildNodes()) {
        tmp_node = element.firstChild;
    }

    while (tmp_node) {
        if (tmp_node.nodeType === 3) {
            elm_length += tmp_node.nodeValue.length;
        }
        tmp_node = tmp_node.nextSibling;
    }
    return elm_length;
};