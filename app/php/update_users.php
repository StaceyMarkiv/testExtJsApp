<?php
//сохранение изменений в таблице users

//подключение к БД
require_once "db_connection.php";

$error_msg = 'Data load failed:' . pg_last_error();     //сообщение об ошибке выполнения запроса

//получаем параметры из запроса
$id_field_value = $_POST['idFieldValue'];
$new_values = json_decode($_POST['newValues']);

$set_statement = "";
$add_car = false;
$remove_car = false;
$car_brand = 'new_car';
$color = 'new_color';

foreach ($new_values as $key => $value) {
    if (!in_array($key, ['car_brand', 'color'])) {
        if ($key === 'id_grade' && $value === null) {
            continue;
        }

        $value = (is_numeric(strpos($key, 'id'))) ? $value : (($value == null) ? 'NULL' : "'$value'");
        $set_statement .= "$key=$value, ";

        //проверяем, нужно ли добавить / обновить пользователю новую машину либо удалить имеющуюся
        if ($key == 'has_car') {
            $add_car = ($value == "'true'") ? true : false;
            $remove_car = ($value == "'false'") ? true : false;
        }
    } else if ($key == 'car_brand') {
        $car_brand = ($value) ? $value : 'new_car';
    } else if ($key == 'color') {
        $color = ($value) ? $value : 'new_color';
    }
}
$set_statement = rtrim($set_statement, ', ');

$db_query1 = "UPDATE $schema.users
            SET $set_statement
            WHERE id_user=$id_field_value;";

if ($add_car) {
    //получаем текущий макс. id в таблице cars и проверяем, есть ли у данного пользователя машина
    $db_query2 = "SELECT max(id_car), (SELECT id_car FROM $schema.cars WHERE id_user=$id_field_value)
                FROM $schema.cars";
    $res = pg_query($db, $db_query2) or die($error_msg . 'sql = ' . $db_query2);
    $max_id_car = pg_fetch_all_columns($res, 0)[0];
    $existing_car = pg_fetch_all_columns($res, 1)[0];

    if (is_null($max_id_car)) {
        $max_id_car = 0;
    }

    if (!$existing_car) {
        //добавляем новую машину в таблицу cars
        $db_query1 .= " INSERT INTO $schema.cars (id_car, car_brand, color, id_user)
                        VALUES ($max_id_car+1, '$car_brand', '$color', $id_field_value);";
    } else {
        //обновляем данные по имеющейся машине
        $db_query1 .= "UPDATE $schema.cars
                        SET car_brand='$car_brand', color='$color'
                        WHERE id_user=$id_field_value;";
    }
}

if ($remove_car) {
    //удаляем из таблицы cars машину, привязанную к данному пользователю
    $db_query1 .= " DELETE FROM $schema.cars
                    WHERE id_user=$id_field_value;";
}

pg_query($db, $db_query1) or die($error_msg . 'sql = ' . $db_query1);

echo "{'success': true}";
