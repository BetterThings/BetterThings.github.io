/** File: observer.js
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
    Strophe: false,
    Mustache: false
*/

msos.provide("candy.view.observer");
msos.require("candy.core");
msos.require("candy.view");
msos.require("candy.view.pane");
msos.require("candy.view.template");
msos.require("candy.view.event");
msos.require("msos.i18n");

candy.view.observer.init = function () {
	"use strict";

	var temp_cvo = 'candy.view.observer';

	candy.view.observer.Chat = {

		update: function (obj, args) {

			var action = 'connection -',
				presetJid;

			msos.console.debug(temp_cvo + '.Chat.update -> start.');

			if (args.type === 'connection') {

				switch (args.status) {
					case Strophe.Status.CONNECTING:
						action += ' CONNECTING';

					case Strophe.Status.AUTHENTICATING:
						action += ' AUTHENTICATING';
						candy.view.pane.Chat.Modal.show(
							candy.view.i18n.statusConnecting,
							false,
							true
						);
						break;

					case Strophe.Status.ATTACHED:
						action += ' ATTACHED';

					case Strophe.Status.CONNECTED:
						action += ' CONNECTED';
						candy.view.pane.Chat.Modal.show(
							candy.view.i18n.statusConnected
						);
						candy.view.pane.Chat.Modal.hide();
						break;

					case Strophe.Status.DISCONNECTING:
						action += ' DISCONNECTING';
						candy.view.pane.Chat.Modal.show(
							candy.view.i18n.statusDisconnecting,
							false,
							true
						);
						break;

					case Strophe.Status.DISCONNECTED:
						action += ' DISCONNECTED';
						presetJid = candy.core.getOptions().allow_anonymous ? Strophe.getDomainFromJid(candy.core.getUser().getJid()) : null;
						candy.view.pane.Chat.Modal.showLoginForm(
							candy.view.i18n.statusDisconnected,
							presetJid
						);
						candy.view.event.Chat.onDisconnect();
						break;

					case Strophe.Status.AUTHFAIL:
						action += ' AUTHFAIL';
						candy.view.pane.Chat.Modal.showLoginForm(
							candy.view.i18n.statusAuthfail
						);
						candy.view.event.Chat.onAuthfail();
						break;

					default:
						action += ' DEFAULT';
						candy.view.pane.Chat.Modal.show(
							msos.i18n.simple_printf(candy.view.i18n.status, args.status)
						);
						break;
				}

			} else if (args.type === 'message') {

				action = args.type;

				candy.view.pane.Chat.adminMessage(
					(args.subject || ''),
					args.message
				);

			} else if (args.type === 'chat' || args.type === 'groupchat') {

				action = args.type;

				// use onInfoMessage as infos from the server shouldn't be hidden by the infoMessage switch.
				candy.view.pane.Chat.onInfoMessage(
					candy.view.getCurrent().roomJid,
					(args.subject || ''),
					args.message
				);
			} else {
				action = args.type + ' (no action taken)';
			  }
			msos.console.debug(temp_cvo + '.Chat.update -> done, action: ' + action);
		}
	};

	candy.view.observer.Presence = {

		update: function (obj, args) {
			var user,
				actorName,
				actionLabel,
				translationParams;

			msos.console.debug(temp_cvo + '.Presence.update -> start.');

			// Client left
			if (args.type === 'leave') {

				user = candy.view.pane.Room.getUser(args.roomJid);
				candy.view.pane.Room.close(args.roomJid);
				candy.view.observer.Presence.notifyPrivateChats(user, args.type);

			// Client has been kicked or banned
			} else if (args.type === 'kick' || args.type === 'ban') {

				actorName = args.actor ? Strophe.getNodeFromJid(args.actor) : null;
				translationParams = [args.roomName];

				if (actorName) {
					translationParams.push(actorName);
				}

				switch (args.type) {
					case 'kick':
						actionLabel = msos.i18n.simple_printf((actorName ? candy.view.i18n.youHaveBeenKickedBy : candy.view.i18n.youHaveBeenKicked), translationParams);
						break;
					case 'ban':
						actionLabel = msos.i18n.simple_printf((actorName ? candy.view.i18n.youHaveBeenBannedBy : candy.view.i18n.youHaveBeenBanned), translationParams);
						break;
				}

				candy.view.pane.Chat.Modal.show(
					Mustache.render(
						candy.view.template.Chat.Context.adminMessageReason,
						{
							reason:		args.reason,
							_action:	actionLabel,
							_reason:	msos.i18n.simple_printf(candy.view.i18n.reasonWas, [args.reason])
						}
					)
				);

				setTimeout(
					function () {
						candy.view.pane.Chat.Modal.hide(
							function () {
								candy.view.pane.Room.close(args.roomJid);
								candy.view.observer.Presence.notifyPrivateChats(args.user, args.type);
							}
						);
					},
					5000
				);

				candy.view.event.Room.onPresenceChange(
					{
						type:		args.type,
						reason:		args.reason,
						roomJid:	args.roomJid,
						user:		args.user
					}
				);

			// A user changed presence
			} else {
				// Initialize room if not yet existing
				if (!candy.view.pane.Chat.rooms[args.roomJid]) {
					candy.view.pane.Room.init(args.roomJid, args.roomName);
					candy.view.pane.Room.show(args.roomJid);
				}
				candy.view.pane.Roster.update(
					args.roomJid,
					args.user,
					args.action,
					args.currentUser
				);
				// Notify private user chats if existing
				if (candy.view.pane.Chat.rooms[args.user.getJid()]) {
					candy.view.pane.Roster.update(
						args.user.getJid(),
						args.user,
						args.action,
						args.currentUser
					);
					candy.view.pane.PrivateRoom.setStatus(
						args.user.getJid(),
						args.action
					);
				}
			}
			msos.console.debug(temp_cvo + '.Presence.update -> done, for: ' + args.type);
		},

		notifyPrivateChats: function (user, type) {
			var roomJid;

			msos.console.debug(temp_cvo + '.Presence.notifyPrivateChats -> start, user: ' + user + ', type: ' + type);

			for (roomJid in candy.view.pane.Chat.rooms) {
				if (candy.view.pane.Chat.rooms.hasOwnProperty(roomJid)
				 && candy.view.pane.Room.getUser(roomJid)
				 && user.getJid() === candy.view.pane.Room.getUser(roomJid).getJid()) {
					candy.view.pane.Roster.update(
						roomJid,
						user,
						type,
						user
					);
					candy.view.pane.PrivateRoom.setStatus(
						roomJid,
						type
					);
				}
			}
			msos.console.debug(temp_cvo + '.Presence.notifyPrivateChats -> done!');
		}
	};

	candy.view.observer.PresenceError = {

		update: function (obj, args) {
			var message;

			msos.console.debug(temp_cvo + '.PresenceError.update -> start, for: ' + args.type);

			switch (args.type) {
				case 'not-authorized':
					if (args.msg.children('x').children('password').length > 0) {
						message = msos.i18n.simple_printf(candy.view.i18n.passwordEnteredInvalid, [args.roomName]);
					}
					candy.view.pane.Chat.Modal.showEnterPasswordForm(
						args.roomJid,
						args.roomName,
						message
					);
					break;
				case 'conflict':
					candy.view.pane.Chat.Modal.showNicknameConflictForm(args.roomJid);
					break;
				case 'registration-required':
					candy.view.pane.Chat.Modal.showError('errorMembersOnly', [args.roomName]);
					break;
				case 'service-unavailable':
					candy.view.pane.Chat.Modal.showError('errorMaxOccupantsReached', [args.roomName]);
					break;
			}
			msos.console.debug(temp_cvo + '.PresenceError.update -> done!');
		}
	};

	candy.view.observer.Message = {

		update: function (obj, args) {

			msos.console.debug(temp_cvo + '.Message.update -> start, for: ' + args.message.type);

			if (args.message.type === 'subject') {
				if (!candy.view.pane.Chat.rooms[args.roomJid]) {
					candy.view.pane.Room.init(
						args.roomJid,
						args.message.name
					);
					candy.view.pane.Room.show(args.roomJid);
				}
				candy.view.pane.Room.setSubject(
					args.roomJid,
					args.message.body
				);
			} else if (args.message.type === 'info') {
				candy.view.pane.Chat.infoMessage(
					args.roomJid,
					args.message.body
				);
			} else {
				// Initialize room if it's a message for a new private user chat
				if (args.message.type === 'chat' && !candy.view.pane.Chat.rooms[args.roomJid]) {
					candy.view.pane.PrivateRoom.open(
						args.roomJid,
						args.message.name,
						false,
						args.message.isNoConferenceRoomJid
					);
				}
				candy.view.pane.Message.show(
					args.roomJid,
					args.message.name,
					args.message.body,
					args.timestamp
				);
			}
			msos.console.debug(temp_cvo + '.Message.update -> done!');
		}
	};

	candy.view.observer.Login = {

		update: function (obj, args) {

			msos.console.debug(temp_cvo + '.Login.update -> start.');

			candy.view.pane.Chat.Modal.showLoginForm(null, args.presetJid);

			msos.console.debug(temp_cvo + '.Login.update -> done!');
		}
	};
};