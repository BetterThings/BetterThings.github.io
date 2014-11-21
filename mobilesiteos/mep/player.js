// Copyright Notice:
//					player.js
//			Copyright©2012-2014 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
//
// Loosely based on MediaElementPlayer by John Dyer (http://j.hn)

/*global
    msos: false,
    jQuery: false,
    jquery: false,
    Modernizr: false,
    _: false
*/

// Modified for use thru MobileSiteOS
msos.provide("mep.player");
msos.require("msos.i18n.player");
msos.require("msos.common");
msos.require("msos.fitmedia");


// Start by loading our mep/player.css stylesheet
mep.player.css = new msos.loader();
mep.player.css.load('mep_css_player', msos.resource_url('mep', 'css/player.css'));

// Only load css3 if supported
if (Modernizr.cssgradients) {
	mep.player.css.load('mep_css_gradient',	msos.resource_url('mep', 'css/gradient.css'));
}

msos.console.debug('mep.player -> loading start.');

// Namespace
mep.player = {

	version: new msos.set_version(14, 6, 13),
	org_version: '2.10.3',		// from original version by John Dyer
	meIndex: 0,
	mepIndex: 0,
	players: [],
	config: {},
	support: {},
	options: {},
	plugins: {},
	features: [],
	specific: [],
	controls: {},

	html5_interface: {

		name: 'mep.player.html5_interface',
		pluginType: 'native',
		isFullScreen: false,

		setCurrentTime: function (time) {
			"use strict";
			this.currentTime = time;
		},
		setMuted: function (muted) {
			"use strict";
			this.muted = muted;
		},
		setVolume: function (volume) {
			"use strict";
			this.volume = volume;
		},
		// for parity with the plugin versions
		stop: function () {
			"use strict";
			this.pause();
		},

		// This can be a url string
		// or an array [{ src:'file.mp4', type:'video/mp4' }, { src:'file.webm', type:'video/webm' }]
		setSrc: function (url) {
			"use strict";

			msos.console.debug(this.name + ' - setSrc -> called, url: ', url);

			// Fix for IE9 which can't set .src when there are <source> elements. Awesome, right?
			var existingSources = this.getElementsByTagName('source'),
				i,
				media;

			while (existingSources.length > 0) {
				this.removeChild(existingSources[0]);
			}

			if (typeof url === 'string') {
				this.src = url;
			} else {
				for (i = 0; i < url.length; i += 1) {
					media = url[i];
					if (this.canPlayType(media.type)) {
						this.src = media.src;
						break;
					}
				}
			}
		},

		setVideoSize: function (width, height) {
			"use strict";

			this.width  = width;
			this.height = height;
		}
	},

	base: {

		name: 'mep.player.base',
		hasFocus: false,
		controlsAreVisible: true,
		error: 'unknown',

		init: function () {
			"use strict";

			var ply_obj = this,
				// options for MediaElement (shim)
				meOptions = jQuery.extend(
					true,
					{},
					ply_obj.options,
					{
						success_function: function () {
							mep.player.controls(ply_obj);

							if (typeof ply_obj.options.success_function === 'function') {
								ply_obj.options.success_function(ply_obj);
							}
						},
						error_function: function () {
							ply_obj.controls.hide();

							// Tell user that the file cannot be played
							if (typeof ply_obj.options.error_function === 'function') {
								ply_obj.options.error_function(ply_obj);
							}
						}
					}
				),
				tagName = ply_obj.node.tagName.toLowerCase(),
				cloned;

			msos.console.debug(ply_obj.name + ' - init -> start, tag: ' + tagName);

			ply_obj.isVideo = (tagName !== 'audio');
			ply_obj.tagName = tagName;

			// Remove native controls
			ply_obj.$node.removeAttr('controls');

			// unique ID
			ply_obj.id = 'mep_' + (mep.player.mepIndex += 1);

			// 'container' is now the FidVids node
			// (see mep.player.build)
			ply_obj.container = ply_obj.$node.parent();

			// Add defining class, id
			ply_obj.container
				.attr('id', ply_obj.id)
				.addClass('mejs-container notranslate');

			// Build out our container w/controls, etc.
			ply_obj.layers			= jQuery('<div class="mejs-layers">');
			ply_obj.controls		= jQuery('<div class="mejs-controls">');

			// Isolate the controls div from other layers
			ply_obj.controls.bind(
				'click',
				msos.do_nothing
			);

			// Place it in DOM
			ply_obj.container.append(
				ply_obj.layers,
				ply_obj.controls
			);

			// Add classes for user and content
			ply_obj.container.addClass((ply_obj.isVideo ? 'mejs-video ' : 'mejs-audio '));

			// Clone original node
			cloned = ply_obj.$node.clone();

			// Place our cloned node in correct position
			ply_obj.container.prepend(cloned);

			// Remove the original node
			ply_obj.$node.remove();

			// Reset our html5 video/audio node
			ply_obj.$node	= cloned;
			ply_obj.node	= cloned[0];

			mep.player.run(ply_obj, meOptions);

			// controls are shown when loaded
			ply_obj.container.trigger('controlsshown');

			msos.console.debug(ply_obj.name + ' - init -> done!');
		},

		showControls: function (doAnimation) {
			"use strict";

			var t = this,
				scl = ' - showControls -> ';

			doAnimation = doAnimation === undefined || doAnimation;

			if (t.controlsAreVisible) {
				if (msos.config.verbose) {
					msos.console.debug(t.name + scl + 'already visible.');
				}
				return;
			}

			msos.console.debug(t.name + scl + 'start.');

			if (doAnimation) {
				t.controls
					.css('visibility', 'visible')
					.stop(true, true).fadeIn(200, function () {
					      t.controlsAreVisible = true;
					      t.container.trigger('controlsshown');
					});

				// any additional controls people might add and want to hide
				t.container.find('.mejs-control')
					.css('visibility', 'visible')
					.stop(true, true).fadeIn(200, function () { t.controlsAreVisible = true; });

			} else {
				t.controls
					.css('visibility', 'visible')
					.css('display', 'block');

				// any additional controls people might add and want to hide
				t.container.find('.mejs-control')
					.css('visibility', 'visible')
					.css('display', 'block');

				t.controlsAreVisible = true;
				t.container.trigger('controlsshown');
			}

			msos.console.debug(t.name + scl + 'done!');
		},

		hideControls: function (doAnimation) {
			"use strict";

			var t = this,
				hcl = ' - hideControls -> ';

			msos.console.debug(t.name + hcl + 'start.');

			doAnimation = doAnimation === undefined || doAnimation;

			if (!t.controlsAreVisible) { return; }

			if (doAnimation) {
				if (msos.config.verbose) {
					msos.console.debug(t.name + hcl + 'use animation!');
				}
				// fade out main controls
				t.controls.stop(true, true).fadeOut(200, function () {
					jQuery(this)
						.css('visibility', 'hidden')
						.css('display', 'block');

					t.controlsAreVisible = false;
					t.container.trigger('controlshidden');
				});

			} else {
				// hide main controls
				t.controls
					.css('visibility', 'hidden')
					.css('display', 'block');

				t.controlsAreVisible = false;
				t.container.trigger('controlshidden');
			}
			msos.console.debug(t.name + hcl + 'done!');
		},

		controlsTimer: null,

		startControlsTimer: function (timeout) {
			"use strict";

			var t = this;

			timeout = timeout !== undefined ? timeout : 1500;

			t.killControlsTimer('start');

			t.controlsTimer = setTimeout(
				function () {
					if (msos.config.verbose) {
						msos.console.debug(t.name + ' - startControlsTimer -> fired');
					}
					t.hideControls();
					t.killControlsTimer('hide');
				},
				timeout
			);
		},

		killControlsTimer: function () {
			"use strict";

			var t = this;

			if (t.controlsTimer !== null) {
				clearTimeout(t.controlsTimer);
				delete t.controlsTimer;
				t.controlsTimer = null;
			}
		},

		controlsEnabled: true,

		disableControls: function () {
			"use strict";
			var t = this;

			t.killControlsTimer();
			t.hideControls(false);
			this.controlsEnabled = false;
		},

		enableControls: function () {
			"use strict";
			var t = this;

			t.showControls(false);
			t.controlsEnabled = true;
		},

		setControlsSize: function () {
			"use strict";

			var scs = ' - setControlsSize -> ',
				t = this,
				used_width = 0,
				rail_width = 0,
				others = t.rail.siblings(),
				lastControl = others.last(),
				lastControlPosition = null;

			msos.console.debug(t.name + scs + 'start.');

			others = t.rail.siblings();

			// Attempt to autosize
			if (rail_width === 0 || !rail_width) {
				// find the size of all the other controls besides the rail
				others.each(
					function () {
						if (jQuery(this).css('position') !== 'absolute') {
							used_width += jQuery(this).outerWidth(true);
						}
					}
				);

				// fit the rail into the remaining space
				// (-5 is fudge factor for FF. It couldn't calc absolute pos. left: 1%, width: 98% correctly)
				rail_width = t.controls.width() - used_width - (t.rail.outerWidth(true) - t.rail.width()) - 5;

				msos.console.debug(t.name + scs + 'auto-size, rail width: ' + rail_width);
			}

			// Resize the rail (added 6/9/14)
			do {			
				// outer area
				t.rail.width(rail_width);
				// dark space
				t.total.width(rail_width - (t.total.outerWidth(true) - t.total.width()));				

				if (lastControl.css('position') !== 'absolute') {
					lastControlPosition = lastControl.position();				
					rail_width--;			
				}
			} while (lastControlPosition !== null
				  && lastControlPosition.top > 0
				  && rail_width > 0);

			if (t.setProgressRail) { t.setProgressRail(); }
			if (t.setCurrentRail)  { t.setCurrentRail();  }

			msos.console.debug(t.name + scs + 'done!');
		},

		changeSkin: function (className) {
			"use strict";
			this.container[0].className = 'mejs-container ' + className;
			this.setControlsSize();
		},
		play: function () {
			"use strict";
			msos.console.debug(this.name + ' - play -> fired.');
			this.load();	// added 6/9/14
			this.media.play();
		},
		pause: function () {
			"use strict";
			msos.console.debug(this.name + ' - pause -> fired.');
			try {
				this.media.pause();
			} catch (e) {
				msos.console.warn(this.name + ' - pause -> failed:' + e.message);
			}	// added 6/9/14
		},
		load: function () {
			"use strict";
			if (!this.isLoaded) { this.media.load(); }
			this.isLoaded = true;		// added 6/9/14
		},
		isLoaded: false,		// added 6/9/14
		setMuted: function (muted) {
			"use strict";
			this.media.setMuted(muted);
		},
		setCurrentTime: function (time) {
			"use strict";
			this.media.setCurrentTime(time);
		},
		getCurrentTime: function () {
			"use strict";
			return this.media.currentTime;
		},
		setVolume: function (volume) {
			"use strict";
			this.media.setVolume(volume);
		},
		getVolume: function () {
			"use strict";
			return this.media.volume;
		},
		setSrc: function (src) {
			"use strict";
			this.media.setSrc(src);
		},
		remove: function () {
			"use strict";
			var t = this;

			if (t.media.pluginType === 'flash') {
				t.media.remove();
			} else if (t.media.pluginTyp === 'native') {
				t.media.prop('controls', true);
			  }
		}
	}
};

mep.player.run = function (ply_obj, opts) {
	"use strict";

	var temp_pr = 'mep.player.run -> ',
		playback,
		on_youtube_load,
		on_plugins_load;

	msos.console.debug(temp_pr + 'start.');

	// Test for HTML5 and plugin capabilities
	playback = mep.player.determinePlayback(
		ply_obj,
		opts
	);

	if (playback.method === 'youtube') {

		on_youtube_load = function () {
			mep.player.create(ply_obj, playback, opts);
		};

		msos.console.debug(temp_pr + 'loading youtube code!');
		msos.require("mep.youtube", on_youtube_load);

	} else if (playback.method !== 'waiting') {

		// Ready, so create the shim element
		mep.player.create(ply_obj, playback, opts);

	} else {

		// Re-run this function when 'mep.plugins' is loaded
		on_plugins_load = function () {
			mep.player.run(ply_obj, opts);
		};

		msos.require("mep.plugins", on_plugins_load);
	  }

	msos.console.debug(temp_pr + 'done!');
};

mep.player.determinePlayback = function (ply_obj, options) {
	"use strict";

	var html5_elm = ply_obj.node,
		temp_pb = 'mep.player.determinePlayback -> ',
		mediaFiles = [],
		i, j, k, l, n,
		type,
		result = {
			method: '',
			url: '',
			htmlMediaElement: html5_elm,
			isVideo: ply_obj.isVideo
		},
		pluginName,
		pluginTypes,
		pluginInfo,
		src = ply_obj.node.getAttribute('src') || '',
		db_note = 'na',
		media;

	if (msos.config.verbose) {
		msos.console.debug(temp_pb + 'start, options: ', options);
	} else {
		msos.console.debug(temp_pb + 'start.');
	}

	src = msos.var_is_empty(src) ? null : src;

	if (src !== null) {
		type = mep.player.utils.formatType(src, html5_elm.getAttribute('type'));
		mediaFiles.push({ 'type': type, 'url': src });
		db_note = 'src';

	// then test for <source> elements
	} else {
		// test <source> types to see if they are usable
		for (i = 0; i < html5_elm.childNodes.length; i += 1) {
			n = html5_elm.childNodes[i];
			if (n.nodeType === 1 && n.tagName.toLowerCase() === 'source') {
				src = n.getAttribute('src');
				type = mep.player.utils.formatType(src, n.getAttribute('type'));
				media = n.getAttribute('media');

				if (!media || !window.matchMedia || (window.matchMedia && window.matchMedia(media).matches)) {
					mediaFiles.push({ 'type': type, 'url': src });
				}

				db_note = 'source';
			}
		}
	}

	if (msos.config.verbose) {
		msos.console.debug(temp_pb + 'by: ' + db_note + ', mediaFiles: ', mediaFiles);
	}

	// test for native HTML5 playback first
	if (mep.player.support.html5_media && (options.mode === 'auto' || options.mode === 'native')) {

		db_note = 'native playback, mode: ' + options.mode;

		// Go thru media types and see what
		for (i = 0; i < mediaFiles.length; i += 1) {
			// normal check, then special case for Mac/Safari 5.0.3 which answers '' to canPlayType('audio/mp3') but 'maybe' to canPlayType('audio/mpeg')
			if (html5_elm.canPlayType(mediaFiles[i].type).replace(/no/, '') !== ''
			 || html5_elm.canPlayType(mediaFiles[i].type.replace(/mp3/, 'mpeg')).replace(/no/, '') !== '') {
				result.method = 'native';
				result.url = mediaFiles[i].url;
				break;
			}
		}

		if (result.method === 'native') {
			if (result.url !== null) {
				html5_elm.src = result.url;
			}

			msos.console.debug(temp_pb + 'done, ' + db_note + ', result: ', result);
			return result;
		}
	}

	// 'mep.plugins' module called in 'msos.video' or 'msos.audio' when obvious, or in 'run' above as a last resort
	if (mep && mep.plugins) {

		// if native playback didn't work, then test plugins
		if (options.mode === 'auto'
		 || options.mode === 'shim') {

			db_note = 'plugin playback, mode: ' + options.mode;

			for (i = 0; i < mediaFiles.length; i += 1) {
				type = mediaFiles[i].type;

				// test all plugins
				for (j = 0; j < options.plugins.length; j += 1) {

					pluginName = options.plugins[j];
					// test version of plugin (for future features)
					pluginTypes = options.plugin_capabilities[pluginName];

					for (k = 0; k < pluginTypes.length; k += 1) {
						pluginInfo = pluginTypes[k];
						// test if user has the correct plugin version
						// for youtube/vimeo
						if (pluginInfo.version === null
						 || mep.plugins.hasPluginVersion(pluginName, pluginInfo.version)) {

							// test for plugin playback types
							for (l = 0; l < pluginInfo.types.length; l += 1) {
								// find plugin that can play the type
								if (type === pluginInfo.types[l]) {
									result.method = pluginName;
									result.url = mediaFiles[i].url;
									msos.console.debug(temp_pb + 'done, ' + db_note + ', result: ', result);
									return result;
								}
							}
						}
					}
				}
			}
		}

		if (result.method === 'native') {

			msos.console.debug(temp_pb + 'done, ' + db_note + ', result: ', result);
			return result;
		}

		// what if there's nothing to play? just grab the first available
		if (result.method === '' && mediaFiles.length > 0) {
			result.url = mediaFiles[0].url;
		}

		db_note = 'hail mary, mode: ' + options.mode;
		msos.console.debug(temp_pb + 'done, ' + db_note + ', result: ', result);
		return result;

	}

	// We aren't ready
	msos.console.debug(temp_pb + 'waiting to load mep.plugins!');
	return { method: 'waiting' };
};

mep.player.create = function (ply_obj, pb, opts) {
	"use strict";

	var temp_pc = 'mep.player.create',
		html5_elm = ply_obj.node,
		poster =	html5_elm.getAttribute('poster'),
		autoplay =	html5_elm.getAttribute('autoplay'),
		preload =	html5_elm.getAttribute('preload'),
		controls =	html5_elm.getAttribute('controls'),
		m;

	msos.console.debug(temp_pc + ' -> start.');

	// clean up attributes	
	poster =	  msos.var_is_null(poster) ? '' : poster;
	preload =	 (msos.var_is_null(preload)  || preload  === 'false') ? 'none' : preload;

	autoplay =	!(msos.var_is_null(autoplay) || autoplay === 'false');
	controls =	!(msos.var_is_null(controls) || controls === 'false');

	pb.url = (pb.url !== null) ? msos.common.absolute_url(pb.url) : '';

	if (pb.method === 'native') {

		// Add methods to video object to bring it into parity with Flash Object
		for (m in mep.player.html5_interface) {
			html5_elm[m] = mep.player.html5_interface[m];
		}

		// Set our media interface (it is the video/audio node for HTML5)
		ply_obj.media = html5_elm;

		// fire success code
		opts.success_function();

	} else if (pb.method !== '' && mep.plugins) {

		// create plugin to mimic HTMLMediaElement
		mep.plugins.create(ply_obj, pb, opts, poster, autoplay, preload, controls);

	} else {
		msos.console.warn(temp_pc + ' -> failed!');
		mep.player.createErrorMessage(ply_obj, pb, opts, poster);
	  }

	msos.console.debug(temp_pc + ' -> done, playback: ' + pb.method);
};

mep.player.createErrorMessage = function (ply_obj, playback, me_opts, poster) {
	"use strict";

	var dl_txt = ply_obj.options.i18n.click_to_download,
		inner_tag = (poster !== '')
			? '<a href="' + playback.url + '"><img src="' + poster + '" title="' + dl_txt + '" alt="' + dl_txt + '" /></a>'
			: '<a href="' + playback.url + '"><span>' + dl_txt + '</span></a>',
		errorContainer = jQuery('<div class="me-cannotplay">' + inner_tag + '</div>');

	ply_obj.container.prepend(errorContainer);
	ply_obj.$node.css('display', 'none');

	me_opts.error_function();
};

// Sets up all controls and events
mep.player.controls = function (ply_obj) {
	"use strict";

	var temp_pc = 'mep.player.controls',
		feat = mep.player.features,
		$media = jQuery(ply_obj.media),
		i,
		func_name,
		func_build;

	// make sure it can't create itself again if a plugin reloads
	if (ply_obj.created) {
		msos.console.warn(temp_pc + ' -> plugin already created!');
		return;
	}

	msos.console.debug(temp_pc + ' -> start, features: ', feat);

	ply_obj.created = true;

	// add user-defined features/controls
	for (i = 0; i < feat.length; i += 1) {
		func_name = 'build' + feat[i];
		func_build = mep.player.controls[func_name] || null;
		if (func_build && typeof func_build === 'function') {
			func_build(ply_obj);
			msos.console.debug(temp_pc + ' -> executed: ' + func_name);
		} else {
			msos.console.warn(temp_pc + ' -> missing module: ' + 'mep.' + feat[i]);
		}
	}

	ply_obj.setControlsSize();

	// controls fade
	if (ply_obj.isVideo) {

		if (msos.config.browser.touch) {

			// for touch devices (iOS, Android)
			// show/hide without animation on touch

			$media.bind(
				'touchstart',
				function () {
					// toggle controls
					if (ply_obj.controlsAreVisible) {
						ply_obj.hideControls(false);
					} else {
						if (ply_obj.controlsEnabled) {
							ply_obj.showControls(false);
						}
					  }
				}
			);

		} else {

			// click controls
			var on_mouseover = function () {
					if (ply_obj.controlsEnabled) {
						if (!ply_obj.options.alwaysShowControls) {							
							ply_obj.killControlsTimer('enter');
							ply_obj.showControls();
							ply_obj.startControlsTimer(2500);
						}
					}
				},
				on_mousemove = function () {
					if (ply_obj.controlsEnabled) {
						if (!ply_obj.controlsAreVisible) {
							ply_obj.showControls();
						}
						if (!ply_obj.options.alwaysShowControls) {
							ply_obj.startControlsTimer(2500);
						}
					}
				};

			// click to play/pause
			$media.click(
				function (e) {
					msos.do_nothing(e);
					msos.console.debug(temp_pc + ' - click -> play/pause fired.');
					if (ply_obj.options.clickToPlayPause) {
						if (ply_obj.media.paused) {
							ply_obj.media.play();
						} else {
							ply_obj.media.pause();
						  }
					}
				}
			);

			// show/hide controls
			ply_obj.container
				.bind(
					'mouseenter mouseover',
					_.throttle(on_mouseover, 500)
				)
				.bind(
					'mousemove',
					_.throttle(on_mousemove, 500)
				)
				.bind(
					'mouseleave',
					function () {
						if (ply_obj.controlsEnabled) {
							if (!ply_obj.node.paused && !ply_obj.options.alwaysShowControls) {
								ply_obj.startControlsTimer(1000);
							}
						}
					}
				);
		}
	}

	// EVENTS

	// FOCUS: when a video starts playing, it takes focus from other players (possibily pausing them)
	ply_obj.media.addEventListener(
		'play',
		function () {
			var i = 0,
				il = mep.player.players.length,
				p;

			if (msos.config.verbose) {
				msos.console.debug(temp_pc + ' -> play triggered, players: ' + il);
			}

			// go through all other players
			for (i = 0; i < il; i += 1) {
				p = mep.player.players[i];
				if (p.id !== ply_obj.id
				 && ply_obj.options.pauseOtherPlayers
				 && !p.paused
				 && !p.ended) {
					p.pause();
				}
				p.hasFocus = false;
			}
			ply_obj.hasFocus = true;
		},
		false
	);

	// Ended for all
	ply_obj.media.addEventListener(
		'ended',
		function () {

			if (msos.config.verbose) {
				msos.console.debug(temp_pc + ' -> ended triggered!');
			}

			if(ply_obj.options.autoRewind) {
				try {
					ply_obj.media.setCurrentTime(0);
				} catch (e) {
					msos.console.warn(temp_pc + ' -> setCurrentTime error: ' + e);
				  }
			}

			ply_obj.media.pause();

			if (ply_obj.setProgressRail) { ply_obj.setProgressRail(); }
			if (ply_obj.setCurrentRail)  { ply_obj.setCurrentRail();  }

			if (ply_obj.options.loop) {
				ply_obj.media.play();
			} else if (!ply_obj.options.alwaysShowControls && ply_obj.controlsEnabled) {
				ply_obj.showControls();
			  }
		},
		false
	);

	// resize on the first play
	ply_obj.media.addEventListener(
		'loadedmetadata',
		function () {
			if (msos.config.verbose) {
				msos.console.debug(temp_pc + ' -> loadedmetadata triggered!');
			}

			if (ply_obj.controls.updateDuration) {
				ply_obj.controls.updateDuration();
			}
			if (ply_obj.controls.updateCurrent) {
				ply_obj.controls.updateCurrent();
			}
		},
		false
	);

	msos.console.debug(temp_pc + ' -> done!');
};

mep.player.load_modules = function (feat) {
	"use strict";

	var i = 0,
		temp_lf = 'mep.player.load_modules -> ',
		module = '';

	msos.console.debug(temp_lf + 'start.');

	if (!Modernizr.video
	 && !Modernizr.audio) {
		// No HTML5, so detect available Video && Audio plugins
		msos.require("mep.plugins");
	}

	for (i = 0; i < feat.length; i += 1) {
		module = 'mep.' + feat[i];

		if (feat[i] === 'volume') {
			if (!msos.config.browser.touch) {	// Android and iOS don't support volume controls
				msos.require(module);
				mep.player.features.push(feat[i]);
			}
		} else if (!mep || !mep[feat[i]]) {		// Load the corresponding module, if not already loaded
			msos.require(module);
			mep.player.features.push(feat[i]);
		}
	}

	msos.console.debug(temp_lf + 'done, loaded features: ', mep.player.features);
};


/*
	Utility methods
*/
mep.player.utils = {

	encodeUrl: function (url) {
		"use strict";

		return encodeURIComponent(url);
	},

	formatType: function (url, type) {
		"use strict";

		var output;

		// if no type is supplied, fake it with the extension
		if (url && !type) {
			output = mep.player.utils.getTypeFromFile(url);
		} else {
			// only return the mime part of the type in case the attribute contains the codec
			// see http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html#the-source-element
			// `video/mp4; codecs="avc1.42E01E, mp4a.40.2"` becomes `video/mp4`
			if (type && type.indexOf(';') > 0) {
				output = type.substr(0, type.indexOf(';'));
			} else {
				output = type;
			}
		}
		return output;
	},

	getTypeFromFile: function (url) {
		"use strict";
		url = url.split('?')[0];
		var ext = url.substring(url.lastIndexOf('.') + 1);
		return (/(mp4|m4v|ogg|ogv|webm|webmv|flv|wmv|mpeg|mov)/gi.test(ext) ? 'video' : 'audio') + '/' + mep.player.utils.getTypeFromExtension(ext);
	},

	getTypeFromExtension: function (ext) {
		"use strict";

		switch (ext) {
			case 'mp4':
			case 'm4v':
				return 'mp4';
			case 'webm':
			case 'webma':
			case 'webmv':
				return 'webm';
			case 'ogg':
			case 'oga':
			case 'ogv':
				return 'ogg';
			default:
				return ext;
		}
	},

	secondsToTimeCode: function (time, forceHours, showFrameCount, fps) {
		"use strict";

		//add framecount
		if (showFrameCount === undefined) {
		    showFrameCount = false;
		} else if (fps === undefined) {
		    fps = 25;
		}

		var hours = Math.floor(time / 3600) % 24,
			minutes = Math.floor(time / 60) % 60,
			seconds = Math.floor(time % 60),
			frames = Math.floor(((time % 1) * fps).toFixed(3)),
			result =
					((forceHours || hours > 0) ? (hours < 10 ? '0' + hours : hours) + ':' : '')
						+ (minutes < 10 ? '0' + minutes : minutes) + ':'
						+ (seconds < 10 ? '0' + seconds : seconds)
						+ ((showFrameCount) ? ':' + (frames < 10 ? '0' + frames : frames) : '');

		return result;
	},

	timeCodeToSeconds: function (hh_mm_ss_ff, forceHours, showFrameCount, fps) {
		"use strict";

		if (showFrameCount === undefined) {
		    showFrameCount = false;
		} else if (fps === undefined) {
		    fps = 25;
		}

		var tc_array = hh_mm_ss_ff.split(":"),
			tc_hh = parseInt(tc_array[0], 10),
			tc_mm = parseInt(tc_array[1], 10),
			tc_ss = parseInt(tc_array[2], 10),
			tc_ff = 0,
			tc_in_seconds = 0;

		if (showFrameCount) {
		    tc_ff = parseInt(tc_array[3], 10) / fps;
		}

		tc_in_seconds = (tc_hh * 3600) + (tc_mm * 60) + tc_ss + tc_ff;

		return tc_in_seconds;
	}
};

mep.player.add_features = function (media_elm) {
	"use strict";

	var temp_af = 'mep.player.add_features -> ',
		add_array = media_elm.data('addFeatures') || [],
		i = 0;

	msos.console.debug(temp_af + 'start.');

	for (i = 0; i < add_array.length; i += 1) {
		mep.player.features.push(add_array[i]);
	}

	msos.console.debug(temp_af + 'done!');
};

// Build Media controls
mep.player.build = function ($node, cfg, feat_cfg, opts) {
	"use strict"; 

	var po = {},
		temp_mep = 'mep.player.build -> ';

	msos.console.debug(temp_mep + 'start.');

	// If our media node has a data attribute...
	if ($node.data) {
		// Add specific features per data attribute
		mep.player.add_features($node);
	}

	// Note: reassigned to clone in po.init()
	po.$node	= $node;
	po.node		= $node[0];
	po.media	= null;

	// Build base player
	jQuery.extend(
		po,
		mep.player.base
	);

	msos.console.debug(temp_mep + 'base added.');

	// try to get options from data-mejsoptions
	if (opts === undefined) {
		opts = po.$node.data('mejsoptions');
	}

	// Add in language support
	feat_cfg.i18n = msos.i18n.player.bundle;

	// extend default options
	po.options = jQuery.extend(
		{},
		cfg,
		feat_cfg,
		opts
	);

	msos.console.debug(temp_mep + 'config & options added.');

	po.$node.fitMedia();

	msos.console.debug(temp_mep + 'done, id: ' + (po.node.id || 'na'));
	return po;
};

msos.console.debug('mep.player -> loading done!');