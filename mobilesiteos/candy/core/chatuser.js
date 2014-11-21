/** File: chatuser.js
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
    Strophe: false,
    candy: false
*/

msos.provide("candy.core.chatuser");
msos.require("candy.util");


candy.core.chatuser = function (jid, nick, affiliation, role) {
	"use strict";

	var temp_chu = 'candy.core.chatuser';

	msos.console.debug(temp_chu + ' -> start, for jid: ' + jid + ', nick: ' + nick + ', affil: ' + affiliation + ', role: ' + role);

	this.ROLE_MODERATOR = 'moderator';

	this.AFFILIATION_OWNER = 'owner';

	this.data = {
		jid: jid,
		nick: Strophe.unescapeNode(nick),
		affiliation: affiliation,
		role: role,
		privacyLists: {},
		customData: {}
	};

	this.getJid = function () {
		msos.console.debug(temp_chu + '.getJid -> called, for data.jid: ' + this.data.jid);
		if (this.data.jid) {
			return candy.util.unescapeJid(this.data.jid);
		}
		return '';
	};

	this.getEscapedJid = function () {
		return candy.util.escapeJid(this.data.jid);
	};

	this.getNick = function () {
		return Strophe.unescapeNode(this.data.nick);
	};

	this.getRole = function () {
		return this.data.role;
	};

	this.getAffiliation = function () {
		return this.data.affiliation;
	};

	this.isModerator = function () {
		return this.getRole() === this.ROLE_MODERATOR || this.getAffiliation() === this.AFFILIATION_OWNER;
	};

	this.addToOrRemoveFromPrivacyList = function (list, jid) {
		var index = -1;

		msos.console.debug(temp_chu + '.addToOrRemoveFromPrivacyList -> called, on list: ' + list + ', for: ' + jid);

		if (!this.data.privacyLists[list]) { this.data.privacyLists[list] = []; }

		if ((index = this.data.privacyLists[list].indexOf(jid)) !== -1) {
			this.data.privacyLists[list].splice(index, 1);
		} else {
			this.data.privacyLists[list].push(jid);
		}
		return this.data.privacyLists[list];
	};

	this.getPrivacyList = function (list) {
		msos.console.debug(temp_chu + '.getPrivacyList -> called, on list: ' + list);

		if (!this.data.privacyLists[list]) {
			this.data.privacyLists[list] = [];
		}
		return this.data.privacyLists[list];
	};

	this.isInPrivacyList = function (list, jid) {
		msos.console.debug(temp_chu + '.isInPrivacyList -> called, on list: ' + list + ', for: ' + jid);

		if (!this.data.privacyLists[list]) { return false; }

		return this.data.privacyLists[list].indexOf(jid) !== -1;
	};

	this.setCustomData = function (data) {
		this.data.customData = data;
	};

	this.getCustomData = function () {
		return this.data.customData;
	};

	msos.console.debug(temp_chu + ' -> done, for data: ', this.data);
};
