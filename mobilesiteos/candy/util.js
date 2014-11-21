/** File: util.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Patrick Stadler <patrick.stadler@gmail.com>
 *   - Michael Weibel <michael.weibel@gmail.com>
 *
 * Copyright:
 *   (c) 2011 Amiado Group AG. All rights reserved.
 */

/*global
    msos: false,
    jQuery: false,
    candy: false,
    Strophe: false,
    MD5: false
*/

msos.provide("candy.util");
msos.require("msos.intl");

candy.util.version = new msos.set_version(13, 6, 25);


candy.util.init = function () {
	"use strict";

	var temp_cu = 'candy.util';

	candy.util.jidToId = function (jid) {
		var md5_jid = MD5.hexdigest(jid);

		msos.console.debug(temp_cu + '.jidToId -> called, JID: ' + jid + ', MD5: ' + md5_jid);
		return md5_jid;
	};

	candy.util.escapeJid = function (jid) {
		var node = Strophe.escapeNode(Strophe.getNodeFromJid(jid)),
			domain = Strophe.getDomainFromJid(jid),
			resource = Strophe.getResourceFromJid(jid),
			out_jid = '';

		out_jid = node + '@' + domain;
		if (resource) {
			out_jid += '/' + Strophe.escapeNode(resource);
		}

		msos.console.debug(temp_cu + '.escapeJid -> called, JID in: ' + jid + ', out: ' + out_jid);
		return out_jid;
	};

	candy.util.unescapeJid = function (jid) {
		var node = Strophe.unescapeNode(Strophe.getNodeFromJid(jid)),
			domain = Strophe.getDomainFromJid(jid),
			resource = Strophe.getResourceFromJid(jid),
			out_jid = '';

		out_jid = node + '@' + domain;
		if (resource) {
			out_jid += '/' + Strophe.unescapeNode(resource);
		}

		msos.console.debug(temp_cu + '.escapeJid -> called, JID in: ' + jid + ', out: ' + out_jid);
		return out_jid;
	};

	candy.util.crop = function (str, len) {
		if (str.length > len) {
			str = str.substr(0, len - 3) + '...';
		}
		return str;
	};

	candy.util.getPosLeftAccordingToWindowBounds = function (elem, pos) {
		var windowWidth = jQuery(document).width(),
			elemWidth   = elem.outerWidth(),
			marginDiff = elemWidth - elem.outerWidth(true),
			backgroundPositionAlignment = 'left';

		if (pos + elemWidth >= windowWidth) {
			pos -= elemWidth - marginDiff;
			backgroundPositionAlignment = 'right';
		}

		return {
			px: pos,
			backgroundPositionAlignment: backgroundPositionAlignment
		};
	};

	candy.util.getPosTopAccordingToWindowBounds = function (elem, pos) {
		var windowHeight = jQuery(document).height(),
			elemHeight   = elem.outerHeight(),
			marginDiff = elemHeight - elem.outerHeight(true),
			backgroundPositionAlignment = 'top';

		if (pos + elemHeight >= windowHeight) {
			pos -= elemHeight - marginDiff;
			backgroundPositionAlignment = 'bottom';
		}

		return {
			px: pos,
			backgroundPositionAlignment: backgroundPositionAlignment
		};
	};

	// This is a simple paceholder function for one to be provided by either candy.timeago or candy.international
	candy.util.localizedTime = function (dateTime) {

		if (dateTime === undefined || !dateTime instanceof Date) {
			msos.console.error('candy.util.localizedTime -> failed: missing or invalid Date instance!');
			return undefined;
		}

		return dateTime.toDateString();
	};

	candy.util.Parser = {

		_emoticonPath: '',

		setEmoticonPath: function (path) {
			this._emoticonPath = path;
		},

		emoticons: [
			{
				plain: ':)',
				regex: /((\s):-?\)|:-?\)(\s|$))/gm,
				image: 'Smiling.png'
			},
			{
				plain: ';)',
				regex: /((\s);-?\)|;-?\)(\s|$))/gm,
				image: 'Winking.png'
			},
			{
				plain: ':D',
				regex: /((\s):-?D|:-?D(\s|$))/gm,
				image: 'Grinning.png'
			},
			{
				plain: ';D',
				regex: /((\s);-?D|;-?D(\s|$))/gm,
				image: 'Grinning_Winking.png'
			},
			{
				plain: ':(',
				regex: /((\s):-?\(|:-?\((\s|$))/gm,
				image: 'Unhappy.png'
			},
			{
				plain: '^^',
				regex: /((\s)\^\^|\^\^(\s|$))/gm,
				image: 'Happy_3.png'
			},
			{
				plain: ':P',
				regex: /((\s):-?P|:-?P(\s|$))/igm,
				image: 'Tongue_Out.png'
			},
			{
				plain: ';P',
				regex: /((\s);-?P|;-?P(\s|$))/igm,
				image: 'Tongue_Out_Winking.png'
			},
			{
				plain: ':S',
				regex: /((\s):-?S|:-?S(\s|$))/igm,
				image: 'Confused.png'
			},
			{
				plain: ':/',
				regex: /((\s):-?\/|:-?\/(\s|$))/gm,
				image: 'Uncertain.png'
			},
			{
				plain: '8)',
				regex: /((\s)8-?\)|8-?\)(\s|$))/gm,
				image: 'Sunglasses.png'
			},
			{
				plain: '$)',
				regex: /((\s)\$-?\)|\$-?\)(\s|$))/gm,
				image: 'Greedy.png'
			},
			{
				plain: 'oO',
				regex: /((\s)oO|oO(\s|$))/gm,
				image: 'Huh.png'
			},
			{
				plain: ':x',
				regex: /((\s):x|:x(\s|$))/gm,
				image: 'Lips_Sealed.png'
			},
			{
				plain: ':666:',
				regex: /((\s):666:|:666:(\s|$))/gm,
				image: 'Devil.png'
			},
			{
				plain: '<3',
				regex: /((\s)&lt;3|&lt;3(\s|$))/gm,
				image: 'Heart.png'
			}
		],

		emotify: function (text) {
			var i;
			for (i = this.emoticons.length - 1; i >= 0; i -= 1) {
				text = text.replace(this.emoticons[i].regex, '$2<img class="emoticon" alt="$1" src="' + this._emoticonPath + this.emoticons[i].image + '" />$3');
			}
			return text;
		},

		linkify: function (text) {
			text = text.replace(/(^|[^\/])(www\.[^\.]+\.[\S]+(\b|$))/gi, '$1http://$2');
			return text.replace(/(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/ig, '<a href="$1" target="_blank">$1</a>');
		},

		escape: function (text) {
			return jQuery('<div/>').text(text).html();
		},

		all: function (text) {
			if (text) {
				text = this.escape(text);
				text = this.linkify(text);
				text = this.emotify(text);
			}
			msos.console.debug(temp_cu + '.Parser.all -> called.');
			return text;
		}
	};
};
