//создаем хранилище таблицы
let citiesStore = Ext.create("app.store.cityFormStore");
citiesStore.load();

//контроллер
Ext.define('app.view.cities.citiesController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.citiesController',

    addNewCity: function (button) {
        /*
            Метод для добавления новой записи в таблицу

            Аргументы:
            button - кнопка "Добавить"

            Метод добавляет новую строку в таблицу и активирует редактор ячейки в столбце "Города".
        */

        let grid = button.up('grid');
        let store = grid.getStore();

        let record = new app.model.cityFormModel({
            id_city: store.max('id_city') + 1,
            city_name: 'Новый город',
        });
        store.add(record);

        //сохраняем новую запись в БД
        let saveParams = {
            'city_name': record.get('city_name'),
            'action': 'add'
        };
        this.saveCitiesChanges(saveParams);

        //прокручиваем страницу до появления новой записи в поле видимости
        grid.ensureVisible(record);

        //активируем редактор в столбце 'city_name'
        let cellEditing = grid.getPlugin('cellplugin');
        cellEditing.startEditByPosition({
            row: store.count() - 1,
            column: 3
        });
    },

    deleteCity: function (grid, rowIndex, colIndex) {
        /*
            Метод для удаления записи
            
            Аргументы:
            grid - сама таблица
            rowIndex - индекс строки в локальном хранилище
            colIndex - индекс столбца

            Метод передает удаляет выбранную запись из локального хранилища и из БД.
        */

        let me = this;

        Ext.Msg.show({
            title: 'Предупреждение',
            message: 'Вы точно хотите удалить запись?',
            width: 300,
            buttons: Ext.Msg.OKCANCEL,
            icon: Ext.window.MessageBox.WARNING,
            fn: function (btn) {
                if (btn === 'ok') {
                    let store = grid.getStore();
                    let id_city = store.getAt(rowIndex).get('id_city');

                    //удаляем из локального хранилища
                    store.removeAt(rowIndex);

                    //сохраняем изменения в БД
                    let saveParams = {
                        'id_city': id_city,
                        'action': 'delete'
                    };
                    me.saveCitiesChanges(saveParams);
                }
            },
        });
    },

    onCitiesAfterrender: function () {
        /*
            Метод для обработки события окончания рендера формы
            Метод создает маску загрузки.
        */

        //создаем маску загрузки
        this.citiesLoadMask = new Ext.LoadMask({
            msg: 'Сохранение...',
            target: this.getView()
        });
    },

    onCitiesValidateEdit: function (editor, context) {
        /*
            Метод для обработки введенного в ячейку значения
            
            Аргументы:
            editor - редактор столбца
            context - данные, связанные с редактируемой ячейкой

            Метод должным образом обрабатывает введенное значение и записывает его в хранилище.
        */

        let grid = context.grid;

        //вручную перезаписываем данные ячейки в хранилище (чтобы убрать красный уголок на ячейке)
        context.cancel = true;
        context.record.data[context.field] = context.value;

        //сохраняем изменения в БД
        let saveParams = {
            'id_city': context.record.data['id_city'],
            'city_name': context.record.data['city_name'],
            'action': 'update'
        };
        this.saveCitiesChanges(saveParams);

        //обновляем запись в таблице
        context.record.commit();
        grid.getView().refreshNode();
    },

    saveCitiesChanges: function (saveParams) {
        /*
            Метод для сохранения в БД измененного значения
            
            Аргументы:
            saveParams - параметры для сохранения

            Метод передает указанные параметры для сохранения информации в БД.
        */

        let me = this;
        me.citiesLoadMask.show();

        Ext.Ajax.request({
            url: `app/php/update_cities.php`,
            params: saveParams,
            callback: function (opts, success, response) {
                let res = Ext.decode(response.responseText);

                if (res.success) {
                    me.citiesLoadMask.hide();

                    [comboStoreCity] = comboStoreFunc('cities', 'id_city', 'city_name');
                    Ext.getCmp('mainPageId').getController().cityStore = comboStoreCity;
                }
            }
        });
    },
});