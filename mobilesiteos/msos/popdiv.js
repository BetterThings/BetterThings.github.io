// Copyright Notice:
//				    popdiv.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile popup div functions

/*global
    msos: false,
    jQuery: false,
    _: false
*/

msos.provide("msos.popdiv");
msos.require("msos.i18n.popdiv");
msos.require("msos.common");

msos.popdiv.version = new msos.set_version(14, 5, 17);


msos.popdiv.count = 0;

msos.popdiv.get_top = function (ele) {
    "use strict";

    var eTop = parseInt(ele.offset().top, 10),
        wTop = parseInt(jQuery(window).scrollTop(), 10),
        top = eTop - wTop;

    return top;
};

msos.popdiv.create_tool = function (pop_name, pop_size_ext, pop_size_url, pop_container, pop_head, pop_close, pop_display, pop_position, tool_i18n, fixed_size) {
    "use strict";

    var temp_tool = 'msos.popdiv.create_tool',
        popup_obj = this,
        j = 0,
        sml_but = document.createElement("button"),
        lrg_but = document.createElement("button"),
        size_onclick = null,
        center = document.createElement("span"),
        cent_txt = document.createTextNode(':: :: :: :: ::'),
        on_mouse_over = null,
        on_mouse_out = null;

    // Make sure container div has an id
    if (!pop_container.id) {
        msos.popdiv.count += 1;
        pop_container.id = 'pop_div_' + msos.popdiv.count;
    }

    msos.console.debug(temp_tool + ' -> initialized: ' + pop_name + ', into container: ' + pop_container.id);

    this.i18n = tool_i18n || msos.i18n.popdiv.bundle; // Some tools have specific i18n, some don't
    this.container = pop_container;
    this.close = pop_close;
    this.display = pop_display;
    this.head = pop_head;
    this.visibile = false;
    this.filled = false;

    // Add functions to be run on popup display/hide, etc.
    this.run_on_display = function () {
        return false;
    };
    this.run_on_hide = function () {
        return false;
    };

    this.pop_cookie = msos.config.cookie.site_popu.name + pop_name;

    // Popup size - specified by 'fixed' (1st), if 'display changed' use it (2nd), popup cookie (3rd), fall back to config
    this.pop_size = fixed_size || msos.config.query.size || msos.cookie(this.pop_cookie) || msos.config.size;
    this.pop_size_arry = msos.config.size_array;
    this.pop_size_idx = _.indexOf(this.pop_size_arry, this.pop_size);
    this.pop_dynamic = new msos.loader();
    this.pop_position = pop_position;
    this.pop_make_visible = function () {
        popup_obj.container.style.visibility = 'visible';
        popup_obj.visibile = true;
    };

    // Add tool name to display element later ref.
    popup_obj.display.registered_tool_name = pop_name;

    popup_obj.pop_dynamic.add_resource_onload.push(
        function () {
            if (popup_obj.visibile) {
                setTimeout(popup_obj.pop_make_visible, 50);
            }
        }
    );

    // Define our popup toggle CSS array for enabling/disabling size stylesheets
    for (j = 0; j < popup_obj.pop_size_arry.length; j += 1) {
        popup_obj.pop_dynamic.toggle_css[j] = popup_obj.pop_size_arry[j] + pop_size_ext;
    }

    // Position popup using jquery.ui.position object (as set in tool code)
    jQuery(popup_obj.container).position(popup_obj.pop_position).css('position', 'fixed');

    // Add drag functionality to the popup div container
    jQuery(popup_obj.container).draggable({
        handle: center,
        stop: function (event, ui) {
            var top = msos.popdiv.get_top(ui.helper);

            ui.helper.css('top', top + "px");
        }
    });

    // Build popup head elements
    sml_but.id = 'pop_smaller';
    sml_but.title = popup_obj.i18n.smaller;
    sml_but.className = 'btn btn-msos btn-small fa fa-chevron-down';

    lrg_but.id = 'pop_larger';
    lrg_but.title = popup_obj.i18n.larger;
    lrg_but.className = 'btn btn-msos btn-small fa fa-chevron-up';

    size_onclick = function (evt) {
        msos.do_nothing(evt);

        popup_obj.container.style.visibility = 'hidden';
        popup_obj.visibile = false;

        if (evt.target.id === 'pop_smaller') {
            popup_obj.pop_size_idx -= 1;
        }
        if (evt.target.id === 'pop_larger') {
            popup_obj.pop_size_idx += 1;
        }

        popup_obj.stylesheet_load();

        // In case onload isn't supported for link
        setTimeout(popup_obj.pop_make_visible, 750);
    };

    jQuery(sml_but).click(size_onclick);
    jQuery(lrg_but).click(size_onclick);

    center.id = 'pop_center';
    center.title = popup_obj.i18n.position;

    jQuery(center).addClass('msos_spacer');
    center.appendChild(cent_txt);

    if (!fixed_size) {
        popup_obj.head.appendChild(sml_but);
    }

    popup_obj.head.appendChild(center);

    if (!fixed_size) {
        popup_obj.head.appendChild(lrg_but);
    }

    // --------------------------
    // Popup object functions
    // --------------------------
    this.hide_popdiv = function () {
        popup_obj.container.style.visibility = 'hidden';
        popup_obj.run_on_hide();
        popup_obj.visibile = false;
    };

    this.display_popdiv = function () {
        if (msos.config.verbose) {
            msos.console.debug(temp_tool + ' - display_popdiv -> called.');
        }
        popup_obj.run_on_display();
        popup_obj.container.style.visibility = 'visible';
        popup_obj.visibile = true;
    };

    // Auto hide function for user body (bubbling) onclick
    this.popup_auto_hide = function (evt) {
        if (popup_obj.visibile) {
            var target_parents = msos.common.parents(evt.target, msos.common.filter_parents) || [],
                idx = _.indexOf(target_parents, popup_obj.container);

            // If the onclick event isn't within the popup container, hide the popup
            if (idx === -1) {
                popup_obj.hide_popdiv();
            }
        }
    };

    // Load stylesheet according to specified 'size'
    this.stylesheet_load = function () {

        var sty_txt = ' - stylesheet_load -> ',
            pop_ary = popup_obj.pop_size_arry,
            pop_idx = popup_obj.pop_size_idx,
            pop_lgt = pop_ary.length - 1,
            pop_size = '',
            pop_css = '';

        msos.console.debug(temp_tool + sty_txt + 'size index input: ' + pop_idx, pop_ary);

        // Don't go outside our defined sizes
        if (pop_idx > pop_lgt) {
            pop_idx = pop_lgt;
        }
        if (pop_idx < 0) {
            pop_idx = 0;
        }

        msos.console.debug(temp_tool + sty_txt + 'size index (constrained): ' + pop_idx);

        // Reset, just in case defined above
        popup_obj.pop_size_idx = pop_idx;

        pop_size = pop_ary[pop_idx];

        // Save our current size to a cookie (unless we used a fixed size)
        if (!fixed_size) {
            msos.cookie(popup_obj.pop_cookie, pop_size, { expires: 1 });
        }

        pop_size += pop_size_ext;
        pop_css = pop_size_url + '/' + pop_size + '.css';

        popup_obj.pop_dynamic.load(pop_size, pop_css);

        msos.console.debug(temp_tool + sty_txt + 'done for size: ' + pop_size);
    };

    popup_obj.close.title = popup_obj.i18n.close_title;
    jQuery(popup_obj.close).bind("mouseup", popup_obj.hide_popdiv);

    // Last, load the correct stylesheet
    popup_obj.stylesheet_load();

    msos.console.debug(temp_tool + ' -> created: ' + pop_container.id);
};


// --------------------------
// Register tools to the page
// --------------------------

msos.popdiv.register_tool = function (tool_object) {
    "use strict";

    var name = tool_object.tool_name,
        temp = 'msos.popdiv.register_tool';

    msos.console.info(temp + ' >>>>>> start.');

    if (msos.registered_tools[name] && msos.registered_tools[name].base) {
        msos.console.error(temp + ' -> tool name is already registered: ' + name, tool_object);
    } else {
        msos.registered_tools[name] = {
            base: tool_object,
            dialog: {}
        };
        msos.console.info(temp + ' >>>>>> done, registered: ' + name);
    }
};

