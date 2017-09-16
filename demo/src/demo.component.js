const templateUrl = require('ngtemplate-loader!html-loader!./demo.html');
import tableData from './data'
import './demo.scss'

const demoComponent = {
    templateUrl: templateUrl,
    controller: class {
    	constructor(){
    		this.tableData = tableData
    	}
    }
}



export default demoComponent;
