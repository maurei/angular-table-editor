import angular from 'angular'
import uiRouter from '@uirouter/angularjs';
import advancedComponent from './advanced.component';
import tableData from '../../data.js'


export default angular
    .module('demo.advanced', [
        uiRouter
    ])
    .component('advanced', advancedComponent)
    .config(($stateProvider) => {
        $stateProvider
            .state('demo.advanced', {
                views: {
                    '@demo': {
                        template: '<advanced data="$resolve.data"></advanced>'
                    }
                },
                resolve: {
                    data: ($q) => $q.when(tableData)
                },
                url: 'advanced',

            })
    })
    .name



