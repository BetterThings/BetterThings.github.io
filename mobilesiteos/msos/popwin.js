// Copyright Notice:
//					popwin.js
//			Copyright©2008-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile popup window functions

/*global
    msos: false,
    jQuery: false
*/

msos.provide("msos.popwin");
msos.require("msos.common");
msos.require("msos.i18n.common");

msos.popwin.version = new msos.set_version(14, 3, 26);


msos.popwin.css_url = msos.resource_url('css', 'popwin.css');

// --------------------------
// Create Popup Windows
// --------------------------

msos.popwin.open = function (window_url, window_name, window_params) {
    "use strict";

    var popup_note = 'msos.popwin.open -> ',
        popup_win = null;

    msos.console.debug(popup_note + 'start.');

    if (!window_params) {
		window_params = 'width=220,height=280,left=5,top=5,dependent=1';
	}

    popup_win = window.open(window_url, window_name, window_params, true) || null;
    
	msos.console.debug(popup_note + 'done!');

	if (msos.popwin.blocked(popup_win)) {
		return null;
	} else {
		// Reset 'dynamic_files' because some browsers (Chrome) don't close/null
		// 'same name' windows very definitively (see msos.popwin.cancel below)
		popup_win.dynamic_files = { js : {}, css : {}, ico : {} };
		return popup_win;
	  }
};

msos.popwin.msos_std = function (win_type, win_name, page_title, page_desc, page_button, page_src) {
    "use strict";

    var pop_note = 'msos.popwin.msos_std',
        pop_win = null,
        win_size = { width: 0, height: 0 },
		pop_page = '',
		pop_content = '',
		pop_buttons = '',
        pop_content_id = '',
        pop_css = [],
        clse_popup_func = null,
        text_input_func = null,
        html_input_func = null,
        set_input_element = null,
        pop_d = null,
        load_popup_css = null,
        idx = 0,
        style_uri = '',
        popup_name = '';

    msos.console.debug(pop_note + ' -> start.');

    pop_win = msos.popwin.open('', win_name);

    if (pop_win) {

		pop_css = msos.deferred_css.concat(msos.popwin.css_url);

        pop_win.input_element = null;
		pop_win.input_clear = true;
		pop_win.input_ready = false;

        clse_popup_func = function () {
            if (pop_win && !pop_win.closed) { pop_win.close(); }
        };

        text_input_func = function (text) {

            if (pop_win.input_element && !pop_win.closed) {

				pop_win.focus();    // bring popup into focus (so we see 'input' happen)

				if (pop_win.input_clear) {
					// Normally we clear
					pop_win.input_element.empty();
				}

				// But sometimes we don't
				pop_win.input_element.html(text);
            }
        };

        html_input_func = function (in_html) {
            if (pop_win.input_element && !pop_win.closed) {

                pop_win.focus();    // bring popup into focus (so we see 'input' happen)
                pop_win.input_element.html(in_html);
            }
        };

		// Add event to close popup on parent window focus and closure
		if (win_type !== 'debug') { jQuery(window).focus(clse_popup_func); }
		jQuery(window).unload(clse_popup_func);

		if        (win_type === 'image') {
			pop_content_id = 'popup_image';
			pop_content = '<img id="popup_image" src="' + page_src + '" alt="' + page_title + '" />';
		} else if (win_type === 'debug') {
			pop_content_id = 'popup_debug';
			pop_content = '<pre id="popup_debug">Add text content using:\n\t\'msos.popwin.debug_write()\'</pre>';
		} else if (win_type === 'div') {
			pop_content_id = 'popup_html';
			pop_content = "<div id='popup_html'>Add html content using '<i>your_pop_widow_obj</i>.html_input()'</div>";
		} else {
			msos.console.error(pop_note + ' -> unknown type: ' + win_type);
			return null;
		  }

		pop_buttons = '<a class="btn btn-msos" href="' + page_src + '">' + page_button + '</a>';

		set_input_element = function () {
			pop_win.input_element = jQuery('#' + pop_content_id, pop_win.document);

			// Make everthing visivle once all loaded
			jQuery('body', pop_win.document).css('visibility', 'visible');

			// Critical to Opera working (others don't care)
			pop_win.close_popup = clse_popup_func;
			pop_win.text_input  = text_input_func;
			pop_win.html_input  = html_input_func;
		};

		pop_page += '<!DOC' + 'TYPE html>' + "\n";
		pop_page += '<html lang="en">' + "\n"
		pop_page += "<head>\n";
		pop_page += '<meta charset="utf-8" />' + "\n";
		pop_page += "<title>" + page_title + "</title>\n";
		pop_page += "</head>\n<body style='visibility:hidden;'>\n";
		pop_page += "<div id='popup'>\n";
		pop_page += "<div id='popup_title'>"	 + page_desc   + "</div>\n";
		pop_page += "<div id='popup_content'>\n" + pop_content + "</div>\n";
		pop_page += "<div id='popup_buttons'>\n" + pop_buttons + "</div>\n";
		pop_page += "</div>\n</body>\n</html>";

		pop_d = pop_win.document;
		pop_d.open();
		pop_d.write(pop_page);
		pop_d.close();
		pop_win.focus();

		// Make sure we have unique css file names
		pop_css = _.uniq(pop_css);

		// Create a dynamic loader object
		load_popup_css = new msos.loader(pop_win);

		msos.css_loader(pop_css, pop_win);

		// Let window settle before using 'pop_win.input_element'
		// (Opera is very sensitive about this, maybe others)
		setTimeout(set_input_element, 1500);

		win_size = msos.get_viewport(pop_win);

		msos.console.debug(pop_note + ' -> done, type: ' + win_type + ', created size - w: ' + win_size.width + ', h: ' + win_size.height);
    }
    return pop_win;
};

msos.popwin.cancel = function (win_cnl) {
    "use strict";

    if (win_cnl && !win_cnl.closed) {
		win_cnl.close();
		win_cnl.dynamic_files = { js : {}, css : {}, ico : {} };
		return false;
    }
    return true;
};

msos.popwin.blocked = function (popup) {
    "use strict";

    var block_msg = 'msos.popwin.blocked -> ',
		blocked = false;

	msos.console.debug(block_msg + 'start.');

	// Test for popup creation
	if (popup && !popup.closed) {

		if (_.isNull(popup.document)	|| _.isUndefined(popup.document))	{ blocked = true; }
		if (_.isNull(popup.closed)		|| _.isUndefined(popup.closed))		{ blocked = true; }
		if (popup.location === 'about:blank')								{ blocked = true; }

		// Opera: popup not ready due to prompt
		if (!popup.document.getElementsByTagName) {
			blocked = true;
		}

	} else										{ blocked = true; }

	msos.console.debug(block_msg + 'done: ' + blocked);
	msos.config.popups_blocked = blocked;

	setTimeout(
		function () {
			if (popup
			&& !popup.closed
			&&  popup.innerHeight === 0) {
				blocked = true;
			}
			msos.console.debug(block_msg + 'timed check: ' + blocked);
			msos.config.popups_blocked = blocked;
			if (blocked) {
				msos.notify.warning(msos.i18n.common.bundle.blocked);
			}
		},
		1500
	);

	// Notice, this may change for Chrome (ref. setTimeout)
	return blocked;
};


// --------------------------
// Debugging window stuff
// --------------------------

msos.popwin.debug_window  = null;
msos.popwin.debug_suppress_warn = false;

if (window.opener) {
    msos.popwin.debug_window  = window.opener.msos.popwin.debug_window || null;
}

msos.popwin.start_debug_window = function () {
    "use strict";

	var i18n = msos.i18n.common.bundle;

    // We only want one instance of the debug window
    if (msos.popwin.debug_window
	&& !msos.popwin.debug_window.closed) {
		return;
	}
    msos.popwin.debug_window = msos.popwin.msos_std(
        'debug',
        'msos_debug_window',
        i18n.debug_win,
        i18n.debug_out,
        i18n.close,
        'javascript: window.opener.msos.popwin.cancel(this);'
    );
};

msos.popwin.event_debug = function (evt, text) {
    "use strict";

    if (!msos.popwin.debug_window) { return; }

    var txt = msos.common.event_text(evt, text);

    if (msos.popwin.debug_window
    && !msos.popwin.debug_window.closed) {
		// If popup window exists...
		msos.popwin.debug_write(txt);
    } else {
		// Else, just output to console (a little messy)
		msos.console.debug("msos.popwin.event_debug ->");
		msos.console.debug(txt);
		msos.console.debug(evt);
      }
};

msos.popwin.debug_write = function (text) {
    "use strict";

    var temp_wri = 'msos.popwin.debug_write -> ';

    if (msos.popwin.debug_window
    && !msos.popwin.debug_window.closed) {
		if (msos.popwin.debug_window.text_input) {
			msos.popwin.debug_window.input_ready = true;
			msos.popwin.debug_window.text_input(text);
		} else {
			if (!msos.popwin.debug_suppress_warn) {
				msos.console.warn(temp_wri + 'not ready!');
			}
		}
    } else {
		msos.console.warn(temp_wri + 'not available!');
      }
};
