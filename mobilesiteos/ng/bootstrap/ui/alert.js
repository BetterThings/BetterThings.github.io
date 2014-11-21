
msos.provide("ng.bootstrap.ui.alert");

ng.bootstrap.ui.alert.version = new msos.set_version(14, 8, 12);


// Below is the standard plugin, except for templateUrl location
angular.module('ng.bootstrap.ui.alert', [])

.controller('AlertController', ['$scope', '$attrs', function ($scope, $attrs) {
  $scope.closeable = 'close' in $attrs;
}])

.directive('alert', function () {
  return {
    restrict: 'EA',
    controller: 'AlertController',
    templateUrl: msos.resource_url('ng', 'bootstrap/ui/tmpl/alert.html'),
    transclude: true,
    replace: true,
    scope: {
      type: '@',
      close: '&'
    }
  };
});