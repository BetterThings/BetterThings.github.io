/** File: core.js
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
    Strophe: false
*/

msos.provide("candy.core");
msos.require("candy.core.action");
msos.require("candy.core.event");
msos.require("msos.i18n.candy");
msos.require("candy.wrapper");

if (msos.config.debug) {
	msos.require("candy.core.debug");
}

candy.core.version = new msos.set_version(13, 6, 25);

candy.core._conn = null;
candy.core._rooms = {};
candy.core._opts = {};
candy.core._user = {};

candy.core.getConnection =	function () {
	"use strict";
	return candy.core._conn;
};
candy.core.getRooms = function () {
	"use strict";
	return candy.core._rooms;
};
candy.core.getOptions =	function () {
	"use strict";
	return candy.core._opts;
};
candy.core.getRoom = function (roomJid) {
	"use strict";
	if (candy.core._rooms[roomJid]) {
		return candy.core._rooms[roomJid];
	}
	return null;
};
candy.core.getUser = function () {
	"use strict";
	return candy.core._user;
};

candy.core.init = function (options) {
	"use strict";

	var temp_ci = 'candy.core.init -> ',
		_conn = null,
		_options = {
			autojoin: true,
			debug: false,
			host: window.location.host,
			annonymous: true
		},
		ws_protocol = window.location.protocol == "http:" ? "ws:" : "wss:",
		use_service = '';

	msos.console.debug(temp_ci + 'start.');

	// Apply options
	jQuery.extend(true, _options, options);

	candy.core.i18n = msos.i18n.candy.bundle;

	Strophe.addNamespace('PRIVATE',		'jabber:iq:private');
	Strophe.addNamespace('BOOKMARKS',	'storage:bookmarks');
	Strophe.addNamespace('PRIVACY',		'jabber:iq:privacy');
	Strophe.addNamespace('DELAY',		'jabber:x:delay');

	// Initiate Dependencies
	candy.core.action.init();

	if (msos.config.use_websockets && msos.config.websocket) {

		use_service = ws_protocol + "//" + _options.host + ":7070/ws/server?username=null&password=null&resource=" + candy.wrapper.name;

	} else {

		use_service = 'http-bind/';

	}

	// Connect to xmpp service
	_conn = new Strophe.Connection(use_service);

	msos.console.debug(temp_ci + 'connection, via service: ' + use_service);

	if (candy.core.debug) {
		_conn.rawInput  = candy.core.debug.strophe_recv;
		_conn.rawOutput = candy.core.debug.strophe_sent;
	}

	if (!msos.config.use_websockets || !msos.config.websocket) {

		// Add authentication mechanisms (websockets use wss instead)
		_conn.mechanisms = {
			'ANONYMOUS':	Strophe.SASLAnonymous,
			'PLAIN':		Strophe.SASLPlain,
			'SCRAM-SHA-1':	Strophe.SASLSHA1,
			'DIGEST-MD5':	Strophe.SASLMD5
		};
	}

	window.onbeforeunload = function () {
		_conn.sync = true;
		candy.core.disconnect();
		_conn.flush();
	};

	candy.core._conn = _conn;
	candy.core._opts = _options;

	msos.console.debug(temp_ci + 'done!');
};

candy.core.connect = function (jidOrHost, password, nick) {
	"use strict";

	var temp_crc = 'candy.core.connect -> ',
		athent = 'no jid or host',
		_conn = candy.core.getConnection(),
		_opts = candy.core.getOptions(),
		_ccev = candy.core.event,
		_getEscapedJidFromJid = function (jid) {
			var node = Strophe.getNodeFromJid(jid),
				domain = Strophe.getDomainFromJid(jid);

			return node ? Strophe.escapeNode(node) + '@' + domain : domain;
		};

	msos.console.debug(temp_crc + 'start.');

	_conn.reset();

	// parameters:	handler,						ns,						name,		type,	id,	from,	options
	_conn.addHandler(_ccev.Jabber.Version,			Strophe.NS.VERSION,		'iq');
	_conn.addHandler(_ccev.Jabber.Presence,			null,					'presence');
	_conn.addHandler(_ccev.Jabber.Message,			null,					'message');
	_conn.addHandler(_ccev.Jabber.Bookmarks,		Strophe.NS.PRIVATE,		'iq');
	_conn.addHandler(_ccev.Jabber.Room.Disco,		Strophe.NS.DISCO_INFO,	'iq');
	_conn.addHandler(_ccev.Jabber.PrivacyList,		Strophe.NS.PRIVACY,		'iq',		'result');
	_conn.addHandler(_ccev.Jabber.PrivacyListError,	Strophe.NS.PRIVACY,		'iq',		'error');

	if (jidOrHost && password) {
		athent = 'jid or host: ' + jidOrHost + ', password: ' + password;

		_conn.connect(
			_getEscapedJidFromJid(jidOrHost) + '/' + candy.wrapper.name,
			password,
			_ccev.Strophe.Connect
		);

		candy.core._user = new candy.core.chatuser(jidOrHost, Strophe.getNodeFromJid(jidOrHost));

	} else if (jidOrHost && nick) {
		athent = 'jid or host: ' + jidOrHost + ', nick: ' + nick;

		_conn.connect(
			_getEscapedJidFromJid(jidOrHost) + '/' + nick,
			null,
			_ccev.Strophe.Connect
		);

		candy.core._user = new candy.core.chatuser(null, nick); // set jid to null because we'll later receive it

	} else if (jidOrHost) {
		athent = 'jid or host: ' + jidOrHost;

		_ccev.Login(jidOrHost);

	} else if (_opts.annonymous && candy.wrapper.allow_annonymous) {
		athent = 'annonymous: ' + _opts.host;

		_ccev.Login(_opts.host);

	} else {
		_ccev.Login();
	  }

	// Start debugging
	if (candy.core.debug) { candy.core.debug.strophe_comm(); }

	msos.console.debug(temp_crc + 'done, for ' + athent);
};

candy.core.disconnect = function () {
	"use strict";

	var temp_cd = 'candy.core.disconnect -> ',
		_conn = candy.core.getConnection();

	msos.console.debug(temp_cd + 'start.');

	if (_conn.connected) {
		jQuery.each(
			candy.core.getRooms(),
			function () {
				candy.core.action.Jabber.Room.Leave(this.getJid());
			}
		);
		_conn.disconnect();
	}

	msos.console.debug(temp_cd + 'done!');
};
