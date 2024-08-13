//контроллер
Ext.define('app.view.login.loginController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.loginController',

    loginEntered: false,            //параметр проверки, что в поле "Имя пользователя" введено значение
    passwordEntered: false,         //параметр проверки, что в поле "Пароль" введено значение

    onFormFieldAfterrender: function (textfield) {
        /*
            Метод для создания всплывающей подсказки для полей ввода
            
            Аргументы:
            textfield - поле ввода

            Метод создает tooltip с собственным текстом для каждого из полей ввода.
        */

        let tooltipText = '';
        if (textfield.name === 'user') {
            tooltipText = 'login: "admin"';
        }
        if (textfield.name === 'pass') {
            tooltipText = 'password: "12345678"';
        }

        let tip = Ext.create('Ext.tip.ToolTip', {
            target: textfield.getId(),
            html: tooltipText
        });
    },

    onFormFieldValueChange: function (textfield, newValue) {
        /*
            Метод для обработки ввода логина / пароля
            
            Аргументы:
            textfield - поле ввода
            newValue - новое введенное значение

            Метод проверяет, что в обрабатываемом поле введено значение, и при необходимости 
            активирует кнопку "Войти".
        */

        if (textfield.name === 'user') {
            this.loginEntered = (newValue !== '') ? true : false;
        }
        if (textfield.name === 'pass') {
            this.passwordEntered = (newValue !== '') ? true : false;
        }

        //активируем кнопку
        let enterButton = textfield.up('form').down('button');
        if (this.loginEntered && this.passwordEntered) {
            enterButton.enable();
        } else {
            enterButton.disable();
        }
    },

    onSpecialkeyPressed: function (field, e) {
        /*
            Метод для обработки нажатия кнопок на клавиатуре при вводе данных в поля формы
            
            Аргументы:
            field - поле ввода
            e - событие нажатия

            Если нажат ENTER и при этом активна кнопка "Войти", то инициируется событие нажатия на эту кнопку.
        */

        // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
        // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
        if (e.getKey() == e.ENTER) {
            let enterButton = field.up('form').down('#enterButtonId');
            if (!enterButton.disabled) {
                enterButton.fireEvent('click', enterButton);
            }
        }
    },

    logInUser: function (button) {
        /*
            Метод для обработки введенных данных авторизации по нажатию кнопки "Войти"
            
            Аргументы:
            button - кнопка "Войти"

            Метод отправляет полученные данные авторизации для получения из БД данных по этому пользователю.
            Если данные получены, панель авторизации скрывается, показывается основная панель для работы.
            Если данные не получены, выводится сообщение о неправильно введенных данных авторизации.
        */

        let me = this;
        let loginPanel = me.getView();

        let form = button.up('form');

        //отправляем запрос в БД с введенными данными авторизации
        Ext.Ajax.request({
            url: `app/php/check_login_password.php`,
            params: form.getValues(),
            callback: function (opts, success, response) {
                if (success) {
                    //Декодируем результат запроса к БД
                    let obj = Ext.decode(response.responseText);

                    if (obj) {      //если из БД получены данные по введенному имени пользователя и паролю
                        let userName = (obj[0]['first_name']) ? obj[0]['first_name'] : obj[0]['login'];

                        //показываем приветственное сообщение
                        Ext.toast({
                            html: `Добро пожаловать, ${userName}`,
                            header: false,
                            // width: 300,
                            align: 't'
                        });

                        loginPanel.hide();

                        let mainPanel = loginPanel.up('panel').down('#mainPanel');
                        mainPanel.lookupController().loginRole = obj[0]['role'];
                        mainPanel.show();
                    } else {
                        Ext.Msg.alert('Предупреждение', 'Неверное имя пользователя или пароль');

                        form.reset();
                        // form.down('#user').focus();
                    }
                }
            }
        });
    },
});