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
    $add_query = "INSERT INTO $schema.cities (id_city, city_name)
                VALUES ($max_id_city, $1)";

    //подготовка запроса
    $result = pg_prepare($db, "add_query", $add_query);
    //запуск запроса на выполнение
    $result = pg_execute($db, "add_query", array($city_name)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $add_query);

} else if ($action == 'update') {
    $update_query = "UPDATE $schema.cities
                    SET city_name=$2
                    WHERE id_city=$1;";

    //подготовка запроса
    $result = pg_prepare($db, "update_query", $update_query);
    //запуск запроса на выполнение
    $result = pg_execute($db, "update_query", array($id_city, $city_name)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $update_query);

} else if ($action == 'delete') {
    $delete_query = "DELETE FROM $schema.cities
                    WHERE id_city=$1;";

    //подготовка запроса
    $result = pg_prepare($db, "delete_query", $delete_query);
    //запуск запроса на выполнение
    $result = pg_execute($db, "delete_query", array($id_city)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $delete_query);
}

echo "{'success': true}";
