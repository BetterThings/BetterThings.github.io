// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.globalizationjson");
msos.require("msos.intl");

msos.config.google.no_translate.by_id.push('#globalize_textarea');


msos.onload_functions.push(
    function () {
        "use strict";

        var text,
            culture = msos.config.intl.select_culture[msos.config.culture],
            language = msos.config.i18n.select_trans_msos[msos.config.locale];

        msos.console.info('Content: globalizationjson.html loaded!');

        jQuery('#current').html(
            '<div class="span6 text_rt">Language:       </div><div class="span6 text_lt"> ' + language + '</div>' +
            '<div class="span6 text_rt">Culture:        </div><div class="span6 text_lt"> ' + culture  + '</div>' +
            '<div class="span6 text_rt">Locale Code:    </div><div class="span6 text_lt"> ' + msos.config.locale + '</div>'
        );

        text = JSON.stringify(msos.intl.culture, null, '\t');

        // Fill our textarea with culture data
        jQuery('#globalize_textarea').val(text);
    }
);