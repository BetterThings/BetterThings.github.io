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

msos.provide("mep.tracks");

mep.tracks.version = new msos.set_version(14, 6, 15);


// Language selection text, ref. 'msos.config.i18n.select_trans_msos'

// Start by loading our tracks.css stylesheet
mep.tracks.css = new msos.loader();
mep.tracks.css.load('mep_tracks_css', msos.resource_url('mep', 'css/tracks.css'));

mep.tracks.SMPTEtoSec = function (SMPTE) {
	"use strict";

	if (typeof SMPTE !== 'string') {
		return false;
	}

	SMPTE = SMPTE.replace(',', '.');

	var secs = 0,
		decimalLen = (SMPTE.indexOf('.') !== -1) ? SMPTE.split('.')[1].length : 0,
		multiplier = 1,
		i = 0;

	SMPTE = SMPTE.split(':').reverse();

	for (i = 0; i < SMPTE.length; i += 1) {
		multiplier = 1;
		if (i > 0) {
			multiplier = Math.pow(60, i);
		}
		secs += Number(SMPTE[i]) * multiplier;
	}

	return Number(secs.toFixed(decimalLen));
};

/*
Parses WebVVT format which should be formatted as
================================
WEBVTT

1
00:00:01,1 --> 00:00:05,000
A line of text

2
00:01:15,1 --> 00:02:05,000
A second line of text

===============================

Adapted from: http://www.delphiki.com/html5/playr
*/
mep.tracks.format_parser = {

	webvvt: {
		// match start "chapter-" (or anythingelse)
		pattern_identifier: /^([a-zA-z]+-)?[0-9]+$/,
		pattern_timecode: /^([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --\> ([0-9]{2}:[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*)$/,

		parse: function (trackText) {
			"use strict";
			var i = 0,
				lines = mep.tracks.format_parser.split2(trackText, /\r?\n/),
				entries = { text: [], times: [] },
				timecode,
				text;

			for (i = 0; i < lines.length; i += 1) {
				// check for the line number
				if (this.pattern_identifier.exec(lines[i])) {
					// skip to the next line where the start --> end time code should be
					i += 1;
					timecode = this.pattern_timecode.exec(lines[i]);

					if (timecode && i < lines.length) {
						i += 1;
						// grab all the (possibly multi-line) text that follows
						text = lines[i];
						i += 1;

						while (lines[i] !== '' && i < lines.length) {
							text = text + '\n' + lines[i];
							i += 1;
						}

						text = jQuery.trim(text).replace(/(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");

						// Text is in a different array so I can use .join
						entries.text.push(text);
						entries.times.push(
							{
								start: (mep.tracks.SMPTEtoSec(timecode[1]) === 0) ? 0.200 : (mep.tracks.SMPTEtoSec(timecode[1])),
								stop: (mep.tracks.SMPTEtoSec(timecode[3])),
								settings: timecode[5]
							}
						);
					}
				}
			}
			return entries;
		}
	},

	// Thanks to Justin Capella: https://github.com/johndyer/mediaelement/pull/420
	dfxp: {
		parse: function (trackText) {
			"use strict";

			trackText = jQuery(trackText).filter("tt");

			var i = 0,
				container = trackText.children("div").eq(0),
				lines = container.find("p"),
				styleNode = trackText.find("#" + container.attr("style")),
				styles,
				style,
				_style,
				begin,
				end,
				text,
				entries = { text: [], times: [] },
				attributes,
				_temp_times = {};

			if (styleNode.length) {
				attributes = styleNode.removeAttr("id").get(0).attributes;
				if (attributes.length) {
					styles = {};
					for (i = 0; i < attributes.length; i += 1) {
						styles[attributes[i].name.split(":")[1]] = attributes[i].value;
					}
				}
			}

			for (i = 0; i < lines.length; i += 1) {
				style = '';
				_style = '';
				_temp_times = {
					start: null,
					stop: null,
					style: null
				};

				if (lines.eq(i).attr("begin")) {
					_temp_times.start = mep.tracks.SMPTEtoSec(lines.eq(i).attr("begin"));
				}
				if (!_temp_times.start && lines.eq(i - 1).attr("end")) {
					_temp_times.start = mep.tracks.SMPTEtoSec(lines.eq(i - 1).attr("end"));
				}
				if (lines.eq(i).attr("end")) {
					_temp_times.stop = mep.tracks.SMPTEtoSec(lines.eq(i).attr("end"));
				}
				if (!_temp_times.stop && lines.eq(i + 1).attr("begin")) {
					_temp_times.stop = mep.tracks.SMPTEtoSec(lines.eq(i + 1).attr("begin"));
				}

				if (styles) {
					for (_style in styles) {
						style += _style + ":" + styles[_style] + ";";
					}
				}

				if (style) {
					_temp_times.style = style;
				}
				if (_temp_times.start === 0) {
					_temp_times.start = 0.200;
				}

				entries.times.push(_temp_times);

				text = jQuery.trim(lines.eq(i).html()).replace(/(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig, "<a href='$1' target='_blank'>$1</a>");

				entries.text.push(text);
				if (entries.times.start === 0) {
					entries.times.start = 2;
				}
			}
			return entries;
		}
	},

	split2: function (text, regex) {
		"use strict";
		return text.split(regex);
	}
};

mep.tracks.start = function () {
    "use strict";

    // add extra default options 
    jQuery.extend(
		mep.player.config, {
			startLanguage: msos.config.locale
		}
	);

    jQuery.extend(

    mep.player.controls, {

        hasChapters: false,

        buildtracks: function (ply_obj) {

            var i;

			ply_obj.tracks = [];
            ply_obj.trackToLoad = -1;
            ply_obj.selectedTrack = null;
            ply_obj.isLoadingTrack = false;

			ply_obj.findTracks = function () {

				var tracktags = ply_obj.$node.find('track');

				tracktags.each(
					function (index, track) {
						track = jQuery(track);

						ply_obj.tracks.push({
							srclang:	track.attr('srclang').toLowerCase(),
							src:		track.attr('src'),
							kind:		track.attr('kind'),
							label:		track.attr('label') || '',
							entries:	[],
							isLoaded:	false
						});
					}
				);
			};

			ply_obj.findTracks();

			// No tracks, so quit
            if (ply_obj.tracks.length === 0) { return; }

			// Define our html, since there are some tracks
			ply_obj.chapters = jQuery('<div class="mejs-chapters"></div>');
			ply_obj.captionsText = jQuery('<span class="mejs-captions-text"></span>');
			ply_obj.captionsPos = jQuery('<div class="mejs-captions-position"></div>');
			ply_obj.captions = jQuery('<div class="mejs-captions-layer"></div>');
			ply_obj.captionsSelect = jQuery(
				'<div class="mejs-captions-selector">' +
					'<ul>' +
						'<li>' +
							'<input type="radio" name="' + ply_obj.id + '_captions" id="' + ply_obj.id + '_captions_none" value="none" checked="checked" />' +
							'<label for="' + ply_obj.id + '_captions_none">' + ply_obj.options.i18n.tracks_none + '</label>' +
						'</li>' +
					'</ul>' +
				'</div>');
			ply_obj.captionsButton = jQuery(
				'<div class="mejs-button mejs-captions-button">' +
					'<button type="button" aria-controls="' + ply_obj.id + '" title="' + ply_obj.options.i18n.tracks_text + '"></button>' +
				'</div>');

			ply_obj.adjustLanguageBox = function () {
				// adjust the size of the outer box
				ply_obj.captionsSelect.height(
					ply_obj.captionsSelect.find('ul').outerHeight(true) + ply_obj.captionsButton.find('.mejs-captions-translations').outerHeight(true)
				);
			};

			ply_obj.addTrackButton = function (lang, label) {

				if (label === '') { label = msos.config.i18n.select_trans_msos[lang] || lang; }

				ply_obj.captionsSelect.find('ul').append(
					jQuery(
						'<li>' +
							'<input type="radio" name="' + ply_obj.id + '_captions" id="' + ply_obj.id + '_captions_' + lang + '" value="' + lang + '" disabled="disabled" />' +
							'<label for="' + ply_obj.id + '_captions_' + lang + '">' + label + '</label>' +
						'</li>'
					)
				);

				ply_obj.adjustLanguageBox();

				// remove this from the dropdownlist (if it exists)
				ply_obj.container.find('.mejs-captions-translations option[value=' + lang + ']').remove();
			};

			ply_obj.enableTrackButton = function (lang, label) {

				if (label === '') {
					label = msos.config.i18n.select_trans_msos[lang] || lang;
				}

				ply_obj.captionsSelect.find('input[value=' + lang + ']').prop('disabled', false).siblings('label').html(label);

				// auto select
				if (ply_obj.options.startLanguage === lang) {
					jQuery('#' + ply_obj.id + '_captions_' + lang).click();
				}

				ply_obj.adjustLanguageBox();
			};

			ply_obj.loadTrack = function (index) {
				var track = ply_obj.tracks[index],
					after = function () {
						track.isLoaded = true;
						ply_obj.enableTrackButton(track.srclang, track.label);
						ply_obj.loadNextTrack();
					};

				jQuery.ajax({
					url: track.src,
					dataType: "text",
					success: function (d) {

						// parse the loaded file
						if (typeof d === "string" && (/<tt\s+xml/ig).exec(d)) {
							track.entries = mep.tracks.format_parser.dfxp.parse(d);					
						} else {
							track.entries = mep.tracks.format_parser.webvvt.parse(d);
						}

						after();

						if (track.kind === 'chapters') {
							ply_obj.media.addEventListener(
								'play',
								function (e) {
									if (ply_obj.media.duration > 0) {
										ply_obj.displayChapters(track);
									}
								},
								false
							);
						}
					},
					error: function () {
						ply_obj.loadNextTrack();
					}
				});
			};

			ply_obj.loadNextTrack = function () {

				ply_obj.trackToLoad += 1;
				if (ply_obj.trackToLoad < ply_obj.tracks.length) {
					ply_obj.isLoadingTrack = true;
					ply_obj.loadTrack(ply_obj.trackToLoad);
				} else {
					// add done?
					ply_obj.isLoadingTrack = false;
				}
			};

			ply_obj.displayCaptions = function () {

				var i, track = ply_obj.selectedTrack;

				if (track !== null && track.isLoaded) {
					for (i = 0; i < track.entries.times.length; i += 1) {
						if (ply_obj.media.currentTime >= track.entries.times[i].start
						 && ply_obj.media.currentTime <= track.entries.times[i].stop) {
							ply_obj.captionsText.html(track.entries.text[i]);
							ply_obj.captions.show().height(0);
							return; // exit out if one is visible;
						}
					}
					ply_obj.captions.hide();
				} else {
					ply_obj.captions.hide();
				}
			};

			ply_obj.drawChapters = function (chapters) {
				var i, dur, percent = 0,
					usedPercent = 0;

				ply_obj.chapters.empty();

				for (i = 0; i < chapters.entries.times.length; i += 1) {
					dur = chapters.entries.times[i].stop - chapters.entries.times[i].start;
					percent = Math.floor(dur / ply_obj.media.duration * 100);
					if (percent + usedPercent > 100 || // too large
					(i === chapters.entries.times.length - 1 && percent + usedPercent < 100)) {
						percent = 100 - usedPercent;
					}

					ply_obj.chapters.append(
						jQuery('<div class="mejs-chapter" rel="' + chapters.entries.times[i].start + '" style="left: ' + usedPercent.toString() + '%;width: ' + percent.toString() + '%;">' + '<div class="mejs-chapter-block' + ((i === chapters.entries.times.length - 1) ? ' mejs-chapter-block-last' : '') + '">' + '<span class="ch-title">' + chapters.entries.text[i] + '</span>' + '<span class="ch-time">' + mep.player.utils.secondsToTimeCode(chapters.entries.times[i].start) + '&ndash;' + mep.player.utils.secondsToTimeCode(chapters.entries.times[i].stop) + '</span>' + '</div>' + '</div>')
					);
					usedPercent += percent;
				}

				ply_obj.chapters.find('div.mejs-chapter').click(
					function (e) {
						msos.do_nothing(e);
						ply_obj.media.setCurrentTime(parseFloat(jQuery(this).attr('rel')));
						if (ply_obj.media.paused) {
							ply_obj.media.play();
						}
					});

				ply_obj.chapters.show();
			};

			ply_obj.displayChapters = function () {
				var i;

				for (i = 0; i < ply_obj.tracks.length; i += 1) {
					if (ply_obj.tracks[i].kind === 'chapters' && ply_obj.tracks[i].isLoaded) {
						ply_obj.drawChapters(ply_obj.tracks[i]);
						ply_obj.hasChapters = true;
						break;
					}
				}
			};

			// Apply our html to the mep player object
            ply_obj.chapters.prependTo(ply_obj.layers).hide();

			ply_obj.captionsPos.append(ply_obj.captionsText);

			ply_obj.captions.append(ply_obj.captionsPos);
            ply_obj.captions.prependTo(ply_obj.layers).hide();

			ply_obj.captionsButton.append(ply_obj.captionsSelect);
            ply_obj.captionsButton
				.appendTo(ply_obj.controls)
				.hover(
					function () {
						ply_obj.captionsSelect.css('visibility', 'visible');
					},
					function () {
						ply_obj.captionsSelect.css('visibility', 'hidden');
					})
				.delegate(
					'input[type=radio]',
					'click',
					function (e) {
						var lang = this.value;

						if (lang === 'none') {
							ply_obj.selectedTrack = null;
						} else {
							for (i = 0; i < ply_obj.tracks.length; i += 1) {
								if (ply_obj.tracks[i].srclang === lang) {
									ply_obj.selectedTrack = ply_obj.tracks[i];
									ply_obj.captions.attr('lang', ply_obj.selectedTrack.srclang);
									ply_obj.displayCaptions();
									break;
								}
							}
						}
					}
				);

            if (!ply_obj.options.alwaysShowControls) {
                // move with controls
                ply_obj.container
					.bind(
						'controlsshown',
						function () {
							// push captions above controls
							ply_obj.captionsPos.addClass('mejs-captions-position-hover');
						}
					).bind(
						'controlshidden',
						function () {
							if (!ply_obj.media.paused) {
								// move back to normal place
								ply_obj.captionsPos.removeClass('mejs-captions-position-hover');
							}
						}
					);
            } else {
                ply_obj.captionsPos.addClass('mejs-captions-position-hover');
            }

            // add to list
            for (i = 0; i < ply_obj.tracks.length; i += 1) {
                if (ply_obj.tracks[i].kind === 'subtitles') {
                    ply_obj.addTrackButton(
						ply_obj.tracks[i].srclang,
						ply_obj.tracks[i].label
					);
                }
            }

            ply_obj.loadNextTrack();

            ply_obj.media.addEventListener(
				'timeupdate',
				function (e) {
					ply_obj.displayCaptions();
				},
				false
			);

            ply_obj.media.addEventListener(
				'loadedmetadata',
				function (e) {
					ply_obj.displayChapters();
				},
				false
			);

            ply_obj.container.hover(

				function () {
					// chapters
					if (ply_obj.hasChapters) {
						ply_obj.chapters.css('visibility', 'visible');
						ply_obj.chapters.fadeIn(200)
							.height(ply_obj.chapters.find('.mejs-chapter').outerHeight());
					}
				},
				function () {
					if (ply_obj.hasChapters && !ply_obj.media.paused) {
						ply_obj.chapters.fadeOut(
							200,
							function () {
								jQuery(this).css('visibility', 'hidden');
								jQuery(this).css('display', 'block');
							}
						);
					}
				}
			);

            // check for autoplay (why?)
            if (ply_obj.node.getAttribute('autoplay') !== null) {
                ply_obj.chapters.css('visibility', 'hidden');
            }
        }
    });
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.tracks.start);