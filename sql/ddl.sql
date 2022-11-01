drop schema if exists student_book;
create schema student_book;
use student_book;

create table user
(
    user_id int auto_increment primary key,
    username varchar(45) not null,
    status varchar(45) not null,
    constraint user_id_uindex unique(user_id)
);

INSERT INTO student_book.user (user_id, username, status) VALUES (1, 'morsecodeguy', 'online');
INSERT INTO student_book.user (user_id, username, status) VALUES (2, 'morsecodeguy2', 'online');



create table user_has_friends
(
    uhf int auto_increment primary key,
    user_id int not null,
    friend_id int not null,
    constraint uhf_index unique(uhf),
    constraint fk_fuser_id foreign key (user_id) references user (user_id),
    constraint fk_friend_id foreign key (friend_id) references user (user_id)
);

INSERT INTO student_book.user_has_friends (user_id, friend_id) VALUES (1, 2);
INSERT INTO student_book.user_has_friends (user_id, friend_id) VALUES (2, 1);



create table message
(
    message_id int auto_increment primary key,
    textbody text not null,
    datet timestamp not null,
    sender_id int not null,
    receiver_id int,
    constraint message_id_uindex unique (message_id),
    constraint fk_sender_id foreign key (sender_id) references user (user_id),
    constraint fk_receiver_id foreign key (receiver_id) references user (user_id)

);





INSERT INTO student_book.message (textbody, datet, sender_id, receiver_id) VALUES ('yo bro!', '2022-03-29 16:34:23', 1, 2);
INSERT INTO student_book.message (textbody, datet, sender_id) VALUES ('hey everyone', '2022-03-29 16:34:23', 1);
