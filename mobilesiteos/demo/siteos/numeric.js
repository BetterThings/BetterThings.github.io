// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.numeric");
msos.require("msos.numberctrl");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: numeric.html loaded!');

        // Identify the input element to add numeric controls to
        var input_el = msos.byid('input_quantity'),
            num_ctrl = null,
            status = jQuery('#status');

        num_ctrl = new msos.numberctrl.tool(input_el);

        // Script setting of max/min. See msos.html.numeric for html5 style max='', and min='' and step=''.
        num_ctrl.num_min_val = 0;
        num_ctrl.num_max_val = 10;
        num_ctrl.num_ctrl_id = 'quantity';
        num_ctrl.after_change_function = function () {
            status.html('Quantity, input: ' + input_el.value);
        };
        num_ctrl.generate_num_ctrl();

        // Display our initial value
        status.html('Quantity, initial: ' + input_el.value);
    }
);