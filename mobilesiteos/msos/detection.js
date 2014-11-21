// Copyright Notice:
//				    detection.js
//			Copyright©2010-2013 - OpenSiteMobile
//				All rights reserved
// ==========================================================================
//			http://opensite.mobi
// ==========================================================================
// Contact Information:
//			Author: Dwight Vietzke
//			Email:  dwight_vietzke@yahoo.com
//
// OpenSiteMobile browser capabililties and plugins detection


/*global
    msos: false,
    jQuery: false,
    ActiveXObject: false
*/

msos.provide("msos.detection");

msos.detection.version = new msos.set_version(13, 6, 14);


// Set up our installed plugins
msos.detection.plugins = {};


(function () {
    "use strict";

    var plugins = {
            '3dmlw': {
                'mimeType': ['text/3dmlw'],
                'ActiveX': ['3dmlw.IEPlugin']
            },
            'djvu': {
                'mimeType': ['image/vnd.djvu', 'image/x.djvu', 'image/x-djvu'],
                'ActiveX': ['DjVuControl.DjVuCtl']
            },
            'flash': {
                'mimeType': ['application/x-shockwave-flash'],
                'ActiveX': ['ShockwaveFlash.ShockwaveFlash', 'ShockwaveFlash.ShockwaveFlash.3', 'ShockwaveFlash.ShockwaveFlash.4', 'ShockwaveFlash.ShockwaveFlash.5', 'ShockwaveFlash.ShockwaveFlash.6', 'ShockwaveFlash.ShockwaveFlash.7']
            },
            'google-talk': {
                'mimeType': ['application/googletalk'],
                'ActiveX': ['GoogleTalk.Plugin', 'GoogleTalk.Plugin.1']
            },
            'pdf': {
                'mimeType': ['application/pdf'],
                'ActiveX': ['acroPDF.PDF', 'acroPDF.PDF.1', 'PDF.PdfCtrl.1', 'PDF.PdfCtrl.4', 'PDF.PdfCtrl.5', 'PDF.PdfCtrl.6']
            },
            'quicktime': {
                'mimeType': ['video/quicktime'],
                'ActiveX': ['QuickTime.QuickTime', 'QuickTimeCheckObject.QuickTimeCheck.1', 'QuickTime.QuickTime.4']
            },
            'real-player': {
                'mimeType': ['audio/vnd.rn-realaudio', 'video/vnd.rn-realvideo', 'application/vnd.rn-realmedia', 'audio/x-pn-realaudio-plugin'],
                'ActiveX': ['RealPlayer', 'rmocx.RealPlayer G2 Control.1']
            },
            'svg-viewer': {
                'mimeType': ['image/svg-xml'],
                'ActiveX': ['Adobe.SVGCtl']
            },
            'shockwave-director': {
                'mimeType': ['application/x-director'],
                'ActiveX': ['SWCtl.SWCtl', 'SWCt1.SWCt1.7', 'SWCt1.SWCt1.8', 'SWCt1.SWCt1.9', 'ShockwaveFlash.ShockwaveFlash.1']
            },
            'silverlight': {
                'mimeType': ['application/x-silverlight', 'application/x-silverlight-2'],
                'ActiveX': ['AgControl.AgControl']
            },
            'skype': {
                'mimeType': ['application/x-skype'],
                'ActiveX': ['Skype.Detection']
            },
            'vlc': {
                'mimeType': ['application/x-google-vlc-plugin', 'application/x-vlc-plugin'],
                'ActiveX': ['VideoLAN.VLCPlugin', 'VideoLAN.VLCPlugin.1', 'VideoLAN.VLCPlugin.2']
            },
            'windows-media-player': {
                'mimeType': ['application/x-mplayer2'],
                'ActiveX': ['WMPlayer.OCX', 'MediaPlayer.MediaPlayer.1']
            },
            'xara': {
                'mimeType': ['application/vnd.xara', 'application/x-CorelXARA'],
                'ActiveX': ['XaraRender.XaraDocument', 'XaraRender.XaraDocument.1']
            }
        },
        plugin = '';

    //check support for a plugin
    function checkSupport(p) {

        var support = false,
            i = 0,
            j = 0,
            test_obj = null;

        //for standard compliant browsers
        if (navigator.mimeTypes) {
            for (i = 0; i < p.mimeType.length; i += 1) {
                if (navigator.mimeTypes[p.mimeType[i]] && navigator.mimeTypes[p.mimeType[i]].enabledPlugin) {
                    support = true;
                }
            }
        }

        //for IE
        if (typeof window.ActiveXObject !== 'undefined') {
            for (j = 0; j < p.ActiveX.length; j += 1) {
                try {
                    test_obj = new ActiveXObject(p.ActiveX[j]);
                    support = true;
                }
                catch (err) {}
            }
        }

        return support;
    }

    // Fill in our installed plugins object
    for (plugin in plugins) {
        if (checkSupport(plugins[plugin])) {
            msos.detection.plugins[plugin] = true;
        }
        else {
            msos.detection.plugins[plugin] = false;
        }
    }
}());