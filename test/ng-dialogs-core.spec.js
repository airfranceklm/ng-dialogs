describe('ng-dialogs-core.service', function() {
    'use strict';

    var $rootScope, $compile, $document, $q, $timeout, $httpBackend;
    var ngDialogsCoreService, dialog;

    beforeEach(module('test-ng-dialogs'));

    beforeEach(inject(function(_$rootScope_, _$compile_, _$document_, _$q_, _$timeout_, _$httpBackend_, _ngDialogsCoreService_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $document = _$document_;
        $q = _$q_;
        $timeout = _$timeout_;
        $httpBackend = _$httpBackend_;
        ngDialogsCoreService = _ngDialogsCoreService_;
    }));

    describe('ngDialogsCoreService', function() {

        describe('Service', function() {
            it('should exist', function() {
                expect(ngDialogsCoreService).toBeDefined();
            });
            it('should have the createDialog method', function() {
                expect(ngDialogsCoreService.createDialog).toBeDefined();
            });
        });

        describe('Core Dialog', function() {

            var pluginScope, pluginElement, pluginDialog, pluginDialogOptions;

            beforeEach(function(done) {
                dialog = ngDialogsCoreService.createDialog({
                    id: 'custom-dialog-id',
                    cssClass: 'custom-dialog-class',
                    template: '<div>Hello world</div>',
                    plugins: [function(scope, element, dlg, opts) {
                        pluginScope = scope;
                        pluginElement = element;
                        pluginDialog = dlg;
                        pluginDialogOptions = opts;
                    }]
                });

                /* work-around for a-sync dialog construction */
                $timeout(done);
                $timeout.flush();
            });

            afterEach(function() {
                dialog.destroy();
            });

            describe('API', function() {
                it('should created a dialog instance', function() {
                    expect(dialog).toBeDefined();
                });

                it('should have the api show() to show dialog', function() {
                    expect(dialog.show).toBeDefined();
                    expect(typeof dialog.show).toEqual('function');
                });

                it('should have the api hide() to hide dialog', function() {
                    expect(dialog.hide).toBeDefined();
                    expect(typeof dialog.hide).toEqual('function');
                });

                it('should have the api destroy() to destroy dialog', function() {
                    expect(dialog.destroy).toBeDefined();
                    expect(typeof dialog.destroy).toEqual('function');
                });
            });

            describe('Life cycle', function() {
                var dom, element;

                beforeEach(function() {
                    dom = $document[0].querySelector('.custom-dialog-class');
                    element = angular.element(dom);
                });

                it('should inject dialog into document', function() {
                    expect(dom).toBeDefined();
                    expect(element.length).toBe(1);
                    expect(element.text()).toBe('Hello world');
                });

                it('should be hidden by default (after creation)', function() {
                    expect(element.hasClass('ng-hide')).toBe(true);
                });

                it('should be hidden after hide()', function() {
                    dialog.hide().then(function() {
                        expect(element.hasClass('ng-hide')).toBe(true);
                    });
                });

                it('should be visible after show()', function() {
                    dialog.show().then(function(data) {
                        expect(element.hasClass('ng-hide')).toBe(false);
                    });
                });

                it('should remove dialog from dom after destroy()', function() {
                    //verify existence
                    expect(dom).toBeDefined();

                    //destroy
                    dialog.destroy().then(function() {
                        expect(dom).toBeNull();
                    });
                });
            });

            describe('Plugins', function() {
                describe('Plugin scope', function() {
                    it('should have access to dialog controller scope', function() {
                        expect(pluginScope).toBeDefined();
                    });
                    it('should fire scope.$destroy event', function(done) {
                        pluginScope.$on('$destroy', function(event) {
                            expect(event).toBeDefined();
                            done();
                        });
                        dialog.destroy();
                        $timeout.flush();
                    });
                });

                describe('Plugin element', function() {
                    it('should have access to root element of the dialog', function() {
                        expect(pluginElement).toBeDefined();
                    });
                });

                describe('Plugin dialog instance', function() {
                    it('should have access to the dialog instance', function() {
                        expect(pluginDialog).toBeDefined();
                        expect(pluginDialog.show).toBeDefined();
                        expect(pluginDialog.hide).toBeDefined();
                        expect(pluginDialog.destroy).toBeDefined();
                    });
                });

                describe('dialog events', function() {
                    it('should have on function to listing to events', function() {
                        expect(pluginScope.$on).toBeDefined();
                    });

                    it('should be able to listen to dialog:showed event', function(done) {
                        pluginScope.$on('dialog:show', function(event) {
                            expect(event).toBeDefined();
                            done();
                        });
                        dialog.show();
                    });
                    it('should be able to listen to dialog:hidden event', function(done) {
                        pluginScope.$on('dialog:hide', function(event) {
                            expect(event).toBeDefined();
                            done();
                        });
                        dialog.hide();
                    });
                    it('should be able to listen to dialog:destroy event', function(done) {
                        pluginScope.$on('dialog:destroy', function(event) {
                            expect(event).toBeDefined();
                            done();
                        });
                        dialog.destroy();
                    });
                });

                describe('Plugin dialog options', function() {
                    it('should have access to the dialog options', function() {
                        expect(pluginDialogOptions).toBeDefined();
                        expect(pluginDialogOptions.template).toBeDefined();
                        expect(pluginDialogOptions.plugins).toBeDefined();
                    });
                });
            });

        });

        describe('templateUrl', function() {

            beforeEach(function() {
                $httpBackend.whenGET('/path/to/custom/dialog-template.html')
                    .respond('<div>custom template</div>');
            });

            beforeEach(function(done) {
                dialog = ngDialogsCoreService.createDialog({
                    id: 'custom-dialog-id',
                    cssClass: 'custom-dialog-class',
                    templateBefore: '<div class="hard-coded-class" ng-show="$dialog.visible">',
                    templateUrl:        '/path/to/custom/dialog-template.html',
                    templateAfter:  '</div>'
                });

                /* work-around for a-sync dialog construction */
                $timeout(done);
                $timeout.flush();
            });

            afterEach(function() {
                dialog.destroy();
            });

            it('should fetch templateUrl with $http', function(done) {
                dialog.show().then(function() {
                    var el = $document[0].getElementById('custom-dialog-id');
                    expect(el.innerHTML).toBe('<div>custom template</div>');
                    done();
                });
            });

            it('should apply correct container attributes', function(done) {
                dialog.show().then(function() {
                    var el = $document[0].getElementById('custom-dialog-id');
                    expect(el.id).toBe('custom-dialog-id');
                    expect(el.classList.contains('hard-coded-class')).toBe(true);
                    expect(el.classList.contains('custom-dialog-class')).toBe(true);
                    done();
                });
            });
        });

        describe('Custom Dialog Controller', function() {

            var ctrlScope, ctrlDialog;
            var dom, element;

            beforeEach(function(done) {
                dialog = ngDialogsCoreService.createDialog({
                    'cssClass': 'custom-dialog-class',
                    'templateBefore': '<div ng-show="$dialog.visible">',
                    'template':            '<div><p>{{greeting}}</p><button ng-click="destroy()">destroy me!</button></div>',
                    'templateAfter': '</div>',
                    'controller': function($scope, dialog) {
                        ctrlScope = $scope;
                        ctrlDialog = dialog;

                        $scope.greeting = 'Hello';

                        $scope.destroy = function() {
                            dialog.destroy();
                        };

                    }
                });

                // trigger digest
                $timeout(done);
                $timeout.flush();

            });

            afterEach(function() {
                dialog.destroy();
            });

            it('should return $scope in custom controller', function() {
                expect(ctrlScope).toBeDefined();
            });

            it('should return dialog instance in custom controller', function() {
                expect(ctrlDialog).toBeDefined();
                expect(ctrlDialog.show).toBeDefined();
                expect(ctrlDialog.hide).toBeDefined();
                expect(ctrlDialog.destroy).toBeDefined();
            });

            it('should render controller variables in dialog template', function() {
                dom = $document[0].querySelector('.custom-dialog-class p');
                element = angular.element(dom);
                expect(element.text()).toBe('Hello');
            });

            it('should destroy dialog using custom controller functions', function() {
                dom = $document[0].querySelector('.custom-dialog-class button');
                element = angular.element(dom);
                element.triggerHandler('click');

                dom = $document[0].querySelector('.custom-dialog-class button');
                expect(dom).toBeNull();
            });

        });

    });

});
