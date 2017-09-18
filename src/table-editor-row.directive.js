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


export default teRowDirective
