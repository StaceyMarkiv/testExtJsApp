Ext.define("app.view.education.educationView", {
    extend: "Ext.grid.Panel",
    alias: "widget.educationView",
    header: false,
    controller: "educationController",

    width: '100%',
    height: '100%',
    columnLines: true,
    selType: "cellmodel",
    store: educationStore,

    plugins: [{
        ptype: "cellediting",
        clicksToEdit: 1,
        pluginId: "cellplugin",
        listeners: {
            validateedit: 'onEducationValidateEdit'
        },
    }],

    listeners: {
        afterrender: 'onEducationAfterrender'
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
            handler: 'deleteGrade'
        }]
    }, {
        text: "ID",
        dataIndex: "id_grade",
        align: "center",
        hidden: true,
        width: 60,
    }, {
        text: "Ступени образования",
        dataIndex: "grade",
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
            tooltip: 'Добавить новую ступень',
            width: 160,
            handler: 'addNewGrade'
        }]
    }]
});