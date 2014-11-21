/** File: event.js
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

msos.provide("candy.view.event");

candy.view.event = {

	Chat: {

		onAdminMessage: function (args) {
			"use strict";
			return;
		},

		onDisconnect: function () {
			"use strict";
			return;
		},

		onAuthfail: function () {
			"use strict";
			return;
		}
	},

	Room: {

		onAdd: function (args) {
			"use strict";
			return;
		},

		onShow: function (args) {
			"use strict";
			return;
		},

		onHide: function (args) {
			"use strict";
			return;
		},

		onSubjectChange: function (args) {
			"use strict";
			return;
		},

		onClose: function (args) {
			"use strict";
			return;
		},

		onPresenceChange: function (args) {
			"use strict";
			return;
		}
	},

	Roster: {

		onUpdate: function (args) {
			"use strict";
			return;
		},

		onContextMenu: function (args) {
			"use strict";
			return {};
		},

		afterContextMenu: function (args) {
			"use strict";
			return;
		}
	},

	Message: {

		beforeShow: function (args) {
			"use strict";
			return args.message;
		},

		onShow: function (args) {
			"use strict";
			return;
		},

		beforeSend: function (message) {
			"use strict";
			return message;
		}
	}
};