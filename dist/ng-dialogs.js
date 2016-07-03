(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, function () { 'use strict';

    ngDialogsCoreService.$inject = ["$rootScope", "$q", "$document", "$compile", "$controller", "$http", "$templateCache", "$timeout"];
    ngDialogsCorePluginsService.$inject = ["$window", "$document", "$timeout"];
    ngDialogsModalService.$inject = ["ngDialogsCoreService", "ngDialogsCorePluginsService"];
    var EVENTS = {
        // core events
        INIT: 'dialog:init',
        SHOW: 'dialog:show',
        HIDE: 'dialog:hide',
        DESTROY: 'dialog:destroy',

        // plugin events
        BACKDROP_CLICK: 'dialog:backdrop_click',
        OUTSIDE_CLICK: 'dialog:outside_click',
        ESCAPE_PRESS: 'dialog:escape_press',

    };

    var uniqueId = (new Generator()).uniqueId;

    function Generator() {
        var i = 0;

        function uniqueId(prefix) {
            return (prefix || '') + (++i);
        }

        return {
            uniqueId: uniqueId
        };
    }

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
                parent: undefined,
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

                var parent = _getParentElement(options);

                // append dialog to parent element
                parent.append(dialogElement);
            }

            function _getParentElement(options) {
                if (angular.isElement(options.parent)) {
                    return angular.element(options.parent);
                }

                if (options.parent && angular.isString(options.parent)) {
                    return angular.element($document[0].querySelector(options.parent));
                }

                return $document.find('body');
            }

        }
    }

    function ngDialogsCorePluginsService($window, $document, $timeout) {

        var plugins = {
            autoShow: autoShow,
            restoreFocus: restoreFocus,
            dialogFocus: dialogFocus,
            backdropEvent: backdropEvent,
            backdropDestroy: backdropDestroy,
            outsideEvent: outsideEvent,
            outsideDestroy: outsideDestroy,
            escapeEvent: escapeEvent,
            escapeDestroy: escapeDestroy,
            focusTrap: focusTrap,
            aria: aria
        };

        return plugins;

        /**
         * Open dialog automatically after `dialog:init`
         */
        function autoShow(scope, element, dialog, options) {
            if (options.autoShow === true) {
                scope.$on(EVENTS.INIT, dialog.show);
            }
        }

        /**
         * Restores focus to element before showing dialog
         */
        function restoreFocus(scope, element, dialog, options) {
            if (options.focus) {
                var activeElement;

                scope.$on(EVENTS.SHOW, function() {
                    activeElement = $document[0].activeElement;
                });

                // don't restore focus to activeElement
                scope.$on(EVENTS.OUTSIDE_CLICK, function() {
                    activeElement = null;
                });

                scope.$on(EVENTS.HIDE, function() {
                    // schedule; allowing 'dialog:outside_click' to nullify activeElement
                    $timeout(function() {
                        if (activeElement) {
                            activeElement.focus();
                            activeElement = null;
                        }
                    });
                });
            }
        }

        /**
         * Sets focus to element after showing dialog
         */
        function dialogFocus(scope, element, dialog, options) {
            if (options.focus) {
                scope.$on(EVENTS.SHOW, function() {
                    $timeout(function() {
                        var el = (typeof options.focus === 'string') ?
                                        element[0].querySelector(options.focus) :
                                        $document[0].getElementById(options.id);

                        if (el) {
                            var focusElement = angular.element(el);
                            focusElement.attr('tabindex', -1);
                            el.focus();
                        }
                    });
                });
            }
        }

        /**
         * Broadcast 'dialog:backdrop_click' when clicked on backdrop
         */
        function backdropEvent(scope, element, dialog, options) {
            scope.$on(EVENTS.INIT, function() {
                var backdropElement = element[0].querySelector('.ng-dialogs-modal__backdrop');

                if (backdropElement) {
                    var backdrop = angular.element(backdropElement);
                    backdrop.on('click', function() {
                        scope.$broadcast(EVENTS.BACKDROP_CLICK);
                    });
                }
            });
        }

        /**
         * Destroy dialog when clicked on backdrop
         */
        function backdropDestroy(scope, element, dialog, options) {
            if (options.backdropClose) {
                console.log(options.backdropClose);
                scope.$on(EVENTS.BACKDROP_CLICK, dialog.destroy);
            }
        }

        /**
         * Destroy dialog when clicked outside
         */
        function outsideDestroy(scope, element, dialog, options) {
            if (options.outsideClose) {
                scope.$on(EVENTS.OUTSIDE_CLICK, dialog.destroy);
            }
        }

        /**
         * Broadcast 'dialog:outside_click' when clicked outside
         */
        function outsideEvent(scope, element, dialog, options) {
            scope.$on(EVENTS.SHOW, function() {
                $timeout(function() {
                    $document.on('click', handleClick);
                });
            });

            scope.$on(EVENTS.HIDE, function() {
                $document.off('click', handleClick);
            });

            function handleClick(evt) {
                if (isClickedOutside(evt)) {
                    scope.$broadcast(EVENTS.OUTSIDE_CLICK);
                }
            }

            function isClickedOutside(evt) {
                var clickedOutSide = true;

                var target = evt.target;

                while (target.parentNode) {         // loop till root node
                    if (element[0] === target) {    // when elements matches, it means it was clicked inside.
                        return false;
                    }
                    target = target.parentNode;
                }

                //looped till root node, so it was clicked outside.
                return clickedOutSide;
            }
        }

        /**
         * Broadcast 'dialog:esc_press' when ESC key is pressed
         */
        function escapeEvent(scope, element, dialog) {
            scope.$on(EVENTS.INIT, function() {
                element[0].addEventListener('keydown', function(event) {
                    if (event.keyCode === 27) {
                        scope.$broadcast(EVENTS.ESCAPE_PRESS);
                    }
                }, true);
            });
        }

        /**
         * Destroy dialog when on keyboard ESC
         */
        function escapeDestroy(scope, element, dialog, options) {
            if (options.escapeClose) {
                scope.$on(EVENTS.ESCAPE_PRESS, dialog.destroy);
            }
        }

        function focusTrap(scope, element, dialog, options) {

            if (!options.focusTrap || options.modeless) {
                return;
            }

            scope.$on(EVENTS.INIT, function() {
                var dialogFrame = angular.element(getDialogFrame());
                setTripWires(dialogFrame);
            });

            scope.$on(EVENTS.SHOW, function() {
                var tripWires = getTripWires();

                tripWires.forEach(function(wire) {
                    angular.element(wire).on('keyup keydown', trapFocus);
                });
            });

            scope.$on(EVENTS.HIDE, function() {
                var tripWires = getTripWires();

                tripWires.forEach(function(wire) {
                    angular.element(wire).off('keyup keydown', trapFocus);
                });
            });

            function getDialogFrame() {
                return element[0].querySelector(options.frame) || element[0];
            }

            function setTripWires(container) {
                container.prepend('<div class="ng-dialogs-tripwire--top" tabindex="0" aria-hidden="true"></div>');
                container.append('<div class="ng-dialogs-tripwire--bottom" tabindex="0" aria-hidden="true"></div>');
            }

            function getTripWires() {
                return element[0].querySelectorAll('div[class^=ng-dialogs-tripwire]');
            }

            function trapFocus(e) {
                var dialogElements = getFocusableDialogElements();
                var frameElement = getDialogFrame();
                var focusElement;

                // find a focusable element
                while (dialogElements.length) {
                    // reverse iteration direction when shiftKey is pressed
                    focusElement = (e.shiftKey) ? dialogElements.pop() : dialogElements.shift();

                    // exclude dialog frame, tripwires and non-visible elements
                    if ((focusElement.className.indexOf('ng-dialogs-tripwire') === -1) &&
                        (focusElement !== frameElement) &&
                        isElementVisible(focusElement)) {
                        break;
                    } else {
                        focusElement = undefined;
                    }

                }

                focusElement = focusElement || frameElement;
                focusElement.focus();
            }

            function getFocusableDialogElements() {
                var selector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
                               'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, ' +
                               ' *[tabindex], *[contenteditable]';

                // https://davidwalsh.name/nodelist-array
                return [].slice.call(element[0].querySelectorAll(selector));
            }

            function isElementVisible(element) {
                var style = $window.getComputedStyle(element);
                return !((style.visibility && style.visibility === 'hidden') || (style.opacity && style.opacity === '0'));
            }
        }

        function aria(scope, element, dialog, options) {
            var ariaConfig = options.aria;

            if (!ariaConfig) {
                return;
            }

            scope.$on(EVENTS.INIT, addAriaRoles);

            function addAriaRoles() {
                for (var attr in ariaConfig) {
                    addAriaRole(attr, ariaConfig[attr]);
                }
            }

            function addAriaRole(role, value) {
                switch (role) {
                    case 'role':
                        addRole(role, value);
                        break;
                    case 'aria-describedby':
                        console.log(arguments);
                        roleWithGeneratedId(role, value);
                        break;
                    case 'aria-labelledby':
                        console.log(arguments);
                        roleWithGeneratedId(role, value);
                        break;
                }
            }

            function addRole(name, value) {
                var el = angular.element(getDialogFrame());
                el.attr(name, value);
            }

            function roleWithGeneratedId(attributeName, selector) {
                if (attributeName && selector) {
                    var el = element[0].querySelector(selector) || getDialogFrame();
                    el = angular.element(el);
                    var id = options.id + '--' + attributeName;
                    el.attr('id', id);
                    el.attr(attributeName, id);
                }
            }

            function getDialogFrame() {
                return element[0].querySelector(options.frame) || element[0];
            }

        }

    }

    function ngDialogsModalService(ngDialogsCoreService, ngDialogsCorePluginsService) {

        var api = {
            createDialog: createDialog
        };

        return api;

        function createDialog(config) {

            var modalOptions = {
                cssClass: 'ng-dialogs-theme--basic',
                templateBefore: '<div class="ng-dialogs-modal" ng-show="$dialog.visible">' +
                                    '<div class="ng-dialogs-modal__backdrop"></div>' +
                                    '<div class="ng-dialogs-modal__frame">',
                templateAfter:      '</div>' +
                                '</div>',
                autoShow: true,
                frame: '.ng-dialogs-modal__frame',
                focus: '.ng-dialogs-modal__frame',
                focusTrap: true,
                escapeClose: true,
                outsideClose: true,
                backdropClose: true,
                aria: {
                    'role': 'dialog',
                    // 'aria-labelledby': '.ng-dialogs-modal__frame',
                    'aria-describedby': '.ng-dialogs-modal__frame'
                }
            };

            var modelessOptions = {
                cssClass: 'ng-dialogs-theme--basic',
                templateBefore: '<div class="ng-dialogs-modeless ng-dialogs-modeless__frame" ng-show="$dialog.visible">',
                templateAfter: '</div>',
                autoShow: true,
                focus: true,
                frame: '.ng-dialogs-modeless__frame',
                escapeClose: true,
                outsideClose: true,
                backdropClose: false,
                // aria: {
                //     'role': 'tooltip'
                // }
            };

            var dialogOptions = (config.modeless === true) ? modelessOptions : modalOptions;

            var options = angular.extend({}, dialogOptions, config);

            var plugins = [
                ngDialogsCorePluginsService.autoShow,
                ngDialogsCorePluginsService.backdropEvent,
                ngDialogsCorePluginsService.backdropDestroy,
                ngDialogsCorePluginsService.outsideEvent,
                ngDialogsCorePluginsService.outsideDestroy,
                ngDialogsCorePluginsService.escapeEvent,
                ngDialogsCorePluginsService.escapeDestroy,
                ngDialogsCorePluginsService.dialogFocus,
                ngDialogsCorePluginsService.restoreFocus,
                ngDialogsCorePluginsService.focusTrap,
                ngDialogsCorePluginsService.aria,
            ];

            options.plugins = plugins;

            // Additional user plugins
            if (config.plugins) {
                config.plugins.forEach(function(plugin) {
                    options.plugins.push(plugin);
                });
            }

            var dialog = ngDialogsCoreService.createDialog(options);
            return dialog;
        }

    }

    angular.module('ng-dialogs-core',       []);
    angular.module('ng-dialogs-messagebox', ['ng-dialogs-core']);
    angular.module('ng-dialogs-modal',      ['ng-dialogs-core']);
    angular.module('ng-dialogs',            ['ng-dialogs-messagebox', 'ng-dialogs-modal']);

    angular.module('ng-dialogs-core').factory('ngDialogsCoreService', ngDialogsCoreService);
    angular.module('ng-dialogs-core').factory('ngDialogsCorePluginsService', ngDialogsCorePluginsService);
    angular.module('ng-dialogs-modal').factory('ngDialogsModalService', ngDialogsModalService);

}));