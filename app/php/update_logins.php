<?php
//сохранение изменений в таблице logins

//подключение к БД
require_once "db_connection.php";

$db_query1 = "SELECT max(id)+1 FROM $schema.logins";
$res = pg_query($db, $db_query1) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query1);
$max_id = pg_fetch_all_columns($res, 0)[0];

//получаем параметры из запроса
$id = isset($_POST['id']) ? $_POST['id'] : null;
$login = isset($_POST['login']) ? $_POST['login'] : null;
$password = isset($_POST['password']) ? $_POST['password'] : null;
$first_name = isset($_POST['first_name']) ? $_POST['first_name'] : null;
$first_name = ($first_name !== '') ? $first_name : null;
$last_name = isset($_POST['last_name']) ? $_POST['last_name'] : null;
$last_name = ($last_name !== '') ? $last_name : null;
$id_role = isset($_POST['id_role']) ? $_POST['id_role'] : null;

if ($id_role === null) {
    //если ввод нового пользователя, то id_role передается в поле role
    $id_role = isset($_POST['role']) ? $_POST['role'] : null;
    $id_role = preg_match('~[0-9]+~', $id_role) ? (int) $id_role : null;        //определяем, что в поле role пришло число
}
$action = $_POST['action'];

if ($action == 'add') {
    $first_name = ($first_name !== '') ? "'" . $first_name . "'": 'NULL';
    $last_name = ($last_name !== '') ? "'" . $last_name . "'": 'NULL';

    $db_query2 = "INSERT INTO $schema.logins (id, login, password, first_name, last_name, id_role)
                VALUES ($max_id, '$login', '$password', $first_name, $last_name, $id_role)";
} else if ($action == 'update') {
    if ($login) {
        $db_query2 = "UPDATE $schema.logins
                    SET login='$login'
                    WHERE id=$id;";
    } else if ($password) {
        // $password = password_hash($password, PASSWORD_DEFAULT);
        $db_query2 = "UPDATE $schema.logins
                    SET password='$password'
                    WHERE id=$id;";
    } else if ($first_name) {
        $db_query2 = "UPDATE $schema.logins
                    SET first_name='$first_name'
                    WHERE id=$id;";
    } else if ($last_name) {
        $db_query2 = "UPDATE $schema.logins
                    SET last_name='$last_name'
                    WHERE id=$id;";
    } else if ($id_role) {
        $db_query2 = "UPDATE $schema.logins
                    SET id_role=$id_role
                    WHERE id=$id;";
    }
} else if ($action == 'delete') {
    $db_query2 = "DELETE FROM $schema.logins
                WHERE id=$id;";
}

pg_query($db, $db_query2) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query2);

echo "{'success': true}";
