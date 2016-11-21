<?php
	@session_start();
    $System_APServicePath = __DIR__ . '\\System_APService\\System_APService.php';
    $SystemCtrlPath = __DIR__ . '\\SystemCtrl\\SystemCtrl.php';
    if(!file_exists($System_APServicePath)){
        $System_APServicePath = __DIR__ . '/System_APService/System_APService.php';
        $SystemCtrlPath = __DIR__ . '/SystemCtrl/SystemCtrl.php';
    }
	include($System_APServicePath);
	include($SystemCtrlPath);
?>