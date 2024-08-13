Ext.define('app.store.adminPanelStore', {
    extend: 'Ext.data.JsonStore',
    model: 'app.model.adminPanelModel',
    proxy: {
        type: 'ajax',
        url : 'app/php/get_login_data.php',
        reader: {
            type: 'json',
        }
    },
});