/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 0.11.2 - 2014-09-26
 * License: MIT
 */

// Reduced version of angular-ui-bootstrap for just these components...which we rename for standarization with other MSOS ones
angular.module('ng.bootstrap.ui.transition', []).factory('$transition', ['$q', '$timeout', '$rootScope', function ($q, $timeout, $rootScope) {

    var $transition = function (element, trigger, options) {
            options = options || {};
            var deferred = $q.defer();
            var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];

            var transitionEndHandler = function (event) {
                    $rootScope.$apply(function () {
                        element.unbind(endEventName, transitionEndHandler);
                        deferred.resolve(element);
                    });
                };

            if (endEventName) {
                element.bind(endEventName, transitionEndHandler);
            }

            // Wrap in a timeout to allow the browser time to update the DOM before the transition is to occur
            $timeout(function () {
                if (angular.isString(trigger)) {
                    element.addClass(trigger);
                } else if (angular.isFunction(trigger)) {
                    trigger(element);
                } else if (angular.isObject(trigger)) {
                    element.css(trigger);
                }
                //If browser does not support transitions, instantly resolve
                if (!endEventName) {
                    deferred.resolve(element);
                }
            });

            // Add our custom cancel function to the promise that is returned
            // We can call this if we are about to run a new transition, which we know will prevent this transition from ending,
            // i.e. it will therefore never raise a transitionEnd event for that transition
            deferred.promise.cancel = function () {
                if (endEventName) {
                    element.unbind(endEventName, transitionEndHandler);
                }
                deferred.reject('Transition cancelled');
            };

            return deferred.promise;
        };

    // Work out the name of the transitionEnd event
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'transition': 'transitionend'
    };
    var animationEndEventNames = {
        'WebkitTransition': 'webkitAnimationEnd',
        'MozTransition': 'animationend',
        'OTransition': 'oAnimationEnd',
        'transition': 'animationend'
    };

    function findEndEventName(endEventNames) {
        for (var name in endEventNames) {
            if (transElement.style[name] !== undefined) {
                return endEventNames[name];
            }
        }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
}]);

angular.module('ng.bootstrap.ui.collapse', ['ng.bootstrap.ui.transition']).directive('collapse', ['$transition', function ($transition) {

    return {
        link: function (scope, element, attrs) {

            var initialAnimSkip = true;
            var currentTransition;

            function doTransition(change) {
                var newTransition = $transition(element, change);
                if (currentTransition) {
                    currentTransition.cancel();
                }
                currentTransition = newTransition;
                newTransition.then(newTransitionDone, newTransitionDone);
                return newTransition;

                function newTransitionDone() {
                    // Make sure it's this transition, otherwise, leave it alone.
                    if (currentTransition === newTransition) {
                        currentTransition = undefined;
                    }
                }
            }

            function expand() {
                if (initialAnimSkip) {
                    initialAnimSkip = false;
                    expandDone();
                } else {
                    element.removeClass('collapse').addClass('collapsing');
                    doTransition({
                        height: element[0].scrollHeight + 'px'
                    }).then(expandDone);
                }
            }

            function expandDone() {
                element.removeClass('collapsing');
                element.addClass('collapse in');
                element.css({
                    height: 'auto'
                });
            }

            function collapse() {
                if (initialAnimSkip) {
                    initialAnimSkip = false;
                    collapseDone();
                    element.css({
                        height: 0
                    });
                } else {
                    // CSS transitions don't work with height: auto, so we have to manually change the height to a specific value
                    element.css({
                        height: element[0].scrollHeight + 'px'
                    });
                    //trigger reflow so a browser realizes that height was updated from auto to a specific value
                    var x = element[0].offsetWidth;

                    element.removeClass('collapse in').addClass('collapsing');

                    doTransition({
                        height: 0
                    }).then(collapseDone);
                }
            }

            function collapseDone() {
                element.removeClass('collapsing');
                element.addClass('collapse');
            }

            scope.$watch(attrs.collapse, function (shouldCollapse) {
                if (shouldCollapse) {
                    collapse();
                } else {
                    expand();
                }
            });
        }
    };
}]);

angular.module('ng.bootstrap.ui.bindHtml', []).directive('bindHtmlUnsafe', function () {
    return function (scope, element, attr) {
        element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
        scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
            element.html(value || '');
        });
    };
});

angular.module('ng.bootstrap.ui.position', []).factory('$position', ['$document', '$window', function ($document, $window) {

    function getStyle(el, cssprop) {
        if (el.currentStyle) { //IE
            return el.currentStyle[cssprop];
        } else if ($window.getComputedStyle) {
            return $window.getComputedStyle(el)[cssprop];
        }
        // finally try and get inline style
        return el.style[cssprop];
    }

    /**
     * Checks if a given element is statically positioned
     * @param element - raw DOM element
     */
    function isStaticPositioned(element) {
        return (getStyle(element, 'position') || 'static') === 'static';
    }

    /**
     * returns the closest, non-statically positioned parentOffset of a given element
     * @param element
     */
    var parentOffsetEl = function (element) {
            var docDomEl = $document[0];
            var offsetParent = element.offsetParent || docDomEl;
            while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
                offsetParent = offsetParent.offsetParent;
            }
            return offsetParent || docDomEl;
        };

    return {
        /**
         * Provides read-only equivalent of jQuery's position function:
         * http://api.jquery.com/position/
         */
        position: function (element) {
            var elBCR = this.offset(element);
            var offsetParentBCR = {
                top: 0,
                left: 0
            };
            var offsetParentEl = parentOffsetEl(element[0]);
            if (offsetParentEl != $document[0]) {
                offsetParentBCR = this.offset(angular.element(offsetParentEl));
                offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
                offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
            }

            var boundingClientRect = element[0].getBoundingClientRect();
            return {
                width: boundingClientRect.width || element.prop('offsetWidth'),
                height: boundingClientRect.height || element.prop('offsetHeight'),
                top: elBCR.top - offsetParentBCR.top,
                left: elBCR.left - offsetParentBCR.left
            };
        },

        /**
         * Provides read-only equivalent of jQuery's offset function:
         * http://api.jquery.com/offset/
         */
        offset: function (element) {
            var boundingClientRect = element[0].getBoundingClientRect();
            return {
                width: boundingClientRect.width || element.prop('offsetWidth'),
                height: boundingClientRect.height || element.prop('offsetHeight'),
                top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
                left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
            };
        },

        /**
         * Provides coordinates for the targetEl in relation to hostEl
         */
        positionElements: function (hostEl, targetEl, positionStr, appendToBody) {

            var positionStrParts = positionStr.split('-');
            var pos0 = positionStrParts[0],
                pos1 = positionStrParts[1] || 'center';

            var hostElPos, targetElWidth, targetElHeight, targetElPos;

            hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);

            targetElWidth = targetEl.prop('offsetWidth');
            targetElHeight = targetEl.prop('offsetHeight');

            var shiftWidth = {
                center: function () {
                    return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
                },
                left: function () {
                    return hostElPos.left;
                },
                right: function () {
                    return hostElPos.left + hostElPos.width;
                }
            };

            var shiftHeight = {
                center: function () {
                    return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
                },
                top: function () {
                    return hostElPos.top;
                },
                bottom: function () {
                    return hostElPos.top + hostElPos.height;
                }
            };

            switch (pos0) {
            case 'right':
                targetElPos = {
                    top: shiftHeight[pos1](),
                    left: shiftWidth[pos0]()
                };
                break;
            case 'left':
                targetElPos = {
                    top: shiftHeight[pos1](),
                    left: hostElPos.left - targetElWidth
                };
                break;
            case 'bottom':
                targetElPos = {
                    top: shiftHeight[pos0](),
                    left: shiftWidth[pos1]()
                };
                break;
            default:
                targetElPos = {
                    top: hostElPos.top - targetElHeight,
                    left: shiftWidth[pos1]()
                };
                break;
            }

            return targetElPos;
        }
    };
}]);

angular.module('ng.bootstrap.ui.dropdown', [])

.constant('dropdownConfig', {
    openClass: 'open'
})

.service('dropdownService', ['$document', function ($document) {
    var openScope = null;

    this.open = function (dropdownScope) {
        if (!openScope) {
            $document.bind('click', closeDropdown);
            $document.bind('keydown', escapeKeyBind);
        }

        if (openScope && openScope !== dropdownScope) {
            openScope.isOpen = false;
        }

        openScope = dropdownScope;
    };

    this.close = function (dropdownScope) {
        if (openScope === dropdownScope) {
            openScope = null;
            $document.unbind('click', closeDropdown);
            $document.unbind('keydown', escapeKeyBind);
        }
    };

    var closeDropdown = function (evt) {

            if (!openScope) { return; }     // already done

            var toggleElement = openScope.getToggleElement();
            if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
                return;
            }

            openScope.$apply(function () {
                openScope.isOpen = false;
            });
        };

    var escapeKeyBind = function (evt) {
            if (evt.which === 27) {
                openScope.focusToggleElement();
                closeDropdown();
            }
        };
}])

.controller('DropdownController', ['$scope', '$attrs', '$parse', 'dropdownConfig', 'dropdownService', '$animate', function ($scope, $attrs, $parse, dropdownConfig, dropdownService, $animate) {
    var self = this,
        scope = $scope.$new(),
        // create a child scope so we are not polluting original one
        openClass = dropdownConfig.openClass,
        getIsOpen, setIsOpen = angular.noop,
        toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop;

    this.init = function (element) {
        self.$element = element;

        if ($attrs.isOpen) {
            getIsOpen = $parse($attrs.isOpen);
            setIsOpen = getIsOpen.assign;

            $scope.$watch(getIsOpen, function (value) {
                scope.isOpen = !! value;
            });
        }
    };

    this.toggle = function (open) {
        return scope.isOpen = arguments.length ? !! open : !scope.isOpen;
    };

    // Allow other directives to watch status
    this.isOpen = function () {
        return scope.isOpen;
    };

    scope.getToggleElement = function () {
        return self.toggleElement;
    };

    scope.focusToggleElement = function () {
        if (self.toggleElement) {
            self.toggleElement[0].focus();
        }
    };

    scope.$watch('isOpen', function (isOpen, wasOpen) {
        $animate[isOpen ? 'addClass' : 'removeClass'](self.$element, openClass);

        if (isOpen) {
            scope.focusToggleElement();
            dropdownService.open(scope);
        } else {
            dropdownService.close(scope);
        }

        setIsOpen($scope, isOpen);
        if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
            toggleInvoker($scope, {
                open: !! isOpen
            });
        }
    });

    $scope.$on('$locationChangeSuccess', function () {
        scope.isOpen = false;
    });

    $scope.$on('$destroy', function () {
        scope.$destroy();
    });
}])

.directive('dropdown', function () {
    return {
        restrict: 'CA',
        controller: 'DropdownController',
        link: function (scope, element, attrs, dropdownCtrl) {
            dropdownCtrl.init(element);
        }
    };
})

.directive('dropdownToggle', function () {
    return {
        restrict: 'CA',
        require: '?^dropdown',
        link: function (scope, element, attrs, dropdownCtrl) {
            if (!dropdownCtrl) {
                return;
            }

            dropdownCtrl.toggleElement = element;

            var toggleDropdown = function (event) {
                    event.preventDefault();

                    if (!element.hasClass('disabled') && !attrs.disabled) {
                        scope.$apply(function () {
                            dropdownCtrl.toggle();
                        });
                    }
                };

            element.bind('click', toggleDropdown);

            // WAI-ARIA
            element.attr({
                'aria-haspopup': true,
                'aria-expanded': false
            });
            scope.$watch(dropdownCtrl.isOpen, function (isOpen) {
                element.attr('aria-expanded', !! isOpen);
            });

            scope.$on('$destroy', function () {
                element.unbind('click', toggleDropdown);
            });
        }
    };
});