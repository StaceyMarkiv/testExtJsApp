<?php
//сохранение изменений в таблице cities

//подключение к БД
require_once "db_connection.php";

$db_query1 = "SELECT max(id_city)+1 FROM $schema.cities";
$res = pg_query($db, $db_query1) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query1);
$max_id_city = pg_fetch_all_columns($res, 0)[0];

//получаем параметры из запроса
$id_city = isset($_POST['id_city']) ? $_POST['id_city'] : null;
$city_name = isset($_POST['city_name']) ? $_POST['city_name'] : null;
$action = $_POST['action'];

if ($action == 'add') {
    $db_query2 = "INSERT INTO $schema.cities (id_city, city_name)
                VALUES ($max_id_city, '$city_name')";

} else if ($action == 'update') {
    $db_query2 = "UPDATE $schema.cities
                SET city_name='$city_name'
                WHERE id_city=$id_city;";
                
} else if ($action == 'delete') {
    $db_query2 = "DELETE FROM $schema.cities
                WHERE id_city=$id_city;";
}

pg_query($db, $db_query2) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query2);

echo "{'success': true}";
