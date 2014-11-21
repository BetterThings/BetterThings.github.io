/**
 * @hello.js
 *
 * HelloJS is a client side Javascript SDK for making OAuth2 logins and subsequent REST calls.
 *
 * @author Andrew Dodson
 * @company Knarly
 *
 * @copyright Andrew Dodson, 2012 - 2013
 * @license MIT: You are free to use and modify this code for any use, on the condition that this copyright notice remains.
 *
 * Highly modified version of hello.js v0.2.0 for use with MobileSiteOS
 */

/*global
	msos: false,
    _: false
*/

var hello = {

    settings: {
        // OAuth 2 authentication defaults
        redirect_uri: msos.config.hellojs_redirect,		// Full uri path including protocal
        response_type: 'token',
        display: 'popup',
        state: '',
        default_service: null,
        force: true
    },

	utils: {

		ut_name: 'hello.utils',

		xhr_request: function () {
			"use strict";

			var req = new XMLHttpRequest();

			if (req.withCredentials !== undefined) {

				// Check for "withCredentials" (Std).
				return req;
			}

			if (XDomainRequest !== undefined) {

				// Or use XDomainRequest (IE)
				req = new XDomainRequest();
				return req;
			}

			return null;
		},

		xhr: function (qs_obj, base_url, callback) {
			"use strict";

			var utils = this,
				r = utils.xhr_request() || null,
				url = '';

			msos.console.debug(this.ut_name + '.xhr -> start.');

			if (r !== null) {

				r.onload = function () {
					var json = {};

					try {
						json = JSON.parse(r.responseText);
					} catch (e) {
						json = {
							error: {
								code: "parse_error",
								message: e.message
							}
						};
						msos.console.error(utils.ut_name + '.xhr - onload -> parse failed: ' + e.message);
					}

					if (r.status === 401) {
						json = {
							error: {
								code: "access_denied",
								message: r.statusText
							}
						};
						msos.console.warn(utils.ut_name + '.xhr - onload -> access_denied: ' + r.statusText);
					}

					callback(
						json || { error: { code: "server_error", message: r.status } }
					);
				};

				r.onerror = function () {
					var json = r.responseText;

					try {
						json = JSON.parse(r.responseText);
					} catch (e) {
						json = {
							error: {
								code: "parse_error",
								message: e.message
							}
						};
						msos.console.error(utils.ut_name + '.xhr - onerror -> parse failed: ' + e.message);
					}

					callback(
						json || { error: { code: "server_error", message: r.status } }
					);
				};

				url = utils.add_qs(base_url, qs_obj);

				// Open the path, async
				r.open('GET', url, true);
				r.send();

			} else {
				msos.console.debug(this.ut_name + '.xhr -> failed, na.');
			}

			msos.console.debug(this.ut_name + '.xhr -> done!');
			return r;
		},

		add_qs: function (url, params) {
			"use strict";

			var x,
				str,
				reg;

			if (msos.config.verbose) {
				msos.console.debug(this.ut_name + '.add_qs -> start, url: ' + url + ', params:', params);
			}

			if (params && !_.isEmpty(params)) {
				for (x in params) {
					if (url.indexOf(x) > -1) {
						str = "[\\?\\&]" + x + "=[^\\&]*";
						reg = new RegExp(str);
						url = url.replace(reg, '');
					}
				}
				url += (url.indexOf('?') > -1 ? "&" : "?") + this.param(params);
			}

			if (msos.config.verbose) {
				msos.console.debug(this.ut_name + '.add_qs -> done, url: ' + url);
			}
			return url;
		},

		param: function (s) {
			"use strict";

			var b,
				a = {},
				c = [],
				m,
				i = 0,
				o,
				x,
				str = '';

			if (msos.config.verbose) {
				msos.console.debug(this.ut_name + '.param -> start.');
			}

			if (typeof (s) === 'string') {

				m = s.replace(/^[\#\?]/, '').match(/([^=\/\&]+)=([^\&]+)/g);
				if (m) {
					for (i = 0; i < m.length; i += 1) {
						b = m[i].split('=');
						a[b[0]] = decodeURIComponent(b[1]);
					}
				}

				if (msos.config.verbose) {
					msos.console.debug(this.ut_name + '.param -> done, object:', a);
				}
				return a;
			}

			o = s;

			if (_.isObject(o)) {

				for (x in o) {
					if (o.hasOwnProperty(x)) {
						c.push([x, o[x] === '?' ? '?' : encodeURIComponent(o[x])].join('='));
					}
				}

				str = c.join('&');
			}

			if (msos.config.verbose) {
				msos.console.debug(this.ut_name + '.param -> done, string: ' + str);
			}
			return str;
		},

		store: function (name, value) {
			"use strict";

			var json = JSON.parse(localStorage.getItem('hello')) || {};

			if (name && value === undefined) {
				return json[name];
			}

			if (name && value === '') {
				try {
					delete json[name];
				} catch (e) {
					json[name] = null;
				}
			} else if (name) {
				json[name] = value;
			} else {
				return json;
			}

			localStorage.setItem('hello', JSON.stringify(json));
			return json;
		},

		append: function (node, attr, target) {
			"use strict";

			var n = typeof (node) === 'string' ? document.createElement(node) : node,
				x,
				y,
				dbug = '';

			msos.console.debug(this.ut_name + '.append -> start.');

			if (typeof (attr) === 'object') {
				if (attr.tagName) {
					target = attr;
				} else {
					for (x in attr) {
						if (attr.hasOwnProperty(x)) {
							if (typeof (attr[x]) === 'object') {
								for (y in attr[x]) {
									if (attr[x].hasOwnProperty(y)) {
										n[x][y] = attr[x][y];
									}
								}
							} else if (x === "html") {
								n.innerHTML = attr[x];
							} else if (!/^on/.test(x)) {
								// IE doesn't like us setting methods with setAttribute
								n.setAttribute(x, attr[x]);
							} else {
								n[x] = attr[x];
							}
						}
					}
				}
			}

			if (target === 'body') {
				dbug = 'body';
				(function self() {
					if (document.body) {
						document.body.appendChild(n);
					} else {
						setTimeout(self, 16);
					}
				}());
			} else if (typeof (target) === 'object') {
				dbug = 'dom object';
				target.appendChild(n);
			} else if (typeof (target) === 'string') {
				dbug = target;
				document.getElementsByTagName(target)[0].appendChild(n);
			} else {
				dbug = 'no target';
			}

			msos.console.debug(this.ut_name + '.append -> done, target: ' + dbug);
			return n;
		},

		merge: function (a, b) {
			"use strict";

			var x,
				r = {};

			if (typeof (a) === 'object' && typeof (b) === 'object') {
				for (x in a) {
					r[x] = a[x];
					if (b[x] !== undefined) { r[x] = this.merge(a[x], b[x]); }
				}
				for (x in b) {
					if (a[x] === undefined) { r[x] = b[x]; }
				}
			} else {
				r = b;
			}
			return r;
		},

		Event: function () {
			"use strict";

			this.parent = {
				events:		this.events,
				findEvents:	this.findEvents,
				parent:		this.parent,
				utils:		this.utils
			};

			this.events = {};

			this.on = function (evt, callback) {

				if (callback && typeof (callback) === 'function') {
					var a = evt.split(/[\s\,]+/),
						i = 0;

					for (i = 0; i < a.length; i += 1) {
						// Has this event already been fired on this instance?
						this.events[a[i]] = [callback].concat(this.events[a[i]] || []);
					}
				}

				return this;
			};

			this.off = function (evt, callback) {

				this.findEvents(
					evt,
					function (name, index) {
						if (!callback || this.events[name][index] === callback) {
							this.events[name].splice(index, 1);
						}
					}
				);

				return this;
			};

			this.emit = function (evt, data) {

				// Get arguments as an Array, knock off the first one
				var args = Array.prototype.slice.call(arguments, 1),
					proto = this;

				args.push(evt);

				// Find the callbacks which match the condition and call
				while (proto && proto.findEvents) {

					proto.findEvents(
						evt,
						function (name, index) {

							// Replace the last property with the event name
							args[args.length - 1] = name;

							// Trigger
							this.events[name][index].apply(this, args);
						}
					);

					proto = proto.parent;
				}

				return this;
			};

			// Easy functions
			this.emitAfter = function () {
				var self = this,
					args = arguments;

				setTimeout(
					function () {
						self.emit.apply(self, args);
					},
					10
				);
				return this;
			};

			this.success = function (suc_cb) {
				return this.on("success", suc_cb);
			};
			this.error = function (err_cb) {
				return this.on("error", err_cb);
			};
			this.failed = function (fail_cb) {
				return this.on("failed", fail_cb);
			};

			this.findEvents = function (evt, callback) {

				var a = evt.split(/[\s\,]+/),
					name,
					i = 0;

				for (name in this.events) {
					if (this.events.hasOwnProperty(name)) {
						if (_.indexOf(a, name) > -1) {
							for (i = 0; i < this.events[name].length; i += 1) {
								// Emit on the local instance of this
								callback.call(this, name, i);
							}
						}
					}
				}
			};
		},

		globalEvent: function (glob_evt_cb, guid) {
			"use strict";

			var utl = this;

			guid = guid || "hellojs_" + parseInt(Math.random() * 1e12, 10).toString(36);

			msos.console.debug(this.ut_name + '.globalEvent -> start, guid: ' + guid);

			// Define the callback function
			window[guid] = function () {
				// Trigger the callback
				var bool = glob_evt_cb.apply(this, arguments);

				msos.console.debug(guid + ' ~~~> start.');

				if (bool) {
					// Remove this handler reference
					try {
						delete window[guid];
						msos.console.debug(guid + ' ~~~> delete: ' + guid);
					} catch (e) {
						msos.console.error(guid + ' ~~~> delete failed, reason: ' + e.message);
					}
				}

				msos.console.debug(guid + ' ~~~> done!');
			};

			msos.console.debug(this.ut_name + '.globalEvent -> done, guid: ' + guid);
			return guid;
		}
	},

    service: function (serv) {
		"use strict";

		// Get/Set the default service
		msos.console.debug('hello.service -> called.');

        if (serv !== undefined) {
            return this.utils.store('sync_service', serv);
        }
        return this.utils.store('sync_service');
    },

    services: {},

    using: function (service) {
		"use strict";

		msos.console.debug('hello.using -> start.');

        // Create self, which inherits from its parent
        var self = Object.create(this);

        // Inherit the prototype from its parent
        self.settings = Object.create(this.settings);

        // Define the default service
        if (service) {
            self.settings.default_service = service;
        }

        // Create an instance of Events
        self.utils.Event.call(self);

		msos.console.debug('hello.using -> done!');
        return self;
    },

    init: function (service, options) {
		"use strict";

		if (msos.config.verbose) {
			msos.console.debug('hello.init -> start, service:', service);
		} else {
			msos.console.debug('hello.init -> start.');
		}

        if (service) {

			this.services = _.extend(this.services, service);

			// Update the default settings with this one.
			if (options) {
				this.settings = _.extend(this.settings, options);
			}

        } else {
			msos.console.warn('hello.init -> no service input.');
		}

		msos.console.debug('hello.init -> done!');
    },

    login: function (p) {
		"use strict";

        var self = this.using(),
            utils = self.utils,
			url,
			provider,
			responded = false,
			callback_id,
			session,
			diff,
			scope,
			responsive = msos.config.size_wide[ msos.config.size],
			windowHeight,
			windowWidth,
			popup,
			timer;

		if (msos.config.verbose) {
			msos.console.debug('hello.login -> start, p:', p);
		} else {
			msos.console.debug('hello.login -> start.');
		}

		p =			_.isObject(p) ? p : {};
		p.options = _.isObject(p.options) ? p.options : {};

        // Merge/override options with app defaults
        p.options = utils.merge(self.settings, p.options);

        // Network
        p.network = self.settings.default_service = p.network || self.settings.default_service;

        // Is our service valid?
        if (!self.services[p.network]) {
            self.emitAfter(
				'error', {
					error: {
						code: 'invalid_network',
						message: p.network
					}
				}
			);
			msos.console.warn('hello.login -> done, network na.');
            return self;
        }

        provider = self.services[p.network];

        callback_id = utils.globalEvent(
			function (obj) {

				if (msos.config.verbose) {
					msos.console.debug('hello.login - cb -> start, obj: ', obj);
				}

				responded = true;

				if (obj.error) {

					msos.console.error('hello.login - cb -> error:', obj.error);

					self.emit(
						"failed",
						{
							error: obj.error
						}
					);

				} else {

					utils.store(obj.network, obj);

					self.emit(
						"auth.success",
						{
							network: obj.network,
							authResponse: obj
						}
					);
				}

				if (msos.config.verbose) {
					msos.console.debug('hello.login - cb -> done!');
				}
			}
		);

        p.qs = {
            client_id:		provider.id,
            response_type:	p.options.response_type,
            redirect_uri:	p.options.redirect_uri,
            display:		p.options.display,
            scope:			'basic',
            state: {
                client_id:		provider.id,
                network:		p.network,
                display:		p.options.display,
                callback:		callback_id,
                state:			p.options.state
            }
        };

        session = utils.store(p.network);
        scope = p.options.scope;

        if (scope && typeof (scope) !== 'string') {
            scope = scope.join(',');
        }

        scope = (scope ? scope + ',' : '') + p.qs.scope;

        if (session && session.scope) {
            scope += "," + session.scope.join(",");
        }

        // Save in the State
        p.qs.state.scope = _.uniq(scope.split(/[,\s]+/));

        // Map replace each scope with the providers default scopes
        p.qs.scope = scope.replace(
			/[^,\s]+/ig,
			function (m) {
				return provider.scope[m] || '';
			}
		).replace(/[,\s]+/ig, ',');

        // Remove duplication and empty spaces
        p.qs.scope = _.uniq(p.qs.scope.split(/,+/)).join(provider.scope_delim || ',');

        if (p.options.force === false) {

            if (session
			 && session.access_token
			 && session.expires
			 && session.expires > ((new Date()).getTime() / 1e3)) {
                // What is different about the scopes in the session vs the scopes in the new login?
                diff = _.difference(session.scope || [], p.qs.state.scope || []);

                if (diff.length === 0) {

					msos.console.debug('hello.login -> found user access_token.');

                    self.emitAfter(
						"auth.success",
						{
							network: p.network,
							authResponse: session
						}
					);

                    // Nothing has changed
                    return self;
                }
            }
        }

        // Add OAuth to state
        if (provider.oauth) {
            p.qs.state.oauth = provider.oauth;
        }

        // Convert state to a string
        p.qs.state = JSON.stringify(p.qs.state);

        // Override login querystrings from auth_options
        if (provider.login && typeof (provider.login) === 'function') {
            // Format the paramaters according to the providers formatting function
            provider.login(p);
        }

        url = utils.add_qs(provider.oauth.auth, p.qs);

		msos.console.debug('hello.login -> display: ' + p.options.display || 'undefined');	// undef. is a valid response

        if (p.options.display === 'none') {

            utils.append(
				'iframe', {
					src: url,
					style: {
						position:	'absolute',
						left:		"-1000px",
						bottom:		0,
						height:		'1px',
						width:		'1px'
					}
				},
				'body'
			);

        } else if (p.options.display === 'popup') {

            windowHeight =	p.options.window_height	|| 520;
            windowWidth =	p.options.window_width	|| (responsive < 520 ? responsive : 520);

            // Trigger callback
            popup = window.open(
				url,
				callback_id + '_window',
				"resizeable=true,height=" + windowHeight + ",width=" + windowWidth + ",left=" + ((window.innerWidth - windowWidth) / 2) + ",top=" + ((window.innerHeight - windowHeight) / 2)
			);

            popup.focus();

            timer = setInterval(
				function () {
					if (popup.closed) {
						clearInterval(timer);
						if (!responded) {
							self.emit(
								"failed",
								{
									error: {
										code: "login_cancelled",
										message: p.network
									}
								}
							);
						}
					}
				},
				100
			);
        } else {
            window.location = url;
        }

		msos.console.debug('hello.login -> done!');
        return self;
    },

    logout: function (p) {
		"use strict";

        var self = this.using(),
			x;

		p = _.isObject(p) ? p : {};

		if (msos.config.verbose) {
			msos.console.debug('hello.logout -> start, p:', p);
		} else {
			msos.console.debug('hello.logout -> start.');
		}

        // Netowrk
        p.network = p.network || self.settings.default_service;

        if (!self.services[p.network]) {
            self.emitAfter(
				"error", {
					error: {
						code:		'invalid_network',
						message:	p.network
					}
				}
			);
			msos.console.error('hello.logout -> done, invalid network.');
            return self;
        }

        if (self.utils.store(p.network)) {

            // Trigger a logout callback on the provider
            if (typeof (self.services[p.network].logout) === 'function') {
                self.services[p.network].logout(p);
            }

            // Remove from the store
            self.utils.store(p.network, '');

			if (msos.config.verbose) {
				msos.console.debug('hello.logout -> logged out:' + p.network);
			}

        } else if (p.network === 'all') {

			if (msos.config.verbose) {
				msos.console.debug('hello.logout -> logging out of all services.');
			}

            for (x in self.services) {
                if (self.services.hasOwnProperty(x)) {
                    self.logout(x);
                }
            }

            // remove the default
            self.service(false);

        } else {

            self.emitAfter(
				"error",
				{
					error: {
						code: 'invalid_session',
						message: p.network
					}
				}
			);

			msos.console.error('hello.logout -> missing a session for: ' + p.network);
            return self;
        }

        // Success, so trigger successful logout event
        self.emitAfter(
			"logout.success",
			true
		);

		msos.console.debug('hello.logout -> done!');
        return self;
    },

    getAuthResponse: function (network) {
		"use strict";

		msos.console.debug('hello.getAuthResponse -> start.');

        // If the service doesn't exist
        network = network || this.settings.default_service;

        if (!network || !(this.services[network])) {
            this.emit(
				"error", {
					error: {
						code:		'invalid_network',
						message:	network || 'na'
					}
				}
			);
			msos.console.error('hello.getAuthResponse -> done, invalid network.');
            return null;
        }

		msos.console.debug('hello.getAuthResponse -> done!');
        return this.utils.store(network) || null;
    },

    events: {}
};

// Extend the hello object with its own event instance
hello.utils.Event.call(hello);

hello.api = function (p) {
	"use strict";

	msos.console.debug('hello.api -> start.');

	// self: an object which inherits its parent as the prototype, and constructs a new event chain.
    var self = this.using(),
        utils = self.utils,
		api_cb,
		o;

    p.path = (p.path || 'me').toLowerCase();
	p.network =	 p.network || self.settings.default_service || 'na';

    o = self.services[p.network] || undefined;

    if (!o) {
        self.emitAfter(
			"error",
			{
				error: {
					code: "invalid_network",
					message: p.network
				}
			}
		);
		msos.console.error('hello.api -> network na.');
        return self;
    }

	self.settings.default_service = p.network;

	if (msos.config.verbose) {
		msos.console.debug('hello.api -> network object:', o);
	}

    api_cb = function (r) {

		msos.console.debug('hello.api - api_cb -> start.');

		// Normalize error reporting (see individual network config's)
		if (o.error) { o.error(r); }

		self.emit(
			"complete " + (!r || r.error ? 'error' : 'success'),
			r
		);

		msos.console.debug('hello.api - api_cb -> done!');
	};

    function processPath(path) {
		var reg = /[\?\&]([^=&]+)(=([^&]+))?/ig,
			data_array,
			network_path,
			network_url,
			session = self.getAuthResponse(p.network),
			service = self.services[p.network],
			token = (session ? session.access_token : null),
			qs = { 'access_token': token || '' },
			cors_req;

		msos.console.debug('hello.api - processPath -> start, path: ' + path);

        while ((data_array = reg.exec(path))) { p.data[data_array[1]] = data_array[3]; }

		path = path.replace(/\?.*/, '');

        network_path = o.get[path] || path;

		// Format the string if it needs it
		network_path = network_path.replace(
			/\@\{([a-z\_\-]+)(\|.+?)?\}/gi,
			function (m, key, defaults) {
				var val = defaults ? defaults.replace(/^\|/, '') : '';

				if (p.data[key]) {
					val = p.data[key];
					delete p.data[key];
				} else {
					self.emitAfter(
						"error",
						{
							error: {
								code: "invalid_attribute",
								message: key
							}
						}
					);
				}
				return val;
			}
		);

		network_url = o.base + network_path;

		// Add any included data to query string object
		if (!_.isEmpty(p.data)) { qs = utils.merge(qs, p.data); }

		// Modify query string object for specific case(s)
		if (o.querystring) { o.querystring(qs); }

		if (o.jsonp) {

			msos.console.debug('hello.api - processPath -> jsonp');

			// Some don't allow XMLHttpRequest (instagram)
			o.jsonp(
				qs,
				network_url,
				api_cb
			);

		} else {

			msos.console.debug('hello.api - processPath -> XMLHttpRequest');

			// Std: Use XMLHttpRequest
			cors_req = utils.xhr(
				qs,
				network_url,
				api_cb
			);

			if (cors_req === null) {

				self.emitAfter(
					"error",
					{
						error: {
							code: 'browser_warning',
							message: navigator.userAgent
						}
					}
				);
				msos.console.warn('hello.api - processPath -> browser too old.');
			}
		}

		msos.console.debug('hello.api - processPath -> done!');
    }

    if (!o.get[p.path]) {

        return self.emitAfter(
			"error",
			{
				error: {
					code: 'invalid_path',
					message: p.path
				}
			}
		);
		msos.console.error('hello.api -> path: ' + p.path + ' na in: ' + p.network);

    } else {

		// Given the path trigger the fix
		processPath(p.path);
	}

	msos.console.debug('hello.api -> done!');

    return self;
};