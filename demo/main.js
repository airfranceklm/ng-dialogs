var app = angular.module('exampleApp', ['ngAnimate', 'ng-dialogs']);

app.controller('MainCtrl', function($scope, ngDialogsCoreService) {

    var dialog;

    $scope.create = function() {
        if (dialog) {
            dialog.destroy();
        }

        dialog = ngDialogsCoreService.createDialog({
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

        dialog.show();
    };

    $scope.destroy = function() {
        dialog.destroy().then(function() {
            console.log('Promise: "Dialog destroyed..."');
        });
        dialog = undefined;
    };

    $scope.show = function() {
        dialog.show().then(function() {
            console.log('Promise: "Dialog showed..."');
        });
    };

    $scope.hide = function() {
        dialog.hide().then(function() {
            console.log('Promise: "Dialog hidden..."');
        });
    };
});
