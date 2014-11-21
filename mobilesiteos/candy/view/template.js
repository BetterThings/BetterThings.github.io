/** File: template.js
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
    candy: false
*/

msos.provide("candy.view.template");


candy.view.template = {

	Window: {
		unreadmessages: '({{count}}) {{title}}'
	},

	Chat: {
		pane: '<div id="chat-pane">{{> tabs}}<a href="#" id="trigger_toolbar" class="btn btn-msos trigger right"><i></i></a>{{> toolbar}}{{> rooms}}</div>{{> modal}}',
		rooms: '<div id="chat-rooms" class="rooms"></div>',
		tabs: '<ul id="chat-tabs"></ul>',
		tab: '<li class="roomtype-{{roomType}}" data-roomjid="{{roomJid}}" data-roomtype="{{roomType}}"><a href="#" class="label">{{#privateUserChat}}@{{/privateUserChat}}{{name}}</a><a href="#" class="transition"></a><a href="#" class="close">\u00D7</a><small class="unread"></small></li>',
		modal: '<div id="chat-modal"><a id="admin-message-cancel" class="close" href="#">\u00D7</a><span id="chat-modal-body"></span><img src="{{image_resource_path}}modal-spinner.gif" id="chat-modal-spinner" /></div><div id="chat-modal-overlay"></div>',
		adminMessage: '<dt>{{time}}</dt><dd class="adminmessage"><span class="label">{{sender}}</span>{{subject}} {{message}}</dd>',
		infoMessage: '<dt>{{time}}</dt><dd class="infomessage">{{subject}} {{message}}</dd>',
		toolbar: '<ul id="chat-toolbar"><li id="emoticons-icon" data-tooltip="{{tooltipEmoticons}}"></li><li id="chat-sound-control" class="checked" data-tooltip="{{tooltipSound}}">{{> soundcontrol}}</li><li id="chat-autoscroll-control" class="checked" data-tooltip="{{tooltipAutoscroll}}"></li><li class="checked" id="chat-statusmessage-control" data-tooltip="{{tooltipStatusmessage}}"></li><li class="context" data-tooltip="{{tooltipAdministration}}"></li><li class="usercount" data-tooltip="{{tooltipUsercount}}"><span id="chat-usercount"></span></li></ul>',
		soundcontrol:	'<script type="text/javascript">var audioplayerListener = new Object(); audioplayerListener.onInit = function() { };'
						+ '</script><object id="chat-sound-player" type="application/x-shockwave-flash" data="{{media_resource_path}}audioplayer.swf"'
						+ ' width="0" height="0"><param name="movie" value="{{media_resource_path}}audioplayer.swf" /><param name="AllowScriptAccess"'
						+ ' value="always" /><param name="FlashVars" value="listener=audioplayerListener&amp;mp3={{media_resource_path}}notify.mp3" />'
						+ '</object>',
		Context: {
			menu: '<div id="context-menu"><ul></ul></div>',
			menulinks: '<li class="{{class}}" id="context-menu-{{id}}">{{label}}</li>',
			contextModalForm: '<form action="#" id="context-modal-form"><label for="context-modal-label">{{_label}}</label><input type="text" name="contextModalField" id="context-modal-field" /><input type="submit" class="button" name="send" value="{{_submit}}" /></form>',
			adminMessageReason: '<a id="admin-message-cancel" class="close" href="#">×</a><p>{{_action}}</p>{{#reason}}<p>{{_reason}}</p>{{/reason}}'
		},
		tooltip: '<div id="tooltip"><div></div></div>'
	},

	Room: {
		pane: '<div class="room-pane roomtype-{{roomType}}" id="chat-room-{{roomId}}" data-roomjid="{{roomJid}}" data-roomtype="{{roomType}}"><a href="#" id="trigger_{{roomId}}" class="btn btn-msos trigger right"><i></i></a>{{> roster}}{{> messages}}{{> form}}</div>',
		subject: '<dt>{{time}}</dt><dd class="subject"><span class="label">{{roomName}}</span>{{_roomSubject}} {{subject}}</dd>',
		form: '<form method="post" id="message-form"><input name="message" class="field" type="text" autocomplete="off" maxlength="1000" /><button class="btn btn-msos"><i class="icon-refresh"></i></button></form>'
	},

	Roster: {
		pane: '<div class="roster-pane"></div>',
		user: '<div class="user role-{{role}} affiliation-{{affiliation}}{{#me}} me{{/me}}" id="user-{{roomId}}-{{userId}}" data-jid="{{userJid}}" data-nick="{{nick}}" data-role="{{role}}" data-affiliation="{{affiliation}}"><div class="label">{{displayNick}}</div><ul><li class="context" id="context-{{roomId}}-{{userId}}"></li><li class="role role-{{role}} affiliation-{{affiliation}}" data-tooltip="{{tooltipRole}}"></li><li class="ignore" data-tooltip="{{tooltipIgnored}}"></li></ul></div>'
	},

	Message: {
		pane: '<div class="message-pane-wrapper"><dl class="message-pane"></dl></div>',
		item: '<dt>{{time}}</dt><dd><span class="label">{{displayName}}</span>{{{message}}}</dd>'
	},

	Login: {
		form: '<form method="post" id="login-form">'
			+ '{{#displayUsername}}<label for="username">{{_labelUsername}}</label><input type="text" id="username" name="username"/>{{/displayUsername}}'
			+ '{{#presetJid}}<input type="hidden" id="username" name="username" value="{{presetJid}}"/>{{/presetJid}}'
			+ '{{#displayPassword}}<label for="password">{{_labelPassword}}</label><input type="password" id="password" name="password" />{{/displayPassword}}'
			+ '<button class="btn btn-msos"><i class=" icon-refresh"></i></button></form>'
	},

	PresenceError: {
		enterPasswordForm: '<strong>{{_label}}</strong>'
			+ '<form method="post" id="enter-password-form">'
			+ '<label for="password">{{_labelPassword}}</label><input type="password" id="password" name="password" />'
			+ '<button class="btn btn-msos"><i class="icon-refresh"></i></button></form>',
		nicknameConflictForm: '<strong>{{_label}}</strong>'
			+ '<form method="post" id="nickname-conflict-form">'
			+ '<label for="nickname">{{_labelNickname}}</label><input type="text" id="nickname" name="nickname" />'
			+ '<button class="btn btn-msos"><i class="icon-refresh"></i></button></form>',
		displayError: '<strong>{{_error}}</strong>'
	}
};
