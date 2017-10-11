function TableEditorProvider() {


    class TableEditor {

        static get registry() {
            return TableEditorRegistry;
        }

        constructor(_config, name) {
            for (let key in _config) {
                this[key] = _config[key];
            }
            this._actionPrevented = false
            // this.hooks = {};
            this.name = name
        }

        actionPrevented() {
            if (this._actionPrevented) {
                this._actionPrevented = false
                return true
            }
            return false
        }

        preventAction() {
            this._actionPrevented = true;
        }

    };

    class TableEditorRegistry {

        static get defaultConfig() {
            const defaultConfig = {
                inputTemplate: `<input te-cell-input ng-model="teCell"  type='text' ng-change='read()' class='form-control'></input>`,
                onLink: function onLinkDefault(initialElement) {
                    return {}
                },
                toInputStyle: function toInputStyleDefault(onLinkData, liveElement, inputTemplate) {
                    const height = liveElement.height()
                    const borderHeight = parseInt(liveElement.css('border-top-width').replace('px', "")) + parseInt(liveElement.css('border-bottom-width').replace('px', ""))
                    const width = liveElement.width()
                    const position = liveElement.position()
                    liveElement.height(height);
                    liveElement.width(width);
                    inputTemplate.width(width - borderHeight);
                    inputTemplate.height(height);
                    inputTemplate.css('top', position.top + 4 * borderHeight)
                    inputTemplate.css('left', position.left - 1.0)

                },
                toCellStyle: function toCellStyleDefault(onLinkData, liveElement) {},
                viewValueFormatter: {
                    "date": val => {
                        if (val) return val.toLocaleDateString();
                    },
                    "teCatcomplete": obj => obj.label
                },
                broadcastingMode: false,
                hooks: {}

            };
            return defaultConfig;
        }

        static registerTableEditor(name) {
            TableEditorRegistry.configs[name] = new TableEditor(TableEditorRegistry.defaultConfig, name);
            return TableEditorRegistry.configs[name]
        }

        static rollback(label) {
            this.configs.unnamed[label] = this.unnamedConfigRollback[label]
        }

        static $get(name, soft) {

            if ((name == undefined || name == "") && soft == undefined && Object.keys(TableEditorRegistry.configs).length == 1) {
                return TableEditorRegistry.configs.unnamed
            } else {
                if (!name) {
                    if (soft) {
                        return false
                    }
                    throw Error('Argument "name" cannot be undefined, because multiple table-editor directives have been registered. You must now specify which API you want to access.');
                } else if (!TableEditorRegistry.configs.hasOwnProperty(name)) {
                    if (soft) {
                        return false
                    }
                    throw Error('Unknown table-editor"' + name + '"');
                } else {
                    return TableEditorRegistry.configs[name];
                }
            }
        }
    };

    TableEditorRegistry.$get.registerTableEditor = TableEditorRegistry.registerTableEditor

    TableEditorRegistry.configs = {
        unnamed: TableEditorRegistry.defaultConfig,
    }

    TableEditorRegistry.unnamedConfigRollback = {
        "inputTemplate": null,
        "toInputStyle": null,
        "toCellStyle": null,
        "onLink": null,
        "viewValueFormatter": null,
        "broadcastingMode": null,
        "hooks": {}
    }



    function forTable(label, config, tableIdentifier) {
        if (!TableEditorRegistry.configs.hasOwnProperty(tableIdentifier)) {
            TableEditorRegistry[tableIdentifier] = TableEditorRegistry.defaultConfig;
        }
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs[tableIdentifier][label] = config
    }

    this.setHooks = function(hooks) {
        const label = "hooks"
        const config = Object.assign(TableEditorRegistry.defaultConfig.hooks, hooks);
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) }
    }

    this.setInputTemplate = function(templateString) {
        const label = "inputTemplate";
        const config = templateString
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) };

    }
    this.setToInputStyle = function(fn, executeDefault) {
        const label = "toInputStyle";
        let config;
        if (executeDefault) {
            config = function(onLinkData, liveElement, inputTemplate) {
                onLinkData = onLinkData || null;
                TableEditorRegistry.defaultConfig.toInputStyleDefault(onLinkData, liveElement, inputTemplate, onLinkData);
                fn(onLinkData, liveElement, inputTemplate, onLinkData);
            }
        } else {
            config = fn
        }
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) };

    };
    this.setToCellStyle = function(fn, executeDefault) {
        const label = "toCellStyle";
        let config;
        if (executeDefault) {
            config = function(onLinkData, liveElement, inputTemplate) {
                onLinkData = onLinkData || null;
                TableEditorRegistry.defaultConfig.toCellStyleDefault(onLinkData, liveElement, inputTemplate, onLinkData);
                fn(onLinkData, liveElement, inputTemplate, onLinkData);
            }
        } else {
            config = fn;
        }
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) };

    };
    this.setOnLink = function(fn, executeDefault) {
        const label = "onLink";
        let config;

        if (executeDefault) {
            config = function(element) {
                const onLinkData = TableEditorRegistry.defaultConfig.onLink(element);
                return fn(element, onLinkData)
            }
        } else {
            config = fn;
        }


        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) };

    };
    this.setViewValueFormatter = function(viewValueFormatter) {
        const label = "viewValueFormatter"
        const config = Object.assign(TableEditorRegistry.defaultConfig.viewValueFormatter, viewValueFormatter);
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) }
    }
    this.setBroadcastingMode = function(mode) {
        const label = "broadcastingMode";
        const config = !!mode;
        TableEditorRegistry.rollback(label)
        TableEditorRegistry.configs.unnamed[label] = config;
        return { forTable: forTable.bind(this, label, config) };
    }

    this.$get = function() {
        for (let name in TableEditorRegistry.configs) {
            TableEditorRegistry.configs[name] = new TableEditor(TableEditorRegistry.configs[name], name)
        }
        return TableEditorRegistry.$get;
    }

}


export default TableEditorProvider