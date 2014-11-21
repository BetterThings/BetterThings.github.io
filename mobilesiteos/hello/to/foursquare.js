//
// FourSquare
//
/*global
    msos: false,
    jQuery: false,
    hello: false
*/
msos.provide("hello.to.foursquare");

hello.to.foursquare.version = new msos.set_version(14, 10, 14);


hello.to.foursquare.config = {
    foursquare: {

        name: 'FourSquare',
        id: msos.config.social.foursquare,

        oauth: {
            version: 2,
            auth: 'https://foursquare.com/oauth2/authenticate',
			grant : 'https://foursquare.com/oauth2/access_token'
        },

        scope: {},

		base: 'https://api.foursquare.com/v2/',

        // Alter the querystring
        querystring: function (qs) {
			"use strict";

            var token = qs.access_token;

            delete qs.access_token;
            qs.oauth_token = token;
            qs.v = 20121125;
        },

        get: {
            'me':			'users/self',
            'me/friends':	'users/self/friends',
            'me/followers':	'users/self/friends',
            'me/following':	'users/self/friends'
        },

		error: function (o) {
			"use strict";

			if (o.meta && o.meta.code === 400) {
				o.error = {
					code: "access_denied",
					message: o.meta.errorDetail
				};
			}
		}
    }
};


hello.to.foursquare.init = function () {
    "use strict";

    msos.console.debug('hello.to.foursquare.init -> start.');

    hello.init(hello.to.foursquare.config);

    msos.console.debug('hello.to.foursquare.init -> done!');
};

msos.onload_func_start.push(hello.to.foursquare.init);