//создаем хранилище таблицы
let educationStore = Ext.create("app.store.educationFormStore");
educationStore.load();

//контроллер
Ext.define('app.view.education.educationController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.educationController',

    addNewGrade: function (button) {
        /*
            Метод для добавления новой записи в таблицу

            Аргументы:
            button - кнопка "Добавить"

            Метод добавляет новую строку в таблицу и активирует редактор ячейки в столбце
            "Ступени образования".
        */

        let grid = button.up('grid');
        let store = grid.getStore();

        let record = new app.model.educationFormModel({
            id_grade: store.max('id_grade') + 1,
            grade: 'Новая ступень',
        });
        store.add(record);

        //сохраняем новую запись в БД
        let saveParams = {
            'grade': record.get('grade'),
            'action': 'add'
        };
        this.saveEducationChanges(saveParams);

        //прокручиваем страницу до появления новой записи в поле видимости
        grid.ensureVisible(record);

        //активируем редактор в столбце 'grade'
        let cellEditing = grid.getPlugin('cellplugin');
        cellEditing.startEditByPosition({
            row: store.count() - 1,
            column: 3
        });
    },

    deleteGrade: function (grid, rowIndex, colIndex) {
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
                    let id_grade = store.getAt(rowIndex).get('id_grade');

                    //удаляем из локального хранилища
                    store.removeAt(rowIndex);

                    //сохраняем изменения в БД
                    let saveParams = {
                        'id_grade': id_grade,
                        'action': 'delete'
                    };
                    me.saveEducationChanges(saveParams);
                }
            },
        });
    },

    onEducationAfterrender: function () {
        /*
            Метод для обработки события окончания рендера формы
            Метод создает маску загрузки.
        */

        //создаем маску загрузки
        this.educationLoadMask = new Ext.LoadMask({
            msg: 'Сохранение...',
            target: this.getView()
        });
    },

    onEducationValidateEdit: function (editor, context) {
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
            'id_grade': context.record.data['id_grade'],
            'grade': context.record.data['grade'],
            'action': 'update'
        };
        this.saveEducationChanges(saveParams);

        //обновляем запись в таблице
        context.record.commit();
        grid.getView().refreshNode();
    },

    saveEducationChanges: function (saveParams) {
        /*
            Метод для сохранения в БД измененного значения
            
            Аргументы:
            saveParams - параметры для сохранения

            Метод передает указанные параметры для сохранения информации в БД.
        */

        let me = this;
        me.educationLoadMask.show();

        Ext.Ajax.request({
            url: `app/php/update_education.php`,
            params: saveParams,
            callback: function (opts, success, response) {
                let res = Ext.decode(response.responseText);

                if (res.success) {
                    me.educationLoadMask.hide();

                    [comboStoreEducation, dataStoreEducation] = comboStoreFunc('education', 'id_grade', 'grade');
                    Ext.getCmp('educationCombobox').setStore(comboStoreEducation);
                }
            }
        });
    },
});