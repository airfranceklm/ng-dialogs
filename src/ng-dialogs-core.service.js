import EVENTS from './ng-dialogs-core.events.js';
import uniqueId from './ng-dialogs-core.unique-id.js';

export default ngDialogsCoreService;

function ngDialogsCoreService($rootScope, $q, $document, $compile, $controller, $http, $templateCache, $timeout) {

    var api = {
        createDialog: createDialog
    };

    return api;

    /**
     * Low level API
     *
     * @param  {Object} options map
     * @return {Object}         Dialog
     */
    function createDialog(options) {
        return new Dialog(options);
    }

    /**
     * Dialog Class
     *
     * @param {Object}   config
     * @param {String}   config.template
     * @param {String}   config.templateUrl
     * @param {String}   config.controller
     * @param {Function} config.controller
     * @param {String}   config.controllerAs
     */
    function Dialog(config) {

        // wait for template retrieval and dialog construction
        // make sure construction is complete before show/hide/destroy are executed
        var deferredConstruction = $q.defer();

        // default config
        var defaults = {
            id: undefined,
            cssClass: undefined,
            template: '',
            templateUrl: undefined,
            templateBefore: '<div ng-show="$dialog.visible">',
            templateAfter: '</div>',
            controller: angular.noop,
            controllerAs: undefined,
            plugins: []
        };

        var options = angular.extend({}, defaults, config);

        if (!options.id) {
            options.id = uniqueId('ng-dialogs__');
        }

        var api = {
            show: function() {
                var deferred = $q.defer();
                deferredConstruction.promise.then(function() {
                    showDialog();
                    $timeout(deferred.resolve);
                });
                return deferred.promise;
            },
            hide: function() {
                var deferred = $q.defer();
                deferredConstruction.promise.then(function() {
                    hideDialog();
                    $timeout(deferred.resolve);
                });
                return deferred.promise;
            },
            destroy: function() {
                var deferred = $q.defer();
                hideDialog();
                destroyDialog();
                $timeout(deferred.resolve);
                return deferred.promise;
            }
        };

        // create new scope for dialog
        var dialogScope = $rootScope.$new();;
        var dialogElement;

        _getTemplate(options).then(function(template) {
            _constructDialog(dialogScope, options, template);

            // trigger digest cycle
            $timeout(angular.noop);

            dialogScope.$broadcast(EVENTS.INIT);
            deferredConstruction.resolve();
        });

        return api;

        function showDialog() {
            dialogScope.$broadcast(EVENTS.SHOW);
            dialogScope.$dialog.visible = true;
        }

        function hideDialog() {
            dialogScope.$broadcast(EVENTS.HIDE);
            dialogScope.$dialog.visible = false;
        }

        function destroyDialog() {
            dialogScope.$broadcast(EVENTS.DESTROY);
            //  clean up scope and remove the element from the DOM.
            dialogScope.$destroy();
            dialogElement.remove();
            api = null;
        }

        function _getTemplate(options) {
            var deferred = $q.defer();
            var resolve = deferred.resolve;
            var reject = deferred.reject;

            if (options.templateUrl) {
                var tmpl = $templateCache.get(options.templateUrl);

                if (tmpl) {
                    resolve(tmpl);
                } else {
                    $http.get(options.templateUrl).then(function(response) {
                        $templateCache.put(options.templateUrl, response.data);
                        resolve(response.data);
                    }, function() {
                        throw new Error('ng-dialogs: failed to fetch template: ' + options.templateUrl);
                    });
                }
            } else if (options.template) {
                resolve(options.template);
            } else {
                throw new Error('ng-dialogs: no template configuration found');
            }

            return deferred.promise;
        }

        function _constructDialog(dialogScope, options, template) {
            var container = $document.find('body');

            var dialogHtml = [options.templateBefore, template, options.templateAfter].join('');    //wrap template dialog html
            var dialogElementTemplate = angular.element(dialogHtml);

            // compile then link the template element, building the actual element.
            var linkFn = $compile(dialogElementTemplate);
            dialogElement = linkFn(dialogScope);

            // add unique id to dialog
            dialogElement.attr('id', options.id);

            // hide dialog initially; for css animations
            dialogElement.addClass('ng-hide');

            // internal scope object to hold dialog state and api
            var $dialog = {};

            $dialog.hide = api.hide;
            $dialog.show = api.show;
            $dialog.destroy = api.destroy;
            $dialog.visible = false;

            dialogScope.$dialog = $dialog;

            // set css class from options
            if (options.cssClass) {
                dialogElement.addClass(options.cssClass);
            }

            if (options.controller) {
                var controlConstructor = {
                    $scope: dialogScope,
                    dialog: api
                    //$element : dialogElement  // inject dialogElement as $element into controller.
                };

                // Only the first two parameters are allowed to use (see https://github.com/angular/angular.js/blob/master/src/ng/controller.js#L95)
                // Needed to use the undocumented third and fourth parameters to enable controllerAs support.
                if (options.controllerAs) {
                    $controller(options.controller, controlConstructor, false, options.controllerAs);
                } else {
                    $controller(options.controller, controlConstructor);
                }
            }

            if (options.plugins) {
                for (var i = 0; i < options.plugins.length; i++) {
                    var pluginFn = options.plugins[i];
                    pluginFn(dialogScope, dialogElement, api, options);
                }
            }

            // append dialog to container
            container.append(dialogElement);
        }

    }
}
