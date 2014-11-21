// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.keyboardiframe");
msos.require("msos.common");
msos.require("msos.keyboard");
msos.require("msos.i18n");      // msos.i18n.keyboard ensures msos.i18n loads, but here for ref.
msos.require("msos.intl");
msos.require("msos.i18n.keyboard");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: keyboardiframe.html loaded!');

        var vt_kb_tool_obj = null,
            iframe_elm = msos.byid('pub_ta_iframe'),
            button_config_s = {},
            keyb_button = null,
            kb_butt_obj_s = null,
            val = '';

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

        vt_kb_tool_obj = msos.keyboard.get_tool();
        vt_kb_tool_obj.vk_register_input(iframe_elm);

        // Important: after the iframe is registered, load it (set src)
        jQuery(iframe_elm).attr('src', 'debug.html');

        // Configure our keyboard start button...
        button_config_s = {
            btn_title:      vt_kb_tool_obj.i18n.button_title,
            icon_class:     'btn btn-msos fa fa-keyboard-o',
            btn_onclick:    vt_kb_tool_obj.keyb_toggle_onmouseup
        };

        // Generate our keyboard start button...
        keyb_button = msos.byid("keyboard_button");
        kb_butt_obj_s = new msos.common.generate_button(keyb_button);

        // And append the button into our document...
        for (val in button_config_s) {
            kb_butt_obj_s[val] = button_config_s[val];
        }
        kb_butt_obj_s.generate_icon_button();
    }
);