
msos.provide("bootstrap.navigation");

bootstrap.navigation.version = new msos.set_version(14, 3, 1);


// Start by loading our navigation.css stylesheet
bootstrap.navigation.css = new msos.loader();
bootstrap.navigation.css.load('bootstrap_css_navigation', msos.resource_url('bootstrap', 'css/navigation.css'));
