/*!
* MediaElement.js
* HTML5 <video> and <audio> shim and player
* http://mediaelementjs.com/
*
* Copyright 2010-2012, John Dyer (http://j.hn)
* Dual licensed under the MIT or GPL Version 2 licenses.
*
*/

/*global
    msos: false,
    jQuery: false
*/

msos.provide("mep.poster");

mep.poster.version = new msos.set_version(14, 6, 15);


mep.poster.start = function () {
	"use strict";

	// Add Poster for video
	jQuery.extend(
		mep.player.controls,
		{
			buildposter: function (ply_obj) {

				var poster = jQuery('<div class="mejs-poster">').appendTo(ply_obj.layers),
					posterUrl = ply_obj.$node.attr('poster'),
					setPoster = function (url) {
						var posterImg = poster.find('img');

						if (posterImg.length === 0) {
							posterImg = jQuery('<img width="100%" height="100%" />').appendTo(poster);
						}
						posterImg.attr('src', url);
					};

				// prioriy goes to option (this is useful if you need to support iOS 3.x (iOS completely fails with poster)
				if (ply_obj.options.poster !== '') {
					posterUrl = ply_obj.options.poster;
				}

				// second, try the real poster
				if (posterUrl !== ''
				 && posterUrl !== null) {
					setPoster(posterUrl);
				} else {
					poster.hide();
				  }

				ply_obj.media.addEventListener(
					'play',
					function () { poster.hide(); },
					false
				);

				// Make available everywhere
				ply_obj.poster = poster;
				ply_obj.setPoster = setPoster;
			}
		}
	);
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.poster.start);