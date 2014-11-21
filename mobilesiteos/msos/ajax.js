// Copyright Notice:
//				    ajax.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile ajax filled popup div functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.ajax");
msos.require("msos.popdiv");

msos.ajax.version = new msos.set_version(14, 3, 14);


// Start by loading our pop_ajax.css stylesheet
msos.ajax.css = new msos.loader();
msos.ajax.css.load('pop_ajax_css', msos.resource_url('css', 'pop_ajax.css'));

// Don't translate #ajax_header text (use msos.i18n)
msos.config.google.no_translate.by_id.push('#ajax_header');


msos.ajax.create_popup = function () {
    "use strict";

    var temp_tool = 'msos.ajax.create_popup',
        ajax_name = 'msos_ajax_popup',
        ajax_pop_obj = this;

    msos.console.debug(temp_tool + ' -> start.');

    // Create our standard 'tool' parameters
    this.tool_name = ajax_name;
    this.tool_target = null;
    this.tool_iframe = null;
    this.tool_created = false;
    this.tool_on_success = [];
    this.tool_on_complete = [];
    this.tool_load_url = '';
    this.tool_loaded_url = '';
    this.tool_dialog = {};
    this.tool_popup = new msos.popdiv.create_tool(
        ajax_name, '_ajx',
        msos.resource_url('css', 'size'),
        msos.byid("ajax_container"),
        msos.byid("ajax_header"),
        msos.byid("ajax_close"),
        msos.byid("ajax_display"),
        {
            of: jQuery('#body'),
            my: 'left top',
            at: 'left+20 top+120',
            collision: 'none'
        }
    );

    // Ajax tool specific
    this.tool_on_ready = function () {
        return false;
    };
    this.tool_ajax_cache = msos.config.cache;

    // Std function for ajax filled popup load success
    this.load_popup = function (in_html, status, xhr) {
        var content_node = jQuery(ajax_pop_obj.tool_popup.display);
        content_node.fadeOut('slow', function () {
            // Fill the popup div
            content_node.html(in_html);
            content_node.fadeIn('slow');

            // Acknowledge div filled (not ready until here!)
            ajax_pop_obj.tool_popup.filled = true;
            if (msos.config.verbose) {
                msos.console.debug(temp_tool + ' - load_popup -> ready: ' + status, xhr);
            }
            setTimeout(ajax_pop_obj.tool_on_ready, 100);
        });
    };

    // Record successful file load and tool creation (assumes if you got here, the div is live)
    this.register_file = function () {
        ajax_pop_obj.tool_loaded_url = ajax_pop_obj.tool_load_url;
        // Acknowledge that tool created
        ajax_pop_obj.tool_created = true;
    };

    // Now register it to be run on Ajax success
    ajax_pop_obj.tool_on_success.push(ajax_pop_obj.load_popup);
    ajax_pop_obj.tool_on_success.push(ajax_pop_obj.register_file);

    // Add some std debugging
    ajax_pop_obj.tool_on_success.push(msos.ajax_success);
    ajax_pop_obj.tool_on_complete.push(msos.ajax_complete);

    this.get_html = function () {

        // Only need this once if file already loaded
        if (ajax_pop_obj.tool_created && ajax_pop_obj.tool_loaded_url === ajax_pop_obj.tool_load_url) {
            return;
        }

        jQuery.ajax({
            dataType: 'html',
            cache: ajax_pop_obj.tool_ajax_cache,
            // ** Very important: Cache depending on if they are static or not! 
            url: ajax_pop_obj.tool_load_url,
            success: ajax_pop_obj.tool_on_success,
            error: msos.ajax_error,
            complete: ajax_pop_obj.tool_on_complete
        });
    };

    // Set function to execute for popup 'run_on_display'
    ajax_pop_obj.tool_popup.run_on_display = ajax_pop_obj.get_html;

    msos.console.debug(temp_tool + ' -> done!');
};

msos.ajax.add_to_page = function () {
    "use strict";

    var container = jQuery(
            '<div id="ajax_container" class="msos_popup">'
          +     '<div id="ajax_header" class="header_popup">'
          +         '<button id="ajax_close" class="btn btn-danger btn-small fa fa-times"></button>'
          +     '</div>'
          +     '<div id="ajax_display" class="scroll_auto"></div>'
          + '</div>'
        ),
        ajax_obj;

    jQuery('body').append(container);

    // Now create our ajax popup
    ajax_obj = new msos.ajax.create_popup();

    // Register our Ajax popup div
    msos.popdiv.register_tool(ajax_obj);

    // Add auto close
    jQuery('#body').click(ajax_obj.tool_popup.popup_auto_hide);

    ajax_obj.tool_created = true;
};

msos.ajax.get_tool = function () {
    "use strict";

    if (!msos.registered_tools.msos_ajax_popup) { msos.ajax.add_to_page(); }

    return msos.registered_tools.msos_ajax_popup.base;
};