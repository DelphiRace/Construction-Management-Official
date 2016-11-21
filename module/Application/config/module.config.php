<?php
/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2015 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

return array(
    'router' => array(
        'routes' => array(
            'home' => array(
                'type' => 'Zend\Mvc\Router\Http\Literal',
                'options' => array(
                    'route'    => '/',
                    'defaults' => array(
                        'controller' => 'Application\Controller\Index',
                        'action'     => 'index',
                    ),
                ),
            ),
            // The following is a route to simplify getting started creating
            // new controllers and actions without needing to create a new
            // module. Simply drop new controllers in, and you can access them
            // using the path /application/:controller/:action
            'application' => array(
                'type'    => 'Literal',
                'options' => array(
                    'route'    => '/application',
                    'defaults' => array(
                        '__NAMESPACE__' => 'Application\Controller',
                        'controller'    => 'Index',
                        'action'        => 'index',
                    ),
                ),
                'may_terminate' => true,
                'child_routes' => array(
                    'default' => array(
                        'type'    => 'Segment',
                        'options' => array(
                            'route'    => '/[:controller[/:action]]',
                            'constraints' => array(
                                'controller' => '[a-zA-Z][a-zA-Z0-9_-]*',
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ),
                            'defaults' => array(
                            ),
                        ),
                    ),
                ),
            ),
			'menter' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/menter[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\Menter',
						'action'     => 'logout',
					),
				),
			),
            	'editorpage' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/editorpage[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\Editorpage',
						'action'     => 'index',
					),
				),
			),
            	'material' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/material[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\material',
						'action'     => 'list',
					),
				),
			),
            'qc' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/qc[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\qc',
						'action'     => 'index',
					),
				),
			),
            'supply' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/supply[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\Supply',
						'action'     => 'index',
					),
				),
			),
            'logbook' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/logbook[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\logbook',
						'action'     => 'index',
					),
				),
			),
			'typeunit' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/typeunit',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\Editorpage',
						'action'     => 'typeunit',
					),
				),
			),
			'Pageaction' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/pageaction[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\Pageaction',
						'action'     => 'index',
					),
				),
			),
			'sar' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/sar[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\sar',
						'action'     => 'index',
					),
				),
			),
			'employeemanage' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/employeemanage[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\employeemanage',
						'action'     => 'index',
					),
				),
			),
			'engineeringmanage' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/engineeringmanage[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\engineeringmanage',
						'action'     => 'index',
					),
				),
			),
			'receipt' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/receipt[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\receipt',
						'action'     => 'index',
					),
				),
			),
			'Oldhouse' => array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/Oldhouse[/:action]',
					'constraints' => array(
						'action' => '[a-zA-Z][a-zA-Z0-9_-]*',
						'id'     => '[0-9]+',
					),
					'defaults' => array(
						'controller' => 'Application\Controller\Oldhouse',
						'action'     => 'index',
					),
				),
			),
			'constructionschedule'=> array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/constructionschedule',
					'defaults' => array(
						'controller' => 'Application\Controller\constructionschedule',
						'action'     => 'index',
					),
				),
			),
			'dailyconstruction'=> array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/dailyconstruction',
					'defaults' => array(
						'controller' => 'Application\Controller\dailyconstruction',
						'action'     => 'index',
					),
				),
			),
			'usermenu'=> array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/usermenu[/:action]',
					'defaults' => array(
						'controller' => 'Application\Controller\Usermenu',
						'action'     => 'index',
					),
				),
			),
			'deletemethod'=> array(
				'type'    => 'segment',
				'options' => array(
					'route'    => '/deletemethod',
					'defaults' => array(
						'controller' => 'Application\Controller\deletemethod',
						'action'     => 'delete',
					),
				),
			),
        ),
    ),
    'service_manager' => array(
        'abstract_factories' => array(
            'Zend\Cache\Service\StorageCacheAbstractServiceFactory',
            'Zend\Log\LoggerAbstractServiceFactory',
        ),
        'factories' => array(
            'translator' => 'Zend\Mvc\Service\TranslatorServiceFactory',
        ),
    ),
    'controllers' => array(
        'invokables' => array(
            'Application\Controller\Index' => 'Application\Controller\IndexController',
            'Application\Controller\Menter' => 'Application\Controller\MenterController',
            'Application\Controller\Pageaction' => 'Application\Controller\PageactionController',
            'Application\Controller\Editorpage' => 'Application\Controller\EditorpageController',
            'Application\Controller\Material' => 'Application\Controller\MaterialController',
            'Application\Controller\QC' => 'Application\Controller\QCController',
            'Application\Controller\SAR' => 'Application\Controller\SARController',
            'Application\Controller\Logbook' => 'Application\Controller\LogbookController',
            'Application\Controller\EmployeeManage' => 'Application\Controller\EmployeeManageController',
            'Application\Controller\EngineeringManage' => 'Application\Controller\EngineeringManageController',
            'Application\Controller\receipt' => 'Application\Controller\receiptController',
            'Application\Controller\Constructionschedule' => 'Application\Controller\ConstructionscheduleController',
            'Application\Controller\Dailyconstruction' => 'Application\Controller\DailyconstructionController',
            'Application\Controller\Supply' => 'Application\Controller\SupplyController',
            'Application\Controller\Oldhouse' => 'Application\Controller\OldhouseController',
            'Application\Controller\Deletemethod' => 'Application\Controller\DeletemethodController',
            'Application\Controller\Usermenu' => 'Application\Controller\UsermenuController',

        ),
    ),
    'view_manager' => array(
        'display_not_found_reason' => true,
        'display_exceptions'       => true,
        'doctype'                  => 'HTML5',
        'not_found_template'       => 'error/404',
        'exception_template'       => 'error/index',
        'template_map' => array(
            'layout/layout'           => __DIR__ . '/../view/layout/layout.phtml',
            'application/index/index' => __DIR__ . '/../view/application/index/index.phtml',
            'error/404'               => __DIR__ . '/../view/error/404.phtml',
            'error/index'             => __DIR__ . '/../view/error/index.phtml',
        ),
        'template_path_stack' => array(
            __DIR__ . '/../view',
        ),
    ),
    // Placeholder for console routes
    'console' => array(
        'router' => array(
            'routes' => array(
            ),
        ),
    ),
);
