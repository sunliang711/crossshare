/* 
    run with command :"mysql -u root cross_share < create.sql" 
*/
drop table if exists `user`;
create table if not exists `user`(
    id int primary key auto_increment,
    user varchar(256) unique not null,
    password varchar(128) not null,
    email varchar(128)
)default charset=utf8;