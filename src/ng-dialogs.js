import ngDialogsCoreService from './ng-dialogs-core.service.js';
import ngDialogsCorePluginsService from './ng-dialogs-core-plugins.service.js';
import ngDialogsModalService from './ng-dialogs-modal.service.js';

angular.module('ng-dialogs-core',       []);
angular.module('ng-dialogs-messagebox', ['ng-dialogs-core']);
angular.module('ng-dialogs-modal',      ['ng-dialogs-core']);
angular.module('ng-dialogs',            ['ng-dialogs-messagebox', 'ng-dialogs-modal']);

angular.module('ng-dialogs-core').factory('ngDialogsCoreService', ngDialogsCoreService);
angular.module('ng-dialogs-core').factory('ngDialogsCorePluginsService', ngDialogsCorePluginsService);
angular.module('ng-dialogs-modal').factory('ngDialogsModalService', ngDialogsModalService);
