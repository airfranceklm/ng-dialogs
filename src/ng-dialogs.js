import ngDialogsCoreService from './ng-dialogs-core.service.js';

angular.module('ng-dialogs-core',       []);
angular.module('ng-dialogs-messagebox', ['ng-dialogs-core']);
angular.module('ng-dialogs-modal',      ['ng-dialogs-core']);
angular.module('ng-dialogs',            ['ng-dialogs-messagebox', 'ng-dialogs-modal']);

angular.module('ng-dialogs-core').factory('ngDialogsCoreService', ngDialogsCoreService);
