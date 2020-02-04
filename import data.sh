#!/bin/bash
if [ "$1" == "-p" ];then
    opt="-p"
fi
db="cross_share"
mysqladmin -u root "$opt" create "$db"
mysql -u root "$opt" "$db" < mysql_data.dump