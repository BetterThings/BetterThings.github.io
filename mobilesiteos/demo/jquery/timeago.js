// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.timeago");
msos.require("jquery.tools.timeago");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: timeago_demo.html loaded!');

        var zeropad = function (num) {
                return ((num < 10) ? '0' : '') + num;
            },
            iso8601 = function (date) {
                return date.getUTCFullYear()
                    + "-" + zeropad(date.getUTCMonth()+1)
                    + "-" + zeropad(date.getUTCDate())
                    + "T" + zeropad(date.getUTCHours())
                    + ":" + zeropad(date.getUTCMinutes())
                    + ":" + zeropad(date.getUTCSeconds()) + "Z";
            };

        // Add iso8601 formatted date to title of display element
        jQuery('abbr.loaded').attr("title", iso8601(new Date()));
        jQuery('abbr.modified').attr("title", iso8601(new Date(document.lastModified)));

        // Start timeago
        jQuery("abbr.timeago").timeago();

        jQuery("#prog_date").text(jQuery.timeago(new Date()));
        jQuery("#prog_string").text(jQuery.timeago("2008-07-17"));
        jQuery("#prog_element").text(jQuery.timeago("2008-07-20"));

    }
);