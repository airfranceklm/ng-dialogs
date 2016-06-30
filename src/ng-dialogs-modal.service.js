import EVENTS from './ng-dialogs-core.events.js';

export default ngDialogsModalService;

function ngDialogsModalService(ngDialogsCoreService, ngDialogsCorePluginsService) {

    var api = {
        createDialog: createDialog
    };

    return api;

    function createDialog(config) {

        var modalOptions = {
            templateBefore: '<div class="ng-dialogs-modal" ng-show="$dialog.visible">' +
                                '<div class="ng-dialogs-modal__backdrop"></div>' +
                                '<div class="ng-dialogs-modal__content">',
            templateAfter:      '</div>' +
                            '</div>',
            focus: true,
            focusSelector: '.ng-dialogs-modal__content'
        };

        var modelessOptions = {
            templateBefore: '<div class="ng-dialogs-modeless" ng-show="$dialog.visible">',
            templateAfter: '</div>',
            focus: true
        };

        var dialogOptions = (config.modeless === true) ? modelessOptions : modalOptions;

        var options = angular.extend({}, dialogOptions, config);

        var modalPlugins = [
            ngDialogsCorePluginsService.backdropEvent,
            ngDialogsCorePluginsService.backdropDestroy,
            ngDialogsCorePluginsService.outsideEvent,
            ngDialogsCorePluginsService.outsideDestroy,
            ngDialogsCorePluginsService.escapeEvent,
            ngDialogsCorePluginsService.escapeDestroy,
            ngDialogsCorePluginsService.dialogFocus,
            ngDialogsCorePluginsService.restoreFocus,
        ];

        options.plugins = modalPlugins;

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
