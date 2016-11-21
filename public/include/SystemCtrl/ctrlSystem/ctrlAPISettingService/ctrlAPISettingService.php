<?php		
	namespace ctrlAPISettingService;
	
	
	class ctrlAPISetting {
		#取得API設定檔
		public function GetAPIUrl($iniIndex, $original){
			$SysClass = new \ctrlToolsService\ctrlTools;
			$strIniFile = dirname(__DIR__) . "\\..\\..\\..\\..\\config\\apiServer.ini";
            //開啟ＡＰＩ設定檔
            $APIConfing = $SysClass->GetINIInfo($strIniFile,null,"server",'',true);
            if(!$original){
            	if($iniIndex){
            		return $APIConfing[$iniIndex];
				}else{
		            return $APIConfing;

				}
            }else{
	            return $APIConfing;
            }
		}
	}
?>