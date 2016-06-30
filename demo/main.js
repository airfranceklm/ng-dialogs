var app = angular.module('exampleApp', ['ngAnimate', 'ng-dialogs']);

app.controller('MainCtrl', function($scope, ngDialogsCoreService, ngDialogsModalService) {


    /**
     * Core Dialog
     */
    var coreDialog;

    $scope.core = {};
    $scope.core.create = function() {
        if (coreDialog) {
            coreDialog.destroy();
        }

        coreDialog = ngDialogsCoreService.createDialog({
            // template: '<h2>hello dialog template<button ng-click="dialog.foobar()">foobar</button><button ng-click="$dialog.destroy()">destroy</button></h2>',
            templateUrl: 'dialog.template.html',
            cssClass: 'ng-dialogs-fx--slidein',
            plugins: [
                function(scope, element, dialog) {
                    scope.$on('dialog:init', function() {
                        console.log('plugin event: "dialog:init"');
                    });
                    scope.$on('dialog:show', function() {
                        console.log('plugin event: "dialog:show"');
                    });
                    scope.$on('dialog:hide', function() {
                        console.log('plugin event: "dialog:hide"');
                    });
                    scope.$on('dialog:destroy', function() {
                        console.log('plugin event: "dialog:destroy"');
                    });
                }
            ],
            controller: function($scope, dialog) {
                this.foobar = function() {
                    console.log(dialog);
                    alert('foobar');
                };
            },
            controllerAs: 'dialog'
        });

        coreDialog.show();
    };

    $scope.core.destroy = function() {
        coreDialog.destroy().then(function() {
            console.log('Promise: "Dialog destroyed..."');
        });
        coreDialog = undefined;
    };

    $scope.core.show = function() {
        coreDialog.show().then(function() {
            console.log('Promise: "Dialog showed..."');
        });
    };

    $scope.core.hide = function() {
        coreDialog.hide().then(function() {
            console.log('Promise: "Dialog hidden..."');
        });
    };


    /**
     * Modal Dialog
     */
    var modalDialog;

    $scope.modal = {};
    $scope.modal.create = function() {
        if (modalDialog) {
            modalDialog.destroy();
        }

        modalDialog = ngDialogsModalService.createDialog({
            template: 'Hello modal!'
        });

        modalDialog.show();
    };

    $scope.modal.show = function() {modalDialog.show();};
    $scope.modal.hide = function() {modalDialog.hide();};
    $scope.modal.destroy = function() {modalDialog.destroy();};

    /**
     * Modeless Dialog
     */
    var modelessDialog;

    $scope.modeless = {};
    $scope.modeless.create = function() {
        if (modelessDialog) {
            modelessDialog.destroy();
        }

        modelessDialog = ngDialogsModalService.createDialog({
            template: 'Hello modeless!',
            modeless: true
        });

        modelessDialog.show();
    };

    $scope.modeless.show = function() {modelessDialog.show();};
    $scope.modeless.hide = function() {modelessDialog.hide();};
    $scope.modeless.destroy = function() {modelessDialog.destroy();};

});
