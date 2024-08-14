<?php
//добавление новой записи в таблицу users

//подключение к БД
require_once "db_connection.php";

$error_msg = 'Data load failed:' . pg_last_error();     //сообщение об ошибке выполнения запроса

//получаем макс. id в таблице users
$db_query1 = "SELECT max(id_user)+1 FROM $schema.users";
$res_user = pg_query($db, $db_query1) or die($error_msg . 'sql = ' . $db_query1);
$new_id_user = pg_fetch_all_columns($res_user, 0)[0];

//получаем макс. id в таблице user_cities
$db_query2 = "SELECT max(id)+1 FROM $schema.user_cities";
$res_user_cities = pg_query($db, $db_query2) or die($error_msg . 'sql = ' . $db_query2);
$new_id_user_cities = pg_fetch_all_columns($res_user_cities, 0)[0];

//получаем макс. id в таблице cars
$db_query3 = "SELECT max(id_car)+1 FROM $schema.cars";
$res_car = pg_query($db, $db_query3) or die($error_msg . 'sql = ' . $db_query3);
$new_id_car = pg_fetch_all_columns($res_car, 0)[0];

$first_name = $_POST['firstName'];
$last_name = $_POST['lastName'];
$id_grade = $_POST['grade'];
$id_city_arr = json_decode($_POST['id_city']);
$has_car = $_POST['hasCar'];
$birthday = $_POST['birthday'];
$car_brand = ($_POST['car_brand'] != '') ? $_POST['car_brand'] : 'new_car';
$color = ($_POST['color'] != '') ? $_POST['color'] : 'new_color';

$birthday = ($birthday != '') ? $birthday : 'NULL';

//основной запрос
$user_query = "INSERT INTO $schema.users (id_user, first_name, last_name, id_grade, birthday, has_car)
                VALUES ($new_id_user, $1, $2, $3, $4, $5);";

//подготовка запроса
$result = pg_prepare($db, "user_query", $user_query);
//запуск запроса на выполнение
$result = pg_execute($db, "user_query", array($first_name, $last_name, $id_grade, $birthday, $has_car)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $user_query);

if ($id_city_arr != null) {
    //добавляем города в таблицу user_cities
    if (!is_array($id_city_arr)) {
        //если id всего один, он приходит не в массиве
        $id_city_arr = [$id_city_arr];
    }

    $city_values_statement = "";
    foreach ($id_city_arr as $i => $id_city) {
        $new_id = $new_id_user_cities + $i;
        $city_values_statement .= "($new_id, $new_id_user, $id_city), ";
    }
    $city_values_statement = rtrim($city_values_statement, ', ');

    $user_cities_query = " INSERT INTO $schema.user_cities (id, id_user, id_city)
                    VALUES $city_values_statement;";

    pg_query($db, $user_cities_query) or die($error_msg . 'sql = ' . $user_cities_query);
}

if ($has_car) {
    //добавляем машину в таблицу cars
    $car_query = " INSERT INTO $schema.cars (id_car, car_brand, color, id_user)
                    VALUES ($new_id_car, $1, $2, $new_id_user);";

    //подготовка запроса
    $result = pg_prepare($db, "car_query", $car_query);
    //запуск запроса на выполнение
    $result = pg_execute($db, "car_query", array($car_brand, $color)) or die('Data load failed:' . pg_last_error() . 'sql = ' . $car_query);
}

echo "{'success': true}";
