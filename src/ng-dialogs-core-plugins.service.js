import EVENTS from './ng-dialogs-core.events.js';

export default ngDialogsCorePluginsService;

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
