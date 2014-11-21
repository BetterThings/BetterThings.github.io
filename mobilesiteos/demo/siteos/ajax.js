// Page specific js code

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("demo.siteos.ajax");
msos.require("msos.common");
msos.require("msos.ajax");


msos.onload_functions.push(
    function () {
        "use strict";

        var temp_aj = 'Content: ajax.html',
            ajax_popup = msos.ajax.get_tool(),
            fill_div = null,
            on_div_load = null,
            button_config = {},
            popup_button = null,
            pup_butt_obj = null,
            val = '';

        msos.console.info(temp_aj + ': loaded!');

        on_div_load = function () {

            msos.console.debug(temp_aj + ' -> add countrystate!');

            msos.require(
                "msos.countrystate",
                function () {
                    msos.countrystate.initialize(jQuery('#country'), jQuery('#state'));
                }
            );
        };

        // Add additional functions, as desired (this fills a simple div)
        fill_div = function (in_html, status) {

            msos.console.debug(temp_aj + ' -> ajax done: ' + status);

            jQuery('#replace').html(in_html);

            // Have to wait for inputs to be available
            setTimeout(on_div_load, 1000);
        };

        // Cache is true since we are displaying static (same) content
        ajax_popup.tool_ajax_cache = true;

        // Set what file to get via ajax
        ajax_popup.tool_load_url = './demo/siteos/tmpl/countrystate.html';

        // Add popup "onsuccess" function
        ajax_popup.tool_on_success.push(fill_div);

        // Configure our calendar start button(s)...
        button_config = {
            btn_title:      ajax_popup.tool_popup.i18n.button_title || "Show or hide our popup display",
            icon_class:     'btn fa fa-cloud-download',
            btn_class:      'btn-large',
            btn_onclick:   function () {
                 if (ajax_popup.tool_popup.visibile)	{ ajax_popup.tool_popup.hide_popdiv(); }
                 else				                    { ajax_popup.tool_popup.display_popdiv(); }
            }
        };

        // Generate our popup demo start button
        popup_button = msos.byid('popup_button');

        // Generate our calendar start button(s)...
        pup_butt_obj = new msos.common.generate_button(popup_button.parentNode);

        // And generate the button...
        for (val in button_config) {
            pup_butt_obj[val] = button_config[val];
        }

        pup_butt_obj.generate_icon_button();
    }
);