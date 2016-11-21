<?php
/**
 * This makes our life easier when dealing with paths. Everything is relative
 * to the application root now.
 */
$REQUEST_URI = $_SERVER["REQUEST_URI"];

if(strpos($REQUEST_URI,"deletemethod") >= 0){
	header("Access-Control-Allow-Origin: *");
}

include('include/config.php');

//Router
include("../config/router.php");

chdir(dirname(__DIR__));

// Decline static file requests back to the PHP built-in webserver
if (php_sapi_name() === 'cli-server') {
    $path = realpath(__DIR__ . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
    if (__FILE__ !== $path && is_file($path)) {
        return false;
    }
    unset($path);
}
// header("Access-Control-Allow-Origin: *");




// Setup autoloading
require 'init_autoloader.php';

// Run the application!
Zend\Mvc\Application::init(require 'config/application.config.php')->run();
