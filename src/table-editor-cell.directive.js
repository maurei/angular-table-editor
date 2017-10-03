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
        $$read($scope.$$childHead)
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

export default teCellDirective
