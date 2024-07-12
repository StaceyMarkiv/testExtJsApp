<?php
//получение основных данных из БД

//подключение к БД
require_once "db_connection.php";

$result = pg_query($db, "SELECT users.id_user,
                                users.first_name,
                                users.last_name,

                                education.id_grade,
                                education.grade,
                                
                                string_agg(cities.city_name, ', ' ORDER BY cities.city_name) AS city
                        FROM $schema.users
                        JOIN $schema.education ON users.id_grade = education.id_grade
                        LEFT JOIN $schema.user_cities ON users.id_user = user_cities.id_user
                        LEFT JOIN $schema.cities ON cities.id_city = user_cities.id_city
                        GROUP BY users.id_user, education.id_grade
                        ORDER BY users.last_name
                    ") or die('Data load failed:' . pg_last_error());

$rows = pg_fetch_all($result);

echo json_encode($rows);
