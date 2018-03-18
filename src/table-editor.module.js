

import tableEditorDirective from './table-editor.directive';
import tableEditorProvider from './table-editor.provider';
import tableEditorRowDirective from './table-editor-row.directive';
import teCellDirective from './table-editor-cell.directive';


export default angular
    .module('ngTableEditor', [])
    .provider('tableEditor', tableEditorProvider)
    .directive('tableEditor', tableEditorDirective)
    .directive('teRow', tableEditorRowDirective)
    .directive('teCell', teCellDirective)
    .name
