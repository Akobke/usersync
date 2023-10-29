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
use OCP\Files\Node;
use OCP\Files\NotFoundException;



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
        $existingUser = $userManager->get($username);
        
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
        }else {
            $currentGroups = $groupManager->getUserGroups($existingUser);
            foreach ($currentGroups as $currentGroup) {
                if (!in_array($currentGroup->getGID(), $groups)) {
                    $currentGroup->removeUser($existingUser);
                }
            }

            foreach ($groups as $groupName) {
                $group = $groupManager->get($groupName);
                if (!$group) {
                    $group = $groupManager->createGroup($groupName);
                }
                $group->addUser($existingUser);

            }

            return new JSONResponse(['status' => 'success']);
        }
        return new JSONResponse(['status' => 'error', 'message' => 'User already exists']);
    }

        /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function removeAllGroups() {
        $groupManager = \OC::$server->getGroupManager();
        $allGroups = $groupManager->search('');

        foreach ($allGroups as $group) {
            $groupId = $group->getGID();
            // Do not remove the 'admin' group
            if ($groupId !== 'admin') {
                $group->delete();
            }
        }

        return new JSONResponse(['status' => 'success']);
    }
        /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function getAllGroups() {
        $groupManager = \OC::$server->getGroupManager();
        $allGroups = $groupManager->search('');

        $groupNames = [];
        foreach ($allGroups as $group) {
            $groupNames[] = $group->getGID();
        }

        return new JSONResponse($groupNames);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function renameGroup($oldGroupName, $newGroupName) {
        $groupManager = \OC::$server->getGroupManager();
        $oldGroup = $groupManager->get($oldGroupName);

        if ($oldGroup) {
            // Check if the new group name already exists
            if (!$groupManager->groupExists($newGroupName)) {
                // Create the new group
                $newGroup = $groupManager->createGroup($newGroupName);

                // Move all users from the old group to the new group
                $usersInOldGroup = $oldGroup->getUsers();
                foreach ($usersInOldGroup as $user) {
                    $newGroup->addUser($user);
                    $oldGroup->removeUser($user);
                }

                // Delete the old group
                $oldGroup->delete();

                return new JSONResponse(['status' => 'success']);
            } else {
                return new JSONResponse(['status' => 'error', 'message' => 'New group name already exists']);
            }
        } else {
            return new JSONResponse(['status' => 'error', 'message' => 'Old group not found']);
        }



}

