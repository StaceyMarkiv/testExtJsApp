<?php
//сохранение изменений в таблице logins

//подключение к БД
require_once "db_connection.php";

$db_query1 = "SELECT max(id)+1 FROM $schema.logins";
$res = pg_query($db, $db_query1) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query1);
$max_id = pg_fetch_all_columns($res, 0)[0];

//получаем параметры из запроса
$action = $_POST['action'];
$id = isset($_POST['id']) ? $_POST['id'] : null;

$field_name = isset($_POST['fieldName']) ? $_POST['fieldName'] : null;
$field_value = isset($_POST['fieldValue']) ? $_POST['fieldValue'] : null;

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

if ($action == 'add') {
    $first_name = ($first_name !== '') ? $first_name : 'NULL';
    $last_name = ($last_name !== '') ? $last_name : 'NULL';

    $add_query = "INSERT INTO $schema.logins (id, login, password, first_name, last_name, id_role)
                VALUES ($max_id, $1, $2, $3, $4, $5)";

    //подготовка запроса
    $result = pg_prepare($db, "add_query", $add_query);
    //запуск запроса на выполнение
    $result = pg_execute($db, "add_query", array($login, $password, $first_name, $last_name, $id_role)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $add_query);
} else if ($action == 'update') {
    $update_query = "UPDATE $schema.logins
                    SET $field_name = $2
                    WHERE id=$1;";

    //подготовка запроса
    $result = pg_prepare($db, "update_query", $update_query);
    //запуск запроса на выполнение
    $result = pg_execute($db, "update_query", array($id, $field_value)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $update_query);
} else if ($action == 'delete') {
    $delete_query = "DELETE FROM $schema.logins
                WHERE id=$1;";

    //подготовка запроса
    $result = pg_prepare($db, "delete_query", $delete_query);
    //запуск запроса на выполнение
    $result = pg_execute($db, "delete_query", array($id)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $delete_query);
}

echo "{'success': true}";
