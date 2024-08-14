<?php
//сохранение изменений в таблице education

//подключение к БД
require_once "db_connection.php";

$db_query = "SELECT max(id_grade)+1 FROM $schema.education";
$res = pg_query($db, $db_query) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query);
$max_id_grade = pg_fetch_all_columns($res, 0)[0];

//получаем параметры из запроса
$id_grade = isset($_POST['id_grade']) ? $_POST['id_grade'] : null;
$grade = isset($_POST['grade']) ? $_POST['grade'] : null;
$action = $_POST['action'];

if ($action == 'add') {
    $add_query = "INSERT INTO $schema.education (id_grade, grade)
                VALUES ($max_id_grade, $1)";

    //подготовка запроса
    $result = pg_prepare($db, "add_query", $add_query);
    //запуск запроса на выполнение
    $result = pg_execute($db, "add_query", array($grade)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $add_query);

} else if ($action == 'update') {
    $update_query = "UPDATE $schema.education
                    SET grade=$2
                    WHERE id_grade=$1;";

    //подготовка запроса
    $result = pg_prepare($db, "update_query", $update_query);
    //запуск запроса на выполнение
    $result = pg_execute($db, "update_query", array($id_grade, $grade)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $update_query);

} else if ($action == 'delete') {
    $delete_query = "DELETE FROM $schema.education
                WHERE id_grade=$1;";
                
    //подготовка запроса
    $result = pg_prepare($db, "delete_query", $delete_query);
    //запуск запроса на выполнение
    $result = pg_execute($db, "delete_query", array($id_grade)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $delete_query);
}

echo "{'success': true}";
