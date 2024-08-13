<?php
//получение данных об учетных записях

//подключение к БД
require_once "db_connection.php";

$db_query = "SELECT id,
                    login,
                    password,
                    first_name,
                    last_name,

                    roles.role,
                    roles.description
            FROM $schema.logins
            JOIN $schema.roles ON logins.id_role = roles.id_role
            ORDER BY logins.id";

$result = pg_query($db, $db_query) or die('Data load failed:' . pg_last_error() . 'sql = ' . $db_query);

$rows = pg_fetch_all($result);

echo json_encode($rows);
