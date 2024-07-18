<?php
//добавление новой записи в таблицу users

//подключение к БД
require_once "db_connection.php";

$error_msg = 'Data load failed:' . pg_last_error();     //сообщение об ошибке выполнения запроса

$db_query1 = "SELECT max(id_user)+1 FROM $schema.users";
$res_user = pg_query($db, $db_query1) or die($error_msg);
$new_id_user = pg_fetch_all_columns($res_user, 0)[0];

$db_query2 = "SELECT max(id)+1 FROM $schema.user_cities";
$res_user_cities = pg_query($db, $db_query2) or die($error_msg);
$max_id_user_cities = pg_fetch_all_columns($res_user_cities, 0)[0];

$first_name = $_POST['firstName'];
$last_name = $_POST['lastName'];
$id_grade = $_POST['grade'];
$id_city_arr = json_decode($_POST['id_city']);
$has_car = $_POST['hasCar'];

$db_query3 = "INSERT INTO $schema.users (id_user, first_name, last_name, id_grade, has_car)
            VALUES ($new_id_user, '$first_name', '$last_name', $id_grade, $has_car);";

if ($id_city_arr != null) {
    if (!is_array($id_city_arr)) {
        //если id всего один, он приходит не в массиве
        $id_city_arr = [$id_city_arr];
    }

    $city_values_statement = "";
    foreach ($id_city_arr as $i => $id_city) {
        $new_id = $max_id_user_cities + $i;
        $city_values_statement .= "($new_id, $new_id_user, $id_city), ";
    }
    $city_values_statement = rtrim($city_values_statement, ', ');

    $db_query3 .= " INSERT INTO $schema.user_cities (id, id_user, id_city)
                    VALUES $city_values_statement;";
}

pg_query($db, $db_query3) or die($error_msg);

echo "{'success': true}";
