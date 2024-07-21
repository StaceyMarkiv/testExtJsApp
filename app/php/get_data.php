<?php
//получение основных данных из БД

//подключение к БД
require_once "db_connection.php";

$db_query = "SELECT users.id_user,
                    users.first_name,
                    users.last_name,
                    users.has_car::int,

                    education.id_grade,
                    education.grade,
                                
                    string_agg(cities.city_name, ', ' ORDER BY cities.city_name) AS city,
                    CASE
                        WHEN users.has_car = true THEN 'blue'
                        ELSE NULL
                    END AS has_car_color,
                    CASE
                        WHEN cars.car_brand = 'new_car' OR cars.color = 'new_color' THEN 'red'
                        ELSE NULL
                    END AS default_car_color
            FROM $schema.users
            JOIN $schema.education ON users.id_grade = education.id_grade
            LEFT JOIN $schema.user_cities ON users.id_user = user_cities.id_user
            LEFT JOIN $schema.cities ON cities.id_city = user_cities.id_city
            LEFT JOIN $schema.cars ON users.id_user = cars.id_user
            GROUP BY users.id_user, education.id_grade, cars.car_brand, cars.color
            ORDER BY users.last_name";

$result = pg_query($db, $db_query) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query);

$rows = [];
while ($row = pg_fetch_assoc($result)) {
    $rows[] = array(
        'id_user' => $row['id_user'],
        'first_name' => $row['first_name'],
        'last_name' => $row['last_name'],
        'has_car' => (bool) $row['has_car'],        //принудительно конвертируем в bool
        'id_grade' => $row['id_grade'],
        'grade' => $row['grade'],
        'city' => $row['city'],
        'has_car_color' => $row['has_car_color'],
        'default_car_color' => $row['default_car_color'],
    );
}

echo json_encode($rows);
