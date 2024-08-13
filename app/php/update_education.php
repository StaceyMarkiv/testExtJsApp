<?php
//сохранение изменений в таблице education

//подключение к БД
require_once "db_connection.php";

$db_query1 = "SELECT max(id_grade)+1 FROM $schema.education";
$res = pg_query($db, $db_query1) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query1);
$max_id_grade = pg_fetch_all_columns($res, 0)[0];

//получаем параметры из запроса
$id_grade = isset($_POST['id_grade']) ? $_POST['id_grade'] : null;
$grade = isset($_POST['grade']) ? $_POST['grade'] : null;
$action = $_POST['action'];

if ($action == 'add') {
    $db_query2 = "INSERT INTO $schema.education (id_grade, grade)
                VALUES ($max_id_grade, '$grade')";

} else if ($action == 'update') {
    $db_query2 = "UPDATE $schema.education
                SET grade='$grade'
                WHERE id_grade=$id_grade;";
                
} else if ($action == 'delete') {
    $db_query2 = "DELETE FROM $schema.education
                WHERE id_grade=$id_grade;";
}

pg_query($db, $db_query2) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query2);

echo "{'success': true}";
