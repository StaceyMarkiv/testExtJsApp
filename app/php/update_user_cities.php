<?php
//сохранение изменений в таблице user_cities

//подключение к БД
require_once "db_connection.php";

$db_query1 = "SELECT max(id)+1 FROM $schema.user_cities";
$res = pg_query($db, $db_query1) or die('Data load failed:' . pg_last_error());
$max_id = pg_fetch_all_columns($res, 0)[0];

$id_user = $_POST['id_user'];
$id_city_arr = json_decode($_POST['id_city']);

if ($id_city_arr != null) {
    if (!is_array($id_city_arr)) {
        //если id всего один, он приходит не в массиве
        $id_city_arr = [$id_city_arr];
    }

    $values_statement = "";
    foreach ($id_city_arr as $i => $id_city) {
        $new_id = $max_id + $i;
        $values_statement .= "($new_id, $id_user, $id_city), ";
    }
    $values_statement = rtrim($values_statement, ', ');

    $db_query2 = "DELETE FROM $schema.user_cities
                WHERE id_user=$id_user;

                INSERT INTO $schema.user_cities (id, id_user, id_city)
                VALUES $values_statement
                ";
} else {
    $db_query2 = "DELETE FROM $schema.user_cities
                WHERE id_user=$id_user;";
}

pg_query($db, $db_query2) or die('Data load failed:' . pg_last_error());

echo "{'success': true}";
