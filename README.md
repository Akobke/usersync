# UserSync
## Easy Nextcloud user management

UserSync is the easiest way to manage and sync users in CSV format.

With CSV files generated from Canvas, PantherSoft, and personal Capstone roster files, we can create, modify, and update users and groups based on updated CSV data.

## Table Of Contents
Click on a link to jump to the section of interest
- [Developers](#Developers)
- [Instalation](#Instalation)
- [Usage](#Usage)
- [Limitations](#Limitations)

## Developers
This application was developed for CIS4951 final project under the leadership of Prof. Masoud Sadjadi

Lead Developer - [Hunter Sanchez](https://github.com/hunters21)
Developer - [Adam Kobke](https://github.com/akobke)
Developer - [Augusto Rodriguez](https://github.com/August0Rod)

## Instalation
The installation of UserSync is quite simple if you follow the steps provided

1. SSH Into the server that is running Nextcloud. This can be done in the MacOS terminal, Windows Powershell, or external programs such as PuTTy. Then cd into the directory hosting nextcloud. This directory should be called something like ```Nextcloud-docker-dev```
2. Once in the directory the file structure should look something like this 
  !["Image showing file structure"](https://cdn.discordapp.com/attachments/675814289176657940/1170077095100166164/6YvxN8Qh.png?ex=6557ba36&is=65454536&hm=648f95f1e2302ca8e029bb70a83ac984ad838c93decf9b191e4e54fe3e00eb73&) 
3. Next cd into the application files for Nextcloud. These should be located at ```.../Nextcloud-docker-dev/workspace/server/apps-extra``` . This is the directory that Nextcloud stores your applications at.
4. In the apps-extra directory run the command ```git clone https://github.com/Akobke/usersync.git``` to download the application to the server
5. cd into the now created usersync folder and run the following command ```npm i``` This will install all of the required dependencies to run the application
#### In Nextcloud configuration
In this section we will go over the configuration required in your nextcloud instance
1. First navigate to your files application and create a new file named ```UserSyncConfig```. This name is !!**CASE SENSITIVE**!!. In this file you can upload your group name mappings, and a plain .txt file with your group prefix, examples of which will be provided in the [usage](#usage) section.
2. Now press on your user icon in the top right of the page and navigate to apps 
!["User and apps"](https://cdn.discordapp.com/attachments/675814289176657940/1170079903715184744/image.png?ex=6557bcd4&is=654547d4&hm=8e85b392a9714285f92e4f01ad1095a100c6960d10c35f1b14b4145758d8aff4& )
3. Inside of apps, navigate to the UserSync option and click on it, a options window should open on the right
4. Locate the field that says ```Limit to groups```, and select which groups you would like to access the app. We recomend only administrators or highly trusted individuals

## Usage
#### Setting Defaults
The usage of UserSync is quite straight forward, if you dont already have your desired group mappings you can get example mappings [here](https://cdn.discordapp.com/attachments/675814289176657940/1170081928121155645/groupmapping.csv?ex=6557beb6&is=654549b6&hm=4f91d0688a9ce04a199d43d46528c28b8aa98e6defc1da1d9e16bb7dceff04a7&)
If you dont have any mappings that is fine, you can upload a one time mapping in the application. 
To upload your mappings for default use, simply navigate to your ```UserSyncConfig``` file and upload your mappings **Be sure to rename your mappings to ```groupmapping.csv```.**
For your group prefix, once again you can change this on a case by case basis in the user interface of the application, or you can upload a default prefix in the ```UserSyncConfig``` file and name it to ```groupprefix.txt```

For the group CSV, it follows a simple format (fake data)
|Course|-|Group|SID|Username|First Name|Middle Name|Last Name||Groups|
|--------|-|---|-------|--------|--------|------|----|-|----------------------------------|
|cis:4951|1|u01|6256456|msje056|John|William|Smith||engineering - computer science - bs|
|cis:4951|1|u01|6304986|jfkwe206|Sarah|Houghs|Robins||engineering - computer science - bs|
|cis:4951|1|u01|609483|lakej676|Robert|Downy|Junior||engineering - computer science - bs/mathematics - mn|

Groups are seperated with the ```/``` as a delimitor

#### Application Fields
![](https://cdn.discordapp.com/attachments/675814289176657940/1170083435390439504/image.png?ex=6557c01e&is=65454b1e&hm=ce7003c1e827c3edfe0febc7e8b7624f89b628ea4b80aff63d77878298c4ab19&)
In the application you can see a few fields, all of which I will explain
- Group Prefix
    This field is where you define the group prefix if you would like to override the default you specify in ```UserSyncConfig```
- Group Mapping CSV
    This is where you would upload your group mapping CSV. These can either be uploaded localy, or uploaded and accessed through NextCloud
- Input File Source
    This is where you define the formatting of the CSV file, the options currently supported are
    - Default (custom to our CIS course)
    - Canvas
    - PantherSoft
    - Cap2 Groups (custom to our CIS course)
- CSV Upload
    This is where you upload the CSV containing the user data
#### Application Usage
Using the application if both defaults are provided is simple
    1. Upload the CSV with the Local CSV Upload button (or Nextcloud CSV Upload), and wait for the users to be created (up to 5 minutes for large groups > 700)
- To use a custom prefix, simply specify the prefix in the ```Group Prefix``` field
- To use custom mappings, simply local upload, or choose a file from nextcloud, and press the ```Load Mappings``` button
- If you dont provide any custom mappings, or prefix, the group names are going to be exactly as they are displayed in the original CSV file
- If you would like to simply update user groups or information, simply upload a new user CSV file
- If you would like to rename groups, simply reupload a new mappings CSV and press ```Load Mappings```

## Limitations
Unfortunately this application has a few limitations that I would like to adress
First and foremost, if you are not Prof. Masoud Sadjadi, this application is likely of no use to you.

#### Group prefixes
- Group Prefixes are required to be 4 characters long, for example FA23 (fall 2023) SM23 (Summer 2023) or SP23 (Spring 2023) You can figure out any other creative use of 4 character long prefixes
#### Group Renaming
- Any groups that are created by UserSync can not be renamed if you would like to maintain the ability to remap them at a later date. This is due to how NextCloud handles groups and was not really up to us.
#### Auto Mapping Uploading
- Auto Mapping uploading unfortunately won't be a feature. Due to how WebDav and Nextcloud handle same origin HTTP requests this simply was not feasable to do without a proxy server
#### Default User Passwords
- Users created with UserSync will have the default password of ```password``` and are able to keep the default password without changing it. This can be a security issue, and it is **STRONGLY** urged to make your users chage their passwords as soon as they log in

