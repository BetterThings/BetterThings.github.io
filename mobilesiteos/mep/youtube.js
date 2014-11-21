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
    jQuery: false,
    mep: false
*/

msos.provide("mep.youtube");

mep.youtube.version = new msos.set_version(14, 6, 15);


// YouTube Flash and Iframe API
mep.youtube.api = {

	// Common functions to both api's
	createEvent: function (player, pluginMediaElement, eventName) {
		"use strict";

		var obj = {
				type: eventName,
				target: pluginMediaElement
			},
			bufferedTime;

		if (player && player.getDuration) {

			// time 
			pluginMediaElement.currentTime	= obj.currentTime =	player.getCurrentTime();
			pluginMediaElement.duration		= obj.duration =	player.getDuration();

			// state
			obj.paused	= pluginMediaElement.paused;
			obj.ended	= pluginMediaElement.ended;

			// sound
			obj.muted	= player.isMuted();
			obj.volume	= player.getVolume() / 100;

			// progress
			obj.bytesTotal		= player.getVideoBytesTotal();
			obj.bufferedBytes	= player.getVideoBytesLoaded();

			// fake the W3C buffered TimeRange
			bufferedTime = obj.bufferedBytes / obj.bytesTotal * obj.duration;

			obj.target.buffered = obj.buffered = {
				start:	function (index) { return 0; },
				end:	function (index) { return bufferedTime; },
				length: 1
			};
		}
		// send event up the chain
		pluginMediaElement.dispatchEvent(obj.type, obj);
	},

	handleStateChange: function (youTubeState, player, pluginMediaElement) {
		"use strict";

		switch (youTubeState) {
			case -1: // not started
				pluginMediaElement.paused	= true;
				pluginMediaElement.ended	= true;
				mep.youtube.api.createEvent(player, pluginMediaElement, 'loadedmetadata');
			break;
			case 0:
				pluginMediaElement.paused	= false;
				pluginMediaElement.ended	= true;
				mep.youtube.api.createEvent(player, pluginMediaElement, 'ended');
			break;
			case 1:
				pluginMediaElement.paused	= false;
				pluginMediaElement.ended	= false;
				mep.youtube.api.createEvent(player, pluginMediaElement, 'play');
				mep.youtube.api.createEvent(player, pluginMediaElement, 'playing');
			break;
			case 2:
				pluginMediaElement.paused	= true;
				pluginMediaElement.ended	= false;
				mep.youtube.api.createEvent(player, pluginMediaElement, 'pause');
			break;
			case 3: // buffering
				mep.youtube.api.createEvent(player, pluginMediaElement, 'progress');
			break;
			case 5:
				// cued?
			break;
		}
	},

	// Iframe api
	isIframeStarted: false,
	isIframeLoaded: false,
	iframeQueue: [],

	loadIframeApi: function () {
		"use strict";

		var youtube_loader = new msos.loader(),
			youtube_src = "http://www.youtube.com/player_api";

		youtube_loader.load('youtube_api', youtube_src);

		this.isIframeStarted = true;
	},

	enqueueIframe: function (yt) {
		"use strict";

		if (this.isIframeLoaded) {
			this.createIframe(yt);
		} else {
			this.loadIframeApi();
			this.iframeQueue.push(yt);
		}
	},

	createIframe: function (settings) {
		"use strict";

		var pluginMediaElement = settings.pluginMediaElement,
			player = new YT.Player(
				settings.containerId,
				{
					height:		settings.height,
					width:		settings.width,
					videoId:	settings.videoId,
					playerVars: { controls: 0 },
					events: {
						'onReady': function () {
							// hook up iframe object to MEjs
							settings.pluginMediaElement.pluginApi = player;
							// init mejs
							mep.player.MediaPluginBridge.initPlugin(settings.pluginId);
							// create timer
							setInterval(
								function () { mep.youtube.api.createEvent(player, pluginMediaElement, 'timeupdate'); },
								250
							);
						},
						'onStateChange': function (e) {
							mep.youtube.api.handleStateChange(e.data, player, pluginMediaElement);
						}
					}
				}
			);
	},

	iFrameReady: function () {
		"use strict";

		this.isIframeLoaded = true;

		while (this.iframeQueue.length > 0) {
			var settings = this.iframeQueue.pop();
			this.createIframe(settings);
		}
	},

	// Flash api
	flashPlayers: {},
	createFlash: function (settings) {
		"use strict";
		this.flashPlayers[settings.pluginId] = settings;
	},

	flashReady: function (id) {
		"use strict";
		var settings = this.flashPlayers[id],
			player = document.getElementById(id),
			pluginMediaElement = settings.pluginMediaElement,
			callbackName;

		// hook up and return to jQuery.success	
		pluginMediaElement.pluginApi =
		pluginMediaElement.pluginElement = player;
		mep.player.MediaPluginBridge.initPlugin(id);

		// load the youtube video
		player.cueVideoById(settings.videoId);

		callbackName = settings.containerId + '_callback';

		window[callbackName] = function (e) {
			mep.youtube.api.handleStateChange(e, player, pluginMediaElement);
		};

		player.addEventListener('onStateChange', callbackName);

		setInterval(
			function () { mep.youtube.api.createEvent(player, pluginMediaElement, 'timeupdate'); },
			250
		);
	}
};

// IFRAME
function onYouTubePlayerAPIReady() {
	"use strict";
	mep.youtube.api.iFrameReady();
}

// FLASH
function onYouTubePlayerReady(id) {
	"use strict";
	mep.youtube.api.flashReady(id);
}