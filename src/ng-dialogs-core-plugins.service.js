import EVENTS from './ng-dialogs-core.events.js';

export default ngDialogsCorePluginsService;

function ngDialogsCorePluginsService($document, $timeout) {

    var plugins = {
        restoreFocus: restoreFocus,
        dialogFocus: dialogFocus,
        backdropEvent: backdropEvent,
        backdropDestroy: backdropDestroy,
        outsideEvent: outsideEvent,
        outsideDestroy: outsideDestroy,
        escapeEvent: escapeEvent,
        escapeDestroy: escapeDestroy
    };

    return plugins;

    /**
     * Restores focus to element before showing dialog
     */
    function restoreFocus(scope, element, dialog, options) {
        if (options.focus === true) {
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
        if (options.focus === true) {
            scope.$on(EVENTS.SHOW, function() {
                $timeout(function() {
                    var el = (options.focusSelector) ?
                                    element[0].querySelector(options.focusSelector) :
                                    $document[0].getElementById(options.id);

                    if (el) {
                        var focusElement = angular.element(el);
                        focusElement.attr('tabindex', 0);
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
        // if (options.backdropClose) {
        scope.$on(EVENTS.BACKDROP_CLICK, dialog.destroy);
        // }
    }

    /**
     * Destroy dialog when clicked outside
     */
    function outsideDestroy(scope, element, dialog, options) {
        // if (options.outsideClose) {
        scope.$on(EVENTS.OUTSIDE_CLICK, dialog.destroy);
        // }
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
        // if (options.escapeDismiss) {
        scope.$on(EVENTS.ESCAPE_PRESS, dialog.destroy);
        // }
    }

}
