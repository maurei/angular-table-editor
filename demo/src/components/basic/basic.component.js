const templateUrl = require('ngtemplate-loader!html-loader!./basic.html');
import './basic.scss'

const basicComponent = {
    bindings: {
        data: '<',
    },
    templateUrl: templateUrl,
    controller: class {

        constructor($scope) {
            this.mode = {
                example1: 'example',
                example2: 'example',
                example3: 'example'
            }
            this.rowChange = {}
        }

        rowChangeHandler(args) {
            // console.info('rowChangeHandler fired')
            // console.info(args)
        }

        $onInit() {
            this.thirdExample = angular.copy(this.data)
            this.secondExample = angular.copy(this.data).map(row => {
                row.birthday = new Date(row.birthday)
                return row
            })
        }

        randomNumber(){
            // return Math.random();
        }
    }
}



export default basicComponent;
