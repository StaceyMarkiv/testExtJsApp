<?php
//добавление новой записи в таблицу cars

//подключение к БД
require_once "db_connection.php";

$id_user = $_POST['idFieldValue'];
$car_brand = $_POST['carBrand'];
$color = $_POST['color'];

$db_query = "UPDATE $schema.cars
            SET car_brand='$car_brand', color='$color'
            WHERE id_user=$id_user";

pg_query($db, $db_query) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query);

echo "{'success': true}";
