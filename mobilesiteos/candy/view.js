/** File: view.js
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
    Mustache: false
*/

msos.provide("candy.view");
msos.require("candy.view.pane");
msos.require("candy.view.observer");
msos.require("candy.view.template");
msos.require("candy.core.event");
msos.require("candy.util");
msos.require("jquery.tools.slidepanel");
msos.require("msos.i18n.candy");

if (candy.wrapper.use_timeago)	{ msos.require("candy.date.timeago"); }
else							{ msos.require("candy.date.international"); }

candy.view.version = new msos.set_version(14, 10, 8);


candy.view.init = function (container, options) {
	"use strict";

	var temp_vw = 'candy.view.init -> ',
		_evt = candy.core.event,
		_obs = candy.view.observer,
		_pne = candy.view.pane,
		_tpl = candy.view.template,
		_current = {
			container: null,
			roomJid: null
		},
		_options = {
			messages: { limit: 200, remove: 50 },
			crop: {
				message: { nickname: 15, body: 200 },
				roster:  { nickname: 15 }
			}
		},
		_i18n = msos.i18n.candy.bundle;

	msos.console.debug(temp_vw + 'start.');

	jQuery.extend(true, _options, options);

	candy.view.i18n = _i18n;
	candy.view.getCurrent = function () { return _current; };
	candy.view.getOptions = function () { return _options; };

	candy.util.init();

	if (candy.wrapper.use_timeago)	{ candy.date.timeago.init(); }
	else							{ candy.date.international.init(); }
	
	candy.view.pane.init();
	candy.view.observer.init();
	candy.core.event.init();

	// Set path to emoticons
	candy.util.Parser.setEmoticonPath(msos.resource_url('candy', 'images/emoticons/'));

	// Start DOMination...
	_current.container = container;
	_current.container.html(
		Mustache.render(
			_tpl.Chat.pane,
			{
				tooltipEmoticons :		_i18n.tooltipEmoticons,
				tooltipSound :			_i18n.tooltipSound,
				tooltipAutoscroll :		_i18n.tooltipAutoscroll,
				tooltipStatusmessage :	_i18n.tooltipStatusmessage,
				tooltipAdministration :	_i18n.tooltipAdministration,
				tooltipUsercount :		_i18n.tooltipUsercount,
				image_resource_path : msos.resource_url('candy', 'images/'),
				media_resource_path : msos.resource_url('media',  'candy/')
			},
			{
				tabs:			_tpl.Chat.tabs,
				rooms:			_tpl.Chat.rooms,
				modal:			_tpl.Chat.modal,
				toolbar:		_tpl.Chat.toolbar,
				soundcontrol:	_tpl.Chat.soundcontrol
			}
		)
	);

	// ... and let the elements dance.
	jQuery(window).focus(_pne.Window.onFocus).blur(_pne.Window.onBlur);

	jQuery('#emoticons-icon').click(
		function (e) {
			_pne.Chat.Context.showEmoticonsMenu(e.currentTarget);
			msos.do_nothing(e);
		}
	);

	jQuery('#chat-autoscroll-control').click(
		_pne.Chat.Toolbar.onAutoscrollControlClick
	);

	jQuery('#chat-sound-control').click(
		_pne.Chat.Toolbar.onSoundControlClick
	);

	jQuery('#chat-statusmessage-control').click(
		_pne.Chat.Toolbar.onStatusMessageControlClick
	);

	// Set sound & status based on cookie
	if (msos.cookie('candy-nosound'))			{ jQuery('#chat-sound-control').click(); }
	if (msos.cookie('candy-nostatusmessages'))	{ jQuery('#chat-statusmessage-control').click(); }

	// Add slide panel
	jQuery('#chat-toolbar').slidePanel({
		triggerName: '#trigger_toolbar',
		triggerTopPos: '0',
		panelTopPos: '2em',		// these don't change (relative to chat room pane)
		open_icon_class: 'icon-cog'
	});

	_evt.addObserver('CHAT',		_obs.Chat);
	_evt.addObserver('PRESENCE',	_obs.Presence);
	_evt.addObserver('PRES_ERROR',	_obs.PresenceError);
	_evt.addObserver('MESSAGE',		_obs.Message);
	_evt.addObserver('LOGIN',		_obs.Login);

	jQuery('body').delegate('li[data-tooltip]', 'mouseenter', _pne.Chat.Tooltip.show);

	msos.console.debug(temp_vw + 'done!');
};
