// Copyright Notice:
//					countrystate.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	OpenSiteMobile country/state/city select functions

	This script borrows from other sources:

	    Down Home Consulting :: http://downhomeconsulting.com
	    Country State Drop Downs v1.0
	    - and -
	    Shafiul Azam - ishafiul@gmail.com
            country_state.js Version 2.0
*/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.countrystate");
msos.require("msos.common");

msos.countrystate.version = new msos.set_version(13, 12, 7);


msos.countrystate.states_url = msos.resource_url('msos', 'states');

msos.countrystate.country_elm = null;
msos.countrystate.state_elm = null;

msos.countrystate.state_by_country = {};

msos.countrystate.country = {
    "AF": "Afghanistan",
    "AX": "Aland Islands",
    "AL": "Albania",
    "DZ": "Algeria",
    "AS": "American Samoa",
    "AD": "Andorra",
    "AO": "Angola",
    "AI": "Anguilla",
    "AQ": "Antarctica",
    "AG": "Antigua and Barbuda",
    "AR": "Argentina",
    "AM": "Armenia",
    "AW": "Aruba",
    "AU": "Australia",
    "AT": "Austria",
    "AZ": "Azerbaijan",
    "BS": "Bahamas",
    "BH": "Bahrain",
    "BD": "Bangladesh",
    "BB": "Barbados",
    "BY": "Belarus",
    "BE": "Belgium",
    "BZ": "Belize",
    "BJ": "Benin",
    "BM": "Bermuda",
    "BT": "Bhutan",
    "BO": "Bolivia",
    "BA": "Bosnia And Herzegovina",
    "BW": "Botswana",
    "BV": "Bouvet Island",
    "BR": "Brazil",
    "IO": "British Indian Ocean Territory",
    "VG": "British Virgin Islands",
    "BN": "Brunei Darussalam",
    "BG": "Bulgaria",
    "BF": "Burkina Faso",
    "BI": "Burundi",
    "KH": "Cambodia",
    "CM": "Cameroon",
    "CA": "Canada",
    "CV": "Cape Verde",
    "KY": "Cayman Islands",
    "CF": "Central African Republic",
    "TD": "Chad",
    "CL": "Chile",
    "CN": "China",
    "CX": "Christmas Island",
    "CC": "Cocos (Keeling) Islands",
    "CO": "Colombia",
    "KM": "Comoros",
    "CD": "Congo, Democratic Republic of the",
    "CG": "Congo, The Republic of",
    "CK": "Cook Islands",
    "CR": "Costa Rica",
    "CI": "Cote d'Ivoire",
    "HR": "Croatia",
    "CU": "Cuba",
    "CY": "Cyprus",
    "CZ": "Czech Republic",
    "DK": "Denmark",
    "DJ": "Djibouti",
    "DM": "Dominica",
    "DO": "Dominican Republic",
    "TP": "East Timor",
    "EC": "Ecuador",
    "EG": "Egypt",
    "SV": "El Salvador",
    "GQ": "Equatorial Guinea",
    "ER": "Eritrea",
    "EE": "Estonia",
    "ET": "Ethiopia",
    "FK": "Falkland Islands (Malvinas)",
    "FO": "Faroe Islands",
    "FJ": "Fiji",
    "FI": "Finland",
    "FR": "France (Includes Monaco)",
    "FX": "France, Metropolitan",
    "GF": "French Guiana",
    "PF": "French Polynesia",
    "TF": "French Southern Territories",
    "GA": "Gabon",
    "GM": "Gambia",
    "GZ": "Gaza Strip",
    "GE": "Georgia",
    "DE": "Germany",
    "GH": "Ghana",
    "GI": "Gibraltar",
    "GO": "Glorioso Islands",
    "GR": "Greece",
    "GL": "Greenland",
    "GD": "Grenada",
    "GP": "Guadeloupe",
    "GU": "Guam",
    "GT": "Guatemala",
    "GK": "Guernsey",
    "GN": "Guinea",
    "GW": "Guinea-Bissau",
    "GY": "Guyana",
    "HT": "Haiti",
    "HM": "Heard And Mc Donald Islands",
    "VA": "Holy See (Vatican City State)",
    "HN": "Honduras",
    "HK": "Hong Kong",
    "HQ": "Howland Island",
    "HU": "Hungary",
    "IS": "Iceland",
    "IN": "India",
    "ID": "Indonesia",
    "IR": "Iran",
    "IQ": "Iraq",
    "IE": "Ireland",
    "EI": "Ireland, Northern (Eire)",
    "IL": "Israel",
    "IT": "Italy",
    "JM": "Jamaica",
    "JP": "Japan",
    "DQ": "Jarvis Island",
    "JE": "Jersey",
    "JQ": "Johnston Atoll",
    "JO": "Jordan",
    "JU": "Juan de Nova Island",
    "KZ": "Kazakhstan",
    "KE": "Kenya",
    "KI": "Kiribati",
    "KP": "Korea, Democratic People's Repub",
    "KR": "Korea, South",
    "KW": "Kuwait",
    "KG": "Kyrgyzstan",
    "LA": "Laos",
    "LV": "Latvia",
    "LB": "Lebanon",
    "LS": "Lesotho",
    "LR": "Liberia",
    "LY": "Libya",
    "LI": "Liechtenstein",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "MO": "Macau",
    "MK": "Macedonia",
    "MG": "Madagascar",
    "MW": "Malawi",
    "MY": "Malaysia",
    "MV": "Maldives",
    "ML": "Mali",
    "MT": "Malta",
    "IM": "Man, Isle of",
    "MH": "Marshall Islands",
    "MQ": "Martinique",
    "MR": "Mauritania",
    "MU": "Mauritius",
    "YT": "Mayotte",
    "MX": "Mexico",
    "FM": "Micronesia, Federated States Of",
    "MD": "Moldova, Republic Of",
    "MC": "Monaco",
    "MN": "Mongolia",
    "MS": "Montserrat",
    "MA": "Morocco",
    "MZ": "Mozambique",
    "MM": "Myanmar (Burma)",
    "NA": "Namibia",
    "NR": "Nauru",
    "NP": "Nepal",
    "NL": "Netherlands",
    "AN": "Netherlands Antilles",
    "NC": "New Caledonia",
    "NZ": "New Zealand",
    "NI": "Nicaragua",
    "NE": "Niger",
    "NG": "Nigeria",
    "NU": "Niue",
    "NF": "Norfolk Island",
    "MP": "Northern Mariana Islands",
    "NO": "Norway",
    "OM": "Oman",
    "PK": "Pakistan",
    "PW": "Palau",
    "PS": "Palestinian Territory, Occupied",
    "PA": "Panama",
    "PG": "Papua New Guinea",
    "PY": "Paraguay",
    "PE": "Peru",
    "PH": "Philippines",
    "PN": "Pitcairn",
    "PL": "Poland",
    "PT": "Portugal",
    "PR": "Puerto Rico",
    "QA": "Qatar",
    "RE": "Reunion",
    "RO": "Romania",
    "RU": "Russian Federation",
    "RW": "Rwanda",
    "SH": "Saint Helena",
    "KN": "Saint Kitts And Nevis",
    "LC": "Saint Lucia",
    "PM": "Saint Pierre and Miquelon",
    "VC": "Saint Vincent and the Grenadines",
    "WS": "Samoa",
    "SM": "San Marino",
    "ST": "Sao Tome and Principe",
    "SA": "Saudi Arabia",
    "SN": "Senegal",
    "RS": "Serbia",
    "YU": "Serbia-Montenegro",
    "SC": "Seychelles",
    "SL": "Sierra Leone",
    "SG": "Singapore",
    "SK": "Slovak Republic",
    "SI": "Slovenia",
    "SB": "Solomon Islands",
    "SO": "Somalia",
    "ZA": "South Africa",
    "GS": "S. Georgia and S. Sandwich Isls.",
    "SS": "South Sudan",
    "ES": "Spain",
    "LK": "Sri Lanka",
    "SD": "Sudan",
    "SR": "Suriname",
    "SJ": "Svalbard And Jan Mayen Islands",
    "SZ": "Swaziland",
    "SE": "Sweden",
    "CH": "Switzerland",
    "SY": "Syrian Arab Republic",
    "TW": "Taiwan",
    "TJ": "Tajikistan",
    "TZ": "Tanzania",
    "TH": "Thailand",
    "TG": "Togo",
    "TK": "Tokelau",
    "TO": "Tonga",
    "TT": "Trinidad and Tobago",
    "TN": "Tunisia",
    "TR": "Turkey",
    "TM": "Turkmenistan",
    "TC": "Turks and Caicos Islands",
    "TV": "Tuvalu",
    "UG": "Uganda",
    "UA": "Ukraine",
    "AE": "United Arab Emirates",
    "UK": "United Kingdom",
    "US": "United States",
    "UM": "United States Minor Outlying Isl",
    "UY": "Uruguay",
    "UZ": "Uzbekistan",
    "VU": "Vanuatu",
    "VE": "Venezuela",
    "VN": "Viet Nam",
    "VI": "Virgin Islands (U.S.)",
    "WF": "Wallis and Furuna Islands",
    "WE": "West Bank",
    "EH": "Western Sahara",
    "YE": "Yemen",
    "ZM": "Zambia",
    "ZW": "Zimbabwe"
};

// Populates country selection menu
msos.countrystate.populate_country = function () {
    "use strict";

    var temp_cnt = 'msos.countrystate.populate_country -> ',
        default_country = '';

    default_country = msos.default_country[msos.config.locale] || (msos.default_country[msos.default_locale] || 'US');

    msos.console.debug(temp_cnt + 'start: ' + default_country);

    msos.common.gen_select_menu(
		msos.countrystate.country_elm,
		msos.countrystate.country,
		default_country
	);

    msos.console.debug(temp_cnt + 'done!');
};

msos.countrystate.populate_state = function () {
    "use strict";

    var temp_stt = 'msos.countrystate.populate_state -> ',
        selected_elm = msos.countrystate.country_elm.find('option:selected'),
        country = '',
        state_input = [];

    country = selected_elm.val();

    msos.console.debug(temp_stt + 'start: ' + country);

    state_input = msos.countrystate.state_by_country[country] || [];

    if (state_input.length > 0) {
        // Already got states thru ajax call
        msos.countrystate.load_states(country);
    }
    else {
        msos.countrystate.get_states(country);
    }

    msos.console.debug(temp_stt + 'done!');
};

msos.countrystate.get_states = function (country_code) {
    "use strict";

    var temp_get = 'msos.countrystate.get_states',
        state_url = msos.countrystate.states_url + '/' + country_code + '.json',
        load_state = function (response) {
            // Load the state_by_country object, so we only ajax once for each
            msos.countrystate.state_by_country[country_code] = response;
            msos.console.debug(temp_get + ' - load_state -> success: ' + state_url);
        },
        load_complete = function () {
            msos.countrystate.load_states(country_code);
            msos.console.debug(temp_get + ' - load_complete -> attempt completed: ' + state_url);
        };

    jQuery.ajax({
        dataType: 'json',
        cache: msos.config.cache,
        // ** Very important: Cache retrieved states data. They are static!
        url: state_url,
        success: [load_state, msos.ajax_success],
        error: msos.ajax_error,
        complete: [load_complete, msos.ajax_complete]
    });
};

msos.countrystate.load_states = function (country) {
    "use strict";

    var temp_lod = 'msos.countrystate.load_states',
        debug = '',
        count = 0,
        state_elm = msos.countrystate.state_elm,
		select_elm = null,
		input_elm = null,
		state_atts = {},
        state_obj = {},
        states = [],
        st = '',
        delay = 0;

    msos.console.debug(temp_lod + ' -> start.');

    function split_states_array(st_array, ctry) {
        var out_object = {},
            state, i = 0,
            failed = false;

        if (msos.config.verbose) {
            msos.console.debug(temp_lod + ' - split_states_array -> called: ', st_array);
        }

        for (i = 0; i < st_array.length; i += 1) {
            state = st_array[i];
            if (typeof state === 'string') {
                count += 1;
                out_object[ctry + '_' + count] = state;
            }
            else if (jQuery.isArray(state)) {
                out_object[state[0]] = state[1];
            }
            else {
                failed = true;
            }
        }
        if (failed) {
            msos.console.error(temp_lod + ' - split_states_array -> failed!');
        }
        return out_object;
    }

    states = msos.countrystate.state_by_country[country] || undefined;
	state_atts = msos.common.map_atts(state_elm.get(0));

    if (states && typeof states === 'object') { // some kind of object is present

        if (state_elm[0].nodeName.toLowerCase() === 'input') {

			select_elm = jQuery('<select>', state_atts);

			msos.countrystate.state_elm = select_elm;

            state_elm.replaceWith(select_elm);

            delay = 10;
            msos.console.debug(temp_lod + ' -> replaced input w/ select.');
        }

        if (jQuery.isArray(states)) {
            state_obj = split_states_array(states, country);
            debug = 'array';
        }
        else if (typeof states === 'object') {
            for (st in states) {
                state_obj[st] = split_states_array(states[st], country);
            }
            debug = 'associative array';
        }
        else {
            debug = 'unknown';
        }

        // Allow for replacement of input w/ select (this may not be needed. Test in lots of browsers)
        setTimeout(

        function () {
            msos.common.gen_select_menu(msos.countrystate.state_elm, state_obj);
            if (msos.config.verbose) {
                msos.console.debug(temp_lod + ' -> state object, type is ' + debug, state_obj);
            }
        }, delay);

    } else {

		input_elm = jQuery('<input type="text" />', state_atts);

		msos.countrystate.state_elm = input_elm;

        if (state_elm[0].nodeName.toLowerCase() === 'select') {
            state_elm.replaceWith(input_elm);
            msos.console.debug(temp_lod + ' -> replaced select w/ input.');
        }
    }
    msos.console.debug(temp_lod + ' -> done!');
};

msos.countrystate.initialize = function (country_elm, state_elm) {
    "use strict";

    var temp_cs = 'msos.countrystate.initialize -> ',
		select_elm = null,
		country_atts = {};

	msos.console.debug(temp_cs + 'start.');

    if (!country_elm.length || !state_elm.length) {
        msos.console.error(temp_cs + 'failed, missing input elements.');
        return;
    }

	country_atts = msos.common.map_atts(country_elm.get(0));

	select_elm = jQuery('<select>', country_atts);

    // Redo when country selection is made (important to use selector again!)
    select_elm.bind('change', msos.countrystate.populate_state);

	msos.countrystate.country_elm = select_elm;
	msos.countrystate.state_elm = state_elm;

    // Add selection menu
    country_elm.replaceWith(select_elm);

    msos.countrystate.populate_country();
    msos.countrystate.populate_state();

	msos.console.debug(temp_cs + 'done!');
};