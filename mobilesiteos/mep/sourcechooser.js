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

msos.provide("mep.sourcechooser");

mep.sourcechooser.version = new msos.set_version(14, 6, 15);


// Start by loading our progress.css stylesheet
mep.sourcechooser.css = new msos.loader();
mep.sourcechooser.css.load('mep_sourcechooser_css', msos.resource_url('mep', 'css/sourcechooser.css'));

mep.sourcechooser.start = function () {
	"use strict";

    jQuery.extend(

    mep.player.controls, {

		buildsourcechooser: function (ply_obj) {

			var currentTime,
				src,
				inp = '';

			ply_obj.sourcechooserSelect =
				jQuery('<div class="mejs-sourcechooser-selector"><ul></ul></div>');
			ply_obj.sourcechooserButton =
				jQuery('<div class="mejs-button mejs-sourcechooser-button">'+
							'<button type="button" aria-controls="' + ply_obj.id + '" title="' + ply_obj.options.i18n.sourcechooser_text + '"></button>'+
						'</div>');

			ply_obj.sourcechooserSelect.appendTo(ply_obj.sourcechooserButton);
			ply_obj.sourcechooserButton.appendTo(ply_obj.controls);

			ply_obj.sourcechooserButton.hover(
					function () {
						ply_obj.sourcechooserSelect.css('visibility', 'visible');
					},
					function () {
						ply_obj.sourcechooserSelect.css('visibility', 'hidden');
					}
				);

				ply_obj.sourcechooserButton.delegate(
					'input[type=radio]',
					'click',
					function (e) {
						var new_src = this.value,
							paused;

						msos.do_nothing(e);

						if (ply_obj.media.currentSrc !== new_src) {
							currentTime = ply_obj.media.currentTime;
							paused = ply_obj.media.paused;
							ply_obj.media.setSrc(new_src);
							ply_obj.media.load();
							ply_obj.media.addEventListener(
								'loadedmetadata',
								function (e) {
									this.currentTime = currentTime;
								},
								true
							);
							ply_obj.media.addEventListener(
								'canplay',
								function (e) {
									if (!paused) { this.play(); }
								},
								true
							);
						}
					}
				);

			ply_obj.addSourceButton = function (src, label, type, isCurrent) {

				if (label === '' || label === undefined) { label = src; }

				type = type.split('/')[1];

				ply_obj.sourcechooserSelect.find('ul')
					.append(
						jQuery(
							'<li>'+
								'<input type="radio" name="' + ply_obj.id + '_sourcechooser" id="' + ply_obj.id + '_sourcechooser_' + type + '" value="' + src + '" ' + (isCurrent ? 'checked="checked"' : '') + ' />'+
								'<label for="' + ply_obj.id + '_sourcechooser_' + type + '">' + label + ' (' + type + ')</label>'+
							'</li>'
						)
					);

					ply_obj.sourcechooserSelect.height(ply_obj.sourcechooserSelect.find('ul').outerHeight(true));
			};

			// add to list
			for (inp in ply_obj.media.children) {
				src = ply_obj.media.children[inp];
				if (src.nodeName === 'SOURCE'
				&& (ply_obj.media.canPlayType(src.type) === 'probably' || ply_obj.media.canPlayType(src.type) === 'maybe')) {
					ply_obj.addSourceButton(
						src.src,
						src.title,
						src.type,
						(ply_obj.media.src === src.src ? true : false)
					);
				}
			}
		}
	});

};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.sourcechooser.start);