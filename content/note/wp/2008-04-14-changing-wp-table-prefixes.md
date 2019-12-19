---
author: Alex
categories:
- PHP
- WordPress
- Main
date: "2008-04-14T00:00:00Z"
tags:
- prefix
- sql
- tables
- wp
title: Changing WP Table prefixes
aliases: [ /blog/2008/04/14/changing-wp-table-prefixes/ ]
outdated: true
---

As a security tip you should always change the default table prefix \"wp_\", mainly to avoid zero-day vulnerabilities (Vulnerabilities that haven\'t been discovered yet), or JavaScript SQL injection.

A very good tool you could use for that purpose is the [WP-Security-Scan][1] plugin, which takes care of all your security problems, including that one.  
The problem is that most of the times it is very hard to get it to change the prefix. Because of that you will have to do it manually.

 [1]: http://semperfiwebdesign.com/plugins/wp-security-scan/

## Changing the table prefix manually

### Step 1

**Backup!** the most important thing of all, backup, backup everything, often and early!

### Step 2

Install the \"[Maintenance mode][3]\" plugin, this way while you change the prefix no one will see errors in your site.

 [3]: http://sw-guide.de/wordpress/plugins/maintenance-mode/

### Step 3

Chose now a very hard prefix, for this example I\'m using **df7s\_23c\_**.  
Change the current prefix in **wp-config.php**, but you shouldn\'t upload it yet.  
Now start changing the table names to the new ones. (I recommend using phpMyAdmin for this, as it will make next step easier)

### Step 4

This is very important!  
There are some rows in your new tables that need to be updated:

1.  Go to the former table wp\_options (Now df7s\_23c_options in the example) and change the following rows (It is recommended to search for \"**%wp_%**\" so that you get a list of the rows to edit): 
    1.  wp\_user\_roles
    2.  wp\_cron\_backup_tables
    3.  wp\_cron\_backup_schedule
    4.  wp\_cron\_backup_recipient
2.  Now go to the former table wp\_usermeta (Now df7s\_23c_usermeta in the example) and change the following rows: 
    1.  wp_capabilities
    2.  wp\_user\_level
    3.  wp\_autosave\_draft_ids

### Finishing

Upload the file `wp-config.php` if you haven\'t done so before, and check to see if it works.  
If it doesn\'t make sure that all of the tables have been correctly renamed, and all the rows listed above. If it doesn\'t work yet there might be some plugins that created a table containing in it\'s rows the wp_ table prefix. If that is the case check all your plugin-created tables to ensure that none of the fields containt the old prefix.

If you still get problems replace your backup and wp-config.php and contact me through the comments of this post and I\'ll try to help you
