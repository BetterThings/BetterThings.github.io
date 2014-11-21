/** File: pane.js
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
    Mustache: false,
    _: false
*/

msos.provide("candy.view.pane");
msos.require("candy.view");
msos.require("candy.view.template");
msos.require("candy.view.event");
msos.require("candy.util");
msos.require("jquery.tools.slidepanel");
msos.require("msos.i18n");


candy.view.pane.init = function () {
	"use strict";

	var temp_cvp = 'candy.view.pane',
		_cvp = candy.view.pane;

	_cvp.Window = {

		_hasFocus: true,
		_plainTitle: document.title,
		_unreadMessagesCount: 0,
		autoscroll: true,

		hasFocus: function () {
			return _cvp.Window._hasFocus;
		},

		increaseUnreadMessages: function () {
			_cvp.Window._unreadMessagesCount += 1;
			_cvp.Window.renderUnreadMessages(_cvp.Window._unreadMessagesCount);
		},

		reduceUnreadMessages: function (num) {
			_cvp.Window._unreadMessagesCount -= num;
			if (_cvp.Window._unreadMessagesCount <= 0) {
				_cvp.Window.clearUnreadMessages();
			} else {
				_cvp.Window.renderUnreadMessages(_cvp.Window._unreadMessagesCount);
			}
		},

		clearUnreadMessages: function () {
			_cvp.Window._unreadMessagesCount = 0;
			document.title = _cvp.Window._plainTitle;
		},

		renderUnreadMessages: function (count) {
			document.title = candy.view.template.Window.unreadmessages.replace('{{count}}', count).replace('{{title}}', _cvp.Window._plainTitle);
		},

		onFocus: function () {
			_cvp.Window._hasFocus = true;
			if (candy.view.getCurrent().roomJid) {
				_cvp.Room.setFocusToForm(candy.view.getCurrent().roomJid);
				_cvp.Chat.clearUnreadMessages(candy.view.getCurrent().roomJid);
			}
		},

		onBlur: function () {
			_cvp.Window._hasFocus = false;
		}
	};

	_cvp.Chat = {

		rooms: [],

		addTab: function (roomJid, roomName, roomType) {

			var at = '.Chat.addTab -> ',
				roomId,
				html,
				tab;

			msos.console.debug(temp_cvp + at + 'start, roomJid: ' + roomJid + ', roomName: ' + roomName + ', roomType: ' + roomType);

			roomId = candy.util.jidToId(roomJid);
			html = Mustache.render(
				candy.view.template.Chat.tab,
				{
					roomJid: roomJid,
					roomId: roomId,
					name: roomName || Strophe.getNodeFromJid(roomJid),
					privateUserChat: function () { return roomType === 'chat'; },
					roomType: roomType
				}
			);
			tab = jQuery(html).appendTo('#chat-tabs');

			tab.click(_cvp.Chat.tabClick);

			// TODO: maybe we find a better way to get the close element.
			jQuery('a.close', tab).click(_cvp.Chat.tabClose);

			_cvp.Chat.fitTabs();

			msos.console.debug(temp_cvp + at + 'done!');
		},

		getTab: function (roomJid) {
			return jQuery('#chat-tabs').children('li[data-roomjid="' + roomJid + '"]');
		},

		removeTab: function (roomJid) {
			_cvp.Chat.getTab(roomJid).remove();
			_cvp.Chat.fitTabs();
		},

		setActiveTab: function (roomJid) {
			jQuery('#chat-tabs').children().each(
				function () {
					var tab = jQuery(this);
					if (tab.attr('data-roomjid') === roomJid) {
						tab.addClass('active');
					} else {
						tab.removeClass('active');
					}
				}
			);
		},

		increaseUnreadMessages: function (roomJid) {
			var unreadElem = this.getTab(roomJid).find('.unread');
			unreadElem.show().text(unreadElem.text() !== '' ? parseInt(unreadElem.text(), 10) + 1 : 1);
			// only increase window unread messages in private chats
			if (_cvp.Chat.rooms[roomJid].type === 'chat') {
				_cvp.Window.increaseUnreadMessages();
			}
		},

		clearUnreadMessages: function (roomJid) {
			var unreadElem = _cvp.Chat.getTab(roomJid).find('.unread');
			_cvp.Window.reduceUnreadMessages(unreadElem.text());
			unreadElem.hide().text('');
		},

		tabClick: function (e) {
			// remember scroll position of current room
			var currentRoomJid = candy.view.getCurrent().roomJid;
			_cvp.Chat.rooms[currentRoomJid].scrollPosition = _cvp.Room.getPane(currentRoomJid, '.message-pane-wrapper').scrollTop();

			_cvp.Room.show(jQuery(this).attr('data-roomjid'));
			e.preventDefault();
		},

		tabClose: function () {
			var roomJid = jQuery(this).parent().attr('data-roomjid');
			// close private user tab
			if (_cvp.Chat.rooms[roomJid].type === 'chat') {
				_cvp.Room.close(roomJid);
			// close multi-user room tab
			} else {
				candy.core.action.Jabber.Room.Leave(roomJid);
			}
			return false;
		},

		allTabsClosed: function () {
			candy.core.disconnect();
			_cvp.Chat.Toolbar.hide();
			return;
		},

		fitTabs: function () {
			var availableWidth = jQuery('#chat-tabs').innerWidth(),
				tabsWidth = 0,
				tabs = jQuery('#chat-tabs').children(),
				tabDiffToRealWidth,
				tabWidth;

			tabs.each(
				function () {
					tabsWidth += jQuery(this).css({ width: 'auto', overflow: 'visible' }).outerWidth(true);
				}
			);

			if (tabsWidth > availableWidth) {
				// tabs.[outer]Width() measures the first element in `tabs`. It's no very readable but nearly two times faster than using :first
				tabDiffToRealWidth = tabs.outerWidth(true) - tabs.width();
				tabWidth = Math.floor((availableWidth) / tabs.length) - tabDiffToRealWidth;

				tabs.css({ width: tabWidth, overflow: 'hidden' });
			}
		},

		updateToolbar: function (roomJid) {
			var atb = '.Chat.updateToolbar -> ';

			msos.console.debug(temp_cvp + atb + 'start, roomJid: ' + roomJid);

			jQuery('#chat-toolbar').find('.context').click(
				function (e) {
					_cvp.Chat.Context.show(e.currentTarget, roomJid);
					e.stopPropagation();
				}
			);
			candy.view.pane.Chat.Toolbar.updateUsercount(candy.view.pane.Chat.rooms[roomJid].usercount);

			msos.console.debug(temp_cvp + atb + 'done!');
		},

		adminMessage: function (subject, message) {
			var am = '.Chat.adminMessage -> ',
				roomJid = candy.view.getCurrent().roomJid,
				html;

			msos.console.debug(temp_cvp + am + 'start, subject: ' + subject + ', roomJid: ' + roomJid);

			// Simply dismiss admin message if no room joined so far. TODO: maybe we should show those messages on a dedicated pane?
			if (roomJid) {
				html = Mustache.render(
					candy.view.template.Chat.adminMessage,
					{
						subject: subject,
						message: message,
						sender: candy.view.i18n.administratorMessageSubject,
						time: candy.util.localizedTime(new Date())
					}
				);

				jQuery('#chat-rooms').children().each(
					function () {
						_cvp.Room.appendToMessagePane(jQuery(this).attr('data-roomjid'), html);
					}
				);

				_cvp.Room.scrollToBottom(roomJid);

				candy.view.event.Chat.onAdminMessage({ 'subject' : subject, 'message' : message });
			}

			msos.console.debug(temp_cvp + am + 'done!');
		},

		infoMessage: function (roomJid, subject, message) {
			_cvp.Chat.onInfoMessage(roomJid, subject, message);
		},

		onInfoMessage: function (roomJid, subject, message) {
			var oim = '.Chat.onInfoMessage -> ',
				cur_roomJid = candy.view.getCurrent().roomJid,
				html;

			msos.console.debug(temp_cvp + oim + 'start, subject: ' + subject + ', roomJid in: ' + roomJid + ', current: ' + cur_roomJid);

			// Simply dismiss info message if no room joined so far. TODO: maybe we should show those messages on a dedicated pane?
			if (cur_roomJid) {
				html = Mustache.render(
					candy.view.template.Chat.infoMessage,
					{
						subject: subject,
						message: candy.view.i18n[message],
						time: candy.util.localizedTime(new Date())
					}
				);
				_cvp.Room.appendToMessagePane(roomJid, html);
				if (cur_roomJid === roomJid) {
					_cvp.Room.scrollToBottom(cur_roomJid);
				}
			}
			msos.console.debug(temp_cvp + oim + 'done!');
		},

		Toolbar: {

			show: function () {
				jQuery('#chat-toolbar').show();
			},

			hide: function () {
				jQuery('#chat-toolbar').hide();
			},

			playSound: function () {
				_cvp.Chat.Toolbar.onPlaySound();
			},

			/* Don't call this method directly. Call 'playSound()' instead.
			 * 'playSound()' will only call this method if sound is enabled.
			 */
			onPlaySound: function () {
				var chatSoundPlayer = document.getElementById('chat-sound-player');
				chatSoundPlayer.SetVariable('method:stop', '');
				chatSoundPlayer.SetVariable('method:play', '');
			},

			//Toggle sound (overwrite 'playSound()') and handle cookies.
			onSoundControlClick: function () {
				var control = jQuery('#chat-sound-control');
				if (control.hasClass('checked')) {
					_cvp.Chat.Toolbar.playSound = function () {};
					msos.cookie('candy-nosound', '1');
				} else {
					_cvp.Chat.Toolbar.playSound = function () {
						_cvp.Chat.Toolbar.onPlaySound();
					};
					msos.cookie('candy-nosound', null);	// Delete cookie
				}
				control.toggleClass('checked');
			},

			onAutoscrollControlClick: function () {
				var control = jQuery('#chat-autoscroll-control');
				if (control.hasClass('checked')) {
					_cvp.Room.scrollToBottom = function (roomJid) {
						_cvp.Room.onScrollToStoredPosition(roomJid);
					};
					_cvp.Window.autoscroll = false;
				} else {
					_cvp.Room.scrollToBottom = function (roomJid) {
						_cvp.Room.onScrollToBottom(roomJid);
					};
					_cvp.Room.scrollToBottom(candy.view.getCurrent().roomJid);
					_cvp.Window.autoscroll = true;
				}
				control.toggleClass('checked');
			},

			onStatusMessageControlClick: function () {
				var control = jQuery('#chat-statusmessage-control');
				if (control.hasClass('checked')) {
					_cvp.Chat.infoMessage = function () {};
					msos.cookie('candy-nostatusmessages', '1');
				} else {
					_cvp.Chat.infoMessage = function (roomJid, subject, message) {
						_cvp.Chat.onInfoMessage(roomJid, subject, message);
					};
					msos.cookie('candy-nostatusmessages', null);	// Delete cookie
				}
				control.toggleClass('checked');
			},

			updateUsercount: function (count) {
				jQuery('#chat-usercount').text(count);
			}
		},

		Modal: {

			show: function (html, showCloseControl, showSpinner) {
				var cms = '.Chat.Modal.show -> ';

				if (msos.config.verbose) {
					msos.console.debug(temp_cvp + cms + 'start.');
				}

				if (showCloseControl) {
					jQuery('#admin-message-cancel').show().click(
						function (e) {
							_cvp.Chat.Modal.hide();
							e.preventDefault();
						}
					);
				} else {
					jQuery('#admin-message-cancel').hide().click(
						function () {}
					);
				  }

				if (showSpinner)		{ jQuery('#chat-modal-spinner').show(); }
				else					{ jQuery('#chat-modal-spinner').hide(); }

				jQuery('#chat-modal').stop(false, true);
				jQuery('#chat-modal-body').html(html);
				jQuery('#chat-modal').fadeIn('fast');
				jQuery('#chat-modal-overlay').show();

				if (msos.config.verbose) {
					msos.console.debug(temp_cvp + cms + 'done!');
				}
			},

			hide: function (callback) {
				jQuery('#chat-modal').fadeOut('fast', function () {
					jQuery('#chat-modal-body').text('');
					jQuery('#chat-modal-overlay').hide();
				});
				if (callback) {
					callback();
				}
			},

			showLoginForm: function (message, presetJid) {
				var slf = '.Chat.Modal.showLoginForm -> ',
					login_form = message || '';

				msos.console.debug(temp_cvp + slf + 'start, presetJid: ' + presetJid);

				login_form += Mustache.render(
					candy.view.template.Login.form, {
						_labelUsername: candy.view.i18n.labelUsername,
						_labelPassword: candy.view.i18n.labelPassword,
						_loginSubmit:	candy.view.i18n.loginSubmit,
						displayPassword: candy.core.getOptions().annonymous ? false : true,
						displayUsername: candy.core.getOptions().annonymous ? true : !presetJid,
						presetJid: presetJid || false
					}
				);

				_cvp.Chat.Modal.show(login_form);
				jQuery('#login-form').children()[0].focus();

				// register submit handler
				jQuery('#login-form').submit(
					function (e) {
						var username = jQuery('#username').val(),
							password = jQuery('#password').val(),
							jid;

						msos.do_nothing(e);	// so submit won't just reload page on error

						msos.console.debug(temp_cvp + slf + 'submit called, jid: ' + jid + ', user: ' + username + ', pass: ' + password);

						if (!candy.core.getOptions().annonymous || !candy.wrapper.allow_annonymous) {
							// guess the input and create a jid out of it
							jid = candy.core.getUser() && username.indexOf("@") < 0 ?
								username + '@' + Strophe.getDomainFromJid(candy.core.getUser().getJid()) : username;

							if (jid.indexOf("@") < 0 && !candy.Core.getUser()) {
								candy.view.pane.Chat.Modal.showLoginForm(candy.view.i18n.loginInvalid);
							} else {
								//Candy.View.Pane.Chat.Modal.hide();
								candy.core.connect(jid, password);
							}
						} else { // anonymous login
							candy.core.connect(presetJid, null, username);
						}

						return false;
					}
				);
				msos.console.debug(temp_cvp + slf + 'done!');
			},

			showEnterPasswordForm: function (roomJid, roomName, message) {
				var spf = '.Chat.Modal.showEnterPasswordForm -> ';

				msos.console.debug(temp_cvp + spf + 'start, roomJid: ' + roomJid + ', roomName: ' + roomName);

				_cvp.Chat.Modal.show(
					Mustache.render(
						candy.view.template.PresenceError.enterPasswordForm,
						{
							roomName: roomName,
							_labelPassword: candy.view.i18n.labelPassword,
							_label: (message || msos.i18n.simple_printf(candy.view.i18n.enterRoomPassword, [roomName])),
							_joinSubmit: candy.view.i18n.enterRoomPasswordSubmit
						}
					),
					true
				);

				jQuery('#password').focus();

				// register submit handler
				jQuery('#enter-password-form').submit(
					function () {
						var password = jQuery('#password').val();

						_cvp.Chat.Modal.hide(
							function () {
								candy.core.action.Jabber.Room.Join(roomJid, password);
							}
						);
						return false;
					}
				);

				msos.console.debug(temp_cvp + spf + 'done!');
			},

			showNicknameConflictForm: function (roomJid) {
				var snc = '.Chat.Modal.showNicknameConflictForm -> ';

				msos.console.debug(temp_cvp + snc + 'start, roomJid: ' + roomJid);

				_cvp.Chat.Modal.show(
					Mustache.render(
						candy.view.template.PresenceError.nicknameConflictForm,
						{
							_labelNickname: candy.view.i18n.labelUsername,
							_label: candy.view.i18n.nicknameConflict,
							_loginSubmit: candy.view.i18n.loginSubmit
						}
					)
				);

				jQuery('#nickname').focus();

				// register submit handler
				jQuery('#nickname-conflict-form').submit(
					function () {
						var nickname = jQuery('#nickname').val();

						_cvp.Chat.Modal.hide(
							function () {
								candy.core.getUser().data.nick = nickname;
								candy.core.action.Jabber.Room.Join(roomJid);
							}
						);
						return false;
					}
				);

				msos.console.debug(temp_cvp + snc + 'done!');
			},

			showError: function (message, replacements) {
				var se = '.Chat.Modal.showNicknameConflictForm -> ';

				msos.console.debug(temp_cvp + se + 'start.');

				_cvp.Chat.Modal.show(
					Mustache.render(
						candy.view.template.PresenceError.displayError,
						{ _error: msos.i18n.simple_printf(candy.view.i18n[message], replacements) }
					),
					true
				);
				msos.console.debug(temp_cvp + se + 'done!');
			}
		},

		Tooltip: {

			show: function (event, content) {
				var tooltip = jQuery('#tooltip'),
					target = jQuery(event.currentTarget),
					html,
					pos,
					posLeft,
					posTop;

				if (!content) {
					content = target.attr('data-tooltip');
				}

				if (tooltip.length === 0) {
					html = Mustache.render(candy.view.template.Chat.tooltip);
					jQuery('#chat-pane').append(html);
					tooltip = jQuery('#tooltip');
				}

				jQuery('#context-menu').hide();

				tooltip.stop(false, true);
				tooltip.children('div').html(content);

				pos = target.offset();
				posLeft = candy.util.getPosLeftAccordingToWindowBounds(tooltip, pos.left);
				posTop  = candy.util.getPosTopAccordingToWindowBounds(tooltip, pos.top);

				tooltip.css({ 'left': posLeft.px, 'top': posTop.px, backgroundPosition: posLeft.backgroundPositionAlignment + ' ' + posTop.backgroundPositionAlignment }).fadeIn('fast');

				target.mouseleave(
					function (event) {
						event.stopPropagation();
						jQuery('#tooltip').stop(false, true).fadeOut('fast', function () { jQuery(this).css({ 'top': 0, 'left': 0 }); });
					}
				);
			}
		},

		Context: {

			init: function () {
				var ini = '.Chat.Context.init -> ',
					html;

				msos.console.debug(temp_cvp + ini + 'start.');

				if (jQuery('#context-menu').length === 0) {
					html = Mustache.render(candy.view.template.Chat.Context.menu);
					jQuery('#chat-pane').append(html);
					jQuery('#context-menu').mouseleave(
						function () {
							jQuery(this).fadeOut('fast');
						}
					);
				}
				msos.console.debug(temp_cvp + ini + 'done!');
			},

			show: function (elem, roomJid, user) {
				elem = jQuery(elem);

				var roomId = _cvp.Chat.rooms[roomJid].id,
					menu = jQuery('#context-menu'),
					links = jQuery('ul li', menu),
					menulinks,
					clickHandler,
					id,
					cs = '.Chat.Context.show -> ',
					link,
					html,
					pos,
					posLeft,
					posTop;

				msos.console.debug(temp_cvp + cs + 'start, roomJid: ' + roomJid + ', user: ' + user);

				jQuery('#tooltip').hide();

				user = user || candy.core.getUser();

				links.remove();

				menulinks = this.getMenuLinks(roomJid, user, elem);
				clickHandler = function (roomJid, user) {
					return function (event) {
						event.data.callback(event, roomJid, user);
						jQuery('#context-menu').hide();
					};
				};

				for (id in menulinks) {
					if (menulinks.hasOwnProperty(id)) {
						link = menulinks[id];
						html = Mustache.render(
							candy.view.template.Chat.Context.menulinks,
							{
								'roomId'   : roomId,
								'class'    : link['class'],
								'id'       : id,
								'label'    : link.label
							}
						);
						jQuery('ul', menu).append(html);
						jQuery('#context-menu-' + id).bind('click', link, clickHandler(roomJid, user));
					}
				}
				// if 'id' is set the menu is not empty
				if (id) {
					pos = elem.offset();
					posLeft = candy.util.getPosLeftAccordingToWindowBounds(menu, pos.left);
					posTop  = candy.util.getPosTopAccordingToWindowBounds(menu, pos.top);

					menu.css(
						{
							'left': posLeft.px,
							'top': posTop.px,
							backgroundPosition: posLeft.backgroundPositionAlignment + ' ' + posTop.backgroundPositionAlignment
						}
					);
					menu.fadeIn('fast');

					candy.view.event.Roster.afterContextMenu({ 'roomJid' : roomJid, 'user' : user, 'element': menu });

					msos.console.debug(temp_cvp + cs + 'done, menu created!');
					return true;
				}
				msos.console.debug(temp_cvp + cs + 'done, no menu!');
				return false;
			},

			getMenuLinks: function (roomJid, user, elem) {
				var menulinks = null,
					gml = '.Chat.Context.getMenuLinks -> ',
					id;

				msos.console.debug(temp_cvp + gml + 'start.');

				menulinks = jQuery.extend(
					this.initialMenuLinks(elem),
					candy.view.event.Roster.onContextMenu(
						{ 'roomJid' : roomJid, 'user' : user, 'elem': elem }
					)
				);

				for (id in menulinks) {
					if  (menulinks.hasOwnProperty(id)
					 &&  menulinks[id].requiredPermission !== undefined
					 && !menulinks[id].requiredPermission(user, _cvp.Room.getUser(roomJid), elem)) {
						delete menulinks[id];
					}
				}
				msos.console.debug(temp_cvp + gml + 'done!');
				return menulinks;
			},

			initialMenuLinks: function () {
				var iml = '.Chat.Context.initialMenuLinks -> ',
					output = {};

				msos.console.debug(temp_cvp + iml + 'start.');

				output = {
					'private': {
						requiredPermission: function (user, me) {
							return me.getNick() !== user.getNick() && candy.core.getRoom(candy.view.getCurrent().roomJid) && !candy.core.getUser().isInPrivacyList('ignore', user.getJid());
						},
						'class' : 'private',
						'label' : candy.view.i18n.privateActionLabel,
						'callback' : function (e, roomJid, user) {
							jQuery('#user-' + candy.util.jidToId(roomJid) + '-' + candy.util.jidToId(user.getJid())).click();
						}
					},
					'ignore': {
						requiredPermission: function (user, me) {
							return me.getNick() !== user.getNick() && !candy.core.getUser().isInPrivacyList('ignore', user.getJid());
						},
						'class' : 'ignore',
						'label' : candy.view.i18n.ignoreActionLabel,
						'callback' : function (e, roomJid, user) {
							candy.view.pane.Room.ignoreUser(roomJid, user.getJid());
						}
					},
					'unignore': {
						requiredPermission: function (user, me) {
							return me.getNick() !== user.getNick() && candy.core.getUser().isInPrivacyList('ignore', user.getJid());
						},
						'class' : 'unignore',
						'label' : candy.view.i18n.unignoreActionLabel,
						'callback' : function (e, roomJid, user) {
							candy.view.pane.Room.unignoreUser(roomJid, user.getJid());
						}
					},
					'kick': {
						requiredPermission: function (user, me) {
							return me.getNick() !== user.getNick() && me.isModerator() && !user.isModerator();
						},
						'class' : 'kick',
						'label' : candy.view.i18n.kickActionLabel,
						'callback' : function (e, roomJid, user) {
							_cvp.Chat.Modal.show(Mustache.render(candy.view.template.Chat.Context.contextModalForm, {
								_label: candy.view.i18n.reason,
								_submit: candy.view.i18n.kickActionLabel
							}), true);
							jQuery('#context-modal-field').focus();
							jQuery('#context-modal-form').submit(function () {
								candy.core.action.Jabber.Room.Admin.UserAction(roomJid, user.getJid(), 'kick', jQuery('#context-modal-field').val());
								_cvp.Chat.Modal.hide();
								return false; // stop propagation & preventDefault, as otherwise you get disconnected (wtf?)
							});
						}
					},
					'ban': {
						requiredPermission: function (user, me) {
							return me.getNick() !== user.getNick() && me.isModerator() && !user.isModerator();
						},
						'class' : 'ban',
						'label' : candy.view.i18n.banActionLabel,
						'callback' : function (e, roomJid, user) {
							_cvp.Chat.Modal.show(Mustache.render(candy.view.template.Chat.Context.contextModalForm, {
								_label: candy.view.i18n.reason,
								_submit: candy.view.i18n.banActionLabel
							}), true);
							jQuery('#context-modal-field').focus();
							jQuery('#context-modal-form').submit(function () {
								candy.core.action.Jabber.Room.Admin.UserAction(roomJid, user.getJid(), 'ban', jQuery('#context-modal-field').val());
								_cvp.Chat.Modal.hide();
								return false; // stop propagation & preventDefault, as otherwise you get disconnected (wtf?)
							});
						}
					},
					'subject': {
						requiredPermission: function (user, me) {
							return me.getNick() === user.getNick() && me.isModerator();
						},
						'class': 'subject',
						'label' : candy.view.i18n.setSubjectActionLabel,
						'callback': function (e, roomJid, user) {
							_cvp.Chat.Modal.show(Mustache.render(candy.view.template.Chat.Context.contextModalForm, {
								_label: candy.view.i18n.subject,
								_submit: candy.view.i18n.setSubjectActionLabel
							}), true);
							jQuery('#context-modal-field').focus();
							jQuery('#context-modal-form').submit(function (e) {
								candy.core.action.Jabber.Room.Admin.SetSubject(roomJid, jQuery('#context-modal-field').val());
								_cvp.Chat.Modal.hide();
								e.preventDefault();
							});
						}
					}
				};

				msos.console.debug(temp_cvp + iml + 'done!');
				return output;
			},

			showEmoticonsMenu: function (elem) {
				elem = jQuery(elem);
				var sem = '.Chat.Context.showEmoticonsMenu -> ',
					pos = elem.offset(),
					menu = jQuery('#context-menu'),
					content = jQuery('ul', menu),
					emoticons = '',
					i,
					posLeft,
					posTop;

				msos.console.debug(temp_cvp + sem + 'start.');

				jQuery('#tooltip').hide();

				for (i = candy.util.Parser.emoticons.length - 1; i >= 0; i -= 1) {
					emoticons = '<img src="' + candy.util.Parser._emoticonPath + candy.util.Parser.emoticons[i].image + '" alt="' + candy.util.Parser.emoticons[i].plain + '" />' + emoticons;
				}
				content.html('<li class="emoticons">' + emoticons + '</li>');
				content.find('img').click(
					function () {
						var input = candy.view.pane.Room.getPane(candy.view.getCurrent().roomJid, '#message-form').children('.field'),
							value = input.val(),
							emoticon = jQuery(this).attr('alt') + ' ';

						input.val(value ? value + ' ' + emoticon : emoticon).focus();
					}
				);

				posLeft = candy.util.getPosLeftAccordingToWindowBounds(menu, pos.left);
				posTop  = candy.util.getPosTopAccordingToWindowBounds(menu, pos.top);

				menu.css(
					{
						'left': posLeft.px,
						'top': posTop.px,
						backgroundPosition: posLeft.backgroundPositionAlignment + ' ' + posTop.backgroundPositionAlignment
					}
				);
				menu.fadeIn('fast');

				msos.console.debug(temp_cvp + sem + 'done!');
				return true;
			}
		}
	};

	_cvp.Room = {

		init: function (roomJid, roomName, roomType) {
			roomType = roomType || 'groupchat';

			var ri = '.Room.init -> ',
				roomId;

			msos.console.debug(temp_cvp + ri + 'start, roomJid: ' + roomJid + ', roomName: ' + roomName + ', roomType: ' + roomType);

			roomId = candy.util.jidToId(roomJid);

			_cvp.Chat.rooms[roomJid] = {
				id: roomId,
				usercount: 0,
				name: roomName,
				type: roomType,
				messageCount: 0,
				scrollPosition: -1
			};

			jQuery('#chat-rooms').append(
				Mustache.render(
					candy.view.template.Room.pane,
					{
						roomId: roomId,
						roomJid: roomJid,
						roomType: roomType,
						form: {
							_messageSubmit: candy.view.i18n.messageSubmit
						},
						roster: {
							_userOnline: candy.view.i18n.userOnline
						}
					},
					{
						roster:		candy.view.template.Roster.pane,
						messages:	candy.view.template.Message.pane,
						form:		candy.view.template.Room.form
					}
				)
			);

			// Add slide panel
			jQuery('#chat-room-' + roomId).find('.roster-pane').slidePanel({
				triggerName: '#trigger_' + roomId,
				triggerTopPos: '0',
				triggerRtPos: '2em',
				panelTopPos: '2.3em',		// these don't change (relative to chat room pane)
				open_icon_class: 'icon-list'
			});

			_cvp.Chat.addTab(roomJid, roomName, roomType);
			_cvp.Room.getPane(roomJid, '#message-form').submit(_cvp.Message.submit);

			candy.view.event.Room.onAdd(
				{
					'roomJid': roomJid,
					'type': roomType,
					'element': _cvp.Room.getPane(roomJid)
				}
			);

			msos.console.debug(temp_cvp + ri + 'done!');
			return roomId;
		},

		show: function (roomJid) {
			var rs = '.Room.show -> ',
				roomId = _cvp.Chat.rooms[roomJid].id;

			msos.console.debug(temp_cvp + rs + 'start, roomJid: ' + roomJid + ', roomId: ' + roomId);

			jQuery('.room-pane').each(
				function () {
					var elem = jQuery(this);
					if (elem.attr('id') === ('chat-room-' + roomId)) {
						elem.show();
						candy.view.getCurrent().roomJid = roomJid;
						_cvp.Chat.updateToolbar(roomJid);
						_cvp.Chat.setActiveTab(roomJid);
						_cvp.Chat.clearUnreadMessages(roomJid);
						_cvp.Room.setFocusToForm(roomJid);
						_cvp.Room.scrollToBottom(roomJid);

						candy.view.event.Room.onShow({'roomJid': roomJid, 'element' : elem});
					} else {
						elem.hide();

						candy.view.event.Room.onHide({'roomJid': roomJid, 'element' : elem});
					}
				}
			);

			msos.console.debug(temp_cvp + rs + 'done!');
		},

		setSubject: function (roomJid, subject) {
			var rss = '.Room.setSubject -> ',
				html;

			msos.console.debug(temp_cvp + rss + 'start, roomJid: ' + roomJid + ', subject: ' + subject);

			html = Mustache.render(
				candy.view.template.Room.subject,
				{
					subject: subject,
					roomName: _cvp.Chat.rooms[roomJid].name,
					_roomSubject: candy.view.i18n.roomSubject,
					time: candy.util.localizedTime(new Date())
				}
			);

			_cvp.Room.appendToMessagePane(roomJid, html);
			_cvp.Room.scrollToBottom(roomJid);

			candy.view.event.Room.onSubjectChange(
				{
					'roomJid': roomJid,
					'element' : _cvp.Room.getPane(roomJid),
					'subject' : subject
				}
			);
			msos.console.debug(temp_cvp + rss + 'done!');
		},

		// Parameters: (String) roomJid - Room to close
		close: function (roomJid) {
			var rcl = '.Room.close -> ',
				openRooms;

			msos.console.debug(temp_cvp + rcl + 'start, roomJid: ' + roomJid);

			_cvp.Chat.removeTab(roomJid);
			_cvp.Window.clearUnreadMessages();
			_cvp.Room.getPane(roomJid).remove();

			openRooms = jQuery('#chat-rooms').children();

			if (candy.view.getCurrent().roomJid === roomJid) {
				candy.view.getCurrent().roomJid = null;
				if (openRooms.length === 0) {
					_cvp.Chat.allTabsClosed();
				} else {
					_cvp.Room.show(openRooms.last().attr('data-roomjid'));
				}
			}
			delete _cvp.Chat.rooms[roomJid];

			candy.view.event.Room.onClose({ 'roomJid' : roomJid });
			msos.console.debug(temp_cvp + rcl + 'done!');
		},

		appendToMessagePane: function (roomJid, html) {
			var amp = '.Room.appendToMessagePane -> ';

			msos.console.debug(temp_cvp + amp + 'start, roomJid: ' + roomJid);

			_cvp.Room.getPane(roomJid, '.message-pane').append(html);
			_cvp.Chat.rooms[roomJid].messageCount += 1;
			_cvp.Room.sliceMessagePane(roomJid);

			msos.console.debug(temp_cvp + amp + 'done!');
		},

		sliceMessagePane: function (roomJid) {
			var smp = '.Room.sliceMessagePane -> ',
			options;

			msos.console.debug(temp_cvp + smp + 'start, roomJid: ' + roomJid);

			// Only clean if autoscroll is enabled
			if (_cvp.Window.autoscroll) {
				options = candy.view.getOptions().messages;
				if (_cvp.Chat.rooms[roomJid].messageCount > options.limit) {
					_cvp.Room.getPane(roomJid, '.message-pane').children().slice(0, options.remove * 2).remove();
					_cvp.Chat.rooms[roomJid].messageCount -= options.remove;
				}
			}
			msos.console.debug(temp_cvp + smp + 'done!');
		},

		scrollToBottom: function (roomJid) {
			_cvp.Room.onScrollToBottom(roomJid);
		},

		onScrollToBottom: function (roomJid) {
			var osb = '.Room.onScrollToBottom -> ',
				messagePane;

			msos.console.debug(temp_cvp + osb + 'start, roomJid: ' + roomJid);

			messagePane = _cvp.Room.getPane(roomJid, '.message-pane-wrapper');
			messagePane.scrollTop(messagePane.prop('scrollHeight'));

			msos.console.debug(temp_cvp + osb + 'done!');
		},

		onScrollToStoredPosition: function (roomJid) {
			if (_cvp.Chat.rooms[roomJid].scrollPosition > -1) {
				var messagePane = _cvp.Room.getPane(roomJid, '.message-pane-wrapper');
				messagePane.scrollTop(_cvp.Chat.rooms[roomJid].scrollPosition);
				_cvp.Chat.rooms[roomJid].scrollPosition = -1;
			}
		},

		setFocusToForm: function (roomJid) {
			var pane = _cvp.Room.getPane(roomJid, '#message-form');
			if (pane && pane.children('.field')) {
				pane.children('.field')[0].focus();
			}
		},

		setUser: function (roomJid, user) {
			_cvp.Chat.rooms[roomJid].user = user;

			var su = '.Room.setUser -> ',
				roomPane = _cvp.Room.getPane(roomJid),
				chatPane = jQuery('#chat-pane');

			msos.console.debug(temp_cvp + su + 'start, roomJid: ' + roomJid + ', user: ' + user);

			roomPane.attr('data-userjid', user.getJid());
			// Set classes based on user role / affiliation
			if (user.isModerator()) {
				if (user.getRole() === user.ROLE_MODERATOR) {
					chatPane.addClass('role-moderator');
				}
				if (user.getAffiliation() === user.AFFILIATION_OWNER) {
					chatPane.addClass('affiliation-owner');
				}
			} else {
				chatPane.removeClass('role-moderator affiliation-owner');
			}
			_cvp.Chat.Context.init();

			msos.console.debug(temp_cvp + su + 'done!');
		},

		getUser: function (roomJid) {
			return _cvp.Chat.rooms[roomJid].user;
		},

		ignoreUser: function (roomJid, userJid) {
			candy.core.action.Jabber.Room.IgnoreUnignore(userJid);
			candy.view.pane.Room.addIgnoreIcon(roomJid, userJid);
		},

		unignoreUser: function (roomJid, userJid) {
			candy.core.action.Jabber.Room.IgnoreUnignore(userJid);
			candy.view.pane.Room.removeIgnoreIcon(roomJid, userJid);
		},

		addIgnoreIcon: function (roomJid, userJid) {
			if (candy.view.pane.Chat.rooms[userJid]) {
				jQuery('#user-' + candy.view.pane.Chat.rooms[userJid].id + '-' + candy.util.jidToId(userJid)).addClass('status-ignored');
			}
			if (candy.view.pane.Chat.rooms[Strophe.getBareJidFromJid(roomJid)]) {
				jQuery('#user-' + candy.view.pane.Chat.rooms[Strophe.getBareJidFromJid(roomJid)].id + '-' + candy.util.jidToId(userJid)).addClass('status-ignored');
			}
		},

		removeIgnoreIcon: function (roomJid, userJid) {
			if (candy.view.pane.Chat.rooms[userJid]) {
				jQuery('#user-' + candy.view.pane.Chat.rooms[userJid].id + '-' + candy.util.jidToId(userJid)).removeClass('status-ignored');
			}
			if (candy.view.pane.Chat.rooms[Strophe.getBareJidFromJid(roomJid)]) {
				jQuery('#user-' + candy.view.pane.Chat.rooms[Strophe.getBareJidFromJid(roomJid)].id + '-' + candy.util.jidToId(userJid)).removeClass('status-ignored');
			}
		},

		getPane: function (roomJid, subPane) {
			var gp = '.Room.getPane -> ';

			msos.console.debug(temp_cvp + gp + 'start, roomJid: ' + roomJid);

			if (_cvp.Chat.rooms[roomJid]) {
				if (subPane) {
					if (_cvp.Chat.rooms[roomJid]['pane-' + subPane]) {

						msos.console.debug(temp_cvp + gp + 'done, specified subPane!');
						return _cvp.Chat.rooms[roomJid]['pane-' + subPane];
					}
					_cvp.Chat.rooms[roomJid]['pane-' + subPane] = jQuery('#chat-room-' + _cvp.Chat.rooms[roomJid].id).find(subPane);

					msos.console.debug(temp_cvp + gp + 'done, find/record subPane!');
					return _cvp.Chat.rooms[roomJid]['pane-' + subPane];
				}
				msos.console.debug(temp_cvp + gp + 'done, room as pane!');
				return jQuery('#chat-room-' + _cvp.Chat.rooms[roomJid].id);
			}

			msos.console.error(temp_cvp + gp + 'no room for roomJid: ' + roomJid);
			return null;
		}
	};

	_cvp.PrivateRoom = {

		open: function (roomJid, roomName, switchToRoom, isNoConferenceRoomJid) {
			var op = '.PrivateRoom.open -> ',
				user = isNoConferenceRoomJid ? candy.core.getUser() : _cvp.Room.getUser(Strophe.getBareJidFromJid(roomJid));

			msos.console.debug(temp_cvp + op + 'start, roomJid: ' + roomJid + ', roomName: ' + roomName + ', user: ' + user);

			// if target user is in privacy list, don't open the private chat.
			if (candy.core.getUser().isInPrivacyList('ignore', roomJid)) {
				return false;
			}
			if (!_cvp.Chat.rooms[roomJid]) {
				_cvp.Room.init(roomJid, roomName, 'chat');
			}
			if (switchToRoom) {
				_cvp.Room.show(roomJid);
			}
			_cvp.Roster.update(roomJid, new candy.core.chatuser(roomJid, roomName), 'join', user);
			_cvp.Roster.update(roomJid, user, 'join', user);
			_cvp.PrivateRoom.setStatus(roomJid, 'join');

			// We can't track the presence of a user if it's not a conference jid
			if (isNoConferenceRoomJid) {
				_cvp.Chat.infoMessage(
					roomJid,
					candy.view.i18n.presenceUnknownWarningSubject,
					candy.view.i18n.presenceUnknownWarning
				);
			}

			candy.view.event.Room.onAdd(
				{
					'roomJid': roomJid,
					type: 'chat',
					'element':
					_cvp.Room.getPane(roomJid)
				}
			);

			msos.console.debug(temp_cvp + op + 'done!');
			return true;
		},

		setStatus: function (roomJid, status) {
			var ss = '.PrivateRoom.setStatus -> ',
				messageForm = _cvp.Room.getPane(roomJid, '#message-form');

			msos.console.debug(temp_cvp + ss + 'start, roomJid: ' + roomJid + ', status: ' + status);

			if (status === 'join') {
				_cvp.Chat.getTab(roomJid).addClass('online').removeClass('offline');

				messageForm.children('.field').removeAttr('disabled');
				messageForm.children('.submit').removeAttr('disabled');

				_cvp.Chat.getTab(roomJid);
			} else {
				_cvp.Chat.getTab(roomJid).addClass('offline').removeClass('online');

				messageForm.children('.field').attr('disabled', true);
				messageForm.children('.submit').attr('disabled', true);
			}
			msos.console.debug(temp_cvp + ss + 'done!');
		}
	};

	_cvp.Roster = {

		update: function (roomJid, user, action, currentUser) {
			var ru = '.Roster.update -> ',
				roomId = _cvp.Chat.rooms[roomJid].id,
				userId = candy.util.jidToId(user.getJid()),
				usercountDiff = -1,
				html,
				userElem,
				userInserted,
				rosterPane,
				userSortCompare,
				elem;

			msos.console.debug(temp_cvp + ru + 'start, roomJid: ' + roomJid + ', user: ' + user + ', action: ' + action);

			// a user joined the room
			if (action === 'join') {
				usercountDiff = 1;
				html = Mustache.render(
					candy.view.template.Roster.user,
					{
						roomId: roomId,
						userId : userId,
						userJid: user.getJid(),
						nick: user.getNick(),
						displayNick: candy.util.crop(user.getNick(), candy.view.getOptions().crop.roster.nickname),
						role: user.getRole(),
						affiliation: user.getAffiliation(),
						me: currentUser !== undefined && user.getNick() === currentUser.getNick(),
						tooltipRole: candy.view.i18n.tooltipRole,
						tooltipIgnored: candy.view.i18n.tooltipIgnored
					}
				);

				userElem = jQuery('#user-' + roomId + '-' + userId);

				if (userElem.length < 1) {
					userInserted = false;
					rosterPane = _cvp.Room.getPane(roomJid, '.roster-pane');

					// there are already users in the roster
					if (rosterPane.children().length > 0) {
						// insert alphabetically
						userSortCompare = user.getNick().toUpperCase();
						rosterPane.children().each(
							function () {
								var elem = jQuery(this);

								if (elem.attr('data-nick').toUpperCase() > userSortCompare) {
									elem.before(html);
									userInserted = true;
									return false;
								}
								return true;
							}
						);
					}
					// first user in roster
					if (!userInserted) {
						rosterPane.append(html);
					}

					_cvp.Roster.joinAnimation('user-' + roomId + '-' + userId);

					// only show other users joining & don't show if there's no message in the room.
					if (currentUser !== undefined && user.getNick() !== currentUser.getNick() && _cvp.Room.getUser(roomJid)) {
						// always show join message in private room, even if status messages have been disabled
						if (_cvp.Chat.rooms[roomJid].type === 'chat') {
							_cvp.Chat.onInfoMessage(roomJid, msos.i18n.simple_printf(candy.view.i18n.userJoinedRoom, [user.getNick()]));
						} else {
							_cvp.Chat.infoMessage(roomJid, msos.i18n.simple_printf(candy.view.i18n.userJoinedRoom, [user.getNick()]));
						}
					}
				// user is in room but maybe the affiliation/role has changed
				} else {
					usercountDiff = 0;
					userElem.replaceWith(html);
					jQuery('#user-' + roomId + '-' + userId).css({ opacity: 1 }).show();
				}

				// Presence of client
				if (currentUser !== undefined && currentUser.getNick() === user.getNick()) {
					_cvp.Room.setUser(roomJid, user);
				// add click handler for private chat
				} else {
					jQuery('#user-' + roomId + '-' + userId).click(_cvp.Roster.userClick);
				}

				jQuery('#user-' + roomId + '-' + userId + ' .context').click(function (e) {
					_cvp.Chat.Context.show(e.currentTarget, roomJid, user);
					e.stopPropagation();
				});

				// check if current user is ignoring the user who has joined.
				if (currentUser !== undefined && currentUser.isInPrivacyList('ignore', user.getJid())) {
					candy.view.pane.Room.addIgnoreIcon(roomJid, user.getJid());
				}

			// a user left the room
			} else if (action === 'leave') {
				_cvp.Roster.leaveAnimation('user-' + roomId + '-' + userId);
				// always show leave message in private room, even if status messages have been disabled
				if (_cvp.Chat.rooms[roomJid].type === 'chat') {
					_cvp.Chat.onInfoMessage(roomJid, msos.i18n.simple_printf(candy.view.i18n.userLeftRoom, [user.getNick()]));
				} else {
					_cvp.Chat.infoMessage(roomJid, msos.i18n.simple_printf(candy.view.i18n.userLeftRoom, [user.getNick()]));
				}
			// user has been kicked
			} else if (action === 'kick') {
				_cvp.Roster.leaveAnimation('user-' + roomId + '-' + userId);
				_cvp.Chat.onInfoMessage(roomJid, msos.i18n.simple_printf(candy.view.i18n.userHasBeenKickedFromRoom, [user.getNick()]));
			// user has been banned
			} else if (action === 'ban') {
				_cvp.Roster.leaveAnimation('user-' + roomId + '-' + userId);
				_cvp.Chat.onInfoMessage(roomJid, msos.i18n.simple_printf(candy.view.i18n.userHasBeenBannedFromRoom, [user.getNick()]));
			}

			// Update user count
			candy.view.pane.Chat.rooms[roomJid].usercount += usercountDiff;

			if (roomJid === candy.view.getCurrent().roomJid) {
				candy.view.pane.Chat.Toolbar.updateUsercount(candy.view.pane.Chat.rooms[roomJid].usercount);
			}

			candy.view.event.Roster.onUpdate(
				{
					'roomJid' : roomJid,
					'user' : user,
					'action': action,
					'element': jQuery('#user-' + roomId + '-' + userId)
				}
			);

			msos.console.debug(temp_cvp + ru + 'done!');
		},

		userClick: function () {
			var elem = jQuery(this);
			_cvp.PrivateRoom.open(elem.attr('data-jid'), elem.attr('data-nick'), true);
		},

		// Parameters: (String) elementId - Specific element to do the animation on
		joinAnimation: function (elementId) {
			jQuery('#' + elementId).stop(true).slideDown('normal', function () { jQuery(this).animate({ opacity: 1 }); });
		},

		// Parameters: (String) elementId - Specific element to do the animation on
		leaveAnimation: function (elementId) {
			jQuery('#' + elementId).stop(true).attr('id', '#' + elementId + '-leaving').animate({ opacity: 0 }, {
				complete: function () {
					jQuery(this).slideUp('normal', function () { jQuery(this).remove(); });
				}
			});
		}
	};

	_cvp.Message = {

		submit: function (event) {
			var roomType = candy.view.pane.Chat.rooms[candy.view.getCurrent().roomJid].type,
				message = jQuery(this).children('.field').val().substring(0, candy.view.getOptions().crop.message.body);

			message = candy.view.event.Message.beforeSend(message);

			candy.core.action.Jabber.Room.Message(candy.view.getCurrent().roomJid, message, roomType);
			// Private user chat. Jabber won't notify the user who has sent the message. Just show it as the user hits the button...
			if (roomType === 'chat' && message) {
				_cvp.Message.show(
					candy.view.getCurrent().roomJid,
					_cvp.Room.getUser(candy.view.getCurrent().roomJid).getNick(),
					message
				);
			}
			// Clear input and set focus to it
			jQuery(this).children('.field').val('').focus();
			event.preventDefault();
		},

		show: function (roomJid, name, message, timestamp) {
			var ms = '.Message.show -> ',
				html,
				elem,
				locale_time = timestamp ? new Date(timestamp) : new Date();

			msos.console.debug(temp_cvp + ms + 'start, roomJid: ' + roomJid + ', name: ' + name + ', timestamp: ' + locale_time);

			message = candy.util.Parser.all(message.substring(0, candy.view.getOptions().crop.message.body));
			message = candy.view.event.Message.beforeShow(
				{
					'roomJid': roomJid,
					'nick': name,
					'message': message
				}
			);

			if (!message) {
				msos.console.debug(temp_cvp + ms + 'done, no message!');
				return;
			}

			html = Mustache.render(
				candy.view.template.Message.item,
				{
					name: name,
					displayName: candy.util.crop(name, candy.view.getOptions().crop.message.nickname),
					message: message,
					time: candy.util.localizedTime(locale_time)
				}
			);

			_cvp.Room.appendToMessagePane(roomJid, html);

			elem = _cvp.Room.getPane(roomJid, '.message-pane').children().last();

			// click on username opens private chat
			elem.find('a.name').click(
				function (event) {
					event.preventDefault();
					// Check if user is online and not myself
					if (name !== _cvp.Room.getUser(candy.view.getCurrent().roomJid).getNick()
					 && candy.core.getRoom(roomJid).getRoster().get(roomJid + '/' + name)) {
						candy.view.pane.PrivateRoom.open(roomJid + '/' + name, name, true);
					}
				}
			);

			// Notify the user about a new private message
			if (candy.view.getCurrent().roomJid !== roomJid || !_cvp.Window.hasFocus()) {
				_cvp.Chat.increaseUnreadMessages(roomJid);
				if (candy.view.pane.Chat.rooms[roomJid].type === 'chat' && !_cvp.Window.hasFocus()) {
					_cvp.Chat.Toolbar.playSound();
				}
			}
			if (candy.view.getCurrent().roomJid === roomJid) {
				_cvp.Room.scrollToBottom(roomJid);
			}

			candy.view.event.Message.onShow(
				{
					'roomJid':	roomJid,
					'element':	elem,
					'nick':		name,
					'message':	message
				}
			);

			msos.console.debug(temp_cvp + ms + 'done!');
		}
	};
};
