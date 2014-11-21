

msos.provide("bootstrap.jumbotron");

bootstrap.jumbotron.version = new msos.set_version(14, 2, 26);


// Start by loading our stylesheets
bootstrap.jumbotron.css = new msos.loader();
bootstrap.jumbotron.css.load('bootstrap_css_jumbotron', msos.resource_url('bootstrap', 'css/jumbotron.css'));
