
/*global
    msos: false,
    jQuery: false
*/

msos.provide("bootstrap.table");

bootstrap.table.version = new msos.set_version(14, 2, 26);


// Start by loading our 'table.css' stylesheet
bootstrap.table.css = new msos.loader();
bootstrap.table.css.load('bootstrap_css_table', msos.resource_url('bootstrap', 'css/table.css'));