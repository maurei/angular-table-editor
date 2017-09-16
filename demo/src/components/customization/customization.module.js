import angular from 'angular'
import uiRouter from '@uirouter/angularjs';
import customizationComponent from './customization.component';
import tableData from '../../data.js'


export default angular
    .module('demo.customization', [
        uiRouter
    ])
    .component('customization', customizationComponent)
    .config(($stateProvider) => {
        $stateProvider
            .state('demo.customization', {
                views: {
                    '@demo': {
                        template: '<customization data="$resolve.data"></customization>'
                    }
                },
                resolve: {
                    data: ($q) => $q.when(tableData)
                },
                url: 'customization',
            })
    })
    .name



