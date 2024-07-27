Ext.define('app.store.educationFormStore', {
    extend: 'Ext.data.JsonStore',
    model: 'app.model.educationFormModel',
    proxy: {
        type: 'ajax',
        url : 'app/php/get_education_data.php',
        reader: {
            type: 'json',
        }
    },
});