// Copyright Notice:
//					debugform.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com

/*
	OpenSiteMobile debug form page bundled functions
	This module is useful for testing and demo purposes
*/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.debugform");
msos.require("msos.common");

msos.debugform.version = new msos.set_version(14, 1, 12);

msos.debugform.init_data = null;

msos.debugform.form = function () {
    "use strict";

    var select_lang = '',
        select_cult = '',
		select_ui = '',
        html_out = '',
        temp_df = 'msos.debugform.form -> ',
		i18n = {
			culture: 'Culture',
			calendar: 'Calendar',
			language: 'Language',
			reset: 'Reset',
			no_data: 'No Data'
		},
		key;

    msos.console.debug(temp_df + 'start.');

	// Timing of i18n common loading is a factor
	if (msos.i18n
	 && msos.i18n.common
	 && msos.i18n.common.bundle) {
		for (key in i18n) {
			if (msos.i18n.common.bundle[key]) {
				i18n[key] = msos.i18n.common.bundle[key];
			}
		}
	}

    if (msos.intl) {
        select_cult =
				"<li><div> " + i18n.culture + ":  </div><select id='select_culture'  name='culture'></select></li>" +
				"<li><div> " + i18n.calendar + ": </div><select id='select_calendar' name='calendar'></select></li>";
    }

    if (msos.i18n) {
        select_lang =
			"<ul class='config'>" +
				"<li><div> " + i18n.language + ": </div><select id='select_language' name='locale'></select></li>" +
				select_cult +
			"</ul>";
    }

	if (msos.registered_files.css.ui_msos_core_css) {
		select_ui =
			"<ul class='config'>" +
				"<li><div>jQuery UI Theme - </div><select id='select_theme' name='jquery_ui_theme'></select></li>" +
			"</ul>";
	}

    html_out =
		"<form id='debug_form' accept-charset='utf-8' action='#' method='get'>" +
			"<div style='max-width: 26em;'>" +
				select_lang +
				select_ui +
			"</div>" +
			"<div style='max-width: 18em; margin-top: 1em;'>" +
				"<ul class='config msos_list notranslate' id='configuration'><li>" + i18n.no_data + "</li></ul>" +
				"<input class='btn btn-msos' type='submit' />" +
			"</div>" +
		"</form>" +
		"<div style='margin-top: 1em;'><a class='btn btn-danger' href='./#' rel='external'>" + i18n.reset + "</a></div>";

    msos.console.debug(temp_df + 'done!');
    return html_out;
};

msos.debugform.add = function ($debug_elm) {
    "use strict";

    var url = msos.purl(),
		action = '#' + url.attr('fragment') || '',
		config_ul = null,
		$debug_form,
        debugging = msos.config.debugging,
        select_display_sizes = {},
        j = 0,
        list_elm = null,
        div_label = null,
        inpt_elm_t = null,
        inpt_elm_f = null,
        true_txt = '',
        fals_txt = '',
        labl_txt = '',
        size = '',
        theme = '',
        temp_df = 'msos.debugform.add -> ';

    msos.console.debug(temp_df + 'start.');

	if (!$debug_elm.length) {
		msos.console.error(temp_df + 'failed, missing debug element.');
		return;
	}

	$debug_elm.append(msos.debugform.form());

	config_ul = document.getElementById('configuration');

    while (config_ul.firstChild) {
        config_ul.removeChild(config_ul.firstChild);
    }

    for (j = 0; j < debugging.length; j += 1) {

        if (debugging[j] === 'run_fast_button' && !msos.config.mobile) {
            continue;
        }
        list_elm = document.createElement("li");
        div_label = document.createElement("div");
        inpt_elm_t = document.createElement("input");
        inpt_elm_f = document.createElement("input");

        inpt_elm_t.type = "radio";
        inpt_elm_f.type = "radio";
        inpt_elm_t.name = debugging[j];
        inpt_elm_f.name = debugging[j];
        inpt_elm_t.value = 'true';
        inpt_elm_f.value = 'false';

        if (msos.config[debugging[j]]) {
            inpt_elm_t.checked = true;
        } else {
            inpt_elm_f.checked = true;
        }

        labl_txt = document.createTextNode(debugging[j] + ' - ');
        true_txt = document.createTextNode(' T ');
        fals_txt = document.createTextNode(' F ');

        div_label.appendChild(labl_txt);

        list_elm.appendChild(div_label);
        list_elm.appendChild(inpt_elm_t);
        list_elm.appendChild(true_txt);
        list_elm.appendChild(inpt_elm_f);
        list_elm.appendChild(fals_txt);

        config_ul.appendChild(list_elm);
    }

    // Build display size select input object
    for (size in msos.config.size_wide) {
        select_display_sizes[size] = size + ': ' + msos.config.size_wide[size] + 'px';
    }

    // Generate jQuery UI theme  menu
	if (msos.registered_files.css.ui_msos_core_css) {
		// Add this one for debugging MSOS versions (standard original UI-Lightness jQuery-UI theme without texture images)
		msos.config.jquery_ui_avail.ui_standard = "UI-Std. w/o Texture";
		msos.common.gen_select_menu(jQuery('#select_theme'), msos.config.jquery_ui_avail, msos.config.jquery_ui_theme);
	}

    // Generate available language menu
    if (msos.i18n) {
        msos.common.gen_select_menu(jQuery('#select_language'), msos.config.i18n.select_trans_msos, msos.config.locale);
    }

    // Generate available culture preferences
    if (msos.intl) {
        msos.common.gen_select_menu(jQuery('#select_culture'),  msos.config.intl.select_culture,  msos.config.culture);
        msos.common.gen_select_menu(jQuery('#select_calendar'), msos.config.intl.select_calendar, msos.config.calendar);
    }

	$debug_form = jQuery('#debug_form');

	msos.debugform.init_data = $debug_form.serializeArray();

	$debug_form.on(
		"submit",
		function (e) {

			var int_data = msos.debugform.init_data,
				new_data = jQuery(this).serializeArray(),
				out_query = '';

			// We only want to submit form values that change (there are so many)
			jQuery.each(
				new_data,
				function (i) {
					if (new_data[i].name === int_data[i].name) {
						// If the input changed, store it...
						if (new_data[i].value !== int_data[i].value) {
							if (out_query.length > 0) { out_query += '&'; }
							out_query += new_data[i].name + '=' + new_data[i].value;
						} else if (int_data[i].value === 'true') {
							if (out_query.length > 0) { out_query += '&'; }
							out_query += int_data[i].name + '=' + int_data[i].value;
						}
					}
				}
			);

			if (out_query.length > 0) {

				action = url.attr('protocol') + '://' + url.attr('host') + url.attr('path') + '?' + out_query + action;

				if (msos.config.verbose) {
					msos.console.debug(temp_df + 'form submit for: ' + action);
					alert('Debug Form Submitted. See console for values.');
				}

				location.replace(action);
			}

			msos.do_nothing(e);
		}
	);

    msos.console.debug(temp_df + 'done!');
};
