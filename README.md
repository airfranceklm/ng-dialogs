# ng-dialogs

:exclamation: **note:** _not ready for production usage_

Just another angular dialog component...

<a href="https://xkcd.com/927/" target="_blank"><img src="https://imgs.xkcd.com/comics/standards.png" alt="Standards" title="Fortunately, the charging one has been solved now that we've all standardized on mini-USB. Or is it micro-USB? Shit." /></a>

## Table of Contents

<!-- MarkdownTOC autolink=true bracket=round depth=3 -->

- [Demo](#demo)
- [Angular Components](#angular-components)
    - [ngDialogsModalService](#ngdialogsmodalservice)
    - [ngDialogsCoreService](#ngdialogscoreservice)
- [Feedback](#feedback)
- [TODO](#todo)
- [Inspiration](#inspiration)
- [License](#license)

<!-- /MarkdownTOC -->

## Demo

Clone project and run:

```bash
$ gulp serve
```


## Angular Components

### ngDialogsModalService
```javascript
    var dialog = ngDialogsModalService.createDialog({
        template: 'Hello world!'
    });

    dialog.show();
```

#### ngDialogsModalService.createDialog(options)

All options from the `ngDialogsCoreService` can be used, along with some specific modal dialog options.

* **`cssClass`**: _{String}_ Basic modal dialog styling. Default: `ng-dialogs-theme--basic`
* **`modeless`**: _{Boolean}_ Creates a modeless dialog. Default: `undefined`
* **`autoShow`**: _{Boolean}_ Show dialog after dialog init. `false`
* **`focus`**: _{Boolean/String}_ Set focus on specified element after showing dialog. `true` sets focus on root dialog element.
* **`focusTrap`**: _{Boolean}_ Trap focus on dialog and its elements.
* **`escapeClose`**: _{Boolean}_ Dismiss dialog on keyboard ESC press. Default: `true`
* **`outsideClose`**: _{Boolean}_ Dismiss modeless dialog when clicked outside of dialog. Default: `true`
* **`backdropClose`**: _{Boolean}_ Dismiss modal dialog when clicked on dialog backdrop. Default: `true`
* **`aria`**: _{Object}_ Apply aria markup to dialog.
* **`plugins`**: _{Array}_ Additional plugins. Default: `undefined`


### ngDialogsCoreService
This service takes care of the plumbing and provides the infrastructure to create all sorts of dialogs.

#### ngDialogsCoreService.createDialog(options)

After creation; the dialog instance is returned and remains closed by default.

* **`id`**: _{String}_ Unique dialog identifier. Default: `undefined`
* **`cssClass`**: _{String}_ Adds css class to dialog container. Default: `undefined`
* **`template`**: _{String}_ Dialog HTML. Default: `''`
* **`templateUrl`**: _{String}_ path to dialog HTML snippet. Default: `undefined`
* **`templateBefore`**: _{String}_ HTML dialog wrapper. Default: `'<div ng-show="$dialog.visible">'`
* **`templateAfter`**: _{String}_ HTML dialog wrapper. Default: `'</div>'`
* **`controller`**: _{Function/String}_ Dialog controller. Default: `angular.noop`
* **`controllerAs`**
* **`plugins`**: _{Array}_ Add behavior to dialog with plugins. Default: `[]`

##### ngDialogsCoreService dialog instance
* `.show()` show dialog
* `.hide()` hide dialog
* `.destroy()` destroy dialog

##### ngDialogsCoreService plugins

Add behavior to dialogs with plugins.

During a dialog's life-cycle, the following events are broadcasted. Plugins can utilize these or broadcast additional events.

* '`dialog:init`'
* '`dialog:show`'
* '`dialog:hide`'
* '`dialog:destroy`'


```javascript
// dialog plugin
function(scope, element, dialog, options) {
    // subscribe to broadcasted event
    scope.$on('dialog:init', function() {
        console.log('dialog:init');
    });

    // reference to dialog's root element
    element.addClass('foobar');

    // dialog api [.show(), .hide(), .destroy()]
    dialog.show();

    // access ngDialogsCoreService.createDialog options
    if (options.escapeClose) {
        // implementation
    }
}
```

Example: `escapeClose` plugin. Dismisses dialog by calling `.destroy()`.

```javascript
// dialog plugin
function escapeClosePlugin(scope, element, dialog, options) {
    // introduce new option `escapeClose`
    if (options.escapeClose === true) {
        scope.$on('dialog:init', dialogInit);
        function dialogInit () {
            element[0].addEventListener('keydown', function(event) {
                if (event.keyCode === 27) {
                    dialog.destroy();
                }
            }, true);
        }
    }
}
```

## Feedback
Your feedback is welcome.

Just file one feedback at: https://github.com/afklm/ng-dialogs/issues

## TODO
* modal dialog
* messagebox
* dropover
* tooltip

## Inspiration
* https://msdn.microsoft.com/en-us/library/windows/desktop/ms644994(v=vs.85).aspx
* https://developer.apple.com/library/mac/documentation/UserExperience/Conceptual/OSXHIGuidelines/WindowDialogs.html
* https://developer.android.com/guide/topics/ui/dialogs.html
* https://material.google.com/components/dialogs.html
* http://getbootstrap.com/javascript/#modals
* https://nakupanda.github.io/bootstrap3-dialog/
* https://github.com/m-e-conroy/angular-dialog-service
* https://github.com/likeastore/ngDialog

## License

The MIT License (MIT)

Copyright (c) 2016 KLM Royal Dutch Airlines
