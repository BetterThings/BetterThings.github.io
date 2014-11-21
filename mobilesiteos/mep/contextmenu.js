/*!
* MediaElement.js
* HTML5 <video> and <audio> shim and player
* http://mediaelementjs.com/
*
* Copyright 2010-2012, John Dyer (http://j.hn)
* Dual licensed under the MIT or GPL Version 2 licenses.
*
*/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("mep.contextmenu");

mep.contextmenu.version = new msos.set_version(14, 6, 15);


// Start by loading our contextmenu.css stylesheet
mep.contextmenu.css = new msos.loader();
mep.contextmenu.css.load('mep_css_contextmenu', msos.resource_url('mep', 'css/contextmenu.css'));

mep.contextmenu.start = function () {
	"use strict";

	var temp_cts = 'mep.contextmenu.start';

	// options
	jQuery.extend(
		mep.player.config,
		{ 'contextMenuItems': [
			{
				render: function (player) {
					// check for fullscreen plugin
					if (player.enterFullScreen === undefined) { return null; }

					if (player.isFullScreen) {
						return player.options.i18n.fullscreen_off;
					}
					return player.options.i18n.fullscreen_on;
				},
				click: function (player) {
					if (player.isFullScreen)	{ player.exitFullScreen();  }
					else						{ player.enterFullScreen(); }
				}
			},

			{
				render: function (player) {
					if (player.media.muted) {
						return player.options.i18n.mute_off;
					}
					return player.options.i18n.mute_on;
				},
				click: function (player) {
					if (player.media.muted)	{ player.setMuted(false); }
					else					{ player.setMuted(true);  }
				}
			},

			{ isSeparator: true },

			{
				render: function (player) {
					return player.options.i18n.download_video;
				},
				click: function (player) {
					window.location.href = player.media.currentSrc;
				}
			}
		]}
	);

	jQuery.extend(
		mep.player.controls,
		{
			buildcontextmenu: function (ply_obj) {
				ply_obj.contextMenu = jQuery('<div class="mejs-contextmenu"></div>').appendTo(ply_obj.layers).hide();
				ply_obj.isContextMenuEnabled = true;
				ply_obj.contextMenuTimeout = null;

				ply_obj.container.bind(
					'contextmenu',
					function (e) {
						if (ply_obj.isContextMenuEnabled) {
							msos.do_nothing(e);
							ply_obj.renderContextMenu(e.clientX - 1, e.clientY - 1);
							return false;
						}
						return true;
					}
				);

				ply_obj.container.bind(
					'click',
					function (e) { ply_obj.contextMenu.hide(); }
				);

				ply_obj.contextMenu.bind(
					'mouseleave',
					function () { ply_obj.startContextMenuTimer(); }
				);

				ply_obj.startContextMenuTimer = function () {

					ply_obj.killContextMenuTimer();

					ply_obj.contextMenuTimer = setTimeout(
						function () {
							ply_obj.contextMenu.hide();
							ply_obj.killContextMenuTimer();
						},
						750
					);
				};

				ply_obj.killContextMenuTimer = function () {

					if (ply_obj.contextMenuTimer !== null) {
						clearTimeout(ply_obj.contextMenuTimer);
						ply_obj.contextMenuTimer = null;
					}
				};

				ply_obj.renderContextMenu = function (x, y) {
					var cfg = ply_obj.options,
						html = '',
						layer_pos = ply_obj.layers.offset(),
						layer_adj = ply_obj.layers.width() - 160,
						items = cfg.contextMenuItems,
						i = 0,
						il = items.length,
						rendered;

					msos.console.debug(temp_cts + ' - renderContextMenu -> called, x: ' + x + ', y: ' + y + ', adj: ' + layer_adj);

					for (i = 0; i < il; i += 1) {
						if (items[i].isSeparator) {
							html += '<div class="mejs-contextmenu-separator"></div>';
						} else {
							rendered = items[i].render(ply_obj);
							if (rendered !== null) {
								html += '<div class="mejs-contextmenu-item" data-itemindex="' + i + '" id="element-' + (Math.random() * 1000000) + '">' + rendered + '</div>';
							}
						}
					}

					// Get relative x, y
					x = x - layer_pos.left;
					y = y - layer_pos.top;

					ply_obj.contextMenu
						.empty()
						.append(jQuery(html))
						.css({
							top:  y,
							left: x - (x > layer_adj ? 149 : 0)
						})
						.show();

					ply_obj.contextMenu
						.find('.mejs-contextmenu-item')
						.each(
							function () {
								// which one is this?
								var $dom = jQuery(this),
									itemIndex = parseInt($dom.data('itemindex'), 10),
									item = cfg.contextMenuItems[itemIndex];

								// bind extra functionality?
								if (item.show !== undefined) { item.show($dom, ply_obj); }

								// bind click action
								$dom.click(
									function () {
										// perform click action
										if (item.click !== undefined) { item.click(ply_obj); }
										ply_obj.contextMenu.hide();
									}
								);
							}
						);

					setTimeout(
						function () { ply_obj.killControlsTimer('rev3'); },
						100
					);
				};
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.contextmenu.start);