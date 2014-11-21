// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.culture");
msos.require("msos.i18n");
msos.require("msos.intl");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: culture.html loaded!');

        var update_config = function () {
                var text = JSON.stringify(msos.config, null, '\t'),
                    config_textarea = jQuery('#config_textarea');

                config_textarea.val('');

                // Give some indication something happened...
                setTimeout(function () { config_textarea.val(text); }, 500);
            },
            update_lang = function () {
                var lang_logic = msos.i18n.logic(msos.config.locale),
                    text = JSON.stringify(lang_logic, null, '\t'),
                    lang_textarea = jQuery('#lang_obj_textarea');

                lang_textarea.val('');

                // Give some indication something happened...
                setTimeout(function () { lang_textarea.val(text); }, 500);
            };

        // For msos.i18n
        msos.i18n.set_select(
            jQuery('select#locale')
        );

        // For msos.intl
        msos.intl.set_selects(
            jQuery('select#culture'),
            jQuery('select#calendar'),
            jQuery('select#keyboard')
        );

        // Demo: Add functions to run after language and culture changes.
        jQuery('select#locale,select#culture,select#calendar,select#keyboard').change(update_config).change(update_lang);

        // Run initial displays
        update_config();
        update_lang();
    }
);