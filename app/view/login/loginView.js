Ext.define("app.view.login.loginView", {
    extend: "Ext.panel.Panel",
    alias: "widget.loginView",
    header: false,
    id: 'loginPanelId',
    controller: "loginController",

    height: '100%',
    flex: 1,
    layout: 'center',

    items: [{
        xtype: 'form',
        itemId: 'loginForm',
        title: 'Вход',
        frame: true,
        width: 420,
        bodyPadding: 10,
        defaultType: 'textfield',

        fieldDefaults: {
            anchor: '100%',
            labelWidth: 150,
        },

        defaults: {
            allowBlank: false,
            msgTarget: 'under',
            enableKeyEvents: true,
            listeners: {
                afterrender: 'onFormFieldAfterrender',
                change: 'onFormFieldValueChange',
                specialkey: 'onSpecialkeyPressed'
            },
        },

        items: [{
            fieldLabel: 'Имя пользователя',
            itemId: 'user',
            name: 'user',
            emptyText: 'Имя пользователя',
        }, {
            fieldLabel: 'Пароль',
            itemId: 'pass',
            name: 'pass',
            emptyText: 'Пароль',
            inputType: 'password',
        }],

        buttons: [{
            text: 'Войти',
            itemId: 'enterButtonId',
            width: 150,
            disabled: true,
            listeners: {
                click: 'logInUser'
            }
        }],
    }]
});