// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Hammer: false
*/

msos.provide("demo.hammer.fastclick");


msos.onload_functions.push(
    function () {
        "use strict";

        var temp_hj = 'Content: fastclick.html',
            fc_section = jQuery('#fastclick'),
            fast = msos.byid('fast-click'),
            $fast = jQuery('#fast-click-jquery'),
            normal = msos.byid('normal-click');

        msos.console.info(temp_hj + ' loaded!');


        function toggle_fc_section() {
            fc_section.toggleClass('toggle');
        }

        /**
         * simple fastclick
         * @param   el
         * @param   handler
         */
        function fastClick(el, handler) {
            el.addEventListener(
                "click",
                function (ev) {
                    ev.preventDefault();
                },
                false
            );
            Hammer(el).on("tap doubletap", handler);
        }

        /**
         * small jQuery plugin
         * @param handler
         * @return {*}
         */
        jQuery.fn.fastClick = function (handler) {
            this.click(
                function (ev) { ev.preventDefault(); }
            );
            Hammer(this[0]).on("tap doubletap", handler);
            return this;
        };

        // Bind the FastClick event functions
        fastClick(fast, toggle_fc_section);
        $fast.fastClick(toggle_fc_section);

        // Bind std event function
        normal.addEventListener(
            "click",
            function (ev) {
                toggle_fc_section();
                ev.preventDefault();
            },
            false
        );
    }
);