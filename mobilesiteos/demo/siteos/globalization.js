// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.globalization");
msos.require("msos.dot");
msos.require("msos.intl");
msos.require("msos.tab");
msos.require("msos.common");

msos.config.google.no_translate.by_id.push('#dateformat', '#format', '#infonumber', '#infodate');


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: globalization.html loaded!');

        // Generate our tabs
        var tab_obj = new msos.tab.tool(msos.byid('spl_tabs_div')),
            date_tab = {},
            numb_tab = {},
            info_tab = {},

            // Get templates as strings
            format_tmpl_txt         = jQuery('#formattmpl').text(),
            dateformat_tmpl_txt     = jQuery('#dateformattmpl').text(),
            info_number_tmpl_txt    = jQuery('#infonumbertmpl').text(),
            info_date_tmpl_txt      = jQuery('#infodatetmpl').text(),

            // Generate template functions
            format_tmpl_func        = msos.dot.template(format_tmpl_txt),
            dateformat_tmpl_func    = msos.dot.template(dateformat_tmpl_txt),
            info_number_tmpl_func   = msos.dot.template(info_number_tmpl_txt),
            info_date_tmpl_func     = msos.dot.template(info_date_tmpl_txt),

            // Example data
            data = {
                numbers: [
                    0, 1, 10, 100, 1000, 10000, 0.1, 0.12, 0.123, 0.1234, 0.12345, 1000.123, 10000.12345,
                    -1, -10, -100, -1000, -10000, -0.1, -0.12, -0.123, -0.1234, -0.12345, -1000.123, -10000.12345
                ],
                formats: ["n", "n1", "n3", "d", "d2", "d3", "p", "p1", "p3", "c", "c0"],
                dates: [],
                dateFormats: ["d", "D", "f", "F", "M", "S", "t", "T", "Y"]
            };

        // Map our dates array
        data.dates = jQuery.map(
            [
                "Jan 1, 1970 1:34 PM",
                "Dec 31, 1970 1:34 PM",
                "Apr 1, 1999 1:34 PM",
                "Dec 31, 1999 1:34 PM",
                "Jan 1, 2000 1:34 PM",
                "Nov 5, 1955 1:34 PM"
            ],
            function (d) { return d instanceof Date ? d : new Date(Date.parse(d)); }
        );


        // Set up our tabs
        tab_obj.act_tab_style = 'tab_active';
        tab_obj.pas_tab_style = 'tab_passive';
        tab_obj.com_tab_style = 'tab_common';
        tab_obj.tab_cookie_name = 'culture_ex_tab';

        date_tab = {
            caption :	'Date',
            tab_title :	'Culture specific date examples',
            container :	msos.byid('tab_content_0')
        };
        numb_tab = {
            caption :	'Number',
            tab_title :	'Culture specific numeric examples',
            container :	msos.byid('tab_content_1')
        };
        info_tab = {
            caption :	'Info',
            tab_title :	'Culture specific information',
            container :	msos.byid('tab_content_2')
        };

        tab_obj.add_tab(date_tab);
        tab_obj.add_tab(numb_tab);
        tab_obj.add_tab(info_tab);

        // Get the tab index if saved to cookie
        tab_obj.get_tab_by_cookie();

        // Generate our tabs
        tab_obj.generate_tabs();

        msos.console.debug('Content: globalization.html loaded tabs.');

        // Update demo date input
        jQuery("#parseDate")
            .change(
                function () {
                    jQuery("#parseDateResult").text(msos.intl.parseDate(jQuery(this).val()).toString());
                }
            );

        // Update demo number input
        jQuery("#parseNumber")
            .change(
                function () {
                    jQuery("#parseNumberResult").text(msos.intl.parseFloat(jQuery(this).val(), 10).toString());
                }
            );

        function run_tmpl_render() {

            var temp_tt = 'Page: globalization.html - run_tmpl_render -> ',
                i = 0,
                j = 0,
                k = 0,
                l = 0,
                temp_array = [];

            data.formated_numbers = [];
            data.formated_dates = [];

            msos.console.debug(temp_tt + 'start.');

            for (j = 0; j < data.formats.length; j += 1) {
                for (i = 0; i < data.numbers.length; i += 1) {
                    temp_array.push(msos.intl.format(data.numbers[i], data.formats[j]));
                }
                data.formated_numbers.push(temp_array);
                temp_array = [];
            }

            for (l = 0; l < data.dateFormats.length; l += 1) {
                for (k = 0; k < data.dates.length; k += 1) {
                    temp_array.push(msos.intl.format(data.dates[k], data.dateFormats[l]));
                }
                data.formated_dates.push(temp_array);
                temp_array = [];
            }

            msos.console.debug(temp_tt + 'data set fully built: ', data);

            // Clear format, then rebuild
            jQuery("#format").empty();
            jQuery("#format").html(jQuery.trim(format_tmpl_func(data)));

            // Clear dateformat, then rebuild
            jQuery("#dateformat").empty();
            jQuery("#dateformat").html(jQuery.trim(dateformat_tmpl_func(data)));

            jQuery("#englishName").text(msos.intl.culture.englishName);
            jQuery("#nativeName").text(msos.intl.culture.nativeName);
            jQuery("#isRTL").text(msos.intl.culture.isRTL ? "Yes" : "No");

            jQuery("#infonumber").empty();
            jQuery("#infonumber").html(jQuery.trim(info_number_tmpl_func(msos.intl.culture.numberFormat)));

            jQuery("#infodate").empty();
            jQuery("#infodate").html(jQuery.trim(info_date_tmpl_func(msos.intl.culture.calendar)));

            msos.console.debug(temp_tt + 'done!');
        }

        // For msos.i18n
        msos.i18n.set_select(
            jQuery('select#locale')
        );

        // For msos.intl
        msos.intl.set_selects(
            jQuery('select#culture'),
            jQuery('select#calendar')
        );

        // Regenerate the output on Culture/Calendar menu change
        jQuery(msos.intl).on('intl.update', run_tmpl_render);

        msos.console.debug('Content: globalization.html loaded JavaScript.');

        // Run it the first time
        run_tmpl_render();
    }
);