--
-- PostgreSQL database dump
--

\restrict L5WaVrSlExZicPhGIooWATNfYwhu6LD39W6vxhNYyLQrbdr4nRUpGwf7bmPchLJ

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart (
    id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    user_id integer
);


--
-- Name: cart_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.cart_id_seq OWNED BY public.cart.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    parent_id integer
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id bigint NOT NULL,
    invoice_id bigint NOT NULL,
    product_id bigint,
    seller_id integer,
    product_title text NOT NULL,
    product_sku text,
    seller_business_name text,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    line_total numeric(12,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT invoice_items_line_total_check CHECK ((line_total = ((quantity)::numeric * unit_price))),
    CONSTRAINT invoice_items_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT invoice_items_unit_price_check CHECK ((unit_price >= (0)::numeric))
);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoice_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invoice_items_id_seq OWNED BY public.invoice_items.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id bigint NOT NULL,
    invoice_number text NOT NULL,
    order_id integer NOT NULL,
    buyer_id integer NOT NULL,
    currency character(3) DEFAULT 'USD'::bpchar NOT NULL,
    subtotal_amount numeric(12,2) NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) NOT NULL,
    issued_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    stripe_invoice_id text,
    stripe_customer_id text,
    stripe_payment_intent_id text,
    CONSTRAINT invoices_amounts_nonnegative_check CHECK (((subtotal_amount >= (0)::numeric) AND (tax_amount >= (0)::numeric) AND (discount_amount >= (0)::numeric) AND (total_amount >= (0)::numeric))),
    CONSTRAINT invoices_currency_format_check CHECK ((currency ~ '^[A-Z]{3}$'::text)),
    CONSTRAINT invoices_total_amount_check CHECK ((total_amount = ((subtotal_amount + tax_amount) - discount_amount)))
);


--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    stripe_transfer_id text
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: order_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_transfers (
    id integer NOT NULL,
    order_id integer NOT NULL,
    seller_id integer NOT NULL,
    stripe_account_id character varying(255) NOT NULL,
    gross_amount numeric(12,2) DEFAULT 0 NOT NULL,
    commission_amount numeric(12,2) DEFAULT 0 NOT NULL,
    seller_amount numeric(12,2) DEFAULT 0 NOT NULL,
    stripe_transfer_id character varying(255),
    transfer_status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: order_transfers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_transfers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_transfers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_transfers_id_seq OWNED BY public.order_transfers.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(30) DEFAULT 'Pending'::character varying,
    user_id integer,
    stripe_session_id character varying(255),
    payment_status character varying(30) DEFAULT 'pending'::character varying,
    stripe_transfer_id character varying(255),
    transfer_status character varying(50) DEFAULT 'pending'::character varying,
    commission_amount numeric(12,2) DEFAULT 0,
    seller_amount numeric(12,2) DEFAULT 0,
    platform_amount numeric(12,2) DEFAULT 0,
    stripe_payment_intent_id character varying(255),
    stripe_customer_id text
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: product_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_image (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image text NOT NULL
);


--
-- Name: product_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.product_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: product_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.product_image_id_seq OWNED BY public.product_image.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id bigint NOT NULL,
    title text NOT NULL,
    price numeric NOT NULL,
    description text,
    category text,
    image text,
    rating numeric,
    category_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    seller_id integer,
    approval_status character varying(20) DEFAULT 'approved'::character varying,
    stock integer DEFAULT 0 NOT NULL,
    CONSTRAINT products_approval_status_check CHECK (((approval_status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: refund_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refund_requests (
    id integer NOT NULL,
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    reason text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    stripe_refund_id character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approver_type character varying(20),
    approver_id integer,
    approved_at timestamp without time zone,
    rejected_at timestamp without time zone
);


--
-- Name: refund_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refund_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refund_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refund_requests_id_seq OWNED BY public.refund_requests.id;


--
-- Name: seller_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seller_applications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    business_name character varying(150) NOT NULL,
    phone character varying(30),
    description text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    admin_note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT seller_applications_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: seller_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seller_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seller_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.seller_applications_id_seq OWNED BY public.seller_applications.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password text NOT NULL,
    role character varying(20) DEFAULT 'customer'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reset_password_token text,
    reset_password_expires timestamp without time zone,
    stripe_account_id text,
    stripe_account_status character varying(30) DEFAULT 'not_connected'::character varying,
    stripe_onboarding_complete boolean DEFAULT false,
    stripe_customer_id character varying(255)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: cart id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart ALTER COLUMN id SET DEFAULT nextval('public.cart_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: invoice_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items ALTER COLUMN id SET DEFAULT nextval('public.invoice_items_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: order_transfers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_transfers ALTER COLUMN id SET DEFAULT nextval('public.order_transfers_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: product_image id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_image ALTER COLUMN id SET DEFAULT nextval('public.product_image_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: refund_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund_requests ALTER COLUMN id SET DEFAULT nextval('public.refund_requests_id_seq'::regclass);


--
-- Name: seller_applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_applications ALTER COLUMN id SET DEFAULT nextval('public.seller_applications_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart (id, product_id, quantity, user_id) FROM stdin;
37	44	1	9
38	41	1	9
60	73	1	15
61	36	1	15
26	33	1	6
27	36	1	6
29	33	11	7
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, parent_id) FROM stdin;
7	Electronics	\N
8	Clothing	\N
9	Books	\N
10	Mobile	\N
12	Flowers	\N
13	Android	10
14	iPhone	10
15	Samsung	13
17	Infinix	13
18	Girls Clothing	8
19	Boys Clothing	8
20	Google Pixel	13
22	vivo	13
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoice_items (id, invoice_id, product_id, seller_id, product_title, product_sku, seller_business_name, quantity, unit_price, line_total, created_at) FROM stdin;
1	1	78	10	ADAPTOR 2	\N	Waleed Electronics	1	10.00	10.00	2026-08-29 15:40:01.373095
2	2	88	\N	Fresh Red Roses Bouquet with Green Leaves – Elegant White Paper Wrapping	\N	\N	1	45.00	45.00	2026-08-29 16:06:50.122613
3	2	78	10	ADAPTOR 2	\N	Waleed Electronics	1	10.00	10.00	2026-08-29 16:06:50.122613
4	2	81	13	testing adaptor	\N	flowers 	1	6.00	6.00	2026-08-29 16:06:50.122613
5	3	86	\N	iPhone 11	\N	\N	1	345.00	345.00	2026-09-01 12:48:28.39732
6	4	78	10	ADAPTOR 2	\N	Waleed Electronics	1	10.00	10.00	2026-09-01 13:40:08.01344
7	5	90	11	Infinix Hot 11	\N	waleeed electronics 	1	12.00	12.00	2026-09-01 15:03:06.26453
8	6	90	11	Infinix Hot 11	\N	waleeed electronics 	1	12.00	12.00	2026-09-01 15:35:59.122436
9	7	78	10	ADAPTOR 2	\N	Waleed Electronics	1	10.00	10.00	2026-09-01 16:11:32.003348
10	8	81	13	testing adaptor	\N	flowers 	1	6.00	6.00	2026-09-02 11:30:31.59575
11	9	78	10	ADAPTOR 2	\N	Waleed Electronics	1	10.00	10.00	2026-09-02 12:42:26.098721
12	10	90	11	Infinix Hot 11	\N	waleeed electronics 	1	12.00	12.00	2026-09-02 12:47:01.57982
13	11	78	10	ADAPTOR 2	\N	Waleed Electronics	1	7.00	7.00	2026-09-02 15:29:04.770956
14	12	95	10	Tv	\N	Waleed Electronics	1	3.00	3.00	2026-09-03 11:31:59.511264
15	12	94	10	Pc screen	\N	Waleed Electronics	1	13.00	13.00	2026-09-03 11:31:59.511264
16	13	95	10	Tv	\N	Waleed Electronics	2	3.00	6.00	2026-09-03 11:39:05.07369
17	14	95	10	Tv	\N	Waleed Electronics	1	3.00	3.00	2026-09-03 11:48:34.649922
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.invoices (id, invoice_number, order_id, buyer_id, currency, subtotal_amount, tax_amount, discount_amount, total_amount, issued_at, created_at, stripe_invoice_id, stripe_customer_id, stripe_payment_intent_id) FROM stdin;
1	INV-0000000055	55	16	USD	10.00	0.00	0.00	10.00	2026-08-29 15:40:01.373095	2026-08-29 15:40:01.373095	\N	\N	\N
2	INV-0000000056	56	16	USD	61.00	0.00	0.00	61.00	2026-08-29 16:06:50.122613	2026-08-29 16:06:50.122613	\N	\N	\N
3	INV-0000000057	57	12	USD	345.00	0.00	0.00	345.00	2026-09-01 12:48:28.39732	2026-09-01 12:48:28.39732	\N	\N	\N
4	INV-0000000058	58	16	USD	10.00	0.00	0.00	10.00	2026-09-01 13:40:08.01344	2026-09-01 13:40:08.01344	\N	cus_VB9XbdP0Pw0iIP	pi_3UAnEjHRTOeebi8n1EIPAqqq
5	INV-0000000059	59	16	USD	12.00	0.00	0.00	12.00	2026-09-01 15:03:06.26453	2026-09-01 15:03:06.26453	\N	cus_VB9XbdP0Pw0iIP	pi_3UAoX1HRTOeebi8n09vbAfCS
6	INV-0000000060	60	16	USD	12.00	0.00	0.00	12.00	2026-09-01 15:35:59.122436	2026-09-01 15:35:59.122436	\N	cus_VB9XbdP0Pw0iIP	pi_3UAp2qHRTOeebi8n1nxn09Fa
7	INV-0000000061	61	16	USD	10.00	0.00	0.00	10.00	2026-09-01 16:11:32.003348	2026-09-01 16:11:32.003348	\N	cus_VB9XbdP0Pw0iIP	pi_3UApbAHRTOeebi8n0cHE0hCS
8	INV-0000000063	63	17	USD	6.00	0.00	0.00	6.00	2026-09-02 11:30:31.59575	2026-09-02 11:30:31.59575	\N	cus_VBUfp8RjEKBMsm	pi_3UB7gkHRTOeebi8n1X8Ot0zk
9	INV-0000000065	65	16	USD	10.00	0.00	0.00	10.00	2026-09-02 12:42:26.098721	2026-09-02 12:42:26.098721	\N	cus_VB9XbdP0Pw0iIP	pi_3UB8oLHRTOeebi8n0UFnPybr
10	INV-0000000066	66	16	USD	12.00	0.00	0.00	12.00	2026-09-02 12:47:01.57982	2026-09-02 12:47:01.57982	\N	cus_VB9XbdP0Pw0iIP	pi_3UB8snHRTOeebi8n0YXh0gsS
11	INV-0000000067	67	16	USD	7.00	0.00	0.00	7.00	2026-09-02 15:29:04.770956	2026-09-02 15:29:04.770956	\N	cus_VB9XbdP0Pw0iIP	pi_3UBBPaHRTOeebi8n03RX87As
12	INV-0000000074	74	16	USD	16.00	0.00	0.00	16.00	2026-09-03 11:31:59.511264	2026-09-03 11:31:59.511264	\N	cus_VB9XbdP0Pw0iIP	pi_3UBUBjHRTOeebi8n1PNOSUbs
13	INV-0000000076	76	16	USD	6.00	0.00	0.00	6.00	2026-09-03 11:39:05.07369	2026-09-03 11:39:05.07369	\N	cus_VB9XbdP0Pw0iIP	pi_3UBUIbHRTOeebi8n0csSahQH
14	INV-0000000078	78	16	USD	3.00	0.00	0.00	3.00	2026-09-03 11:48:34.649922	2026-09-03 11:48:34.649922	\N	cus_VB9XbdP0Pw0iIP	pi_3UBURlHRTOeebi8n0Bd23M7k
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, quantity, price, stripe_transfer_id) FROM stdin;
8	5	32	1	34000.00	\N
9	5	33	1	34000.00	\N
10	6	33	1	34000.00	\N
11	7	33	1	34000.00	\N
12	7	36	1	2500.00	\N
13	7	34	1	56000.00	\N
14	8	33	3	34000.00	\N
15	9	32	1	34000.00	\N
16	9	36	1	2500.00	\N
17	9	38	1	2500.00	\N
18	9	41	1	2500.00	\N
19	9	34	1	56000.00	\N
20	9	33	20	5555.00	\N
21	10	32	1	35000.00	\N
22	10	42	1	1200.00	\N
23	11	78	1	44233.00	\N
24	12	78	1	44233.00	\N
25	13	75	1	35667.00	\N
26	13	79	1	2222.00	\N
27	14	80	1	455.00	\N
28	15	79	1	2222.00	\N
29	16	66	1	1149995.00	\N
30	17	36	1	55000.00	\N
31	17	32	1	35000.00	\N
32	17	79	1	2222.00	\N
33	18	79	6	2222.00	\N
34	19	79	6	2222.00	\N
35	20	79	6	2222.00	\N
36	21	79	1	2222.00	\N
37	22	32	1	35000.00	\N
38	22	79	1	2222.00	\N
39	23	79	3	2222.00	\N
40	24	33	2	547.00	\N
41	24	79	3	2222.00	\N
42	25	33	2	547.00	\N
43	25	79	3	2222.00	\N
44	26	69	1	2299987.00	\N
45	27	33	1	547.00	\N
46	28	33	1	547.00	\N
47	29	33	1	547.00	\N
48	30	32	1	35000.00	\N
49	31	73	1	160.00	\N
50	32	36	1	55000.00	\N
51	32	73	1	160.00	\N
52	33	81	1	4500.00	\N
53	34	32	1	35000.00	\N
54	34	81	1	4500.00	\N
55	35	36	1	55000.00	\N
56	36	79	1	2222.00	\N
57	37	33	1	547.00	\N
58	37	79	1	2222.00	\N
59	38	75	1	34964.00	\N
60	39	75	1	34964.00	\N
61	40	32	1	35000.00	\N
62	41	32	1	35000.00	\N
63	42	75	1	34964.00	\N
64	43	78	1	44233.00	\N
65	44	78	1	44233.00	\N
66	45	78	1	44233.00	\N
67	46	78	1	44233.00	\N
68	47	78	1	60.00	\N
69	48	78	1	60.00	\N
70	49	78	1	10.00	\N
71	50	78	1	10.00	\N
72	51	78	1	10.00	\N
73	52	78	1	10.00	\N
74	52	81	1	6.00	\N
75	53	78	1	10.00	\N
76	53	81	1	6.00	\N
77	54	79	1	2222.00	\N
78	55	78	1	10.00	\N
79	56	88	1	45.00	\N
80	56	78	1	10.00	\N
81	56	81	1	6.00	\N
82	57	86	1	345.00	\N
83	58	78	1	10.00	\N
84	59	90	1	12.00	\N
85	60	90	1	12.00	\N
86	61	78	1	10.00	\N
87	62	78	1	10.00	\N
88	63	81	1	6.00	\N
89	64	81	1	6.00	\N
90	65	78	1	10.00	\N
91	66	90	1	12.00	\N
92	67	78	1	7.00	\N
93	68	78	1	7.00	\N
94	72	90	1	12.00	\N
95	72	78	1	7.00	\N
96	73	90	1	3.00	\N
97	74	95	1	3.00	\N
98	74	94	1	13.00	\N
99	75	95	4	3.00	\N
100	76	95	2	3.00	\N
101	77	95	3	3.00	\N
102	78	95	1	3.00	\N
103	79	95	2	3.00	\N
\.


--
-- Data for Name: order_transfers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_transfers (id, order_id, seller_id, stripe_account_id, gross_amount, commission_amount, seller_amount, stripe_transfer_id, transfer_status, created_at, updated_at) FROM stdin;
1	52	10	acct_1U8xMnH8DCaTey0U	10.00	1.00	9.00	tr_1U92ybHRTOeebi8njzSFi12C	completed	2026-08-27 18:04:15.046104	2026-08-27 18:04:16.130067
2	52	13	acct_1U92dZHbwQ45EBGx	6.00	0.60	5.40	tr_1U92ycHRTOeebi8njVxustNW	completed	2026-08-27 18:04:16.160059	2026-08-27 18:04:17.269813
3	53	10	acct_1U8xMnH8DCaTey0U	10.00	1.00	9.00	tr_1U93iBHRTOeebi8nqYYoodfR	completed	2026-08-27 18:51:21.511924	2026-08-27 18:51:22.570624
4	53	13	acct_1U92dZHbwQ45EBGx	6.00	0.60	5.40	tr_1U93iCHRTOeebi8nk0bD6yWP	completed	2026-08-27 18:51:22.580885	2026-08-27 18:51:23.660862
5	61	10	acct_1U8xMnH8DCaTey0U	10.00	1.00	9.00	tr_1UApbFHRTOeebi8njwdAGxE4	completed	2026-09-01 16:11:33.201102	2026-09-01 16:11:34.338182
6	63	13	acct_1U92dZHbwQ45EBGx	6.00	0.60	5.40	tr_1UB7gqHRTOeebi8nWcDrG6MJ	completed	2026-09-02 11:30:32.488886	2026-09-02 11:30:33.649635
7	65	10	acct_1U8xMnH8DCaTey0U	10.00	1.00	9.00	tr_1UB8oRHRTOeebi8nHtF8bAhz	completed	2026-09-02 12:42:26.998513	2026-09-02 12:42:28.139167
8	66	11	acct_1UAoKeHezHWiqxAR	12.00	1.20	10.80	tr_1UB8ssHRTOeebi8nIPZJWtEn	completed	2026-09-02 12:47:02.563538	2026-09-02 12:47:03.685152
9	67	10	acct_1U8xMnH8DCaTey0U	7.00	0.70	6.30	tr_1UBBPhHRTOeebi8nU38Gy3dj	completed	2026-09-02 15:29:05.584383	2026-09-02 15:29:06.659123
10	74	10	acct_1U8xMnH8DCaTey0U	16.00	1.60	14.40	tr_1UBUBoHRTOeebi8nNLglIZIw	completed	2026-09-03 11:32:00.382678	2026-09-03 11:32:01.61775
11	76	10	acct_1U8xMnH8DCaTey0U	6.00	0.60	5.40	tr_1UBUIfHRTOeebi8nER6henRz	completed	2026-09-03 11:39:05.952121	2026-09-03 11:39:06.915505
12	78	10	acct_1U8xMnH8DCaTey0U	3.00	0.30	2.70	tr_1UBURrHRTOeebi8nE2EjcfmI	completed	2026-09-03 11:48:35.520685	2026-09-03 11:48:36.695555
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, total_amount, created_at, status, user_id, stripe_session_id, payment_status, stripe_transfer_id, transfer_status, commission_amount, seller_amount, platform_amount, stripe_payment_intent_id, stripe_customer_id) FROM stdin;
1	999.00	2026-07-29 12:21:38.447638	Pending	\N	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
2	3199.00	2026-07-29 13:04:26.183336	Pending	\N	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
3	10200.00	2026-07-29 13:09:01.57218	Shipped	\N	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
4	3199.00	2026-07-29 13:12:10.532014	Shipped	\N	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
5	68000.00	2026-08-03 18:58:00.825131	Processing	\N	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
6	34000.00	2026-08-05 16:18:39.648674	Pending	\N	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
29	547.00	2026-08-25 12:34:03.38869	Pending	15	cs_test_a1845hzsLz5KIQ0X3NPCTnnOsHcozRaT2AUP8xFiqq7vDRi2jGD4buNJEh	paid	\N	pending	0.00	0.00	0.00	\N	\N
9	208600.00	2026-08-07 16:18:31.066434	Pending	5	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
7	92500.00	2026-08-06 17:22:46.651372	Shipped	8	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
8	102000.00	2026-08-06 17:29:30.807498	Pending	1	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
10	36200.00	2026-08-11 17:32:56.530423	Shipped	9	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
11	44233.00	2026-08-20 14:32:51.861903	Shipped	13	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
12	44233.00	2026-08-20 15:29:23.330706	Pending	13	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
13	37889.00	2026-08-20 18:41:47.617011	Shipped	13	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
14	455.00	2026-08-20 19:07:03.211237	Pending	13	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
15	2222.00	2026-08-23 17:21:19.652241	Pending	16	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
16	1149995.00	2026-08-23 17:31:27.64454	Shipped	16	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
17	92222.00	2026-08-24 16:53:47.38291	Pending	15	\N	pending	\N	pending	0.00	0.00	0.00	\N	\N
18	13332.00	2026-08-24 17:20:47.569742	Pending	15	cs_test_a1zyAIMg368sbioRzdDA5wpiZXA01eO1EbQ3XD0pAVpsA1rozTaZBnWP1R	pending	\N	pending	0.00	0.00	0.00	\N	\N
19	13332.00	2026-08-24 22:11:58.058181	Pending	15	cs_test_a1sIt4fNmc3IXlyTDbPNZDENVCMwusrX3aS9YD076IzDrAPhNGQzCkoX9l	pending	\N	pending	0.00	0.00	0.00	\N	\N
20	13332.00	2026-08-25 11:13:45.525175	Pending	15	cs_test_a1Agemun9kand3BQRiXAQzVTGi8ERqGALLN2ytABWNGoR9NVPzWQD9R1eG	paid	\N	pending	0.00	0.00	0.00	\N	\N
21	2222.00	2026-08-25 11:46:38.77292	Pending	15	cs_test_a1kyZaVyK15ppdLt0L9tuvQNdQU9OMZvVuqAcroxVPuzFjb8mGNabzysrg	paid	\N	pending	0.00	0.00	0.00	\N	\N
22	37222.00	2026-08-25 11:54:02.566625	Pending	15	cs_test_b1E4LOUXleabANEUfGyLwTJqERo8DMQnmaacA0lDwuAZQ8bMcCF0wSJNCN	paid	\N	pending	0.00	0.00	0.00	\N	\N
23	6666.00	2026-08-25 12:00:58.065886	Pending	15	cs_test_a1qxI8mIN28ZTRyCKT6GYUdpZExk1rMnFiCWXXdM3JH5SWRpTMsavrlKUD	pending	\N	pending	0.00	0.00	0.00	\N	\N
24	7760.00	2026-08-25 12:02:20.008593	Pending	15	cs_test_b1oToNZKbklA2HxrYY1Tgn4z6F5nLxuYwOO9UgDjiUpA1CfLTGrgpGqTNg	pending	\N	pending	0.00	0.00	0.00	\N	\N
43	44233.00	2026-08-27 15:18:20.047958	Pending	16	cs_test_a15CT0hjDHfHAv8zk0O31Jdh2ScyitYGw7GFGEgjqQIL5pb9nYaSzBfyI5	paid	\N	pending	0.00	0.00	0.00	\N	\N
25	7760.00	2026-08-25 12:11:18.294861	Pending	15	cs_test_b1Qymocp6dAUbRc7xsASvLU4f6tnWdwRRCX0MZg5NIWzoZ9pdsvolc24mP	paid	\N	pending	0.00	0.00	0.00	\N	\N
30	35000.00	2026-08-25 14:48:42.735232	Pending	15	cs_test_a145NDVfShiFEeWV5izsaAl8HxVg3qtFDn9Q74PoGUiVIlRQsSJi1aN7TW	paid	\N	pending	0.00	0.00	0.00	\N	\N
26	2299987.00	2026-08-25 12:13:09.763995	Pending	15	cs_test_a1FStdAcVBWKbUJJexKeDZ9chCRltER9uUnCTKjvSonhsMiMugUHeNU6oH	paid	\N	pending	0.00	0.00	0.00	\N	\N
38	34964.00	2026-08-25 18:54:17.019747	Pending	16	cs_test_a1zWKF0fXtt5t6M1jGLA5rqzM39BCiGL2EjtQYgVzlDM99jE4RAHu8RgeT	refunded	\N	pending	0.00	0.00	0.00	\N	\N
35	55000.00	2026-08-25 17:09:14.679375	Pending	16	cs_test_a1UBam4g1iSEiPIt0nS4nueDj9ZtbSr8JwWASODwvAjBr6RGSj55wV7Fzq	paid	\N	pending	0.00	0.00	0.00	\N	\N
27	547.00	2026-08-25 12:27:04.205287	Pending	15	cs_test_a1YNqwsxUTGCxL8rOmSjfXlRzAezHvqglKSdKt2ZZsRzUQbfr7vzJfBoyg	paid	\N	pending	0.00	0.00	0.00	\N	\N
28	547.00	2026-08-25 12:30:19.416494	Pending	15	cs_test_a13VphXuR3oVMcdEH51CwMfSBd8S5zEfVKLxuAMojcfYcFbwrGVIk6GxYU	paid	\N	pending	0.00	0.00	0.00	\N	\N
31	160.00	2026-08-25 14:53:06.88398	Pending	15	cs_test_a1peSDVSIKHlPY3SmBegVbtmEjmy3iHFuFmeRNjRUlyimSX5YExYrjD09f	paid	\N	pending	0.00	0.00	0.00	\N	\N
32	55160.00	2026-08-25 16:27:46.332808	Pending	15	cs_test_b1AqLdMyLc0Ntka7sVQc6kuSc8TPzUj3LSXNMo00WtI5w1deDLIDzNJrMA	paid	\N	pending	0.00	0.00	0.00	\N	\N
39	34964.00	2026-08-26 19:11:42.394203	Pending	16	cs_test_a1vaM7e9zvHqElDLGY0cyjYmxpYxaNFyPp7A1QWc4kAeOtbAfME43DsZtf	refunded	\N	pending	0.00	0.00	0.00	\N	\N
33	4500.00	2026-08-25 17:03:36.825801	Pending	16	cs_test_a1OlkITyy7i0Glao2NGj02o7G4Q3YGSlsoUDunZs7z6PeQhM11ryxEIuEv	paid	\N	pending	0.00	0.00	0.00	\N	\N
44	44233.00	2026-08-27 15:28:31.071126	Pending	16	cs_test_a1BlwMnJTCLfmADtplgRmQU5K4KThgK2sANlxLjkOodSGWphxAlsF2MHpW	paid	\N	pending	0.00	0.00	0.00	\N	\N
36	2222.00	2026-08-25 17:12:37.15749	Pending	16	cs_test_a1eLdTY4Ic3Igg6vgMA13f71MV68n9w89Uk5eVX04aqZ2k836xQyn60nyi	paid	\N	pending	0.00	0.00	0.00	\N	\N
40	35000.00	2026-08-26 19:28:23.730249	Pending	16	cs_test_a1h6RiHCtPhl3dqEzBooJT5Mvb4RVAvzVKd7BjdKQcEZplhwD2BuaAbhJW	paid	\N	pending	0.00	0.00	0.00	\N	\N
37	2769.00	2026-08-25 17:23:54.701139	Pending	16	cs_test_b1lygVLStAXWek70nxFUoqdLe3jQmVD5diJYpwDe5KfJJpjK3G7BdVgsPV	refunded	\N	pending	0.00	0.00	0.00	\N	\N
41	35000.00	2026-08-26 19:37:46.472175	Pending	16	cs_test_a1HGCIatMguJXbGBjvXeiEpjsmmATH1ZIknYcekBm9EsrZOg4RfN5ZVRWd	refunded	\N	pending	0.00	0.00	0.00	\N	\N
50	10.00	2026-08-27 16:58:58.122598	Pending	16	cs_test_a1zokOXNIHb99ePfTyXClUHQVVSx55JkFmFpacdONcGNffZhxWhaKr7Asp	paid	tr_1U91xgHRTOeebi8nR54SMJQJ	completed	1.00	9.00	0.00	\N	\N
42	34964.00	2026-08-27 14:55:18.232017	Pending	16	cs_test_a1j8g4RKXXw3xM66Vr6CoqjOz8Aq2DzJzWfVeAkYCej8slpGX7apvznGft	paid	\N	pending	0.00	0.00	0.00	\N	\N
45	44233.00	2026-08-27 15:41:16.846848	Pending	16	cs_test_a1Z1PMtn4rKNiqygVSRBDteF7Iqy72X8yShyArHS6RA8zCTP7N3BDiZntr	paid	\N	pending	0.00	0.00	0.00	\N	\N
47	60.00	2026-08-27 16:04:34.671755	Pending	16	cs_test_a1qglUj6mInAwidlEZXKFIlmbgprZgbmjtjyZ3gP42yljGPhweOjq6gYYV	paid	\N	pending	0.00	0.00	0.00	\N	\N
46	44233.00	2026-08-27 15:56:03.462126	Pending	16	cs_test_a1W5o8nHK7FtNWmEUuCBCDzf336rIoGHpm0wMp8LSfPSTHMb8dL7SH2x06	paid	\N	pending	0.00	0.00	0.00	\N	\N
49	10.00	2026-08-27 16:19:06.871068	Pending	16	cs_test_a1J344EhlRNl8EdrHtm8n2Wh5CjOGjfrmGZWuCVviMAE3Qk7EsvgxXVnfp	paid	tr_1U91MqHRTOeebi8nbAu5xU3R	completed	0.00	0.00	0.00	\N	\N
48	60.00	2026-08-27 16:08:59.957679	Pending	16	cs_test_a1iDUKZLoKVigwctyZJT33KLlDagG6xuGDcVSYWxAxxDtDPNBFIQA1VPkZ	paid	\N	failed	0.00	0.00	0.00	\N	\N
52	16.00	2026-08-27 18:04:00.023633	Processing	16	cs_test_b18UqJAAG8dsObCEJ6Tuw2cQ1Uc7yZc5bxkIeAdrtCqjtk13z638CSDVF2	paid	\N	completed	1.60	14.40	1.60	\N	\N
51	10.00	2026-08-27 17:07:43.991695	Pending	16	cs_test_a1JAXfsM9mcCDAeWbfq1NMpjQsgMgIhchfbL42PvPgrmF4nurmBEZZkMdj	paid	tr_1U926CHRTOeebi8nUDAGEnnx	completed	1.00	9.00	0.00	\N	\N
54	2222.00	2026-08-29 15:39:10.021043	Pending	16	cs_test_a1ekWm9THt1X1RQaKEQRHLG3utiyx9qzoL9cxfwhe9TxZ1zxpNYfJRavUi	pending	\N	pending	0.00	0.00	0.00	\N	\N
53	16.00	2026-08-27 18:51:05.85186	Processing	16	cs_test_b1e8bKsLOhpFRGSNuxDCwhPfafSlYO4v6gtTfjwRIrFWDWZ7LtzRm78hHc	paid	\N	completed	1.60	14.40	1.60	\N	\N
55	10.00	2026-08-29 15:39:43.633755	Processing	16	cs_test_a1fRn5ff8pEnW3lpSVes3EgPACiU8XErOtewY58eikoXxLfEzfjvaLhSUu	paid	\N	pending	0.00	0.00	0.00	\N	\N
56	61.00	2026-08-29 16:05:56.456139	Processing	16	cs_test_b13RzmVeOJSjjWUdbxWbQcN5bpZnldqFps1kV7Upd6Qdd8SzjqrNcY26Zm	paid	\N	pending	0.00	0.00	0.00	\N	\N
57	345.00	2026-09-01 12:48:07.452134	Processing	12	cs_test_a1UIdQCMlaMuKRSTi80MOuxxC3XV2e5dNRBED46eioQdRPHsnnFbSuEWUi	paid	\N	pending	0.00	0.00	0.00	\N	\N
58	10.00	2026-09-01 13:39:50.511992	Processing	16	cs_test_a1n1W99bboTc4PKwzmOMVBC1dkXSKtwcnxOHLID8PIvTCS5mLJEn3Hu2B1	paid	\N	pending	0.00	0.00	0.00	pi_3UAnEjHRTOeebi8n1EIPAqqq	cus_VB9XbdP0Pw0iIP
59	12.00	2026-09-01 15:02:50.853303	Processing	16	cs_test_a1lmgtnbT9T7Lsb2qHnA7AVoUfr7DJYoLrF4NtA9RC9qMUglUnSY0adUCV	paid	\N	pending	0.00	0.00	0.00	pi_3UAoX1HRTOeebi8n09vbAfCS	cus_VB9XbdP0Pw0iIP
34	39500.00	2026-08-25 17:06:21.419093	Pending	16	cs_test_b17d4kfZtYYM5vEw64MDcIA8ry3TOcnpt1FYS2CmYGxbCice1OUPW7OAJj	refunded	\N	pending	0.00	0.00	0.00	\N	\N
60	12.00	2026-09-01 15:35:44.134493	Processing	16	cs_test_a1WK0tiVlkxkkSj5N0IIqh0125t3qDW5OB1cYgtOdbsCebBFqd2lHBkAVi	paid	\N	pending	0.00	0.00	0.00	pi_3UAp2qHRTOeebi8n1nxn09Fa	cus_VB9XbdP0Pw0iIP
79	6.00	2026-09-03 11:49:19.002455	Pending	17	cs_test_a1VOhvO7AEtHwim9M0m9JNoRcdbKy7PiuVsXccYwGJaZEo0DG3j6LfxuJs	pending	\N	pending	0.00	0.00	0.00	\N	cus_VBUfp8RjEKBMsm
62	10.00	2026-09-01 16:11:16.253538	Pending	16	cs_test_a1yZkco1TvQADR74QTbwC75UNAIgbuc9eZD8oxzv0LASTSCMoC7HNRPYGb	pending	\N	pending	0.00	0.00	0.00	\N	cus_VB9XbdP0Pw0iIP
74	16.00	2026-09-03 11:31:46.451619	Processing	16	cs_test_b1qpcVuXoxrhncMBToDoFxkUnT3LCtXhIdO8GbjNWqVQeJLKojmgMD4Nzg	paid	\N	completed	1.60	14.40	1.60	pi_3UBUBjHRTOeebi8n1PNOSUbs	cus_VB9XbdP0Pw0iIP
75	12.00	2026-09-03 11:38:18.573282	Pending	16	cs_test_a1TeF3V0VKcnzx20gVWBfbUwX4IuIzCbeC0irMXNsOd7lhZLHeAusChaGk	pending	\N	pending	0.00	0.00	0.00	\N	cus_VB9XbdP0Pw0iIP
61	10.00	2026-09-01 16:11:14.526881	Processing	16	cs_test_a1TfxmlrRzNxcSvI6izWHEmHKpLfCRDPtLkModFd6Hy8sh58lc9uTqRxSa	paid	\N	completed	1.00	9.00	1.00	pi_3UApbAHRTOeebi8n0cHE0hCS	cus_VB9XbdP0Pw0iIP
66	12.00	2026-09-02 12:46:49.478289	Delivered	16	cs_test_a1fIrMz0AJbNrXjf4gAJkXIgCERm2LvlLE9sPJ1LVUmyUI3EUp0TABiLnt	paid	\N	completed	1.20	10.80	1.20	pi_3UB8snHRTOeebi8n0YXh0gsS	cus_VB9XbdP0Pw0iIP
63	6.00	2026-09-02 11:30:12.223835	Processing	17	cs_test_a1HLS9b2U8nyh7K08Ywtp7rKf2TlMFViSSEyMCRzzf3xMQbVlPVsSAnEV6	paid	\N	completed	0.60	5.40	0.60	pi_3UB7gkHRTOeebi8n1X8Ot0zk	cus_VBUfp8RjEKBMsm
64	6.00	2026-09-02 11:30:14.719247	Shipped	17	cs_test_a1rVdt9tsCzkd7Fu1YshD3hYIYxnU8VN3QOhPEOZ4gQWbObUrHhTdrcFc9	pending	\N	pending	0.00	0.00	0.00	\N	cus_VBUfp8RjEKBMsm
76	6.00	2026-09-03 11:38:50.062464	Processing	16	cs_test_a1u1KZxgQzHzwim3cvzLU0GerHfsfdv0RXbWZe9RuDRaIAVlcBvAAk3FQU	paid	\N	completed	0.60	5.40	0.60	pi_3UBUIbHRTOeebi8n0csSahQH	cus_VB9XbdP0Pw0iIP
67	7.00	2026-09-02 15:28:24.090633	Processing	16	cs_test_a1kDl83jDBK6OY8brrGJUyoG1huWuySwQvxbCLnpyKixgWxN1FGmFrp0g7	paid	\N	completed	0.70	6.30	0.70	pi_3UBBPaHRTOeebi8n03RX87As	cus_VB9XbdP0Pw0iIP
68	7.00	2026-09-02 15:32:03.495945	Pending	16	cs_test_a1WxdgERQJhtONwJNMdkyQ9C6D6jxyvRb2MY5JtCOaiLLJ0qknzRDlow6I	pending	\N	pending	0.00	0.00	0.00	\N	cus_VB9XbdP0Pw0iIP
65	10.00	2026-09-02 12:42:10.750583	Processing	16	cs_test_a1m1Y6VRfARVvjARZfkojBKs2MKz6Lx1UyrekzVfr1KQhIW6mBbUX0Uoul	paid	\N	completed	1.00	9.00	1.00	pi_3UB8oLHRTOeebi8n0UFnPybr	cus_VB9XbdP0Pw0iIP
72	19.00	2026-09-02 15:46:48.175533	Pending	16	cs_test_b1OGFyNooDAnGOEqQN9IatiDnUQNLSetDAqIA9A8AK0i8ts8E9J6aiPKMe	pending	\N	pending	0.00	0.00	0.00	\N	cus_VB9XbdP0Pw0iIP
73	3.00	2026-09-02 17:03:01.271739	Pending	16	cs_test_a16Hdv3qLYZKD2adhXquw0pK3XaQznf6hJNjV1LOmHjawNRlO6XXl7YM7l	pending	\N	pending	0.00	0.00	0.00	\N	cus_VB9XbdP0Pw0iIP
77	9.00	2026-09-03 11:47:41.898349	Pending	16	cs_test_a1ngO7ifi6UlPvdHNV2EjXPNQqItWicrs9f9YdKshPGGoCnhJ5GvMWUgxH	pending	\N	pending	0.00	0.00	0.00	\N	cus_VB9XbdP0Pw0iIP
78	3.00	2026-09-03 11:48:21.060698	Processing	16	cs_test_a1GpGpgNgwfmH4abs7wxgvooJzBGqGkgzDuE4DbS9yUB0ld483U5qPJ0mI	paid	\N	completed	0.30	2.70	0.30	pi_3UBURlHRTOeebi8n0Bd23M7k	cus_VB9XbdP0Pw0iIP
\.


--
-- Data for Name: product_image; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_image (id, product_id, image) FROM stdin;
7	32	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775266/redux-shop/products/zihpedyf2m7se9rnrgsi.jpg
8	32	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775267/redux-shop/products/lde6nymzftp8t6uy3gqa.jpg
9	32	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775268/redux-shop/products/u93rl8jlmc1wtncwhukx.jpg
10	34	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775269/redux-shop/products/icegwwlqjbfenkw9mhox.jpg
11	34	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775270/redux-shop/products/uyj9ugsw4sfvdygzlymh.jpg
12	34	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775271/redux-shop/products/rpr8o50l28mlvj0ixkol.jpg
13	36	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775272/redux-shop/products/irwqp5zieontz0ux05bv.jpg
14	36	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775273/redux-shop/products/yfbr9c1rjc7fgg06rlhj.jpg
15	36	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775274/redux-shop/products/zfizqyljtij4fqppghay.jpg
16	38	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775275/redux-shop/products/s2oowt4xpf4ynbe2jya2.jpg
18	41	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775276/redux-shop/products/qb4lksvaowqrx8mdmrff.jpg
19	41	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775277/redux-shop/products/hlr4q9ioc6adtzyod6po.jpg
20	41	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775279/redux-shop/products/tmmoyyzttq4ajivp167s.jpg
21	41	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775280/redux-shop/products/oy4mibyliawtpvtjcuag.jpg
22	33	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775281/redux-shop/products/puvepjniihcwfpojq0yc.png
23	33	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775282/redux-shop/products/bgylpjjf64vrryq80eju.png
24	33	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775282/redux-shop/products/umdbrglollc4iqzajasz.png
25	33	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775283/redux-shop/products/vdkmihneb2xtlaki2wsx.png
26	33	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775284/redux-shop/products/huufauwbzpidv3wko38f.png
27	33	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775285/redux-shop/products/huylstjwjz263bjpfert.png
28	33	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775286/redux-shop/products/dthqs21nwa3zqtrjvkar.png
31	33	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775289/redux-shop/products/jgwdqjk2h4jb3bxdlnae.png
33	42	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775291/redux-shop/products/zrskhq2sp2iobijojziq.png
35	44	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775292/redux-shop/products/ng5danle2frxzvpcvjiu.png
37	44	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775294/redux-shop/products/jc7np6yoft1q1jsa2cql.png
39	44	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775296/redux-shop/products/j6whehslwuxhlxspqyew.png
41	45	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775298/redux-shop/products/aqvuoqsrm8gybncaz23p.jpg
43	47	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775300/redux-shop/products/nw3pyvx6vizqwcenruas.jpg
45	47	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775302/redux-shop/products/otuh7uk9ijohgkppxt6b.jpg
48	48	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775304/redux-shop/products/j03hpnguv4zdqnbuoun4.jpg
50	49	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775307/redux-shop/products/grdp3gk0it2hc1ggm8ph.jpg
52	50	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775309/redux-shop/products/qsyt8gvau72r67lcpkap.jpg
54	50	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775310/redux-shop/products/hxndxvdg7wvymp7twj65.jpg
56	68	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775312/redux-shop/products/flojt1jppsmuhfgq1gr8.jpg
58	69	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775314/redux-shop/products/jnbv2x8drf7uftnftea4.jpg
60	69	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775316/redux-shop/products/nacydjqs2ofwo8wod7ml.jpg
62	65	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775318/redux-shop/products/labvc5khnnl0uikvwg52.jpg
64	63	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775320/redux-shop/products/yju2zgxnl1nmyanwo8wg.jpg
66	63	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775322/redux-shop/products/kuo34512c6rny1dpjlht.jpg
69	66	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775325/redux-shop/products/o8rzsnsnwmraqnx0acbk.jpg
71	67	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775327/redux-shop/products/facsfdcehwr56auy3qxm.jpg
73	70	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775330/redux-shop/products/whx2js3rxdhmdztvdksc.jpg
75	70	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775332/redux-shop/products/uhewpf0uuigu2crymqku.jpg
77	71	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775334/redux-shop/products/hh9e2t2dthwmvxsis38a.jpg
79	72	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775336/redux-shop/products/s2gdz30c9b0wrz7pbioz.jpg
81	72	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775338/redux-shop/products/cqct9n3e1pjdmlk7ix2s.jpg
83	73	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775340/redux-shop/products/ry6yutpioxdno376slp2.jpg
85	73	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775343/redux-shop/products/bhqxdhpnhds8wirq9sg4.jpg
89	75	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775345/redux-shop/products/weraktksrhieh2fgumnx.jpg
91	77	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775346/redux-shop/products/g4hkx9zxlzfyo3e913ap.jpg
93	79	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775348/redux-shop/products/pkpdtrto9y5jwcad5zym.jpg
95	81	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775350/redux-shop/products/jnogqrxrkw6dteyml5vp.jpg
29	33	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775287/redux-shop/products/xdzmiuvuardch6uz5wdx.png
30	33	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775288/redux-shop/products/vtz64sq1g4wmc1cwcegk.png
32	42	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775290/redux-shop/products/jjckiyongqwlny5ihnns.png
34	42	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775291/redux-shop/products/z9nvigd7revy4vms40sd.png
36	44	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775293/redux-shop/products/e5sxprb9ww8uvixqyqha.png
38	44	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775295/redux-shop/products/zbxwm1ymn1tvncmhjaax.png
40	45	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775297/redux-shop/products/awwggkviz0o43qaahgjn.jpg
42	45	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775299/redux-shop/products/oxaejc6jm1p6ismo4ytg.jpg
44	47	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775301/redux-shop/products/ners5cyi3wdhajdnpztx.jpg
46	48	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775302/redux-shop/products/pmyfjfi6dkfcsx1dbofp.jpg
49	49	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775305/redux-shop/products/siibe2x9i2rihf6rqmhs.jpg
51	49	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775308/redux-shop/products/nrknj5cgpykgd71ia36v.jpg
53	50	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775310/redux-shop/products/yzyp5xakoybkg5lmvxsj.jpg
55	68	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775311/redux-shop/products/gk4d8xbchqz6un0zbncy.jpg
57	68	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775313/redux-shop/products/zhrof9l8tn4nycpza3cd.jpg
59	69	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775315/redux-shop/products/n64z1brpc8qd6bu7apmv.jpg
61	65	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775317/redux-shop/products/rd70jacepx2rubxodgeo.jpg
63	65	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775319/redux-shop/products/wlnltc7auri0cgo7zin2.jpg
65	63	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775321/redux-shop/products/rwibpckhvbtdoqprzpt2.jpg
67	66	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775323/redux-shop/products/l6touxmucjmoddkskci9.jpg
68	66	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775324/redux-shop/products/rosh86yidnjgkuivizdz.jpg
70	67	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775326/redux-shop/products/dgnfsd52eyo33hu7nucy.jpg
72	67	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775329/redux-shop/products/kslzdhhuu88oa69erv69.jpg
74	70	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775331/redux-shop/products/opj0nbq92monoknt2h6j.jpg
76	71	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775333/redux-shop/products/q6cwtmwboj69iatbk3fw.jpg
78	71	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775335/redux-shop/products/nmqczum4gxrrqzkp8zhk.jpg
80	72	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775337/redux-shop/products/ichjzdwvwzlsadgyrcan.jpg
82	72	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775339/redux-shop/products/mfmnr1kc6kfwt4lluwzu.jpg
84	73	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775341/redux-shop/products/gp4ca1qedwsuuajtd9di.jpg
88	75	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775344/redux-shop/products/jdn3hv23hf7dbsvoht8k.jpg
90	77	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775345/redux-shop/products/b9fbkz7w1nzncyeptbnj.jpg
92	78	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775347/redux-shop/products/le6tluwbnhpzcla4q2fe.jpg
94	80	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775349/redux-shop/products/dxgwyxv3ed6mka6cm9f4.jpg
96	96	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775637/redux-shop/products/zv45f1ouvrsck4peqhfx.jpg
97	96	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775638/redux-shop/products/qtvizbvpbtfrbvclljbv.jpg
98	96	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775638/redux-shop/products/z4adox0ylgun0iqr8mwr.jpg
99	96	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775639/redux-shop/products/izminpgz4hafcvmzkbj6.jpg
100	96	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775640/redux-shop/products/twsfolzq2r77nkco6qm9.jpg
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, title, price, description, category, image, rating, category_id, is_active, created_at, seller_id, approval_status, stock) FROM stdin;
42	Pride and Prejudice	1200	A classic romantic novel about love, family, social class, and misunderstandings.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775212/redux-shop/products/apozpz4auj2v4ggn7asy.jpg	4.5	9	t	2026-08-17 12:08:59.286322	\N	approved	13
50	Men's Casual Hoodie	3400	Warm and comfortable hoodie suitable for casual and streetwear looks.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775223/redux-shop/products/eezgsyfh2x81y9vr6mcv.jpg	4	19	t	2026-08-17 12:08:59.286322	\N	approved	13
53	Cotton Polo Shirt	2300	Smart-casual cotton polo shirt suitable for everyday use.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775227/redux-shop/products/q98e1ajok7hdzfizmsly.png	4.4	19	t	2026-08-17 12:08:59.286322	\N	approved	13
38	Pixel 8	80000	High-performance RGB gaming mouse with adjustable DPI.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775231/redux-shop/products/utug5zemaq0dqqci6tn2.jpg	4	20	t	2026-08-17 12:08:59.286322	\N	approved	13
63	Samsung A32	105000	Modern smartphone with a large display and multi-camera design.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775234/redux-shop/products/r7i2wq9hqdmtrjmiagcq.jpg	4	15	t	2026-08-17 12:08:59.286322	\N	approved	13
52	Leather Jacket	2400	Classic stylish jacket suitable for casual and outdoor outfits.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775237/redux-shop/products/irrbngy292umjacpuxc5.png	4	18	t	2026-08-17 12:08:59.286322	\N	approved	13
41	pixel 11	66000	High-performance RGB gaming mouse with adjustable DPI.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775242/redux-shop/products/qffubdofws4a4bds2mye.jpg	4	20	t	2026-08-17 12:08:59.286322	\N	approved	13
47	Dracula	1202	A gothic horror story about Count Dracula and a terrifying supernatural encounter.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775246/redux-shop/products/oj5jsrss7ckv3avy58h3.jpg	5	9	t	2026-08-17 12:08:59.286322	\N	approved	13
77	play station	300000	here is the play station that is used for play games	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775250/redux-shop/products/no5f7vk8mpv2ng2ugbd5.jpg	2.9	7	f	2026-08-20 12:32:25.404976	10	rejected	13
85	iPhone 17 Pro Max	4000	The iPhone 17 Pro Max is the pinnacle of modern mobile design, combining raw computational power with a premium build to meet the demands of power users and content creators alike. This device features a large, edge-to-edge display that showcases vibrant colors and deep blacks, ensuring an immersive viewing experience. Its advanced camera system captures compelling photos and videos in diverse lighting conditions, while the powerful processor handles demanding tasks with ease. With robust security through Face ID and seamless integration into the broader Apple ecosystem, this flagship offers reliability and convenience at its highest level.\r\n\r\nProduct Features:\r\n• Advanced mobile processing for peak performance\r\n• Large, high-resolution OLED display with enhanced brightness\r\n• Multi-lens professional camera system for versatile photography\r\n• Long-lasting battery optimized for extended use\r\n• Secure biometric authentication via Face ID\r\n• Seamless integration with Apple services and apps	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775251/redux-shop/products/v75ztcpgkjv4tjwdxpgw.jpg	4	14	t	2026-08-28 16:25:02.978763	10	approved	13
33	The Hobbit	547	The Hobbit, or There and Back Again, is a famous fantasy book by J. R. R. Tolkien. It came out on September 21, 1937. The story follows a quiet home-loving hobbit named Bilbo Baggins who goes on a grand quest with a wizard named Gandalf and thirteen dwarves to win back their gold from a bad dragon named Smaug	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775214/redux-shop/products/c5bxjsizuwrk1hwiw6fd.jpg	1.1	9	t	2026-08-17 12:08:59.286322	\N	approved	13
64	Pixel View 9	95000	Smartphone designed for sharp photos and smooth everyday performance.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775214/redux-shop/products/dmen20ap264mpsacvcfd.png	5	20	t	2026-08-17 12:08:59.286322	\N	approved	13
48	Classic Cotton T-Shirt	1800	Soft cotton everyday T-shirt suitable for casual wear.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775216/redux-shop/products/kvtpww7rdnhp7dukmlxh.jpg	4	19	t	2026-08-17 12:08:59.286322	\N	approved	13
56	Pink Tulip Bouquet	3400	Elegant pink tulips arranged as a bright and cheerful bouquet.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775216/redux-shop/products/v4nz54u9u7hqe4bbfbfu.png	4.3	12	t	2026-08-17 12:08:59.286322	\N	approved	13
58	Sunflower Bouquet	2000	Bright yellow sunflowers arranged for a cheerful gift.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775217/redux-shop/products/ce1ftbsuajbrdaqtwrc1.png	4	12	t	2026-08-17 12:08:59.286322	\N	approved	13
59	Mixed Flower Bouquet	3200	Colorful mixed flowers arranged into a vibrant decorative bouquet.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775218/redux-shop/products/amiazfhior1vwijnunmx.png	3	12	t	2026-08-17 12:08:59.286322	\N	approved	13
60	Orchid Plant	2000	A graceful orchid plant suitable for home and office decoration.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775219/redux-shop/products/uuokguljw3oamxlohnqd.png	5	12	t	2026-08-17 12:08:59.286322	\N	approved	13
96	flower for testing	2300	this is the test product	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775636/redux-shop/products/pasggimuuo60mkdbe0yx.jpg	4	9	f	2026-09-07 15:07:17.079179	10	pending	45
61	Carnation Bouquet	2400	Fresh carnations arranged in a colorful and attractive bouquet.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775221/redux-shop/products/gtyfrformteybshlxlzy.png	5	12	t	2026-08-17 12:08:59.286322	\N	approved	13
49	Slim Fit Denim Jeans	3500	Comfortable slim-fit denim jeans for everyday casual outfits.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775222/redux-shop/products/mn17kyshvlttw9wiqrfu.jpg	4	19	t	2026-08-17 12:08:59.286322	\N	approved	13
44	The Alchemist	1500	An inspiring adventure about following your dreams and discovering your purpose.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775224/redux-shop/products/byfzuhpoego52zxarnkc.jpg	4.4	9	t	2026-08-17 12:08:59.286322	\N	approved	13
45	The Hobbit	3000	A fantasy adventure following Bilbo Baggins on an unexpected journey.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775224/redux-shop/products/kzxai7nb0k5zhdyu2s9l.jpg	5	9	t	2026-08-17 12:08:59.286322	\N	approved	13
57	White Lily Bouquet	2985	Fresh white lilies with a clean and elegant floral appearance.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775225/redux-shop/products/o13ke78p7jppzo5ovavv.png	3.5	12	t	2026-08-17 12:08:59.286322	\N	approved	13
69	Iphone 17 pro max	2299987	This is iphone is 17 pro max 	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775226/redux-shop/products/uuixhfhqam9h9gnix00w.jpg	4.5	14	t	2026-08-17 12:08:59.286322	\N	approved	13
54	Running Sneakers	4500	Lightweight and comfortable sneakers for everyday activity and running.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775228/redux-shop/products/d2wmxwswevpsrbtr3ysm.png	5	18	t	2026-08-17 12:08:59.286322	\N	approved	13
36	Google pixel 9	55000	High-performance RGB gaming mouse with adjustable DPI.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775229/redux-shop/products/nxdfsfttqo1ubjhyna8g.jpg	4	20	t	2026-08-17 12:08:59.286322	\N	approved	13
71	Smart LED TV 43 Inch	329	43-inch Full HD Smart LED TV with built-in streaming apps, Wi-Fi connectivity, and clear picture quality.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775232/redux-shop/products/hzieussx2pa9finry45f.jpg	5	7	t	2026-08-17 12:08:59.286322	\N	approved	13
55	Red Rose Bouquet	2470	A beautiful bouquet of fresh red roses for special occasions.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775232/redux-shop/products/ojx9sfafmtimkikdcdpa.png	4	12	t	2026-08-17 12:08:59.286322	\N	approved	13
65	iPhone 15	185000	Elegant premium phone with a clean modern design.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775233/redux-shop/products/lvk5i3mm6dxqmfdc6obi.jpg	3	14	t	2026-08-17 12:08:59.286322	\N	approved	13
72	Portable Bluetooth Speaker	200	Compact portable speaker with powerful sound, Bluetooth connectivity, and up to 12 hours of battery life.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775235/redux-shop/products/coau95ivmugd3enervgl.jpg	4.6	7	t	2026-08-17 12:08:59.286322	\N	approved	13
51	Women's Summer Dress	2900	Lightweight summer dress designed for comfortable everyday wear.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775236/redux-shop/products/g7aousdjwwkqapwtfxcw.png	5	18	t	2026-08-17 12:08:59.286322	\N	approved	13
73	Wireless Mechanical Keyboard	160	RGB mechanical keyboard with wireless connectivity, responsive keys, and a durable design for gaming and productivity.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775238/redux-shop/products/nsqd33bzspwotyooofwj.jpg	5	7	t	2026-08-17 12:08:59.286322	\N	approved	13
34	Google pixel	56000	AI-powered smartphone with an advanced camera system, clean Android experience, and long battery life	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775239/redux-shop/products/yo0zv00ateaed4r510xg.jpg	3	20	t	2026-08-17 12:08:59.286322	\N	approved	13
32	Infinix Hot 12	35000	Powerful smartphone with A17 Pro chip, 6.1-inch Super Retina XDR display, and 48MP camera.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775241/redux-shop/products/bt1kirpx8ecvikzgzald.png	3	17	t	2026-08-17 12:08:59.286322	\N	approved	13
62	InfinixX Pro	85000	Premium 5G smartphone with a bright edge-to-edge display.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775243/redux-shop/products/smnaed7ufvsqrmpmjdhm.png	5	17	t	2026-08-17 12:08:59.286322	\N	approved	13
70	Wireless  Headphones	49.99	High-quality wireless headphones with noise reduction, comfortable ear cushions, and up to 20 hours of battery life.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775244/redux-shop/products/hv4v66oaciw0gwbg6xka.jpg	5	7	t	2026-08-17 12:08:59.286322	\N	approved	13
68	Iphone 11 Pro Max	250000	Modern foldable phone offering a large flexible display.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775245/redux-shop/products/bbibpwhxoi2hzlmkvtpl.jpg	5	14	t	2026-08-17 12:08:59.286322	\N	approved	13
66	Samsung  S22 ultra	1149995	Fast smartphone with a sleek body and immersive display.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775247/redux-shop/products/eihakmqhbktsymotfkix.jpg	5	15	t	2026-08-17 12:08:59.286322	\N	approved	13
67	Samsung S26 Ultra	500000	Feature-packed smartphone with a large display and stylish finish.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775248/redux-shop/products/dsrxyydqguceqs6rwpfb.jpg	3.7	15	t	2026-08-17 12:08:59.286322	\N	approved	13
76	air buds	35667	Updated product description	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775249/redux-shop/products/gpiisxc5k9o7vezb6z03.jpg	0	9	t	2026-08-19 17:30:34.486247	10	rejected	13
75	Product XY	34964	Updated product description	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775252/redux-shop/products/haexqamsr3mohm4eaqtb.jpg	4	9	f	2026-08-19 16:27:56.293635	10	approved	13
97	test flowers	3400	testing the application under flowers	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775743/redux-shop/products/t9gjkfhwzbq1cc0nrzaw.jpg	4	12	t	2026-09-07 15:09:04.821615	\N	approved	34
86	iPhone 11	345	Introducing the iPhone 11, a device in the iPhone series designed for modern mobile needs. It combines advanced technology with a user-friendly interface for everyday use.\r\n\r\nProduct Features:\r\n• Smartphone functionality\r\n• Touchscreen display\r\n• Mobile connectivity	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775253/redux-shop/products/mbsgihuyxrb9odqhxen0.jpg	5	14	t	2026-08-28 17:35:28.921172	\N	approved	13
88	Fresh Red Roses Bouquet with Green Leaves – Elegant White Paper Wrapping	45	Express your love and affection with this beautiful bouquet of fresh red roses, thoughtfully arranged with lush green leaves and wrapped in elegant white paper. The romantic and premium presentation makes it an ideal gift choice for birthdays, anniversaries, Valentine's Day, weddings, and other special occasions. Each bouquet is carefully arranged to ensure a neat, attractive, and gift-ready appearance that leaves a lasting impression. Whether you are celebrating a meaningful milestone or simply want to brighten someone's day, this red roses bouquet is a timeless and classic gesture of love and appreciation.\r\n\r\nProduct Features:\r\n• Fresh red roses beautifully arranged with green leaves\r\n• Wrapped in elegant white paper for a premium presentation\r\n• Romantic and classic gift suitable for special occasions\r\n• Perfect for birthdays, anniversaries, Valentine's Day, and weddings\r\n• Neatly arranged for an attractive, gift-ready appearance	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775254/redux-shop/products/fx69eqs6hlxpvlw5i6gq.jpg	4	12	t	2026-08-28 19:02:10.979054	\N	approved	13
92	Stock Test Seller	12	testingf  the stick	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775255/redux-shop/products/civlhlvpyu3ljf3z3api.jpg	4	7	t	2026-09-02 18:46:02.036217	10	approved	13
81	testing adaptor	6	this is the testing for adaptor	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775255/redux-shop/products/m5cimqcp7ndgdo5w0crh.jpg	4	7	f	2026-08-21 17:46:17.815973	13	approved	13
80	cable	455	lxcl;	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775256/redux-shop/products/umi6t1pqssfuagkohr4e.jpg	4	7	f	2026-08-20 19:06:20.612574	15	approved	13
79	medicine	2222	this is tesesting	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775265/redux-shop/products/ktnauows3o3hyy5hap0j.jpg	4	12	f	2026-08-20 18:40:32.447097	14	approved	13
91	test product	100	this is test product for testing the stock	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775266/redux-shop/products/jvtywsxdcq3vtxdh1hku.jpg	4	20	f	2026-09-02 18:44:13.150723	\N	approved	13
78	ADAPTOR 2	100	Test product sgansd,ga k, ak nsafk dlas 	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775257/redux-shop/products/ybuuesjpp0jhq5rri5o1.jpg	4	7	f	2026-08-20 12:46:45.908277	10	approved	13
94	Pc screen	13	Here is the PC screen	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775258/redux-shop/products/bj2947ky1k0n92cpyccn.jpg	4	7	t	2026-09-03 11:22:13.780429	10	approved	13
93	Tv remote	6	This is the tv remote that is used to display the Tv channels	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775259/redux-shop/products/tcuzklntkns3nz8dlbh1.jpg	4	7	t	2026-09-03 11:16:21.815757	10	approved	13
90	Infinix Hot 11	3	The Infinix Hot 11 is a smartphone that offers essential mobile functionality at an accessible price point. Built for users seeking a dependable device for daily communication, social media, and basic entertainment needs. Note: Detailed specifications and features should be provided by the seller for a complete product listing.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775260/redux-shop/products/tx9lfnvrfbqgkyqje6gt.jpg	5	17	t	2026-09-01 15:02:06.385642	11	approved	13
82	Samsung A34 Mobile Phone	5600	The Samsung A34 is a mobile device that provides reliable performance and a sleek design, ideal for users seeking a straightforward smartphone experience.\r\n\r\nProduct Features:\r\n• Smartphone\r\n• Samsung A34 model\r\n• Everyday performance\r\n• Modern design	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775261/redux-shop/products/ffjvugvixhpvmun7lqih.jpg	5	10	f	2026-08-28 15:01:52.746593	10	rejected	13
83	vivo a45 Android Smartphone	34	This product is an Android device under the vivo a45 model. It offers basic smartphone capabilities for communication, apps, and everyday use.\r\n\r\nProduct Features:\r\n• Android operating system\r\n• vivo a45 model\r\n• Mobile connectivity	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775262/redux-shop/products/x4iujxgqjauvwroi3k1o.jpg	5	13	t	2026-08-28 15:09:09.334672	\N	approved	13
95	Tv	3	Here is the Tv with extra ordinary pixels	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775263/redux-shop/products/wrt51mlbtdaaolwbtdbc.jpg	4	7	t	2026-09-03 11:27:51.175517	10	approved	6
89	Apple iPhone 16 Pro - White Color - 256 GB Storage	32	Experience the pinnacle of smartphone innovation with the Apple iPhone 16 Pro. This device features a stunning white finish that complements its premium build quality. With 256 GB of internal storage, you have ample space to store your apps, photos, videos, and files without worrying about running out of space. The iPhone 16 Pro delivers exceptional performance, advanced camera capabilities, and a seamless user experience through iOS. Whether you're capturing memories, streaming content, or staying productive on the go, this device is designed to exceed your expectations.	\N	https://res.cloudinary.com/kmu08rwm/image/upload/v1788775264/redux-shop/products/frgz2str5ownwys044ou.jpg	4	14	f	2026-08-29 14:43:43.098761	10	rejected	13
\.


--
-- Data for Name: refund_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refund_requests (id, order_id, user_id, reason, status, stripe_refund_id, created_at, updated_at, approver_type, approver_id, approved_at, rejected_at) FROM stdin;
1	21	15	I no longer need this product	pending	\N	2026-08-25 15:38:46.402599	2026-08-25 15:38:46.402599	\N	\N	\N	\N
2	32	15	I no longer need this product	pending	\N	2026-08-25 16:28:48.280476	2026-08-25 16:28:48.280476	admin	\N	\N	\N
3	20	15	I no longer need this product	pending	\N	2026-08-25 16:42:20.657883	2026-08-25 16:42:20.657883	seller	14	\N	\N
4	33	16	I no longer need this product	pending	\N	2026-08-25 17:05:28.579369	2026-08-25 17:05:28.579369	seller	13	\N	\N
6	35	16	I no longer need this product	pending	\N	2026-08-25 17:10:09.839429	2026-08-25 17:10:09.839429	admin	\N	\N	\N
7	36	16	I no longer need this product	pending	\N	2026-08-25 17:13:50.069594	2026-08-25 17:13:50.069594	seller	14	\N	\N
8	37	16	i donot want this product because change my mind	approved	re_3U8JOmHRTOeebi8n0LkLS1Tf	2026-08-25 17:39:59.007017	2026-08-25 17:39:59.007017	admin	1	2026-08-25 18:35:58.869252	\N
9	38	16	i donot want to buy this	approved	re_3U8Ko9HRTOeebi8n0nyvYG0g	2026-08-25 18:55:36.000898	2026-08-25 18:55:36.000898	seller	10	2026-08-25 18:55:59.552813	\N
10	39	16	Because i change my mind	approved	re_3U8hYWHRTOeebi8n1soGhvIS	2026-08-26 19:12:55.72667	2026-08-26 19:12:55.72667	seller	10	2026-08-26 19:13:40.51357	\N
11	41	16	meri marzi	approved	re_3U8hxpHRTOeebi8n1UcH2Q63	2026-08-26 19:38:29.019541	2026-08-26 19:38:29.019541	admin	1	2026-08-26 19:38:53.112523	\N
12	59	16	v	pending	\N	2026-09-02 11:45:43.585368	2026-09-02 11:45:43.585368	seller	11	\N	\N
5	34	16	I no longer need this product	approved	re_3U8J7vHRTOeebi8n1tFXdB2p	2026-08-25 17:07:38.444363	2026-08-25 17:07:38.444363	admin	1	2026-09-02 11:47:27.028118	\N
\.


--
-- Data for Name: seller_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seller_applications (id, user_id, business_name, phone, description, status, admin_note, created_at, updated_at) FROM stdin;
3	12	Test account	030056788	this is the test account	approved	\N	2026-08-19 12:54:39.748009	2026-08-19 12:56:31.396395
4	13	flowers 	00303303	i want to sell beautiful flowers	approved	\N	2026-08-19 16:52:39.529329	2026-08-19 16:52:55.129909
1	10	Waleed Electronics	03001234567	Electronic products and accessories	approved	\N	2026-08-18 17:47:36.523838	2026-08-19 18:39:00.980046
5	14	medicine	044955	testing the seller	approved	\N	2026-08-20 18:39:05.079197	2026-08-20 18:39:30.032876
6	15	cable	0303303	dggx	approved	\N	2026-08-20 19:05:14.329805	2026-08-20 19:05:34.527012
2	11	waleeed electronics 	0300123456	we want to sell the product related to electronics	approved	\N	2026-08-19 12:31:37.577232	2026-08-27 15:17:52.65562
7	17	Smart Watches	0000000000	 My store is totally about selling smart watches	pending	\N	2026-09-02 17:21:07.871942	2026-09-02 17:21:07.871942
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, role, created_at, reset_password_token, reset_password_expires, stripe_account_id, stripe_account_status, stripe_onboarding_complete, stripe_customer_id) FROM stdin;
1	Waleed	waleed@gmail.com	$2b$10$9zin3fLAAOj7PACvyOswKezW4mJXpDbJOLlWU01XnOw3L9ypud9mW	admin	2026-08-04 12:54:45.255269	\N	\N	\N	not_connected	f	\N
10	Shakeel	sardarwaleed462@gmail.com	$2b$10$TnIlg2MLJBvK.iASiiGjV./iZCB59tF0gfleNpQGddgcFIIwMa9LG	seller	2026-08-18 14:43:40.895205	\N	\N	acct_1U8xMnH8DCaTey0U	connected	t	\N
4	Afzal	Afzal@gmail.com	$2b$10$f1FhL2ijbC.Q4YOZmyAkUu5YNQtD5/pvQpBNYD6J/gI2ksr759rri	customer	2026-08-04 18:27:46.074108	\N	\N	\N	not_connected	f	\N
3	afzal	amjad@gmail.com	$2b$10$n0TXhWpMDNn6ynzWdguz4elIn14kIGcGJIPmwaTZTpg5Vdl/4Aghq	customer	2026-08-04 15:48:57.410134	\N	\N	\N	not_connected	f	\N
2	Zabbii	zabii@gmail.com	$2b$10$X4EEzTTseJHyU2j3MIzqp.vZg1dp1kBuKAioPskOddzuasRUIRHxS	customer	2026-08-04 15:22:32.724031	\N	\N	\N	not_connected	f	\N
5	ali	ali@gmail.com	$2b$10$3kXdshDWK/BZl50I9OSZ5.vbrxUjoBsbY8PD8jN4YGOTdLgAt4DBe	customer	2026-08-06 14:44:25.699709	\N	\N	\N	not_connected	f	\N
6	khan	khan@gmail.com	$2b$10$58pfulnwh7qWOsaIpW9vaOagzOUdynvJ9D3ovfF9cATBRIntFD8AO	customer	2026-08-06 15:58:51.291095	\N	\N	\N	not_connected	f	\N
7	Farhan	farhan@gmail.com	$2b$10$P0WNXaA/9K/Z0oI0liWBrOpHkDZD/EfjkCeah9nmFZ3xp4S6Gx26q	customer	2026-08-06 16:14:51.116964	\N	\N	\N	not_connected	f	\N
8	Shokat	shokat@gmail.com	$2b$10$K5aNaBh9jEn5B0hu/DgLH.k1V7OzcXBaXo8AUX01jVXTLTbiL/g4i	customer	2026-08-06 16:52:46.919312	\N	\N	\N	not_connected	f	\N
9	Hummayun Khattak	hummayun@gmail.com	$2b$10$2t3VbC9ecN0MVOilPsHEm.XxvbSe4y/OnDMYPg6ySxhGY6LO8bO1G	customer	2026-08-11 17:32:29.311086	\N	\N	\N	not_connected	f	\N
15	Hashir	hashir@gmail.com	$2b$10$A21cUgxjIXYPEFhzRr0TJOqZxeEaX1hcXo6qfzBVXy8PsIU/VSfYa	seller	2026-08-20 19:04:53.102321	\N	\N	acct_1U93edHnRGqeGW7A	action_required	f	\N
12	testAccount	test@gmail.com	$2b$10$UoN44jfhLzQ8X2TYjGS6eOVHdlE5bBqT/dSaXWApqOLgjG.WUJa7e	seller	2026-08-19 12:49:19.698342	\N	\N	\N	not_connected	f	\N
14	Fahad Naeem	fahad@gmail	$2b$10$riyLFr643RbZWOTX7B5QJuFk4O5L6WmvzF5/s4goSIduT3VIUZ4by	seller	2026-08-20 18:38:19.816648	\N	\N	\N	not_connected	f	\N
13	fiza	fiza@gmail.com	$2b$10$zIbN1RdxeAr04OGjmGkK1.hW/7AIwpBC6I33PyV4NVekwLLptIpwS	seller	2026-08-19 13:37:09.788528	\N	\N	acct_1U92dZHbwQ45EBGx	connected	t	\N
11	Perviaz khan	ksudozai391@gmail.com	$2b$10$Y/XB.7lbcEXW.wiDfnOF8OuyV7RmmQa/dfoAHS0H03RVy1JW8u4VC	seller	2026-08-18 15:45:49.847079	\N	\N	acct_1UAoKeHezHWiqxAR	connected	t	\N
16	Usman1	usman@gmail.com	$2b$10$9d1XDXRafz3ED0ZxOncrROkVzqPCC0Va/5zFXAv65t/YPq4I0DAWe	customer	2026-08-21 16:37:48.426145	\N	\N	\N	not_connected	f	cus_VB9XbdP0Pw0iIP
17	Mubassir	mubassir@gmail.com	$2b$10$LTWfMWNyJzkGP8fIOG4MFeVA105kOZgGlZYLOwDgJjebBPUkhiRF.	customer	2026-09-02 11:29:07.76236	\N	\N	\N	not_connected	f	cus_VBUfp8RjEKBMsm
\.


--
-- Name: cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.cart_id_seq', 107, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 22, true);


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invoice_items_id_seq', 17, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.invoices_id_seq', 14, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 103, true);


--
-- Name: order_transfers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_transfers_id_seq', 12, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 79, true);


--
-- Name: product_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.product_image_id_seq', 100, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 97, true);


--
-- Name: refund_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.refund_requests_id_seq', 12, true);


--
-- Name: seller_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seller_applications_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 17, true);


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_order_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_key UNIQUE (order_id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_transfers order_transfers_order_id_seller_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_transfers
    ADD CONSTRAINT order_transfers_order_id_seller_id_key UNIQUE (order_id, seller_id);


--
-- Name: order_transfers order_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_transfers
    ADD CONSTRAINT order_transfers_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: product_image product_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_image
    ADD CONSTRAINT product_image_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: refund_requests refund_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_pkey PRIMARY KEY (id);


--
-- Name: seller_applications seller_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_applications
    ADD CONSTRAINT seller_applications_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: invoice_items_invoice_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoice_items_invoice_id_idx ON public.invoice_items USING btree (invoice_id);


--
-- Name: invoice_items_seller_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoice_items_seller_id_idx ON public.invoice_items USING btree (seller_id) WHERE (seller_id IS NOT NULL);


--
-- Name: invoices_buyer_id_issued_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX invoices_buyer_id_issued_at_idx ON public.invoices USING btree (buyer_id, issued_at DESC);


--
-- Name: orders_stripe_session_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_stripe_session_id_unique ON public.orders USING btree (stripe_session_id) WHERE (stripe_session_id IS NOT NULL);


--
-- Name: unique_pending_seller_application; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_pending_seller_application ON public.seller_applications USING btree (user_id) WHERE ((status)::text = 'pending'::text);


--
-- Name: cart cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: order_items fk_order; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders fk_orders_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: cart fk_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart
    ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: order_items fk_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: product_image fk_product; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_image
    ADD CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Name: invoice_items invoice_items_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: invoices invoices_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: invoices invoices_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE RESTRICT;


--
-- Name: order_transfers order_transfers_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_transfers
    ADD CONSTRAINT order_transfers_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_transfers order_transfers_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_transfers
    ADD CONSTRAINT order_transfers_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: refund_requests refund_requests_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: refund_requests refund_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refund_requests
    ADD CONSTRAINT refund_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: seller_applications seller_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_applications
    ADD CONSTRAINT seller_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict L5WaVrSlExZicPhGIooWATNfYwhu6LD39W6vxhNYyLQrbdr4nRUpGwf7bmPchLJ

