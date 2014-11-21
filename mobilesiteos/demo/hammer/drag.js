// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.hammer.drag");


msos.onload_functions.push(
    function () {
        "use strict";

        var temp_hj = 'Content: drag.html';

        msos.console.info(temp_hj + ' loaded!');

        jQuery(".drag")
            .hammer({ drag_max_touches: 0 })
            .on("touch drag",
                function(ev) {
                    var touches = ev.gesture.touches,
                        t = 0,
                        target = null;

                    ev.gesture.preventDefault();

                    for (t = 0; t < touches.length; t += 1) {
                        target = jQuery(touches[t].target);
                        target.css({
                            zIndex: 1337,
                            left: touches[t].pageX - 50,
                            top:  touches[t].pageY - 50
                        });
                    }
                }
            );
    }
);