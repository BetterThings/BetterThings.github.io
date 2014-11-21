/* jQuery slidePanel plugin
 * Examples and documentation at: http://www.jqeasy.com/
 * Version: 1.0 (22/03/2010)
 * No license. Use it however you want. Just keep this notice included.
 * Requires: jQuery v1.3+
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/*global
    msos: false,
    jQuery: false,
    jquery: false
*/

msos.provide("jquery.tools.slidepanel");

jquery.tools.slidepanel.version = new msos.set_version(13, 8, 4);


jquery.tools.slidepanel.css = new msos.loader();
jquery.tools.slidepanel.css.load('jquery_css_tools_slidepanel_css', msos.resource_url('jquery', 'css/tools/slidepanel.css'));


jquery.tools.slidepanel.close_others = [];

(function ($) {
	"use strict";

    $.fn.slidePanel = function (opts) {
        opts = $.extend({
            triggerName:	'#trigger',
            position:		'absolute',
            triggerTopPos:	'40px',
			triggerRtPos:	0,
			triggerLtPos:	0,
            panelTopPos:	'30px',
			panelRtPos:		0,
			panelLtPos:		0,
            panelOpacity:	0.9,
            speed:			'fast',
            ajax:			false,
            ajaxSource:		null,
            close_click_outside: false,
			close_click_other: true,
			open_icon_class: 'icon-plus-sign',
			close_icon_class: 'icon-minus-sign',
			panel_is_displayed: false
        }, opts || {});

		var panel = this,
			panel_index = 0,
			panel_loaded = false,
			trigger = $(opts.triggerName),
			trig_icon = trigger.find($('i')),
			close_panel = null,
			open_panel = null,
			load_panel = null,
			temp_jsp = 'jquery.tools.slidepanel -> ';

		msos.console.debug(temp_jsp + 'start, found trigger: ' + (trig_icon.length ? 'true' : 'false') + ', panel: ' + (panel.length ? 'true' : 'false'));

        if (opts.position === 'fixed') {
			trigger.css('position', opts.position);
			  panel.css('position', opts.position);
		}
        trigger.css('top', opts.triggerTopPos);
		  panel.css('top', opts.panelTopPos);

		// Default it set in slidepanel.css right: 0 or left: 0 for each
		if (opts.triggerRtPos !== 0) { trigger.css('right', opts.triggerRtPos); }
		if (opts.triggerLtPos !== 0) { trigger.css('left',  opts.triggerLtPos); }

		if (opts.panelRtPos !== 0) { panel.css('right', opts.panelRtPos); }
		if (opts.panelLtPos !== 0) { panel.css('left',  opts.panelLtPos); }

        panel.css('filter',		'alpha(opacity=' + (opts.panelOpacity * 100) + ')');
        panel.css('opacity',	opts.panelOpacity);

		trig_icon.addClass(opts.open_icon_class);	// Initially use open trigger icon

		close_panel = function () {
				panel.hide(opts.speed);
				trigger.removeClass('active');
				panel.removeClass("active");
				trig_icon.removeClass(opts.close_icon_class);
				trig_icon.addClass(opts.open_icon_class);
				opts.panel_is_displayed = false;
		};

		open_panel = function () {
				panel.show(opts.speed);
				trigger.addClass("active");
				panel.addClass("active");
				trig_icon.removeClass(opts.open_icon_class);
				trig_icon.addClass(opts.close_icon_class);
				opts.panel_is_displayed = true;
		};

		load_panel = function () {
			panel.load(
				opts.ajaxSource,
				function (response, status, xhr) {
					// if the ajax source wasn't loaded properly
					if (status !== "success") {
						msos.ajax_error(xhr, status, 'An error occured while loading panel content.');
					}

					panel.html(response);

					if (opts.panel_is_displayed)	{ close_panel(); }
					else							{ open_panel();  }
				}
			);
			panel_loaded = true;
		};

		// First time through...
		if (opts.panel_is_displayed) {
			if (panel_loaded) {
				open_panel();
			} else {
				opts.panel_is_displayed = false;	// Fake-out to display after load.
				load_panel();
			}
		}

        // 'triggerName' mousedown event
        trigger.mousedown(
			function (e) {
				var i = 0;

				// Close all panels which are to be closed when others are opened
				for (i = 0; i < jquery.tools.slidepanel.close_others.length; i += 1) {
					if (i !== panel_index) {
						jquery.tools.slidepanel.close_others[i]();
					}
				}

				// Load default content if ajax is false
				if (!opts.ajax) {
					if (opts.panel_is_displayed)	{ close_panel(); }
					else							{ open_panel();  }
				} else if (opts.ajaxSource !== null) {
					if (!panel_loaded) {
						load_panel();
					} else {
						if (opts.panel_is_displayed)	{ close_panel(); }
						else							{ open_panel();  }
					}

				} else if (msos.var_is_empty(opts.ajaxSource)) {
					msos.console.warn(temp_jsp + 'no ajax source defined.');
				}

				msos.do_nothing(e);
			}
		);

        if (opts.close_click_outside) {

            $(document).bind(
				'mousedown',
				close_panel
			);

            panel.bind(
				'mousedown',
				function (e) {
					msos.do_nothing(e);
				}
			);
        }

		if (opts.close_click_other) {
			jquery.tools.slidepanel.close_others.push(close_panel);
			panel_index = jquery.tools.slidepanel.close_others.length - 1;
		} else {
			panel_index = - 1;
		}

		msos.console.debug(temp_jsp + 'done!');
    };
}(jQuery));