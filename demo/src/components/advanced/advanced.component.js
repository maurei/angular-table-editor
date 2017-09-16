const templateUrl = require('ngtemplate-loader!html-loader!./advanced.html');
import './advanced.scss'

const advancedComponent = {
    bindings: { data: '<' },
    templateUrl: templateUrl,
    controller: class {

        constructor($scope) {
            this.mode = {
                example1: 'example',
                example2: 'example'
            }

        }

        $onInit() {

            const categories = ["", "Tech", "Financial"];
            class Company {
                constructor(value, label) {
                    this.value = label;
                    this.label = label;
                    this.category = categories[Math.floor(Math.random() * 3)]
                    this.constructor.list.push(this)
                }
            }
            Company.list = [];
            this.data = angular.copy(this.data).map((row, idx) => {
                row.company = new Company(idx, row.company)
                return row;
            })
            this.companyList = this.generateOptions({src: Company.list})
        }

        generateOptions(args) {
            const acOptions = {
                options: {
                    currSource: [],
                    html: true,
                    onlySelectValid: true,
                    delay: null,
                    change: args.change || undefined,
                    minLength: args.minLength || 0,
                    source: (request, response) => {
                        let source = angular.copy(args.src)
                        source = acOptions.methods.filter(source, request.term);
                        if (!source.length) {
                            source.push({
                                label: 'Not found',
                                value: null,
                                category: ''
                            });
                        }  
                        const currSource = source.slice(0, 10)
                        acOptions.options.currSource = currSource
                        response(currSource);
                    },

                },
                methods: {}
            };
            return acOptions;
        }

    }

}



export default advancedComponent;

