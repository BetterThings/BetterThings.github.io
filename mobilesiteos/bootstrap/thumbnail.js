
msos.provide("bootstrap.thumbnail");

bootstrap.thumbnail.version = new msos.set_version(14, 2, 25);


// Start by loading our thumbnail.css stylesheet
bootstrap.thumbnail.css = new msos.loader();
bootstrap.thumbnail.css.load('bootstrap_css_thumbnail', msos.resource_url('bootstrap', 'css/thumbnail.css'));
