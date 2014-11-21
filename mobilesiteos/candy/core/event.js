/** File: event.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Patrick Stadler <patrick.stadler@gmail.com>
 *   - Michael Weibel <michael.weibel@gmail.com>
 *
 * Copyright:
 *   (c) 2011 Amiado Group AG. All rights reserved.
 */

/*global
    msos: false,
    jQuery: false,
    candy: false,
    Strophe: false
*/

msos.provide("candy.core.event");
msos.require("candy.core.action");
msos.require("candy.core.chatuser");
msos.require("candy.core.chatroom");
msos.require("candy.util");

candy.core.event.version = new msos.set_version(13, 6, 25);


candy.core.event.init = function () {
	"use strict";

	var temp_ce = 'candy.core.event',
		_ccevt = candy.core.event,
		_observers = {};

	_ccevt.addObserver = function (key, obj) {
		msos.console.debug(temp_ce + '.addObserver -> called, for: ' + key);

		if (_observers[key] === undefined) {
			_observers[key] = [];
		}
		_observers[key].push(obj);
	};

	_ccevt.notifyObservers = function (key, arg) {
		msos.console.debug(temp_ce + '.notifyObservers -> start, for: ' + key);

		var observer = _observers[key],
			i;

		for (i = observer.length - 1; i >= 0; i -= 1) {
			observer[i].update(_ccevt, arg);
		}
		msos.console.debug(temp_ce + '.notifyObservers -> done,  for: ' + key);
	};

	_ccevt.Strophe = {

		Connect: function (status) {
			var action = '';

			msos.console.debug(temp_ce + '.Strophe.Connect -> start.');

			switch (status) {
				case Strophe.Status.CONNECTING:
					action += ' Connecting';
					break;

				case Strophe.Status.CONNECTED:
					action += ' Connected';
					candy.core.action.Jabber.GetJidIfAnonymous();
					candy.core.action.Jabber.Presence();
					candy.core.action.Jabber.Autojoin();
					candy.core.action.Jabber.GetIgnoreList();
					break;

				case Strophe.Status.ATTACHED:
					action += ' Attached';
					candy.core.action.Jabber.Presence();
					candy.core.action.Jabber.Autojoin();
					candy.core.action.Jabber.GetIgnoreList();
					break;

				case Strophe.Status.DISCONNECTING:
					action += ' Disconnecting';
					break;

				case Strophe.Status.DISCONNECTED:
					action += ' Disconnected';
					break;

				case Strophe.Status.AUTHENTICATING:
					action += ' Authenticating';
					break;

				case Strophe.Status.AUTHFAIL:
					action += ' Authentication failed';
					break;

				case Strophe.Status.ERROR:
					action += ' Errored';
					break;

				case Strophe.Status.CONNFAIL:
					action += ' Failed';
					break;

				default:
					action += ' Unknown';
					break;
			}

			_ccevt.notifyObservers(
				'CHAT',
				{ type: 'connection', status: status }
			);

			msos.console.debug(temp_ce + '.Strophe.Connect -> done, action:' + action + ' (' + status + ')');
		}
	};

	_ccevt.Login = function (jid) {
		msos.console.debug(temp_ce + '.Login -> called, jid: ' + jid);

		_ccevt.notifyObservers(
			'LOGIN',
			{ presetJid: jid }
		);
	};

	_ccevt.Jabber = {

		Version: function (msg) {
			candy.core.action.Jabber.Version(jQuery(msg));
			return true;
		},

		Presence: function (msg) {
			var jp = '.Jabber.Presence -> ';

			msos.console.debug(temp_ce + jp + 'start.');

			msg = jQuery(msg);
			if (msg.children('x[xmlns^="' + Strophe.NS.MUC + '"]').length > 0) {
				if (msg.attr('type') === 'error') {
					_ccevt.Jabber.Room.PresenceError(msg);
				} else {
					_ccevt.Jabber.Room.Presence(msg);
				}
			}

			msos.console.debug(temp_ce + jp + 'done!');
			return true;
		},

		Bookmarks: function (msg) {
			var jb = '.Jabber.Bookmarks -> ';

			msos.console.debug(temp_ce + jb + 'start.');

			jQuery('conference', msg).each(
				function () {
					var item = jQuery(this);
					if (item.attr('autojoin')) {
						candy.core.action.Jabber.Room.Join(item.attr('jid'));
					}
				}
			);

			msos.console.debug(temp_ce + jb + 'done!');
			return true;
		},

		PrivacyList: function (msg) {
			var jpl = '.Jabber.PrivacyList -> ',
				currentUser = candy.core.getUser();

			msos.console.debug(temp_ce + jpl + 'start.');

			jQuery('list[name="ignore"] item', msg).each(
				function () {
					var item = jQuery(this);
					if (item.attr('action') === 'deny') {
						currentUser.addToOrRemoveFromPrivacyList('ignore', item.attr('value'));
					}
				}
			);
			candy.core.action.Jabber.SetIgnoreListActive();

			msos.console.debug(temp_ce + jpl + 'done!');
			return false;
		},

		PrivacyListError: function (msg) {
			var jpe = '.Jabber.PrivacyListError -> ';

			msos.console.debug(temp_ce + jpe + 'start.');

			if (jQuery('error[code="404"][type="cancel"] item-not-found', msg)) {
				msos.console.debug(temp_ce + jpe + 'privacy list na!');
				candy.core.action.Jabber.ResetIgnoreList();
				candy.core.action.Jabber.SetIgnoreListActive();
			}

			msos.console.debug(temp_ce + jpe + 'done!');
			return false;
		},

		Message: function (msg) {
			msg = jQuery(msg);

			var jm = '.Jabber.Message -> ',
				fromJid = msg.attr('from'),
				type = msg.attr('type'),
				toJid = msg.attr('to');

			msos.console.debug(temp_ce + jm + 'start.');

			// Room message
			if (fromJid !== Strophe.getDomainFromJid(fromJid) && (type === 'groupchat' || type === 'chat' || type === 'error')) {
				_ccevt.Jabber.Room.Message(msg);
			// Admin message
			} else if (!toJid && fromJid === Strophe.getDomainFromJid(fromJid)) {
				_ccevt.notifyObservers(
					'CHAT',
					{
						type: (type || 'message'),
						message: msg.children('body').text()
					}
				);
			// Server Message
			} else if (toJid && fromJid === Strophe.getDomainFromJid(fromJid)) {
				_ccevt.notifyObservers(
					'CHAT',
					{
						type: (type || 'message'),
						subject: msg.children('subject').text(),
						message: msg.children('body').text()
					}
				);
			}

			msos.console.debug(temp_ce + jm + 'done!');
			return true;
		},

		Room: {

			Leave: function (msg) {
				msg = jQuery(msg);

				var jrl = '.Jabber.Room.Leave -> ',
					from = msg.attr('from'),
					roomJid = Strophe.getBareJidFromJid(from),
					roomName,
					item,
					type,
					reason,
					actor,
					user;

				msos.console.debug(temp_ce + jrl + 'start.');

				if (!candy.core.getRoom(roomJid)) {
					msos.console.debug(temp_ce + jrl + 'done, not joined yet!');
					return false;
				}

				roomName = candy.core.getRoom(roomJid).getName();
				item = msg.find('item');
				type = 'leave';

				delete candy.core.getRooms()[roomJid];

				// if user gets kicked, role is none and there's a status code 307
				if (item.attr('role') === 'none') {
					if (msg.find('status').attr('code') === '307') {
						type = 'kick';
					} else if (msg.find('status').attr('code') === '301') {
						type = 'ban';
					}
					reason = item.find('reason').text();
					actor  = item.find('actor').attr('jid');
				}

				user = new candy.core.chatuser(
					from,
					Strophe.getResourceFromJid(from),
					item.attr('affiliation'),
					item.attr('role')
				);

				_ccevt.notifyObservers(
					'PRESENCE',
					{
						'roomJid': roomJid,
						'roomName': roomName,
						'type': type,
						'reason': reason,
						'actor': actor,
						'user': user
					}
				);

				msos.console.debug(temp_ce + jrl + 'done!');
				return true;
			},

			Disco: function (msg) {
				msg = jQuery(msg);

				var jrd = '.Jabber.Room.Disco -> ',
					roomJid = Strophe.getBareJidFromJid(msg.attr('from')),
					roomName,
					room;

				msos.console.debug(temp_ce + jrd + 'start.');

				// Client joined a room
				if (!candy.core.getRooms()[roomJid]) {
					candy.core.getRooms()[roomJid] = new candy.core.chatroom(roomJid);
				}

				// Room existed but room name was unknown
				roomName = msg.find('identity').attr('name');
				room = candy.core.getRoom(roomJid);

				if (room.getName() === null) {
					room.setName(roomName);
				// Room name changed
				} else if(room.getName() !== roomName
					   && room.getUser() !== null) {
					msos.console.info(temp_ce + jrd + 'room name changed, new name: ' + roomName);
				  }

				msos.console.debug(temp_ce + jrd + 'done!');
				return true;
			},

			Presence: function (msg) {
				var jrp = '.Jabber.Room.Presence -> ',
					from = candy.util.unescapeJid(msg.attr('from')),
					roomJid = Strophe.getBareJidFromJid(from),
					presenceType = msg.attr('type'),
					room,
					roster,
					action,
					user,
					item,
					nick;

				msos.console.debug(temp_ce + jrp + 'start.');

				// Client left a room
				if (Strophe.getResourceFromJid(from) === candy.core.getUser().getNick() && presenceType === 'unavailable') {
					_ccevt.Jabber.Room.Leave(msg);
					msos.console.debug(temp_ce + jrp + 'done, left room!');
					return true;
				}

				// Client joined a room
				room = candy.core.getRoom(roomJid);

				if (!room) {
					candy.core.getRooms()[roomJid] = new candy.core.chatroom(roomJid);
					room = candy.core.getRoom(roomJid);
				}

				roster = room.getRoster();
				item = msg.find('item');

				// User joined a room
				if (presenceType !== 'unavailable') {
					nick = Strophe.getResourceFromJid(from);
					user = new candy.core.chatuser(from, nick, item.attr('affiliation'), item.attr('role'));
					// Room existed but client (myself) is not yet registered
					if (room.getUser() === null && candy.core.getUser().getNick() === nick) {
						room.setUser(user);
					}
					roster.add(user);
					action = 'join';
				// User left a room
				} else {
					action = 'leave';
					if (item.attr('role') === 'none') {
						if (msg.find('status').attr('code') === '307') {
							action = 'kick';
						} else if (msg.find('status').attr('code') === '301') {
							action = 'ban';
						}
					}
					user = roster.get(from);
					roster.remove(from);
				}

				_ccevt.notifyObservers(
					'PRESENCE',
					{
						'roomJid': roomJid,
						'roomName': room.getName(),
						'user': user,
						'action': action,
						'currentUser': candy.core.getUser()
					}
				);

				msos.console.debug(temp_ce + jrp + 'done!');
				return true;
			},

			PresenceError: function (msg) {
				var jre = '.Jabber.Room.PresenceError -> ',
					from = candy.util.unescapeJid(msg.attr('from')),
					roomJid = Strophe.getBareJidFromJid(from),
					room = candy.core.getRooms()[roomJid],
					roomName = room.getName();

				msos.console.debug(temp_ce + jre + 'start.');

				// Presence error: Remove room from array to prevent error when disconnecting
				delete candy.core.getRooms()[roomJid];

				_ccevt.notifyObservers(
					'PRES_ERROR',
					{
						'msg' : msg,
						'type': msg.children('error').children()[0].tagName.toLowerCase(),
						'roomJid': roomJid,
						'roomName': roomName
					}
				);
				msos.console.debug(temp_ce + jre + 'done!');
			},

			Message: function (msg) {
				// Room subject
				var jrm = '.Jabber.Room.Message -> ',
					roomJid,
					bareRoomJid,
					isNoConferenceRoomJid,
					name,
					message,
					error,
					resource,
					delay,
					timestamp;

				msos.console.debug(temp_ce + jrm + 'start.');

				if (msg.children('subject').length > 0) {
					roomJid = candy.util.unescapeJid(Strophe.getBareJidFromJid(msg.attr('from')));
					message = { name: Strophe.getNodeFromJid(roomJid), body: msg.children('subject').text(), type: 'subject' };
				// Error messsage
				} else if (msg.attr('type') === 'error') {
					error = msg.children('error');
					if (error.attr('code') === '500' && error.children('text').length > 0) {
						roomJid = msg.attr('from');
						message = { type: 'info', body: error.children('text').text() };
					}
				// Chat message
				} else if (msg.children('body').length > 0) {
					// Private chat message
					if (msg.attr('type') === 'chat') {
						roomJid = candy.util.unescapeJid(msg.attr('from'));
						bareRoomJid = Strophe.getBareJidFromJid(roomJid);
						// if a 3rd-party client sends a direct message to this user (not via the room) then the username is the node and not the resource.
						isNoConferenceRoomJid = !candy.core.getRoom(bareRoomJid);
						name = isNoConferenceRoomJid ? Strophe.getNodeFromJid(roomJid) : Strophe.getResourceFromJid(roomJid);
						message = { name: name, body: msg.children('body').text(), type: msg.attr('type'), isNoConferenceRoomJid: isNoConferenceRoomJid };
					// Multi-user chat message
					} else {
						roomJid = candy.util.unescapeJid(Strophe.getBareJidFromJid(msg.attr('from')));
						resource = Strophe.getResourceFromJid(msg.attr('from'));
						// Message from a user
						if (resource) {
							resource = Strophe.unescapeNode(resource);
							message = { name: resource, body: msg.children('body').text(), type: msg.attr('type') };
						// Message from server (XEP-0045#registrar-statuscodes)
						} else {
							message = { name: '', body: msg.children('body').text(), type: 'info' };
						}
					}
				// Unhandled message
				} else {
					msos.console.debug(temp_ce + jrm + 'done, undeliverable!');
					return true;
				}

				delay = msg.children('delay') || msg.children('x[xmlns="' + Strophe.NS.DELAY + '"]');
				timestamp = delay !== undefined ? delay.attr('stamp') : null;

				_ccevt.notifyObservers(
					'MESSAGE',
					{
						roomJid: roomJid,
						message: message,
						timestamp: timestamp
					}
				);

				msos.console.debug(temp_ce + jrm + 'done!');
				return true;
			}
		}
	};
};
