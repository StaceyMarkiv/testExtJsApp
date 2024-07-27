<?php
//получение данных о ступенях образования из БД

//подключение к БД
require_once "db_connection.php";

$db_query = "SELECT *
            FROM $schema.education
            ORDER BY education.grade";

$result = pg_query($db, $db_query) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query);

$rows = pg_fetch_all($result);

echo json_encode($rows);
