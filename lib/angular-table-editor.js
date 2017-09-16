(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("angular-table-editor", [], factory);
	else if(typeof exports === 'object')
		exports["angular-table-editor"] = factory();
	else
		root["angular-table-editor"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class teCellDirective {
    constructor($timeout, $compile, tableEditor) {
        this.restrict = "A";
        this.scope = { teCell: '=', teCellActive: '&', teCellOptions: '<', 'teCatcomplete': '<', teCellValidate: '<' };
        this.require = ['^teRow', '?ngModel', 'teCell']
        this.controllerAs = '$ctrl'
        const link = this.link.bind(this, tableEditor, $compile, $timeout)
        this.compile = function() {
            return { post: link }

        }
    }

    link(tableEditor, $compile, $timeout, $scope, element, attributes, controllersArr) {
        const ngModel = controllersArr[1];
        const teRowController = controllersArr[0];

        // Supply ngModel with custom validators.
        if ($scope.teCellValidate) {
            const validators = Array.prototype.concat.apply([], [$scope.teCellValidate])
            validators.forEach(validator => ngModel.$validators[validator.name] = validator)
            $scope.validate = () => {
                ngModel.$validate();
            }
            $scope.teCellValidate = true;
        } else {
            $scope.$valid = true;
        }


        // Parse cell options
        if ($scope.teCellOptions) {
            // Put custom attributes on the inputbox that will be created when inputifying. For dates, there is special support.
            $scope.inputAttributes = $scope.teCellOptions.inputAttributes;
            if ($scope.inputAttributes) {
                if ($scope.inputAttributes.type == 'date') {
                    attributes.name = 'date'
                    ngModel.$parsers.push(val => new Date(val))
                }
                if ($scope.inputAttributes.type == 'number') {
                    ngModel.$parsers.push(val => parseFloat(val))
                }
            }
            delete $scope.teCellOptions
        }

        // Grab an instance of the TableEditorService for this table.
        let name = element.parents('[table-editor]').first().attr('table-editor')
        if (name == "") name = "unnamed"
        let found = tableEditor(name, true)
        if (!found) {
            throw Error('Cannot find corresponding tableEditorService for cell.');
        } else {
            tableEditor = found;
        }

        // If a cell uses catcomplete, we're communicating with a nested ngModel. $parsers: the nested ngModel $modelvalue is bound to $scope.teCell, 
        // which is the actual item object. We must return that rather than val, which is just the viewValue i.e. the label in the inputfield. 
        // $formatters: the label we're putting in must be on the catcomplete choice object on attribute "label".
        if ($scope.teCatcomplete) {
            ngModel.$parsers.push(val => {
                return $scope.teCell
            })
            ngModel.$formatters.push(tableEditor.viewValueFormatter.teCatcomplete)
        }
        // This attr no longer is needed
        element.removeAttr('te-catcomplete');

        // Load any custom viewValueFormatters.
        let viewValueFormatter;
        if (tableEditor.viewValueFormatter.hasOwnProperty(attributes.name)) {
            ngModel.$formatters.push(tableEditor.viewValueFormatter[attributes.name])
            viewValueFormatter = tableEditor.viewValueFormatter[attributes.name]
        }

        // We're using ngModel.$viewValue as the label for our teCell inputbox.
        ngModel.$render = () => element.html(ngModel.$viewValue);

        teRowController.$$registerCellToggle($scope.$ctrl)

        const onLinkData = tableEditor.onLink(element),
            toInputStyle = tableEditor.toInputStyle.bind(this, onLinkData),
            toCellStyle = tableEditor.toCellStyle.bind(this, onLinkData),
            validate = this._validate.bind(this, $scope, attributes, ngModel, teRowController),
            // read = this._read.bind(this, $scope, validate, attributes, ngModel, viewValueFormatter, teRowController),
            read = this._read.bind(this, validate, attributes, ngModel, viewValueFormatter, teRowController),
            addAttrsTo = this._addAttrsTo.bind(this, $scope),
            cellify = this._cellify.bind(this, $scope, ngModel, element, attributes, read, toCellStyle),
            inputify = this._inputify.bind(this, $timeout, $scope, $compile, ngModel, element, attributes, read, toInputStyle, addAttrsTo),
            dispose = this._dispose.bind(this, $scope, element, attributes, teRowController, cellify, validate),
            instantiate = this._instantiate.bind(this, $scope, element, teRowController, inputify);



        $scope.$$teCellSearchUnregisterFn = $scope.$on('$teCellSearch', function(event, targetElement, callbackFn){
            if (element.get(0) == targetElement) callbackFn($scope.$ctrl);
        })

        $scope.$ctrl.ngModel = ngModel;
        $scope.$ctrl.$validate = validate;
        $scope.$ctrl.$$cellify = cellify
        $scope.$ctrl.$$inputify = inputify
        $scope.$ctrl.$$markActive = function() {
            element.find('input').focus();
            teRowController.$$markActiveCell(this);
        }
        $scope.$ctrl.$$getTeRowCtrl = function(){ return teRowController}


        // At this point, everything that is minimally needed is loaded. We can now abort if we wish to disable editor mode for this cell.
        // We must also save the instantiate logic in case editor mode for this cell is activated again.
        if (attributes.teCellActive && !$scope.teCellActive()) {
            dispose();
        }


        function teCellActiveWatcher(){
            return $scope.teCellActive()
        }
        function teCellActiveHandler(newVal, oldVal){
            if (newVal == false && oldVal != newVal ){

                dispose();
            }
            if (newVal == true && oldVal != newVal ){
                instantiate();
            }
        }

        $scope.$watch(teCellActiveWatcher, teCellActiveHandler );
        $scope.$on('$destroy', () => {
            $scope.$$teCellSearchUnregisterFn()
        })
        



    }



    controller($scope) {
        this.$reset = function() {
            $scope.teCell = ""
        }
    }

    _instantiate($scope, element, teRowController, inputify) {
        teRowController.$$registerCellToggle($scope.$ctrl)
        $scope.$$teCellSearchUnregisterFn = $scope.$on('$teCellSearch', function(event, targetElement, callbackFn){
            if (element.get(0) == targetElement) callbackFn($scope.$ctrl);
        })
        if ($scope.teCellValidate === false) $scope.teCellValidate = true
        if (teRowController.$active) inputify();

    }


    _dispose($scope, element, attributes, teRowController, cellify, validate) {
        teRowController.$$registerCellToggle($scope.$ctrl)
        if ($scope.$$teCellSearchUnregisterFn) $scope.$$teCellSearchUnregisterFn();
        if ($scope.active == true){
            // if there were any errors before removing a cell, these should be ignored. But only if validation was activated in the first place.
            teRowController.$$removeErrors(attributes.name)
            if ($scope.teCellValidate === true) $scope.teCellValidate = false
            cellify();
        }
    }

    _addAttrsTo($scope, element) {
        $scope._inputInitialized = true;
        for (let key in $scope.inputAttributes) {
            let attr;
            if (element.attr(key) && !$scope._inputInitialized) {
                attr = element.attr(key) + ' ' + $scope.inputAttributes[key]
            } else {
                attr = $scope.inputAttributes[key];
            }
            element.attr(key, attr);
        }
    }


    // Forms bridge between ngModel on the HTMLInputElement and the one within this directive. $scope is refering to the $scope of the HTMLInputElement, ngModel is the one in living the directive level
    _read(validate, attributes, ngModel, viewValueFormatter, teRowController, $scope, init) {

        if (init != true) {
            if ($scope.teCatcomplete) {
                if ($scope.teCell != undefined) ngModel.$setViewValue($scope.teCell.label);
            } else if (viewValueFormatter) {
                const res = viewValueFormatter($scope.teCell);
                ngModel.$setViewValue(res);
                if (res) {
                    delete ngModel.$error.parse;
                } else {
                    ngModel.$error.parse = true;
                }
            } else {
                ngModel.$setViewValue($scope.teCell)
            }
        }

        const key = attributes.name || $scope.$id;
        teRowController.$$setDirty(key, ngModel.$dirty);
        if ($scope.teCellValidate) validate();
    }

    _validate($scope, attributes, ngModel, teRowController) {
        if (Object.keys(ngModel.$validators).length || Object.keys(ngModel.$error).length) {
            const key = attributes.name || $scope.$id;
            teRowController.$$setError(key, ngModel.$error);
        }
        $scope.$valid = ngModel.$valid
    }

    _cellify($scope, ngModel, element, attributes, read, toCellStyle) {
        $scope.active = false;
        read($scope.$$childHead)
        element.empty();
        ngModel.$render()
        toCellStyle(element);
        $scope.$$childHead.$destroy();
    }


    _inputify($timeout, $scope, $compile, ngModel, element, attributes, read, toInputStyle, addAttrsTo) {
        const isolateScope = $scope.$new(true);
        isolateScope.teCell = ngModel.$modelValue;
        isolateScope.active = true
        isolateScope.read = () => {isolateScope.$evalAsync( () => { read(isolateScope) })}
        isolateScope.teCatcomplete = $scope.teCatComplete;
        const template = angular.element(`<input te-cell-input ng-model="teCell"  type='text' ng-change='read()' class='form-control'></input>`)

        if ($scope.teCatcomplete) template.attr('te-catcomplete', 'teCatcomplete');
        addAttrsTo(template);
        toInputStyle(element, template);
        let compiledHtml = $compile(template)(isolateScope);
        $timeout().then(() => {
            element.empty();
            element.append(compiledHtml);
        })
    }





}

/* harmony default export */ __webpack_exports__["a"] = (teCellDirective);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class teRowDirective {
    constructor() {
        this.restrict = "A";
        this.scope = { teRow: '<', teRowContext: '<' };
        this.require = { '$tableEditorCtrl': '^tableEditor' }
        this.controllerAs = '$teRowCtrl'
        const pre = this.pre.bind(this)
        const post = this.post.bind(this)
        this.compile = function() {
            return { pre: pre, post: post }
        }
    }

    pre($scope, element) {
        $scope.$teRowCtrl.$$element = element;
    }

    post($scope, element, attributes, controllers) {
        const $tableEditorCtrl = controllers.$tableEditorCtrl
        if (!element.find('[te-cell]').length) {
            element.removeAttr('te-row');
            element.removeAttr('te-row-context');
            return
        }
        let context;
        if ($scope.teRowContext) {
            if (typeof($scope.teRowContext) != 'object') throw new Error('teRowContext must have an object or array bound to it, got a ' + typeof($scope.teRowContext) + ' instead.')
            context = Array.prototype.concat.apply([], [$scope.teRowContext]);
            if (context.length) context[0].$teRowCtrl = $scope.$teRowCtrl;
        }

        $scope.$teRowCtrl.$trigger = () => {
            $tableEditorCtrl.$$trigger($scope.$teRowCtrl)
        }
        $scope.$teRowCtrl.$$teRowContext = context || [$scope.$teRowCtrl]
        $scope.$on('$destroy', () => { 
            $tableEditorCtrl.$$registerRowToggle($scope.$teRowCtrl) 
        })
        $tableEditorCtrl.$$registerRowToggle($scope.$teRowCtrl)



    }

    controller($scope, $timeout) {
        this.$dirty = false
        this.$valid = true;
        this.$error = {}
        this.$cells = [];
        this.$active = false;
        this.$activeCell = null;

        this.$$updateTeIdx = () => {
            this.$$element.attr('te-idx', this.$$teRowIdx)
        }



        this.$$cellify = () => {
            this.$active = false;
            this.$activeCell = null;
            this.$cells.forEach($cellCtrl => {
                $cellCtrl.$$cellify();
            })
        }
        this.$$inputify = () => {
            this.$cells.forEach($cellCtrl => {
                if (!$cellCtrl.$$inputify) debugger
                $cellCtrl.$$inputify();
            })
            this.$active = true;
        }
        this.$setPristine = function() {
            this.$cells.forEach(c => c.ngModel.$setPristine())
            this.$dirty = false;
            this.$$trackDirty.length = 0;
        }

        this.$validate = function() {
            $timeout().then(() => {
                this.$cells.forEach(c => {
                    c.$validate()
                })
            })
        }

        let teCellIdx = 1;
        let initMode = true;
        this.$$registerCellToggle = function($cellCtrl, $$element) {
            if ($cellCtrl.$$teCellId) {
                initMode = false;
            } else {
                $cellCtrl.$$teCellId = teCellIdx;
                teCellIdx++
            }

            const idx = this.$cells.indexOf($cellCtrl);
            if (idx > -1) {
                this.$cells.splice(idx, 1);
            } else {
                let idx = this.$cells.findIndex(ctrl => $cellCtrl.$$teCellId + 1 == ctrl.$$teCellId);
                idx == -1 ? idx = this.$cells.length : "";
                this.$cells.splice(idx, 0, $cellCtrl);
                // this.$cells.push($cellCtrl);
            }
        }
        this.$$markActiveCell = function($cellCtrl) {
            this.$activeCell = $cellCtrl;
        }
        this.$$trackDirty = [];
        this.$$setError = (field, $error) => {
            this.$error[field] = $error;
            let _errorFound = false
            for (let field in this.$error) {
                if (Object.getOwnPropertyNames(this.$error[field]).length) _errorFound = true;
            }
            this.$valid = !_errorFound;
        }
        this.$$setDirty = (field, $dirty) => {
            if (!this.$dirty && $dirty) {
                this.$$trackDirty.push(field)
                this.$dirty = true
            } else if (this.$dirty && !$dirty) {
                this.$$trackDirty = this.$$trackDirty.filter(dirtyField => dirtyField != field)
                if (!this.$$trackDirty.length) this.$dirty = false;
            }
        }
        this.$$removeErrors = (name) => {
            this.$error[name] = {};
        }
        this.$$getNextCell = (idx, ensureMatch) => {
            if (idx > this.$cells.length - 1) {
                if (ensureMatch) return this.$cells[this.$cells.length - 1]
                return null;
            } else if (idx < 0) {
                return null;
            } else {
                return this.$cells[idx];
            }
        }
    }
}


/* harmony default export */ __webpack_exports__["a"] = (teRowDirective);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class tableEditorDirective {




    constructor(tableEditor, $rootScope, $timeout) {
        $(window).on('click', () => $rootScope.$broadcast('teClick'))
        this.restrict = "A";
        this.scope = { teRowChange: '&' };
        this.controllerAs = '$tableEditorCtrl'
        this.link = this.link.bind(this, tableEditor, $rootScope, $timeout)
    }


    _actionMapper() {
        const actionMapper = {
            '++': ['nextAll', 'first'],
            '--': ['prevAll', 'last'],
            'prevAll': ['prevAll', 'last'],
            'nextAll': ['nextAll', 'first']
        };
        return actionMapper
    }
    _moveMapper() {
        const moveMapper = {
            'right': { which: 9 },
            'left': { which: 9, shiftKey: true },
            'up': { which: 38 },
            'down': { which: 40 },
        };

        for (let x in moveMapper) {
            moveMapper[x].preventDefault = function() {}
        }
        return moveMapper
    }

    link(tableEditor, $rootScope, $timeout, $scope, element, attributes) {
        if (attributes.tableEditor == "") attributes.tableEditor = "unnamed";
        let found = tableEditor(attributes.tableEditor, true)
        if (!found) {
            tableEditor = tableEditor.registerTableEditor(attributes.tableEditor)
        } else {
            tableEditor = found;
        }

        const actionMapper = this._actionMapper();
        const moveMapper = this._moveMapper();

        const associatedAction = this._associatedAction,
            executeFor = this._executeFor.bind(this, $timeout, $scope, tableEditor),
            keyboardControl = this._keyboardControl.bind(this, $scope, executeFor, tableEditor);
        $scope.currentRow = null;
        $scope.currentCell = null;
        tableEditor.restoreFocus = this._restoreFocus.bind(this, $scope);
        tableEditor.move = this._move.bind(this, keyboardControl, moveMapper)
        tableEditor.trigger = this._trigger.bind(this, $scope, $rootScope, element, executeFor, associatedAction, keyboardControl)
        tableEditor.checkValidity = this._checkValidity.bind(this, element)
        tableEditor.inTable = false;
        $scope.$on('teClick', () => {
            if (!tableEditor.inTable && $scope.currentCell) executeFor(null);
            tableEditor.inTable = false
        })
        tableEditor.$rows = $scope.$tableEditorCtrl.$rows;
        $scope.$tableEditorCtrl.$$trigger = (rowCtrl) => executeFor(rowCtrl.$cells[0])




        element.on('click', event => {
            tableEditor.inTable = true;
            const target = event.target
            let teCellTarget = null;
            if ((target.tagName == 'TD' || target.tagName == 'TH') && target.attributes['te-cell'] != undefined) {
                teCellTarget = event.target
            } else if (target.tagName == 'INPUT' && target.attributes['te-cell-input'] != undefined) {
                teCellTarget = event.target.parentElement
            }
            if (teCellTarget) {
                // I think I need rootscope here because this directive uses isolate scope. Double check this later and fix.
                $rootScope.$broadcast('$teCellSearch', teCellTarget, executeFor)
            }
        })
        element.on("keydown", event => {
            let action = associatedAction(event);
            if ($(event.target).is('input')) { keyboardControl(action) }
        })


    }

    controller($scope, $timeout) {
        let timeout;
        this.$rows = [];
        let teRowIdx = 0;
        this.$$initMode = true;
        this.$$registerRowToggle = ($rowCtrl) => {

            if (!timeout) timeout = $timeout().then(() => {
                this.$$initMode = false;
                console.log('timeout done')
            });

            if (this.$$initMode) { // first time we're registering rows, just push everything in there, order should be correct by default.
                $rowCtrl.$$teRowIdx = teRowIdx;
                teRowIdx++;
                $rowCtrl.$$updateTeIdx();
                this.$rows.push($rowCtrl);
            } else if (Number.isInteger($rowCtrl.$$teRowIdx)) { // row is already registered, we have to get rid of it
                const idx = this.$rows.indexOf($rowCtrl);
                if (idx == -1) throw Error('shouldn\'t have gotten here')
                if (this.$rows[idx].$active) {
                    $scope.currentCell = null;
                    $scope.currentRow = null;
                }
                this.$rows.splice(idx, 1);
                if (!this.$rows.length) {
                    timeout = null;
                    this.$$initMode = true;
                }
            } else { // we're inserting rows after instantiation. We have to be careful about the order.
                let prevRowIdx = Number.parseInt($rowCtrl.$$element.prev('tr[te-row]').attr('te-idx')); // -1 if there was no previous row, i.e. this row will be inserted as first.

                const prevTbody = $rowCtrl.$$element.closest('tbody').prevAll('tbody')
                if (Number.isNaN(prevRowIdx) && prevTbody.length) {
                    for (let i = 0; i < prevTbody.length; i++) {
                        prevRowIdx = parseInt($rowCtrl.$$element.closest('tbody').prev('tbody').find('tr[te-row]').last().attr('te-idx'))
                        if (Number.isInteger(prevRowIdx) && prevRowIdx > -1) break
                    }
                }
                if (!Number.isInteger(prevRowIdx)) prevRowIdx = -1
                $rowCtrl.$$teRowIdx = prevRowIdx + 1
                $rowCtrl.$$updateTeIdx();
                const spliceIdx = this.$rows.findIndex((r) => r.$$teRowIdx == prevRowIdx);
                this.$rows.splice(spliceIdx + 1, 0, $rowCtrl);
                for (let j = spliceIdx + 2; j < this.$rows.length; j++) {
                    const rowCtrl = this.$rows[j]
                    rowCtrl.$$teRowIdx = j
                    rowCtrl.$$updateTeIdx();
                }
            }
        }



    }



    _checkValidity(element, id) {
        let valid = true;
        const cellScopes = element.find('tr[te-row="' + id + '"]').find('td[te-cell]').map((idx, cell) => this._getScope($(cell)));
        for (let i = 0; i < cellScopes.length; i++) {
            if (!cellScopes[i].$checkValidity()) valid = false;
        }
        return valid;
    }

    _trigger($scope, $rootScope, element, executeFor, associatedAction, keyboardControl, args) {
        if (!args.event) {
            // triggered through API, in which case we're should handle as a click event
            if (!args.id) throw Error("No ID was given to find the te-row to trigger to.")
            const nextCell = element.find('tr[te-row-id="' + args.id + '"]').find('td[te-cell]').first().get(0);
            $rootScope.$broadcast('$teCellSearch', nextCell, executeFor)
        } else {
            let action = associatedAction(args.event)
            keyboardControl(action)
        }
    }

    _restoreFocus($scope) {
        $scope.currentCell.$$markActive();
    }

    _move(keyboardControl, moveMapper, cmd) {
        if (typeof(cmd) == 'string') {
            cmd = moveMapper[cmd];
            if (!cmd) return;
        }
        keyboardControl(cmd)
    }

    _keyboardControl($scope, executeFor, tableEditor, action) {
        if (action == false) return
        if (tableEditor.actionPrevented()) return
        let nextCellCtrl;
        if (action == null) nextCellCtrl = null;
        if (action) {
            const rowCtrl = $scope.currentRow;
            const rowIdx = $scope.$tableEditorCtrl.$rows.indexOf(rowCtrl);
            const cellCtrl = $scope.currentCell;
            let cellIdx = rowCtrl.$cells.indexOf(cellCtrl);

            if (action == '--' || action == '++') { // Use of tab and shift-tab.
                let nextCellIdx = cellIdx;
                eval('nextCellIdx' + action);
                const ensureMatch = false;
                const tryGet = rowCtrl.$$getNextCell(nextCellIdx, ensureMatch);
                if (tryGet) {
                    nextCellCtrl = tryGet;
                } else {
                    // Must be shift-tab at first editable cell or tab at last editable cell. Fwd to second part of this function.
                    action = (action == '--' ? 'up' : 'down')
                    cellIdx = (cellIdx > 0 ? cellIdx = 0 : cellIdx = rowCtrl.$cells.length - 1)
                }
            }
            if (action == 'up' || action == 'down') { // Moving up or down by arrow up or down;
                action = (action == 'up' ? '--' : "++");
                let nextRowIdx = rowIdx;
                eval('nextRowIdx' + action);
                if ($scope.$tableEditorCtrl.$rows.length - 1 < nextRowIdx || nextRowIdx < 0) {
                    nextCellCtrl = null;
                } else {
                    const ensureMatch = true
                    nextCellCtrl = $scope.$tableEditorCtrl.$rows[nextRowIdx].$$getNextCell(cellIdx, ensureMatch)
                }
            }
        }
        executeFor(nextCellCtrl);
    }


    _executeFor($timeout, $scope, tableEditor, nextCellCtrl) {
        let toRowData = null,
            fromRowData = null;
        // Getting out of editor mode
        if (nextCellCtrl == null) {
            $scope.currentRow.$$cellify();
            const args = {
                previous: $scope.currentRow.$$teRowContext,
                next: null
            }
            $scope.teRowChange({ args: args })
            tableEditor.currentRowContext = null;
            $scope.currentRow = null;
            $scope.currentCell = null;
            return
        }


        // Check if there was a click on an already active cell.
        if ($scope.currentCell && nextCellCtrl == $scope.currentCell) return
        const prevCell = $scope.currentCell;
        $scope.currentCell = nextCellCtrl;

        // Cellify current row (if there was one) and inputify next one
        const nextRowCtrl = nextCellCtrl.$$getTeRowCtrl();
        if (!$scope.currentRow) {
            nextRowCtrl.$$inputify()
            $scope.currentRow = nextRowCtrl;
        } else if ($scope.currentRow !== nextRowCtrl) {
            $scope.currentRow.$$cellify();
            nextRowCtrl.$$inputify();
            const args = {
                previous: $scope.currentRow.$$teRowContext,
                next: nextRowCtrl.$$teRowContext
            }
            $scope.teRowChange({ args: args })
            $scope.currentRow = nextRowCtrl;
        }
        $timeout().then(() => {
            $scope.currentCell.$$markActive()
        })
        tableEditor.currentRowContext = $scope.currentRow.$$teRowContext

    }

    _associatedAction(event) {
        let keyCodeMapper = { 38: 'up', 40: 'down', 9: true, '13': null, 27: null }
        if (!keyCodeMapper.hasOwnProperty(event.which)) return false;

        event.preventDefault();
        if (event.which == 9) {
            if (event.shiftKey) return '--';
            return '++';
        } else {
            return keyCodeMapper[event.which];
        }
    }

    _getScope(cell) {
        return angular.element(cell).isolateScope();
    }

}




/* harmony default export */ __webpack_exports__["a"] = (tableEditorDirective);


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


function TableEditorProvider() {


    class TableEditor {

        static get
 registry() {
            return TableEditorRegistry;
        }

        constructor(_config, name) {
            for (let key in _config) {
                this[key] = _config[key];
            }
            this._actionPrevented = false
            this.hooks = {};
            this.name = name
        }

        actionPrevented() {
            if (this._actionPrevented) {
                this._actionPrevented = false
                return true
            }
            return false
        }

        preventAction() {
            this._actionPrevented = true;
        }

    };

    class TableEditorRegistry {

        static get defaultConfig() {
            const defaultConfig = {
                inputTemplate: `<input te-cell-input ng-model="teCell"  type='text' ng-change='read()' class='form-control'></input>`,
                onLink: function onLinkDefault(initialElement) {
                    return {}
                },
                toInputStyle: function toInputStyleDefault(onLinkData, liveElement, inputTemplate) {
                    const height = liveElement.height()
                    const borderHeight = parseInt(liveElement.css('border-top-width').replace('px', "")) + parseInt(liveElement.css('border-bottom-width').replace('px', ""))
                    const width = liveElement.width()
                    const position = liveElement.position()
                    liveElement.height(height);
                    liveElement.width(width);
                    inputTemplate.width(width - borderHeight);
                    inputTemplate.height(height);
                    inputTemplate.css('top', position.top + 4 * borderHeight)
                    inputTemplate.css('left', position.left - 1.0)

                },
                toCellStyle: function toCellStyleDefault(onLinkData, liveElement) {},
                viewValueFormatter: {
                    "date": val => {
                        if (val) return val.toLocaleDateString();
                    },
                    "teCatcomplete": obj => obj.label
                },
                broadcastingMode: false

            };
            return defaultConfig;
        }

        static registerTableEditor(name) {
            TableEditorRegistry.configs[name] = new TableEditor(TableEditorRegistry.defaultConfig, name);
            return TableEditorRegistry.configs[name]
        }

        static rollback(label) {
            this.configs.unnamed[label] = this.unnamedConfigRollback[label]
        }

        static $get(name, soft) {

            if ( (name == undefined || name == "") && soft == undefined && Object.keys(TableEditorRegistry.configs).length == 1) {
                return TableEditorRegistry.configs.unnamed
            } else {
                if (!name) {
                    if (soft) {
                        return false
                    }
                    throw Error('Argument "name" cannot be undefined, because multiple table-editor directives have been registered. You must now specify which API you want to access.');
                } else if (!TableEditorRegistry.configs.hasOwnProperty(name)) {
                    if (soft) {
                        return false
                    }
                    throw Error('Unknown table-editor"' + name + '"');
                } else {
                    return TableEditorRegistry.configs[name];
                }
            }
        }
    };

    TableEditorRegistry.$get.registerTableEditor =  TableEditorRegistry.registerTableEditor

    TableEditorRegistry.configs = {
        unnamed: TableEditorRegistry.defaultConfig,
    }

    TableEditorRegistry.unnamedConfigRollback = {
        "inputTemplate": null,
        "toInputStyle": null,
        "toCellStyle": null,
        "onLink": null,
        "viewValueFormatter": null,
        "broadcastingMode": null,
    }



    function forTable(label, config, tableIdentifier) {
        if (!TableEditorRegistry.configs.hasOwnProperty(tableIdentifier)) {
            TableEditorRegistry[tableIdentifier] = TableEditorRegistry.defaultConfig;
        }
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs[tableIdentifier][label] = config
    }

    this.setInputTemplate = function(templateString) {
        const label = "inputTemplate";
        const config = templateString
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) };

    }
    this.setToInputStyle = function(fn, executeDefault) {
        const label = "toInputStyle";
        let config;
        if (executeDefault) {
            config = function(onLinkData, liveElement, inputTemplate) {
                onLinkData = onLinkData || null;
                TableEditorRegistry.defaultConfig.toInputStyleDefault(onLinkData, liveElement, inputTemplate, onLinkData);
                fn(onLinkData, liveElement, inputTemplate, onLinkData);
            }
        } else {
            config = fn
        }
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) };

    };
    this.setToCellStyle = function(fn, executeDefault) {
        const label = "toCellStyle";
        let config;
        if (executeDefault) {
            config = function(onLinkData, liveElement, inputTemplate) {
                onLinkData = onLinkData || null;
                TableEditorRegistry.defaultConfig.toCellStyleDefault(onLinkData, liveElement, inputTemplate, onLinkData);
                fn(onLinkData, liveElement, inputTemplate, onLinkData);
            }
        } else {
            config = fn;
        }
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) };

    };
    this.setOnLink = function(fn, executeDefault) {
        const label = "onLink";
        let config;

        if (executeDefault) {
            config = function(element) {
                const onLinkData = TableEditorRegistry.defaultConfig.onLink(element);
                return fn(element, onLinkData)
            }
        } else {
            config = fn;
        }


        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) };

    };
    this.setViewValueFormatter = function(viewValueFormatter) {
        const label = "viewValueFormatter"
        const config = Object.assign(TableEditorRegistry.defaultConfig.viewValueFormatter, viewValueFormatter);
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) }
    }
    this.setBroadcastingMode = function(mode) {
        const label = "broadcastingMode";
        const config = !!mode;
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) };
    }

    this.$get = function() {
        for (let name in TableEditorRegistry.configs) {
            TableEditorRegistry.configs[name] = new TableEditor(TableEditorRegistry.configs[name], name)
        }
        return TableEditorRegistry.$get;
    }

}


/* harmony default export */ __webpack_exports__["a"] = (TableEditorProvider);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__te_catcomplete_directive__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__te_catcomplete_scss__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__te_catcomplete_scss___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__te_catcomplete_scss__);



/* harmony default export */ __webpack_exports__["a"] = (angular.module('mrei.ngTableEditor.catcomplete', [])
    .directive('teCatcomplete', __WEBPACK_IMPORTED_MODULE_0__te_catcomplete_directive__["a" /* default */])
    .name);


/***/ }),
/* 5 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__table_editor_directive__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__table_editor_provider__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__table_editor_row_directive__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__table_editor_cell_directive__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__te_catcomplete_te_catcomplete_module__ = __webpack_require__(4);









/* harmony default export */ __webpack_exports__["default"] = (angular
    .module('ngTableEditor', [
      __WEBPACK_IMPORTED_MODULE_4__te_catcomplete_te_catcomplete_module__["a" /* default */]
    ])
    .provider('tableEditor', __WEBPACK_IMPORTED_MODULE_1__table_editor_provider__["a" /* default */])
    .directive('tableEditor', __WEBPACK_IMPORTED_MODULE_0__table_editor_directive__["a" /* default */])
    .directive('teRow', __WEBPACK_IMPORTED_MODULE_2__table_editor_row_directive__["a" /* default */])
    .directive('teCell', __WEBPACK_IMPORTED_MODULE_3__table_editor_cell_directive__["a" /* default */])
    .name);


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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

/* harmony default export */ __webpack_exports__["a"] = (teCatcompleteDirective);


/***/ })
/******/ ]);
});