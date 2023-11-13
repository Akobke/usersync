<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Hunter Sanchez <hsanc053@fiu.edu>
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> OCA\usersync\Controller\PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */
return [
	'resources' => [
		'note' => ['url' => '/notes'],
		'note_api' => ['url' => '/api/0.1/notes']
	],
	'routes' => [
		['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
		['name' => 'note_api#preflighted_cors', 'url' => '/api/0.1/{path}',
			'verb' => 'OPTIONS', 'requirements' => ['path' => '.+']],
		['name' => 'page#createUser', 'url' => '/createuser', 'verb' => 'POST'],
		['name' => 'page#get_groups_csv', 'url' => '/get_groups_csv', 'verb' => 'GET'],
        ['name' => 'page#removeAllGroups', 'url' => '/removeallgroups', 'verb' => 'POST'],
		['name' => 'page#removeAllUsers', 'url' => '/removeallusers', 'verb' => 'POST'],
		[
			'name' => 'page#getAllGroups',
			'url' => '/getallgroups',
			'verb' => 'GET'
		],
		[
			'name' => 'page#renameGroup',
			'url' => '/renamegroup',
			'verb' => 'POST'
		],
		[
			'name' => 'page#getUserAuth',
			'url' => '/getuserauth',
			'verb' => 'GET'
		],
		[
		'name' => 'author_api#preflighted_cors',
		'url' => '/api/1.0/{path}',
		'verb' => 'OPTIONS',
		'requirements' => array('path' => '.+')
		]
	]
	
];