
/*global
    msos: false,
    jQuery: false,
    Modernizr: false
*/

msos.provide("mep.play.audio");
msos.require("mep.player");

mep.play.audio = {

	version: new msos.set_version(14, 6, 14),

	config: {
		// auto:			attempts to detect what the browser can do
		// native:			forces HTML5 playback
		// shim:			disallows HTML5, will attempt Flash
		mode: _.indexOf(['auto', 'native', 'shim'], msos.config.query.player_mode) > 0 ? msos.config.query.player_mode : 'auto',
		poster: '',
		// remove or reorder to change plugin priority and availability
		plugins: ['flash', 'youtube', 'vimeo'],
		// name of plugin specific required external file
		flashName: 'flashmediaelement.swf',
		// path to Flash plugin
		shim_path: msos.resource_url('mep', 'shim/'),
		// name of flash file
		// turns on the smoothing filter in Flash
		enablePluginSmoothing: false,
		// default amount to move back when back key is pressed		
		defaultSeekBackwardInterval: function (media) {
			"use strict";
			return (media.duration * 0.05);
		},
		// default amount to move forward when forward key is pressed				
		defaultSeekForwardInterval: function (media) {
			"use strict";
			return (media.duration * 0.05);
		},
		// additional plugin variables in 'key=value' form
		pluginVars: [],
		// rate in milliseconds for Flash to fire the timeupdate event
		// larger number is less accurate, but less strain on plugin->JavaScript bridge
		timerRate: 250,
		// initial volume for player
		startVolume: 0.8,
		// useful for <audio> player loops
		loop: false,
		// rewind to beginning when media ends
        autoRewind: true,
		// forces the hour marker (##:00:00)
		alwaysShowHours: false,
		// show framecount in timecode (##:00:00:00)
		showTimecodeFrameCount: false,
		// used when showTimecodeFrameCount is set to true
		framesPerSecond: 25,
		// Hide controls when playing and mouse is not over the video
		alwaysShowControls: false,
        // Enable click video element to toggle play/pause
        clickToPlayPause: true,
		// whenthis player starts, it will pause other players
		pauseOtherPlayers: true,

        plugin_capabilities: {
            flash: [
                {
                    version: [9, 0, 124],
                    types: [
                        'audio/flv', 'audio/x-flv', 'audio/mp3', 'audio/m4a', 'audio/mpeg'
                    ]
                }
            ]
        },

		success_function: function (player_object) {
			"use strict";

			var temp_sf = 'mep.play.audio.success_function -> ';

            msos.console.info(temp_sf + 'called: ' + player_object.id);
		},

		error_function:	 function (player_object) {
			"use strict";

			var temp_ef = 'mep.play.audio.error_function -> ';

            msos.console.error(temp_ef + 'for: ' + player_object.id);
		}
	},

    features_by_size: {
		'desktop':	['playpause', 'current', 'progress', 'duration', 'volume', 'stop', 'keyboard'],
        'large':	['playpause', 'current', 'progress', 'duration', 'volume', 'stop', 'keyboard'],
        'medium':	['playpause', 'current', 'progress', 'duration', 'volume', 'stop'],
        'small':	['playpause', 'current', 'progress', 'duration', 'volume', 'stop'],
        'tablet':	['playpause', 'current', 'progress', 'duration'],
        'phone':	['playpause', 'current', 'progress', 'duration']
    },

    format: {
        mp3: {
            codec: 'audio/mpeg; codecs="mp3"',
            flash: true
        },
        m4a: {
            codec: 'audio/mp4; codecs="mp4a.40.2"',
            flash: true
        },
        oga: {
            codec: 'audio/ogg; codecs="vorbis"',
            flash: false
        },
        wav: {
            codec: 'audio/wav; codecs="1"',
            flash: false
        },
        webma: {
            codec: 'audio/webm; codecs="vorbis"',
            flash: false
        },
        fla: {
            codec: 'audio/x-flv',
            flash: true
        },
        rtmpa: {
            codec: 'audio/rtmp; codecs="rtmp"',
            flash: true
        }
    },

	html5: {
		types: [
			'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/wav'
		]
	}
};

mep.play.audio.init = function () {
    "use strict";

    var temp_ai = 'mep.play.audio.init -> ',
        aud_feat = mep.play.audio.features_by_size,
        features = aud_feat[msos.config.size] || aud_feat.phone,
        a_cfg = mep.play.audio.config;

    msos.console.debug(temp_ai + 'start, screen size: ' + msos.config.size);

    // Check browser/device HTML5 Media capabilities
    mep.player.support.html5_media = Modernizr.audio;

    // No HTML5 Media or we want plugin detection, so check for available Audio plugins
    if (!mep.player.support.html5_media || !(a_cfg.mode === 'auto' || a_cfg.mode === 'native')) {
        msos.require("mep.plugins");
    }

    // Add needed modules, per 'features_by_size' and  logic
    mep.player.load_modules(features, a_cfg.use_native_ctrls.force);

	jQuery.fn.html5audio = function (options) {

		return this.each(
			function () {
				var temp_h5 = 'mep.play.audio.init - jQuery.fn.html5audio',
					$this = jQuery(this),
					mep_obj = new mep.player.build($this, a_cfg, mep.player.config, options),
						events = [
						'loadstart', 'loadeddata',
						'play', 'playing',
						'seeking', 'seeked',
						'pause', 'waiting',
						'ended', 'canplay', 'error'
					],
					i = 0;

				// Start up
				mep_obj.init();
				// Store each player
				mep.player.players.push(mep_obj);

				// Add some intense debugging
				if (msos.config.verbose) {
					msos.console.debug(temp_h5 + ' -> player object:', mep_obj);

					for (i = 0; i < events.length; i += 1) {
						mep_obj.media.addEventListener(
							events[i],
							function (e) {
								msos.console.debug(temp_h5 + ' @@@@> player fired event: ' + e.type);
							}
						);
					}
				}
			}
		);
	};

    msos.console.debug(temp_ai + 'done!');
};

mep.play.audio.start = function () {
    "use strict";

    // Note: 'msos.load_html5_media_shim()' loads 'mep.play.audio' based on page.
    jQuery('audio').html5audio();
};


msos.onload_func_start.push(mep.play.audio.init);