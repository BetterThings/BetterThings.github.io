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
    mejs: true
*/

// MediaElementPlayer plugins variable,
// flash etc. use mejs for bridging
window.mejs = {};
//window.MediaElement = mejs.MediaElement;

msos.provide("mep.plugins");

mep.plugins = {

	version: new msos.set_version(14, 6, 15),
	name: 'mep.plugins',
	detected: {},

	nav: window.navigator,
	ua:  window.navigator.userAgent.toLowerCase(),

	addPlugin: function (p, pluginName, mimeType, activeX, axDetect) {
		"use strict";

		msos.console.debug(this.name + ' - addPlugin -> start.');

		this.detected[p] = this.detectPlugin(pluginName, mimeType, activeX, axDetect) || [];

		msos.console.debug(this.name + ' - addPlugin -> done!');
	},

	// get the version number from the mimetype (all but IE) or ActiveX (IE)
	detectPlugin: function (pluginName, mimeType, activeX, axDetect) {
		"use strict";

		var version = [0, 0, 0],
			description,
			i,
			ax;

		msos.console.debug(this.name + ' - detectPlugin -> start, plugin: ' + pluginName);

		// Firefox, Webkit, Opera
		if (this.nav.plugins !== undefined
		 && typeof this.nav.plugins[pluginName] === 'object') {
			description = this.nav.plugins[pluginName].description;
			if (description
			 && !(this.nav.mimeTypes !== undefined && this.nav.mimeTypes[mimeType] && !this.nav.mimeTypes[mimeType].enabledPlugin)) {
				version = description.replace(pluginName, '').replace(/^\s+/, '').replace(/\sr/gi, '.').split('.');
				for (i = 0; i < version.length; i += 1) {
					version[i] = parseInt(version[i].match(/\d+/), 10);
				}
			}
		// Internet Explorer / ActiveX
		} else if (window.ActiveXObject !== undefined) {
			try {
				ax = new ActiveXObject(activeX);
				if (ax) { version = axDetect(ax); }
			} catch (e) {
				version = [];
				msos.console.error(this.name + ' - detectPlugin -> na for IE: ' + e);
			  }
		} else {
			version = [];
			if (msos.config.verbose) {
				msos.console.debug(this.name + ' - detectPlugin -> na: ' + pluginName);
			}
		}

		msos.console.debug(this.name + ' - detectPlugin -> done, version: ', version);
		return version;
	},

	// as in hasPluginVersion('flash', [9, 0, 125])
	hasPluginVersion: function (plugin, v) {
		"use strict";

		var pv = this.detected[plugin];

		v[1] = v[1] || 0;
		v[2] = v[2] || 0;
		return (pv[0] > v[0]
			|| (pv[0] === v[0] && pv[1] > v[1])
			|| (pv[0] === v[0] && pv[1] === v[1] && pv[2] >= v[2])) ? true : false;
	},

	canPlayType: function (type, pluginType, pluginVersions) {
		"use strict";

		var i,
			j,
			pluginInfo;

		for (i = 0; i < pluginVersions.length; i += 1) {
			pluginInfo = pluginVersions[i];

			// test if user has the correct plugin version
			if (this.hasPluginVersion(pluginType, pluginInfo.version)) {

				// test for plugin playback types
				for (j = 0; j < pluginInfo.types.length; j += 1) {
					// find plugin that can play the type
					if (type === pluginInfo.types[j]) {
						return true;
					}
				}
			}
		}
		return false;
	},

	create: function (ply_obj, playback, me_opts, poster, autoplay, preload, controls) {
		"use strict";

		var temp_cr = ' - create -> ',
			width = 0,
			height = 0,
			plugin_id = 'me_' + playback.method + '_' + (mep.player.meIndex += 1),
			plugin_interface = new mep.plugins.plugin_interface(plugin_id, playback.method, playback.url),
			me_plugin_elm,
			plugin_html_txt,
			initVars,
			i,
			attribute;

		msos.console.debug(this.name + temp_cr + 'start.');

		// copy tagName from html media element
		plugin_interface.tagName = ply_obj.tagName;
		plugin_interface.success = me_opts.success_function;

		// copy attributes from html media element to plugin media element
		for (i = 0; i < ply_obj.node.attributes.length; i += 1) {
			attribute = ply_obj.node.attributes[i];
			if (attribute.specified === true) {
				plugin_interface.setAttribute(attribute.name, attribute.value);
			}
		}

		if (playback.isVideo) {
			width =  ply_obj.$node.width()	|| ply_obj.$node.parent().width()	|| 0;
			height = ply_obj.$node.height()	|| ply_obj.$node.parent().height()	|| 0;
		}

		if (width === 0 || height === 0) {
			msos.console.error(this.name + temp_cr + 'failed width/height!');
		}

		// flash vars
		initVars = [
			'id='			+ plugin_id,
			'isvideo='		+ ((playback.isVideo) ? "true" : "false"),
			'autoplay='		+ ((autoplay) ? "true" : "false"),
			'preload='		+ preload,
			'width='		+ width,
			'startvolume='	+ me_opts.startVolume,
			'timerrate='	+ me_opts.timerRate,
			'height='		+ height];

		if (playback.url !== null) {
			if (playback.method === 'flash') {
				initVars.push('file=' + mep.player.utils.encodeUrl(playback.url));
			} else {
				initVars.push('file=' + playback.url);
			  }
		}
		if (msos.config.verbose) {
			initVars.push('verbose=true');
		}
		if (me_opts.enablePluginSmoothing) {
			initVars.push('smoothing=true');
		}
		if (controls) {
			initVars.push('controls=true'); // shows controls in the plugin if desired
		}
		if (me_opts.pluginVars) {
			initVars = initVars.concat(me_opts.pluginVars);
		}		

		switch (playback.method) {

			case 'flash':
				plugin_html_txt = mep.plugins.flash_html(plugin_id, width, height, initVars, me_opts);
			break;

			case 'youtube':
				var videoId = playback.url.substr(playback.url.lastIndexOf('=') + 1),
					youtubeSettings = {
						container: ply_obj.container,
						containerId: ply_obj.container.id,
						pluginMediaElement: plugin_interface,
						pluginId: plugin_id,
						videoId: videoId,
						height: height,
						width: width	
					};

				if (mep.plugins
				 && mep.plugins.hasPluginVersion('flash', [10, 0, 0])
				 && mep.youtube) {

					plugin_html_txt = mep.plugins.youtube_html(plugin_id, width, height, initVars, me_opts);

					mep.youtube.api.createFlash(youtubeSettings);

				} else if (mep.youtube) {
					mep.youtube.api.enqueueIframe(youtubeSettings);
				} else {
					msos.console.error(this.name + temp_cr + 'error: mep.youtube not loaded!');
				  }
			break;

			case 'vimeo':

				plugin_interface.vimeoid = playback.url.substr(playback.url.lastIndexOf('/') + 1);

				plugin_html_txt = mep.plugins.vimeo_html(plugin_interface.vimeoid, width, height, initVars, me_opts);
			break;			
		}

		// Record which plugin to be used
		ply_obj.node.pluginType = playback.method;

		// Build our plugin element now
		me_plugin_elm = jQuery(plugin_html_txt);

		// Insert the new plugin element before original HTML5 element
		ply_obj.container.prepend(me_plugin_elm);

		// This is the media interface for the plugin
		ply_obj.media = plugin_interface

		// Hide original element
		ply_obj.node.style.display = 'none';

		// Register the plugin element and interface code
		mejs.MediaPluginBridge.registerPluginElement(
			plugin_id,
			plugin_interface,
			me_plugin_elm[0]
		);

		// FYI: me_opts.success will be fired by the MediaPluginBridge
		msos.console.debug(this.name + temp_cr + 'done for ' + playback.method);
	},

	removeSwf: function (id) {
		"use strict";

		var obj = document.getElementById(id);

		if (obj && obj.nodeName === "OBJECT") {
			obj.parentNode.removeChild(obj);
		}
	}
};

mep.plugins.flash_html = function (pluginid, width, height, initVars, options) {
    "use strict";

	msos.console.debug('mep.plugins.flash_html -> called!');

	return	'<embed id="' + pluginid + '" name="' + pluginid + '" ' +
			'play="true" ' +
			'loop="false" ' +
			'quality="high" ' +
			'bgcolor="#000000" ' +
			'wmode="transparent" ' +
			'allowScriptAccess="always" ' +
			'allowFullScreen="true" ' +
			'type="application/x-shockwave-flash" pluginspage="//www.macromedia.com/go/getflashplayer" ' +
			'src="' + options.shim_path + options.flashName + '" ' +
			'flashvars="' + initVars.join('&') + '" ' +
			'width="' + width + '" ' +
			'height="' + height + '" ' +
			'scale="default" class="mejs-shim"></embed>';
};

mep.plugins.vimeo_html = function (pluginid, width, height, initVars, options) {
    "use strict";

	msos.console.debug('mep.plugins.vimeo_html -> called!');

	return	'<iframe src="http://player.vimeo.com/video/' + pluginid + '?portrait=0&byline=0&title=0" width="' + width +'" height="' + height +'" frameborder="0" class="mejs-shim"></iframe>';
};

mep.plugins.youtube_html = function (pluginid, width, height, initVars, options) {
    "use strict";

	var youtubeUrl = 'http://www.youtube.com/apiplayer?enablejsapi=1&amp;playerapiid=' + pluginid  + '&amp;version=3&amp;autoplay=0&amp;controls=0&amp;modestbranding=1&loop=0';

	msos.console.debug('mep.plugins.youtube_html -> called!');

	return	'<object type="application/x-shockwave-flash" id="' + pluginid + '" data="' + youtubeUrl + '" ' +
				'width="' + width + '" height="' + height + '" style="visibility: visible; " class="mejs-shim">' +
				'<param name="allowScriptAccess" value="always">' +
				'<param name="wmode" value="transparent">' +
			'</object>';
};

//Mimics the <video/audio> element by calling Flash's External Interface or Silverlights [ScriptableMember]
mep.plugins.plugin_interface = function (pluginid, pluginType, mediaUrl) {
	"use strict";

	this.id = pluginid;
	this.pluginType = pluginType;
	this.src = mediaUrl;
	this.events = {};
};

mep.plugins.plugin_interface.prototype = {

	name: 'mep.plugins.plugin_interface',
	// special
	pluginElement: null,
	pluginType: '',
	isFullScreen: false,

	// not implemented :(
	playbackRate: -1,
	defaultPlaybackRate: -1,
	seekable: [],
	played: [],

	// HTML5 read-only properties
	paused: true,
	ended: false,
	seeking: false,
	duration: 0,
	error: null,
	tagName: '',

	// HTML5 get/set properties, but only set (updated by event handlers)
	muted: false,
	volume: 1,
	currentTime: 0,

	// HTML5 methods
	play: function () {
		"use strict";
		if (this.pluginApi !== null) {
			if (this.pluginType === 'youtube' || this.pluginType === 'vimeo') {
				this.pluginApi.playVideo();
			} else {
				this.pluginApi.playMedia();
			}
			this.paused = false;
		}
	},
	load: function () {
		"use strict";
		if (this.pluginApi !== null) {
			if (this.pluginType === 'youtube' || this.pluginType === 'vimeo') {
				this.pluginApi.loadMedia();
			}
			this.paused = false;
		}
	},
	pause: function () {
		"use strict";
		if (this.pluginApi !== null) {
			if (this.pluginType === 'youtube' || this.pluginType === 'vimeo') {
				this.pluginApi.pauseVideo();
			} else {
				this.pluginApi.pauseMedia();
			}
			this.paused = true;
		}
	},
	stop: function () {
		"use strict";
		if (this.pluginApi !== null) {
			if (this.pluginType === 'youtube' || this.pluginType === 'vimeo') {
				this.pluginApi.stopVideo();
			} else {
				this.pluginApi.stopMedia();
			}
			this.paused = true;
		}
	},
	canPlayType: function (type) {
		"use strict";
		var t_or_f = false,
			pluginType = this.pluginType,
			pluginVersions = mep.player.plugins[pluginType];

		t_or_f = mep.plugins.canPlayType(type, pluginType, pluginVersions);

		return t_or_f;
	},
	positionFullscreenButton: function (x, y, visibleAndAbove) {
		"use strict";
		if (this.pluginApi !== null && this.pluginApi.positionFullscreenButton) {
			this.pluginApi.positionFullscreenButton(x, y, visibleAndAbove);
		}
	},
	hideFullscreenButton: function () {
		"use strict";
		if (this.pluginApi !== null && this.pluginApi.hideFullscreenButton) {
			this.pluginApi.hideFullscreenButton();
		}
	},


	// custom methods since not all JavaScript implementations support get/set

	// This can be a url string
	// or an array [{src:'file.mp4',type:'video/mp4'},{src:'file.webm',type:'video/webm'}]
	setSrc: function (url) {
		"use strict";
		var i,
			media;

		msos.console.debug(this.name + ' - setSrc -> called, url: ', url);

		if (typeof url === 'string') {
			this.pluginApi.setSrc(msos.common.absolute_url(url));
			this.src = msos.common.absolute_url(url);
		} else {

			for (i = 0; i < url.length; i += 1) {
				media = url[i];
				if (this.canPlayType(media.type)) {
					this.pluginApi.setSrc(msos.common.absolute_url(media.src));
					this.src = msos.common.absolute_url(url);
					break;
				}
			}
		}
	},
	setCurrentTime: function (time) {
		"use strict";
		if (this.pluginApi !== null) {
			if (this.pluginType === 'youtube' || this.pluginType === 'vimeo') {
				this.pluginApi.seekTo(time);
			} else {
				this.pluginApi.setCurrentTime(time);
			  }
			this.currentTime = time;
		}
	},
	setVolume: function (volume) {
		"use strict";
		if (this.pluginApi !== null) {
			// same on YouTube and MEjs
			if (this.pluginType === 'youtube' || this.pluginType === 'vimeo') {
				this.pluginApi.setVolume(volume * 100);
			} else {
				this.pluginApi.setVolume(volume);
			  }
			this.volume = volume;
		}
	},
	setMuted: function (muted) {
		"use strict";
		if (this.pluginApi !== null) {
			if (this.pluginType === 'youtube' || this.pluginType === 'vimeo') {
				if (muted) {
					this.pluginApi.mute();
				} else {
					this.pluginApi.unMute();
				  }
				this.muted = muted;
				this.dispatchEvent('volumechange');
			} else {
				this.pluginApi.setMuted(muted);
			}
			this.muted = muted;
		}
	},

	// additional non-HTML5 methods
	setVideoSize: function (width, height) {
		"use strict";
		msos.console.debug(this.name + ' - setVideoSize -> start, height: ' + height + ', width: ' + width);

		if (this.pluginApi !== null && this.pluginApi.setVideoSize) {
			this.pluginApi.setVideoSize(width, height);
		} else {
			msos.console.warn(this.name + ' - setVideoSize -> no api!');
		  }
		msos.console.debug(this.name + ' - setVideoSize -> done!');
	},

	setFullscreen: function (fullscreen) {
		"use strict";
		if (this.pluginApi !== null && this.pluginApi.setFullscreen) {
			this.pluginApi.setFullscreen(fullscreen);
		} else {
			msos.console.warn(this.name + ' - setFullscreen -> na!');
		  }
	},

	enterFullScreen: function () {
		"use strict";
		if (this.pluginApi !== null && this.pluginApi.setFullscreen) {
			this.setFullscreen(true);
		} else {
			msos.console.warn(this.name + ' - enterFullScreen -> na!');
		  }
	},

	exitFullScreen: function () {
		"use strict";
		if (this.pluginApi !== null && this.pluginApi.setFullscreen) {
			this.setFullscreen(false);
		} else {
			msos.console.warn(this.name + ' - exitFullScreen -> na!');
		  }
	},

	// start: fake events
	addEventListener: function (eventName, callback) {
		"use strict";
		this.events[eventName] = this.events[eventName] || [];
		this.events[eventName].push(callback);
	},
	removeEventListener: function (eventName, callback) {
		"use strict";
		var callbacks,
			i = 0;

		if (!eventName) {
			this.events = {};
			return true;
		}
		callbacks = this.events[eventName];

		if (!callbacks) { return true; }
		if (!callback) {
			this.events[eventName] = [];
			return true;
		}
		for (i = 0; i < callbacks.length; i += 1) {
			if (callbacks[i] === callback) {
				this.events[eventName].splice(i, 1);
				return true;
			}
		}
		return false;
	},
	dispatchEvent: function (eventName) {
		"use strict";
		var i,
			args,
			callbacks = this.events[eventName];

		if (callbacks) {
			args = Array.prototype.slice.call(arguments, 1);
			for (i = 0; i < callbacks.length; i += 1) {
				callbacks[i].apply(null, args);
			}
		}
	},
	// end: fake events

	// fake DOM attribute methods
	attributes: {},
	hasAttribute: function (name) {
		"use strict";
		var atts = this.attributes;
		return (name in atts);
	},
	removeAttribute: function (name) {
		"use strict";
		delete this.attributes[name];
	},
	getAttribute: function (name) {
		"use strict";
		if (this.hasAttribute(name)) {
			return this.attributes[name];
		}
		return '';
	},
	setAttribute: function (name, value) {
		"use strict";
		this.attributes[name] = value;
	},
	remove: function () {
		"use strict";
		mep.plugins.removeSwf(this.pluginElement.id);
	}
};

// Handles calls from Flash/Silverlight and reports them as native <video/audio> events and properties
mejs.MediaPluginBridge = {

	name: 'mejs.MediaPluginBridge',
	pluginMediaElements: {},
	htmlMediaElements: {},

	registerPluginElement: function (id, plugin_int, media_elm) {
		"use strict";

		msos.console.debug(this.name + ' - registerPluginElement -> called, id: ' + id, plugin_int);
		this.pluginMediaElements[id] = plugin_int;
		this.htmlMediaElements[id] = media_elm;
	},

	// when Flash/Silverlight is ready, it calls out to this method
	initPlugin: function (id) {
		"use strict";

		var temp_ip = ' - initPlugin -> ',
			debug = '',
			pluginMediaElement	= this.pluginMediaElements[id],
			htmlMediaElement	= this.htmlMediaElements[id];

		msos.console.debug(this.name + temp_ip + 'start, id: ' + id);

		if (pluginMediaElement) {
			// find the javascript bridge
			switch (pluginMediaElement.pluginType) {
				case "flash":
					pluginMediaElement.pluginElement = document.getElementById(id);
					pluginMediaElement.pluginApi     = document.getElementById(id);
					debug = 'using flash';
					break;
			}

			if (typeof pluginMediaElement.success === 'function') {
				debug = 'success ' + debug;
				pluginMediaElement.success();
			}
		}

		msos.console.debug(this.name + temp_ip + 'done, ' + debug);
	},

	// receives events from Flash/Silverlight and sends them out as HTML5 media events
	// http://www.whatwg.org/specs/web-apps/current-work/multipage/video.html
	fireEvent: function (id, eventName, values) {
		"use strict";

		var e,
			i,
			bufferedTime,
			pluginMediaElement = this.pluginMediaElements[id];

		// fake event object to mimic real HTML media event.
		e = {
			type: eventName,
			target: pluginMediaElement
		};

		// attach all values to element and event object
		for (i in values) {
			pluginMediaElement[i] = values[i];
			e[i] = values[i];
		}

		// fake the newer W3C buffered TimeRange (loaded and total have been removed)
		bufferedTime = values.bufferedTime || 0;

		e.target.buffered = e.buffered = {
			start:	function () { return 0; },
			end:	function () { return bufferedTime; },
			length: 1
		};

		pluginMediaElement.dispatchEvent(e.type, e);
	}
};


/* Now we start detection so the results are immediately available - All the above is setup code */

// Flash detection
mep.plugins.addPlugin(
	'flash',
	'Shockwave Flash',
	'application/x-shockwave-flash',
	'ShockwaveFlash.ShockwaveFlash',
	function (ax) {
		"use strict";
		var version = [],
			d = ax.GetVariable("$version");
		if (d) {
			d = d.split(" ")[1].split(",");
			version = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
		}
		return version;
	}
);