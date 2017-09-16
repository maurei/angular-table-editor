import angular from 'angular'
import uiRouter from '@uirouter/angularjs';
import nonTrivialComponent from './non-trivial.component';
import tableData from '../../data.js'


export default angular
    .module('demo.non-trivial', [
        uiRouter
    ])
    .component('nonTrivial', nonTrivialComponent)
    .config(($stateProvider) => {
        $stateProvider
            .state('demo.non-trivial', {
                views: {
                    '@demo': {
                        template: '<non-trivial data="$resolve.data"></non-trivial>'
                    }
                },
                resolve: {
                    data: ($q) => $q.when(tableData)
                },
                url: 'nonTrivial',

            })
    })
    .name



