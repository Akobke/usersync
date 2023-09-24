<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Hunter Sanchez <hsanc053@fiu.edu>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\usersync\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\TemplateResponse;
use OCA\usersync\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Util;

class PageController extends Controller {

    public function __construct($AppName, IRequest $request){
        parent::__construct($AppName, $request);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index() {
        $response = new TemplateResponse('usersync', 'main'); // templates/main.php
        $response->setContentSecurityPolicy($this->getContentSecurityPolicy());
        Util::addScript('usersync', 'script'); // js/script.js
        Util::addStyle('usersync', 'styles');  // css/styles.css
        return $response;
    }

    private function getContentSecurityPolicy() {
        $csp = new \OCP\AppFramework\Http\ContentSecurityPolicy();
        // Adjust your CSP if needed
        return $csp;
    }
    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function createUser($username, $password, $displayName, $email, $groups) {
        $userManager = \OC::$server->getUserManager();
        $groupManager = \OC::$server->getGroupManager();

        if (!$userManager->userExists($username)) {
            $user = $userManager->createUser($username, $password);
            $user->setDisplayName($displayName);
            $user->setEMailAddress($email);

            foreach ($groups as $groupName) {
                $group = $groupManager->get($groupName);
                if (!$group) {
                    $group = $groupManager->createGroup($groupName);
                }
                $group->addUser($user);
            }

            return new JSONResponse(['status' => 'success']);
        }

        return new JSONResponse(['status' => 'error', 'message' => 'User already exists']);
    }

}
