import EVENTS from './ng-dialogs-core.events.js';

export default ngDialogsModalService;

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
