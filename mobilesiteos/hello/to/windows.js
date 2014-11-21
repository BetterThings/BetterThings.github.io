//
// Windows
//

/*global
    msos: false,
    jQuery: false,
    hello: false
*/

msos.provide("hello.to.windows");

hello.to.windows.version = new msos.set_version(14, 10, 14);


hello.to.windows.config = {

    windows: {

        name: 'Windows live',
        id: msos.config.social.windows,

        oauth: {
            version: 2,
            auth: 'https://login.live.com/oauth20_authorize.srf'
        },

		logout: function () {
			return 'https://login.live.com/oauth20_logout.srf?ts=' + (new Date()).getTime();
		},

        scope: {
            basic:		'wl.signin,wl.basic',
            email:		'wl.emails',
            birthday:	'wl.birthday',
            events:		'wl.calendars',
            photos:		'wl.photos',
            videos:		'wl.photos',
            friends:	'',
            files:		'wl.skydrive',

            publish:		'wl.share',
            publish_files:	'wl.skydrive_update',
            create_event:	'wl.calendars_update,wl.events_create',

            offline_access: 'wl.offline_access'
        },

        base: 'https://apis.live.net/v5.0/',

        get: {
            "me": "me",
            "me/friends": "me/friends",
            "me/following": "me/friends",
            "me/followers": "me/friends",

            "me/albums": 'me/albums',

            "me/album": '@{id}/files',
            "me/photo": '@{id}',

            "me/files": '@{id|me/skydrive}/files',

            "me/folders": '@{id|me/skydrive}/files',
            "me/folder": '@{id|me/skydrive}/files'
        }
    }
};


hello.to.windows.init = function () {
    "use strict";

    msos.console.debug('hello.to.windows.init -> start.');

    hello.init(hello.to.windows.config);

    msos.console.debug('hello.to.windows.init -> done!');
};


msos.onload_func_start.push(hello.to.windows.init);