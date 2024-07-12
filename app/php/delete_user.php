<?php
//сохранение изменений в таблице users

//подключение к БД
require_once "db_connection.php";

$id_user = $_POST['id_user'];

pg_query($db, " DELETE FROM $schema.users
                WHERE id_user=$id_user
                ") or die('Data load failed:' . pg_last_error());

echo "{'success': true}";
