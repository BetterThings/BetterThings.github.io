
msos.provide("bootstrap.media");

bootstrap.media.version = new msos.set_version(14, 2, 26);


// Start by loading our media.css stylesheet
bootstrap.media.css = new msos.loader();
bootstrap.media.css.load('bootstrap_css_media', msos.resource_url('bootstrap', 'css/media.css'));
