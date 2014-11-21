// Page specific js code

/*global
    msos: false,
    jQuery: false
*/

msos.provide("demo.siteos.calendar");
msos.require("msos.common");
msos.require("msos.calendar");


msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: calendar.html loaded!');

        var input_1 = msos.byid("calendar_input1"),
            calendar_object = msos.calendar.get_tool(),
            button_config = {},
            cal_button1 = null,
            val = '';

        if (!calendar_object) {
            msos.console.error('Content: calendar.html, calendar object na!');
        }

        // Register this input as a 'date' input
		calendar_object.cal_register_input(input_1);

        // Configure our calendar start button(s)...
        button_config = {
            btn_title:      calendar_object.i18n.button_title,
            icon_class:     'btn fa fa-calendar',
            btn_class:      'btn-large',
            btn_onclick:   function () {
                calendar_object.tool_target = input_1;
                calendar_object.cal_button_click();
            }
        };

        // Generate our calendar start button(s)...
        cal_button1 = new msos.common.generate_button(input_1.parentNode);

        // And generate the button(s)...
        for (val in button_config) {
            cal_button1[val] = button_config[val];
        }
        cal_button1.generate_icon_button();
    }
);