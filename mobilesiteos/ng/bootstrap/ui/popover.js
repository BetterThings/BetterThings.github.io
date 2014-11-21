/**
 * The following features are still outstanding: popup delay, animation as a
 * function, placement as a function, inside, support for more triggers than
 * just mouse enter/leave, html popovers, and selector delegatation.
 */

msos.provide("ng.bootstrap.ui.popover");
msos.require("ng.bootstrap.ui.tooltip");

ng.bootstrap.ui.popover.version = new msos.set_version(14, 8, 12);


// Below is the standard plugin, except for templateUrl location
angular.module('ng.bootstrap.ui.popover', ['ng.bootstrap.ui.tooltip'])

.directive( 'popoverPopup', function () {
  return {
    restrict: 'EA',
    replace: true,
    scope: { title: '@', content: '@', placement: '@', animation: '&', isOpen: '&' },
    templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/popover.html')
  };
})

.directive( 'popover', [ '$tooltip', function ( $tooltip ) {
  return $tooltip( 'popover', 'popover', 'click' );
}]);
