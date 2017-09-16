import angular from 'angular'
import uiRouter from '@uirouter/angularjs';
import apiDocumentationComponent from './api-documentation.component';


export default angular
    .module('te.api-documentation', [
        uiRouter
    ])
    .component('apiDocumentation', apiDocumentationComponent)
    .config(($stateProvider) => {
        $stateProvider
            .state('demo.api-documentation', {
                views: {
                    '@demo': 'apiDocumentation'
                },
                url: 'api-documentation',

            })
    })
    .name



