<?php
//сохранение изменений в таблице users

//подключение к БД
require_once "db_connection.php";

$changed_field = $_POST['changedField'];
$new_value = $_POST['newValue'];
$id_field_value = $_POST['idFieldValue'];

pg_query($db, " UPDATE $schema.users
                SET $changed_field=$new_value
                WHERE id_user=$id_field_value
                ") or die('Data load failed:' . pg_last_error());

echo "{'success': true}";
