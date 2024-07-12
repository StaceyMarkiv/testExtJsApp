<?php
//сохранение изменений в таблице users

//подключение к БД
require_once "db_connection.php";

$db_query1 = "SELECT max(id_user)+1 FROM $schema.users";
$res_user = pg_query($db, $db_query1) or die('Data load failed:' . pg_last_error());
$new_id_user = pg_fetch_all_columns($res_user, 0)[0];

$db_query2 = "SELECT max(id)+1 FROM $schema.user_cities";
$res_user_cities = pg_query($db, $db_query2) or die('Data load failed:' . pg_last_error());
$max_id_user_cities = pg_fetch_all_columns($res_user_cities, 0)[0];

$first_name = $_POST['firstName'];
$last_name = $_POST['lastName'];
$id_grade = $_POST['grade'];
$id_city_arr = json_decode($_POST['id_city']);

$db_query3 = "INSERT INTO $schema.users (id_user, first_name, last_name, id_grade)
            VALUES ($new_id_user, '$first_name', '$last_name', $id_grade);";

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

pg_query($db, $db_query3) or die('Data load failed:' . pg_last_error());

echo "{'success': true}";
