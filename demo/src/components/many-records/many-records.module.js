import angular from 'angular'
import uiRouter from '@uirouter/angularjs';
import manyRecordsComponent from './many-records.component';
import tableData from '../../data.js'


export default angular
    .module('demo.many-records', [
        uiRouter
    ])
    .component('manyRecords', manyRecordsComponent)
    .config(($stateProvider) => {
        $stateProvider
            .state('demo.many-records', {
                views: {
                    '@demo': {
                        template: '<many-records data="$resolve.data"></many-records>'
                    }
                },
                resolve: {
                    data: ($q) => $q.when(tableData)
                },
                url: 'many-records',
            })
    })
    .name



