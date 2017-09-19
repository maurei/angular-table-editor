const templateUrl = require('ngtemplate-loader!html-loader!./many-records.html');
import './many-records.scss'

const manyRecordsComponent = {
    bindings: {
        data: '<',
    },
    templateUrl: templateUrl,
    controller: class {

        constructor($scope) {}

        // rowChangeHandler(args) {
        //     console.info('rowChangeHandler fired')
        //     console.info(args)
        // }

        // $onInit() {
        //     this.thirdExample = angular.copy(this.data)
        //     this.secondExample = angular.copy(this.data).map(row => {
        //         row.birthday = new Date(row.birthday)
        //         return row
        //     })
        // }

        // randomNumber(){
        //     return Math.random();
        // }
    }
}



export default manyRecordsComponent;
