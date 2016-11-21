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

class IndexController extends AbstractActionController
{
    public function indexAction()
    {
		$VTs = new clsSystem;
		$VTs->initialization();
		try{
			//-----BI開始-----
			//$HeadTitle = $this->getServiceLocator()->get('ViewHelperManager')->get('HeadTitle');
	        //$VTs->debug($_SESSION);
	        $isLogin = $VTs->CheckLogin();
			//----BI結束----
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("IndexController", "indexAction", $error->getMessage());
		}
		$VTs = null;
		$this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }
}
