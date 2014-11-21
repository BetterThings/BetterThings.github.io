// Copyright Notice:
//				    overflowscroll.js
//			Copyright©2011-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile overflowscroll specific functions

/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("msos.overflowscroll");
msos.require("msos.tools.overflowscroll");
msos.require("msos.common");

msos.overflowscroll.version = new msos.set_version(13, 11, 6);

// Start by loading the overflowscroll.css stylesheet
msos.overflowscroll.css = new msos.loader();
msos.overflowscroll.css.load('overflowscroll_css', msos.resource_url('css', 'overflowscroll.css'));

msos.overflowscroll.check_tag_name = function ($elm) {
    "use strict";

    var temp_ctn = 'msos.overflowscroll.check_tag_name -> ',
        tag_name = $elm.prop("tagName").toLowerCase() || '',
        tag_names = [
            'address', 'article', 'aside', 'blockquote', 'details', 'div', 'figcaption', 'figure',
            'footer', 'form', 'header', 'hgroup', 'nav', 'output', 'p', 'section', 'summary'
        ];

    if (tag_names.indexOf(tag_name) !== -1) { return true; }

    msos.console.warn(temp_ctn + 'can not process: ' + tag_name);
    return false;
};

msos.overflowscroll.init = function (scroll_elm) {
    "use strict";

    var temp_scr = 'msos.overflowscroll.init',
        scl_obj = this;

    this.scroll_elm = scroll_elm;
    this.scroll_content_h = 0;
    this.scroll_content_w = 0;
    this.scroll_pane = null;
    this.scroll_initialized = false;
    this.scroll_pane_h = 0;
    this.scroll_pane_w = 0;

    this.v_handle = null;
    this.h_handle = null;
    this.v_handle_h = 0;
    this.h_handle_w = 0;
    this.v_handle_max = 0;
    this.h_handle_max = 0;
    this.v_handle_pos = 0;
    this.h_handle_pos = 0;
    this.v_handle_size_min = 25;
    this.v_handle_size_max = 100;
    this.h_handle_size_min = 25;
    this.h_handle_size_max = 100;

    this.v_scroll_gutter = null;
    this.h_scroll_gutter = null;
    this.v_scroll_gutter_h = 0;
    this.h_scroll_gutter_w = 0;

    this.v_scroll_t_f = false;
    this.h_scroll_t_f = false;

    this.v_rel_view = 0;
    this.h_rel_view = 0;

    this.scroll_elm_padding = scroll_elm.css('paddingTop') + ' ' + scroll_elm.css('paddingRight') + ' ' + scroll_elm.css('paddingBottom') + ' ' + scroll_elm.css('paddingLeft');
    this.scroll_elm_padding_w = (parseInt(scroll_elm.css('paddingLeft'),    10) || 0) + (parseInt(scroll_elm.css('paddingRight'),   10) || 0);
    this.scroll_elm_padding_h = (parseInt(scroll_elm.css('paddingBottom'),  10) || 0) + (parseInt(scroll_elm.css('paddingTop'),     10) || 0);

    msos.console.debug(temp_scr + ' -> start.');

    this.update_scrolling = function () {

        var temp_ini = ' - update_scrolling -> ',
            scrolled_html = '',
            scrolled_kids = scl_obj.scroll_elm.children();

        msos.console.debug(temp_scr + temp_ini + 'start, ' + (scl_obj.scroll_initialized ? 'update' : 'initialize') + ' scroll element: ' + (scroll_elm.attr('id') || scroll_elm[0].nodeName) + ', inner w: ' + scroll_elm.innerWidth() + ', inner h: ' + scroll_elm.innerHeight() + ', padding: ' + scl_obj.scroll_elm_padding_w);

        // Set to overflow:hidden and remove padding
        // (we use 'scroll_elm' as our container element),
        scl_obj.scroll_elm.css({
            overflow: 'hidden',
            position: 'relative'
        });

        // Set 'scroll_pane' to have 'scroll_elm' original padding
        scl_obj.scroll_pane = jQuery('<div class="scroll_pane" />').css('padding', scl_obj.scroll_elm_padding);
 
        // Insert our 'to be scrolled' child elements
        scl_obj.scroll_pane.append(scrolled_kids);

        // Add the scrolling pane
        scl_obj.scroll_elm.append(scl_obj.scroll_pane);

        // Size our inserted scrolling pane
        scl_obj.set_scroll_pane_size();

        // Add touch event code
        if (!scl_obj.scroll_initialized) {
            msos.overflowscroll.touch(scl_obj);
        }

        scl_obj.scroll_initialized = true;

        msos.console.debug(temp_scr + temp_ini + 'done!');
    };

    this.update_size = function () {

        var temp_upd = ' - update_size -> ';

        msos.console.debug(temp_scr + temp_upd + 'start, dom: ' + (scl_obj.scroll_elm.attr('id') || scl_obj.scroll_elm[0].nodeName) + ', inner w: ' + scl_obj.scroll_elm.innerWidth() + ', inner h: ' + scl_obj.scroll_elm.innerHeight() + ', padding: ' + scl_obj.scroll_elm_padding_w);

        if (!scl_obj.scroll_initialized) {
            msos.console.debug(temp_scr + temp_upd + 'initialize.');
            scl_obj.update_scrolling();
        }

        // If added previously, remove now...
        scl_obj.scroll_elm.find('.scroll_gutter_vert').remove();
        scl_obj.scroll_elm.find('.scroll_gutter_horz').remove();
        scl_obj.scroll_elm.find('.scroll_corner').remove();

        // Reset so div sizing (.innerWidth()) info comes out correct
        scl_obj.scroll_pane.css({
            width: '',
            height: ''
        });

        scl_obj.set_scroll_pane_size();

        msos.console.debug(temp_scr + temp_upd + 'done!');
    };

    this.set_scroll_pane_size = function () {

        var scrolling_type = '',
            v_gutter_thick = 0,
            h_gutter_thick = 0;

        msos.console.debug(temp_scr + ' - set_scroll_pane_size -> start.');

        // Find what scrolling is needed
        scl_obj.calc_required_scrolling();

        // Need both vertical and horizontal scrolling
        if (scl_obj.h_scroll_t_f && scl_obj.v_scroll_t_f) {

            scl_obj.create_horz_handle();
            scl_obj.create_vert_handle();

            scl_obj.v_scroll_gutter = jQuery('<div class="scroll_gutter_vert" />').append(scl_obj.v_handle);
            scl_obj.h_scroll_gutter = jQuery('<div class="scroll_gutter_horz" />').append(scl_obj.h_handle);

            scroll_elm.append(scl_obj.v_scroll_gutter);
            scroll_elm.append(scl_obj.h_scroll_gutter);
            scroll_elm.append(jQuery('<div class="scroll_corner" />'));

            // Find gutter thickness (defined in CSS)
            v_gutter_thick = jQuery('.scroll_gutter_vert').outerWidth() || 0;
            h_gutter_thick = jQuery('.scroll_gutter_horz').outerHeight() || 0;

            // Calculate scroll pane size
            scl_obj.scroll_pane_h = scroll_elm.innerHeight() - h_gutter_thick - scl_obj.scroll_elm_padding_h;
            scl_obj.scroll_pane_w = scroll_elm.innerWidth() - v_gutter_thick - scl_obj.scroll_elm_padding_w;

            // And apply
            scl_obj.scroll_pane.height(scl_obj.scroll_pane_h + 'px');
            scl_obj.scroll_pane.width(scl_obj.scroll_pane_w + 'px');

            // Calculate gutter width(horz) & height(vert)
            scl_obj.v_scroll_gutter_h = scl_obj.scroll_pane.outerHeight();
            scl_obj.h_scroll_gutter_w = scl_obj.scroll_pane.outerWidth();

            scl_obj.v_scroll_gutter.height(scl_obj.v_scroll_gutter_h + 'px');
            scl_obj.v_handle_pos = 0;

            scl_obj.h_scroll_gutter.width(scl_obj.h_scroll_gutter_w + 'px');
            scl_obj.h_handle_pos = 0;

            scrolling_type = 'both horizontal and vertical scrolling.';

            // Need only horizontal scrolling
        }
        else if (scl_obj.h_scroll_t_f) {

            scl_obj.create_horz_handle();

            scl_obj.h_scroll_gutter = jQuery('<div class="scroll_gutter_horz" />').append(scl_obj.h_handle);

            scroll_elm.append(scl_obj.h_scroll_gutter);

            // Find gutter thickness (defined in CSS)
            h_gutter_thick = jQuery('.scroll_gutter_horz').outerHeight() || 0;

            // Calculate scroll pane size
            scl_obj.scroll_pane_h = scroll_elm.innerHeight() - h_gutter_thick - scl_obj.scroll_elm_padding_h;
            scl_obj.scroll_pane_w = scroll_elm.innerWidth() - scl_obj.scroll_elm_padding_w;

            // And apply
            scl_obj.scroll_pane.height(scl_obj.scroll_pane_h + 'px');
            scl_obj.scroll_pane.width(scl_obj.scroll_pane_w + 'px');

            // Calculate gutter width(horz)
            scl_obj.h_scroll_gutter_w = scl_obj.scroll_pane.outerWidth();

            scl_obj.h_scroll_gutter.width(scl_obj.h_scroll_gutter_w + 'px');
            scl_obj.h_handle_pos = 0;

            scrolling_type = 'horizontal scrolling.';

            // Need only vertical scrolling
        }
        else if (scl_obj.v_scroll_t_f) {

            scl_obj.create_vert_handle();

            scl_obj.v_scroll_gutter = jQuery('<div class="scroll_gutter_vert" />').append(scl_obj.v_handle);

            scroll_elm.append(scl_obj.v_scroll_gutter);

            // Find gutter thickness (defined in CSS)
            v_gutter_thick = jQuery('.scroll_gutter_vert').outerWidth() || 0;

            // Calculate scroll pane size
            scl_obj.scroll_pane_h = scroll_elm.innerHeight() - scl_obj.scroll_elm_padding_h;
            scl_obj.scroll_pane_w = scroll_elm.innerWidth() - v_gutter_thick - scl_obj.scroll_elm_padding_w;

            // And apply
            scl_obj.scroll_pane.height(scl_obj.scroll_pane_h + 'px');
            scl_obj.scroll_pane.width(scl_obj.scroll_pane_w  + 'px');

            // Calculate gutter height(vert)
            scl_obj.v_scroll_gutter_h = scl_obj.scroll_pane.outerHeight();

            // And apply
            scl_obj.v_scroll_gutter.height(scl_obj.v_scroll_gutter_h + 'px');
            scl_obj.v_handle_pos = 0;

            scrolling_type = 'vertical scrolling.';

            // No scrolling needed
        } else {

            // Calculate scroll pane size
            scl_obj.scroll_pane_h = scroll_elm.innerHeight() - scl_obj.scroll_elm_padding_h;
            scl_obj.scroll_pane_w = scroll_elm.innerWidth()  - scl_obj.scroll_elm_padding_w;

            // And apply
            scl_obj.scroll_pane.height(scl_obj.scroll_pane_h + 'px');
            scl_obj.scroll_pane.width(scl_obj.scroll_pane_w  + 'px');

            scrolling_type = 'no scrolling.';

        }

        // Set proportional horizontal handle width
        if (scl_obj.h_scroll_t_f) {
            scl_obj.h_handle_w = Math.ceil(1 / scl_obj.h_rel_view * scl_obj.h_scroll_gutter_w);

            if (scl_obj.h_handle_w > scl_obj.h_handle_size_max) {
                scl_obj.h_handle_w = scl_obj.h_handle_size_max;
            }
            else if (scl_obj.h_handle_w < scl_obj.h_handle_size_min) {
                scl_obj.h_handle_w = scl_obj.h_handle_size_min;
            }

            scl_obj.h_handle.width(scl_obj.h_handle_w + 'px');
            scl_obj.h_handle_max = scl_obj.h_scroll_gutter_w - scl_obj.h_handle_w;
        }
        // Set proportional vertical handle height
        if (scl_obj.v_scroll_t_f) {
            scl_obj.v_handle_h = Math.ceil(1 / scl_obj.v_rel_view * scl_obj.v_scroll_gutter_h);

            if (scl_obj.v_handle_h > scl_obj.v_handle_size_max) {
                scl_obj.v_handle_h = scl_obj.v_handle_size_max;
            }
            else if (scl_obj.v_handle_h < scl_obj.v_handle_size_min) {
                scl_obj.v_handle_h = scl_obj.v_handle_size_min;
            }

            scl_obj.v_handle.height(scl_obj.v_handle_h + 'px');
            scl_obj.v_handle_max = scl_obj.v_scroll_gutter_h - scl_obj.v_handle_h;
        }

        msos.console.debug(temp_scr + ' - set_scroll_pane_size -> done for: ' + scrolling_type);
    };

    this.calc_required_scrolling = function () {

        var temp_clc = ' - calc_required_scrolling -> ';

        // Get content width and height
        scl_obj.scroll_content_w = scl_obj.scroll_pane.innerWidth();
        scl_obj.scroll_content_h = scl_obj.scroll_pane.innerHeight();

        msos.console.debug(temp_scr + temp_clc + 'start, content w: ' + scl_obj.scroll_content_w + ', content h: ' + scl_obj.scroll_content_h);

        if (scl_obj.scroll_content_w === 0 || scl_obj.scroll_content_h === 0 || typeof scl_obj.scroll_content_w !== 'number' || typeof scl_obj.scroll_content_h !== 'number') {
            msos.console.error(temp_scr + temp_clc + 'failed for content w: ' + scl_obj.scroll_content_w + ', h: ' + scl_obj.scroll_content_h);
        }

        // Now get the relative view size
        scl_obj.h_rel_view = scl_obj.scroll_content_w / scroll_elm.innerWidth();
        scl_obj.v_rel_view = scl_obj.scroll_content_h / scroll_elm.innerHeight();

        // Record True/False vertical and horizontal scrolling needed
        scl_obj.v_scroll_t_f = scl_obj.v_rel_view > 1;
        scl_obj.h_scroll_t_f = scl_obj.h_rel_view > 1;

        msos.console.debug(temp_scr + temp_clc + 'done!');
    };

    this.position_handle_y = function (y) {
        var temp_hnd = ' - position_handle_y -> ';

        if (!scl_obj.v_scroll_t_f) {
            msos.console.error(temp_scr + temp_hnd + 'not needed!');
            return;
        }

        if (y < 0) {
            y = 0;
        }
        else if (y > scl_obj.v_handle_max) {
            y = scl_obj.v_handle_max;
        }

        if (msos.config.verbose) {
            msos.console.debug(temp_scr + temp_hnd + 'top: ' + y);
        }

        scl_obj.v_handle.css('top', y);
        scl_obj.v_handle_pos = y;
    };

    this.position_handle_x = function (x) {
        var temp_hnd = ' - position_handle_x -> ';

        if (!scl_obj.h_scroll_t_f) {
            msos.console.error(temp_scr + temp_hnd + 'not needed!');
            return;
        }

        if (x < 0) {
            x = 0;
        }
        else if (x > scl_obj.h_handle_max) {
            x = scl_obj.h_handle_max;
        }

        if (msos.config.verbose) {
            msos.console.debug(temp_scr + temp_hnd + 'left: ' + x);
        }

        scl_obj.h_handle.css('left', x);
        scl_obj.h_handle_pos = x;
    };

    this.position_pane_y = function () {

        var temp_scy = ' - position_pane_y -> ',
            handle_at_top = scl_obj.v_handle_pos === 0,
            handle_at_bot = scl_obj.v_handle_pos === scl_obj.v_handle_max,
            to_top = (scl_obj.v_handle_pos / scl_obj.v_handle_max) * (scl_obj.scroll_content_h - scl_obj.scroll_pane_h);

        to_top = parseInt(to_top, 10);

        scl_obj.scroll_pane.css('top', -to_top);

        if (msos.config.verbose) {
            msos.console.debug(temp_scr + temp_scy + 'top: ' + to_top);
        }

        scroll_elm.trigger('wbk_scroll_y', [to_top, handle_at_top, handle_at_bot]).trigger('scroll');
    };

    this.position_pane_x = function () {

        var temp_scx = ' - position_pane_x -> ',
            handle_at_left = scl_obj.h_handle_pos === 0,
            handle_at_right = scl_obj.h_handle_pos === scl_obj.h_handle_max,
            to_left = (scl_obj.h_handle_pos / scl_obj.h_handle_max) * (scl_obj.scroll_content_w - scl_obj.scroll_pane_w);

        to_left = parseInt(to_left, 10);

        scl_obj.scroll_pane.css('left', -to_left);

        if (msos.config.verbose) {
            msos.console.debug(temp_scr + temp_scx + 'left: ' + to_left);
        }

        scroll_elm.trigger('wbk_scroll_x', [to_left, handle_at_left, handle_at_right]).trigger('scroll');
    };

    this.create_vert_handle = function () {

        scl_obj.v_handle = jQuery('<div class="scroll_handle" />').bind('mousedown.msos_overflowscroll', function (e) {
            msos.do_nothing(e);
            var start_y = e.pageY - scl_obj.v_handle.position().top;

            jQuery('html').bind('mousemove.msos_overflowscroll', function (e) {
                msos.do_nothing(e);
                var move_y = parseInt(e.pageY - start_y, 10);
                scl_obj.position_handle_y(move_y);
                scl_obj.position_pane_y();
                msos.common.pause(50);
            }).bind('mouseup.msos_overflowscroll mouseleave.msos_overflowscroll', function () {
                jQuery('html').unbind('mousemove.msos_overflowscroll mouseup.msos_overflowscroll mouseleave.msos_overflowscroll');
                msos.console.debug(temp_scr + ' - create_vert_handle -> mouseup/leave unbind.');
            });
            msos.console.debug(temp_scr + ' - create_vert_handle -> mousedown bind.');
            return false;
        });
    };

    this.create_horz_handle = function () {

        scl_obj.h_handle = jQuery('<div class="scroll_handle" />').bind('mousedown.msos_overflowscroll', function (e) {
            msos.do_nothing(e);
            var start_x = e.pageX - scl_obj.h_handle.position().left;

            jQuery('html').bind('mousemove.msos_overflowscroll', function (e) {
                msos.do_nothing(e);
                var move_x = parseInt(e.pageX - start_x, 10);
                scl_obj.position_handle_x(move_x);
                scl_obj.position_pane_x();
                msos.common.pause(50);
            }).bind('mouseup.msos_overflowscroll mouseleave.msos_overflowscroll', function () {
                jQuery('html').unbind('mousemove.msos_overflowscroll mouseup.msos_overflowscroll mouseleave.msos_overflowscroll');
                msos.console.debug(temp_scr + ' - create_horz_handle -> mouseup/leave unbind.');
            });
            msos.console.debug(temp_scr + ' - create_horz_handle -> mousedown bind.');
            return false;
        });
    };

    msos.console.debug(temp_scr + ' -> done!');
};

msos.overflowscroll.touch = function (scroll_object) {
    "use strict";

    var start_x, start_y, touch_x, touch_y, moving = false;

    scroll_object.scroll_elm
        .unbind('touchstart.msos_overflowscroll touchmove.msos_overflowscroll touchend.msos_overflowscroll click.msos_overflowscroll')
        .bind(
            'touchstart.msos_overflowscroll',
            function (e) {
                var touch = e.originalEvent.touches[0];
        
                start_x = -scroll_object.scroll_pane.position().left;
                start_y = -scroll_object.scroll_pane.position().top;
                touch_x = touch.pageX;
                touch_y = touch.pageY;
                moving = true;
        
                e.preventDefault();
                return false;
            })
        .bind(
            'touchmove.msos_overflowscroll',
            function (ev) {
                if (!moving) {
                    ev.preventDefault();
                    return false;
                }
        
                var percent_x = 0,
                    percent_y = 0,
                    move_x = 0,
                    move_y = 0,
                    touch_position = ev.originalEvent.touches[0];
        
                percent_x = (start_x + touch_x - touch_position.pageX) / (scroll_object.scroll_content_w - scroll_object.scroll_pane_w);
                move_x = parseInt(percent_x * scroll_object.h_handle_max, 10);
        
                scroll_object.position_handle_x(move_x);
                scroll_object.position_pane_x();
        
                percent_y = (start_y + touch_y - touch_position.pageY) / (scroll_object.scroll_content_h - scroll_object.scroll_pane_h);
                move_y = parseInt(percent_y * scroll_object.v_handle_max, 10);
        
                scroll_object.position_handle_y(move_y);
                scroll_object.position_pane_y();
        
                ev.preventDefault();
                return false;
            })
        .bind(
            'touchend.msos_overflowscroll',
            function (e) {
                moving = false;
                e.preventDefault();
                return false;
            })
        .bind(
            'click.msos_overflowscroll',
            function (e) {
                e.preventDefault();
                return false;
            });
};


// --------------------------
// Functions to grab applicable nodes for applying overflowscroll scrolling
// --------------------------

msos.overflowscroll.add = function (scroll_content) {
    "use strict";

    var temp_oa = 'msos.overflowscroll.add -> ',
        content_names = [],
        i = 0,
        scroll_node = null,
        scroll_parent = null,
        scroll_obj = {},
        scroll_node_hidden = false,
        scroll_parent_hidden = false,
        node_name = '';

    msos.console.debug(temp_oa + 'start.');

    scroll_content = scroll_content ? scroll_content : [];

    if (scroll_content.length > 0) {
        for (i = 0; i < scroll_content.length; i += 1) {
            // Reset hidden checks
            scroll_node_hidden = false;
            scroll_parent_hidden = false;

            scroll_node = jQuery(scroll_content[i]);

            // Only process valid (as def. by us) elements
            if (!msos.overflowscroll.check_tag_name(scroll_node)) { continue; }

            scroll_parent = scroll_node.parent();

            if (scroll_parent.css('display') == 'none') {
                scroll_parent_hidden = true;
                scroll_parent.show();
            }
            if (scroll_node.css('display') == 'none') {
                scroll_node_hidden = true;
                scroll_node.show();
            }

            scroll_obj = new msos.overflowscroll.init(scroll_node);

            scroll_obj.update_scrolling();

            if (scroll_node_hidden)     { scroll_node.hide(); }
            if (scroll_parent_hidden)   { scroll_parent.hide(); }

            node_name = scroll_parent.attr('id') || scroll_parent[0].nodeName + '_' + i;
            content_names.push(node_name);
        }
    }
    msos.console.debug(temp_oa + 'done, for: ' + (content_names.length > 0 ? content_names : 'none'));
};

msos.overflowscroll.debug = function (content_popup) {
    "use strict";

    var temp_pop = 'msos.overflowscroll.debug',
        displays = [],
        j = 0,
        content_node = null,
        scroll_obj = {},
        tool_obj = {},
        add_update_scrolling = null,
        update_popup_size = null,
        tool_name = '',
        node_name = '';

    msos.console.debug(temp_pop + ' -> start.');

    content_popup = content_popup ? content_popup : [];

    if (content_popup.length > 0) {
        for (j = 0; j < content_popup.length; j += 1) {
            content_node = jQuery(content_popup[j]);

            // Only process valid (as def. by us) elements
            if (!msos.overflowscroll.check_tag_name(content_node)) { continue; }
            
            scroll_obj = new msos.overflowscroll.init(content_node);
            tool_obj = {};

            update_popup_size = function () {
                var temp_upd = ' - update_popup_size -> ';

                msos.console.debug(temp_pop + temp_upd + 'start.');
                setTimeout(scroll_obj.update_size, 250); // Update for popup size change, delay allows CSS to apply fully
                msos.console.debug(temp_pop + temp_upd + 'done!');
            };

            tool_name = content_node[0].registered_tool_name || '';

            if (tool_name) {
                tool_obj = msos.registered_tools[tool_name].base || null;
                if (tool_obj && tool_obj.tool_on_ready // Ref: debug popup html loading
                 && tool_obj.tool_popup.pop_dynamic) {
                    if (tool_obj.tool_popup.filled) {
                        msos.console.debug(temp_pop + ' -> failed: too late, tool_on_ready already fired!');
                    } else {
                        tool_obj.tool_on_ready = scroll_obj.update_scrolling;
                        tool_obj.tool_popup.pop_dynamic.add_resource_onload.push(update_popup_size); // Ref: wait until popup size CSS is received (loaded but not necessarily applied)
                        msos.console.debug(temp_pop + ' -> added functions to: ' + tool_name);
                    }
                }
                else {
                    msos.console.debug(temp_pop + ' -> failed: no tool object for: ' + tool_name);
                }
            }
            else {
                msos.console.debug(temp_pop + ' -> failed: no tool name!');
            }
            node_name = content_node.attr('id') || content_node[0].nodeName;
            displays.push(node_name);
        }
    }
    msos.console.debug(temp_pop + ' -> done, for: ' + (displays.length > 0 ? displays : 'none'));
};

msos.overflowscroll.apply = function () {
    "use strict";

    var temp_ms = 'msos.overflowscroll.apply -> ',
        $scroll_auto = jQuery('.scroll_auto');

    msos.console.debug(temp_ms + 'start.');

    if (msos.tools.overflowscroll.available()) {
        msos.console.debug(temp_ms + 'done, do not need msos.overflowscroll!');
    }

    // Possible additions: '.ui-expander-content', '#chat-tabs'

    // If this selector is found in the page...
    if ($scroll_auto.length) {
        msos.overflowscroll.add($scroll_auto);
    }

    // If the module is loaded, then add overflow scrolling to these selectors
    if (msos.tab) {
        msos.overflowscroll.add(jQuery('.tab_content_inner'));
    }
    if (jquery.ui
     && jquery.ui.accordion) {
        msos.overflowscroll.add(jQuery('.ui-accordion-content'));
    }
    if (jquery.wijmo
     && jquery.wijmo.accordion) {
        msos.overflowscroll.add(jQuery('.ui-widget-content'));
    }

    // Special: These require execution by a callback (added to DOM after page load)
    if (msos.ajax) {
        msos.overflowscroll.debug(jQuery('#ajax_display'));
    }
    if (msos.debug) {
        msos.overflowscroll.debug(jQuery('#debug_display'));
    }

    msos.console.debug(temp_ms + 'done!');
};


msos.onload_func_done.push(msos.overflowscroll.apply);