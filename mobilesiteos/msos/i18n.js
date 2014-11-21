// Copyright Notice:
//				    i18n.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile language internationalization functions
//
// **** Special note: Minify warning. The msos.i18n.definition and msos.i18n.alt sections don't always (ever?) compress well. **** 


/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("msos.i18n");
msos.require("msos.common");
msos.require("msos.i18n.common");   // common.json files define commonly used msos language specific strings
msos.require("msos.i18n.culture");  // culture.json files define available culture options for a language

msos.i18n.version = new msos.set_version(14, 3, 18);


// Use caching (normal is always 'true')
msos.i18n.cache = true;

msos.i18n.locale_select_elm = null;
msos.i18n.locale_select_func = function () {
	"use strict";

	var cfg = msos.config,
		com = msos.common;

	if (com.in_dom_jq_node(msos.i18n.locale_select_elm)) {
		com.gen_select_menu(
			msos.i18n.locale_select_elm,
			cfg.i18n.select_trans_msos,
			cfg.locale
		);
	}
};

// --------------------------
// MSOS i18n Available Language Matrix
// --------------------------

/*
    'msos'  - MobileSiteOS supported user display text and virtual keyboard layout
    'trans' - Available translation language (ref. google.language.Languages & google.language.isTranslatable)
    'kbrd'  - Keyboard layout for a language (ref. google.elements.keyboard)
    'both'  - Both 'trans' and 'kbrd' are the same values

    Important notes:

    'trans' without 'kbrd' implies that no lang. specific keyboard layout is available.
*/

msos.i18n.definition = {
    af: {
        msos: ["Afrikaanse", "Afrikaans"],
        trans: ["af", "AFRIKAANS"],
        kbrd: {
            en: ["ENLISH", "English", "English"]
        }
    },
    ar: {
        msos: ["العربية", "Arabic"],
        both: ["ar", "ARABIC"]
    },
    be: {
        msos: ["беларуская", "Belarusian"],
        both: ["be", "BELARUSIAN"]
    },
    bg: {
        msos: ["български", "Bulgarian"],
        both: ["bg", "BULGARIAN"]
    },
    ca: {
        msos: ["català", "Catalan"],
        both: ["ca", "CATALAN"]
    },
    cs: {
        msos: ["čeština", "Czech"],
        both: ["cs", "CZECH"]
    },
    cy: {
        msos: ["Cymraeg", "Welsh"],
        trans: ["cy", "WELSH"],
        kbrd: {
            en: ["ENLISH", "English", "English"]
        }
    },
    da: {
        msos: ["dansk", "Danish"],
        both: ["da", "DANISH"]
    },
    de: {
        msos: ["Deutsch", "German"],
        both: ["de", "GERMAN"]
    },
    el: {
        msos: ["ελληνικά", "Greek"],
        both: ["el", "GREEK"]
    },
    en: {
        msos: ["English", "English"],
        both: ["en", "ENGLISH"]
    },
    es: {
        msos: ["español", "Spanish"],
        trans: ["es", "SPANISH"],
        kbrd: {
            es_es: ["SPANISH", "español", "Spanish"]
        }
    },
    et: {
        msos: ["eesti keel", "Estonian"],
        both: ["et", "ESTONIAN"]
    },
    eu: {
        msos: ["Euskal", "Basque"],
        trans: ["eu", "BASQUE"],
        kbrd: {
            es_es: ["SPANISH", "español", "Spanish"]
        }
    },
    fa: {
        msos: ["Persų", "Persian"],
        both: ["fa", "PERSIAN"]
    },
    fi: {
        msos: ["suomi", "Finnish"],
        both: ["fi", "FINNISH"]
    },
    fr: {
        msos: ["français", "French"],
        both: ["fr", "FRENCH"]
    },
    ga: {
        msos: ["Irish", "Irish"],
        trans: ["ga", "IRISH"],
        kbrd: {
            en: ["ENLISH", "English", "English"]
        }
    },
    gl: {
        msos: ["Galego", "Galician"],
        both: ["gl", "GALICIAN"]
    },
    he: {
        msos: ["עִבְרִית", "Hebrew"],
        both: ["he", "HEBREW"] // note: "iw" for Google (why?)
    },
    hi: {
        msos: ["हिंदी", "Hindi"],
        both: ["hi", "HINDI"]
    },
    hr: {
        msos: ["hrvatski", "Croatian"],
        both: ["hr", "CROATIAN"]
    },
    ht: {
        msos: ["kreyòl ayisyen", "Haitian Creole"],
        trans: ["ht", "HAITIAN_CREOLE"],
        kbrd: {
            fr: ["FRENCH", "français", "French"]
        }
    },
    hu: {
        msos: ["Magyar", "Hungarian"],
        trans: ["hu", "HUNGARIAN"],
        kbrd: {
            hu_101: ["HUNGARIAN_101", "magyar(101)", "Hungarian (101)"]
        }
    },
    id: {
        msos: ["Indonesia", "Indonesian"],
        trans: ["id", "INDONESIAN"],
        kbrd: {
            en: ["ENLISH", "English", "English"]
        }
    },
    is: {
        msos: ["íslenska", "Icelandic"],
        both: ["is", "ICELANDIC"]
    },
    it: {
        msos: ["italiano", "Italian"],
        both: ["it", "ITALIAN"]
    },
    ja: {
        msos: ["日本語", "Japanese"],
        trans: ["ja", "JAPANESE"]
    },
    ko: {
        msos: ["한국어", "Korean"],
        both: ["ko", "KOREAN"]
    },
    lt: {
        msos: ["Lietuvos", "Lithuanian"],
        both: ["lt", "LITHUANIAN"]
    },
    lv: {
        msos: ["Latvijas", "Latvian"],
        both: ["lv", "LATVIAN"]
    },
    mk: {
        msos: ["македонски", "Macedonian"],
        both: ["mk", "MACEDONIAN"]
    },
    ms: {
        msos: ["Malajų", "Malay"],
        trans: ["ms", "MALAY"],
        kbrd: {
            en: ["ENLISH", "English", "English"]
        }
    },
    mt: {
        msos: ["Malti", "Maltese"],
        both: ["mt", "MALTESE"]
    },
    nl: {
        msos: ["Nederlands", "Dutch"],
        both: ["nl", "DUTCH"]
    },
    no: {
        msos: ["norsk", "Norwegian"],
        both: ["no", "NORWEGIAN"]
    },
    pl: {
        msos: ["polski", "Polish"],
        both: ["pl", "POLISH"]
    },
    pt: {
        msos: ["português brasileiro", "Brazilian Portuguese"],
        trans: ["pt", "BRAZILIAN_PORTUGUESE"],
        kbrd: {
            pt_br: ["BRAZILIAN_PORTUGUESE", "português brasileiro", "Brazilian Portuguese"]
        }
    },
    pt_pt: {
        msos: ["português europeu", "Portuguese"],
        both: ["pt-pt", "PORTUGUESE"]
    },
    ro: {
        msos: ["română", "Romanian"],
        both: ["ro", "ROMANIAN"]
    },
    ru: {
        msos: ["Pyccĸий", "Russian"],
        both: ["ru", "RUSSIAN"]
    },
    sk: {
        msos: ["slovenský", "Slovak"],
        both: ["sk", "SLOVAK"]
    },
    sl: {
        msos: ["slovenščina", "Slovenian"],
        both: ["sl", "SLOVENIAN"]
    },
    sq: {
        msos: ["shqip", "Albanian"],
        both: ["sq", "ALBANIAN"]
    },
    sr: {
        msos: ["Српски", "Serbian"],
        trans: ["sr", "SERBIAN"]
    },
    sv: {
        msos: ["svenska", "Swedish"],
        both: ["sv", "SWEDISH"]
    },
    sw: {
        msos: ["Kiswahili", "Swahili"],
        trans: ["sw", "SWAHILI"],
        kbrd: {
            en: ["ENLISH", "English", "English"]
        }
    },
    th: {
        msos: ["ภาษาไทย", "Thai"],
        both: ["th", "THAI"]
    },
    tl: {
        msos: ["Filipino", "Filipino"],
        trans: ["tl", "FILIPINO"],
        kbrd: {
            en: ["ENLISH", "English", "English"]
        }
    },
    tr: {
        msos: ["Türk", "Turkish"],
        trans: ["tr", "TURKISH"],
        kbrd: {
            tr_f: ["TURKISH_F", "Türkçe-F", "Turkish-F"],
            tr_q: ["TURKISH_Q", "Türkçe-Q", "Turkish-Q"]
        }
    },
    uk: {
        msos: ["Українська", "Ukrainian"],
        trans: ["uk", "UKRAINIAN"],
        kbrd: {
            uk_101: ["UKRAINIAN_101", "украї́нська (101)", "Ukrainian (101)"]
        }
    },
    vi: {
        msos: ["Việt", "Vietnamese"],
        trans: ["vi", "VIETNAMESE"]
    },
    zh: {
        msos: ["中文", "Chinese"],
        trans: ["zh-cn", "CHINESE_SIMPLIFIED"]
    },
    zh_tw: {
        msos: ["中国的传统", "Chinese Traditional"],
        trans: ["zh-tw", "CHINESE_TRADITIONAL"]
    },
    yi: {
        msos: ["ייִדי", "Yiddish"],
        trans: ["yi", "YIDDISH"]
    }
};

// Dojo Toolkit supported calendar languages and currencies
msos.i18n.dojo = {
    buddhist:   ["ar", "da", "de", "el", "en", "en_gb", "es", "fi", "fr", "hu", "it", "ja", "ko", "nb", "nl", "pl", "pt", "pt_pt", "ro", "ru", "sv", "th", "tr", "zh", "zh_hant"],
    currency:   ["ar", "ca", "cs", "da", "de", "el", "en", "en_au", "en_ca", "es", "fi", "fr", "he", "hu", "it", "ja", "ko", "nb", "nl", "pl", "pt", "ro", "ru", "sk", "sl", "sv", "th", "tr", "zh", "zh_hant", "zh_hk", "zh_tw"],
    gregorian:  ["ar", "ca", "cs", "da", "de", "el", "en", "en_au", "en_ca", "en_gb", "es", "fi", "fr", "fr_ch", "he", "hu", "it", "ja", "ko", "nb", "nl", "pl", "pt", "pt_pt", "ro", "ru", "sk", "sl", "sv", "th", "tr", "zh", "zh_hant", "zh_hk", "zh_tw"],
    islamic:    ["ar", "da", "de", "en", "en_gb", "es", "fi", "fr", "he", "hu", "it", "nb", "nl", "pl", "pt", "pt_pt", "ru", "sv", "th", "tr", "zh", "zh_hant"],
    hebrew:     ["ar", "el", "fi", "fr", "he", "hu", "nl", "ru", "sv", "th", "tr"]
};

// Some common Alt and Alt-Shift character arrays (ref. msos.keyboard.js)
msos.i18n.alt = [
    "", "¡", "²", "³", "¤", "€", "¼", "½", "¾", "‘", "’", "¥", "×", "ä", "å", "é", "®", "þ", "ü", "ú", "í", "ó", "ö", "«", "»", "¬", "á", "ß", "đ", "", "", "", "", "", "ø", "¶", "´", "", "æ", "", "©", "", "", "ñ", "µ", "ç", "", "¿"
];

msos.i18n.alt_shift = [
    "", "¹", "", "", "£", "", "", "", "", "", "", "", "÷", "Ä", "Å", "É", "", "Þ", "Ü", "Ú", "Í", "Ó", "Ö", "", "", "¦", "Á", "§", "Đ", "", "", "", "", "", "Ø", "°", "¨", "", "Æ", "", "¢", "", "", "Ñ", "", "Ç", "", ""
];

// Special mappings of lang code to language
msos.i18n.map_code_to_lang = {
    "pt": "pt-PT",
    "pt-br": "pt-PT",
    "he": "iw",
    "zlm": "ms",
    "zh-hans": "zh-CN",
    "zh-hant": "zh-TW"
    //,"zh-sg": "zh-CN"
    //,"zh-hk": "zh-TW"
    //,"zh-mo": "zh-TW"
};

// Right to Left Languages (used by MobileSiteOS)
msos.i18n.is_rtl = {
    "ar": true,
    "iw": true,
    "fa": true,
    "ur": true,
    "yi": true
};

// --------------------------
// MSOS i18n Logic for using Locale Matrix (ref. above explanation)
// --------------------------

msos.i18n.logic = function (lang) {
    "use strict";

    // msos.config.locale uses '-' for '_' (ie: zh-tw, not zh_tw)
    lang = lang.replace(/-/, '_');

    var code,
		lng_obj = {
			native_name : '',
			english_name : '',
			translation_code : '',
			keyboard_hash : {},
			keyboard_arry : [],
			kbd_layout : false
		},
		def = msos.i18n.definition[lang] || '';

    if (!def) {
		msos.console.error('msos.i18n.logic -> i18n def. na for: ' + lang);
		return lng_obj;
	}

	lng_obj.native_name  = def.msos[0];
	lng_obj.english_name = def.msos[1];

    if (def.both) {
		lng_obj.translation_code = def.both[0];
		// Build the hash
		lng_obj.keyboard_hash[lang] = [def.both[1], lng_obj.native_name, lng_obj.english_name];
		lng_obj.keyboard_arry.push(lang);
		lng_obj.kbd_layout = true;
    } else {
		lng_obj.translation_code = def.trans[0];
		if (def.kbrd) {
			lng_obj.keyboard_hash = def.kbrd;
			for (code in def.kbrd) {
				lng_obj.keyboard_arry.push(code);
			}
			lng_obj.kbd_layout = true;
		}
      }

    return lng_obj;
};

// --------------------------
// Replace %s's in i18n language strings
// --------------------------

msos.i18n.simple_printf = function (string, in_array) {
    "use strict";

    var i = 0;

	if (in_array && in_array.length > 0) {
        for (i = 0; i < in_array.length; i += 1) {
            string = string.replace(/%s/, in_array[i]);
        }
    }
	return string;
};

// --------------------------
// Setup i18n environment
// --------------------------

msos.i18n.set_environment = function () {
    "use strict";

    var set_txt = 'msos.i18n.set_environment -> ',
        cfg = msos.config,
		lang_code = '',
		lang_object = {};

    msos.console.debug(set_txt + 'start.');

    // Build some Std. Locale Selection hashes
    for (lang_code in msos.i18n.definition) {
        lang_object = msos.i18n.logic(lang_code);

        // All available languages for translation (Google)
        cfg.i18n.select_trans_msos[lang_code] = lang_object.native_name;

        // All available languages w/ keyboard layouts
        if (lang_object.kbd_layout) {
            cfg.i18n.select_kbrds_msos[lang_code] = lang_object.native_name;
        }
    }

    if (!cfg.i18n.select_trans_msos[msos.default_locale]) {
		msos.console.error(set_txt + 'msos.default_locale: "' + msos.default_locale + '", has no definition!');
    }

    msos.console.debug(set_txt + 'done, locale: ' + cfg.locale);
};


// --------------------------
// Start automated i18n loading
// --------------------------

msos.i18n.start = function () {
    "use strict";

    var str_txt = 'msos.i18n.start -> ',
        cfg = msos.config,
		target_locale = cfg.locale,
        target_culture = cfg.culture,
        lang_object;

    msos.console.debug(str_txt + 'start.');

    msos.i18n_order = msos.i18n.set_order(target_locale);

    // Update msos.config.locale to best available, (ROOT is just msos.default_locale)
    if (msos.i18n_order[0] !== 'ROOT')	{ cfg.locale = msos.i18n_order[0];	}
    else								{ cfg.locale = msos.default_locale;	}

    if (target_locale !== cfg.locale) {
		msos.console.info(str_txt + 'reset locale, from: ' + target_locale + ', to: ' + cfg.locale);
    }

    // Update msos.config.keyboard any time we change locale
    if (cfg.i18n.select_kbrds_msos[cfg.locale]) {
        cfg.keyboard = cfg.locale;
        cfg.keyboard_locales.push(cfg.locale);
    }

    msos.console.debug(str_txt + 'done, locale: ' + cfg.locale);
};

msos.i18n.set_order = function (target_locale) {
    "use strict";

    target_locale = jQuery.trim(target_locale);

    var temp_ord = 'msos.i18n.set_order -> ',
		available = msos.config.i18n.select_trans_msos,
		sub_str = target_locale.substr(0, 2),
		regex = new RegExp('^' + sub_str),
		next = '',
		build_order = [],
		j = 0;

    msos.console.debug(temp_ord + 'start, target locale: ' + target_locale);

    for (next in available) {
		if (regex.test(next)) { build_order.push(next); }	// just gathering all which match here
    }

    function by_match_idx(a, b) {
        var x = target_locale.substr(0, j) === a.substr(0, j) ? 1 : 0,
            y = target_locale.substr(0, j) === b.substr(0, j) ? 1 : 0;

        return y - x;
    }

    // Make sure only unique items in array
    build_order = _.uniq(build_order, true);

    // Sort build_order array by number of char's matched
    for (j = 1; j <= target_locale.length; j += 1) {
        build_order.sort(by_match_idx);
    }

    // Alway have some fallback (the JSON files in the root of the nls folder)
    build_order.push('ROOT');

    msos.console.debug(temp_ord + 'done!', build_order);
    return build_order;
};


// --------------------------
// Automated i18n loading (ref. msos.core.uc.js -> run_onload())
// --------------------------

msos.i18n.done = false;
msos.i18n.module_added = {};

msos.i18n.module_add = function () {
    "use strict";

    var temp_ma = 'msos.i18n.module_add -> ',
        reg_mod_name = '',
        i18n_name_array = [],
        mod_add_name = '',
        generic_name = '',
        base_name = '',
        base_obj = null,
        i = 0;

    msos.console.debug(temp_ma + 'start.');

    for (reg_mod_name in msos.registered_modules) {

        // Filter to only msos.i18n.xxx whatever modules loaded
        if (/^msos_i18n_/.test(reg_mod_name)) {

            i18n_name_array = reg_mod_name.split('_');
            generic_name = i18n_name_array.pop();
            base_name = i18n_name_array.join('.');
            mod_add_name = generic_name + '_' + msos.config.locale;

            // Get our msos.i18n... object (name space)
            base_obj = msos.gen_namespace(base_name);

            // Already loaded, so use it
            if (msos.i18n.module_added[mod_add_name]) {

                base_obj[generic_name] = msos.i18n.module_added[mod_add_name];

            } else {

                // Setup current msos.i18n.xxx object with new msos.i18n.obj based on this locale
                base_obj[generic_name] = new msos.i18n.obj();
                base_obj[generic_name].bundle_name = reg_mod_name;
                base_obj[generic_name].bundle_order = [].concat(msos.i18n_order);   // as determined in msos.i18n.start() (so all widget modules have access to locale)
                base_obj[generic_name].bundle_locale = msos.config.locale;          // as checked, set in msos.i18n.start() to best available

                if (msos.config.verbose) {
                    msos.console.debug(temp_ma + 'added ' + base_name + '.' + generic_name + ':', base_obj[generic_name]);
                } else {
                    msos.console.debug(temp_ma + 'added ' + base_name + '.' + generic_name);
                }

                // Build bundle by resource url
                base_obj[generic_name].build_bundle_urls();

                // Save it (static files)
                msos.i18n.module_added[mod_add_name] = base_obj[generic_name];
            }
        }
    }

    msos.console.debug(temp_ma + ' done!');
};

msos.i18n.set_select = function (locale_elm) {
    "use strict";

    var temp_ss = 'msos.i18n.set_select -> ',
        debounce_locale_select = _.debounce(msos.i18n.on_locale_change, 100);

    msos.console.debug(temp_ss + 'start.');

    // if our 'locale' select is in the page, add event handler
    if (locale_elm
     && locale_elm.length
     && msos.common.valid_jq_node(locale_elm, 'select')) {

        // Stop (as much as possible) multiple calls from 'onchange' event
        locale_elm.change(debounce_locale_select);

        msos.i18n.locale_select_elm = locale_elm;

        // Run update to fill initially
        msos.i18n.locale_select_func();
    }

    msos.console.debug(temp_ss + 'done!');
};

msos.i18n.on_locale_change = function () {
    "use strict";

    var temp_lc = 'msos.i18n.on_locale_change',
        cfg = msos.config,
        locale_val = jQuery.trim(msos.i18n.locale_select_elm.val()) || '';

    msos.console.debug(temp_lc + 'start.');

    // Locale select changed...
    if (locale_val
     && locale_val !== cfg.locale
     && cfg.i18n.select_trans_msos[locale_val]) {

        // Clear previous selection hashes (for new locale)
        cfg.intl.select_culture = {};
        cfg.intl.select_calendar = {};

        cfg.locale = locale_val;

        msos.i18n.start();

        if (msos.intl) {
            // Run when the new msos.i18n.culture.bundle is ready
            msos.onload_func_done.push(msos.intl.start);
        }

        if (msos.google
         && msos.google.translate) {
            msos.google.translate.update(locale_val);
        }

        msos.console.debug(temp_lc + 'update: ' + locale_val);

        // Run our module updating now
        msos.run_onload();
    }

    msos.console.debug(temp_lc + 'done!');
};

msos.i18n.lang_object_delete = function (module, lang) {
    "use strict";

    var temp_lod = 'msos.i18n.lang_object_delete -> module: ' + module + ', lang: ' + lang;

    if (delete msos.i18n[module][lang]) { msos.console.debug(temp_lod + ' deleted'); }
    else                                {  msos.console.warn(temp_lod + ' failed');  }
};


// --------------------------
// MSOS i18n Output Bundle Building Functions
// --------------------------
msos.i18n.obj = function () {
    "use strict";

    this.bundle = {};
    this.bundle_name = '';
    this.bundle_locale = '';
    this.bundle_order = [];
    this.build_urls = [];
    this.build_index = 0;
    this.bundle_complete = function () {
        return true;
    }; // Do something after bundle is finished
    var temp_txt = 'msos.i18n.obj',
        self = this;

    this.build_bundle_urls = function () {

        var temp_ord = ' - build_bundle_urls -> ',
            name_array = self.bundle_name.split('_'),
            file = '',
            folder = '',
            i = 0,
            lang_path = '';

        file = name_array.pop();
        name_array.splice(1, 1); // remove i18n part
        folder = name_array.join('/');

        for (i = 0; i < self.bundle_order.length; i += 1) {
            lang_path = self.bundle_order[i];
            if (lang_path === 'ROOT') {
                lang_path = '';
            }
            else {
                lang_path += '/';
            }

            self.build_urls[i] = msos.resource_url(folder + '/nls', lang_path + file + '.json');

            // Increment queue now (so it will best relect waiting ajax calls)
            msos.i18n_queue += 1;
        }

        // Start the ajax process
        self.get_json();

        if (msos.config.verbose) {
            msos.console.debug(temp_txt + temp_ord + 'done, urls: ', self.build_urls);
        }
    };

    this.build_bundle = function (data) {

        var key = '';

        msos.console.debug(temp_txt + ' - build_bundle -> start: ' + self.build_urls[self.build_index]);

        // We keep adding key/val pairs as provided by loaded json files
        for (key in data) {
            if (!self.bundle[key]) {
                self.bundle[key] = data[key];
            }
        }

        // If more url's, continue loading
        self.build_index += 1;
        if (self.build_urls[self.build_index]) {
            self.get_json();
        }
        else {
            // All done, store the current 'locale' bundle.
            self[self.bundle_locale] = {};

            key = '';
            for (key in self.bundle) {
                self[self.bundle_locale][key] = self.bundle[key];
            }

            // Run added function (ie: late loading additional locales)
            self.bundle_complete();
        }
        msos.console.debug(temp_txt + ' - build_bundle -> done!');
    };

    this.did_bundle_load = function () {

        msos.i18n_queue -= 1;

        var did_txt = ' - did_bundle_load -> ',
            bnd_txt = self.build_index + ' of ' + self.build_urls.length + ' for ' + self.bundle_name + ', i18n queue: ' + msos.i18n_queue,
            bundle_size = 0;

        // Test if done...
        if (self.build_index === self.build_urls.length) {

            // Simple check that we have a valid name and that something is in the bundle
            bundle_size = _.size(self.bundle);
            if (bundle_size > 0 && typeof msos.registered_modules[self.bundle_name] === 'boolean') {
                // Good, so register it loaded
                msos.registered_modules[self.bundle_name] = true;
                if (msos.config.verbose) {
                    msos.console.debug(temp_txt + did_txt + 'registered: ' + bnd_txt);
                }
            }
            else {
                msos.console.error(temp_txt + did_txt + 'problem loading: ' + bnd_txt);
            }
        }
        else {
            if (msos.config.verbose) {
                msos.console.debug(temp_txt + did_txt + 'working on index: ' + bnd_txt);
            }
        }
    };

    this.get_json = function () {

        if (msos.config.verbose) {
            msos.console.debug(temp_txt + ' - get_json -> called for: ' + self.build_urls[self.build_index]);
        }
        jQuery.ajax({
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            cache: msos.i18n.cache,
            // ** Very important: S.O.P. is to Cache required i18n JSON files. They are static files!
            url: self.build_urls[self.build_index],
            success: [self.build_bundle, msos.ajax_success],
            error: self.build_ajax_error,
            complete: [self.did_bundle_load, msos.ajax_complete]
        });
    };

    this.build_ajax_error = function (xhr, status, error) {

        var use_msg = 'status: ' + xhr.status + ', error: ' + error + ', ' + 'ref. i18n queue ' + msos.i18n_queue + ', ' + self.bundle_name + ', locale: ' + self.bundle_locale;

        // With i18n, we acknowledge a failure...
        msos.console.warn(temp_txt + ' - build_ajax_error -> ' + use_msg);

        // But continue if more url's are left (ie: ROOT should always be available)
        self.build_index += 1;
        if (self.build_urls[self.build_index]) {
            self.get_json();
        }
        else {
            msos.ajax_error(xhr, status, error);
        }
    };

    this.sub_in = function (key, params) {

        var out_string = 'na';

        if (self.bundle && self.bundle[key]) {
            out_string = self.bundle[key];
        }
        return self.printf(out_string, params);
    };

    this.printf = function (in_str, list) {
        if (!list) {
            return in_str;
        }

        var build = "",
            sub_array = in_str.split("%s"),
            i = 0;

        for (i = 0; i < list.length; i += 1) {
            if (sub_array[i].lastIndexOf('%') == sub_array[i].length - 1 && i != list.length - 1) {
                sub_array[i] += "s" + sub_array.splice(i + 1, 1)[0];
                build += sub_array[i] + list[i];
            }
        }
        build += sub_array[sub_array.length - 1];
        return build;
    };

    this.build_additional_locales = function (add_locale) {

        var temp_loc = ' - build_additional_locales -> ';

        msos.console.debug(temp_txt + temp_loc + 'start, for: ' + add_locale);

        if (self[add_locale]) {
            // Warn them, but use it...
            msos.console.warn(temp_txt + temp_loc + 'skipped, (already defined!)');
            self.bundle_complete();
            return;
        }

        // 'zero' (almost) everthing out
        self.bundle = {};
        self.bundle_locale = add_locale;
        self.bundle_order = [];
        self.build_urls = [];
        self.build_index = 0;

        // Set new 'build_order' for this new locale
        self.bundle_order = msos.i18n.set_order(add_locale);

        // Build new bundle urls, using new build_order for 'add_locale' language
        self.build_bundle_urls();

        msos.console.debug(temp_txt + temp_loc + 'done!');
    };
};

// Do setup, (only once)
msos.i18n.set_environment();

// Ref. msos.i18n.on_locale_change
msos.i18n.start();
