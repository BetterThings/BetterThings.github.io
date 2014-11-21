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
 */

/*global
	msos: false,
	hello: false,
    _: false
*/

(function (_hello, _win) {
	"use strict";

    var tmp_at = '',
		utils = _hello.utils,
		_win_parent = _win.opener || _win.parent,
		_win_loc = _win.location,
		relocate = function (path) {
			if (_win_loc.assign) {
				_win_loc.assign(path);
			} else {
				_win_loc.href = path;
			}
		},
		p = {},
		a;

    // Make sure we have a window name
	_win.name = _win.name || 'child_' + parseInt(Math.random() * 1e12, 10).toString(36);

	// Lets note where this is coming from
	tmp_at = _win.name + ' - authenticating 8==> ';

	msos.console.debug(tmp_at + 'start, location: ' + _win_loc);

	function closeWindow() {

		try {
			_win.close();
		} catch (e) {
			msos.console.warn(tmp_at + 'closeWindow: failed!');
		}

		// IOS bug wont let us close a popup if still loading
		if (_win.addEventListener) {
			_win.addEventListener('load', function () { _win.close(); });
		}
	}

    function auth_cb(network, obj) {

		var tmp_ac = 'auth_cb -> ',
			cb;

		msos.console.debug(tmp_at + tmp_ac + 'start.');

        // Trigger the callback on the parent
        utils.store(obj.network, obj);

        // This is a popup so
        if (!(p.display) || p.display !== 'page') {

            if (_win_parent) {

                cb = obj.callback;

                delete obj.callback;

				msos.console.debug(tmp_at + tmp_ac + 'callback: ' + cb);

				// Emit global events
				try {
					_win_parent[cb](obj);
				} catch (e) {
					msos.console.error(tmp_at + tmp_ac + 'callback: ' + cb + ', failed: ', e);
				}

                // Update store
                utils.store(obj.network, obj);

            } else {
				msos.console.warn(tmp_at + tmp_ac + 'no parent.');
			}

            closeWindow();

        } else {
			msos.console.debug(tmp_at + tmp_ac + 'skipped page.');
		}

		msos.console.debug(tmp_at + tmp_ac + 'done!');
    }

    // FACEBOOK is returning auth errors within as a query_string.
    // SoundCloud has the state in the querystring and the token in the hashtag.
    p = utils.merge(
		utils.param(_win_loc.search	|| ''),
		utils.param(_win_loc.hash	|| '')
	);

    if (p && p.state) {

        // remove any addition information
        // e.g. p.state = 'facebook.page';
        try {
            a = JSON.parse(p.state);
            p = utils.merge(p, a);
        } catch (e) {
            _hello.emit(
				"error",
				{
					error: {
						code: "decode_state",
						message: e.message
					}
				}
			);
        }

        if (p.access_token && p.network) {

            if (!p.expires_in || parseInt(p.expires_in, 10) === 0) {
                p.expires_in = 0;
            }

            p.expires_in = parseInt(p.expires_in, 10);
            p.expires = ((new Date()).getTime() / 1e3) + (p.expires_in || (60 * 60 * 24 * 365));

            _hello.service(p.network);

            auth_cb(p.network, p);

        } else if (p.error && p.network) {

            p.error = {
                code: p.error,
                message: p.error_message || p.error_description
            };

            auth_cb(p.network, p);
        }

        if (p && p.callback && p.result) {
            // trigger a function in the parent
            if (_win.parent[p.callback]) {
                _win.parent[p.callback](JSON.parse(p.result));
            }
        }

    } else if (p && p.oauth_redirect) {
		relocate(decodeURIComponent(p.oauth_redirect));
	} else {
		msos.console.warn(tmp_at + 'no query returned.');
	}

	msos.console.debug(tmp_at + 'done, window: ' + _win.name);

}(hello, window));