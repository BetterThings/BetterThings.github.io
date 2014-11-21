/** File: chatroom.js
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

msos.provide("candy.core.chatroom");
msos.require("candy.core.chatroster");


candy.core.chatroom = function (roomJid) {
	"use strict";

	var temp_chr = 'candy.core.chatroom';

	msos.console.debug(temp_chr + ' -> start, for roomJid: ' + roomJid);

	this.room = {
		jid: roomJid,
		name: null
	};

	this.user = null;

	this.roster = new candy.core.chatroster();

	this.setUser = function (user) {
		msos.console.debug(temp_chr + '.setUser -> called, user: ' + user);
		this.user = user;
	};

	this.getUser = function () {
		return this.user;
	};

	this.getJid = function () {
		return this.room.jid;
	};

	this.setName = function (name) {
		msos.console.debug(temp_chr + '.setName -> called, name: ' + name);
		this.room.name = name;
	};

	this.getName = function () {
		return this.room.name;
	};

	this.setRoster = function (roster) {
		msos.console.debug(temp_chr + '.setRoster -> called, roster: ' + roster);
		this.roster = roster;
	};

	this.getRoster = function () {
		return this.roster;
	};

	msos.console.debug(temp_chr + ' -> done!');
};
