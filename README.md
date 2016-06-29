# ng-dialogs

:exclamation: **note:** _not ready for production usage_

Just another angular dialog component...

<a href="https://xkcd.com/927/" target="_blank"><img src="https://imgs.xkcd.com/comics/standards.png" alt="Standards" title="Fortunately, the charging one has been solved now that we've all standardized on mini-USB. Or is it micro-USB? Shit." /></a>


## Demo

Clone project and run:

```bash
$ gulp serve
```


## Angular Components
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
