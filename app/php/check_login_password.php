<?php
//проверка введенных имени пользователя и пароля

//подключение к БД
require_once "db_connection.php";

$login_entered = $_POST['user'];
$password_entered = $_POST['pass'];

$db_query = "SELECT login,
                    first_name,
                    last_name,

                    roles.role
            FROM $schema.logins
            JOIN $schema.roles ON logins.id_role = roles.id_role
            WHERE login=$1 AND password=$2;";

//подготовка запроса
$result = pg_prepare($db, "login_query", $db_query);

//запуск запроса на выполнение
$result = pg_execute($db, "login_query", array($login_entered, $password_entered)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query);

$rows = pg_fetch_all($result);

echo json_encode($rows);
