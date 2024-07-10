<?php
//загрузка таблицы, из которой идут данные в ComboBox

//подключение к БД
require_once "db_connection.php";

//получаем содержимое json, отправленного из JS
$json = file_get_contents('php://input');

//декодируем данные json
$data = json_decode($json);

$db_table = $data[0];
$id = $data[1];
$field_name = $data[2];

$result = pg_query($db, "SELECT DISTINCT $db_table.$id,
                                $db_table.$field_name
                        FROM $schema.$db_table
                        ORDER BY $db_table.$id
                    ") or die('Data load failed:' . pg_last_error());

$rows = pg_fetch_all($result);

echo json_encode($rows);
