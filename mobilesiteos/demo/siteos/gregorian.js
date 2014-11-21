// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.gregorian");
msos.require("msos.i18n.gregorian");
msos.require("msos.intl");

msos.config.google.no_translate.by_id.push('#gregorian_textarea');


msos.onload_functions.push(
    function () {
        "use strict";

        var text,
            culture = msos.config.intl.select_culture[msos.config.culture],
            language = msos.config.i18n.select_trans_msos[msos.config.locale];

        msos.console.info('Content: gregorian.html loaded!');

        jQuery('#current').html(
            '<div class="span6 text_rt">Language:       </div><div class="span6 text_lt"> ' + language + '</div>' +
            '<div class="span6 text_rt">Culture:        </div><div class="span6 text_lt"> ' + culture  + '</div>' +
            '<div class="span6 text_rt">Locale Code:    </div><div class="span6 text_lt"> ' + msos.config.locale + '</div>'
        );

        text = JSON.stringify(msos.i18n.gregorian.bundle, null, '\t');

        // Fill our textarea with WURLF Cap's data
        jQuery('#gregorian_textarea').val(text);
    }
);