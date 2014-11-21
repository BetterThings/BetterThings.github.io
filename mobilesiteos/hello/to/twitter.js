//
// Twitter
//

/*global
    msos: false,
    jQuery: false,
    hello: false
*/

msos.provide("hello.to.twitter");

hello.to.twitter.version = new msos.set_version(13, 10, 31);


hello.to.twitter.config = {

    'twitter': {

        name: "Twitter",
        id: msos.config.social.twitter,

        oauth: {
            version: "2",
            token: 'https://api.twitter.com/oauth2/token',
        },

        scope: {},

        autorefresh: false,

        base: "https://api.twitter.com/1.1/",

        get: {
            "me": 'account/verify_credentials.json',
            "me/friends": 'friends/list.json?count=@{limit|200}',
            "me/following": 'friends/list.json?count=@{limit|200}',
            "me/followers": 'followers/list.json?count=@{limit|200}',

            "me/share": 'statuses/user_timeline.json?count=@{limit|200}'
        },

		error: function (o) {
			"use strict";

			if (o.errors) {
				o.error = {
					code: "request_failed",
					message: o.errors[0].message
				};
			}
		}
    }
};


hello.to.twitter.init = function () {
    "use strict";

    msos.console.debug('hello.to.twitter.init -> start.');

    hello.init(hello.to.twitter.config);

    msos.console.debug('hello.to.twitter.init -> done!');
};

msos.onload_func_start.push(hello.to.twitter.init);