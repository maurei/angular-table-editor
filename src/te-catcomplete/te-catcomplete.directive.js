function teCatcompleteDirective($timeout, $exceptionHandler, $q, $rootScope, tableEditor) {

    let proto = $.ui.autocomplete.prototype;
    let initSource = proto._initSource;
    let slice = Array.prototype.slice;

    function filter(array, term) {
        let matcher = new RegExp($.ui.autocomplete.escapeRegex(term), 'i');
        return $.grep(array, function(value) {
            return matcher.test($('<div>').html(value.label || value.value || value).text());
        });
    }

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

    function link(tableEditor, scope, element, attr, ctrl) {
        if (!element.is('input')) return
        tableEditor = tableEditor();
        if (tableEditor.constructor.name != "TableEditor") tableEditor = tableEditor(element.parents('[table-editor]').first().attr('table-editor'), true)

        let status = false,
            selectItem = null,
            events = {},
            ngModel = null,
            each = angular.forEach,
            isObject = angular.isObject,
            extend = angular.extend,
            autocomplete = scope.$eval(attr.teCatcomplete),
            valueMethod = angular.bind(element, element.val),
            methodsName = ['close', 'destroy', 'disable', 'enable', 'instance', 'option', 'search', 'widget'],
            eventsName = ['change', 'close', 'create', 'focus', 'open', 'response', 'search', 'select'];


        const ngModelChoicesObjects = autocomplete.options;

        function setNgModelValue($viewInput) {
            const oldModelValue =  ctrl.$modelValue ;
            if (ngModelChoicesObjects.currSource.length) {
                const x = ngModelChoicesObjects.currSource.filter(choice => choice.label == $viewInput)
                if (x.length == 1) {
                    return x[0] 
                } else {
                    return oldModelValue
                }
            }
        }


        ctrl.$formatters.push($newModelValue => {
            if ($newModelValue) return $newModelValue.label
        })
        ctrl.$parsers.push(setNgModelValue)

        let uiEvents = {
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
                let value = valueMethod(),
                    selected = false;

                if (selectItem && selectItem.item && (value.indexOf(selectItem.item.value) !== -1)) {
                    value = selectItem.item.value;
                    selected = true;
                }
            }
        };

        function changeNgModel(data) {
            if (isObject(ngModel)) {
                if (!ctrl.$viewValue && ctrl.$viewValue !== 0) {
                    emptyObj(ngModel);
                } else if (data && data.item) {
                    data.item.label = isObject(data.item.label) ? $('<div>').append(data.item.label).html() : data.item.label;
                    extend(ngModel, data.item);
                }
                each(ctrl.$viewChangeListeners, function(listener) {
                    try {
                        listener();
                    } catch (e) {
                        $exceptionHandler(e);
                    }
                });
            }
        }

        function cleanNgModel() {
            ctrl.$setViewValue('');
            ctrl.$render();
            changeNgModel();
        }

        function autoFocusHandler() {
            if (autocomplete.options.focusOpen && !status) {
                element.catcomplete('search', '');
            }
        }

        function checkOptions(options) {
            options = isObject(options) ? options : {};
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

        function emptyObj(a) {
            if (isObject(a)) {
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
                    } else if (isObject(value)) {
                        emptyObj(value);
                    }
                });
            }
        }

        function menuIsOpened() {
            return autocomplete.widget.is(':visible');
        }

        function menuContainsItems() {
            return menuOptions.length > 1 || menuOptions[0].value != null
        }

        function upOrDownKey(event) {
            return event.keyCode === $.ui.keyCode.UP || event.keyCode === $.ui.keyCode.DOWN || event.keyCode === $.ui.keyCode.TAB || event.which == 16
        }

        if (!isObject(autocomplete)) {
            return;
        }

        autocomplete.methods = {};
        autocomplete.options = checkOptions(autocomplete.options);

        // extend events to Autocomplete
        each(eventsName, function(name) {
            let _event = autocomplete.options[name];
            _event = typeof _event === 'function' ? _event : angular.noop;
            events[name] = function(event, ui) {
                if (uiEvents[name]) {
                    uiEvents[name](event, ui);
                }
                _event(event, ui);
                if (autocomplete.events && typeof autocomplete.events[name] === 'function') {
                    autocomplete.events[name](event, ui);
                }
            };
        });

        // extend Autocomplete methods to AngularJS
        each(methodsName, function(name) {
            autocomplete.methods[name] = function() {
                let args = slice.call(arguments);
                args.unshift(name);
                return element.catcomplete.apply(element, args);
            };
        });
        // add filter method to AngularJS
        autocomplete.methods.filter = filter;
        autocomplete.methods.clean = cleanNgModel;

        element.on('focus', autoFocusHandler);



        element.on('keydown', (event) => {
            if (upOrDownKey(event)) {
                // if (event.which = 67) event.preventDefault()
                if (!menuIsOpened()) {
                    event.stopImmediatePropagation();
                    tableEditor.trigger({ event: event })
                } else if (menuIsOpened()) {
                    if (menuContainsItems()) {
                        event.preventDefault();
                        if (menuOptions.length == 1){
                            // ctrl.$commitViewValue(menuOptions[0].label)
                            ctrl.$setViewValue(menuOptions[0].label);
                            ctrl.$render();
                            element.data('custom-catcomplete').selectedItem = menuOptions[0]
                            // element.trigger('menuselect')
                            // element.data('custom-catcomplete')._trigger('select', 'catcompleteselect', {item: menuOptions[0], mode: true})

                            // $('ul.ui-autocomplete').eq(0).trigger
                            // element;
                            // element.trigger('catcompleteselect', {item: menuOptions[0], mode: true} )
                            // $(this).data('ui-autocomplete')._trigger('select', 'catcompleteselect', {item:{value:$(this).val()}});

                            // changeNgModel();
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

        var test = element.catcomplete(extend({}, autocomplete.options, events));
        test

        /* stretch goal: understand how the fuck I made this work */


        autocomplete.widget = element.catcomplete('widget');


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
        autocomplete.widget.removeClass('ui-menu ui-corner-all ui-widget-content').addClass('dropdown-menu');
    }

    return {
        require: 'ngModel',
        link: link.bind(this, tableEditor)
    };
}

export default teCatcompleteDirective
