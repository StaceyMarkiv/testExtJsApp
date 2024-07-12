<?php
//сохранение изменений в таблице users

//подключение к БД
require_once "db_connection.php";

$id_field_value = $_POST['idFieldValue'];
$new_values = json_decode($_POST['newValues']);

$set_statement = "";
foreach ($new_values as $key => $value) {
    $value = (is_numeric(strpos($key, 'id'))) ? $value : "'$value'";
    $set_statement .= "$key=$value, ";
}
$set_statement = rtrim($set_statement, ', ');

pg_query($db, " UPDATE $schema.users
                SET $set_statement
                WHERE id_user=$id_field_value
                ") or die('Data load failed:' . pg_last_error());

echo "{'success': true}";
