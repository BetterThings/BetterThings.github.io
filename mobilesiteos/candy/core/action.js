/** File: action.js
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
    $iq: false,
    $pres: false
*/

msos.provide("candy.core.action");
msos.require("candy.wrapper");
msos.require("candy.core");
msos.require("candy.util");

candy.core.action.version = new msos.set_version(13, 6, 25);


candy.core.action.init = function () {
	"use strict";

	var temp_cca = 'candy.core.action',
		_cca = candy.core.action;

	_cca.Jabber = {

		Version: function (msg) {
			var jv = '.Jabber.Version -> ';

			msos.console.debug(temp_cca + jv + 'start.');

			candy.core.getConnection().send(
				$iq(
					{
						type:	'result',
						to:		msg.attr('from'),
						from:	msg.attr('to'),
						id:		msg.attr('id')
					}
				).c(
					'query',
					{
						name:		candy.wrapper.name,
						version:	candy.wrapper.version,
						os:			navigator.userAgent
					}
				)
			);
			msos.console.debug(temp_cca + jv + 'done!');
		},

		Roster: function () {
			var jr = '.Jabber.Roster -> ';

			msos.console.debug(temp_cca + jr + 'start.');

			candy.core.getConnection().send(
				$iq(
					{
						type: 'get',
						xmlns: Strophe.NS.CLIENT
					}
				).c(
					'query',
					{ xmlns: Strophe.NS.ROSTER }
				).tree()
			);
			msos.console.debug(temp_cca + jr + 'done!');
		},

		Presence: function (attr) {
			var jp = '.Jabber.Presence -> ';

			msos.console.debug(temp_cca + jp + 'start.');

			candy.core.getConnection().send($pres(attr).tree());

			msos.console.debug(temp_cca + jp + 'done!');
		},

		Services: function () {
			var js = '.Jabber.Services -> ';

			msos.console.debug(temp_cca + js + 'start.');

			candy.core.getConnection().send(
				$iq(
					{
						type: 'get',
						xmlns: Strophe.NS.CLIENT
					}
				).c(
					'query',
					{ xmlns: Strophe.NS.DISCO_ITEMS }
				).tree()
			);
			msos.console.debug(temp_cca + js + 'done!');
		},

		Autojoin: function () {
			var ja = '.Jabber.Autojoin -> ',
				type = 'na';

			msos.console.debug(temp_cca + ja + 'start.');

			// Request bookmarks
			if (candy.core.getOptions().autojoin === true) {
				candy.core.getConnection().send(
					$iq(
						{
							type: 'get',
							xmlns: Strophe.NS.CLIENT
						}
					).c(
						'query',
						{ xmlns: Strophe.NS.PRIVATE }
					).c(
						'storage',
						{ xmlns: Strophe.NS.BOOKMARKS }
					).tree()
				);
				type = 'boolean true';

			// Join defined rooms
			} else if (jQuery.isArray(candy.core.getOptions().autojoin)) {
				jQuery.each(
					candy.core.getOptions().autojoin,
					function () {
						_cca.Jabber.Room.Join(this.valueOf());
					}
				);
				type = 'input array';
			}
			msos.console.debug(temp_cca + ja + 'done, by: ' + type);
		},

		ResetIgnoreList: function () {
			var jr = '.Jabber.ResetIgnoreList -> ';

			msos.console.debug(temp_cca + jr + 'start.');

			candy.core.getConnection().send(
				$iq(
					{
						type: 'set',
						from: candy.core.getUser().getJid(),
						id: 'set1'
					}
				).c(
					'query',
					{ xmlns: Strophe.NS.PRIVACY }
				).c(
					'list',
					{ name: 'ignore' }
				).c(
					'item',
					{ 'action': 'allow', 'order': '0' }
				).tree()
			);
			msos.console.debug(temp_cca + jr + 'done!');
		},

		RemoveIgnoreList: function () {
			var ji = '.Jabber.RemoveIgnoreList -> ';

			msos.console.debug(temp_cca + ji + 'start.');

			candy.core.getConnection().send(
				$iq(
					{
						type: 'set',
						from: candy.core.getUser().getJid(),
						id: 'remove1'
					}
				).c(
					'query',
					{ xmlns: Strophe.NS.PRIVACY }
				).c(
					'list',
					{ name: 'ignore' }
				).tree()
			);
			msos.console.debug(temp_cca + ji + 'done!');
		},

		GetIgnoreList: function () {
			var jg = '.Jabber.GetIgnoreList -> ';

			msos.console.debug(temp_cca + jg + 'start.');

			candy.core.getConnection().send(
				$iq(
					{
						type: 'get',
						from: candy.core.getUser().getJid(),
						id: 'get1'
					}
				).c(
					'query',
					{ xmlns: Strophe.NS.PRIVACY }
				).c(
					'list',
					{ name: 'ignore' }
				).tree()
			);
			msos.console.debug(temp_cca + jg + 'done!');
		},

		SetIgnoreListActive: function () {
			var js = '.Jabber.SetIgnoreListActive -> ';

			msos.console.debug(temp_cca + js + 'start.');

			candy.core.getConnection().send(
				$iq(
					{
						type: 'set',
						from: candy.core.getUser().getJid(),
						id: 'set2'
					}
				).c(
					'query',
					{ xmlns: Strophe.NS.PRIVACY }
				).c(
					'active',
					{ name:'ignore' }
				).tree()
			);
			msos.console.debug(temp_cca + js + 'done!');
		},

		GetJidIfAnonymous: function () {
			var jgj = '.Jabber.GetJidIfAnonymous -> ',
				out_jid = 'na';

			msos.console.debug(temp_cca + jgj + 'start.');

			if (!candy.core.getUser().getJid()) {
				out_jid = candy.core.getConnection().jid;
				candy.core.getUser().data.jid = out_jid;
			}
			msos.console.debug(temp_cca + jgj + 'done, JID: ' + out_jid);
		},

		Room: {

			Join: function (roomJid, password) {
				var jrj = '.Jabber.Room.Join -> ';

				msos.console.debug(temp_cca + jrj + 'start, roomJid: ' + roomJid + ', password: ' + password);

				_cca.Jabber.Room.Disco(roomJid);

				candy.core.getConnection().muc.join(
					roomJid,
					candy.core.getUser().getNick(),
					null,
					null,
					password
				);
				msos.console.debug(temp_cca + jrj + 'done!');
			},

			Leave: function (roomJid) {
				var jrl = '.Jabber.Room.Leave -> ';

				msos.console.debug(temp_cca + jrl + 'start, roomJid: ' + roomJid);

				candy.core.getConnection().muc.leave(
					roomJid,
					candy.core.getRoom(roomJid).getUser().getNick(),
					function () {}
				);
				msos.console.debug(temp_cca + jrl + 'done!');
			},

			Disco: function (roomJid) {
				var jrd = '.Jabber.Room.Disco -> ';

				msos.console.debug(temp_cca + jrd + 'start, roomJid: ' + roomJid);

				candy.core.getConnection().send(
					$iq(
						{
							type: 'get',
							from: candy.core.getUser().getJid(),
							to: roomJid,
							id: 'disco3'
						}
					).c(
						'query',
						{ xmlns: Strophe.NS.DISCO_INFO }
					).tree()
				);
				msos.console.debug(temp_cca + jrd + 'done!');
			},

			Message: function (roomJid, msg, type) {
				var jrm = '.Jabber.Room.Message -> ';

				msos.console.debug(temp_cca + jrm + 'start, roomJid: ' + roomJid + ', type: ' + type);

				// Trim message
				msg = jQuery.trim(msg);
				if (msg === '') {
					msos.console.debug(temp_cca + jrm + 'done, msg: undefined!');
					return false;
				}
				candy.core.getConnection().muc.message(
					candy.util.escapeJid(roomJid),
					undefined,
					msg,
					type
				);
				msos.console.debug(temp_cca + jrm + 'done!');
				return true;
			},

			IgnoreUnignore: function (userJid) {
				var jri = '.Jabber.Room.IgnoreUnignore -> ';

				msos.console.debug(temp_cca + jri + 'start, userJid: ' + userJid);

				candy.core.getUser().addToOrRemoveFromPrivacyList('ignore', userJid);
				candy.core.action.Jabber.Room.UpdatePrivacyList();

				msos.console.debug(temp_cca + jri + 'done!');
			},

			UpdatePrivacyList: function () {
				var jru = '.Jabber.Room.UpdatePrivacyList -> ',
					currentUser = candy.core.getUser(),
					iq = $iq(
							{
								type: 'set',
								from: currentUser.getJid(),
								id: 'edit1'
							}
						).c(
							'query',
							{ xmlns: 'jabber:iq:privacy' }
						).c(
							'list',
							{ name: 'ignore' }
						),
					privacyList = currentUser.getPrivacyList('ignore');

				msos.console.debug(temp_cca + jru + 'start, list length: ' + privacyList.length);

				if (privacyList.length > 0) {
					jQuery.each(
						privacyList,
						function (index, jid) {
							iq.c(
								'item',
								{
									type:'jid',
									value: candy.util.escapeJid(jid),
									action: 'deny',
									order : index
								}
							).c(
								'message'
							).up().up();
						}
					);
				} else {
					iq.c(
						'item',
						{
							action: 'allow',
							order : '0'
						}
					);
				}
				candy.core.getConnection().send(iq.tree());
				msos.console.debug(temp_cca + jru + 'done!');
			},

			Admin: {

				UserAction: function (roomJid, userJid, type, reason) {
					var jra = '.Jabber.Room.Admin.UserAction -> ',
						iqId,
						itemObj = {
							nick: Strophe.escapeNode(Strophe.getResourceFromJid(userJid))
						};

					msos.console.debug(temp_cca + jra + 'start, roomJid: ' + roomJid + ', userJid: ' + userJid + ', type: ' + type);

					switch (type) {
						case 'kick':
							iqId = 'kick1';
							itemObj.role = 'none';
							break;
						case 'ban':
							iqId = 'ban1';
							itemObj.affiliation = 'outcast';
							break;
						default:
							msos.console.debug(temp_cca + jra + 'nothing done: ' + type);
							return false;
					}

					candy.core.getConnection().send(
						$iq(
							{
								type: 'set',
								from: candy.core.getUser().getJid(),
								to: roomJid, id: iqId
							}
						).c(
							'query',
							{ xmlns: Strophe.NS.MUC_ADMIN }
						).c(
							'item',
							itemObj
						).c(
							'reason'
						).t(reason).tree()
					);
					msos.console.debug(temp_cca + jra + 'done!');
					return true;
				},

				SetSubject: function (roomJid, subject) {
					var jrs = '.Jabber.Room.Admin.UserAction -> ';

					msos.console.debug(temp_cca + jrs + 'start, roomJid: ' + roomJid + ', subject: ' + subject);

					candy.core.getConnection().muc.setTopic(
						roomJid,
						subject
					);
					msos.console.debug(temp_cca + jrs + 'done!');
				}
			}
		}
	};
};
