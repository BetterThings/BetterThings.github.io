// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.jquery.droppable");
msos.require("jquery.ui.droppable");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: droppable.html loaded!');

        jQuery("#draggable").addClass('ui-widget ui-widget-content').draggable();
        jQuery("#droppable").addClass('ui-widget').droppable({
            drop: function (event, ui) {
                jQuery(this)
                    .removeClass('ui-widget')
                    .addClass("ui-state-highlight")
                    .find("p")
                    .html("Dropped!");
            }
        });
    }
);