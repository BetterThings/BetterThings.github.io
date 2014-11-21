// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.autocomplete");
msos.require("jquery.ui.autocomplete");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: autocomplete.html loaded!');

        var availableTags = [
                "ActionScript",
                "AppleScript",
                "Asp",
                "BASIC",
                "C",
                "C++",
                "Clojure",
                "COBOL",
                "ColdFusion",
                "Erlang",
                "Fortran",
                "Groovy",
                "Haskell",
                "Java",
                "JavaScript",
                "Lisp",
                "Perl",
                "PHP",
                "Python",
                "Ruby",
                "Scala",
                "Scheme"
            ];

        jQuery("#tags").autocomplete({
            source: availableTags
        });
    }
);