--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.24
-- Dumped by pg_dump version 9.6.24

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE test_app; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE test_app IS 'test_app';


--
-- Name: test; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA test;


ALTER SCHEMA test OWNER TO postgres;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: cars; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test.cars (
    id_car bigint NOT NULL,
    car_brand character varying(100),
    color character varying(20),
    id_user bigint
);


ALTER TABLE test.cars OWNER TO postgres;

--
-- Name: TABLE cars; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON TABLE test.cars IS 'Данные о машинах';


--
-- Name: COLUMN cars.id_car; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.cars.id_car IS 'id записи';


--
-- Name: COLUMN cars.car_brand; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.cars.car_brand IS 'Марка машины';


--
-- Name: COLUMN cars.color; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.cars.color IS 'Цвет машины';


--
-- Name: COLUMN cars.id_user; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.cars.id_user IS 'Пользователь - владелец машины';


--
-- Name: cities; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test.cities (
    id_city bigint NOT NULL,
    city_name character varying(100)
);


ALTER TABLE test.cities OWNER TO postgres;

--
-- Name: TABLE cities; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON TABLE test.cities IS 'Информация о городах';


--
-- Name: COLUMN cities.id_city; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.cities.id_city IS 'id записи';


--
-- Name: COLUMN cities.city_name; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.cities.city_name IS 'Наименование города';


--
-- Name: education; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test.education (
    id_grade bigint NOT NULL,
    grade character varying(100)
);


ALTER TABLE test.education OWNER TO postgres;

--
-- Name: TABLE education; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON TABLE test.education IS 'Ступени образования';


--
-- Name: COLUMN education.id_grade; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.education.id_grade IS 'id записи';


--
-- Name: COLUMN education.grade; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.education.grade IS 'Наименование оконченной ступени образования';


--
-- Name: logins; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test.logins (
    id bigint NOT NULL,
    login character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    id_role integer
);


ALTER TABLE test.logins OWNER TO postgres;

--
-- Name: TABLE logins; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON TABLE test.logins IS 'Логины и пароли';


--
-- Name: COLUMN logins.id; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.logins.id IS 'id записи';


--
-- Name: COLUMN logins.login; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.logins.login IS 'Логин';


--
-- Name: COLUMN logins.password; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.logins.password IS 'Пароль';


--
-- Name: COLUMN logins.id_role; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.logins.id_role IS 'Роль учетной записи';


--
-- Name: roles; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test.roles (
    id_role integer NOT NULL,
    role character varying(100),
    description character varying(200)
);


ALTER TABLE test.roles OWNER TO postgres;

--
-- Name: COLUMN roles.id_role; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.roles.id_role IS 'id записи';


--
-- Name: COLUMN roles.role; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.roles.role IS 'Роль учетной записи (разрешенные действия)';


--
-- Name: COLUMN roles.description; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.roles.description IS 'Описание прав работы с программой для данной роли';


--
-- Name: user_cities; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test.user_cities (
    id bigint NOT NULL,
    id_user bigint NOT NULL,
    id_city bigint NOT NULL
);


ALTER TABLE test.user_cities OWNER TO postgres;

--
-- Name: TABLE user_cities; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON TABLE test.user_cities IS 'Связь пользователей с городами';


--
-- Name: COLUMN user_cities.id; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.user_cities.id IS 'id записи';


--
-- Name: COLUMN user_cities.id_user; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.user_cities.id_user IS 'id пользователя';


--
-- Name: COLUMN user_cities.id_city; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.user_cities.id_city IS 'id города';


--
-- Name: users; Type: TABLE; Schema: test; Owner: postgres
--

CREATE TABLE test.users (
    id_user bigint NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    id_grade bigint DEFAULT 0,
    birthday date,
    has_car boolean
);


ALTER TABLE test.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON TABLE test.users IS 'Данные о пользователях';


--
-- Name: COLUMN users.id_user; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.users.id_user IS 'id записи';


--
-- Name: COLUMN users.first_name; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.users.first_name IS 'Имя пользователя';


--
-- Name: COLUMN users.last_name; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.users.last_name IS 'Фамилия пользователя';


--
-- Name: COLUMN users.id_grade; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.users.id_grade IS 'id оконченной ступени образования пользователя';


--
-- Name: COLUMN users.birthday; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.users.birthday IS 'Дата рождения';


--
-- Name: COLUMN users.has_car; Type: COMMENT; Schema: test; Owner: postgres
--

COMMENT ON COLUMN test.users.has_car IS 'Наличие машины (да/нет)';


--
-- Data for Name: cars; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test.cars (id_car, car_brand, color, id_user) FROM stdin;
1	Lexus	gold	3
9	new_color	new_color	12
11	new_car	new_color	21
12	Cadillac	silver	16
13	Porsche	black	7
14	Opel	white	18
15	new_car	new_color	23
16	Opel	black	13
17	Cadillac	pink	9
\.


--
-- Data for Name: cities; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test.cities (id_city, city_name) FROM stdin;
1	Moscow
2	London
3	Paris
4	New York
5	Dublin
6	Canberra
7	Dubai
8	Astana
9	Capetown
10	Mexico
11	Beijing
12	Lisboa
13	Manila
14	Brasilia
15	Quebec
16	Barselona
17	Edinburgh
18	Hamburg
20	Ottawa
21	Rotterdam
22	San Diego
23	Tokyo
24	Washington
25	Vienna
26	Frankfurt am Main
27	Istanbul
19	Jakarta
28	Yokohama
29	Zagreb
30	Antwerpen
\.


--
-- Data for Name: education; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test.education (id_grade, grade) FROM stdin;
1	Среднее образование
2	Бакалавр
4	Специалист
5	Средне-специальное образование
6	Кандидат наук
0	Без образования
7	Доктор наук
3	Магистр
\.


--
-- Data for Name: logins; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test.logins (id, login, password, first_name, last_name, id_role) FROM stdin;
1	admin	12345678	Admin	\N	1
2	editor	222222	Editor	\N	2
3	user	111111	User		3
4	Lucifer	0000	Lucifer	Morningstar	3
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test.roles (id_role, role, description) FROM stdin;
3	user	Может редактировать только данные основной формы
2	editor	Может редактировать данные основной формы и наполнение выпадающих списков
1	admin	Полный доступ ко всем функциям, редактирование учетных записей
\.


--
-- Data for Name: user_cities; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test.user_cities (id, id_user, id_city) FROM stdin;
1	1	1
2	1	10
6	3	2
7	3	8
8	4	15
9	5	5
10	5	9
11	5	3
27	12	8
30	13	5
31	13	13
32	13	15
36	15	11
39	7	14
40	7	7
41	7	2
42	7	10
43	9	6
44	9	5
45	9	2
46	16	14
47	16	6
48	16	10
49	17	6
50	18	7
51	18	4
53	20	6
54	20	5
55	21	5
56	21	12
62	19	6
64	23	12
65	23	10
66	22	11
67	22	13
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test.users (id_user, first_name, last_name, id_grade, birthday, has_car) FROM stdin;
1	John	Carter	1	\N	f
23	John	Barney	5	2004-11-19	t
22	Marge	Lawrens	5	2002-05-05	f
3	Mattew	Connor	4	\N	t
21	Matilda	Vans	3	\N	t
12	Angela	Linney	4	\N	t
13	Laura	Jefferson	0	\N	t
19	Anna	Asti	0	1997-07-15	f
17	Lewis	Roberts	7	1987-07-27	f
4	David	Nolan	5	1991-05-16	f
9	Nina	Ricci	7	\N	t
20	Sabina	Evans	1	\N	f
5	Anna	Daniels	6	1971-04-13	f
16	Monica	Andrews	4	1967-07-25	t
15	Lisa	Avery	2	\N	f
7	Rosa	Simpson	3	\N	t
18	Donald	Trump	4	1958-07-26	t
\.


--
-- Name: cars cars_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.cars
    ADD CONSTRAINT cars_pkey PRIMARY KEY (id_car);


--
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id_city);


--
-- Name: education education_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.education
    ADD CONSTRAINT education_pkey PRIMARY KEY (id_grade);


--
-- Name: logins logins_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.logins
    ADD CONSTRAINT logins_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_role);


--
-- Name: user_cities user_cities_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.user_cities
    ADD CONSTRAINT user_cities_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id_user);


--
-- Name: fki_fkey_logins_roles; Type: INDEX; Schema: test; Owner: postgres
--

CREATE INDEX fki_fkey_logins_roles ON test.logins USING btree (id_role);


--
-- Name: cars cars_id_user_fkey; Type: FK CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.cars
    ADD CONSTRAINT cars_id_user_fkey FOREIGN KEY (id_user) REFERENCES test.users(id_user) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: logins fkey_logins_roles; Type: FK CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.logins
    ADD CONSTRAINT fkey_logins_roles FOREIGN KEY (id_role) REFERENCES test.roles(id_role);


--
-- Name: user_cities user_cities_id_city_fkey; Type: FK CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.user_cities
    ADD CONSTRAINT user_cities_id_city_fkey FOREIGN KEY (id_city) REFERENCES test.cities(id_city) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_cities user_cities_id_user_fkey; Type: FK CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.user_cities
    ADD CONSTRAINT user_cities_id_user_fkey FOREIGN KEY (id_user) REFERENCES test.users(id_user) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: users users_id_grade_fkey; Type: FK CONSTRAINT; Schema: test; Owner: postgres
--

ALTER TABLE ONLY test.users
    ADD CONSTRAINT users_id_grade_fkey FOREIGN KEY (id_grade) REFERENCES test.education(id_grade) ON UPDATE SET DEFAULT ON DELETE SET DEFAULT;


--
-- PostgreSQL database dump complete
--

