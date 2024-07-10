<?php

//параметры подключения к БД
$dbconnect = parse_ini_file("../../resources/ini/dbconnect.ini");
$host = $dbconnect['HOST'];
$port = $dbconnect['PORT'];
$dbname = $dbconnect['DBNAME'];
$user = $dbconnect['USER'];
$password = $dbconnect['PASSWORD'];
$schema = $dbconnect['SCHEMA'];

$db = pg_connect('host=' . $host . ' port=' . $port . ' dbname=' . $dbname . ' user=' . $user . ' password=' . $password) or die('could not connect:' . pg_last_error());
