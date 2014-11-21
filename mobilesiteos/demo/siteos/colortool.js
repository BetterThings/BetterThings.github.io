// Page specific js code

/*global
    msos: false,
    jQuery: false,
    Colour: true,
    Target: true
*/

msos.provide("demo.siteos.colortool");
msos.require("msos.common");
msos.require("msos.colortool");


//  Initialize some global variables
var Colour = {
    css_accent1:    '#F08080',
    css_accent2:    '#F7BC83',
    css_accent3:    '#FF9933',
    css_bgcolor:    '#BFBFBF',
    css_contrast1:  '#EFEFEF',
    css_contrast2:  '#E0E0E0',
    css_contrast3:  '#A1A1A1',
    css_http_link:  '#FF8429',
    css_active_link: '#F0F0F0',
    css_visit_link: '#EDAF85',
    css_hover_link: '#F7BC83',
    css_font_color: '#000000'
};

var Target = 'css_bgcolor';	// set one of above as an initial value

msos.onload_functions.push(
    function () {
        "use strict";

        msos.console.info('Content: colortool.html loaded!');

        var colortool_object = null,
            ct_input0 = msos.byid('color_input0'),
            ct_input1 = msos.byid('color_input1'),
            ct_input2 = msos.byid('color_input2'),
            set_field = null,
            inp_id = '';

        // Demo specific: Initiate our primary demo page input ('color_input0')
        ct_input0.value = Colour[Target];

        if (!msos.config.browser.touch) {
            ct_input0.focus();
        }

        // Check appropriate radio button
        msos.byid(Target).checked = true;

        // Create our colortool object
        colortool_object = msos.colortool.get_tool();

        // Register our colortool inputs...
        colortool_object.ct_register_input(color_input0);
        colortool_object.ct_register_input(color_input1);
        colortool_object.ct_register_input(color_input2);

        // Replace default 'after_change' for 'color_input0' with this one (updates demo page inputs)
        colortool_object.after_change.color_input0 = function () {
            msos.console.debug('Demo - change Colour[Target] to: ' + '#' + colortool_object.ct_color);
            Colour[Target] = '#' + colortool_object.ct_color;
        };

        // Demo page specific code
        set_field = function (evt) {
            Target = evt.target.id;
            ct_input0.value = Colour[Target];

            //colortool_object.ct_button_onclick({ target : ct_input0 });
            colortool_object.ct_get_color(ct_input0);
            if (!msos.config.browser.touch) {
                ct_input0.focus();
            }
        };

        // Add radio button (menu) element events
        for (inp_id in Colour) {
            jQuery('#' + inp_id).click(set_field);
        }

        // Add input event for manual editing (ct_input0, demo specific)
        jQuery(ct_input0).blur(
            function () {
                Colour[Target] = ct_input0.value;
            }
        );
    }
);