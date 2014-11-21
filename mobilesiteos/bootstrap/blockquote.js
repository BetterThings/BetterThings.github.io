
msos.provide("bootstrap.blockquote");

bootstrap.blockquote.version = new msos.set_version(14, 2, 25);


// Start by loading our blockquote.css stylesheet
bootstrap.blockquote.css = new msos.loader();
bootstrap.blockquote.css.load('bootstrap_css_blockquote', msos.resource_url('bootstrap', 'css/blockquote.css'));
