/* Backbone API: Facebook
 * Source: https://github.com/backbone-api/facebook
 *
 * Created by Makis Tracend (@tracend)
 * Distributed through [Makesites.org](http://makesites.org)
 * Released under the [MIT license](http://makesites.org/licenses/MIT)
 */

/*global
    msos: false,
    jQuery: false,
    Backbone: false,
    _: false,
    FB: false
*/

msos.provide("msos.facebook");

msos.facebook.version = new msos.set_version(14, 5, 10);


// Assuming that Facebook JS lib is loaded...
(function (_, Backbone) {
	"use strict";

	// Constants
	var temp_fb = 'msos.facebook',
		Facebook = new Backbone.Model({			// Base model - mainly used for setup options
			api: "https://graph.facebook.com",
			appId: false,
			uri: false
		}),
		token = new Backbone.Model.extend({}),
		Sync = null,
		getToken = null,
		isFan = null,
		Model = null,
		Collection = null,
		View = null;

	if (!window.FB) {
		msos.console.warn(temp_fb + ' -> Facebook api is missing!');
		return;
	}

	// Namespace definition
	Facebook.Models = {};
	Facebook.Collections = {};
	Facebook.Views = {};


	// Helpers
	// Sync method
	Sync = function (method, model, options) {

		var url = (this.url instanceof Function) ? this.url() : this.url,
			params = {},
			token = this.getToken();	// add access token if available

		if (token) {
			if (url instanceof Object) {
				url.access_token = token;
			} else {
				url += (url.search(/\?/) > -1) ? "&access_token=" + token : "?access_token=" + token;
			}
		}

		FB.api(
			url,
			method,
			function (response) {
				var data = response.data || response;
				options.success(data);
			}
		);
	};

	getToken = function () {
		// first priority have the local options
		if (this.options
		 && this.options.access_token) {
			return this.options.access_token;
		}

		if (!_.isUndefined(token.get("accessToken"))) {
			return token.get("accessToken");
		}

		return false;
	};


	// Models

	// - Main Constructor
	Model = Backbone.Model.extend({

		// available options
		options: {
			access_token : false
		},

		initialize: function (model, options) {
			// fallbacks
			options = options || {};
			this.options = _.extend(this.options, options);

			// auto-fetch if requested...
			if (options.fetch) { this.fetch(); }
		},

		fetch: function (method, model, options) {
			var self = this;

			if (this.getToken()) {
				// we'll be using the supplied access token
				Backbone.Model.prototype.fetch.call(self);
			} else {
				FB.getLoginStatus(
					function (response) {
						if (response.status === "connected") {
							// save token
							token.set(response.authResponse);
							// continue with request
							Backbone.Model.prototype.fetch.call(self);
						}
					}
				);
			}
		},

		sync: Sync,

		getToken: getToken
	});

	Facebook.Models.User = Model.extend({
		defaults: {}
	});

	Facebook.Models.Feed = Model.extend({
		defaults: {}
	});

	Facebook.Models.Post = Model.extend({
		defaults: {
			method: "feed",
			link: "",
			picture: "",
			name: "",
			caption: "",
			description: ""
		}
	});

	Facebook.Models.Page = Model.extend({
		defaults: {
			method: "oauth",
			client_id: false,
			redirect_uri: ""
		},
		isFan: function (uid) {
			uid = uid || "me()";
			return (new isFan({ id : this.id, uid : uid })).fetch();
		}
	});

	Facebook.Models.Tab = Model.extend({
		defaults: {},
		url: function () {
			return Facebook.get("api") + "/" + this.page + "/tabs/app_" + this.id;
		},
		initialize: function (data, options) {
			this.page = data.page;
			this.id = Facebook.get("appId");
		}
	});

	Facebook.Models.Link = Model.extend({
		defaults: {
			url: window.location.href,
			normalized_url: "",
			share_count: 0,
			like_count: 0,
			comment_count: 0,
			total_count: 0,
			commentsbox_count: 0,
			comments_fbid: 0,
			click_count: 0
		},

		url: function () {
			return {
				method: 'fql.query',
				query: "SELECT url,normalized_url,share_count,like_count,comment_count,total_count,commentsbox_count,comments_fbid,click_count FROM link_stat WHERE url ='" + this.get("url") + "'"
			};
		},

		parse: function (response) {
			// error control?
			if (response instanceof Array) {
				// use only the first item
				return response.shift();
			}

			return response;
		}
	});

	Facebook.Models.Login = Model.extend({
		defaults: {
			method: "oauth",
			client_id: false		//fb_appId
		}
	});

	Facebook.Models.AddToPage = Model.extend({
		defaults: {
			method: 'pagetab'
		}
	});

	// Me is an extension of the user
	Facebook.Models.Me = Facebook.Models.User.extend({
		url: function () {
			return Facebook.get("api") + "/me";
		},

		defaults: {
			id: "me"
		},

		options: {
			auth: false,
			// see https://developers.facebook.com/docs/authentication/permissions/
			scope: [], // fb permissions
			autosync: true, // auto fetch profile after login
			protocol: location.protocol
		},

		oauth: null,

		initialize: function () {
			var self = this;
			FB.Event.subscribe(
				'auth.authResponseChange',
				function (e) {
					self.onLoginStatusChange(e);
				}
			);
			return Backbone.API.Facebook.Models.User.prototype.initialize.apply(this, arguments);
		},

		login: function (callback) {
			callback =  callback || function () {};
			FB.login(
				callback,
				{ scope: this.options.scope.join(',') }
			);
		},

		logout: function () { FB.logout(); },

		onLoginStatusChange: function (response) {
			// only execute once?
			if (this.options.auth === response.status) {
				return false;
			}

			var event;

			if (response.status === 'not_authorized') {
				event = 'facebook:unauthorized';
				// login logic
			} else if (response.status === 'connected') {
				event = 'facebook:connected';
				// save request for later...
				this.request = FB.getAuthResponse();
				// copy access token
				this.oauth = {
					access_token : this.request.accessToken,
					expiry : (new Date()).getTime() + this.request.expiresIn
				};

				if (this.options.autosync === true) { this.fetch(); }
			} else {
				event = 'facebook:disconnected';
			}

			this.trigger(event, this, response);
			this.options.auth = response.status;

			return true;
		}

	});

	Facebook.Models.WebPage = Model.extend({

		defaults: {
			"shares": 0,
			"comments": 0,
			"type": "website",
			"is_scraped": false
		},

		options: {},

		url: function () {
			return Facebook.get("api") + "/?ids=" + this.options.page;
		},

		parse: function (data) {
			var key = '',
				model = {};

			// data arrives in a sub-object with the URL as the key - pick the first element
			for (key in data) {
				model = data[key];
				break; // "break" because this is a loop
			}

			data = model;
			return data;
		}
	});


	// Collections

	// - Main Constructor
	Collection = Backbone.Collection.extend({

		bc_name: ' - Collection -> ',

		// available options
		options: {
			access_token : false
		},

		initialize: function (model, options) {
			// fallbacks
			options = options || {};
			this.options = _.extend(this.options, options);

			// auto-fetch if requested...
			if (options.fetch) { this.fetch(); }
		},

		fetch: function (method, model, options) {
			var self = this;

			if (this.getToken()) {
				// we'll be using the supplied access token
				Backbone.Collection.prototype.fetch.call(self);
			} else {
				FB.getLoginStatus(
					function (response) {
						if (response.status === "connected") {
							// save token
							token.set(response.authResponse);
							// continue with request
							Backbone.Collection.prototype.fetch.call(self);
						}
					}
				);
			}
		},

		sync: Sync,

		parse: function (response) {

			if (msos.config.verbose) {
				msos.console.debug(temp_fb + this.bc_name + 'facebook data:', response);
			}

			//is uid always the id? apparently...
			var data = _.map(
					response,
					function (result) {
						if (result.uid) {
							result.id = result.uid;
							delete result.uid;
						}
						return result;
					}
				);

			return data;
		},

		getToken: getToken
	});

	Facebook.Collections.Friends = Collection.extend({

		model: Facebook.Models.User,

		url: function () {
			return {
				method: 'fql.query',
				query: 'Select name, uid from user where is_app_user = 1 and uid in (select uid2 from friend where uid1 = me()) order by concat(first_name,last_name) asc'
			};
		}
	});

	Facebook.Collections.Feed = Collection.extend({

		options: {},

		model: Facebook.Models.Feed,

		url: function () {
			// creating an object of parameters
			var params = {
					method: 'fql.query',
					query: "select message,description,attachment,created_time from stream where source_id ='" + this.id + "' limit " + this.num
				};

			// add access token if available
			if (this.options.access_token) {
				// we'll be using the supplied access token
				params.access_token = this.options.access_token;
			}

			return params;
		},

		initialize: function (model, options) {
			// parameters
			this.id =	options.id || false;
			this.user = options.user || null;
			this.num =	options.num || 10;

			// auto-fetch if requested...
			if (options.fetch) { this.fetch(); }
		}
	});


	// Views

	// - Main Constructor
	View = Backbone.View.extend({

		template: FB.ui,

		initialize: function (options) {
			// fallback
			options = options || {};

			if (options.callback) {
				this.callback = options.callback;
			}

			return this.render();
		},

		render: function () {

			this.template(this.model.toJSON(), this.callback);
			// preserve chainability?
			return this;

		},

		callback : function () {}
	});

	Facebook.Views.Post = View.extend({
		callback : function (response) {
			// document.getElementById('msg').innerHTML = "Post ID: " + response['post_id'];
		}
	});

	Facebook.Views.Login = View.extend({

		bv_name: ' - Facebook.Views.Login -> ',

		initialize: function (options) {

			this.model = new Backbone.API.Facebook.Models.Login({
				client_id: Backbone.API.Facebook.get("appId")	// fb_appId
			});

			return View.prototype.initialize.call(this, options);
		},

		callback: function (response) {
			if (response !== undefined) {
				if (response.session) {
					window.top.location.href = this.model.get("redirect_uri");
				} else {

					msos.console.warn(temp_fb + this.bv_name + 'no facebook session!');

					setTimeout(function () { window.location.reload(); }, 400);
				}
			} else {
				// denied access
				msos.console.warn(temp_fb + this.bv_name + 'denied access!');
			}
		}
	});

	Facebook.Views.AddToPage = View.extend({

		initialize: function (options) {
			this.model = new Backbone.API.Facebook.Models.AddToPage();

			return View.prototype.initialize.call(this, options);
		}
	});


	// Note: Always ask for the user_likes permission before calling any of the above to
	// make sure you get a correct result
	isFan = Model.extend({
		url:  function () {
			return {
				method: 'fql.query',
				query: 'select uid from page_fan where uid=' + this.options.uid + ' and page_id=' + this.options.id
			};
		},

		parse: function (response) {
			// check if there is a data response
			return {
				fan : !(_.isEmpty(response.data))
			};
		}
	});

	msos.facebook.inst = Facebook;

}(this._, this.Backbone));