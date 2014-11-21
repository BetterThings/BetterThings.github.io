// Copyright Notice:
//				    translate.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile ajax filled popup div functions

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("msos.translate");

msos.translate.version = new msos.set_version(13, 11, 6);

// Currently available Google Translate API language codes
// Ref. https://www.googleapis.com/language/translate/v2/languages?key=YOUR_GOOGLE_API_KEY_CODE
msos.translate.available = [
    "af", "ar", "be", "bg", "ca", "cs", "cy", "da", "de", "el", "en",
    "eo", "es", "et", "fa", "fi", "fr", "ga", "gl", "hi", "hr", "ht",
    "hu", "id", "is", "it", "iw", "ja", "ko", "lt", "lv", "mk", "ms",
    "mt", "nl", "no", "pl", "pt", "ro", "ru", "sk", "sl", "sq", "sr",
    "sv", "sw", "th", "tl", "tr", "uk", "vi", "yi", "zh", "zh-TW"
  ];

/* Example Google Output

{
	"error": {
		"errors": [
			{
				"domain": "usageLimits",
				"reason": "keyInvalid",
				"message": "Bad Request"
			}
		],
		"code": 400,
		"message": "Bad Request"
	}
}

{
	"data": {
		"translations": [ { "translatedText": "Hallo Welt" } ]
	}
}
*/

msos.translate.google_api_call = function (google_key, trans_from, trans_to, input_arry, on_api_success) {
    "use strict";

    var temp_tgc = 'msos.translate.google_api_call -> ',
        api_url = 'https://www.googleapis.com/language/translate/v2' + '?key=' + google_key,
        flag = true,
        i = 0;

    if (msos.config.verbose) {
        msos.console.debug(temp_tgc + 'start, source: ' + trans_from + ', target: ' + trans_to, input_arry);
    } else {
        msos.console.debug(temp_tgc + 'start.');
    }

    if (msos.var_is_empty(google_key)) {
        msos.console.error(temp_tgc + 'failed, missing api key!');
        flag = false;
    }

    if (msos.var_is_empty(trans_to)) {
            msos.console.error(temp_tgc + 'failed, missing target!');
        flag = false;
    }

    if (msos.var_is_empty(trans_from)) {
        msos.console.error(temp_tgc + 'failed, missing source!');
        flag = false;
    }

    if (msos.var_is_empty(input_arry) || input_arry.length < 1) {
        msos.console.error(temp_tgc + 'failed, no query parameters!');
        flag = false;
    }

    if (msos.var_is_empty(on_api_success) || !_.isFunction(on_api_success)) {
        msos.console.error(temp_tgc + 'failed, no callback function!');
        flag = false;
    }

    // Add source and target to uri string
	api_url += '&source=' + trans_from;
    api_url += '&target=' + trans_to;

    // Add text strings to query parameter
    for (i = 0; i < input_arry.length; i += 1) {
        api_url += '&q=' + _.escape(input_arry[i]);
    }

    if (flag) {
        jQuery.ajax({
            dataType: 'json',
            cache: false,
            url: api_url,
            success: [on_api_success, msos.ajax_success],
            error: msos.ajax_error,
            complete: msos.ajax_complete
        });
    }

    msos.console.debug(temp_tgc + 'done!');
};
