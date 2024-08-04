<?php
//добавление новой записи в таблицу cars

//подключение к БД
require_once "db_connection.php";

$id_user = $_POST['idFieldValue'];
$car_brand = $_POST['carBrand'];
$color = $_POST['color'];

$db_query = "UPDATE $schema.cars
            SET car_brand=$1, color=$2
            WHERE id_user=$3;";

//подготовка запроса
$result = pg_prepare($db, "add_car_query", $db_query);

//запуск запроса на выполнение
$result = pg_execute($db, "add_car_query", array($car_brand, $color, $id_user)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query);

echo "{'success': true}";
