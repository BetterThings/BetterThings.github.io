// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.editiframe");
msos.require("msos.iframe");
msos.require("msos.input.select");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: editiframe.html loaded!');

        if (!msos.config.browser.editable) {

            alert('Iframe editing is not available!');

        } else {

            var editable_obj = {
                    tool_target: null,
                    tool_iframe: null
                },
                iframe_obj = {
                    test_iframe: 'demo/simple_debug.html'
                },
                bks_but = msos.byid('bksp_button'),
                del_but = msos.byid('dele_button'),
                insert_html = function (evt) {
                    msos.do_nothing(evt);

                    var html_value = jQuery('#text_input').val() || '',
                        iframe_elm = jQuery('#test_iframe')[0];

                    // Insert our new html
                    msos.input.select.edit_insert_html(iframe_elm, html_value);
                    if (msos.debug) { msos.debug.event(evt, "\nInsert HTML onclick"); }
                },
                cursor_pos = function (evt) {
                    msos.do_nothing(evt);

                    var iframe_elm = jQuery('#test_iframe')[0],
                        selection_obj = new msos.selection.generate_object(iframe_elm),
                        cursor_position = selection_obj.selection_str_end();

                    if (msos.debug) { msos.debug.event(evt, "\nCursor Position onclick"); }
                    alert('Cursor position start: ' + cursor_position.start + ', end: ' + cursor_position.end);
                },
                delete_char = function (evt) {
                    msos.do_nothing(evt);
                    var target = 'na';
                     if (editable_obj.tool_target) {
                        target = editable_obj.tool_target.nodeName;
                        msos.input.select.set_bksp_del_select(editable_obj.tool_iframe, false);
                    }
                    if (msos.debug) {
                        msos.debug.event(evt, "\nDelete Character :\nIframe target -> " + target);
                    }
                },
                bk_spc_char = function (evt) {
                    msos.do_nothing(evt);
                    var target = 'na';
                    if (editable_obj.tool_target) {
                        target = editable_obj.tool_target.nodeName;
                        msos.input.select.set_bksp_del_select(editable_obj.tool_iframe, true);
                    }
                    if (msos.debug) {
                        msos.debug.event(evt, "\nBackspace 1 Character :\nIframe target -> " + target);
                    }
                };

            // Create our 'onmousedown/up' events for iframe element(s)
            msos.iframe.set_event(editable_obj, iframe_obj);

            // Add our button functions
            jQuery('#input_button').click(insert_html);
            jQuery('#cursor_button').click(cursor_pos);

            // Add our backspace and delete routines
            jQuery(bks_but).click(bk_spc_char);
            jQuery(del_but).click(delete_char);

            // Ensure focus remains on iframe
            jQuery(bks_but)
                .mousedown(msos.do_nothing)
                .mouseup(msos.do_nothing);
            jQuery(del_but)
                .mousedown(msos.do_nothing)
                .mouseup(msos.do_nothing);
        }
    }
);