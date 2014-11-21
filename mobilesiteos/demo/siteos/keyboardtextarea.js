// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.keyboardtextarea");
msos.require("msos.common");
msos.require("msos.i18n");
msos.require("msos.intl");
msos.require("msos.keyboard");
msos.require("msos.tools.kbdpos");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: keyboardtextarea.html loaded!');

        var text_input_1 = msos.byid("keyboard_textarea"),
            text_input_2 = msos.byid("keyboard_inp_text"),
            vt_kb_tool_obj = {},
            button_config_s = {},
            keyb_button1 = null,
            keyb_button2 = null,
            kb_butt_obj_s1 = null,
            kb_butt_obj_s2 = null,
            val = '',
            button_config_r = {},
            res_button = null,
            kb_butt_obj_r = null;

        // For msos.i18n
        msos.i18n.set_select(
            jQuery('select#locale')
        );

        // For msos.intl
        msos.intl.set_selects(
            null,
            null,
            jQuery('select#keyboard')
        );

        // Get our keyboard tool, register inputs
        vt_kb_tool_obj = msos.keyboard.get_tool();
        vt_kb_tool_obj.vk_register_input(text_input_1);
        vt_kb_tool_obj.vk_register_input(text_input_2);

        // Configure our keyboard start button...
        button_config_s = {
            btn_title:      vt_kb_tool_obj.i18n.button_title,
            icon_class:     'btn btn-msos fa fa-keyboard-o',
            btn_onclick:    function () {
                vt_kb_tool_obj.set_input_focus_end(text_input_1);
                vt_kb_tool_obj.keyb_toggle_onmouseup();
            }
        };

        // Generate our keyboard start button...
        keyb_button1 = msos.byid("keyboard_button1");
        kb_butt_obj_s1 = new msos.common.generate_button(keyb_button1);

        // And append the button into our document...
        for (val in button_config_s) {
            kb_butt_obj_s1[val] = button_config_s[val];
        }

        kb_butt_obj_s1.generate_icon_button();

        // Reset to next button. We use multiple buttons for mobile so we don't need to
        // have user tap the input field (which opens up the browser v-keyboard).
        button_config_s.btn_onclick = function () {
            vt_kb_tool_obj.set_input_focus_end(text_input_2);
            vt_kb_tool_obj.keyb_toggle_onmouseup();
        };

        // Generate our keyboard start button...
        keyb_button2 = msos.byid("keyboard_button2");
        kb_butt_obj_s2 = new msos.common.generate_button(keyb_button2);

        // And append the button into our document...
        for (val in button_config_s) {
            kb_butt_obj_s2[val] = button_config_s[val];
        }

        kb_butt_obj_s2.generate_icon_button();


        // *******************
        // Optional 'demo' aids
        // *******************

        // Configure a keyboard input reset button...
        button_config_r = {
            btn_title:	'Delete contents of input element',
            icon_class: 'btn btn-danger fa fa-eraser',
            btn_onclick: function () {
                if (vt_kb_tool_obj.tool_target
                 && vt_kb_tool_obj.tool_target.value) { vt_kb_tool_obj.tool_target.value = ''; }
            }
        };

        // Generate our keyboard reset button...
        res_button = msos.byid("reset_button");
        kb_butt_obj_r = new msos.common.generate_button(res_button);

        // And append the button into our document...
        for (val in button_config_r) {
            kb_butt_obj_r[val] = button_config_r[val];
        }

        kb_butt_obj_r.generate_icon_button();

        // Set init. focus to textarea (or which ever text input you want).
        // This is optional and only works for text or textarea inputs.
        vt_kb_tool_obj.set_input_focus_end(text_input_1);

        // This is for sizing a new keyboard display (not a typically used function)
        jQuery('#gen_size_css').click(
            function () {
                vt_kb_tool_obj.keyb_toggle_onmouseup();     // Creates the keyboard if not already done...
                msos.tools.kbdpos.calc(vt_kb_tool_obj);
                // Output our calculated css text to the textarea for a
                // copy/past to ./css/size/some-size_kbd.css file
                jQuery(text_input_1).val(msos.tools.kbdpos.output_css);
            }
        );
    }
);