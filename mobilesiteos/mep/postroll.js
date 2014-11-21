
/*global
    msos: false,
    jQuery: false
*/

msos.provide("mep.postroll");

mep.postroll.version = new msos.set_version(14, 6, 15);


// Start by loading our progress.css stylesheet
mep.postroll.css = new msos.loader();
mep.postroll.css.load('mep_postroll_css', msos.resource_url('mep', 'css/postroll.css'));


mep.postroll.start = function () {
	"use strict";

    jQuery.extend(

    mep.player.controls, {

		buildpostroll: function(ply_obj) {

			var postrollLink = ply_obj.container.find('script[type="text/postroll"]').attr('src');

			if (postrollLink !== undefined) {
				ply_obj.postroll =
					jQuery(
						'<div class="mejs-postroll-layer mejs-layer">' +
							'<a class="mejs-postroll-close" onclick="jQuery(this).parent().hide();return false;">' + ply_obj.options.i18n.close + '</a>' +
							'<div class="mejs-postroll-layer-content"></div>' +
						'</div>'
					).prependTo(ply_obj.layers).hide();

				ply_obj.media.addEventListener(
					'ended',
					function (e) {
						jQuery.ajax({
							dataType: 'html',
							url: postrollLink,
							success: function (data, textStatus) {
								ply_obj.layers.find('.mejs-postroll-layer-content').html(data);
							}
						});
						ply_obj.postroll.show();
					},
					false
				);
			}
		}
	});
};

// Load early, but after 'mep.player' has loaded
msos.onload_func_start.push(mep.postroll.start);