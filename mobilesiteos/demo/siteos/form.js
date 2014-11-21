// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("demo.siteos.form");

msos.require("msos.form2js");
msos.require("msos.js2form");
msos.require("msos.popwin");
msos.require("msos.i18n");
msos.require("msos.intl");
msos.require("msos.countrystate");
msos.require("msos.geolocation");
msos.require("msos.html5.date");
msos.require("msos.html5.color");
msos.require("msos.html5.number");
msos.require("msos.html5.range");

if (!Modernizr.localstorage) {
    msos.require("msos.html5.storage");
}


msos.onload_functions.push(
    function () {
        "use strict";

        var stored_form_data = window.localStorage.getItem("html5_form_data") || '';

        msos.console.info('Content: form.html loaded!');

        // Load existing data, if any...
        if (stored_form_data) {
            msos.js2form.set(msos.byid('example_form'), stored_form_data);
        }

        // For msos.i18n
        msos.i18n.set_select(
            jQuery('select#locale')
        );

        // For msos.intl
        msos.intl.set_selects(
            jQuery('select#culture'),
            jQuery('select#calendar'),
            jQuery('select#keyboard')
        );

        // For msos.countrystate
        msos.countrystate.initialize(jQuery('#country'), jQuery('#state'));

        // For msos.geolocation
        msos.geolocation.initialize(jQuery('#latitude'), jQuery('#longitude'));

        // For HTML5 number inputs
        jQuery('input[type="number"]').html5_number();

        // For HTML5 range inputs
        jQuery('input[type="range"]').html5_range();

        // For HTML5 date inputs
        jQuery('input[type="date"]').html5_date();

        // For HTML5 color inputs
        jQuery('input[type="color"]').html5_color();

        // Demo the collected input data
        jQuery('#get_data').bind(
            'click',
            function () {

                msos.popwin.start_debug_window();

                var form_data = msos.form2js.get('example_form'),
                    dump_out = JSON.stringify(form_data, null, '\t');

                window.localStorage.setItem("html5_form_data", form_data);

                // Add output once debug window settles...
                setTimeout(function () { msos.popwin.debug_write(dump_out); }, 3000);
            }
        );

        if (msos.config.verbose) {
            msos.console.debug('Content: form.html, msos.dom tracking:', msos.dom);
        }
    }
);