<?php
//проверка введенных имени пользователя и пароля

//подключение к БД
require_once "db_connection.php";

$login_entered = $_POST['user'];
$password_entered = $_POST['pass'];

$db_query = "SELECT *
            FROM $schema.logins
            WHERE login='$login_entered' AND password='$password_entered'";

$result = pg_query($db, $db_query) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query);

$rows = pg_fetch_all($result);

echo json_encode($rows);
