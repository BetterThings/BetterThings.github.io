osm_strophe
===========

Strophe.js XMPP BOSH JavaScript library as used by MobileSiteOS

The current and development (if any) copies of Strophe.js currently being used by MobileSiteOS. These are highly modified versions of the standard files (including extensive debugging) found under https://github.com/strophe/strophejs. We also rename them by version.

For the most part, modifications were made to integrate them with MobileSiteOS and to strip out unused code (by OSM). And it should be noted that the intended progession is to move towards using just the 'ws', websocket version in the future. The standard version is only for use by those remaining browsers which don't support websocket communications.
