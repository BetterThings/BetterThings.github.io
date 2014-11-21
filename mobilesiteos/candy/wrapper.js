/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Patrick Stadler <patrick.stadler@gmail.com>
 *   - Michael Weibel <michael.weibel@gmail.com>
 *
 * Copyright:
 *   (c) 2011 Amiado Group AG. All rights reserved.
 *
 * Class: candy.wrapper
 */

/*global
    msos: false,
    jQuery: false,
    candy: false
*/

msos.provide("candy.wrapper");
msos.require("candy.view");
msos.require("candy.core");


candy.wrapper = {
	name: 'MSOS-Candy',
	version: new msos.set_version(13, 6, 25),
	version_org_candy: '1.0.9',
	use_timeago: false,
	use_popup_debug: false,
	use_xml_to_json: false,
	allow_annonymous: true
};

candy.wrapper.init = function (div_wrap, options, jid_or_host, pass, nick) {
	"use strict";

	var temp_cw = 'candy.wrapper.init -> ';

	msos.console.debug(temp_cw + 'start.');

	candy.view.init(div_wrap, options.view);
	candy.core.init(options.core);

	candy.core.connect(jid_or_host, pass, nick);

	msos.console.debug(temp_cw + 'done!');
};