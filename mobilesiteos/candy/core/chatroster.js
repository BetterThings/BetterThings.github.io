/** File: chatroster.js
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
    candy: false
*/

msos.provide("candy.core.chatroster");

candy.core.chatroster = function () {
	"use strict";

	var temp_chs = 'candy.core.chatroster';

	msos.console.debug(temp_chs + ' -> start.');

	this.items = {};

	this.add = function (user) {
		msos.console.debug(temp_chs + '.add -> called, user: ' + user);
		this.items[user.getJid()] = user;
	};

	this.remove = function (jid) {
		msos.console.debug(temp_chs + '.remove -> called, jid: ' + jid);
		delete this.items[jid];
	};

	this.get = function (jid) {
		return this.items[jid];
	};

	this.getAll = function () {
		return this.items;
	};

	msos.console.debug(temp_chs + ' -> done!');
};
