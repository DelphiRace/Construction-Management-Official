<?php
/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2015 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use System_APService\clsSystem;
use SystemCtrl\ctrlSystem;

class PageactionController extends AbstractActionController
{
	//不執行任何動作
	public function indexAction()
    {
		$this->viewContnet['pageContent'] = 'Please Select Your Action and Try Again!';
        return new ViewModel($this->viewContnet);
    }

    public function orginmenuAction(){
    	$VTs = new clsSystem;
		$VTs->initialization();
    	$strSQL = "select uid,nid,parent_layer,class_style,href,click_action from sys_menu ";
    	$strSQL .= "order by sequence,uid asc";
		$data = $VTs->QueryData($strSQL);
		
		$this->viewContnet['pageContent'] = $VTs->Data2Json($data);

        return new ViewModel($this->viewContnet);
    }

	//取得選單
	public function menuprocessAction()
    {
		$VTs = new clsSystem;
		$VTs->initialization();
		try{
		//-----BI開始-----
			$action = array();
			$action["status"] = false;
	        //$action["debug"] = $_POST;
			if(!empty($_POST["menu"])){
				//取得Classroom系統權限
	            
				$data = $_POST["menu"];
				//取得選單
				$cpPath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\menu\\creatParents.html";
				$cPath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\menu\\content.html";
				$oPath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\menu\\otherContent.html";
	            
				$creatParentStyle = $VTs->GetHtmlContent($cpPath);
				$contentStyle = $VTs->GetHtmlContent($cPath);
				$otherContentStyle = $VTs->GetHtmlContent($oPath);
	            
				//$action["menu"] = $data;
				$action["menu"] = $this->CreatMenuContent($data, $creatParentStyle, $contentStyle, $otherContentStyle);
	            //$action["menu"] = $_POST;
				$action["status"] = true;
			}else{
				$action["msg"] = 'Menu Array Error!';
			}
			$pageContent = $VTs->Data2Json($action);
		//-----BI結束-----
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "menuprocessAction", $error->getMessage());
		}
		$VTs = null;
		$this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
    
    //取得帳號權限
    public function acpositionAction(){
        $VTs = new clsSystem;
        $VTs->initialization();
        try{
        //-----BI開始-----
	        $action = array();
	        $action["status"] = true;
	        if(!empty($_SESSION["position"])){
	            $action["position"] = $_SESSION["position"];
	        }else{
	            $action["position"] = 0;
	        }
	        $pageContent = $VTs->Data2Json($action);
        //-----BI結束-----
	    }catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "acpositionAction", $error->getMessage());
		}
        $VTs = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);

    }
    
    //取得帳號資訊(須登入後才可以使用)
    public function acinfoAction(){
    	$SysClass = new ctrlSystem;
    	$SysClass->initialization(null,true);
        try{
        //-----BI開始-----
	        $action = array();
	        $action["status"] = false;
	        // $start_time = microtime(true);
	        if(!empty($_SESSION["uuid"])){
	            $action["uuid"] = $_SESSION["uuid"];
	            $action["userName"] = $_SESSION["userName"];
	            $action["isAdmin"] = $_SESSION["isAdmin"];
	            $action["sysCode"] = $_SESSION["sysCode"];
	            $action["userID"] = $_SESSION["userID"];
	            $action["sysList"] = $_SESSION["sysList"];
	            $action["orgid"] = $_SESSION["orgid"];
	            $action["posid"] = $_SESSION["posid"];
	            $action["isSuperiors"] = $_SESSION["isSuperiors"];
	            $action["sc"] = $_SESSION["sc"];
	            if($_SESSION["isAdmin"]){
	            	// 是管理者就找看看是不是已經有新增過組織
                    $strSQL = "select count(*) as total from ass_org ";
                    $strSQL .= "where sys_code_id = ".$_SESSION["sysCode"];
                    $data = $SysClass->QueryData($strSQL);
                    // 代表有新增過
                    if($data[0]["total"] > 1){
                        $_SESSION["haveOrgs"] = true;
                    }else{
                        $_SESSION["haveOrgs"] = false;
                    }

                    // 是否有新增過部門組織
                    $strSQL = "select count(*) as total from ass_type_office ";
                    $strSQL .= "where sys_code_id = ".$_SESSION["sysCode"];
                    $data = $SysClass->QueryData($strSQL);
                    // 代表有新增過
                    if($data[0]["total"] > 0){
                        $_SESSION["haveOrgUnit"] = true;
                    }else{
                        $_SESSION["haveOrgUnit"] = false;
                    }
                        
                	$action["haveOrgs"] = $_SESSION["haveOrgs"];
                	$action["haveOrgUnit"] = $_SESSION["haveOrgUnit"];
				}
	            // $action["menuPosition"] = $_SESSION["menuPosition"];
	            $action["status"] = true;
	        }else{
	            $action["msg"] = 'Please Login Again!';
	        }
	       	// $end_time = microtime(true);
	       	// $action["times"] = $end_time - $start_time;
	        $pageContent = json_encode($action);
        //-----BI結束-----
	    }catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "acinfoAction", $error->getMessage());
		}
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
        
    }
	
	//產生選單
	private function CreatMenuContent($MenuData, $creatParentStyle, $contentStyle, $otherContentStyle){
		try{
			$tmpMenuStr = '';
			$tmpMenuArr = array();
			//先整理
			foreach($MenuData as $content){
				$tmpMenuArr[$content["parent_layer"]][$content["uid"]] = $content;
			}
			
			//放好第一層級的資料
			foreach($tmpMenuArr[0] as $content){
				
				//這代表還有第二層
				if(!empty($tmpMenuArr[$content["uid"]])){
					$tmpStyle = $creatParentStyle;
					$otherMenuContent = $this->CreatOtherMenuContent($content["uid"], $tmpMenuArr, $creatParentStyle, $otherContentStyle);
					$tmpMenuStr .= $this->replaceMenuOptiuonChar($tmpStyle, $content, $otherMenuContent);
				}else{
					$tmpStyle = $contentStyle;
					$tmpMenuStr .= $this->replaceMenuOptiuonChar($tmpStyle, $content);
				}
				
			}
			
			return $tmpMenuStr;
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "CreatMenuContent", $error->getMessage());
		}
	}
	
	//產生其他子層的選單選單
	private function CreatOtherMenuContent($otherLayerDataIndex, $totalMenuData, $creatParentStyle, $otherContentStyle){
		try{
			$tmpMenuStr = '';
			foreach($totalMenuData[$otherLayerDataIndex] as $content){
				
				//這代表還有第二層
				if(!empty($totalMenuData[$content["uid"]])){
					$tmpStyle = $creatParentStyle;
					//重複建好
					$otherMenuContent = $this->CreatOtherMenuContent($content["uid"], $totalMenuData, $creatParentStyle, $otherContentStyle);
					$tmpMenuStr .= $this->replaceMenuOptiuonChar($tmpStyle, $content, $otherMenuContent);
				}else{
					$tmpStyle = $otherContentStyle;
					$tmpMenuStr .= $this->replaceMenuOptiuonChar($tmpStyle, $content);
				}
				
			}
			
			return $tmpMenuStr;
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "CreatOtherMenuContent", $error->getMessage());
		}
	}
	//取代選單的字
	private function replaceMenuOptiuonChar($tmpStyle, $content, $otherMenuContent=''){
		try{
			$tmpStyle = str_replace("@@nid@@",$content["nid"],$tmpStyle);
			$tmpStyle = str_replace("@@href@@",$content["href"],$tmpStyle);
			
			if($content["click_action"] != ''){
				$tmpStyle = str_replace("@@onclick@@",'onclick = "'.$content["click_action"].'"',$tmpStyle);
			}else{
				$tmpStyle = str_replace("@@onclick@@",'',$tmpStyle);
			}
			
			if($otherMenuContent){
				$tmpStyle = str_replace("@@sonContent@@",$otherMenuContent,$tmpStyle);
			}
			
			if($content["class_style"]){
				$tmpStyle = str_replace("@@class@@",$content["class_style"],$tmpStyle);
			}else{
				$tmpStyle = str_replace("@@class@@","",$tmpStyle);
			}
			
			return $tmpStyle;
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "CreatOtherMenuContent", $error->getMessage());
		}
	}

	public function getlogoAction(){
		$VTs = new clsSystem;
        $VTs->initialization();
        try{
        //-----BI開始-----
	        $action = array();
	        $action["status"] = false;
	        if(!empty($_SESSION["uuid"]) and !empty($_SESSION["userName"])){
	        	$logoPath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\styles\\logo\\logoContent.html";
				$logoStyle = $VTs->GetHtmlContent($logoPath);
				
	            $action["logoString"] = $logoStyle;
	            $action["status"] = true;
	        }else{
	            $action["msg"] = 'Please Login Again!';
	        }
	        $pageContent = $VTs->Data2Json($action);
        //-----BI結束-----
	    }catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "acinfoAction", $error->getMessage());
		}
        $VTs = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
	}
	
}
