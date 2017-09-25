class teCatcompleteDirective {


    constructor($timeout, $exceptionHandler, $q, tableEditor) {
        // AngularJS directive required properties
        this.scope = false;
        this.require = 'ngModel';
        this.controllerAs = '$teCatcompleteCtrl'

        // internal usage of AngularJS services
        this._$timeout = $timeout;
        this._$q = $q;
        this._tableEditor = tableEditor;
        this._$exceptionHandler = $exceptionHandler;

        // Extending jQuery UI autocomplete widget to catcomplete.
        this._createWidget();

    }

    controller() {}

    link($scope, element, attributes, ngModelCtrl) {
        if (!element.is('input')) return

        const $timeout = this._$timeout;
        const $q = this._$q;
        const $exceptionHandler = this._$exceptionHandler;
        const filter = this._filter;
        let tableEditor = this._tableEditor;
        tableEditor = tableEditor();
        if (tableEditor.constructor.name != "TableEditor") tableEditor = tableEditor(element.parents('[table-editor]').first().attr('table-editor'), true)

        const teCatcomplete = $scope.teCatcomplete;
        if (!angular.isObject(teCatcomplete)) return;

        const methodsName = ['close', 'destroy', 'disable', 'enable', 'instance', 'option', 'search', 'widget'];
        const eventsName = ['change', 'close', 'create', 'focus', 'open', 'response', 'search', 'select'];


        // When the ngModel is changed, make sure we're only displaying the label in the input element
        ngModelCtrl.$formatters.push($newModelValue => {
            if ($newModelValue) return $newModelValue.label
        })

        // We don't want to set the ngModel to the actual $viewInput, i.e. what the user is type, but select one of the teCatcomplete.options accordingly. For this, I "hijack" the $parsers pipeline (https://stackoverflow.com/questions/35309114/set-model-value-programmatically-in-angular-js/44071623#44071623) using _setNgModelValue.
        ngModelCtrl.$parsers.push(($viewInput) => this._setNgModelValue(teCatcomplete.options, ngModelCtrl, $viewInput))

        teCatcomplete.methods = {};
        teCatcomplete.options = this._checkOptions(element, teCatcomplete.options);

        // extend events to teCatcomplete
        let status = false;
        let selectItem = null;
        const events = {};
        const uiEvents = {
            open: function(event, ui) {
                status = true;
                selectItem = null;
            },
            close: function(event, ui) {
                status = false;
            },
            select: function(event, ui) {
                selectItem = ui;
                $timeout(function() {
                    element.blur();
                }, 0);
            },
            change: function(event, ui) {
                let value = element.val(),
                    selected = false;

                if (selectItem && selectItem.item && (value.indexOf(selectItem.item.value) !== -1)) {
                    value = selectItem.item.value;
                    selected = true;
                }
            }
        };
        angular.forEach(eventsName, function(name) {
            let _event = teCatcomplete.options[name];
            _event = typeof _event === 'function' ? _event : angular.noop;
            events[name] = function(event, ui) {
                if (uiEvents[name]) {
                    uiEvents[name](event, ui);
                }
                _event(event, ui);
                if (teCatcomplete.events && typeof teCatcomplete.events[name] === 'function') {
                    teCatcomplete.events[name](event, ui);
                }
            };
        });

        // extend teCatcomplete methods to AngularJS
        angular.forEach(methodsName, function(name) {
            teCatcomplete.methods[name] = function() {
                let args = slice.call(arguments);
                args.unshift(name);
                return element.catcomplete.apply(element, args);
            };
        });
        teCatcomplete.methods.filter = filter;
        // teCatcomplete.methods.clean = () => this._cleanNgModel(ngModelCtrl);
        element.on('focus', () => this._autoFocusHandler(teCatcomplete, element));



        element.on('keydown', (event) => {
            if (upOrDownKey(event)) {
                if (!menuIsOpened()) {
                    event.stopImmediatePropagation();
                    tableEditor.trigger({ event: event })
                } else if (menuIsOpened()) {
                    if (menuContainsItems()) {
                        event.preventDefault();
                        if (menuOptions.length == 1) {
                            ngModelCtrl.$setViewValue(menuOptions[0].label);
                            ngModelCtrl.$render();
                            element.data('custom-catcomplete').selectedItem = menuOptions[0]
                        } else {
                            tableEditor.preventAction();
                        }
                    } else {
                        event.stopImmediatePropagation()
                        tableEditor.trigger({ event: event })
                    }
                };
            }
        })

        function menuIsOpened() {
            return teCatcomplete.widget.is(':visible');
        }

        function menuContainsItems() {
            return menuOptions.length > 1 || menuOptions[0].value != null
        }

        function upOrDownKey(event) {
            return event.keyCode === $.ui.keyCode.UP || event.keyCode === $.ui.keyCode.DOWN || event.keyCode === $.ui.keyCode.TAB || event.which == 16
        }
        let options = angular.extend({}, teCatcomplete.options, events)
        const catcomplete = element.catcomplete(options);
        teCatcomplete.widget = element.catcomplete('widget');


        let menuOptions;
        let selectOption;


        element.on("blur", (event) => {
            if (selectOption) {
                event.stopPropagation();
                tableEditor.restoreFocus();
                selectOption = false;
            }
        });

        element.on("catcompleteselect", () => {
            tableEditor.inTable = true
            tableEditor.preventAction();
            selectOption = true
        });

        element.on("catcompleteresponse", (event, ui) => {
            menuOptions = ui.content
        });

        // remove default class, use bootstrap style
        teCatcomplete.widget.removeClass('ui-menu ui-corner-all ui-widget-content').addClass('dropdown-menu');

        $scope.$on('$destroy', () => {
            catcomplete.catcomplete('destroy')
            element.off();
            teCatcomplete.widget = null;
            teCatcomplete.methods = null;
            teCatcomplete.options.position = null
            delete $scope.teCatcomplete;
            element = null;
            tableEditor = null;
            ngModelCtrl = null;
        })
    }

    // Make sure nothing bad is selected while typing, and autoselect match when there is just one
    _setNgModelValue(ngModelChoices, ngModelCtrl, $viewInput) {
        const oldModelValue = ngModelCtrl.$modelValue;
        if (ngModelChoices.currSource.length) {
            const x = ngModelChoices.currSource.filter(choice => choice.label == $viewInput)
            if (x.length == 1) {
                return x[0]
            } else {
                return oldModelValue
            }
        }
    }

    _autoFocusHandler(teCatcomplete, element, status = false) {
        if (teCatcomplete.options.focusOpen && !status) {
            element.catcomplete('search', '');
        }
    }

    _checkOptions(element, options) {
        options = angular.isObject(options) ? options : {};
        // if source not set, disabled autocomplete
        options.disabled = options.source ? options.disabled : true;
        // if focusOpen, minLength must be 0
        options.appendTo = options.appendTo || element.parents('.ng-view')[0] || element.parents('[ng-view]')[0] || null;
        options.minLength = options.focusOpen ? 0 : options.minLength;
        options.outHeight = options.outHeight || 0;
        options.position = options.position || {
            my: 'left top',
            at: 'left bottom',
            collision: 'flipfit'
        };
        return options;
    }

    _emptyObj(a) {
        if (angular.isObject(a)) {
            let reg = /^\$/;
            each(a, function(value, key) {
                let type = typeof value;
                if (reg.test(key)) {
                    return; // don't clean private property of AngularJS
                } else if (type === 'number') {
                    a[key] = 0;
                } else if (type === 'string') {
                    a[key] = '';
                } else if (type === 'boolean') {
                    a[key] = false;
                } else if (angular.isObject(value)) {
                    this._emptyObj(value);
                }
            });
        }
    }

    _createWidget() {
        let proto = $.ui.autocomplete.prototype;
        let initSource = proto._initSource;
        let slice = Array.prototype.slice;

        function filter(array, term) {
            let matcher = new RegExp($.ui.autocomplete.escapeRegex(term), 'i');
            return $.grep(array, function(value) {
                return matcher.test($('<div>').html(value.label || value.value || value).text());
            });
        }
        this._filter = filter;

        $.extend(proto, {
            _initSource: function() {
                if (this.options.html && $.isArray(this.options.source)) {
                    this.source = function(request, response) {
                        response(filter(this.options.source, request.term));
                    };
                } else {
                    initSource.call(this);
                }
            },

            _normalize: function(items) {
                // assume all items have the right format
                return $.map(items, function(item) {
                    if (item && typeof item === "object") {
                        return $.extend({
                            label: item.label || item.value,
                            value: item.value || item.label
                        }, item);
                    } else {
                        return {
                            label: item + '',
                            value: item
                        };
                    }
                });
            },

            _renderItemData: function(ul, item) {
                let element = item.groupLabel || item.label;
                if (item.groupLabel) {
                    element = $('<div>').append(element).addClass('ui-menu-group');
                } else if (this.options.html) {
                    if (typeof element === 'object') {
                        element = $(element);
                    }
                    if (typeof element !== 'object' || element.length > 1 || !element.is('a')) {
                        element = $('<a class="dropdown-item">').append(element);
                    }
                } else {
                    element = $('<a class="dropdown-item">').text(element);
                }
                return $('<li>').append(element).appendTo(ul).data('ui-autocomplete-item', item);
            },

            _resizeMenu: function() {
                let that = this;
                setTimeout(function() {
                    let ul = that.menu.element;
                    let maxHeight = ul.css('max-height') || 0,
                        width = Math.max(
                            ul.width('').outerWidth() + 1,
                            that.element.outerWidth()),
                        oHeight = that.element.height(),
                        height = $(window).height() - that.options.outHeight - ul.offset().top;
                    height = maxHeight && height > maxHeight ? maxHeight : height;
                    ul.css({
                        width: width,
                        maxHeight: height
                    });
                }, 10);
            }
        });

        $.widget("custom.catcomplete", $.ui.autocomplete, {
            _create: function() {
                this._super();
                this.widget().menu("option", "items", "> :not(.ui-autocomplete-category)");
            },
            _renderMenu: function(ul, items) {
                items = items.sort((x, y) => {
                    if (x.category < y.category) return -1
                    if (x.category > y.category) return 1
                    return 0
                })
                let that = this,
                    currentCategory = "";
                $.each(items, function(index, item) {
                    let li;
                    if (item.category != currentCategory) {
                        ul.append("<li class='ui-autocomplete-category'>" + item.category + "</li>");
                        currentCategory = item.category;
                    }
                    li = that._renderItemData(ul, item);
                    if (item.category) {
                        li.attr("aria-label", item.category + " : " + item.label);
                    }
                });
            }
        });
    }

}




export default teCatcompleteDirective