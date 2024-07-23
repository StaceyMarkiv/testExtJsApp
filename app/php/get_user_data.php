<?php
//получение всех данных о выбранном пользователе

//подключение к БД
require_once "db_connection.php";

$id_user = $_POST['id_user'];

//основной запрос
$db_query = "SELECT users.first_name,
                    users.last_name,
                    users.birthday,
                    education.grade,
                    string_agg(cities.city_name, ', ' ORDER BY cities.city_name) AS city,
                    cars.car_brand,
                    cars.color
            FROM $schema.users
            LEFT JOIN $schema.education ON users.id_grade = education.id_grade
            LEFT JOIN $schema.user_cities ON users.id_user = user_cities.id_user
            LEFT JOIN $schema.cities ON cities.id_city = user_cities.id_city
            LEFT JOIN $schema.cars ON users.id_user = cars.id_user
            WHERE users.id_user=$id_user
            GROUP BY users.id_user, education.id_grade, cars.car_brand, cars.color
            ";

$result = pg_query($db, $db_query) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query);
$query_object = pg_fetch_object($result);

if (!$query_object) {
    $error_msg = "Данные для отображения отсутствуют.";
    $query_object = new stdClass();
    $query_object->error = $error_msg;
}

//список названий полей для отображения
$display_names = array(
    'first_name' => 'Имя',
    'last_name' => 'Фамилия',
    'birthday' => 'Дата рождения',
    'grade' => 'Образование',
    'city' => 'Города',
    'car_brand' => 'Марка машины',
    'color' => 'Цвет машины',
);

echo json_encode([$query_object, $display_names]);
