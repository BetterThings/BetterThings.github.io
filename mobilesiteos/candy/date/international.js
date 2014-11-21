/*global
    msos: false,
    jQuery: false,
    candy: false
*/

msos.provide("candy.date.international");
msos.require("msos.intl");

candy.date.international.version = new msos.set_version(13, 6, 25);


candy.date.international.init = function () {
	"use strict";

	candy.util.localizedTime = function (dateTime) {

		if (dateTime === undefined || !dateTime instanceof Date) {
			msos.console.error('candy.util.localizedTime (candy.international) -> failed: missing or invalid Date instance!');
			return undefined;
		}

		if (dateTime.toDateString() === new Date().toDateString()) {
			return msos.intl.format(dateTime, 'T');	// Time only for same day
		}

		return msos.intl.format(dateTime, 'd');	// Date only
	};
};
