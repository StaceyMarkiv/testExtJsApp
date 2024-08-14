<?php
//проверка введенных имени пользователя и пароля

//подключение к БД
require_once "db_connection.php";

$login_entered = $_POST['user'];
$password_entered = $_POST['pass'];

//подготовка запроса
$check_password = "SELECT password 
                FROM $schema.logins
                WHERE login=$1;";
$result1 = pg_prepare($db, "check_password", $check_password);

//подготовка запроса
$login_query = "SELECT login,
                    first_name,
                    last_name,

                    roles.role
            FROM $schema.logins
            JOIN $schema.roles ON logins.id_role = roles.id_role
            WHERE login=$1 AND password=$2;";
$result2 = pg_prepare($db, "login_query", $login_query);

//запуск запроса на выполнение
$result1 = pg_execute($db, "check_password", array($login_entered)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $check_password);
$pass = pg_fetch_all_columns($result1, 0)[0];

//проверяем соответствие введенного пароля хэшированному из БД
if (password_verify($password_entered, $pass)) {
    $result2 = pg_execute($db, "login_query", array($login_entered, $pass)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $login_query);
    $rows = pg_fetch_all($result2);
} else {
    $rows = false;
}

echo json_encode($rows);
