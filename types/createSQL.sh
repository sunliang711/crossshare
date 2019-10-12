#!/bin/bash
rpath="$(readlink ${BASH_SOURCE})"
if [ -z "$rpath" ];then
    rpath=${BASH_SOURCE}
fi
root="$(cd $(dirname $rpath) && pwd)"
cd "$root"
shellHeaderLink='https://pic711.oss-cn-shanghai.aliyuncs.com/sh/shell-header.sh'
if [ -e /etc/shell-header.sh ];then
    source /etc/shell-header.sh
else
    (cd /tmp && wget -q "$shellHeaderLink") && source /tmp/shell-header.sh
fi
# write your code below

DB=cross_share

usePass=0
user=root
while getopts ":hpu:" opt;do
    case $opt in
        p)
            usePass=1
            echo "Use password."
            ;;
        u)
            user=$OPTARG
            ;;
        h)
            echo "Usage: $(basename $0) [-p] \"use password\" [-u] some_user(default: root)"
            exit 1
            ;;
    esac
done
echo "user: $user"

options="-u $user"
if [ $usePass -eq 1 ];then
    options="$options -p"
fi

echo "delete database $DB..."
mysqladmin $options drop $DB

echo "create database $DB..."
mysqladmin $options create $DB

echo "create tables..."
mysql $options $DB < create.sql