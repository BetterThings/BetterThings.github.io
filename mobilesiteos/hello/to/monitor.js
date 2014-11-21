
/*global
    msos: false,
    jQuery: false,
    hello: false
*/

msos.provide("hello.to.monitor");

hello.to.monitor.version = new msos.set_version(14, 10, 14);


// Start monitoring
(function (_hello, _win) {
	"use strict";

    // Monitor for a change in state and fire
    var tmp_mt = ' - monitoring 8==> ',
		old_session = {},
        refresh_called = {},
		self_count = 0,
		self_timeout = 600000;	// Default checking every 10 minutes

	_win.name = _win.name || 'parent_window';

	// Let ref. where this script is
	tmp_mt = _win.name + ' - monitoring 8==> ';

	msos.console.debug(tmp_mt + 'start.');

    (function check() {

        var CURRENT_TIME = ((new Date()).getTime() / 1e3),
			name,
			session,
			oldsess,
			cb,
			checked = 0,
			loaded = 0,
			emit = function (event_name) {
                _hello.emit(
					"auth." + event_name,
					{
						network: name,
						authResponse: session
					}
				);
            };

		self_count += 1;
		msos.console.debug(tmp_mt + 'check -> start, count: ' + String(self_count));

        // Loop through the services
        for (name in _hello.services) {

            if (_hello.services.hasOwnProperty(name)
			 && _hello.services[name].id) {

				checked += 1;

                // Get session
                session =	_hello.utils.store(name) || {};
                oldsess =	old_session[name] || {};

				if (msos.config.verbose) {
					msos.console.debug(tmp_mt + 'check -> loop services, session:', session);
				}

                if (session
				 && session.callback) {
					if (_.isString(session.callback)) {

						cb = session.callback;

						delete session.callback;

						// Update store (removing the callback id)
						_hello.utils.store(name, session);

						// Emit global events
						try {
							_win[cb](session);
						} catch (e) {
							msos.console.error(tmp_mt + 'check -> execute callback: ' + cb + ', failed:', e);
						}

					} else {
						msos.console.warn(tmp_mt + 'check -> callback is not a string.');
					}
				}

                if (session.expires
				 && session.expires < CURRENT_TIME) {

					msos.console.debug(tmp_mt + 'check -> expired');

                    if (!refresh_called[name]) {
                        // Try to auto login
                        _hello.login(
							{
								network: name,
								options: {
									display: 'none',
									force: false
								}
							}
						);

						refresh_called[name] = true;
						self_timeout = 600000;	// Reset the timeout to self check every 10 min.

                    } else {
                        emit('expired');
                    }

                } else if (oldsess.access_token === session.access_token && oldsess.expires === session.expires) {
					if (msos.config.verbose) {
						msos.console.debug(tmp_mt + 'check -> no change');
					}
					refresh_called[name] = false;
					loaded += 1;
                } else if (!session.access_token && oldsess.access_token) {
					if (msos.config.verbose) {
						msos.console.debug(tmp_mt + 'check -> logout');
					}
                    emit('logout');
					old_session[name] = session;
                } else if (session.access_token && !oldsess.access_token) {
					if (msos.config.verbose) {
						msos.console.debug(tmp_mt + 'check -> login');
					}
					emit('success');
					old_session[name] = session;
                } else if (session.expires !== oldsess.expires) {
					if (msos.config.verbose) {
						msos.console.debug(tmp_mt + 'check -> update');
					}
                    emit('update');
					old_session[name] = session;
                }

				if (session.expires
				 && session.expires > CURRENT_TIME) {
					if (msos.config.verbose) {
						msos.console.debug(tmp_mt + 'check -> name: ' + name + ', expires in: ' + String(parseInt((session.expires - CURRENT_TIME) / 60, 10)) + ' min.');
					}
					// We check more often when we get nearer a session expiration (the .8 part)
					if ((session.expires - CURRENT_TIME) < (self_timeout / 1e3)) {
						self_timeout = (session.expires - CURRENT_TIME) * 1e3 * 0.8;
					}
				}
            }
        }

		if ((loaded < checked) && (self_count < 11)) {
			// Check for up to 10, 1 sec. intervals
			setTimeout(check, 1000);
		} else {
			// Never go below 1 sec.
			self_timeout = self_timeout < 1000 ? 1000 : self_timeout;

			msos.console.debug(tmp_mt + 'check -> timeout: ' + String(self_timeout));
			setTimeout(check, self_timeout);
		}

		msos.console.debug(tmp_mt + 'check -> done!');

    }());

	msos.console.debug(tmp_mt + 'done!');

}(hello, window));