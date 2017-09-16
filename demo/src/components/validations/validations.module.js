import angular from 'angular'
import uiRouter from '@uirouter/angularjs';
import validationsComponent from './validations.component';
import tableData from '../../data.js'


export default angular
    .module('demo.validations', [
        uiRouter
    ])
    .component('validations', validationsComponent)
    .config(($stateProvider) => {
        $stateProvider
            .state('demo.validations', {
                views: {
                    '@demo': {
                        template: '<validations data="$resolve.data"></validations>'
                    }
                },
                resolve: {
                    data: ($q) => $q.when(tableData)
                },
                url: 'validations',

            })
    })
    .name



