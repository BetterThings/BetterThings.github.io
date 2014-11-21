
msos.provide("bootstrap.pager");

bootstrap.pager.version = new msos.set_version(14, 2, 26);


// Start by loading our pager.css stylesheet
bootstrap.pager.css = new msos.loader();
bootstrap.pager.css.load('bootstrap_css_pager', msos.resource_url('bootstrap', 'css/pager.css'));
