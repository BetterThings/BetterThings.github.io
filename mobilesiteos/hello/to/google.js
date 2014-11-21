//
// GOOGLE API
//
/*global
    msos: false,
    jQuery: false,
    hello: false
*/
msos.provide("hello.to.google");

hello.to.google.version = new msos.set_version(13, 10, 31);


hello.to.google.config = {

    google: {

        name: "Google Plus",
        id: msos.config.social.google,

        login: function (p) {
			"use strict";

            // Google doesn't like display=none
            if (p.qs.display === 'none') {
                p.qs.display = '';
            }
        },

        oauth: {
            version: 2,
            auth: "https://accounts.google.com/o/oauth2/auth"
        },

        scope: {
            basic: "https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
            email: '',
            birthday: '',
            events: '',
            photos: 'https://picasaweb.google.com/data/',
            videos: 'http://gdata.youtube.com',
            friends: 'https://www.google.com/m8/feeds',
            files: 'https://www.googleapis.com/auth/drive.readonly',

            publish: '',
            publish_files: 'https://www.googleapis.com/auth/drive',
            create_event: '',

            offline_access: ''
        },

        scope_delim: ' ',

        // API base URI
        base: "https://www.googleapis.com/",

        // Map GET requests
        get: {
            //'me': 'oauth2/v1/userinfo?alt=json',
			'me': 'plus/v1/people/me',
            'me/friends': 'plus/v1/people/me/people/visible?maxResults=@{limit|100}',
            'me/following': 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=@{limit|1000}&start-index=@{start|1}',
            'me/followers': 'https://www.google.com/m8/feeds/contacts/default/full?alt=json&max-results=@{limit|1000}&start-index=@{start|1}',
            'me/share': 'plus/v1/people/me/activities/public?maxResults=@{limit|100}',
            'me/feed': 'plus/v1/people/me/activities/public?maxResults=@{limit|100}',
            'me/albums': 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&max-results=@{limit|100}&start-index=@{start|1}',
            'me/photos': 'https://picasaweb.google.com/data/feed/api/user/default?alt=json&kind=photo&max-results=@{limit|100}&start-index=@{start|1}',
        }
    }
};


hello.to.google.init = function () {
    "use strict";

    msos.console.debug('hello.to.google.init -> start.');

    hello.init(hello.to.google.config);

    msos.console.debug('hello.to.google.init -> done!');
};


msos.onload_func_start.push(hello.to.google.init);