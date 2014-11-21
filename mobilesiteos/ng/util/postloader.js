
/*global
    msos: false,
    jQuery: false,
    angular: false
*/

msos.provide("ng.util.postloader");

ng.util.postloader = angular.module('ng.util.postloader', ['ng']);
ng.util.postloader.version = new msos.set_version(14, 8, 11);


(function () {

	'use strict';

	var temp_up = 'ng.util.postloader',
		regModules = ['ng'],
		regInvokes = [],
		regConfigs = [],
		broadcast = angular.noop,
		prevModules = [];

	function registerInvokeList(invokeList) {

		var newInvoke = false;

		if (angular.isString(invokeList)) {

			if (regInvokes.indexOf(invokeList) === -1) {
				newInvoke = true;
				regInvokes.push(invokeList);
				broadcast('postloader.componentLoaded', invokeList);
			}

		} else if (angular.isObject(invokeList)) {

			angular.forEach(
				invokeList,
				function (invoke) {
					if (angular.isString(invoke) && regInvokes.indexOf(invoke) === -1) {
						newInvoke = true;
						regInvokes.push(invoke);
					}
				}
			);

		} else {
			return true;
		}

		return newInvoke;
	}

	function invokeQueue(providers, queue, moduleName, reconfig) {

		if (!queue) { return; }

		var i,
			args,
			provider,
			invoked = null;

		for (i = 0; i < queue.length; i += 1) {

			args = queue[i];

			if (angular.isArray(args)) {

				if (providers.hasOwnProperty(args[0])) {
					provider = providers[args[0]];
				} else {
					throw new Error('unsupported provider ' + args[0]);
				}

				invoked = regConfigs.indexOf(moduleName);

				if (registerInvokeList(args[2][0]) && (args[1] !== 'invoke' || (args[1] === 'invoke' && (!invoked || reconfig)))) {

					if (!invoked) { regConfigs.push(moduleName); }

					provider[args[1]].apply(provider, args[2]);
				}
			}
		}
	}

	function register(providers, registerModules, params) {

		if (registerModules) {
			var k,
				moduleName,
				moduleFn,
				runBlocks = [],
				instanceInjector = null;

			for (k = registerModules.length - 1; k >= 0; k -= 1) {

				moduleName = registerModules[k];

				if (moduleName) {

					moduleFn = angular.module(moduleName);

					if (regModules.indexOf(moduleName) === -1) { // new module
						regModules.push(moduleName);
						register(providers, moduleFn.requires, params);
						runBlocks = runBlocks.concat(moduleFn._runBlocks);
					}

					invokeQueue(providers, moduleFn._invokeQueue,	moduleName, params.reconfig);
					invokeQueue(providers, moduleFn._configBlocks,	moduleName, params.reconfig); // angular 1.3+

					broadcast('postloader.moduleLoaded', moduleName);

					registerModules.pop();
				}
			}

			instanceInjector = providers.getInstanceInjector();

			angular.forEach(
				runBlocks,
				function (fn) {
					instanceInjector.invoke(fn);
				}
			);
		}
	}

	ng.util.postloader.provider(
		'$postloader',
		[
			'$controllerProvider', '$provide', '$compileProvider', '$filterProvider', '$injector', '$animateProvider',
			function ($controllerProvider, $provide, $compileProvider, $filterProvider, $injector, $animateProvider) {

				var temp_pl = temp_up + '.provider',
					modules = {},
					providers = {
						$controllerProvider: $controllerProvider,
						$compileProvider: $compileProvider,
						$filterProvider: $filterProvider,
						$provide: $provide, // other things
						$injector: $injector,
						$animateProvider: $animateProvider
					},
					events = false;

				msos.console.debug(temp_pl + ' -> start.');

				this.$get = [
					'$rootElement', '$rootScope',
					function ($rootElement, $rootScope) {

						var instanceInjector;

						providers.getInstanceInjector = function () {
							if (!instanceInjector) {
								instanceInjector = $rootElement.data('$injector');
							}
							return instanceInjector;
						};

						broadcast = function broadcast(eventName, params) {
							if (events) {
								$rootScope.$broadcast(eventName, params);
							}
						};

						return {
							register_module: function (moduleName, params) {

								var self = this,
									moduleCache = [];

								msos.console.debug(temp_pl + ' - register_module -> start, for: ' + moduleName);

								if (angular.isUndefined(params)) { params = {}; }

								moduleCache.push = function (value) {
									if (this.indexOf(value) === -1) {
										Array.prototype.push.apply(this, arguments);
									}
								};

								moduleCache.push(moduleName);

								try {
									register(providers, moduleCache, params);
								} catch (e) {
									msos.console.error(temp_pl + ' - register_module -> failed: ' + e.message);
								}

								msos.console.debug(temp_pl + ' - register_module -> done!');
							},
							run_registration: function () {

								var self = this,
									current_modules = _.keys(msos.registered_modules),
									diff_modules = _.difference(current_modules, prevModules);

								msos.console.debug(temp_pl + ' - run_registration -> start, for:', diff_modules);

								jQuery.each(
									diff_modules,
									function (index, module_key) {

										var module_name = module_key.replace(/_/g, '.');

										// Screen away non-AngularJS modules
										if (_.indexOf(angular.modulelist, module_key) !== -1) {
											self.register_module(module_name);
										}
									}
								);

								// Reset for next round...
								prevModules = current_modules;

								msos.console.debug(temp_pl + ' - run_registration -> done!');
							}
						};
					}
				];

				this.config = function (config) {
					if (angular.isDefined(config.events)) { events = config.events; }
				};

				msos.console.debug(temp_pl + ' -> done!');
			}
		]
	);

	// Record the modules initially loaded in the first "msos.run_onload()" cycle
	msos.onload_func_post.push(
		function () {
			prevModules = _.keys(msos.registered_modules);
		}
	);
}());
