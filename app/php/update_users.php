<?php
//сохранение изменений в таблице users

//подключение к БД
require_once "db_connection.php";

$error_msg = 'Data load failed:' . pg_last_error();     //сообщение об ошибке выполнения запроса

$id_field_value = $_POST['idFieldValue'];
$new_values = json_decode($_POST['newValues']);

$set_statement = "";
$add_default_car = false;
$remove_car = false;

foreach ($new_values as $key => $value) {
    $value = (is_numeric(strpos($key, 'id'))) ? $value : "'$value'";
    $set_statement .= "$key=$value, ";

    //проверяем, нужно ли добавить пользователю новую дефолтную машину либо удалить имеющуюся
    if ($key == 'has_car') {
        $add_default_car = ($value == "'true'") ? true : false;
        $remove_car = ($value == "'false'") ? true : false;
    }
}
$set_statement = rtrim($set_statement, ', ');

$db_query1 = "UPDATE $schema.users
            SET $set_statement
            WHERE id_user=$id_field_value;
            ";

if ($add_default_car) {
    //получаем текущий макс. id в таблице cars
    $db_query2 = "SELECT max(id_car) FROM $schema.cars";
    $res = pg_query($db, $db_query2) or die($error_msg);
    $max_id_car = pg_fetch_all_columns($res, 0)[0];

    if (is_null($max_id_car)) {
        $max_id_car = 0;
    }

    //добавляем дефолтную машину в таблицу cars
    $db_query1 .= " INSERT INTO $schema.cars (id_car, car_brand, color, id_user)
                    VALUES ($max_id_car+1, 'new_car', 'new_color', $id_field_value);";
}

if ($remove_car) {
    //удаляем из таблицы cars машину, привязанную к данному пользователю
    $db_query1 .= " DELETE FROM $schema.cars
                    WHERE id_user=$id_field_value;";
}

pg_query($db, $db_query1) or die($error_msg);

echo "{'success': true}";
