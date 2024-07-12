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
    id_grade bigint DEFAULT 0
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
\.


--
-- Data for Name: education; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test.education (id_grade, grade) FROM stdin;
1	Среднее образование
2	Бакалавр
3	Магистр
4	Специалист
5	Средне-специальное образование
6	Кандидат наук
7	Доктор наук
0	Без образования
\.


--
-- Data for Name: user_cities; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test.user_cities (id, id_user, id_city) FROM stdin;
1	1	1
2	1	10
3	2	3
4	2	8
5	2	11
6	3	2
7	3	8
8	4	15
9	5	5
10	5	9
11	5	3
12	6	12
13	7	13
14	7	14
15	8	6
16	8	3
17	8	7
18	9	1
19	9	11
20	9	15
21	10	8
22	10	5
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: test; Owner: postgres
--

COPY test.users (id_user, first_name, last_name, id_grade) FROM stdin;
1	John	Smith	1
4	David	Nolan	1
2	Steven	Robertson	2
3	Mattew	Connor	3
6	Matilda	Vane	5
5	Anna	Daniels	6
9	Nina	Ricci	7
7	Julia	Simpson	2
10	Samantha	Page	4
8	Laura	Palmers	0
\.


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

