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

class ReceiptController extends AbstractActionController
{
	public function indexAction()
    {
		$VTs = new clsSystem;
		$VTs->initialization();
		try{
			//-----BI開始-----
			if(empty($_SESSION)){
	            $pagePath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\index\\login_page.html";
	            $pageContent = $VTs->GetHtmlContent($pagePath);
			}else{
				$pagePath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\receipt\\index.html";
				$pageContent = $VTs->GetHtmlContent($pagePath);
				
				$companyTitlePath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\receipt\\companyTitle.html";
				$companyTitle = $VTs->GetHtmlContent($companyTitlePath);
				
				$supplyInfoPath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\receipt\\supplyInfo.html";
				$supplyInfo = $VTs->GetHtmlContent($supplyInfoPath);
				
				$paymentDetialPath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\receipt\\paymentDetial.html";
				$paymentDetial = $VTs->GetHtmlContent($paymentDetialPath);

				$detialListPath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\receipt\\detialList.html";
				$detialList = $VTs->GetHtmlContent($detialListPath);
				
				//一個索引與內容等同一個 >> str_replace("@@userName@@",$_SESSION["userName"],$pageContent);
				$dataArr = [
					"userName"=>$_SESSION["userName"],
					"companyTitle"=>$companyTitle,
					"supplyInfo"=>$supplyInfo,
					"paymentDetial"=>$paymentDetial,
					"detialList"=>$detialList
				];

				//內容取代
				$pageContent = $VTs->ContentReplace($dataArr,$pageContent);
	        }
			//----BI結束----
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("ReceiptController", "indexAction", $error->getMessage());
		}
		$VTs = null;
		$this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
}