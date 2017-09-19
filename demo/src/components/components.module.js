import apiDocumentation from './api-documentation/api-documentation.module';
import basic from './basic/basic.module';
import manyRecords from './many-records/many-records.module';
import validations from './validations/validations.module';
import advanced from './advanced/advanced.module';
import nonTrivial from './non-trivial/non-trivial.module';
import customization from './customization/customization.module';



export default angular.module('demo.components', [
        apiDocumentation,
        basic,
		manyRecords,
        validations,
        advanced,
        nonTrivial,
        customization
    ])
    .name
