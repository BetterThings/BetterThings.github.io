/*
 * candy-timeago-plugin
 * @version 0.1 (2011-07-15)
 * @author David Devlin (dave.devlin@gmail.com)
 *
 * Integrates the jQuery Timeago plugin (http://timeago.yarp.com/) with Candy.
 */

/*global
    msos: false,
    jQuery: false,
    jquery: false,
    candy: false
*/

msos.provide("candy.date.timeago");
msos.require("jquery.tools.timeago");

candy.date.timeago.version = new msos.set_version(13, 6, 25);


candy.date.timeago.iso8601 = function (date) {
	"use strict";

	var zeropad = function (num) {
			return ((num < 10) ? '0' : '') + num;
		};

    return date.getUTCFullYear()
        + "-" + zeropad(date.getUTCMonth()+1)
        + "-" + zeropad(date.getUTCDate())
        + "T" + zeropad(date.getUTCHours())
        + ":" + zeropad(date.getUTCMinutes())
        + ":" + zeropad(date.getUTCSeconds()) + "Z";
};

candy.date.timeago.init = function () {
	"use strict";

	candy.view.template.Chat.adminMessage =	'<dt><abbr title="{{time}}">{{time}}</abbr></dt><dd class="adminmessage"><span class="label">{{sender}}</span>{{subject}} {{message}}</dd>';
	candy.view.template.Chat.infoMessage =	'<dt><abbr title="{{time}}">{{time}}</abbr></dt><dd class="infomessage">{{subject}} {{message}}</dd>';
	candy.view.template.Room.subject =		'<dt><abbr title="{{time}}">{{time}}</abbr></dt><dd class="subject"><span class="label">{{roomName}}</span>{{_roomSubject}} {{subject}}</dd>';
	candy.view.template.Message.item =		'<dt><abbr title="{{time}}">{{time}}</abbr></dt><dd><span class="label"><a href="#" class="name">{{displayName}}</a></span>{{{message}}}</dd>';

	candy.util.localizedTime = function (dateTime) {

		if (dateTime === undefined || !dateTime instanceof Date) {
			msos.console.error('candy.util.localizedTime (candy.timeago) -> failed: missing or invalid Date instance!');
			return undefined;
		}

		return candy.date.timeago.iso8601(dateTime);
	};

	candy.view.event.Message.onShow = function (message) {
		jQuery('abbr').timeago();
	};

	candy.view.event.Chat.onAdminMessage = function (message) {
		jQuery('abbr').timeago();
	};

	candy.view.event.Room.onSubjectChange = function (message) {
		jQuery('abbr').timeago();
	};

	candy.view.event.Room.onPresenceChange = function (message) {
		jQuery('abbr').timeago();
	};
};
