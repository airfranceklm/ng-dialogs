describe('ng-dialogs-modal.service', function() {
    'use strict';

    var $rootScope, $compile, $document, $q, $timeout, $httpBackend;
    var ngDialogsModalService;

    beforeEach(module('test-ng-dialogs'));

    beforeEach(inject(function(_$rootScope_, _$compile_, _$document_, _$q_, _$timeout_, _$httpBackend_, _ngDialogsModalService_) {
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $document = _$document_;
        $q = _$q_;
        $timeout = _$timeout_;
        $httpBackend = _$httpBackend_;
        ngDialogsModalService = _ngDialogsModalService_;
    }));

    describe('ngDialogsModalService', function() {

        describe('Service', function() {
            it('should exist', function() {
                expect(ngDialogsModalService).toBeDefined();
            });
            it('should have the createDialog method', function() {
                expect(ngDialogsModalService.createDialog).toBeDefined();
            });
        });

        describe('Modal Dialog', function() {
            var modalDialog;
            beforeEach(function(done) {
                modalDialog = ngDialogsModalService.createDialog({
                    id: 'custom-dialog-id',
                    cssClass: 'custom-dialog-class',
                    template: '<div>Hello world</div>'
                });

                /* work-around for a-sync dialog construction */
                $timeout(done);
                $timeout.flush();
            });

            afterEach(function() {
                modalDialog.destroy();
            });

            it('should have modal html', function(done) {
                modalDialog.show().then(function() {
                    var el = $document[0].getElementById('custom-dialog-id');
                    expect(el.classList.contains('ng-dialogs-modal')).toBe(true);
                    expect(el.querySelector('ng-dialogs-modal__backdrop')).toBeDefined();
                    expect(el.querySelector('ng-dialogs-modal__content')).toBeDefined();
                    done();
                });
            });
        });

        describe('Modeless Dialog', function() {
            var modelessDialog;
            beforeEach(function(done) {
                modelessDialog = ngDialogsModalService.createDialog({
                    id: 'custom-dialog-id',
                    cssClass: 'custom-dialog-class',
                    template: '<div>Hello world</div>',
                    modeless: true
                });

                /* work-around for a-sync dialog construction */
                $timeout(done);
                $timeout.flush();
            });

            afterEach(function() {
                modelessDialog.destroy();
            });

            it('should have modeless html', function(done) {
                modelessDialog.show().then(function() {
                    var el = $document[0].getElementById('custom-dialog-id');
                    expect(el.classList.contains('ng-dialogs-modeless')).toBe(true);
                    done();
                });
            });
        });

    });

});
