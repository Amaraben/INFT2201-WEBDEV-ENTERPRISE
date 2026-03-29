<?php

require "vendor/autoload.php";

spl_autoload_register(function ($class) {
    include 'classes/' . str_replace("\\", "/", $class) . '.class.php';
});
