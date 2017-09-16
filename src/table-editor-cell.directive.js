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

export default teCellDirective
