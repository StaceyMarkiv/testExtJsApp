Ext.define("app.view.adminPanel.adminPanelView", {
    extend: "Ext.grid.Panel",
    alias: "widget.adminPanelView",
    header: {
        title: 'Управление учетными записями',
        titlePosition: 1,
        items: [{
            xtype: "button",
            text: "<b> + </b>",
            tooltip: "Добавить новую учетную запись",
            margin: '0 10 0 0',
            width: 25,
            height: 25,
            handler: 'addNewRecord'
        }]
    },
    id: 'adminPanelId',
    controller: "adminPanelController",
    store: adminPanelStore,
    collapsible: true,
    columnLines: true,
    frame: true,
    selType: "rowmodel",

    viewConfig: {
        listeners: {
            render: 'roleTooltipCreate',
        }
    },

    plugins: [{
        ptype: "cellediting",
        clicksToEdit: 1,
        pluginId: "cellplugin",
        listeners: {
            validateedit: 'onValidateEdit'
        },
    }],

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
            handler: 'deleteRecord'
        }]
    }, {
        text: "ID",
        dataIndex: "id",
        align: "center",
        hidden: true,
        width: 60,
    }, {
        text: "Логин учетной записи",
        dataIndex: "login",
        align: "center",
        flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: false,
        }
    }, {
        text: "Пароль учетной записи",
        dataIndex: "password",
        align: "center",
        flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: false,
        }
    }, {
        text: "Имя",
        dataIndex: "first_name",
        align: "center",
        flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: true,
        }
    }, {
        text: "Фамилия",
        dataIndex: "last_name",
        align: "center",
        flex: 1,
        editor: {
            xtype: 'textfield',
            allowBlank: true,
        }
    }, {
        text: "Роль",
        dataIndex: "role",
        tdCls: 'roleTdCls',
        align: "center",
        flex: 1,
        editor: new Ext.form.field.ComboBox({
            store: comboStoreRole,
            triggerAction: 'all',
            allowBlank: false,
            editable: false,
        }),
    }]
});