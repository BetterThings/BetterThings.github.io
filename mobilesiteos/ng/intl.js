
/*global
    msos: false,
    jQuery: false,
    angular: false
*/

msos.provide("ng.intl");
msos.require("msos.i18n");
msos.require("msos.intl");

ng.intl.version = new msos.set_version(14, 7, 19);


angular.intl.definition = {
    af: {
        msos: ["Afrikaanse", "Afrikaans"],
        trans: ["af", "AFRIKAANS"],
        kbrd: {
            en: ["ENLISH", "English", "English"]
        }
    },
    am: {
        angular: ["", "Amharic"]
    },
    ar: {
        msos: ["العربية", "Arabic"],
        both: ["ar", "ARABIC"]
    },
    be: {
        angular: ["", ""],
        msos: ["беларуская", "Belarusian"],
        both: ["be", "BELARUSIAN"]
    },
    bg: {
        msos: ["български", "Bulgarian"],
        both: ["bg", "BULGARIAN"]
    },
    bn: {
        angular: ["", "Bengali"]
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
        angular: ["", ""],
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
    fil: {
        angular: ["", "Filipino"]
    },
    fr: {
        msos: ["français", "French"],
        both: ["fr", "FRENCH"]
    },
    ga: {
        angular: ["", ""],
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
    gsw: {
        angular: ["", "Swiss German"]
    },
    gu: {
        angular: ["", "Gujarati"]
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
        angular: ["", ""],
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
    kn: {
        angular: ["", "Kannada"]
    },
    ko: {
        msos: ["한국어", "Korean"],
        both: ["ko", "KOREAN"]
    },
    ln: {
        angular: ["", "Lingala"]
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
        angular: ["", ""],
        msos: ["македонски", "Macedonian"],
        both: ["mk", "MACEDONIAN"]
    },
    ml: {
        angular: ["", "Malayalam"]
    },
    mr: {
        angular: ["", " 	Marathi"]
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
        angular: ["", ""],
        msos: ["norsk", "Norwegian"],
        both: ["no", "NORWEGIAN"]
    },
    or: {
        angular: ["", "Oriya"]
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
    ta: {
        angular: ["", "Tamil"]
    },
    te: {
        angular: ["", "Telugu"]
    },
    th: {
        msos: ["ภาษาไทย", "Thai"],
        both: ["th", "THAI"]
    },
    tl: {
        angular: ["", ""],
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
    ur: {
        angular: ["", "Urdu"]
    },
    vi: {
        msos: ["Việt", "Vietnamese"],
        trans: ["vi", "VIETNAMESE"]
    },
    yi: {
        angular: ["", ""],
        msos: ["ייִדי", "Yiddish"],
        trans: ["yi", "YIDDISH"]
    },
    zh: {
        msos: ["中文", "Chinese"],
        trans: ["zh-cn", "CHINESE_SIMPLIFIED"]
    },
    zh_tw: {
        msos: ["中国的传统", "Chinese Traditional"],
        trans: ["zh-tw", "CHINESE_TRADITIONAL"]
    },
    zu: {
        angular: ["", "Zulu"]
    }
};

angular.intl.init = function () {
    "use strict";
    
	msos.console.info('language select:',   msos.config.i18n.select_trans_msos);
	msos.console.info('culture select:',    msos.config.intl.select_culture);
};


msos.onload_func_done.push(angular.intl.init);