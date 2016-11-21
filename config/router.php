<?php
    $routerConfig = require( __DIR__."/router/config.php" );
    $REQUEST_URI = parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
    $REQUEST_URI = substr($REQUEST_URI, 1, strlen($REQUEST_URI));
    $RequestArray = explode("/", $REQUEST_URI);
    //有偵測到相關關鍵字
    if(array_key_exists( $RequestArray[0], $routerConfig )){
        //取得設定值
        $methodConfig = $routerConfig[$RequestArray[0]];
        include(__DIR__."/../router/Controller/".$methodConfig["controller"].".php");
        //取得對應的CLASS
        $methodClassName = $methodConfig["controller"]."Controller";
        //初始化CLASS
        $methodClass = new $methodClassName();
        if(!empty($RequestArray[1])){
            try{
                if(method_exists($methodClass, $RequestArray[1]."Action")){
                    $methodClass -> {$RequestArray[1]."Action"}();
                }else{
                    echo $RequestArray[1] . " Action is not exists";
                    exit();
                }
            }catch(Exception $error){
                echo $RequestArray[1] . " Action is not exists";
                exit();
            }
        }else{
            try{
                //呼叫預設的ACTION
                $methodClass -> {$methodConfig["action"]."Action"}();
            }catch(Exception $error){
                echo "Default Action is not setting!";
                exit();
            }
        }
        // 顯示結果
        $viewContnet = $methodClass->viewContnet;
        foreach ($viewContnet as $key => $content) {
            echo $content;
        }
        exit();
    }
?>