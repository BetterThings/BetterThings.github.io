//
// Facebook
//

/*global
    msos: false,
    jQuery: false,
    hello: false
*/

msos.provide("hello.to.facebook");

hello.to.facebook.version = new msos.set_version(14, 10, 14);


hello.to.facebook.config = {

    facebook: {

        name: 'Facebook',
        id: msos.config.social.facebook,

        oauth: {
            version: 2,
            auth: 'https://www.facebook.com/dialog/oauth/',
            grant: 'https://graph.facebook.com/oauth/access_token'
        },

		logout: function (callback) {
			// Assign callback to a global handler
			var callbackID = hello.utils.globalEvent(callback),
                redirect = encodeURIComponent(hello.settings.redirect_uri + "?" + hello.utils.param({ callback: callbackID, result: JSON.stringify({ force: true }), state : '{}' })),
                token = (hello.utils.store('facebook') || {}).access_token;

            hello.utils.iframe('https://www.facebook.com/logout.php?next=' + redirect + '&access_token=' + token);

			if (!token) { return false; }

            return true;
		},

        // Authorization scopes
        scope: {
            basic: '',
            email: 'email',
            birthday: 'user_birthday',
            events: 'user_events',
            photos: 'user_photos,user_videos',
            videos: 'user_photos,user_videos',
            friends: '',
            files: 'user_photos,user_videos',

            publish_files: 'user_photos,user_videos,publish_stream',
            publish: 'publish_stream',

            offline_access: 'offline_access'
        },

        // API Base URL
        base: 'https://graph.facebook.com/',

        // Map GET requests
        get: {
            'me': 'me',
            'me/friends': 'me/friends',
            'me/following': 'me/friends',
            'me/followers': 'me/friends',
            'me/share': 'me/feed',
            'me/files': 'me/albums',
            'me/albums': 'me/albums',
            'me/album': '@{id}/photos',
            'me/photos': 'me/photos',
            'me/photo': '@{id}'
        }
    }
};


hello.to.facebook.init = function () {
    "use strict";

    msos.console.debug('hello.to.facebook.init -> start.');

    hello.init(hello.to.facebook.config);

    msos.console.debug('hello.to.facebook.init -> done!');
};

msos.onload_func_start.push(hello.to.facebook.init);