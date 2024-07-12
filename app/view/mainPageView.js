Ext.define("app.view.mainPageView", {
    extend: "Ext.grid.Panel",
    alias: "widget.mainPageView",
    title: "Данные пользователей",
    controller: "mainPageController",

    requires: [
        'app.components.selectAllButton',
        'app.components.userPicker',
    ],

    columnLines: true,
    width: "100%",
    height: "100%",
    store: mainPageStore,
    selType: "cellmodel",

    plugins: [
        'gridfilters',
        {
            ptype: "cellediting",
            clicksToEdit: 1,
            pluginId: "cellplugin",
            listeners: {
                validateedit: 'onValidateEdit'
            },
        }
    ],

    columns: [{
        xtype: "rownumberer",
    }, {
        xtype:'actioncolumn',
        width:25,
        menuDisabled: true,
        menuText: 'Удаление записей',
        items: [{
            icon: '../../resources/images/delete.gif',
            tooltip: 'Удалить запись',
            handler: 'deleteUser'
        }]
    }, {
        text: "ID",
        dataIndex: "id_user",
        align: "center",
        hidden: true,
        flex: 1,
    }, {
        text: "Пользователь",
        dataIndex: "user",
        align: "center",
        flex: 1,
        editor: {
            xtype: 'change-name-picker',
        },
        filter: {
            type: 'list',
        }
    }, {
        text: "Образование",
        dataIndex: "grade",
        align: "center",
        flex: 1,
        editor: new Ext.form.field.ComboBox({
            typeAhead: true,
            triggerAction: 'all',
            store: comboStoreEducation,
            allowBlank: false,
            anyMatch: true,
            listConfig: {
                minWidth: 250,
                resizable: true
            }
        }),
        filter: {
            type: 'list',
        }
    }, {
        text: "Город",
        dataIndex: "city",
        align: "center",
        flex: 1,
        filter: {
            type: 'list',
        }
    }],

    dockedItems: [{
        xtype: "toolbar",
        dock: "bottom",
        ui: "footer",
        layout: {
            pack: "center",
        },

        items: [{
            xtype: "button",
            width: 160,
            text: "Фильтры",
            id: "filterButton",
            menu: {
                width: 160,
                items: [{
                    text: 'Пользователи',
                    itemId: 'userFilter',
                    menu: {
                        items: [{
                            xtype: 'checkboxgroup',
                            itemId: 'userCheckboxgroup',
                            hideEmptyLabel: true,
                            columns: 1,
                            width: 200,
                            items: [],
                            listeners: {
                                change: 'userFilterChange'
                            }
                        }, {
                            xtype: 'select-all-button',
                        }],

                        listeners: {
                            beforerender: function () {
                                console.log('beforerender');
                            }
                        }
                    }
                }, {
                    text: 'Образование',
                    itemId: 'gradeFilter',
                    menu: {
                        items: [{
                            xtype: 'checkboxgroup',
                            itemId: 'gradeCheckboxgroup',
                            hideEmptyLabel: true,
                            columns: 1,
                            width: 250,
                            items: [],
                            listeners: {
                                change: 'gradeFilterChange'
                            }
                        }, {
                            xtype: 'select-all-button',
                        }]
                    }
                }, {
                    text: 'Город',
                    itemId: 'cityFilter',
                    menu: {
                        items: [{
                            xtype: 'checkboxgroup',
                            itemId: 'cityCheckboxgroup',
                            hideEmptyLabel: true,
                            columns: 1,
                            width: 150,
                            items: [],
                            listeners: {
                                change: 'cityFilterChange'
                            }
                        }, {
                            xtype: 'select-all-button',
                        }]
                    }
                }, {
                    xtype: 'menuseparator'
                }, {
                    text: 'Очистить фильтры',
                    handler: 'clearFiltersClick'
                }]
            }
        }],
    }],
});
