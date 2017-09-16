import angular from 'angular'
import uiRouter from '@uirouter/angularjs';
import hljs from 'angular-highlightjs'
import ngTableEditor from '../../lib/angular-table-editor.js'
import ngMessages from 'angular-messages';



import demoComponent from './demo.component';
import components from './components/components.module'


export default angular
    .module('demo', [
        uiRouter,
        ngTableEditor,
        components,
        hljs
    ])
    .component('demo', demoComponent)
    .config(($stateProvider) => {
        $stateProvider
            .state('demo', {
                views: {
                    '@': 'demo'
                },
                url: '/',

            })
    })
    .config( ($urlRouterProvider) => $urlRouterProvider.otherwise('/') )


.name



