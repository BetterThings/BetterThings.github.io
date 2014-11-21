// Copyright Notice:
//			    	diacritic.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	OpenSiteMobile diacritic characters file
	Important: do not compress this file (may cause erratic results)
*/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.diacritic");

msos.diacritic.version = new msos.set_version(13, 6, 14);


msos.diacritic.definition = {
    acute : [
	["a", "á"], ["e", "é"], ["i", "í"], ["o", "ó"],
	["u", "ú"], ["y", "ý"], ["A", "Á"], ["E", "É"],
	["I", "Í"], ["O", "Ó"], ["U", "Ú"], ["Y", "Ý"],
	["c", "ć"], ["C", "Ć"], ["l", "ĺ"], ["L", "Ĺ"],
	["m", "ḿ"], ["M", "Ḿ"], ["n", "ń"], ["N", "Ń"],
	["r", "ŕ"], ["R", "Ŕ"], ["s", "ś"], ["S", "Ś"],
	["z", "ź"], ["Z", "Ź"], ["Α", "Ά"], ["Ε", "Έ"],
	["Η", "Ή"], ["Ι", "Ί"], ["Ο", "Ό"], ["Υ", "Ύ"],
	["Ω", "Ώ"], ["α", "ά"], ["ε", "έ"], ["η", "ή"],
	["ι", "ί"], ["ο", "ό"], ["υ", "ύ"], ["ω", "ώ"],
	["W", "Ẃ"], ["w", "ẃ"], ["´", "´"]
    ],
    breve : [
	["a", "ă"], ["e", "ĕ"], ["i", "ĭ"], ["o", "ŏ"],
	["u", "ŭ"], ["A", "Ă"], ["E", "Ĕ"], ["I", "Ĭ"],
	["O", "Ŏ"], ["U", "Ŭ"], ["y", "y̆"], ["Y", "Y̆"],
	["g", "ğ"], ["G", "Ğ"], ["˘", "˘"]
    ],
    caron : [
	["c", "č"], ["C", "Č"], ["d", "ď"], ["D", "Ď"],
	["e", "ě"], ["E", "Ě"], ["n", "ň"], ["N", "Ň"],
	["r", "ř"], ["R", "Ř"], ["s", "š"], ["S", "Š"],
	["t", "ť"], ["T", "Ť"], ["z", "ž"], ["Z", "Ž"],
	["l", "ľ"], ["L", "Ľ"], ["ˇ", "ˇ"]
    ],
    cedilla : [
	["c", "ç"], ["C", "Ç"], ["g", "ģ"], ["G", "Ģ"],
	["k", "ķ"], ["K", "Ķ"], ["l", "ļ"], ["L", "Ļ"],
	["n", "ņ"], ["N", "Ņ"], ["r", "ŗ"], ["R", "Ŗ"],
	["s", "ş"], ["S", "Ş"], ["t", "ţ"], ["T", "Ţ"],
	["¸", "¸"]
    ],
    circumflex : [
	["a", "â"], ["A", "Â"], ["e", "ê"], ["E", "Ê"],
	["i", "î"], ["I", "Î"], ["o", "ô"], ["O", "Ô"],
	["c", "ĉ"], ["C", "Ĉ"], ["g", "ĝ"], ["G", "Ĝ"],
	["h", "ĥ"], ["H", "Ĥ"], ["j", "ĵ"], ["J", "Ĵ"],
	["s", "ŝ"], ["S", "Ŝ"], ["u", "û"], ["U", "Û"],
	["w", "ŵ"], ["W", "Ŵ"], ["y", "ŷ"], ["Y", "Ŷ"],
	["^", "^"]
    ],
    dotabove : [
	["c", "ċ"], ["C", "Ċ"], ["g", "ġ"], ["G", "Ġ"],
	["z", "ż"], ["Z", "Ż"], ["e", "ė"], ["E", "Ė"],
	["n", "ṅ"], ["N", "Ṅ"], ["m", "ṁ"], ["M", "Ṁ"],
	["b", "ḃ"], ["B", "Ḃ"], ["˙", "˙"]
    ],
    doubleacute : [
	["o", "ő"], ["O", "Ő"], ["u", "ű"], ["U", "Ű"],
	["˝", "˝"]
    ],
    grave : [
	["a", "à"], ["e", "è"], ["i", "ì"], ["o", "ò"], ["u", "ù"],
	["A", "À"], ["E", "È"], ["I", "Ì"], ["O", "Ò"], ["U", "Ù"],
	["W", "Ẁ"], ["w", "ẁ"], ["Y", "Ỳ"], ["y", "ỳ"], ["m", "m̀"],
	["M", "M̀"], ["n", "ǹ"], ["N", "Ǹ"], ["`", "`"]
    ],
    ogonek : [
	["i", "į"], ["o", "ǫ"], ["u", "ų"],
	["I", "Į"], ["O", "Ǫ"], ["U", "Ų"], ["˛", "˛"]
    ],
    ring : [
	["a", "å"], ["A", "Å"], ["u", "ů"], ["U", "Ů"],
	["°", "°"]
    ],
    tilde : [
	["a", "ã"], ["o", "õ"], ["n", "ñ"], ["A", "Ã"],
	["O", "Õ"], ["i", "ĩ"], ["I", "Ĩ"], ["u", "ũ"],
	["U", "Ũ"], ["N", "Ñ"], ["e", "ẽ"], ["E", "Ẽ"],
	["y", "ỹ"], ["Y", "Ỹ"], ["g", "g̃"], ["G", "G̃"],
	["~", "~"]
    ],
    umlaut : [
	["a", "ä"], ["e", "ë"], ["i", "ï"], ["o", "ö"],
	["u", "ü"], ["y", "ÿ"], ["A", "Ä"], ["E", "Ë"],
	["I", "Ï"], ["O", "Ö"], ["U", "Ü"], ["Y", "Ÿ"],
	["Ι", "Ϊ"], ["Υ", "Ϋ"], ["ι", "ϊ"], ["υ", "ϋ"],
	["¨", "¨"]
    ],
    dialytika_tonos : [
	["ι", "ΐ"], ["φ", "ΰ"], ["΅", "΅"]
    ]
};

msos.diacritic.mark = function (character_set) {
    "use strict";

    var diacritic_hash = {
			acute: "´",
			breve: "˘",
			caron: "ˇ",
			cedilla: "¸",
			circumflex: "^",
			dotabove: "˙",
			doubleacute: "˝",
			grave: "`",
			ogonek: "˛",
			ring: "°",
			tilde: "~",
			umlaut: "¨",
			dialytika_tonos: "΅"
		},
        add = [],
        dia = '',
        idx = 0,
        find_char = '',
        found = 0,
        i = 0,
        chk_idx = 0,
        added_diac = '';

    for (dia in diacritic_hash) {
		idx = _.indexOf(character_set, diacritic_hash[dia]);
		if (idx !== -1) {
			// We found a diacritic base character
			find_char = msos.diacritic.definition[dia] || null;
			found = 0;
			// ...now determine if there is a 'common' character to substitute for
			for (i = 0; i < find_char.length; i += 1) {
				chk_idx = _.indexOf(character_set, find_char[i][0]);
				if (chk_idx !== -1) {
					found += 1;
				}
			}
			// We found a character to replace, so set up diacritic substitution
			if (found > 1) {
				character_set[idx] = [diacritic_hash[dia], dia];
				add.push(dia);
			}
		}
    }

    if (add.length > 0) {
        added_diac = add.join(', ');
        msos.console.debug('msos.diacritic.mark -> found: ' + added_diac);
    }
};

msos.diacritic.find_replace = function (character_set, name) {
    "use strict";

    var replace = msos.diacritic.definition[name] || null,
        temp_text = 'msos.diacritic.find_replace -> ',
        add = [],
        i = 0,
        idx = 0,
        added_diac = '';

    if (replace) {
        for (i = 0; i < replace.length; i += 1) {
            idx = _.indexOf(character_set, replace[i][0]);
            if (idx !== -1) {
                character_set[idx] = replace[i][1];
                add.push(replace[i][1]);
            }
        }
        if (add.length > 0) {
            added_diac = add.join(', ');
            msos.console.debug(temp_text + 'replaced with: ' + added_diac);
        }
    }
    else {
        msos.console.error(temp_text + 'failed for: ' + name);
    }
    return add.length;
};