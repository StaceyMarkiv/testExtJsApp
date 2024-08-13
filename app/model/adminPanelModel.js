Ext.define('app.model.adminPanelModel', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type: 'int' },
        { name: 'login', type: 'string' },
        { name: 'password', type: 'string' },
        { name: 'first_name', type: 'string' },
        { name: 'last_name', type: 'string' },
        { name: 'role', type: 'string' },
    ]
});