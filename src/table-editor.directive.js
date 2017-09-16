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




export default tableEditorDirective
