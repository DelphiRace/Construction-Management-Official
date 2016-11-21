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

class SupplyController extends AbstractActionController
{
    //不執行任何動作
    public function editorAction()
    {
        $VTs = new clsSystem;
        $VTs->initialization();
      try{
        //-----BI開始-----  
        if(empty($_SESSION)){
            $pagePath = dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\index\\login_page.html";
            $pageContent = $VTs->GetHtmlContent($pagePath);
        }else{  
            //取得html
            $mpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\supply\\editor.html";
            $html=$VTs->GetHtmlContent($mpath);
            $arrdata["userName"]=$_SESSION['userName'];
            $html=$VTs->ContentReplace($arrdata,$html);
            // $html='';    
            $pageContent=$html;
        }
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $VTs->WriteLog("SupplyController", "editorAction", $error->getMessage());
        }
         //關閉資料庫連線
        $VTs->DBClose();
        //釋放
        $VTs = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
    //不執行任何動作
    public function getInfoHtmlAction()
    {
        $VTs = new clsSystem;
        $VTs->initialization();
      try{
        //-----BI開始-----  

            //取得html
            $mpath=dirname(__DIR__) . "\\..\\..\\..\\..\\public\\include\\pageSetting\\supply\\info.html";
            $html=$VTs->GetHtmlContent($mpath);
            // $html='';    
            $pageContent=$html;
        //-----BI結束-----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            $VTs->WriteLog("SupplyController", "getinfohtmlAction", $error->getMessage());
        }
         //關閉資料庫連線
        $VTs->DBClose();
        //釋放
        $VTs = null;
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }

}
