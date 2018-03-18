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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
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
        this._tableEditor = tableEditor
        this._$compile = $compile
        this._$timeout = $timeout
    }

    link($scope, element, attributes, controllersArr) {
        const ngModel = controllersArr[1];
        const teRowController = controllersArr[0];
        let tableEditor = this._tableEditor;

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
                    ngModel.$parsers.push(val => {
                        return $scope.$$childHead.teCell
                        // nicely hijacking the parsers pipeline again :) (see my stackoverflow answer)
                    })
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
            if (!tableEditor.constructor.catCompleteLoaded) throw Error("The optional ngTableEditor.catcomplete module must be loaded in order to use the te-catcomplete directive.")
            ngModel.$parsers.push(val => {
                return $scope.$$childHead.teCell  // hijacking $parpers pipeline, see my answer to this SO question: https://stackoverflow.com/questions/35309114/set-model-value-programmatically-in-angular-js/44071623#44071623
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
        const $ctrl = $scope.$ctrl;

        teRowController.$$registerCellToggle($ctrl)
        $scope.$$teCellSearchUnregisterFn = $scope.$on('$teCellSearch', function(event, targetElement, callbackFn){
            if (element.get(0) == targetElement) callbackFn($ctrl);
        })


        $ctrl.ngModel = ngModel;
        $ctrl.$active = false;
        $ctrl.$validate = (inputElementScope) => this._validate($scope, attributes, ngModel, teRowController, inputElementScope);
        $ctrl.$$markActive = function() {
            element.find('input').focus();
            $ctrl.$active = true;
            teRowController.$$markActiveCell(this);
        }
        $ctrl.$$unmarkActive = () => {
            $ctrl.$active = false;
        }

        $ctrl.$$getTeRowCtrl = () => teRowController
        $ctrl.$$tableEditor = tableEditor;
        $ctrl.$$onLinkData = tableEditor.onLink(element);
        $ctrl.$$addAttrsTo = (element) => this._addAttrsTo($scope, element)
        $ctrl.$$read = (inputElementScope, init) => this._read($scope, attributes, ngModel, viewValueFormatter, teRowController, $ctrl.$validate, inputElementScope, init)
        $ctrl.$$cellify = () => this._cellify($scope, ngModel, element, $ctrl.$$read);
        $ctrl.$$inputify = () => this._inputify($scope, ngModel, element, $ctrl.$$read);
        $ctrl.$$dispose = () => this._dispose($scope, element, attributes, teRowController, $ctrl.$$cellify, $ctrl.$validate)
        $ctrl.$$instantiate = () => this._instantiate($scope, element, teRowController)


        // At this point, everything that is minimally needed is loaded. We can now abort if we wish to disable editor mode for this cell.
        // We must also save the instantiate logic in case editor mode for this cell is activated again.
        if (attributes.teCellActive && !$scope.teCellActive()) {
            $ctrl.$$dispose();
        }


        function teCellActiveWatcher(){
            return $scope.teCellActive()
        }
        function teCellActiveHandler(newVal, oldVal){
            if (newVal == false && oldVal != newVal ){

                $ctrl.$$dispose();
            }
            if (newVal == true && oldVal != newVal ){
                $ctrl.$$instantiate();
            }
        }

        $scope.$watch(teCellActiveWatcher, teCellActiveHandler );
        $scope.$on('$destroy', () => {
            $scope.$$teCellSearchUnregisterFn()
        })
        
    }


    controller($scope) {
        this.$reset = () => {
            if ($scope.$$childTail.$id != $scope.$$childHead.$id) throw 'Childtail != Headtail Error';
            $scope.$$childTail.teCell = '';
        }
    }

    _instantiate($scope, element, teRowController) {
        const $ctrl = $scope.$ctrl;
        const $$inputify = $ctrl.$$inputify;

        teRowController.$$registerCellToggle($ctrl)
        $scope.$$teCellSearchUnregisterFn = $scope.$on('$teCellSearch', function(event, targetElement, callbackFn){
            if (element.get(0) == targetElement) callbackFn($ctrl);
        })
        if ($scope.teCellValidate === false) $scope.teCellValidate = true
        if (teRowController.$active) $$inputify();

    }


    _dispose($scope, element, attributes, teRowController) {
        const $ctrl = $scope.$ctrl;
        const $$cellify = $ctrl.$$cellify;

        teRowController.$$registerCellToggle($ctrl)
        if ($scope.$$teCellSearchUnregisterFn) $scope.$$teCellSearchUnregisterFn();
        if ($ctrl.$$inputInitialized == true){
            // if there were any errors before removing a cell, these should be ignored. But only if validation was activated in the first place.
            teRowController.$$removeErrors(attributes.name)
            if ($scope.teCellValidate === true) $scope.teCellValidate = false
            $$cellify();
        }
    }

    _addAttrsTo($scope, element) {
        $scope.$ctrl.$$inputInitialized = true;
        for (let key in $scope.inputAttributes) {
            let attr;
            if (element.attr(key) && !$scope.$ctrl.$$inputInitialized) {
                attr = element.attr(key) + ' ' + $scope.inputAttributes[key]
            } else {
                attr = $scope.inputAttributes[key];
            }
            element.attr(key, attr);
        }
    }


    // Forms bridge between ngModel on the HTMLInputElement and the one within this directive. inputElementScope is refering to the $scope of the HTMLInputElement, ngModel is the controller living in this directive level
    _read($scope, attributes, ngModel, viewValueFormatter, teRowController, $validate, inputElementScope, init) {
        if (init != true) {
            if (inputElementScope.teCatcomplete) {
                if (inputElementScope.teCell != undefined) ngModel.$setViewValue(inputElementScope.teCell.label);
            } else if (viewValueFormatter) {
                const res = viewValueFormatter(inputElementScope.teCell);
                ngModel.$setViewValue(res);
                if (res) {
                    delete ngModel.$error.parse;
                } else {
                    ngModel.$error.parse = true;
                }
            } else {
                ngModel.$setViewValue(inputElementScope.teCell)
            }
        }
        const key = attributes.name || $scope.$id;
        teRowController.$$setDirty(key, ngModel.$dirty);
        if ($scope.teCellValidate && init != true) $validate(inputElementScope);
    }

    _validate($scope, attributes, ngModel, teRowController, inputElementScope) {
        if (Object.keys(ngModel.$validators).length || Object.keys(ngModel.$error).length) {
            const key = attributes.name || $scope.$id;
            teRowController.$$setError(key, ngModel.$error);
        }
        $scope.$valid = ngModel.$valid;
        if(inputElementScope) inputElementScope.$valid = ngModel.$valid;
    }

    // $scope.$$childHead is the underlying inputElementScope
    _cellify($scope, ngModel, element, $$read) {
        const $$tableEditor = $scope.$ctrl.$$tableEditor;
        const $$onLinkData = $scope.$ctrl.$$onLinkData

        $scope.$ctrl.$$inputInitialized = false;
        $scope.$ctrl.$active = false;
        //if ($scope.$$childHead.teCell && $scope.$$childHead.teCell.dummy === null) debugger;
        $$read($scope.$$childHead) // this is triggering $destroy when allowEmpty case is triggered (when teCatComplete)
        $scope.$$childHead.$destroy();
        element.empty();
        ngModel.$render()
        $$tableEditor.toCellStyle($$onLinkData, element)
        
    }


    _inputify($scope, ngModel, element, $$read) {
        const $$tableEditor = $scope.$ctrl.$$tableEditor;
        const $ctrl = $scope.$ctrl;
        $ctrl.$active = true;
        const inputElementScope = $scope.$new(true);
        inputElementScope.teCell = ngModel.$modelValue;
        // inputElementScope.active = true
        inputElementScope.$valid = $scope.$valid
        inputElementScope.read = () => {inputElementScope.$evalAsync( () => { $$read(inputElementScope) })}
        const template = angular.element($$tableEditor.inputTemplate)
        if ($scope.teCatcomplete) template.attr('te-catcomplete', 'teCatcomplete');
        inputElementScope.teCatcomplete = $scope.teCatcomplete;

        $$tableEditor.toInputStyle($scope.$ctrl.$$onLinkData, element, template)
        $ctrl.$$addAttrsTo(template);
        const compiledHtml = this._$compile(template)(inputElementScope);

        this._$timeout().then(() => {
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
        this.scope = { teRow: '<', teRowContext: '&?' };
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
            context = $scope.teRowContext();
            if (typeof(context) != 'object') throw new Error('teRowContext must have an object or array bound to it, got a ' + typeof(context) + ' instead.')
            if (context.row) context.row.$teRowCtrl = $scope.$teRowCtrl;
            context.$teRowCtrl = $scope.$teRowCtrl;
        }

        $scope.$teRowCtrl.$trigger = () => {
            $tableEditorCtrl.$$trigger($scope.$teRowCtrl)
        }
        $scope.$teRowCtrl.$$teRowContext = context || {$teRowCtrl: $scope.$teRowCtrl }
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



    constructor(tableEditor, $rootScope, $timeout, $injector ) {
        $(window).on('click', () => $rootScope.$broadcast('teClick'))
        this.restrict = "A";
        this.scope = { teRowChange: '&' };
        this.controllerAs = '$tableEditorCtrl'
        this.link = this.link.bind(this, tableEditor, $rootScope, $timeout)
        tableEditor.setCatCompleteLoadedState($injector.modules['mrei.ngTableEditor.catcomplete'] ? true : false)
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
            if (!tableEditor.inTable && $scope.currentCell) executeFor(null, {keyCode: 'teClick'});
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
            if ($(event.target).is('input')) { keyboardControl(action, event) }
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
            keyboardControl(action, args.event)
        }
    }

    _restoreFocus($scope) {
        $scope.currentCell.$$markActive();
    }

    _move(keyboardControl, moveMapper, cmd, event = null) {
        if (typeof(cmd) == 'string') {
            cmd = moveMapper[cmd];
            if (!cmd) return;
        }
        keyboardControl(cmd, event)
    }

    _keyboardControl($scope, executeFor, tableEditor, action, event) {
        if (action == false) return
        if (tableEditor.actionPrevented()) return
        let nextCellCtrl;
        if (action == null) nextCellCtrl = false;
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
                while (nextCellCtrl === undefined){ // Looping to prevent getting stuck on fully disabled but registered targetrows
                    eval('nextRowIdx' + action);
                    if ($scope.$tableEditorCtrl.$rows.length - 1 < nextRowIdx || nextRowIdx < 0) { // border of table: exit editor mode
                        nextCellCtrl = null;
                    } else {
                        const ensureMatch = true
                        nextCellCtrl = $scope.$tableEditorCtrl.$rows[nextRowIdx].$$getNextCell(cellIdx, ensureMatch)
                    }
                }
            }
        }
        executeFor(nextCellCtrl, event);
    }


    _executeFor($timeout, $scope, tableEditor, nextCellCtrl, event = null) {
        let toRowData = null,
            fromRowData = null;
        // Getting out of editor mode
        // null is used for exit-through-border
        // false is used for exit-on-command
        if (nextCellCtrl == null || nextCellCtrl === false) {
            if (nextCellCtrl == null) {
                if (tableEditor.hooks["onTableBorderCross"] && event.keyCode == 9){
                   if (tableEditor.hooks["onTableBorderCross"]($scope.currentRow)) return;
                }
            }

            if (event && (event.keyCode == 13 || event.keyCode == 'teClick') ){
                $scope.currentRow.$$cellify();
                const args = {
                    previous: $scope.currentRow.$$teRowContext,
                    next: null
                }
                $scope.teRowChange({ args: args })
                tableEditor.currentRowContext = null;
                $scope.currentRow = null;
                $scope.currentCell = null;
            }

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
            if (prevCell) prevCell.$$unmarkActive();
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

        static get registry() {
            return TableEditorRegistry;
        }

        constructor(_config, name) {
            for (let key in _config) {
                this[key] = _config[key];
            }
            this._actionPrevented = false
            // this.hooks = {};
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
                broadcastingMode: false,
                hooks: {}

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

            if ((name == undefined || name == "") && soft == undefined && Object.keys(TableEditorRegistry.configs).length == 1) {
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

    TableEditorRegistry.$get.registerTableEditor = TableEditorRegistry.registerTableEditor
    TableEditorRegistry.$get.setCatCompleteLoadedState = (value) => TableEditor.catCompleteLoaded = value

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
        "hooks": {}
    }



    function forTable(label, config, tableIdentifier) {
        if (!TableEditorRegistry.configs.hasOwnProperty(tableIdentifier)) {
            TableEditorRegistry[tableIdentifier] = TableEditorRegistry.defaultConfig;
        }
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs[tableIdentifier][label] = config
    }

    this.setHooks = function(hooks) {
        const label = "hooks"
        const config = Object.assign(TableEditorRegistry.defaultConfig.hooks, hooks);
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) }
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
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__table_editor_directive__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__table_editor_provider__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__table_editor_row_directive__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__table_editor_cell_directive__ = __webpack_require__(0);








/* harmony default export */ __webpack_exports__["default"] = (angular
    .module('ngTableEditor', [])
    .provider('tableEditor', __WEBPACK_IMPORTED_MODULE_1__table_editor_provider__["a" /* default */])
    .directive('tableEditor', __WEBPACK_IMPORTED_MODULE_0__table_editor_directive__["a" /* default */])
    .directive('teRow', __WEBPACK_IMPORTED_MODULE_2__table_editor_row_directive__["a" /* default */])
    .directive('teCell', __WEBPACK_IMPORTED_MODULE_3__table_editor_cell_directive__["a" /* default */])
    .name);


/***/ })
/******/ ]);
});