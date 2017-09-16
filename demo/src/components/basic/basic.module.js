import angular from 'angular'
import uiRouter from '@uirouter/angularjs';
import basicComponent from './basic.component';
import tableData from '../../data.js'


export default angular
    .module('te.basic', [
        uiRouter
    ])
    .component('basic', basicComponent)
    .config(($stateProvider) => {
        $stateProvider
            .state('demo.basic', {
                views: {
                    '@demo': {
                        template: '<basic data="$resolve.data"></basic>'
                    }
                },
                resolve: {
                    data: ($q) => $q.when(tableData)
                },
                url: 'basic',
            })
    })
    .name



