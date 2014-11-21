// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

var popup_submit  = null,
    popup_confirm = null,
    google_api_key = '',
    check_count = 0;

// Note: I typically run this page locally (localhost) for actual i18n file generation.
//       It is safer and faster to work locally, and then upload files when finished.

msos.provide("demo.translate");
msos.require("msos.translate");
msos.require("msos.input.text");	// Here we use it to 'normallize' across different browsers (so output is the same)
msos.require("msos.common");
msos.require("msos.i18n");
msos.require("msos.intl");
msos.require("msos.popwindesktop");
msos.require("msos.keyboard");
msos.require("msos.i18n.page");
msos.require("msos.i18n.calendar");
msos.require("msos.i18n.colortool");
msos.require("msos.i18n.common");	// This is actually loaded in msos.i18n, but for the sake of visual consistency
msos.require("msos.i18n.keyboard");	// This will be loaded in msos.keyboard, but for the sake of visual consistency
msos.require("msos.i18n.popdiv");


// Url to your installed site_translate.cgi script (relative or absolute)
demo.translate.perl_script_uri = '../cgi-bin/site_translate.cgi';

demo.translate.insert_content = function (language, translation) {
    "use strict";

    var pop_button = '',
        pop_content = '',
        s_mod = null,
        subd_nls = '',
        json_text = '';

    // First time through, create a server side confirmation popup window
    if (!popup_confirm || popup_confirm.closed) {

        popup_confirm = msos.popwindesktop.open(
            demo.translate.perl_script_uri + '?back_url=' + encodeURIComponent(window.location.href),
            '_blank',
            'width=' + window.innerWidth + ',height=' + window.innerHeight
        );
    }

    // First time through, create a JSON text display popup window
    if (!popup_submit || popup_submit.closed) {

        popup_submit = msos.popwindesktop.msos_std(
            'form',
            'translate_popup',
            'Translation Submit',
            'JSON Translation String',
            'Submit',
            demo.translate.perl_script_uri
        );

        // Very important to allow popup window to settle...
        setTimeout(
            function () {
                popup_confirm.name = 'site_translate';

                jQuery('#popup_form', popup_submit.document).attr('target', 'site_translate');

                demo.translate.insert_content(language, translation);
            },
            2500
        );
        return;
    }

    s_mod  = msos.byid('select_module').value;
    subd_nls = 'msos.nls.' + s_mod + '.' + language;

    json_text = JSON.stringify(translation, null, 2);

    if (language === msos.default_locale) {
        pop_content += "Rewrite Base ("  + language +  ") File <input type='checkbox' name='set_new_base' title='Rewrite the base nls file?' \/>\n";
    }
    pop_content += "<textarea id='popup_textarea' rows='400' cols='400' name='json_text' title='JSON Textarea'>" + json_text + "<\/textarea>\n";

    pop_content += "<input type='hidden' name='translate_module' value='" + s_mod +  "' />\n";
    pop_content += "<input type='hidden' name='translate_lang' value='" + language +  "' />\n";

    // Load our textarea w/ input content
    popup_submit.html_input(pop_content);

    // Wait for css to load, then focus
    popup_submit.focus();
};

demo.translate.check_for_key = function () {
    "use strict";

    var state = false,
        in_key_value = jQuery('#google_api_key').val()      || 'na',
        cookie_value = msos.cookie('msos_trans_google_key') || 'na';

    msos.console.debug('demo.translate.check_for_key -> input: ' + in_key_value + ', cookie: ' + cookie_value);

    if (in_key_value !== 'na') {
        // in value is good
        if (in_key_value !== cookie_value) {
            // Record input value
            msos.cookie('msos_trans_google_key', in_key_value, { expires: 1 });
        }
        google_api_key = in_key_value;
        state = true;
    } else {
        // in value was 'na'
        if (cookie_value !== 'na') {
            // but cookie was good
            google_api_key = cookie_value;
            jQuery('#google_api_key').val(cookie_value);
            state = true;
        } else {
            // cookie was missing too, but skip the first time thru in order to load cookie value to page
            if (check_count > 0 && check_count < 3) {
                msos.notify.warning('You need to input your Google Translate API key in order to use this page!', 'Please Note:');
                jQuery('#google_api_key').focus();
            }
            check_count += 1;
        }
    }

    return state;
};


msos.onload_functions.push(
	function () {
        "use strict";

        var temp_mtp = 'Content: translate.html',
            input_source = null,
            input_destin = null,
            count_change = 0,
            input_languages = _.keys(msos.config.i18n.select_kbrds_msos),	// Set up for all available layout (per msos.i18n)
            lang_code = '',
            vt_kb_tool_obj = null,
            button_config = {},
            keyb_button = null,
            kb_butt_obj = null,
            val = '',
            auto_fill_onclick = null;

        msos.console.info(temp_mtp + ' -> start.');

        // Don't cache msos.i18n files while we revise them
        msos.i18n.cache = false;

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

        // Add our 'fixed' input fields for use with keyboard
        input_source = msos.byid("source");
        input_destin = msos.byid("destination");

        // Get our keyboard tool, register inputs
        vt_kb_tool_obj = msos.keyboard.get_tool();
        vt_kb_tool_obj.vk_register_input(input_source);
        vt_kb_tool_obj.vk_register_input(input_destin);

        // Configure our keyboard start button...
        button_config = {
            btn_title:      vt_kb_tool_obj.i18n.button_title,
            icon_class:     'btn btn-msos fa fa-keyboard-o',
            btn_onclick:    function () {
                vt_kb_tool_obj.set_input_focus_end(input_source);
                vt_kb_tool_obj.keyb_toggle_onmouseup();
            }
        };

        // Generate our keyboard start button...
        keyb_button = msos.byid("keyboard_button");
        kb_butt_obj = new msos.common.generate_button(keyb_button);

        // And append the button into our document...
        for (val in button_config) {
            kb_butt_obj[val] = button_config[val];
        }

        kb_butt_obj.generate_icon_button();

        // Build our from/to language selection menus
        function generate_lang_selects() {
            var l = '',
                select_langs = {},      // Google Translate API available languages
                trans_msos = msos.config.i18n.select_trans_msos,    // You can have more, but Google won't help
                available = jQuery.map(
                    msos.translate.available,
                    function(n, i) {
                        n = n.toLowerCase();
                        n = n.replace(/-/g, "_");
                        return n;
                    }
                );

            msos.console.debug(temp_mtp + ' - generate_lang_selects -> start.');
            
            // Get our language selection options
            for (l in trans_msos) {
                if (_.indexOf(available, l) > 0) {
                    select_langs[l] = trans_msos[l];
                }
            }

            msos.common.gen_select_menu(jQuery('#src'), select_langs, msos.default_locale);
            msos.common.gen_select_menu(jQuery('#dst'), select_langs, msos.default_translate);

            msos.console.debug(temp_mtp + ' - generate_lang_selects -> start.');
        }

        // Submit workspace field (single input) translation request
        function submitChange() {

            msos.console.debug(temp_mtp + ' - submitChange -> start.');

            if (!demo.translate.check_for_key()) {
                msos.console.warn(temp_mtp + ' - submitChange -> failed, missing key!');
                check_count = 2;
                return;
            }

            // Call Google API
            msos.translate.google_api_call(
                google_api_key,
                jQuery('#src').val(),
                jQuery('#dst').val(),
                [jQuery('#source').val()],      // Single query param
                function (result) {
                    var r = result.data || {};
                    if (r.translations && r.translations.length) {
                        jQuery("#destination").val(_.unescape(r.translations[0].translatedText));
                    } else {
                        jQuery("#destination").val('???');
                        msos.console.warn(temp_mtp + ' - submitChange -> warning: ' + (result.error.code ? result.error.code + ', ' + result.error.message : 'translation error'));
                    }
                }
            );

            msos.console.debug(temp_mtp + ' - submitChange -> done!');
        }

        function change_language() {

            var temp_chg = temp_mtp + ' - change_language -> ',
                i18n_fm = {},
                i18n_to = {},
                txt_inputs = [],
                src_val  = jQuery('#src').val() || 'na',
                dest_val = jQuery('#dst').val() || 'na',
                s_mod	 = jQuery('#select_module').val(),
                t_lst = msos.byid('translate_list'),
                to_key = '',
                i18n_key = '',
                fr_text,
                to_text,
                fr_id,
                to_id,
                add_li,
                add_tx,
                add_in,
                add_bt,
                add_ap,
                add_rs,
                add_ot;

            msos.console.debug(temp_chg + 'start, source: ' + src_val + ', dest: ' + dest_val);

            if (count_change > 2) {
                msos.console.error(temp_chg + 'failed, source and/or destination i18n bundle(s) not available!');
                return;
            }

            if (src_val === 'na' || dest_val === 'na') {
                msos.console.error(temp_chg + 'failed, source and/or destination value missing!');
                return;
            }

            if (!msos.i18n[s_mod][src_val]) {
                count_change += 1;
                msos.i18n[s_mod].bundle_complete = function () {
                    setTimeout(change_language, 200);
                };
                msos.i18n[s_mod].build_additional_locales(src_val);
                msos.console.debug(temp_chg + 'i18n source JSON not ready yet, count: ' + count_change);
                return;
            }

            if (!msos.i18n[s_mod][dest_val]) {
                count_change += 1;
                msos.i18n[s_mod].bundle_complete = function () {
                    setTimeout(change_language, 200);
                };
                msos.i18n[s_mod].build_additional_locales(dest_val);
                msos.console.debug(temp_chg + 'i18n destination JSON not ready yet, count: ' + count_change);
                return;
            }

            // Clear count (be kind, rewind)
            count_change = 0;

            // All loaded, so lets use them...
            i18n_fm = msos.i18n[s_mod][src_val];
            i18n_to = msos.i18n[s_mod][dest_val];

            // Prune unused entries from existing i18n files (based on base language json file)
            for (to_key in i18n_to) {
                if (!i18n_fm[to_key]) { delete i18n_to[to_key]; }
            }

            // Clean up previous 'change_language' call
            jQuery(t_lst).empty();			// remove all list elements
            msos.byid("source").value = '';		// clear source input field
            msos.byid("destination").value = '';	// clear destination input field

            msos.byid("source").lang_code = src_val;	// set language code for keyboard layout detection
            msos.byid("destination").lang_code = dest_val;	// set language code for keyboard layout detection

            msos.console.debug(temp_chg + 'loaded i18n, source: ' + src_val + ', destination: ' + dest_val + ' for module ' + s_mod);

            for (i18n_key in i18n_fm) {

                fr_text = i18n_fm[i18n_key] || '',
                to_text	= i18n_to[i18n_key] || '',
                fr_id	= i18n_key + '_' + src_val,
                to_id	= i18n_key + '_' + dest_val,
                add_li = document.createElement('li'),
                add_tx = document.createTextNode(' key : ' + i18n_key),
                add_in = document.createElement("input"),
                add_bt = document.createElement("button"),
                add_ap = document.createElement("button"),
                add_rs = document.createElement("button"),
                add_ot = document.createElement("input");

                add_in.style.display = 'block';
                add_in.type = 'text';
                add_in.id = fr_id;
                add_in.value = fr_text;
                add_in.lang_code = src_val;

                jQuery(add_in).addClass('trans_input');
                txt_inputs.push(add_in);

                add_bt.id = i18n_key + '_try';
                add_bt.source_id = fr_id;
                add_bt.title = "Translate (" + src_val + ") string to (" + dest_val + ") using Google";
                add_bt.className = 'btn btn-msos';
                add_bt.innerHTML = 'Try';

                add_ap.id = i18n_key + '_apply';
                add_ap.source_id = fr_id;
                add_ap.destination_id = to_id;
                add_ap.title = "Apply the above workspace (" + src_val + ") to (" + dest_val + ") translation here";
                add_ap.className = 'btn btn-msos';
                add_ap.innerHTML = 'Apply';

                add_rs.source_id = fr_id;
                add_rs.destination_id = to_id;
                add_rs.rs_key = i18n_key;
                add_rs.title = "Reset to original (" + src_val + ") and (" + dest_val + ") text stings";
                add_rs.className = 'btn btn-msos';
                add_rs.innerHTML = 'Reset';

                add_ot.style.display = 'block';
                add_ot.type = 'text';
                add_ot.id = to_id;
                add_ot.value = to_text;
                add_ot.lang_code = dest_val;

                jQuery(add_ot).addClass('trans_input');
                txt_inputs.push(add_ot);

                jQuery(add_bt).click(
                    function () {
                        msos.byid('source').value = msos.byid(this.source_id).value;
                        submitChange();
                        msos.console.debug(temp_chg + 'try tranlation: ' + this.source_id);
                    }
                );

                jQuery(add_ap).click(
                    function () {
                        msos.byid(this.source_id).value = msos.byid('source').value;
                        msos.byid(this.destination_id).value = msos.byid('destination').value;
                        msos.console.debug(temp_chg + 'apply tranlation: ' + this.source_id);
                    }
                );

                jQuery(add_rs).click(
                    function () {
                        msos.byid(this.source_id).value = i18n_fm[this.rs_key];
                        msos.byid(this.destination_id).value = i18n_to[this.rs_key];
                    }
                );

                add_li.appendChild(add_bt);
                add_li.appendChild(add_rs);
                add_li.appendChild(add_ap);
                add_li.appendChild(add_tx);
                add_li.appendChild(add_in);
                add_li.appendChild(add_ot);

                t_lst.appendChild(add_li);
            }

            // Very important to get rid of previous events.
            jQuery('#get_json_source').unbind('click');
            jQuery('#get_json_source').html('JSON for (' + src_val + ')');
            jQuery('#get_json_source').click(
                function () {
                    var translated_source = {},
                        src_v = msos.byid('src').value,
                        sce_key = '',
                        el_name = '',
                        el_val = '';

                    msos.console.debug(temp_chg + 'get_json_source -> start.');

                    for (sce_key in i18n_fm) {

                        el_name = sce_key + '_' + src_v;
                        el_val = '';
                        if (msos.config.verbose) {
                            msos.console.debug(temp_chg + 'get_json_source -> name: ' + el_name);
                        }
                        if (msos.byid(el_name) && msos.byid(el_name).value) {
                            el_val = msos.byid(el_name).value;
                        }
                        translated_source[sce_key] = el_val;

                    }

                    demo.translate.insert_content(src_val, translated_source);

                    // Remove from current "module" build (so we update)
                    msos.i18n.lang_object_delete(s_mod, src_val);

                    msos.console.debug(temp_chg + 'get_json_source -> done!');
                    return false;
                }
            );

            // Very important to get rid of previous events.
            jQuery('#get_json_destin').unbind('click');
            jQuery('#get_json_destin').html('JSON for (' + dest_val + ')');
            jQuery('#get_json_destin').click(
                function () {
                    var translated_destin = {},
                        dest_v = msos.byid('dst').value,
                        dst_key = '',
                        el_name = '',
                        el_val = '';

                    msos.console.debug(temp_chg + 'get_json_destin -> start.', i18n_to);

                    for (dst_key in i18n_to) {

                        el_name = dst_key + '_' + dest_v;
                        el_val = '';

                        if (msos.config.verbose) {
                            msos.console.debug(temp_chg + 'get_json_destin -> name: ' + el_name);
                        }
                        if (msos.byid(el_name) && msos.byid(el_name).value) {
                            el_val = msos.byid(el_name).value;
                        }
                        translated_destin[dst_key] = el_val;

                    }

                    demo.translate.insert_content(dest_val, translated_destin);

                    // Remove from current "module" build (so we update)
                    msos.i18n.lang_object_delete(s_mod, dest_val);

                    msos.console.debug(temp_chg + 'get_json_destin -> done!');
                    return false;
                }
            );

            // Create keyboard 'onmousedown/up' events for the generated text inputs, and add 'input_onfocus'
            msos.input.text.set_event(vt_kb_tool_obj, txt_inputs, 'focus', vt_kb_tool_obj.input_onfocus);
    
            msos.console.debug(temp_chg + 'done!');
        }

        auto_fill_onclick = function (evt) {

            var temp_auto = temp_mtp + ' - auto_fill_onclick -> ',
                source_array = [],
                source_keys  = [],
                sce_val = jQuery('#src').val(),
                dst_val = jQuery('#dst').val(),
                sel_mod = jQuery('#select_module').val(),
                txt_fm = {},
                s_key = '';

            msos.console.debug(temp_auto + 'start, source: ' + sce_val + ', dest: ' + dst_val + ', module: ' + sel_mod);

            if (evt) { msos.do_nothing(evt); }

            if (!demo.translate.check_for_key()) {
                msos.console.warn(temp_auto + 'failed for missing key!');
                check_count = 2;
                return;
            }

            if (count_change > 1) {
                msos.console.error(temp_auto + 'failed for: ' + sce_val);
                return;
            }

            if (!msos.i18n[sel_mod][sce_val]) {
                count_change += 1;
                msos.i18n[sel_mod].bundle_complete = function () {
                    setTimeout(auto_fill_onclick, 200);
                };
                msos.i18n[sel_mod].build_additional_locales(sce_val);
                return;
            }

            // Clear count (be kind, rewind)
            count_change = 0;

            txt_fm = msos.i18n[sel_mod][sce_val];

            // Generate a source array (and keep track of keys)
            for (s_key in txt_fm) {
                source_array.push(txt_fm[s_key]);
                source_keys.push(s_key);
            }

            msos.translate.google_api_call(
                google_api_key,
                sce_val, 
                dst_val,
                source_array,
                function (result) {
                    var r = result.data.translations || [],
                        i = 0,
                        elm_id = null,
                        output = '';

                    if (r && r.length) {
                        for (i = 0; i < r.length; i += 1) {
                            elm_id = source_keys[i] + '_' + dst_val;
                            output = _.unescape(r[i].translatedText);
                            msos.console.debug('Auto Fill -> id: ' + elm_id + ', value: ' + output);
                            jQuery('#' + elm_id).val(output);
                        }
                    } else {
                        msos.console.warn(temp_auto + 'warning: ' + (result.error.code ? result.error.code + ', ' + result.error.message : 'translation error'));
                    }
                }
            );

            msos.console.debug(temp_auto + 'done!');
        };


        jQuery('#workspace_go').click(submitChange);

        jQuery('#src').change(change_language);
        jQuery('#dst').change(change_language);

        jQuery('#select_module').change(change_language);

        jQuery('#auto_fill').click(auto_fill_onclick);

        jQuery('#google_api_key').blur(
            function () {
                if (demo.translate.check_for_key()) { change_language(); }
            }
        );

        // All ready, so set up our page
        generate_lang_selects();

        if (demo.translate.check_for_key()) { change_language(); }

        msos.console.info(temp_mtp + ' -> done!');
	}
);

