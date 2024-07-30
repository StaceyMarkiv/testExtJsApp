Ext.define("app.view.cities.citiesView", {
    extend: "Ext.grid.Panel",
    alias: "widget.citiesView",
    header: false,
    controller: "citiesController",

    width: '100%',
    height: '100%',
    columnLines: true,
    selType: "cellmodel",
    store: citiesStore,

    plugins: [{
        ptype: "cellediting",
        clicksToEdit: 1,
        pluginId: "cellplugin",
        listeners: {
            validateedit: 'onCitiesValidateEdit'
        },
    }],

    listeners: {
        afterrender: 'onCitiesAfterrender'
    },

    columns: [{
        xtype: "rownumberer",
    }, {
        xtype: 'actioncolumn',
        width: 25,
        menuDisabled: true,
        menuText: 'Удаление',
        items: [{
            icon: '../resources/images/delete.gif',
            tooltip: 'Удалить запись',
            handler: 'deleteCity'
        }]
    }, {
        text: "ID",
        dataIndex: "id_city",
        align: "center",
        hidden: true,
        width: 60,
    }, {
        text: "Города",
        dataIndex: "city_name",
        align: "center",
        flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: false,
        }
    }],

    dockedItems: [{
        xtype: "toolbar",
        dock: "bottom",
        ui: "footer",
        layout: {
            pack: "left",
        },

        items: [{
            xtype: 'button',
            text: 'Добавить',
            tooltip: 'Добавить новый город',
            width: 160,
            handler: 'addNewCity'
        }]
    }]
});