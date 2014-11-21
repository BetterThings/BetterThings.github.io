
msos.provide("bootstrap.pagination");

bootstrap.pagination.version = new msos.set_version(14, 2, 26);


// Start by loading our pagination.css stylesheet
bootstrap.pagination.css = new msos.loader();
bootstrap.pagination.css.load('bootstrap_css_pagination', msos.resource_url('bootstrap', 'css/pagination.css'));
