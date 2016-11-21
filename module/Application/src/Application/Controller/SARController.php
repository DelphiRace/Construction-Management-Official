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

class SARController extends AbstractActionController
{
	//不執行任何動作
	public function indexAction()
    {
		$this->viewContnet['pageContent'] = 'Please Select Your Action and Try Again!';
        return new ViewModel($this->viewContnet);
    }
	
	//人員出勤表單
	public function SARFormAction()
	{
		//session_start();
		$VTs = new clsSystem;
		$VTs->initialization();
		try{
			//-----BI開始-----  
				if(empty($_SESSION)){
					$pagePath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\index\\login_page.html";
					$pageContent = $VTs->GetHtmlContent($pagePath);
				}else{	
					$mpath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\sar\\index.html";
					$html = $VTs->GetHtmlContent($mpath);
					$infoPath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\sar\\info.html";
					$info = $VTs->GetHtmlContent($infoPath);
					
					$dataArr = ["userName"=>$_SESSION["userName"],
								"info"=>$info];
					$html = $VTs->ContentReplace($dataArr,$html);
					
					$pageContent = $html;
				}
				
			//-----BI結束-----
        }catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("SARController", "SARFormAction", $error->getMessage());	
		}
		//關閉資料庫連線
        $VTs->DBClose();
        
		//釋放
		$VTs = null;
		$this->viewContnet['pageContent'] = $pageContent;
		
        return new ViewModel($this->viewContnet);
	}
	
	//人員出勤報表
	public function SARReportAction()
	{
		//session_start();
		$VTs = new clsSystem;
		$VTs->initialization();
		
		try{
			//-----BI開始-----
				if(empty($_SESSION)){
					$pagePath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\index\\login_page.html";
					$pageContent = $VTs->GetHtmlContent($pagePath);
				}else{	
					$mpath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\sar\\report_index.html";
					$html = $VTs->GetHtmlContent($mpath);
					$reportPath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\sar\\report.html";
					$report = $VTs->GetHtmlContent($reportPath);
					
					$dataArr = ["userName"=>$_SESSION["userName"],
								"report"=>$report];
					$html = $VTs->ContentReplace($dataArr,$html);

					$pageContent = $html;
				}
			//-----BI結束-----
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("SARController", "SARReportAction", $error->getMessage());
		}
        
		//關閉資料庫連線
        $VTs->DBClose();
        
		//釋放
		$VTs = null;
		$this->viewContnet['pageContent'] = $pageContent;
		
        return new ViewModel($this->viewContnet);
	}


}
