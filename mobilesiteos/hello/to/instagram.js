//
// Instagram
//

/*global
    msos: false,
    jQuery: false,
    hello: false,
    _: false
*/

msos.provide("hello.to.instagram");

hello.to.instagram.version = new msos.set_version(14, 10, 14);


hello.to.instagram.config = {

	instagram: {

		name: 'Instagram',
		id: msos.config.social.instagram,

		login: function (p) {
			"use strict";
			// Instagram throws errors like "Javascript API is unsupported" if the display is 'popup'.
			p.qs.display = '';
		},

		oauth: {
			version: 2,
			auth: 'https://instagram.com/oauth/authorize/'
		},

		scope: {
			basic: 'basic',
			friends: 'relationships'
		},

		scope_delim : ' ',

		base: 'https://api.instagram.com/v1/',

		get: {
			'me': 'users/self',
			'me/feed': 'users/self/feed?count=@{limit|100}',
			'me/photos': 'users/self/media/recent?min_id=0&count=@{limit|100}',
			'me/friends': 'users/self/follows?count=@{limit|100}',
			'me/following': 'users/self/follows?count=@{limit|100}',
			'me/followers': 'users/self/followed-by?count=@{limit|100}'
		},

		error: function (o) {
			"use strict";

			if (o && o.meta && o.meta.error_type) {
				o.error = {
					code: o.meta.error_type,
					message: o.meta.error_message
				};
			}
		},

		jsonp: function (qs_obj, base_url, callback) {
			"use strict";

			var temp_jp = 'hello.to.instagram.config.jsonp -> ',
				utils = hello.utils,
				head = document.getElementsByTagName('head')[0],
				script,
				result = {
					error: {
						message: 'server error',
						code: 'server_error'
					}
				},
				cb = _.once(
					function () {
						callback(result);
						head.removeChild(script);
					}
				),
				jsonp_cb_id = utils.globalEvent(
					function (json) {
						result = json;
						return true; // mark callback as done
					}
				),
				url = '';

			msos.console.debug(temp_jp + 'start.');

			// Assign the callback name
			qs_obj.callback = jsonp_cb_id;

			url = utils.add_qs(base_url, qs_obj);

			script = utils.append(
				'script',
				{
					id: jsonp_cb_id,
					name: jsonp_cb_id,
					src: url,
					async: true,
					onload: cb,
					onerror: cb,
					onreadystatechange: function () {
						if (/loaded|complete/i.test(this.readyState)) {
							cb();
						}
					}
				}
			);

			setTimeout(
				function () {
					result = {
						error: {
							message: 'timeout',
							code: 'timeout'
						}
					};
					cb();
				},
				20000
			);

			head.appendChild(script);

			msos.console.debug(temp_jp + 'done.');
		}
	}
};


hello.to.instagram.init = function () {
    "use strict";

    msos.console.debug('hello.to.instagram.init -> start.');

    hello.init(hello.to.instagram.config);

    msos.console.debug('hello.to.instagram.init -> done!');
};

msos.onload_func_start.push(hello.to.instagram.init);