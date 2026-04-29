SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict Jr7uNkM3cL83Z4rekyGlz1I8ieIeem0049whhLFDw4EZIOkAu19E3iNZ8B2qlI8

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."custom_oauth_providers" ("id", "provider_type", "identifier", "name", "client_id", "client_secret", "acceptable_client_ids", "scopes", "pkce_enabled", "attribute_mapping", "authorization_params", "enabled", "email_optional", "issuer", "discovery_url", "skip_nonce_check", "cached_discovery", "discovery_cached_at", "authorization_url", "token_url", "userinfo_url", "jwks_uri", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
00000000-0000-0000-0000-000000000000	b2e3086e-a58f-4a8d-808c-61e38ee90b48	authenticated	authenticated	ravi@makina-erp.com	$2a$10$m7jdIvk7sqkpTycxaKA7guhvPswP5KFjECxjf1tJjuEO7a.P38yyi	2026-04-21 17:09:50.296342+00	\N		\N		\N			\N	2026-04-28 11:44:15.0108+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-04-21 17:09:50.292687+00	2026-04-28 12:42:25.050445+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	87367c74-b0dc-4d41-8763-53d1b975d58b	authenticated	authenticated	arun@makina-erp.com	$2a$10$rWMcHYUhF7vzXI3PyCbyZeKWJ178sJuMN0r/17YLD4GX7wT5z7.4C	2026-04-21 17:49:29.826111+00	\N		\N		\N			\N	2026-04-28 11:44:38.976525+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-04-21 17:49:29.810191+00	2026-04-28 12:44:52.658102+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9110745a-3d71-49b9-b913-db9626e579d4	authenticated	authenticated	feras@makinalube.ae	$2a$10$8Jjt..H.uxtWugnSjNb1JOm160A1iQiPlRJbRdhrDII7DROzss3o.	2026-04-14 10:33:39.797614+00	\N		\N		\N			\N	2026-04-28 13:50:46.338081+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-04-14 10:33:39.780813+00	2026-04-28 22:03:12.489387+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ea85b86b-83c9-4a33-9365-362a42382c7d	authenticated	authenticated	accountants@makinalube.ae	$2a$10$3RdroP6E/7WI1L52skmGmuoeW4JXyA9ucYk/ohmKt/mbPlqnR0Q0i	2026-04-21 17:58:36.221307+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-04-21 17:58:36.207654+00	2026-04-21 17:58:36.222252+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
9110745a-3d71-49b9-b913-db9626e579d4	9110745a-3d71-49b9-b913-db9626e579d4	{"sub": "9110745a-3d71-49b9-b913-db9626e579d4", "email": "feras@makinalube.ae", "email_verified": false, "phone_verified": false}	email	2026-04-14 10:33:39.793641+00	2026-04-14 10:33:39.793703+00	2026-04-14 10:33:39.793703+00	e9484a75-bcf3-4bba-bd6b-69500cdad0bb
b2e3086e-a58f-4a8d-808c-61e38ee90b48	b2e3086e-a58f-4a8d-808c-61e38ee90b48	{"sub": "b2e3086e-a58f-4a8d-808c-61e38ee90b48", "email": "ravi@makina-erp.com", "email_verified": false, "phone_verified": false}	email	2026-04-21 17:09:50.294836+00	2026-04-21 17:09:50.294881+00	2026-04-21 17:09:50.294881+00	aab67141-7056-4383-9bf4-b3bc8297b791
87367c74-b0dc-4d41-8763-53d1b975d58b	87367c74-b0dc-4d41-8763-53d1b975d58b	{"sub": "87367c74-b0dc-4d41-8763-53d1b975d58b", "email": "arun@makina-erp.com", "email_verified": false, "phone_verified": false}	email	2026-04-21 17:49:29.823588+00	2026-04-21 17:49:29.823653+00	2026-04-21 17:49:29.823653+00	2bc7008e-02ab-44a8-8d8f-0155e8236488
ea85b86b-83c9-4a33-9365-362a42382c7d	ea85b86b-83c9-4a33-9365-362a42382c7d	{"sub": "ea85b86b-83c9-4a33-9365-362a42382c7d", "email": "accountants@makinalube.ae", "email_verified": false, "phone_verified": false}	email	2026-04-21 17:58:36.218329+00	2026-04-21 17:58:36.218383+00	2026-04-21 17:58:36.218383+00	3668896c-76a3-4d58-8970-5ebd4d287f9a
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_clients" ("id", "client_secret_hash", "registration_type", "redirect_uris", "grant_types", "client_name", "client_uri", "logo_uri", "created_at", "updated_at", "deleted_at", "client_type", "token_endpoint_auth_method") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") FROM stdin;
27e468ca-be64-4d6d-8085-e19426fca4cc	9110745a-3d71-49b9-b913-db9626e579d4	2026-04-28 09:08:37.890506+00	2026-04-28 11:46:10.765956+00	\N	aal1	\N	2026-04-28 11:46:10.765848	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36	217.165.253.143	\N	\N	\N	\N	\N
07b34561-59be-435d-9131-f94af72acb3a	b2e3086e-a58f-4a8d-808c-61e38ee90b48	2026-04-28 11:44:15.010918+00	2026-04-28 12:42:25.062488+00	\N	aal1	\N	2026-04-28 12:42:25.062377	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 OPR/130.0.0.0	217.165.253.143	\N	\N	\N	\N	\N
28d9d7db-c4cf-4658-9f77-a729bcb9e7a8	9110745a-3d71-49b9-b913-db9626e579d4	2026-04-28 13:50:46.338192+00	2026-04-28 13:50:46.338192+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36	92.96.242.250	\N	\N	\N	\N	\N
6d227d8e-0fc4-45ce-8db3-02c4706833f0	9110745a-3d71-49b9-b913-db9626e579d4	2026-04-28 09:09:29.083224+00	2026-04-28 22:03:12.503434+00	\N	aal1	\N	2026-04-28 22:03:12.503318	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	92.96.242.250	\N	\N	\N	\N	\N
6af51e7a-d2b5-40a0-9871-3c331a354a93	9110745a-3d71-49b9-b913-db9626e579d4	2026-04-28 09:34:13.894758+00	2026-04-28 09:34:13.894758+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	217.165.253.143	\N	\N	\N	\N	\N
1eb3a18b-59d0-479e-a7b1-5bbb81a70e1d	9110745a-3d71-49b9-b913-db9626e579d4	2026-04-28 09:50:44.048244+00	2026-04-28 09:50:44.048244+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	217.165.253.143	\N	\N	\N	\N	\N
fb842a95-e37c-42ef-99a6-1a0477038e99	9110745a-3d71-49b9-b913-db9626e579d4	2026-04-28 10:20:57.47306+00	2026-04-28 10:20:57.47306+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	217.165.253.143	\N	\N	\N	\N	\N
22f7780b-b765-4b27-a40e-c4c698c0d5b4	9110745a-3d71-49b9-b913-db9626e579d4	2026-04-28 10:59:28.871785+00	2026-04-28 10:59:28.871785+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0	217.165.253.143	\N	\N	\N	\N	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
27e468ca-be64-4d6d-8085-e19426fca4cc	2026-04-28 09:08:37.919223+00	2026-04-28 09:08:37.919223+00	password	86062f71-7e17-4915-a4e4-3e4b6120190c
6d227d8e-0fc4-45ce-8db3-02c4706833f0	2026-04-28 09:09:29.101004+00	2026-04-28 09:09:29.101004+00	password	68ce4e9c-5992-464f-ba83-dd4c33d6a253
6af51e7a-d2b5-40a0-9871-3c331a354a93	2026-04-28 09:34:13.949053+00	2026-04-28 09:34:13.949053+00	password	88f0b7f0-3ea3-4d49-8075-6b560282f8d0
1eb3a18b-59d0-479e-a7b1-5bbb81a70e1d	2026-04-28 09:50:44.097413+00	2026-04-28 09:50:44.097413+00	password	8e126f58-b99b-404f-b5b9-a217ee495604
fb842a95-e37c-42ef-99a6-1a0477038e99	2026-04-28 10:20:57.510987+00	2026-04-28 10:20:57.510987+00	password	7c8008bc-85a9-4adb-9ea6-691192cbc509
22f7780b-b765-4b27-a40e-c4c698c0d5b4	2026-04-28 10:59:28.91393+00	2026-04-28 10:59:28.91393+00	password	4a3870ba-102a-4286-b43b-c86543213c3e
07b34561-59be-435d-9131-f94af72acb3a	2026-04-28 11:44:15.038598+00	2026-04-28 11:44:15.038598+00	password	03caf49c-8215-47e8-bbf0-02ccbdc6c8a7
28d9d7db-c4cf-4658-9f77-a729bcb9e7a8	2026-04-28 13:50:46.38044+00	2026-04-28 13:50:46.38044+00	password	50e76bce-7b19-4bb2-b5fa-f960e8e116bc
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid", "last_webauthn_challenge_data") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_authorizations" ("id", "authorization_id", "client_id", "user_id", "redirect_uri", "scope", "state", "resource", "code_challenge", "code_challenge_method", "response_type", "status", "authorization_code", "created_at", "expires_at", "approved_at", "nonce") FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_client_states" ("id", "provider_type", "code_verifier", "created_at") FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."oauth_consents" ("id", "user_id", "client_id", "scopes", "granted_at", "revoked_at") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
00000000-0000-0000-0000-000000000000	190	toffmlwmkipx	9110745a-3d71-49b9-b913-db9626e579d4	f	2026-04-28 09:50:44.075493+00	2026-04-28 09:50:44.075493+00	\N	1eb3a18b-59d0-479e-a7b1-5bbb81a70e1d
00000000-0000-0000-0000-000000000000	192	jyinvpjrpsj5	9110745a-3d71-49b9-b913-db9626e579d4	f	2026-04-28 10:59:28.901071+00	2026-04-28 10:59:28.901071+00	\N	22f7780b-b765-4b27-a40e-c4c698c0d5b4
00000000-0000-0000-0000-000000000000	188	hc4xqxbvdh65	9110745a-3d71-49b9-b913-db9626e579d4	t	2026-04-28 09:09:29.097383+00	2026-04-28 11:35:25.44823+00	\N	6d227d8e-0fc4-45ce-8db3-02c4706833f0
00000000-0000-0000-0000-000000000000	197	cezo5nsqv4ig	9110745a-3d71-49b9-b913-db9626e579d4	f	2026-04-28 11:46:10.752308+00	2026-04-28 11:46:10.752308+00	usjr5cnzvjls	27e468ca-be64-4d6d-8085-e19426fca4cc
00000000-0000-0000-0000-000000000000	194	qo7i2fwkzyo4	9110745a-3d71-49b9-b913-db9626e579d4	t	2026-04-28 11:35:25.46581+00	2026-04-28 12:35:14.476453+00	hc4xqxbvdh65	6d227d8e-0fc4-45ce-8db3-02c4706833f0
00000000-0000-0000-0000-000000000000	199	ckwwxktalzts	b2e3086e-a58f-4a8d-808c-61e38ee90b48	f	2026-04-28 12:42:25.048137+00	2026-04-28 12:42:25.048137+00	qm2jgrdckh3o	07b34561-59be-435d-9131-f94af72acb3a
00000000-0000-0000-0000-000000000000	201	urs65htei4yb	9110745a-3d71-49b9-b913-db9626e579d4	f	2026-04-28 13:50:46.360417+00	2026-04-28 13:50:46.360417+00	\N	28d9d7db-c4cf-4658-9f77-a729bcb9e7a8
00000000-0000-0000-0000-000000000000	203	inpwnoaubzll	9110745a-3d71-49b9-b913-db9626e579d4	t	2026-04-28 18:39:48.084389+00	2026-04-28 22:03:12.472364+00	75fb7ul4qyw6	6d227d8e-0fc4-45ce-8db3-02c4706833f0
00000000-0000-0000-0000-000000000000	189	molqqpkseomc	9110745a-3d71-49b9-b913-db9626e579d4	f	2026-04-28 09:34:13.927581+00	2026-04-28 09:34:13.927581+00	\N	6af51e7a-d2b5-40a0-9871-3c331a354a93
00000000-0000-0000-0000-000000000000	191	pl52tzpcdhy6	9110745a-3d71-49b9-b913-db9626e579d4	f	2026-04-28 10:20:57.492965+00	2026-04-28 10:20:57.492965+00	\N	fb842a95-e37c-42ef-99a6-1a0477038e99
00000000-0000-0000-0000-000000000000	187	usjr5cnzvjls	9110745a-3d71-49b9-b913-db9626e579d4	t	2026-04-28 09:08:37.91141+00	2026-04-28 11:46:10.746077+00	\N	27e468ca-be64-4d6d-8085-e19426fca4cc
00000000-0000-0000-0000-000000000000	195	qm2jgrdckh3o	b2e3086e-a58f-4a8d-808c-61e38ee90b48	t	2026-04-28 11:44:15.026341+00	2026-04-28 12:42:25.042875+00	\N	07b34561-59be-435d-9131-f94af72acb3a
00000000-0000-0000-0000-000000000000	198	74cg6bg6wsed	9110745a-3d71-49b9-b913-db9626e579d4	t	2026-04-28 12:35:14.494873+00	2026-04-28 17:13:15.893783+00	qo7i2fwkzyo4	6d227d8e-0fc4-45ce-8db3-02c4706833f0
00000000-0000-0000-0000-000000000000	202	75fb7ul4qyw6	9110745a-3d71-49b9-b913-db9626e579d4	t	2026-04-28 17:13:15.912742+00	2026-04-28 18:39:48.068624+00	74cg6bg6wsed	6d227d8e-0fc4-45ce-8db3-02c4706833f0
00000000-0000-0000-0000-000000000000	204	m6dfdeyay5f5	9110745a-3d71-49b9-b913-db9626e579d4	f	2026-04-28 22:03:12.484203+00	2026-04-28 22:03:12.484203+00	inpwnoaubzll	6d227d8e-0fc4-45ce-8db3-02c4706833f0
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at", "disabled") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_challenges" ("id", "user_id", "challenge_type", "session_data", "created_at", "expires_at") FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."webauthn_credentials" ("id", "user_id", "credential_id", "public_key", "attestation_type", "aaguid", "sign_count", "transports", "backup_eligible", "backed_up", "friendly_name", "created_at", "updated_at", "last_used_at") FROM stdin;
\.


--
-- Data for Name: app_user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."app_user_roles" ("id", "email", "role", "can_delete", "is_active", "created_at", "updated_at") FROM stdin;
7	feras@makinalube.ae	admin	t	t	2026-04-21 17:18:16.612387+00	2026-04-21 17:18:16.612387+00
12	ravi@makina-erp.com	editor	f	t	2026-04-21 17:29:03.88531+00	2026-04-21 17:29:03.88531+00
13	arun@makona-erp.com	editor	f	t	2026-04-21 17:29:03.88531+00	2026-04-21 17:29:03.88531+00
\.


--
-- Data for Name: brand_customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."brand_customer" ("id", "customer_id", "brand_symbol", "customer_brand", "created_at") FROM stdin;
31	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	SCH	SCH-MOR	2026-04-22 12:14:33.709185+00
32	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	GEN	GEN-MOR	2026-04-22 12:14:33.709185+00
33	57e62927-4dbf-4b1c-94ed-e9d817ab5271	KOR	KOR-IRQ	2026-04-22 12:14:51.517379+00
34	57e62927-4dbf-4b1c-94ed-e9d817ab5271	MAK	MAK-IRQ	2026-04-22 12:14:51.517379+00
35	f0142b82-0b70-4a16-9fa8-3e65aaf88702	PLS	PLS-LEB	2026-04-22 12:15:30.315594+00
36	f0142b82-0b70-4a16-9fa8-3e65aaf88702	PRS	PRS-LEB	2026-04-22 12:15:30.315594+00
37	f0142b82-0b70-4a16-9fa8-3e65aaf88702	MAK	MAK-LEB	2026-04-22 12:15:30.315594+00
38	f0142b82-0b70-4a16-9fa8-3e65aaf88702	SCH	SCH-LEB	2026-04-22 12:15:30.315594+00
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."profiles" ("id", "full_name", "email", "role", "is_active", "created_at", "updated_at") FROM stdin;
9110745a-3d71-49b9-b913-db9626e579d4	Feras	feras@makinalube.ae	admin	t	2026-04-14 10:33:39.779754+00	2026-04-14 10:37:56.482554+00
b2e3086e-a58f-4a8d-808c-61e38ee90b48		ravi@makina-erp.com	user	t	2026-04-21 17:09:50.292274+00	2026-04-21 17:09:50.292274+00
87367c74-b0dc-4d41-8763-53d1b975d58b		arun@makina-erp.com	user	t	2026-04-21 17:49:29.809837+00	2026-04-21 17:49:29.809837+00
ea85b86b-83c9-4a33-9365-362a42382c7d		accountants@makinalube.ae	user	t	2026-04-21 17:58:36.207324+00	2026-04-21 17:58:36.207324+00
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."brands" ("id", "brand_code", "brand_name", "notes", "is_active", "created_by", "created_at", "updated_at", "brand_symbol", "sort_order") FROM stdin;
4c46c738-3fa6-47f6-8115-972a235047e1	BR-0001	MAKINALUBE		t	\N	2026-04-14 11:36:03.758878+00	2026-04-14 17:48:47.41192+00	MAK	\N
2e2c4847-538b-4b5a-b6df-bec6948f5438	BR-0005	SCHNIEDER		t	\N	2026-04-14 11:50:29.704461+00	2026-04-14 17:49:04.417962+00	SCH	\N
84ca61b7-cc61-4138-9b3b-1549a6595b74	BR-0004	TOPLUBE		t	\N	2026-04-14 11:36:30.399175+00	2026-04-15 08:42:50.44381+00	TOP	\N
a8af63ad-a155-4318-9f51-67d7347070de	BR-0003	SINTRO		t	\N	2026-04-14 11:36:21.951466+00	2026-04-15 08:43:07.974976+00	STO	\N
6eebbb6e-f3f8-40d1-b61b-688978208169	BR-0002	SYNIONIC		t	\N	2026-04-14 11:36:14.231235+00	2026-04-15 08:43:24.273073+00	SYN	\N
2d9432cc-0413-4834-9de7-c70232fa80d9	BR-0006	GENERAL		t	\N	2026-04-16 12:06:26.923902+00	2026-04-16 12:06:42.330034+00	GEN	1
fb8cbf88-fd33-47b3-a174-15b6ae0a66dc	BR-0007	PROSYN		t	\N	2026-04-16 12:15:58.160637+00	2026-04-16 12:16:19.761914+00	PRS	2
14cec662-ac18-41e9-be5c-3a117125086c	BR-0008	POWER PLUS		t	\N	2026-04-16 12:16:24.579101+00	2026-04-16 12:16:36.515474+00	PLS	3
b3dc9f6d-e00c-47b2-929c-22353e9c2aa6	BR-0009	AOG		t	\N	2026-04-16 12:35:32.98617+00	2026-04-16 12:35:50.173941+00	AOG	4
14357a5a-3b29-4bfe-8f58-73a2c2de8cf9	BR-0010	KORI		t	\N	2026-04-22 08:25:07.861572+00	2026-04-22 08:25:19.706852+00	KOR	5
\.


--
-- Data for Name: brand_customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."brand_customers" ("id", "bc_code", "brand_id", "customer_id", "status", "notes", "is_active", "created_by", "created_at", "updated_at", "customer_brand_symbol") FROM stdin;
b631f8c3-9eca-4190-8398-7ec78b945a42	BC-0001	2e2c4847-538b-4b5a-b6df-bec6948f5438	07da18e5-b4cd-42ed-9438-0668d5e22321	active		t	\N	2026-04-14 17:50:44.52664+00	2026-04-14 17:50:44.52664+00	\N
8af264fb-c693-4ec3-912b-2b2300d850d2	BC-0002	4c46c738-3fa6-47f6-8115-972a235047e1	82e05b86-374b-4f94-977b-481090044719	active		t	\N	2026-04-14 17:51:02.051109+00	2026-04-14 17:51:02.051109+00	\N
\.


--
-- Data for Name: customer_brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."customer_brands" ("id", "customer_id", "brand_code", "created_at", "updated_at", "brand_symbol", "customer_brand") FROM stdin;
ec375697-dac4-4232-8d8d-2db3651f750a	c6dd8e64-8786-404f-8e7a-d296c0b1ef7b	MAK	2026-04-17 23:09:29.369033+00	2026-04-17 23:09:29.369033+00	MAK	MAK-LEB-1
e5d511e8-46a4-4daa-aac8-222a00c602b1	c6dd8e64-8786-404f-8e7a-d296c0b1ef7b	SCH	2026-04-17 23:41:41.347378+00	2026-04-17 23:41:41.347378+00	SCH	SCH-LEB-1
9737e292-cab6-46cb-a32a-d14bea7e128f	c6dd8e64-8786-404f-8e7a-d296c0b1ef7b	STO	2026-04-17 23:41:51.244679+00	2026-04-17 23:41:51.244679+00	STO	STO-LEB-1
68514b35-7ade-48c1-b9b0-6a68de26ec74	82e05b86-374b-4f94-977b-481090044719	MAK	2026-04-19 07:11:28.585476+00	2026-04-19 07:11:28.585476+00	MAK	MAK-MOR-1
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."customers" ("id", "customer_code", "customer_symbol", "customer_name", "address", "created_at", "notes", "city", "contact_person", "phone", "email", "country", "status") FROM stdin;
3ae1e6e8-9f1b-4a06-8d44-3e051380df72	CUST-0002	MOR	BEAZOL COMPANY SARL	HAY SALAMA 01 RUE 69 N 1 SIDI OTHMANE, CASABLANCA, MOROCCO	2026-04-19 10:47:18.698914+00	\N	CASABLANCA	BEAZOL	00212 661391906	BEAZOLCOMPANY@GMAIL.COM	Morocco	active
57e62927-4dbf-4b1c-94ed-e9d817ab5271	CUST-0003	IRQ	Oday Adnan Salim	Iraq	2026-04-22 08:37:50.628865+00	\N	BAGDAD	Oday Adnan Salim	00964 7702357821	saleem_hamd1980@yahoo.com	Iraq	active
f0142b82-0b70-4a16-9fa8-3e65aaf88702	CUST-0001	LEB	Mr. Mohamad Albast	Beirut, Lebanon	2026-04-19 10:46:53.588193+00	\N	Beirut	Mr. Mohamad Albast	00961-70-763789	saleem_hamd1980@yahoo.com	Lebanon	active
\.


--
-- Data for Name: item_master; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."item_master" ("id", "item_code", "item_name", "density", "status", "notes", "created_at", "updated_at", "sort_order") FROM stdin;
4debab15-19c1-421a-9e3c-afd931997c11	ITM-0002	SAE 40 API CF/SF	0.8900	active	\N	2026-04-22 08:34:20.577724+00	2026-04-22 08:34:20.577724+00	\N
6cb454fc-f8c8-43ca-abba-696a2075407b	ITM-0003	SAE 50 API CF	0.9000	active	\N	2026-04-22 08:34:49.11797+00	2026-04-22 08:34:49.11797+00	\N
6d0f4a51-1b80-4434-8ee9-b6f0d6fdba6a	ITM-0004	SAE 50 API CF/SF	0.9000	active	\N	2026-04-22 08:35:10.398011+00	2026-04-22 08:35:10.398011+00	\N
fb9e74f6-1143-4544-8a54-d932fc57f2f9	ITM-0005	SAE 50 API CH-4/SL	0.9000	active	\N	2026-04-22 08:35:30.309408+00	2026-04-22 08:35:30.309408+00	\N
425ca144-eff7-42ac-b85a-2016bfc90abe	ITM-0006	HD 60 API CF	0.9000	active	\N	2026-04-22 08:35:45.460095+00	2026-04-22 08:35:45.460095+00	\N
b78cb16f-eddc-4fc2-bf20-f5635e044427	ITM-0007	HD 60 API CF/SF	0.9000	active	\N	2026-04-22 08:36:07.598093+00	2026-04-22 08:36:07.598093+00	\N
bbf451dd-b148-4f79-8a0e-ee10d78648d6	ITM-0008	HD 60 API CH-4/SL	0.9000	active	\N	2026-04-22 08:36:28.199801+00	2026-04-22 08:36:28.199801+00	\N
dae9dcfa-a3f9-4195-be24-24eb724df388	ITM-0009	HD 70 API CH-4/SL	0.9000	active	\N	2026-04-22 08:36:48.055148+00	2026-04-22 08:36:48.055148+00	\N
2fb33059-04d0-4e9f-945c-b522be7fad72	ITM-0010	SAE 0W-20 API SN	0.8500	active	\N	2026-04-22 08:37:15.521679+00	2026-04-22 08:37:15.521679+00	\N
23edb048-ce89-41f0-9cda-1ead6ae88283	ITM-0011	SAE 0W-20 API SP	0.8500	active	\N	2026-04-22 08:37:31.978838+00	2026-04-22 08:37:31.978838+00	\N
e4c9b76e-7de2-49db-a99e-ace049202cec	ITM-0012	SAE 0W-20 API SN/CF	0.8500	active	\N	2026-04-22 08:37:58.327683+00	2026-04-22 08:37:58.327683+00	\N
4b9aaea9-50fe-4708-9e07-fc65e0bd5478	ITM-0013	SAE 0W-30 API SN	0.8500	active	\N	2026-04-22 08:38:34.786111+00	2026-04-22 08:38:34.786111+00	\N
956bf33e-95f7-468f-bdd4-596f7e8a7ce2	ITM-0014	SAE 0W-30 API SP	0.8500	active	\N	2026-04-22 08:38:59.075827+00	2026-04-22 08:38:59.075827+00	\N
893625bf-b52e-4d69-a7a0-143ca6b4aed5	ITM-0015	SAE 0W-30 API SN/CF	0.8500	active	\N	2026-04-22 08:39:26.673127+00	2026-04-22 08:39:26.673127+00	\N
053174e7-2592-4250-bbf4-fd59927029c8	ITM-0016	SAE 0W30 API CK-4	0.8500	active	\N	2026-04-22 08:39:43.630921+00	2026-04-22 08:39:43.630921+00	\N
ceb5999b-dea4-44de-bfba-ba53965d2cf3	ITM-0017	SAE 5W-20 API SN	0.8500	active	\N	2026-04-22 08:40:13.01739+00	2026-04-22 08:40:13.01739+00	\N
a72c0219-4ca7-4bf2-9851-c51de00d87aa	ITM-0018	SAE 5W-20 API SP	0.8500	active	\N	2026-04-22 08:40:38.483505+00	2026-04-22 08:40:38.483505+00	\N
ca65b514-7e5c-4be6-8897-1faf8d41eb6b	ITM-0019	SAE 5W-20 API SN/CF	0.8500	active	\N	2026-04-22 08:40:54.055464+00	2026-04-22 08:40:54.055464+00	\N
36c79b4a-143f-40b1-97c1-ab15c8b0a442	ITM-0020	SAE 5W-30 API SN	0.8600	active	\N	2026-04-22 08:41:27.457012+00	2026-04-22 08:41:27.457012+00	\N
9ce13906-3262-4a1a-afec-432ddc3d832b	ITM-0021	SAE 5W-30 API SP	0.8600	active	\N	2026-04-22 08:41:44.180576+00	2026-04-22 08:41:44.180576+00	\N
f657b07a-7b02-43c4-89a9-e66868fb81b2	ITM-0022	SAE 5W-30 API SN/CF	0.8600	active	\N	2026-04-22 08:42:03.866986+00	2026-04-22 08:42:03.866986+00	\N
7252955d-7d37-4a09-8e00-65474ff37196	ITM-0023	SAE 5W-30 API CI-4	0.8600	active	\N	2026-04-22 08:42:19.20686+00	2026-04-22 08:42:19.20686+00	\N
df6d1d4e-21a7-4eb9-9cff-2e293681cf9c	ITM-0024	SAE 5W-40 API SN	0.8700	active	\N	2026-04-22 08:42:52.716682+00	2026-04-22 08:42:52.716682+00	\N
839f4e46-9d9e-4e3a-be0e-02ef57206cea	ITM-0025	SAE 5W-40 API SP	0.8700	active	\N	2026-04-22 08:43:08.800209+00	2026-04-22 08:43:08.800209+00	\N
deb1e272-a835-4152-9b57-9ca1cdca95ad	ITM-0026	SAE 5W-40 API SN/CF	0.8700	active	\N	2026-04-22 08:43:30.990925+00	2026-04-22 08:43:30.990925+00	\N
89aa1017-3862-43b6-9ae3-319e37b1636c	ITM-0027	SAE 10W-30 API SN	0.8600	active	\N	2026-04-22 08:44:16.22844+00	2026-04-22 08:44:16.22844+00	\N
188134ff-5b0d-4cb4-805f-b66a3143a02f	ITM-0028	SAE 10W-30 API SP	0.8600	active	\N	2026-04-22 08:44:34.331498+00	2026-04-22 08:44:34.331498+00	\N
63a61285-3dc2-4403-a0e4-eb170c9f7a6a	ITM-0029	SAE 10W-30 API SN/CF	0.8600	active	\N	2026-04-22 08:44:55.534957+00	2026-04-22 08:44:55.534957+00	\N
b8e4b11d-9280-4f82-aad7-e0cfabbac7c4	ITM-0030	SAE 10W-40 API SN	0.8700	active	\N	2026-04-22 08:45:21.124234+00	2026-04-22 08:45:21.124234+00	\N
8e3b4c3a-72b7-4d7a-b606-239bb217c991	ITM-0031	SAE 10W-40 API SP	0.8700	active	\N	2026-04-22 08:46:47.152229+00	2026-04-22 08:46:47.152229+00	\N
034a5df6-7a30-41cf-99f9-0470d4074c47	ITM-0032	SAE 10W-40 API SN/CF	0.8700	active	\N	2026-04-22 08:47:03.402101+00	2026-04-22 08:47:03.402101+00	\N
8a3133e4-959d-4b47-98d6-d1c0ca88b5f1	ITM-0033	SAE 10W-40 API SL	0.8700	active	\N	2026-04-22 08:47:29.003063+00	2026-04-22 08:47:29.003063+00	\N
fbf7beb7-f01b-4f4f-8ed2-665f08241086	ITM-0034	SAE 10W-40 API SL/CF	0.8700	active	\N	2026-04-22 08:48:08.236062+00	2026-04-22 08:48:08.236062+00	\N
5fafa2ea-a387-45e3-b797-fa25512e74e7	ITM-0035	SAE 10W-40 API CI-4	0.8750	active	\N	2026-04-22 08:48:37.943186+00	2026-04-22 08:48:37.943186+00	\N
580f84eb-bbaf-4dfd-90c5-cbf24facabdf	ITM-0036	SAE 10W-40 API CI-4/SN	0.8750	active	\N	2026-04-22 08:49:03.552067+00	2026-04-22 08:49:03.552067+00	\N
77346428-1d56-46bb-8b1c-15188a117db9	ITM-0037	SAE 15W-40 API SL	0.8780	active	\N	2026-04-22 08:49:25.071138+00	2026-04-22 08:49:25.071138+00	\N
8df2d886-2d3b-4d4b-a116-e6b35e3df0c7	ITM-0038	SAE 15W-40 API SL/CF	0.8780	active	\N	2026-04-22 08:49:51.676617+00	2026-04-22 08:50:03.710559+00	\N
06819647-29e5-49fd-b4de-dfef5d3cd16f	ITM-0039	SAE 15W-40 API CI-4	0.8780	active	\N	2026-04-22 08:50:22.619104+00	2026-04-22 08:50:22.619104+00	\N
7477fc70-d908-413f-a267-8a3e5c1466a4	ITM-0040	SAE 15W-40 API CI-4/SN	0.8780	active	\N	2026-04-22 08:50:41.955333+00	2026-04-22 08:50:41.955333+00	\N
05e81656-d112-4a6b-a003-42c7ea37015a	ITM-0041	SAE 15W-40 API CH-4/SL	0.8780	active	\N	2026-04-22 08:50:57.244401+00	2026-04-22 08:50:57.244401+00	\N
1bb7314c-a374-4fdc-916e-7972e1b012d0	ITM-0042	SAE 20W-50 API SL	0.8900	active	\N	2026-04-22 08:51:28.350455+00	2026-04-22 08:51:28.350455+00	\N
a0e051fd-d16d-45be-aaec-89f51abbb58a	ITM-0043	SAE  20W-50 API SL/CF	0.8900	active	\N	2026-04-22 08:51:56.946355+00	2026-04-22 08:51:56.946355+00	\N
34a441d9-ec5a-40a5-851c-a976ebbcec58	ITM-0044	SAE 20W-50 API CI-4	0.8900	active	\N	2026-04-22 08:52:13.521967+00	2026-04-22 08:52:13.521967+00	\N
66d015ec-9be2-4285-bb77-432fe7e1ab35	ITM-0045	SAE  20W-50 API CI-4/SN	0.8900	active	\N	2026-04-22 08:52:30.350579+00	2026-04-22 08:52:30.350579+00	\N
9f700e74-ac21-43f0-a5b6-2a11e463d187	ITM-0046	SAE  20W50 API CH-4/SL	0.8900	active	\N	2026-04-22 08:52:44.291744+00	2026-04-22 08:52:44.291744+00	\N
a4488ad5-eccf-430d-be4b-63a979918e5b	ITM-0047	ATF DEX II	0.8500	active	\N	2026-04-22 08:52:58.844015+00	2026-04-22 08:52:58.844015+00	\N
4ae1936e-615c-4e78-8b89-ee8a6792e8a5	ITM-0049	ATF DEX VI	0.8500	active	\N	2026-04-22 08:53:34.793187+00	2026-04-22 08:53:34.793187+00	\N
a2935ed5-d7ae-4381-8dfc-493f4b276140	ITM-0050	ATF CVT	0.8500	active	\N	2026-04-22 08:53:55.601073+00	2026-04-22 08:53:55.601073+00	\N
edeb1756-43e9-41ce-91cb-2616bcc7d868	ITM-0051	SAE 90 API GL-4	0.9000	active	\N	2026-04-22 09:14:21.205898+00	2026-04-22 09:14:21.205898+00	\N
b462ca28-2575-49d9-8bc2-5dfc33361f8b	ITM-0052	SAE 140 API GL-4	0.9000	active	\N	2026-04-22 09:14:42.625078+00	2026-04-22 09:14:42.625078+00	\N
79bbd001-7cc3-47c7-87df-c1798824228c	ITM-0053	SAE 90 API GL-5	0.9000	active	\N	2026-04-22 09:14:59.656836+00	2026-04-22 09:14:59.656836+00	\N
c47d2e00-2b9f-483f-9c15-2ef684166fac	ITM-0054	SAE 140 API GL-5	0.9000	active	\N	2026-04-22 09:15:15.103855+00	2026-04-22 09:15:15.103855+00	\N
34fedcc0-16d7-4dfe-bb28-2e30a017288c	ITM-0055	SAE 80W-90 API GL-5	0.9000	active	\N	2026-04-22 09:15:36.83462+00	2026-04-22 09:15:36.83462+00	\N
7f5d1403-fbd8-4e7e-86df-23862aa7c072	ITM-0001	SAE 40 API CF	0.8900	active	\N	2026-04-22 08:33:47.977598+00	2026-04-22 08:33:47.977598+00	\N
5855594b-90ed-4fea-8b28-572007beedc1	ITM-0056	SAE 85W-140 API GL-5	0.9000	active	\N	2026-04-22 09:15:54.849142+00	2026-04-22 09:15:54.849142+00	\N
092b4a23-1f7b-4a33-8fc9-c37842b70ee4	ITM-0057	H 32	0.8500	active	\N	2026-04-22 09:16:15.356142+00	2026-04-22 09:16:15.356142+00	\N
98326ffa-d049-4850-9240-bf0bed0a63eb	ITM-0058	H 46	0.8600	active	\N	2026-04-22 09:16:32.162416+00	2026-04-22 09:16:32.162416+00	\N
e0c27268-cb1c-4c81-b3c4-1c236a75a249	ITM-0059	H 68	0.8780	active	\N	2026-04-22 09:16:45.037162+00	2026-04-22 09:16:45.037162+00	\N
1ef0b4b0-9bcb-4c40-8568-c1192429e106	ITM-0060	H 100	0.8900	active	\N	2026-04-22 09:17:11.306165+00	2026-04-22 09:17:11.306165+00	\N
5e5447d9-84be-4483-a323-cd066edce964	ITM-0061	H 220	0.8950	active	\N	2026-04-22 09:17:58.223022+00	2026-04-22 09:17:58.223022+00	\N
8bdf17d8-9e4a-4f0a-a196-4814ade4a00a	ITM-0062	SAE 10W-40 API SL (4T)	0.8700	active	\N	2026-04-22 09:18:20.292851+00	2026-04-22 09:18:20.292851+00	\N
c6cff88c-024a-4cae-97e7-d0630bdce9ca	ITM-0063	SAE 20W-50 API SL (4T)	0.8900	active	\N	2026-04-22 09:18:36.048906+00	2026-04-22 09:18:36.048906+00	\N
0cafb352-f793-42e0-b445-a811541c5078	ITM-0064	MARENG 3005	0.8900	active	\N	2026-04-22 09:18:55.707362+00	2026-04-22 09:18:55.707362+00	\N
bb83d19a-544b-4374-a12d-876da4293f58	ITM-0065	MARENG 3006	0.8900	active	\N	2026-04-22 09:19:08.840796+00	2026-04-22 09:19:08.840796+00	\N
89979bdd-f084-47d4-87af-f672511eab4d	ITM-0066	MARENG 3012	0.8900	active	\N	2026-04-22 09:19:21.367652+00	2026-04-22 09:19:21.367652+00	\N
7c6e9d95-7152-47fe-b57e-f0ecd563d03f	ITM-0067	MARENG 3015	0.8900	active	\N	2026-04-22 09:19:37.642635+00	2026-04-22 09:19:37.642635+00	\N
141f4f72-447b-4d98-bd50-dc8cb9b39407	ITM-0068	MARENG 3020	0.8900	active	\N	2026-04-22 09:19:50.156018+00	2026-04-22 09:19:50.156018+00	\N
438fe15b-2921-4073-b7d3-76f23cd75c6e	ITM-0069	MARENG 3030	0.8900	active	\N	2026-04-22 09:20:02.58251+00	2026-04-22 09:20:02.58251+00	\N
313cb235-e263-4040-9399-e59694d22148	ITM-0070	MARENG 4012	0.8950	active	\N	2026-04-22 09:20:24.698704+00	2026-04-22 09:20:24.698704+00	\N
02976f32-7b13-4ca8-b026-3880b012e255	ITM-0071	MARENG 4015	0.8950	active	\N	2026-04-22 09:20:36.796974+00	2026-04-22 09:20:36.796974+00	\N
a480fbf5-5e06-44ea-a7f5-2c0b25f267a4	ITM-0072	MARENG 4020	0.8950	active	\N	2026-04-22 09:20:55.544462+00	2026-04-22 09:20:55.544462+00	\N
34ef1718-4734-4bab-a1e7-e2abb5c7f43d	ITM-0073	MARENG 4030	0.8950	active	\N	2026-04-22 09:21:07.921524+00	2026-04-22 09:21:07.921524+00	\N
7a104fb4-c28e-4959-bd1e-f0c57da46c57	ITM-0075	MARENG 4050	0.8950	active	\N	2026-04-22 09:21:32.164711+00	2026-04-22 09:21:32.164711+00	\N
a631d29a-f7e5-4fe1-ba30-400133673e21	ITM-0077	MARCYL 5070	0.9400	active	\N	2026-04-22 09:22:07.140077+00	2026-04-22 09:22:07.140077+00	\N
c51e0404-c2f2-4abc-bbb2-9a5115ec8d8b	ITM-0079	MARGER M-150	0.9000	active	\N	2026-04-22 09:22:54.964627+00	2026-04-22 09:22:54.964627+00	\N
4a24bbc7-aad4-4459-9238-7f0110416a64	ITM-0081	MARHYD H-15H	0.8300	active	\N	2026-04-22 09:23:30.767865+00	2026-04-22 09:23:30.767865+00	\N
16dbb445-ea77-44c5-b886-8e45f63e257a	ITM-0083	MARHYD H-68H	0.8780	active	\N	2026-04-22 09:24:06.95533+00	2026-04-22 09:24:06.95533+00	\N
197b1d9c-39c2-4b8d-ac91-d4ad28afafda	ITM-0074	MARENG 4040	0.8950	active	\N	2026-04-22 09:21:21.041656+00	2026-04-22 09:21:21.041656+00	\N
8aed0ac6-5040-4202-8806-a5f12dcc54db	ITM-0076	MARCYL 5040LS	0.9400	active	\N	2026-04-22 09:21:53.848893+00	2026-04-22 09:22:20.359108+00	\N
4861b490-e7b1-4a4c-8cca-aef55dad937d	ITM-0078	MARGER M-100	0.9000	active	\N	2026-04-22 09:22:36.354276+00	2026-04-22 09:22:36.354276+00	\N
296e3015-c0d8-4b00-b461-36d777d47f8a	ITM-0080	MARGER M-220	0.9000	active	\N	2026-04-22 09:23:14.846229+00	2026-04-22 09:23:14.846229+00	\N
200cc9a5-ece9-495d-b5c0-4b180713606c	ITM-0082	MARHYD H-32H	0.8500	active	\N	2026-04-22 09:23:54.676647+00	2026-04-22 09:23:54.676647+00	\N
7caf12a2-4efa-4044-90f3-0b7c552ee290	ITM-0084	MARHYD H-100H	0.8940	active	\N	2026-04-22 09:24:41.805065+00	2026-04-22 09:24:41.805065+00	\N
66457664-4b06-4197-9119-1b2052edac3f	ITM-0085	SAE 15W-40 API CF-4	0.8780	active	\N	2026-04-22 09:36:32.3987+00	2026-04-22 09:38:17.994685+00	\N
f8ea42e0-15d6-4092-8ef5-544c494bd376	ITM-0086	SAE 20W-50 API CF-4	0.8900	active	\N	2026-04-22 09:38:39.138865+00	2026-04-22 09:38:39.138865+00	\N
99257768-82e1-4983-9985-2458aee4dce7	ITM-0048	ATF DEX III (WHITE)	0.8500	active	\N	2026-04-22 08:53:16.270185+00	2026-04-22 09:44:05.848272+00	\N
6118edbe-78dd-4e42-9853-c00024de0d6f	ITM-0087	ATF DEX-III (RED)	0.8500	active	\N	2026-04-22 09:44:25.013631+00	2026-04-22 09:44:25.013631+00	\N
9db9b644-3180-4c2d-b2b7-20790e846038	ITM-0088	SAE 40 API CH-4/SL	0.8900	active	\N	2026-04-22 09:50:44.506448+00	2026-04-22 09:50:44.506448+00	\N
c540c32a-07ed-48df-84b1-13a7d359cd46	ITM-0089	SAE 50 API CF-4/SL	0.9000	active	\N	2026-04-22 10:22:47.361413+00	2026-04-22 10:22:47.361413+00	\N
5798bcec-31aa-4c36-8ffa-f4271143af08	ITM-0090	HD 70 API CF	0.9000	active	\N	2026-04-26 10:38:12.363631+00	2026-04-26 10:38:12.363631+00	\N
f5ca083f-dd7a-4edd-ac60-cbf794e580fd	ITM-0091	HD 70 API CF/SF	0.9000	active	\N	2026-04-26 10:44:28.174657+00	2026-04-26 10:44:28.174657+00	\N
532fd314-5c9f-4b42-9559-1c100b66b8f2	ITM-0092	SAE 15W40 API SL/CF	0.8780	active	\N	2026-04-26 10:51:25.044443+00	2026-04-26 10:51:25.044443+00	\N
bf567032-4f6a-45c2-9dd5-2fb5046e1d54	ITM-0093	SAE 10W-30 API SL/CF	0.8600	active	\N	2026-04-26 10:53:05.861953+00	2026-04-26 10:53:05.861953+00	\N
b4cbe722-0292-4c84-b753-435f8121b150	ITM-0094	SAE 40W-50 API CF/SF	0.9000	active	\N	2026-04-26 10:54:17.582704+00	2026-04-26 10:54:17.582704+00	\N
\.


--
-- Data for Name: customer_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."customer_items" ("id", "customer_id", "customer_brand_id", "item_id", "sub_brand", "created_at", "description") FROM stdin;
73	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	4debab15-19c1-421a-9e3c-afd931997c11	SUPER HD PLUS	2026-04-23 04:58:26.13776+00	\N
74	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS	2026-04-23 04:58:47.232562+00	\N
77	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	a0e051fd-d16d-45be-aaec-89f51abbb58a	UNIMAX HD PLUS	2026-04-23 05:00:19.448413+00	\N
78	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	05e81656-d112-4a6b-a003-42c7ea37015a	ULTRA HD PLUS	2026-04-23 05:00:58.022791+00	\N
79	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	9f700e74-ac21-43f0-a5b6-2a11e463d187	ULTRA HD PLUS	2026-04-23 05:01:27.604061+00	\N
81	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	c6cff88c-024a-4cae-97e7-d0630bdce9ca	\N	2026-04-23 05:02:09.496763+00	\N
82	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	7477fc70-d908-413f-a267-8a3e5c1466a4	SUPERIOR HD	2026-04-23 05:02:37.289325+00	\N
83	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	edeb1756-43e9-41ce-91cb-2616bcc7d868	TRIDON SUPER GEAR	2026-04-23 05:03:18.386752+00	\N
84	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR	2026-04-23 05:03:43.411935+00	\N
85	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	34fedcc0-16d7-4dfe-bb28-2e30a017288c	TRIDON SUPER GEAR HD	2026-04-23 05:04:23.355834+00	\N
86	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD	2026-04-23 05:04:52.572702+00	\N
87	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	b8e4b11d-9280-4f82-aad7-e0cfabbac7c4	PRO-SYN	2026-04-23 05:06:25.701908+00	\N
88	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	e0c27268-cb1c-4c81-b3c4-1c236a75a249	TRIDON	2026-04-23 05:06:48.985946+00	\N
89	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	99257768-82e1-4983-9985-2458aee4dce7	TRIDON	2026-04-23 05:07:43.553727+00	\N
90	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	6118edbe-78dd-4e42-9853-c00024de0d6f	TRIDON	2026-04-23 05:07:52.099507+00	\N
91	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON	2026-04-23 05:08:01.036272+00	\N
92	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	9db9b644-3180-4c2d-b2b7-20790e846038	\N	2026-04-23 05:17:53.144287+00	\N
93	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	fb9e74f6-1143-4544-8a54-d932fc57f2f9	\N	2026-04-23 05:18:02.60529+00	\N
94	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	05e81656-d112-4a6b-a003-42c7ea37015a	\N	2026-04-23 05:18:42.545701+00	\N
95	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	9f700e74-ac21-43f0-a5b6-2a11e463d187	\N	2026-04-23 05:19:06.61633+00	\N
96	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	fbf7beb7-f01b-4f4f-8ed2-665f08241086	\N	2026-04-23 05:21:43.296894+00	\N
97	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	a0e051fd-d16d-45be-aaec-89f51abbb58a	\N	2026-04-23 05:22:05.799692+00	\N
98	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	f657b07a-7b02-43c4-89a9-e66868fb81b2	\N	2026-04-23 05:23:36.334639+00	\N
99	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	034a5df6-7a30-41cf-99f9-0470d4074c47	\N	2026-04-23 05:23:51.538778+00	\N
100	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	8bdf17d8-9e4a-4f0a-a196-4814ade4a00a	\N	2026-04-23 05:24:24.801473+00	\N
101	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	c6cff88c-024a-4cae-97e7-d0630bdce9ca	\N	2026-04-23 05:24:33.999927+00	\N
102	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	99257768-82e1-4983-9985-2458aee4dce7	\N	2026-04-23 05:25:02.853767+00	\N
103	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	6118edbe-78dd-4e42-9853-c00024de0d6f	\N	2026-04-23 05:25:10.005055+00	\N
104	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	e0c27268-cb1c-4c81-b3c4-1c236a75a249	\N	2026-04-23 05:25:31.49016+00	\N
105	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	7f5d1403-fbd8-4e7e-86df-23862aa7c072	\N	2026-04-23 05:29:28.632314+00	\N
106	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	7f5d1403-fbd8-4e7e-86df-23862aa7c072	\N	2026-04-23 05:29:48.569202+00	\N
107	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	6cb454fc-f8c8-43ca-abba-696a2075407b	\N	2026-04-23 05:30:11.50931+00	\N
108	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	6cb454fc-f8c8-43ca-abba-696a2075407b	\N	2026-04-23 05:30:22.169724+00	\N
109	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	66457664-4b06-4197-9119-1b2052edac3f	\N	2026-04-23 05:33:11.005688+00	\N
110	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	66457664-4b06-4197-9119-1b2052edac3f	\N	2026-04-23 05:33:28.108047+00	\N
111	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	f8ea42e0-15d6-4092-8ef5-544c494bd376	\N	2026-04-23 05:35:32.114891+00	\N
112	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	f8ea42e0-15d6-4092-8ef5-544c494bd376	\N	2026-04-23 05:35:47.999293+00	\N
113	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	fbf7beb7-f01b-4f4f-8ed2-665f08241086	\N	2026-04-23 05:37:40.920998+00	\N
114	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	a0e051fd-d16d-45be-aaec-89f51abbb58a	\N	2026-04-23 05:37:53.559108+00	\N
115	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	fbf7beb7-f01b-4f4f-8ed2-665f08241086	\N	2026-04-23 05:38:44.509972+00	\N
116	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	a0e051fd-d16d-45be-aaec-89f51abbb58a	\N	2026-04-23 05:39:13.655108+00	\N
119	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	8bdf17d8-9e4a-4f0a-a196-4814ade4a00a	\N	2026-04-23 05:42:06.470498+00	\N
120	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	8bdf17d8-9e4a-4f0a-a196-4814ade4a00a	\N	2026-04-23 05:42:16.04815+00	\N
121	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	c6cff88c-024a-4cae-97e7-d0630bdce9ca	\N	2026-04-23 05:42:37.751885+00	\N
126	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	c6cff88c-024a-4cae-97e7-d0630bdce9ca	\N	2026-04-23 05:43:46.985442+00	\N
127	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	edeb1756-43e9-41ce-91cb-2616bcc7d868	\N	2026-04-23 05:44:48.774712+00	\N
128	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	b462ca28-2575-49d9-8bc2-5dfc33361f8b	\N	2026-04-23 05:45:02.123253+00	\N
129	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	edeb1756-43e9-41ce-91cb-2616bcc7d868	\N	2026-04-23 05:45:15.849291+00	\N
130	f0142b82-0b70-4a16-9fa8-3e65aaf88702	38	b462ca28-2575-49d9-8bc2-5dfc33361f8b	\N	2026-04-23 05:45:29.104336+00	\N
131	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	e0c27268-cb1c-4c81-b3c4-1c236a75a249	\N	2026-04-23 05:54:43.937446+00	\N
132	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	e0c27268-cb1c-4c81-b3c4-1c236a75a249	\N	2026-04-23 05:54:51.692952+00	\N
133	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	99257768-82e1-4983-9985-2458aee4dce7	\N	2026-04-23 05:55:12.784616+00	\N
134	f0142b82-0b70-4a16-9fa8-3e65aaf88702	35	6118edbe-78dd-4e42-9853-c00024de0d6f	\N	2026-04-23 05:55:18.553477+00	\N
135	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	99257768-82e1-4983-9985-2458aee4dce7	\N	2026-04-23 05:55:27.151229+00	\N
136	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	6118edbe-78dd-4e42-9853-c00024de0d6f	\N	2026-04-23 05:55:38.604827+00	\N
137	f0142b82-0b70-4a16-9fa8-3e65aaf88702	36	b462ca28-2575-49d9-8bc2-5dfc33361f8b	\N	2026-04-23 06:02:52.234893+00	\N
80	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	8bdf17d8-9e4a-4f0a-a196-4814ade4a00a	\N	2026-04-23 05:01:56.964984+00	Lubrucants
76	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	fbf7beb7-f01b-4f4f-8ed2-665f08241086	UNIMAX HD PLUS	2026-04-23 04:59:56.037587+00	\N
138	57e62927-4dbf-4b1c-94ed-e9d817ab5271	33	a0e051fd-d16d-45be-aaec-89f51abbb58a	\N	2026-04-26 10:36:04.645358+00	\N
140	57e62927-4dbf-4b1c-94ed-e9d817ab5271	33	5798bcec-31aa-4c36-8ffa-f4271143af08	\N	2026-04-26 10:38:27.020038+00	\N
139	57e62927-4dbf-4b1c-94ed-e9d817ab5271	33	6d0f4a51-1b80-4434-8ee9-b6f0d6fdba6a	\N	2026-04-26 10:36:56.165642+00	\N
141	57e62927-4dbf-4b1c-94ed-e9d817ab5271	33	ceb5999b-dea4-44de-bfba-ba53965d2cf3	\N	2026-04-26 10:41:25.51538+00	\N
142	57e62927-4dbf-4b1c-94ed-e9d817ab5271	33	36c79b4a-143f-40b1-97c1-ab15c8b0a442	\N	2026-04-26 10:41:40.156156+00	\N
143	57e62927-4dbf-4b1c-94ed-e9d817ab5271	33	89aa1017-3862-43b6-9ae3-319e37b1636c	\N	2026-04-26 10:42:00.164294+00	\N
144	57e62927-4dbf-4b1c-94ed-e9d817ab5271	34	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS	2026-04-26 10:42:43.95185+00	\N
145	57e62927-4dbf-4b1c-94ed-e9d817ab5271	34	dae9dcfa-a3f9-4195-be24-24eb724df388	SUPER HD PLUS	2026-04-26 10:44:43.719289+00	\N
146	57e62927-4dbf-4b1c-94ed-e9d817ab5271	34	a0e051fd-d16d-45be-aaec-89f51abbb58a	UNIMAX HD PLUS	2026-04-26 10:45:43.686255+00	\N
147	57e62927-4dbf-4b1c-94ed-e9d817ab5271	34	05e81656-d112-4a6b-a003-42c7ea37015a	ULTRA HD PLUS	2026-04-26 10:46:09.827159+00	\N
148	57e62927-4dbf-4b1c-94ed-e9d817ab5271	34	9f700e74-ac21-43f0-a5b6-2a11e463d187	ULTRA HD PLUS	2026-04-26 10:46:23.114952+00	\N
149	57e62927-4dbf-4b1c-94ed-e9d817ab5271	34	2fb33059-04d0-4e9f-945c-b522be7fad72	PRO-SYN	2026-04-26 10:46:53.44791+00	\N
150	57e62927-4dbf-4b1c-94ed-e9d817ab5271	34	ceb5999b-dea4-44de-bfba-ba53965d2cf3	PRO-SYN	2026-04-26 10:47:19.218782+00	\N
151	57e62927-4dbf-4b1c-94ed-e9d817ab5271	34	36c79b4a-143f-40b1-97c1-ab15c8b0a442	\N	2026-04-26 10:47:32.3421+00	\N
152	57e62927-4dbf-4b1c-94ed-e9d817ab5271	34	89aa1017-3862-43b6-9ae3-319e37b1636c	PRO-SYN	2026-04-26 10:47:53.647435+00	\N
153	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	4debab15-19c1-421a-9e3c-afd931997c11	\N	2026-04-26 10:48:46.090188+00	\N
154	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	6d0f4a51-1b80-4434-8ee9-b6f0d6fdba6a	\N	2026-04-26 10:48:58.640318+00	\N
155	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	edeb1756-43e9-41ce-91cb-2616bcc7d868	\N	2026-04-26 10:50:42.275654+00	\N
156	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	e0c27268-cb1c-4c81-b3c4-1c236a75a249	\N	2026-04-26 10:50:58.943977+00	\N
157	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	8df2d886-2d3b-4d4b-a116-e6b35e3df0c7	\N	2026-04-26 10:51:45.184643+00	\N
158	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	a4488ad5-eccf-430d-be4b-63a979918e5b	\N	2026-04-26 10:52:06.950016+00	\N
159	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	fbf7beb7-f01b-4f4f-8ed2-665f08241086	\N	2026-04-26 10:52:28.398044+00	\N
160	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	bf567032-4f6a-45c2-9dd5-2fb5046e1d54	\N	2026-04-26 10:53:41.113498+00	\N
161	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	b4cbe722-0292-4c84-b753-435f8121b150	\N	2026-04-26 10:54:41.169569+00	\N
162	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	8bdf17d8-9e4a-4f0a-a196-4814ade4a00a	\N	2026-04-26 10:54:54.497754+00	\N
163	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	32	a0e051fd-d16d-45be-aaec-89f51abbb58a	\N	2026-04-26 10:55:23.959333+00	\N
164	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	31	ca65b514-7e5c-4be6-8897-1faf8d41eb6b	\N	2026-04-26 10:58:04.963246+00	\N
165	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	31	8df2d886-2d3b-4d4b-a116-e6b35e3df0c7	\N	2026-04-26 10:58:26.285656+00	\N
166	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	31	034a5df6-7a30-41cf-99f9-0470d4074c47	\N	2026-04-26 10:58:42.516199+00	\N
167	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	31	05e81656-d112-4a6b-a003-42c7ea37015a	\N	2026-04-26 10:59:11.259523+00	\N
168	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	31	e0c27268-cb1c-4c81-b3c4-1c236a75a249	\N	2026-04-26 10:59:20.573966+00	\N
169	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	31	06819647-29e5-49fd-b4de-dfef5d3cd16f	\N	2026-04-26 10:59:36.94864+00	\N
170	3ae1e6e8-9f1b-4a06-8d44-3e051380df72	31	fb9e74f6-1143-4544-8a54-d932fc57f2f9	\N	2026-04-26 10:59:58.125161+00	\N
75	f0142b82-0b70-4a16-9fa8-3e65aaf88702	37	ceb5999b-dea4-44de-bfba-ba53965d2cf3	PRO-SYN	2026-04-23 04:59:23.234966+00	Lubrucants
\.


--
-- Data for Name: formula_headers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."formula_headers" ("id", "customer_id", "customer_code", "customer_symbol", "customer_name", "customer_brand_id", "brand_symbol", "customer_brand", "item_id", "item_code", "item_name", "tbn", "density", "loss_pct", "rm_loss_pct", "fix_margin", "revision", "total_qty", "total_effective_qty", "raw_cost", "total_cost_with_loss", "sell_total", "cost_per_kg", "cost_per_lit", "sell_per_kg", "sell_per_lit", "created_at", "updated_at", "version_date", "sub_brand", "formula_code_generated", "note") FROM stdin;
23	f0142b82-0b70-4a16-9fa8-3e65aaf88702	CUST-0001	LEB	Mr. Mohamad Albast	37	MAK	MAK-LEB	4debab15-19c1-421a-9e3c-afd931997c11	ITM-0002	SAE 40 API CF/SF	10.000000	0.900000	0.000000	0.000000	0.000000	1	100.000000	100.000000	1294.539000	1294.539000	1294.539000	1294.539000	1.165000	1294.539000	1.165000	2026-04-28 12:20:32.537202+00	2026-04-28 12:20:32.537202+00	2026-04-28	SUPER HD PLUS	FORM-0001-40	\N
24	f0142b82-0b70-4a16-9fa8-3e65aaf88702	CUST-0001	LEB	Mr. Mohamad Albast	37	MAK	MAK-LEB	c540c32a-07ed-48df-84b1-13a7d359cd46	ITM-0089	SAE 50 API CF-4/SL	10.000000	0.900000	0.000000	0.000000	0.000000	1	100.000000	100.000000	1360.340000	1360.340000	1360.340000	1360.340000	1.224000	1360.340000	1.224000	2026-04-28 12:24:33.572772+00	2026-04-28 12:24:33.572772+00	2026-04-28	ULTRA HD PLUS	FORM-0002-50	\N
25	f0142b82-0b70-4a16-9fa8-3e65aaf88702	CUST-0001	LEB	Mr. Mohamad Albast	37	MAK	MAK-LEB	ceb5999b-dea4-44de-bfba-ba53965d2cf3	ITM-0017	SAE 5W-20 API SN	8.000000	0.850000	0.000000	0.000000	0.000000	1	100.000000	100.000000	1444.870000	1444.870000	1444.870000	1444.870000	1.228000	1444.870000	1.228000	2026-04-28 12:38:48.169717+00	2026-04-28 12:38:48.169717+00	2026-04-28	PRO-SYN	FORM-0003-5W-20	\N
26	f0142b82-0b70-4a16-9fa8-3e65aaf88702	CUST-0001	LEB	Mr. Mohamad Albast	37	MAK	MAK-LEB	fbf7beb7-f01b-4f4f-8ed2-665f08241086	ITM-0034	SAE 10W-40 API SL/CF	8.000000	0.878000	0.000000	0.000000	0.000000	1	100.000000	100.000000	1328.470000	1328.470000	1328.470000	1328.470000	1.166000	1328.470000	1.166000	2026-04-28 12:42:01.415311+00	2026-04-28 12:42:01.415311+00	2026-04-28	UNIMAX HD PLUS	FORM-0004-10W-40	\N
27	f0142b82-0b70-4a16-9fa8-3e65aaf88702	CUST-0001	LEB	Mr. Mohamad Albast	37	MAK	MAK-LEB	a0e051fd-d16d-45be-aaec-89f51abbb58a	ITM-0043	SAE  20W-50 API SL/CF	8.000000	0.890000	0.000000	0.000000	0.000000	1	100.000000	100.000000	1342.390000	1342.390000	1342.390000	1342.390000	1.195000	1342.390000	1.195000	2026-04-28 12:44:14.886056+00	2026-04-28 12:44:14.886056+00	2026-04-28	UNIMAX HD PLUS	FORM-0005-20W-50	\N
\.


--
-- Data for Name: formula_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."formula_lines" ("id", "formula_id", "rm_id", "rm_code", "rm_name", "unit", "wt_pct", "qty_kg", "rm_price", "effective_qty_kg", "line_cost", "sort_order", "created_at") FROM stdin;
59	23	08706734-e16f-4446-a7c3-a3886ac8031d	RM-0001	SN 500 GI.Bulk.	Wt%	90.695000	90.695000	1110.000000	90.695000	1006.714000	1	2026-04-28 12:20:32.838193+00
60	23	eed3c69a-8513-4dcf-a984-78fa0bab4e61	RM-0026	SCH 1222.	Wt%	5.000000	5.000000	2050.000000	5.000000	102.500000	2	2026-04-28 12:20:32.838193+00
61	23	d5d2615d-47db-459a-9249-35e51a282f79	RM-0009	AD.LUBIMAX 1600HT	Wt%	2.800000	2.800000	4300.000000	2.800000	120.400000	3	2026-04-28 12:20:32.838193+00
62	23	477e1c8d-326e-4b9b-958f-b35a578f153b	RM-0007	AD.HYBASE C 402	Wt%	1.200000	1.200000	4300.000000	1.200000	51.600000	4	2026-04-28 12:20:32.838193+00
63	23	6a9150b6-01cf-455a-89e9-b71022dd5d91	RM-0016	AD.VISCOPLEX 343	Wt%	0.300000	0.300000	4300.000000	0.300000	12.900000	5	2026-04-28 12:20:32.838193+00
64	23	310bc347-af0f-433f-86db-a4ea34cd9b8f	RM-0013	AD.MAK AF	Wt%	0.005000	0.005000	8500.000000	0.005000	0.425000	6	2026-04-28 12:20:32.838193+00
65	24	08706734-e16f-4446-a7c3-a3886ac8031d	RM-0001	SN 500 GI.Bulk.	Wt%	83.695000	83.695000	1110.000000	83.695000	929.015000	1	2026-04-28 12:24:33.792911+00
66	24	eed3c69a-8513-4dcf-a984-78fa0bab4e61	RM-0026	SCH 1222.	Wt%	12.000000	12.000000	2050.000000	12.000000	246.000000	2	2026-04-28 12:24:33.792911+00
67	24	d5d2615d-47db-459a-9249-35e51a282f79	RM-0009	AD.LUBIMAX 1600HT	Wt%	2.800000	2.800000	4300.000000	2.800000	120.400000	3	2026-04-28 12:24:33.792911+00
68	24	477e1c8d-326e-4b9b-958f-b35a578f153b	RM-0007	AD.HYBASE C 402	Wt%	1.200000	1.200000	4300.000000	1.200000	51.600000	4	2026-04-28 12:24:33.792911+00
69	24	6a9150b6-01cf-455a-89e9-b71022dd5d91	RM-0016	AD.VISCOPLEX 343	Wt%	0.300000	0.300000	4300.000000	0.300000	12.900000	5	2026-04-28 12:24:33.792911+00
70	24	310bc347-af0f-433f-86db-a4ea34cd9b8f	RM-0013	AD.MAK AF	Wt%	0.005000	0.005000	8500.000000	0.005000	0.425000	6	2026-04-28 12:24:33.792911+00
71	25	2203d314-d161-400d-99c8-3338798be4da	RM-0004	BO.N 150	Wt%	66.995000	66.995000	1100.000000	66.995000	736.945000	1	2026-04-28 12:38:48.400571+00
72	25	f5f393d3-acdd-4a61-99da-ced8875c9b99	RM-0020	BO.4 CST	Wt%	25.000000	25.000000	1300.000000	25.000000	325.000000	2	2026-04-28 12:38:48.400571+00
73	25	ad93f6f8-1e0a-465f-8693-9b46c6d13492	RM-0010	AD.LUBIMAX 1609E	Wt%	7.700000	7.700000	4800.000000	7.700000	369.600000	3	2026-04-28 12:38:48.400571+00
74	25	6a9150b6-01cf-455a-89e9-b71022dd5d91	RM-0016	AD.VISCOPLEX 343	Wt%	0.300000	0.300000	4300.000000	0.300000	12.900000	4	2026-04-28 12:38:48.400571+00
75	25	310bc347-af0f-433f-86db-a4ea34cd9b8f	RM-0013	AD.MAK AF	Wt%	0.005000	0.005000	8500.000000	0.005000	0.425000	5	2026-04-28 12:38:48.400571+00
76	26	08706734-e16f-4446-a7c3-a3886ac8031d	RM-0001	SN 500 GI.Bulk.	Wt%	20.000000	20.000000	1110.000000	20.000000	222.000000	1	2026-04-28 12:42:01.657583+00
77	26	2203d314-d161-400d-99c8-3338798be4da	RM-0004	BO.N 150	Wt%	65.195000	65.195000	1100.000000	65.195000	717.145000	2	2026-04-28 12:42:01.657583+00
78	26	d5d2615d-47db-459a-9249-35e51a282f79	RM-0009	AD.LUBIMAX 1600HT	Wt%	2.800000	2.800000	4300.000000	2.800000	120.400000	3	2026-04-28 12:42:01.657583+00
79	26	477e1c8d-326e-4b9b-958f-b35a578f153b	RM-0007	AD.HYBASE C 402	Wt%	0.700000	0.700000	4300.000000	0.700000	30.100000	4	2026-04-28 12:42:01.657583+00
80	26	6a9150b6-01cf-455a-89e9-b71022dd5d91	RM-0016	AD.VISCOPLEX 343	Wt%	0.300000	0.300000	4300.000000	0.300000	12.900000	5	2026-04-28 12:42:01.657583+00
81	26	310bc347-af0f-433f-86db-a4ea34cd9b8f	RM-0013	AD.MAK AF	Wt%	0.005000	0.005000	8500.000000	0.005000	0.425000	6	2026-04-28 12:42:01.657583+00
82	26	eed3c69a-8513-4dcf-a984-78fa0bab4e61	RM-0026	SCH 1222.	Wt%	11.000000	11.000000	2050.000000	11.000000	225.500000	7	2026-04-28 12:42:01.657583+00
83	27	08706734-e16f-4446-a7c3-a3886ac8031d	RM-0001	SN 500 GI.Bulk.	Wt%	64.195000	64.195000	1110.000000	64.195000	712.565000	1	2026-04-28 12:44:15.121355+00
84	27	2203d314-d161-400d-99c8-3338798be4da	RM-0004	BO.N 150	Wt%	20.000000	20.000000	1100.000000	20.000000	220.000000	2	2026-04-28 12:44:15.121355+00
85	27	eed3c69a-8513-4dcf-a984-78fa0bab4e61	RM-0026	SCH 1222.	Wt%	12.000000	12.000000	2050.000000	12.000000	246.000000	3	2026-04-28 12:44:15.121355+00
86	27	d5d2615d-47db-459a-9249-35e51a282f79	RM-0009	AD.LUBIMAX 1600HT	Wt%	2.800000	2.800000	4300.000000	2.800000	120.400000	4	2026-04-28 12:44:15.121355+00
87	27	477e1c8d-326e-4b9b-958f-b35a578f153b	RM-0007	AD.HYBASE C 402	Wt%	0.700000	0.700000	4300.000000	0.700000	30.100000	5	2026-04-28 12:44:15.121355+00
88	27	6a9150b6-01cf-455a-89e9-b71022dd5d91	RM-0016	AD.VISCOPLEX 343	Wt%	0.300000	0.300000	4300.000000	0.300000	12.900000	6	2026-04-28 12:44:15.121355+00
89	27	310bc347-af0f-433f-86db-a4ea34cd9b8f	RM-0013	AD.MAK AF	Wt%	0.005000	0.005000	8500.000000	0.005000	0.425000	7	2026-04-28 12:44:15.121355+00
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."items" ("id", "item_code", "item_name", "brand_customer_id", "pack_size", "unit", "status", "notes", "is_active", "created_by", "created_at", "updated_at", "customer_id", "customer_brand") FROM stdin;
\.


--
-- Data for Name: formulas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."formulas" ("id", "item_id", "version_no", "notes", "is_active", "approved_by", "created_by", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: invoice_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."invoice_definitions" ("id", "category", "value", "sort_order", "is_active", "created_at") FROM stdin;
6	payment	cash	1	t	2026-04-20 13:30:57.564171+00
7	port_of_loading	dxb	1	t	2026-04-20 13:31:05.977283+00
8	port_of_loading	shj	2	t	2026-04-20 13:31:10.205055+00
9	packing	carton	1	t	2026-04-20 13:31:19.246974+00
10	offer_type	offer	1	t	2026-04-20 13:31:27.882043+00
11	offer_type	invoice	2	t	2026-04-20 13:31:32.595957+00
12	price_as	exwork	1	t	2026-04-20 13:31:40.081357+00
13	price_as	fob	2	t	2026-04-20 13:31:44.717126+00
14	currency	EURO	2	t	2026-04-20 19:44:38.726717+00
15	currency	AED	3	t	2026-04-20 19:44:42.771038+00
16	payment	CDC	2	t	2026-04-20 19:44:48.700251+00
17	payment	LC	3	t	2026-04-20 19:44:52.283479+00
18	packing	DRUM	2	t	2026-04-20 19:45:05.755441+00
19	offer_type	QOUTATION	3	t	2026-04-20 19:45:16.129158+00
20	offer_type	PI	4	t	2026-04-20 19:45:19.653131+00
21	price_as	CIF	3	t	2026-04-20 19:45:27.4648+00
23	fixed_profit_pct	15%	2	t	2026-04-26 22:55:12.110296+00
24	manufacturer	Makina Grease & Lubricants Manufacturer LLC	1	t	2026-04-27 08:16:20.800738+00
25	manufacturer	Schnieder	2	t	2026-04-27 08:16:44.323838+00
26	country_of_origin	UAE	1	t	2026-04-27 08:16:50.80611+00
27	country_of_origin	India	2	t	2026-04-27 08:17:00.301557+00
28	country_of_origin	CHINA	3	t	2026-04-27 08:17:06.210681+00
30	bank_details	EIB	2	t	2026-04-27 08:17:21.164254+00
31	delivery	Within 15 days after order confirmation.	1	t	2026-04-27 10:36:16.712466+00
32	delivery	Within 30 days after order confirmation.	2	t	2026-04-27 10:36:24.685691+00
33	hs_code	27101999	1	t	2026-04-27 10:53:45.1368+00
34	currency_exchange	{"from_currency":"USD","to_currency":"AED","exchange_rate":"3.675"}	1	t	2026-04-27 11:31:07.742196+00
35	currency_exchange	{"from_currency":"USD","to_currency":"EURO","exchange_rate":"2"}	2	t	2026-04-27 11:31:20.823199+00
29	bank_details	{"bank_name":"NBF","account_name":"MAKINA","account_number":"111111","iban":"2222222","swift_code":"CCCCCC"}	1	t	2026-04-27 08:17:14.879822+00
5	currency	US Dollar	1	t	2026-04-20 13:30:49.231847+00
\.


--
-- Data for Name: pdo_headers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pdo_headers" ("id", "pdo_no", "pdo_date", "customer_id", "created_at", "updated_at", "status", "version_no", "parent_order_id", "is_final", "confirmed_at", "created_from_order_id") FROM stdin;
3	PDO-0001	2026-04-20	f0142b82-0b70-4a16-9fa8-3e65aaf88702	2026-04-20 22:37:37.894885+00	2026-04-23 22:46:10.519571+00	draft	1	\N	f	\N	\N
4	PDO-0002	2026-04-26	f0142b82-0b70-4a16-9fa8-3e65aaf88702	2026-04-26 10:27:26.713187+00	2026-04-26 10:27:26.713187+00	draft	1	\N	f	\N	\N
6	PDO-0004	2026-04-27	f0142b82-0b70-4a16-9fa8-3e65aaf88702	2026-04-27 11:49:59.88281+00	2026-04-28 10:03:11.492273+00	draft	1	\N	f	\N	\N
9	PDO-0004-V2	2026-04-27	f0142b82-0b70-4a16-9fa8-3e65aaf88702	2026-04-28 10:17:56.374952+00	2026-04-28 10:17:56.374952+00	draft	2	6	f	\N	6
11	PDO-0003-V3	2026-04-26	f0142b82-0b70-4a16-9fa8-3e65aaf88702	2026-04-28 10:18:54.947855+00	2026-04-28 17:14:34.943087+00	final	3	5	t	2026-04-28 17:14:34.833+00	10
5	PDO-0003	2026-04-26	f0142b82-0b70-4a16-9fa8-3e65aaf88702	2026-04-26 21:33:50.443436+00	2026-04-28 17:14:35.950485+00	draft	1	\N	f	\N	\N
10	PDO-0003-V2	2026-04-26	f0142b82-0b70-4a16-9fa8-3e65aaf88702	2026-04-28 10:18:19.491491+00	2026-04-28 17:14:35.950485+00	draft	2	5	f	\N	5
\.


--
-- Data for Name: invoice_headers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."invoice_headers" ("id", "invoice_ref", "invoice_date", "pdo_header_id", "customer_id", "currency", "price_as", "payment", "shipping", "port_of_loading", "order_cancelation", "delivery", "packaging", "brand", "manufacturer", "country_of_origin", "others", "hs_code", "bank_details", "fixed_profit_pct", "extra_profit_pct", "total_usd", "amount_in_words", "created_at") FROM stdin;
4	PI-000001	2026-04-27	6	f0142b82-0b70-4a16-9fa8-3e65aaf88702	US Dollar $	exwork	cash		dxb		Within 15 days after order confirmation.	Drum, Carton & Jerrycan	MAKINALUBE / POWER PLUS / SCHNIEDER	Makina Grease & Lubricants Manufacturer LLC	UAE		27101999	NBF	0	0	-17491431.13	US Dollar $  Billion  Million  Thousand  and 87/100 Only	2026-04-27 12:38:27.364789+00
5	PI-000002	2026-04-27	6	f0142b82-0b70-4a16-9fa8-3e65aaf88702	US Dollar $	exwork	cash		dxb		Within 15 days after order confirmation.	Drum, Carton & Jerrycan	MAKINALUBE / POWER PLUS / SCHNIEDER	Makina Grease & Lubricants Manufacturer LLC	UAE		27101999	NBF	0	0	920654.27	US Dollar $ Nine Hundred Twenty Thousand Six Hundred Fifty Four and 27/100 Only	2026-04-27 17:50:51.361254+00
6	PI-000003	2026-04-28	11	f0142b82-0b70-4a16-9fa8-3e65aaf88702	US Dollar $	exwork	cash		dxb		Within 15 days after order confirmation.	Carton, Drum & Jerrycan	MAKINALUBE / POWER PLUS / SCHNIEDER	Makina Grease & Lubricants Manufacturer LLC	UAE		27101999	{"bank_name":"NBF","account_name":"MAKINA","account_number":"111111","iban":"2222222","swift_code":"CCCCCC"}	0	0	125108.75000000001	US Dollar $ One Hundred Twenty Five Thousand One Hundred Eight and 75/100 Only	2026-04-28 10:19:16.560386+00
\.


--
-- Data for Name: invoice_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."invoice_lines" ("id", "invoice_header_id", "line_no", "item_name", "description", "unit", "packing", "qty", "tax", "tax_value", "unit_usd", "total_usd", "created_at") FROM stdin;
1	4	1	MAKINALUBE TRIDON ATF CVT	Lubricants	Drum	1 X 200 Lit	1	0%	-	177.82	177.82	2026-04-27 12:38:27.591005+00
2	4	2	MAKINALUBE TRIDON ATF CVT	Lubricants	Carton	1 X 20 Lit	1	0%	-	20.54	20.54	2026-04-27 12:38:27.591005+00
3	4	3	MAKINALUBE TRIDON ATF CVT	Lubricants	Carton	4 X 5 Lit	1	0%	-	21.52	21.52	2026-04-27 12:38:27.591005+00
4	4	4	MAKINALUBE TRIDON ATF CVT	Lubricants	Carton	12 X 1 Lit	1	0%	-	15.899999999999999	15.899999999999999	2026-04-27 12:38:27.591005+00
5	4	5	MAKINALUBE TRIDON ATF CVT	Lubricants	Jerrycan	24 X 250 Ml	200	0%	-	4595.95	919190	2026-04-27 12:38:27.591005+00
6	4	6	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Carton	12 X 1 Lit	2	0%	-	22.92	45.84	2026-04-27 12:38:27.591005+00
7	4	7	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Carton	4 X 5 Lit	2	0%	-	33.22	66.44	2026-04-27 12:38:27.591005+00
8	4	8	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Carton	1 X 20 Lit	2	0%	-	32.24	64.48	2026-04-27 12:38:27.591005+00
9	4	9	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Drum	1 X 200 Lit	2	0%	-	294.82	589.64	2026-04-27 12:38:27.591005+00
10	4	10	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	24 X 500 ML	3	0%	-	7.5	22.5	2026-04-27 12:38:27.591005+00
11	4	11	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	4 X 5 Lit	3	0%	-	6.22	18.66	2026-04-27 12:38:27.591005+00
12	4	12	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	1 X 20 Lit	33	0%	-	5.24	172.92000000000002	2026-04-27 12:38:27.591005+00
13	4	13	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Drum	1 X 200 Lit	3	0%	-	24.82	74.46000000000001	2026-04-27 12:38:27.591005+00
14	4	14	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Drum	24 X 200 Ml	3	0%	-	5.95	17.85	2026-04-27 12:38:27.591005+00
15	4	15	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	12 X 1 Lit	3	0%	-	6.72	20.16	2026-04-27 12:38:27.591005+00
16	4	16	MAKINALUBE TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	Lubricants	Carton	4 X 5 Lit	4	0%	-	6.22	24.88	2026-04-27 12:38:27.591005+00
17	4	17	MAKINALUBE TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	Lubricants	Jerrycan	24 X 250 Ml	4	0%	-	5.95	23.8	2026-04-27 12:38:27.591005+00
18	4	18	POWER PLUS SAE 40 API CF	Lubricants	Carton	12 X 1 Lit	1	0%	-	6.72	6.72	2026-04-27 12:38:27.591005+00
19	4	19	POWER PLUS SAE 40 API CF	Lubricants	Carton	4 X 5 Lit	1	0%	-	6.22	6.22	2026-04-27 12:38:27.591005+00
20	4	20	SCHNIEDER SAE 50 API CH-4/SL	Lubricants	Carton	12 X 1 Lit	11	0%	-	6.72	73.92	2026-04-27 12:38:27.591005+00
21	5	1	MAKINALUBE TRIDON ATF CVT	Lubricants	Drum	1 X 200 Lit	1	0%	-	177.82	177.82	2026-04-27 17:50:51.639408+00
22	5	2	MAKINALUBE TRIDON ATF CVT	Lubricants	Carton	1 X 20 Lit	1	0%	-	20.54	20.54	2026-04-27 17:50:51.639408+00
23	5	3	MAKINALUBE TRIDON ATF CVT	Lubricants	Carton	4 X 5 Lit	1	0%	-	21.52	21.52	2026-04-27 17:50:51.639408+00
24	5	4	MAKINALUBE TRIDON ATF CVT	Lubricants	Carton	12 X 1 Lit	1	0%	-	15.899999999999999	15.899999999999999	2026-04-27 17:50:51.639408+00
25	5	5	MAKINALUBE TRIDON ATF CVT	Lubricants	Jerrycan	24 X 250 Ml	200	0%	-	4595.95	919190	2026-04-27 17:50:51.639408+00
26	5	6	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Carton	12 X 1 Lit	2	0%	-	22.92	45.84	2026-04-27 17:50:51.639408+00
27	5	7	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Carton	4 X 5 Lit	2	0%	-	33.22	66.44	2026-04-27 17:50:51.639408+00
28	5	8	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Carton	1 X 20 Lit	2	0%	-	32.24	64.48	2026-04-27 17:50:51.639408+00
29	5	9	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Drum	1 X 200 Lit	2	0%	-	294.82	589.64	2026-04-27 17:50:51.639408+00
30	5	10	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	24 X 500 ML	3	0%	-	7.5	22.5	2026-04-27 17:50:51.639408+00
31	5	11	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	4 X 5 Lit	3	0%	-	6.22	18.66	2026-04-27 17:50:51.639408+00
32	5	12	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	1 X 20 Lit	33	0%	-	5.24	172.92000000000002	2026-04-27 17:50:51.639408+00
33	5	13	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Drum	1 X 200 Lit	3	0%	-	24.82	74.46000000000001	2026-04-27 17:50:51.639408+00
34	5	14	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Drum	24 X 200 Ml	3	0%	-	5.95	17.85	2026-04-27 17:50:51.639408+00
35	5	15	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	12 X 1 Lit	3	0%	-	6.72	20.16	2026-04-27 17:50:51.639408+00
36	5	16	MAKINALUBE TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	Lubricants	Carton	4 X 5 Lit	4	0%	-	6.22	24.88	2026-04-27 17:50:51.639408+00
37	5	17	MAKINALUBE TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	Lubricants	Jerrycan	24 X 250 Ml	4	0%	-	5.95	23.8	2026-04-27 17:50:51.639408+00
38	5	18	POWER PLUS SAE 40 API CF	Lubricants	Carton	12 X 1 Lit	1	0%	-	6.72	6.72	2026-04-27 17:50:51.639408+00
39	5	19	POWER PLUS SAE 40 API CF	Lubricants	Carton	4 X 5 Lit	1	0%	-	6.22	6.22	2026-04-27 17:50:51.639408+00
40	5	20	SCHNIEDER SAE 50 API CH-4/SL	Lubricants	Carton	12 X 1 Lit	11	0%	-	6.72	73.92	2026-04-27 17:50:51.639408+00
41	6	1	MAKINALUBE TRIDON ATF CVT	Lubricants	Carton	12 X 1 Lit	7	0%	-	15.899999999999999	111.29999999999998	2026-04-28 10:19:16.784824+00
42	6	2	MAKINALUBE TRIDON ATF CVT	Lubricants	Carton	4 X 5 Lit	7	0%	-	21.52	150.64	2026-04-28 10:19:16.784824+00
43	6	3	MAKINALUBE TRIDON ATF CVT	Lubricants	Carton	1 X 20 Lit	7	0%	-	20.54	143.78	2026-04-28 10:19:16.784824+00
44	6	4	MAKINALUBE TRIDON ATF CVT	Lubricants	Drum	1 X 200 Lit	7	0%	-	177.82	1244.74	2026-04-28 10:19:16.784824+00
45	6	5	MAKINALUBE TRIDON ATF CVT	Lubricants	Jerrycan	24 X 250 Ml	7	0%	-	4595.95	32171.649999999998	2026-04-28 10:19:16.784824+00
46	6	6	MAKINALUBE TRIDON ATF CVT	Lubricants	Drum	24 X 200 Ml	7	0%	-	3677.95	25745.649999999998	2026-04-28 10:19:16.784824+00
47	6	7	MAKINALUBE TRIDON ATF CVT	Lubricants	Carton	24 X 500 ML	7	0%	-	9187.5	64312.5	2026-04-28 10:19:16.784824+00
48	6	8	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Drum	1 X 200 Lit	2	0%	-	294.82	589.64	2026-04-28 10:19:16.784824+00
49	6	9	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Carton	12 X 1 Lit	2	0%	-	22.92	45.84	2026-04-28 10:19:16.784824+00
50	6	10	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Carton	4 X 5 Lit	2	0%	-	33.22	66.44	2026-04-28 10:19:16.784824+00
51	6	11	MAKINALUBE TRIDON SUPER GEAR SAE 140 API GL-4	Lubricants	Carton	1 X 20 Lit	2	0%	-	32.24	64.48	2026-04-28 10:19:16.784824+00
52	6	12	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Drum	1 X 200 Lit	3	0%	-	24.82	74.46000000000001	2026-04-28 10:19:16.784824+00
53	6	13	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Drum	24 X 200 Ml	3	0%	-	5.95	17.85	2026-04-28 10:19:16.784824+00
54	6	14	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	24 X 500 ML	3	0%	-	7.5	22.5	2026-04-28 10:19:16.784824+00
55	6	15	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	1 X 20 Lit	33	0%	-	5.24	172.92000000000002	2026-04-28 10:19:16.784824+00
56	6	16	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	4 X 5 Lit	3	0%	-	6.22	18.66	2026-04-28 10:19:16.784824+00
57	6	17	MAKINALUBE ULTRA HD PLUS SAE 50 API CF-4/SL	Lubricants	Carton	12 X 1 Lit	3	0%	-	6.72	20.16	2026-04-28 10:19:16.784824+00
58	6	18	MAKINALUBE TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	Lubricants	Carton	4 X 5 Lit	4	0%	-	6.22	24.88	2026-04-28 10:19:16.784824+00
59	6	19	MAKINALUBE TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	Lubricants	Jerrycan	24 X 250 Ml	4	0%	-	5.95	23.8	2026-04-28 10:19:16.784824+00
60	6	20	POWER PLUS SAE 40 API CF	Lubricants	Carton	4 X 5 Lit	1	0%	-	6.22	6.22	2026-04-28 10:19:16.784824+00
61	6	21	POWER PLUS SAE 40 API CF	Lubricants	Carton	12 X 1 Lit	1	0%	-	6.72	6.72	2026-04-28 10:19:16.784824+00
62	6	22	SCHNIEDER SAE 50 API CH-4/SL	Lubricants	Carton	12 X 1 Lit	11	0%	-	6.72	73.92	2026-04-28 10:19:16.784824+00
\.


--
-- Data for Name: item_brands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."item_brands" ("id", "item_id", "brand_id", "created_at") FROM stdin;
\.


--
-- Data for Name: packaging_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."packaging_materials" ("id", "pm_code", "pm_name", "pm_type", "unit", "cost", "notes", "is_active", "created_by", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: item_packaging_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."item_packaging_lines" ("id", "item_id", "packaging_material_id", "qty", "unit", "notes", "created_at") FROM stdin;
\.


--
-- Data for Name: packaging_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."packaging_definitions" ("id", "category", "value", "sort_order", "is_active", "created_at") FROM stdin;
13	pm_unit	Lit	1	t	2026-04-20 10:26:49.977717+00
14	pack_size	1	1	t	2026-04-20 10:26:52.400464+00
15	pack_count	1	1	t	2026-04-20 10:26:54.814025+00
20	pm_unit	kg	3	t	2026-04-20 10:27:16.829824+00
25	pack_size	4	5	t	2026-04-20 10:27:57.569922+00
26	pack_size	5	6	t	2026-04-20 10:28:02.615579+00
27	pack_count	4	2	t	2026-04-20 10:28:09.086225+00
28	pack_count	6	3	t	2026-04-20 10:28:14.820429+00
31	pack_type	Can	2	t	2026-04-20 10:30:13.907742+00
35	pack_type	Jerrycan	1	t	2026-04-20 19:41:45.99127+00
36	pack_type	Drum	1	t	2026-04-20 19:41:51.895801+00
37	pack_type	IBC	1	t	2026-04-20 19:41:56.931688+00
38	pack_type	Flexi	1	t	2026-04-20 19:42:02.834698+00
39	can_color	GLD	1	t	2026-04-20 19:42:10.525511+00
40	can_color	SLV	1	t	2026-04-20 19:42:18.468363+00
41	can_color	GRY	1	t	2026-04-20 19:42:23.915383+00
42	pack_count	12	1	t	2026-04-20 19:42:53.175+00
43	pack_count	24	1	t	2026-04-20 19:42:56.386873+00
24	pack_size	200	4	t	2026-04-20 10:27:51.858757+00
47	pack_size	18	1	t	2026-04-21 06:41:52.837254+00
48	pack_size	20	1	t	2026-04-21 06:41:56.627427+00
49	pack_size	25	1	t	2026-04-21 06:42:00.008883+00
29	can_color	BLU	2	t	2026-04-20 10:28:36.188617+00
17	can_color	RED	1	t	2026-04-20 10:26:59.159264+00
50	can_color	BLK	1	t	2026-04-21 06:42:52.728222+00
18	carton_color	WHT	1	t	2026-04-20 10:27:01.070408+00
51	pack_size	6	1	t	2026-04-21 06:44:25.538974+00
19	pm_unit	ML	2	t	2026-04-20 10:27:10.655871+00
21	pm_unit	Mt	4	t	2026-04-20 10:27:22.234776+00
44	pack_size	205	1	t	2026-04-21 06:41:23.910851+00
45	pack_size	1000	1	t	2026-04-21 06:41:32.662373+00
23	pack_size	0.8	3	t	2026-04-20 10:27:39.834482+00
16	pack_type	Carton	1	t	2026-04-20 10:26:56.474464+00
52	can_color	WHT	1	t	2026-04-23 07:46:27.600275+00
53	can_color	GRN	1	t	2026-04-23 07:46:34.443078+00
54	can_color	YLW	1	t	2026-04-23 07:46:44.313399+00
55	can_color	D.GRY	1	t	2026-04-23 07:47:09.903745+00
56	can_color	L.GRY	1	t	2026-04-23 07:47:18.958622+00
30	carton_color	RED-BLK	2	t	2026-04-20 10:28:45.70961+00
57	pack_size	500	1	t	2026-04-23 08:18:48.454445+00
58	carton_color	WHT-BLK	1	t	2026-04-23 08:27:01.874137+00
\.


--
-- Data for Name: packing_brand; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."packing_brand" ("id", "brand_symbol", "packing", "can_color", "carton_color", "pack_per_pallet", "packing_empty_weight", "packing_price", "sort_order", "created_at") FROM stdin;
7	MAK	12 X 1 Lit	GLD	RED-BLK	48.00	1.402	6.7200	2	2026-04-21 06:50:31.442835+00
6	MAK	4 X 4 Lit	GLD	RED-BLK	36.00	1.558	5.4300	1	2026-04-21 06:49:32.46831+00
8	MAK	4 X 5 Lit	GLD	RED-BLK	36.00	1.700	6.2200	3	2026-04-21 06:52:15.491216+00
9	MAK	1 X 20 Lit	GLD	RED-BLK	48.00	1.182	5.2400	4	2026-04-21 06:53:16.744523+00
10	MAK	1 X 25 Lit	GLD	RED-BLK	48.00	1.898	5.5700	5	2026-04-21 06:53:58.539229+00
11	MAK	1 X 200 Lit	WHT	\N	4.00	16.500	24.8200	6	2026-04-21 06:54:47.339917+00
19	SCH	1 X 200 Lit	RED	\N	4.00	16.500	23.9500	14	2026-04-23 08:12:31.791712+00
13	MAK	24 X 200 Ml	YLW	WHT	48.00	1.081	5.9500	8	2026-04-21 06:56:18.679044+00
12	MAK	24 X 250 Ml	YLW	WHT	48.00	1.081	5.9500	7	2026-04-21 06:56:00.144068+00
20	MAK	24 X 500 ML	YLW	WHT	48.00	1.652	7.5000	15	2026-04-23 08:21:34.243173+00
14	SCH	12 X 1 Lit	GRY	WHT	48.00	1.446	5.7700	9	2026-04-23 08:07:11.027232+00
15	SCH	4 X 4 Lit	GRY	WHT	36.00	1.502	5.0700	10	2026-04-23 08:08:51.431518+00
16	SCH	4 X 5 Lit	GRY	WHT	36.00	1.646	6.0000	11	2026-04-23 08:09:42.528743+00
17	SCH	1 X 20 Lit	GRY	\N	48.00	1.833	4.2200	12	2026-04-23 08:10:52.055605+00
18	SCH	1 X 25 Lit	GRY	WHT	48.00	2.002	5.5900	13	2026-04-23 08:12:01.875821+00
24	GEN	1 X 25 Lit	GRY	\N	32.00	1.250	4.9000	19	2026-04-23 08:32:21.120252+00
25	KOR	4 X 4 Lit	D.GRY	WHT	48.00	1.558	4.8600	20	2026-04-23 08:36:13.729871+00
26	KOR	4 X 5 Lit	D.GRY	WHT	48.00	1.700	5.2700	21	2026-04-23 08:36:35.12924+00
27	KOR	1 X 20 Lit	GRY	\N	32.00	1.182	4.1900	22	2026-04-23 08:37:08.379082+00
28	KOR	1 X 25 Lit	GRY	\N	32.00	1.250	4.4600	23	2026-04-23 08:37:29.404338+00
21	GEN	12 X 1 Lit	D.GRY	WHT-BLK	48.00	1.402	5.7900	16	2026-04-23 08:28:16.459193+00
22	GEN	6 X 4 Lit	D.GRY	WHT-BLK	24.00	1.558	7.7600	17	2026-04-23 08:30:43.432327+00
23	GEN	6 X 5 Lit	D.GRY	WHT-BLK	24.00	1.720	8.6300	18	2026-04-23 08:31:13.121933+00
\.


--
-- Data for Name: packing_master; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."packing_master" ("id", "pack_count", "pack_size", "pm_unit", "packing", "pack_type", "can_color", "carton_color", "pack_per_pallet", "packing_empty_weight", "packing_price", "sort_order", "created_at") FROM stdin;
7	4	4	Lit	4 X 4 Lit	carton	\N	\N	\N	\N	\N	3	2026-04-20 19:43:47.425748+00
5	6	4	Lit	6 X 4 Lit	carton	\N	\N	\N	\N	\N	4	2026-04-20 19:37:51.357675+00
6	4	5	Lit	4 X 5 Lit	carton	\N	\N	\N	\N	\N	5	2026-04-20 19:43:14.507281+00
9	4	6	Lit	4 X 6 Lit	carton	\N	\N	\N	\N	\N	7	2026-04-21 06:45:20.778743+00
8	6	5	Lit	6 X 5 Lit	carton	\N	\N	\N	\N	\N	6	2026-04-21 06:45:07.865906+00
10	12	1	Lit	12 X 1 Lit	carton	\N	\N	\N	\N	\N	8	2026-04-21 06:45:52.237132+00
12	1	20	Lit	1 X 20 Lit	Jerrycan	\N	\N	\N	\N	\N	10	2026-04-21 06:46:12.067401+00
13	1	25	Lit	1 X 25 Lit	Jerrycan	\N	\N	\N	\N	\N	11	2026-04-21 06:46:32.553445+00
14	1	200	Lit	1 X 200 Lit	Drum	\N	\N	\N	\N	\N	12	2026-04-21 06:46:46.402292+00
16	24	200	Ml	24 X 200 Ml	carton	\N	\N	\N	\N	\N	14	2026-04-21 06:55:32.270905+00
15	24	250	Ml	24 X 250 Ml	carton	\N	\N	\N	\N	\N	13	2026-04-21 06:55:20.25214+00
17	24	500	ML	24 X 500 ML	Carton	\N	\N	\N	\N	\N	15	2026-04-23 08:19:04.191732+00
\.


--
-- Data for Name: packing_store_stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."packing_store_stock" ("id", "stock_key", "stock_type", "packing_name", "brand_symbol", "packing_brand_id", "item_id", "store_qty", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: pallet_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pallet_data" ("id", "pallet_weight", "pallet_size", "pallet_high", "created_at", "updated_at") FROM stdin;
1	15.000	110 x 110	20.000	2026-04-21 07:34:35.925567+00	2026-04-23 07:28:16.132648+00
\.


--
-- Data for Name: pdo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pdo" ("id", "pdo_no", "pdo_date", "brand_customer_id", "item_id", "qty", "unit", "status", "remarks", "created_by", "approved_by", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: pdo_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pdo_lines" ("id", "pdo_header_id", "line_no", "brand_symbol", "item_id", "item_name", "density", "packing_brand_id", "packing", "qty", "total_lit", "total_kg", "created_at", "updated_at") FROM stdin;
181	9	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	7	12 X 1 Lit	6.000	72.0000	61.2000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
182	9	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	8	4 X 5 Lit	6.000	120.0000	102.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
183	9	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	9	1 X 20 Lit	6.000	120.0000	102.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
184	9	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	11	1 X 200 Lit	6.000	1200.0000	1020.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
185	9	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	12	24 X 250 Ml	6.000	36000.0000	30600.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
186	9	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	13	24 X 200 Ml	6.000	28800.0000	24480.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
187	9	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	20	24 X 500 ML	6.000	72000.0000	61200.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
188	9	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	7	12 X 1 Lit	2.000	24.0000	21.6000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
189	9	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	8	4 X 5 Lit	2.000	40.0000	36.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
190	9	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	9	1 X 20 Lit	2.000	40.0000	36.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
75	3	1	MAK	a0e051fd-d16d-45be-aaec-89f51abbb58a	UNIMAX HD PLUS SAE  20W-50 API SL/CF	0.890000	2		10.000	0.0000	0.0000	2026-04-23 22:46:10.981371+00	2026-04-23 22:46:10.981371+00
76	3	1	MAK	a0e051fd-d16d-45be-aaec-89f51abbb58a	UNIMAX HD PLUS SAE  20W-50 API SL/CF	0.890000	3		10.000	0.0000	0.0000	2026-04-23 22:46:10.981371+00	2026-04-23 22:46:10.981371+00
77	3	1	MAK	a0e051fd-d16d-45be-aaec-89f51abbb58a	UNIMAX HD PLUS SAE  20W-50 API SL/CF	0.890000	4		10.000	0.0000	0.0000	2026-04-23 22:46:10.981371+00	2026-04-23 22:46:10.981371+00
78	3	1	MAK	a0e051fd-d16d-45be-aaec-89f51abbb58a	UNIMAX HD PLUS SAE  20W-50 API SL/CF	0.890000	6	4 X 4 Lit	10.000	160.0000	142.4000	2026-04-23 22:46:10.981371+00	2026-04-23 22:46:10.981371+00
79	3	1	MAK	a0e051fd-d16d-45be-aaec-89f51abbb58a	UNIMAX HD PLUS SAE  20W-50 API SL/CF	0.890000	8	4 X 5 Lit	10.000	200.0000	178.0000	2026-04-23 22:46:10.981371+00	2026-04-23 22:46:10.981371+00
80	3	1	MAK	a0e051fd-d16d-45be-aaec-89f51abbb58a	UNIMAX HD PLUS SAE  20W-50 API SL/CF	0.890000	9	1 X 20 Lit	10.000	200.0000	178.0000	2026-04-23 22:46:10.981371+00	2026-04-23 22:46:10.981371+00
81	3	1	MAK	a0e051fd-d16d-45be-aaec-89f51abbb58a	UNIMAX HD PLUS SAE  20W-50 API SL/CF	0.890000	10	1 X 25 Lit	10.000	250.0000	222.5000	2026-04-23 22:46:10.981371+00	2026-04-23 22:46:10.981371+00
82	3	2	MAK	4debab15-19c1-421a-9e3c-afd931997c11	SUPER HD PLUS SAE 40 API CF/SF	0.890000	2		10.000	0.0000	0.0000	2026-04-23 22:46:10.981371+00	2026-04-23 22:46:10.981371+00
83	3	2	MAK	4debab15-19c1-421a-9e3c-afd931997c11	SUPER HD PLUS SAE 40 API CF/SF	0.890000	8	4 X 5 Lit	10.000	200.0000	178.0000	2026-04-23 22:46:10.981371+00	2026-04-23 22:46:10.981371+00
84	3	3	MAK	ceb5999b-dea4-44de-bfba-ba53965d2cf3	PRO-SYN SAE 5W-20 API SN	0.850000	9	1 X 20 Lit	10.000	200.0000	170.0000	2026-04-23 22:46:10.981371+00	2026-04-23 22:46:10.981371+00
85	4	1	MAK	e0c27268-cb1c-4c81-b3c4-1c236a75a249	TRIDON H 68	0.878000	7	12 X 1 Lit	10.000	120.0000	105.3600	2026-04-26 10:27:27.015436+00	2026-04-26 10:27:27.015436+00
86	4	1	MAK	e0c27268-cb1c-4c81-b3c4-1c236a75a249	TRIDON H 68	0.878000	8	4 X 5 Lit	20.000	400.0000	351.2000	2026-04-26 10:27:27.015436+00	2026-04-26 10:27:27.015436+00
87	4	1	MAK	e0c27268-cb1c-4c81-b3c4-1c236a75a249	TRIDON H 68	0.878000	9	1 X 20 Lit	10.000	200.0000	175.6000	2026-04-26 10:27:27.015436+00	2026-04-26 10:27:27.015436+00
191	9	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	11	1 X 200 Lit	2.000	400.0000	360.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
192	9	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	7	12 X 1 Lit	3.000	36.0000	32.4000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
193	9	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	8	4 X 5 Lit	3.000	60.0000	54.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
194	9	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	9	1 X 20 Lit	33.000	660.0000	594.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
195	9	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	11	1 X 200 Lit	3.000	600.0000	540.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
196	9	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	13	24 X 200 Ml	3.000	14400.0000	12960.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
197	9	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	20	24 X 500 ML	3.000	36000.0000	32400.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
198	9	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	8	4 X 5 Lit	4.000	80.0000	72.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
199	9	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	12	24 X 250 Ml	4.000	24000.0000	21600.0000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
200	9	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.890000	7	12 X 1 Lit	1.000	12.0000	10.6800	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
201	9	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.890000	8	4 X 5 Lit	1.000	20.0000	17.8000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
202	9	6	SCH	fb9e74f6-1143-4544-8a54-d932fc57f2f9	SAE 50 API CH-4/SL	0.900000	7	12 X 1 Lit	11.000	132.0000	118.8000	2026-04-28 10:17:56.597979+00	2026-04-28 10:17:56.597979+00
120	5	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	7	12 X 1 Lit	1.000	12.0000	10.2000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
121	5	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	8	4 X 5 Lit	1.000	20.0000	17.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
122	5	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	9	1 X 20 Lit	1.000	20.0000	17.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
123	5	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	11	1 X 200 Lit	1.000	200.0000	170.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
124	5	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	7	12 X 1 Lit	2.000	24.0000	21.6000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
125	5	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	8	4 X 5 Lit	2.000	40.0000	36.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
126	5	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	9	1 X 20 Lit	2.000	40.0000	36.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
127	5	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	11	1 X 200 Lit	2.000	400.0000	360.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
128	5	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	7	12 X 1 Lit	3.000	36.0000	32.4000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
129	5	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	8	4 X 5 Lit	3.000	60.0000	54.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
130	5	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	9	1 X 20 Lit	33.000	660.0000	594.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
131	5	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	11	1 X 200 Lit	3.000	600.0000	540.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
132	5	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	13	24 X 200 Ml	3.000	14400.0000	12960.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
133	5	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	20	24 X 500 ML	3.000	36000.0000	32400.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
134	5	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	8	4 X 5 Lit	4.000	80.0000	72.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
135	5	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	12	24 X 250 Ml	4.000	24000.0000	21600.0000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
136	5	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.890000	7	12 X 1 Lit	1.000	12.0000	10.6800	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
137	5	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.890000	8	4 X 5 Lit	1.000	20.0000	17.8000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
138	5	6	SCH	fb9e74f6-1143-4544-8a54-d932fc57f2f9	SAE 50 API CH-4/SL	0.900000	7	12 X 1 Lit	11.000	132.0000	118.8000	2026-04-27 11:07:58.142911+00	2026-04-27 11:07:58.142911+00
203	10	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	7	12 X 1 Lit	5.000	60.0000	51.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
204	10	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	8	4 X 5 Lit	5.000	100.0000	85.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
205	10	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	9	1 X 20 Lit	5.000	100.0000	85.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
206	10	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	11	1 X 200 Lit	5.000	1000.0000	850.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
207	10	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	12	24 X 250 Ml	5.000	30000.0000	25500.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
208	10	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	13	24 X 200 Ml	5.000	24000.0000	20400.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
209	10	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	20	24 X 500 ML	5.000	60000.0000	51000.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
210	10	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	7	12 X 1 Lit	2.000	24.0000	21.6000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
211	10	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	8	4 X 5 Lit	2.000	40.0000	36.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
212	10	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	9	1 X 20 Lit	2.000	40.0000	36.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
213	10	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	11	1 X 200 Lit	2.000	400.0000	360.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
214	10	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	7	12 X 1 Lit	3.000	36.0000	32.4000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
215	10	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	8	4 X 5 Lit	3.000	60.0000	54.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
216	10	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	9	1 X 20 Lit	33.000	660.0000	594.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
217	10	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	11	1 X 200 Lit	3.000	600.0000	540.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
218	10	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	13	24 X 200 Ml	3.000	14400.0000	12960.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
219	10	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	20	24 X 500 ML	3.000	36000.0000	32400.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
220	10	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	8	4 X 5 Lit	4.000	80.0000	72.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
221	10	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	12	24 X 250 Ml	4.000	24000.0000	21600.0000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
222	10	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.890000	7	12 X 1 Lit	1.000	12.0000	10.6800	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
159	6	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	7	12 X 1 Lit	6.000	72.0000	61.2000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
160	6	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	8	4 X 5 Lit	6.000	120.0000	102.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
161	6	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	9	1 X 20 Lit	6.000	120.0000	102.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
162	6	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	11	1 X 200 Lit	6.000	1200.0000	1020.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
163	6	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	12	24 X 250 Ml	6.000	36000.0000	30600.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
164	6	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	13	24 X 200 Ml	6.000	28800.0000	24480.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
165	6	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	20	24 X 500 ML	6.000	72000.0000	61200.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
166	6	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	7	12 X 1 Lit	2.000	24.0000	21.6000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
167	6	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	8	4 X 5 Lit	2.000	40.0000	36.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
168	6	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	9	1 X 20 Lit	2.000	40.0000	36.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
169	6	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	11	1 X 200 Lit	2.000	400.0000	360.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
170	6	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	7	12 X 1 Lit	3.000	36.0000	32.4000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
171	6	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	8	4 X 5 Lit	3.000	60.0000	54.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
172	6	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	9	1 X 20 Lit	33.000	660.0000	594.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
173	6	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	11	1 X 200 Lit	3.000	600.0000	540.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
174	6	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	13	24 X 200 Ml	3.000	14400.0000	12960.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
175	6	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	20	24 X 500 ML	3.000	36000.0000	32400.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
176	6	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	8	4 X 5 Lit	4.000	80.0000	72.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
177	6	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	12	24 X 250 Ml	4.000	24000.0000	21600.0000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
178	6	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.890000	7	12 X 1 Lit	1.000	12.0000	10.6800	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
179	6	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.890000	8	4 X 5 Lit	1.000	20.0000	17.8000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
180	6	6	SCH	fb9e74f6-1143-4544-8a54-d932fc57f2f9	SAE 50 API CH-4/SL	0.900000	7	12 X 1 Lit	11.000	132.0000	118.8000	2026-04-28 10:03:11.977762+00	2026-04-28 10:03:11.977762+00
223	10	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.890000	8	4 X 5 Lit	1.000	20.0000	17.8000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
224	10	6	SCH	fb9e74f6-1143-4544-8a54-d932fc57f2f9	SAE 50 API CH-4/SL	0.900000	7	12 X 1 Lit	11.000	132.0000	118.8000	2026-04-28 10:18:19.697583+00	2026-04-28 10:18:19.697583+00
301	11	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	7	12 X 1 Lit	7.000	84.0000	71.4000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
302	11	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	8	4 X 5 Lit	7.000	140.0000	119.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
303	11	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	9	1 X 20 Lit	7.000	140.0000	119.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
304	11	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	11	1 X 200 Lit	7.000	1400.0000	1190.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
305	11	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	12	24 X 250 Ml	7.000	42000.0000	35700.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
306	11	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	13	24 X 200 Ml	7.000	33600.0000	28560.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
307	11	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.850000	20	24 X 500 ML	7.000	84000.0000	71400.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
308	11	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	7	12 X 1 Lit	2.000	24.0000	21.6000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
309	11	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	8	4 X 5 Lit	2.000	40.0000	36.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
310	11	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	9	1 X 20 Lit	2.000	40.0000	36.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
311	11	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.900000	11	1 X 200 Lit	2.000	400.0000	360.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
312	11	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	7	12 X 1 Lit	3.000	36.0000	32.4000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
313	11	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	8	4 X 5 Lit	3.000	60.0000	54.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
314	11	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	9	1 X 20 Lit	33.000	660.0000	594.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
315	11	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	11	1 X 200 Lit	3.000	600.0000	540.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
316	11	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	13	24 X 200 Ml	3.000	14400.0000	12960.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
317	11	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.900000	20	24 X 500 ML	3.000	36000.0000	32400.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
318	11	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	7	12 X 1 Lit	11.000	132.0000	118.8000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
319	11	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	8	4 X 5 Lit	11.000	220.0000	198.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
320	11	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	9	1 X 20 Lit	11.000	220.0000	198.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
321	11	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	11	1 X 200 Lit	11.000	2200.0000	1980.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
322	11	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	12	24 X 250 Ml	11.000	66000.0000	59400.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
323	11	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	13	24 X 200 Ml	11.000	52800.0000	47520.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
324	11	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.900000	20	24 X 500 ML	11.000	132000.0000	118800.0000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
325	11	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.890000	7	12 X 1 Lit	1.000	12.0000	10.6800	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
326	11	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.890000	8	4 X 5 Lit	1.000	20.0000	17.8000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
327	11	6	SCH	fb9e74f6-1143-4544-8a54-d932fc57f2f9	SAE 50 API CH-4/SL	0.900000	7	12 X 1 Lit	11.000	132.0000	118.8000	2026-04-28 17:14:35.688579+00	2026-04-28 17:14:35.688579+00
\.


--
-- Data for Name: pi; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pi" ("id", "pi_no", "pdo_id", "customer_id", "brand_customer_id", "issue_date", "currency", "total_amount", "status", "notes", "created_by", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: pi_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pi_lines" ("id", "pi_id", "item_id", "description", "qty", "unit", "unit_price", "created_at") FROM stdin;
\.


--
-- Data for Name: pm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pm" ("id", "pm_code", "pm_name", "pm_category", "unit", "status", "notes", "created_at") FROM stdin;
\.


--
-- Data for Name: pm_packaging_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pm_packaging_types" ("id", "type_code", "type_name", "description", "status", "notes", "created_at") FROM stdin;
\.


--
-- Data for Name: pm_setup; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pm_setup" ("id", "pm_code", "pm_name", "pm_category", "unit", "status", "notes", "created_at") FROM stdin;
\.


--
-- Data for Name: pm_sizes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pm_sizes" ("id", "size_code", "size_name", "description", "status", "notes", "created_at") FROM stdin;
2b1ba49f-13b8-40bd-b097-e1720b1d13f3	\N	4	kg	active	\N	2026-04-14 21:53:03.959014+00
\.


--
-- Data for Name: pm_unit_counts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pm_unit_counts" ("id", "count_code", "count_value", "description", "status", "notes", "created_at") FROM stdin;
\.


--
-- Data for Name: pm_uom; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."pm_uom" ("id", "uom_code", "uom_name", "description", "status", "notes", "created_at") FROM stdin;
4aacc687-0d21-4109-b61f-9edaa7f4d305	\N	carton	\N	active	\N	2026-04-14 22:01:03.566585+00
\.


--
-- Data for Name: price_offer_headers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."price_offer_headers" ("id", "offer_ref", "offer_date", "pdo_header_id", "customer_id", "currency", "price_as", "payment", "shipping", "port_of_loading", "delivery", "packaging", "brand", "manufacturer", "country_of_origin", "others", "hs_code", "bank_details", "fixed_profit_pct", "extra_profit_pct", "freight_charges", "discount_amount", "total_amount", "amount_in_words", "created_at") FROM stdin;
\.


--
-- Data for Name: price_offer_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."price_offer_lines" ("id", "price_offer_header_id", "line_no", "item_name", "description", "unit", "packing", "qty", "tax", "tax_value", "unit_price", "total_price", "created_at") FROM stdin;
\.


--
-- Data for Name: production_headers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."production_headers" ("id", "pdo_header_id", "production_no", "production_date", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: production_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."production_lines" ("id", "production_header_id", "pdo_line_id", "line_no", "brand_symbol", "item_id", "item_name", "density", "packing_brand_id", "packing", "order_qty", "production_qty", "total_lit", "total_kg", "created_at") FROM stdin;
\.


--
-- Data for Name: production_order_headers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."production_order_headers" ("id", "production_ref", "production_date", "pdo_header_id", "customer_id", "status", "notes", "created_at") FROM stdin;
1	PROD-0001	2026-04-28	11	f0142b82-0b70-4a16-9fa8-3e65aaf88702	saved		2026-04-28 17:22:11.281949+00
\.


--
-- Data for Name: production_order_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."production_order_lines" ("id", "production_order_header_id", "pdo_line_id", "line_no", "brand_symbol", "item_id", "item_name", "density", "packing_brand_id", "packing", "order_qty", "produced_qty", "total_lit", "total_kg", "created_at") FROM stdin;
1	1	301	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.85	7	12 X 1 Lit	7	10	120	102	2026-04-28 17:22:11.573953+00
2	1	302	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.85	8	4 X 5 Lit	7	10	200	170	2026-04-28 17:22:11.573953+00
3	1	303	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.85	9	1 X 20 Lit	7	10	200	170	2026-04-28 17:22:11.573953+00
4	1	304	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.85	11	1 X 200 Lit	7	7	1400	1190	2026-04-28 17:22:11.573953+00
5	1	305	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.85	12	24 X 250 Ml	7	7	42000	35700	2026-04-28 17:22:11.573953+00
6	1	306	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.85	13	24 X 200 Ml	7	7	33600	28560	2026-04-28 17:22:11.573953+00
7	1	307	1	MAK	a2935ed5-d7ae-4381-8dfc-493f4b276140	TRIDON ATF CVT	0.85	20	24 X 500 ML	7	7	84000	71400	2026-04-28 17:22:11.573953+00
8	1	308	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.9	7	12 X 1 Lit	2	2	24	21.6	2026-04-28 17:22:11.573953+00
9	1	309	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.9	8	4 X 5 Lit	2	2	40	36	2026-04-28 17:22:11.573953+00
10	1	310	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.9	9	1 X 20 Lit	2	2	40	36	2026-04-28 17:22:11.573953+00
11	1	311	2	MAK	b462ca28-2575-49d9-8bc2-5dfc33361f8b	TRIDON SUPER GEAR SAE 140 API GL-4	0.9	11	1 X 200 Lit	2	2	400	360	2026-04-28 17:22:11.573953+00
12	1	312	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.9	7	12 X 1 Lit	3	3	36	32.4	2026-04-28 17:22:11.573953+00
13	1	313	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.9	8	4 X 5 Lit	3	3	60	54	2026-04-28 17:22:11.573953+00
14	1	314	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.9	9	1 X 20 Lit	33	33	660	594	2026-04-28 17:22:11.573953+00
15	1	315	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.9	11	1 X 200 Lit	3	3	600	540	2026-04-28 17:22:11.573953+00
16	1	316	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.9	13	24 X 200 Ml	3	3	14400	12960	2026-04-28 17:22:11.573953+00
17	1	317	3	MAK	c540c32a-07ed-48df-84b1-13a7d359cd46	ULTRA HD PLUS SAE 50 API CF-4/SL	0.9	20	24 X 500 ML	3	3	36000	32400	2026-04-28 17:22:11.573953+00
18	1	318	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.9	7	12 X 1 Lit	11	11	132	118.8	2026-04-28 17:22:11.573953+00
19	1	319	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.9	8	4 X 5 Lit	11	11	220	198	2026-04-28 17:22:11.573953+00
20	1	320	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.9	9	1 X 20 Lit	11	11	220	198	2026-04-28 17:22:11.573953+00
21	1	321	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.9	11	1 X 200 Lit	11	11	2200	1980	2026-04-28 17:22:11.573953+00
22	1	322	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.9	12	24 X 250 Ml	11	11	66000	59400	2026-04-28 17:22:11.573953+00
23	1	323	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.9	13	24 X 200 Ml	11	11	52800	47520	2026-04-28 17:22:11.573953+00
24	1	324	4	MAK	5855594b-90ed-4fea-8b28-572007beedc1	TRIDON SUPER GEAR HD SAE 85W-140 API GL-5	0.9	20	24 X 500 ML	11	11	132000	118800	2026-04-28 17:22:11.573953+00
25	1	325	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.89	7	12 X 1 Lit	1	1	12	10.68	2026-04-28 17:22:11.573953+00
26	1	326	5	PLS	7f5d1403-fbd8-4e7e-86df-23862aa7c072	SAE 40 API CF	0.89	8	4 X 5 Lit	1	1	20	17.8	2026-04-28 17:22:11.573953+00
27	1	327	6	SCH	fb9e74f6-1143-4544-8a54-d932fc57f2f9	SAE 50 API CH-4/SL	0.9	7	12 X 1 Lit	11	11	132	118.8	2026-04-28 17:22:11.573953+00
\.


--
-- Data for Name: raw_materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."raw_materials" ("id", "rm_code", "rm_name", "category", "unit", "cost", "notes", "is_active", "created_by", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: rm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."rm" ("id", "rm_code", "rm_name", "rm_category", "unit", "status", "notes", "created_at", "density", "tally_price", "tally_date", "market_price", "market_entry_date", "sort_order") FROM stdin;
08706734-e16f-4446-a7c3-a3886ac8031d	RM-0001	SN 500 GI.Bulk.	\N	\N	active	\N	2026-04-15 19:26:13.445975+00	0.85	1100	2026-04-16	1110	2026-04-16	1
cc77cddb-3625-4411-88a8-5e7cd7ad302e	RM-0002	BO.BS 150	\N	\N	active	\N	2026-04-15 19:27:04.024976+00	0.85	1350	2026-04-16	1500	2026-04-16	2
798c695e-491f-4962-b105-93d963a6f579	RM-0003	BO.8 CST	\N	\N	active	\N	2026-04-16 11:40:53.408125+00	0.85	1250	2026-04-16	1300	2026-04-16	3
2203d314-d161-400d-99c8-3338798be4da	RM-0004	BO.N 150	\N	\N	active	\N	2026-04-16 12:20:33.973369+00	0.85	1025	2026-04-16	1100	2026-04-16	4
e059553f-74bd-4202-afe7-30fea3f13ca7	RM-0005	BO.RC 500	\N	\N	active	\N	2026-04-16 12:21:15.842273+00	0.85	775	2026-04-16	900	2026-04-16	5
b00ae7b4-eec2-4c98-a127-7a41fc63b733	RM-0006	RC SN 300.Bulk.	\N	\N	active	\N	2026-04-16 12:21:55.553734+00	0.85	750	2026-04-16	850	2026-04-16	6
477e1c8d-326e-4b9b-958f-b35a578f153b	RM-0007	AD.HYBASE C 402	\N	\N	active	\N	2026-04-16 12:28:21.880001+00	1	3500	2026-04-16	4300	2026-04-16	7
cfc54f45-28a8-4d52-993b-92470ae03e96	RM-0008	AD.J0010	\N	\N	active	\N	2026-04-16 12:29:19.310218+00	1	3951	2026-04-16	4500	2026-04-16	8
d5d2615d-47db-459a-9249-35e51a282f79	RM-0009	AD.LUBIMAX 1600HT	\N	\N	active	\N	2026-04-19 07:59:24.472956+00	1	3545	2026-04-19	4300	2026-04-19	9
ad93f6f8-1e0a-465f-8693-9b46c6d13492	RM-0010	AD.LUBIMAX 1609E	\N	\N	active	\N	2026-04-19 08:04:10.605819+00	1	4000	2026-04-19	4800	2026-04-19	10
dccd75d8-4be0-442e-9b74-da5dc19e7640	RM-0011	AD.LUBIMAX AFS 125H	\N	\N	active	\N	2026-04-19 08:05:28.3293+00	1	14000	2026-04-19	15000	2026-04-19	11
c073d961-c54b-438a-a235-79f61c022503	RM-0012	AD.LUBIMAX AW 1148	\N	\N	active	\N	2026-04-19 08:06:10.492994+00	1	3450	2026-04-19	4200	2026-04-19	12
310bc347-af0f-433f-86db-a4ea34cd9b8f	RM-0013	AD.MAK AF	\N	\N	active	\N	2026-04-19 08:06:54.603923+00	1	7900	2026-04-19	8500	2026-04-19	13
71c0d452-637b-46a7-a4cb-bd1db809b018	RM-0014	AD.TAMMECH S-4130	\N	\N	active	\N	2026-04-19 08:08:02.323391+00	1	7260	2026-04-19	8000	2026-04-19	14
3a085144-a87c-4fe0-9455-e49f2dff624e	RM-0015	AD.TAMMECH S-4160	\N	\N	active	\N	2026-04-19 08:09:36.522511+00	1	10740	2026-04-19	12000	2026-04-19	15
6a9150b6-01cf-455a-89e9-b71022dd5d91	RM-0016	AD.VISCOPLEX 343	\N	\N	active	\N	2026-04-19 08:10:09.653217+00	1	3400	2026-04-19	4300	2026-04-19	16
9916f81f-79f7-4729-8d15-a1ec23bd01ca	RM-0017	A.XYLENE	\N	\N	active	\N	2026-04-19 08:10:47.1697+00	1	3000	2026-04-19	3500	2026-04-19	17
7fbfa86f-5e80-4c82-afbb-b78c0db0ebbf	RM-0018	BHT(HYDROXYL)	\N	\N	active	\N	2026-04-19 08:11:54.786762+00	1	7900	2026-04-19	8500	2026-04-19	18
8705f307-57a7-4f65-90d5-dd6f99115a0d	RM-0019	BO.3 CST	\N	\N	active	\N	2026-04-19 08:25:22.611971+00	0.85	995	2026-04-19	1100	2026-04-19	19
f5f393d3-acdd-4a61-99da-ced8875c9b99	RM-0020	BO.4 CST	\N	\N	active	\N	2026-04-19 08:25:47.54684+00	0.85	1180	2026-04-19	1300	2026-04-19	20
b38e7197-2c8a-4ad4-b75f-f347dc8dbad7	RM-0021	AD.DYE BLUE	\N	\N	active	\N	2026-04-19 08:38:06.931441+00	1	32653	2026-04-19	35000	2026-04-19	21
715f9f87-c91c-4b2f-8d79-78acf7c463fb	RM-0022	AD.DYE BLUE OIL	\N	\N	active	\N	2026-04-19 08:38:44.390188+00	1	27210	2026-04-19	30000	2026-04-19	22
c6973b71-e1b2-41b2-8cb2-8d0ce53d192e	RM-0023	AD.DYE GREEN	\N	\N	active	\N	2026-04-19 08:39:20.304185+00	1	50612	2026-04-19	60000	2026-04-19	23
1cc32b28-eeb7-4642-aa7a-f410d69295d1	RM-0024	AD.DYE RED	\N	\N	active	\N	2026-04-19 08:39:46.561788+00	1	32653	2026-04-19	35000	2026-04-19	24
485083fe-4472-4e23-af05-8aabce57d203	RM-0025	AD.DYE BLUE OIL	\N	\N	active	\N	2026-04-19 08:40:15.914457+00	1	21768	2026-04-19	23000	2026-04-19	25
eed3c69a-8513-4dcf-a984-78fa0bab4e61	RM-0026	SCH 1222.	\N	\N	active	\N	2026-04-28 12:17:23.293345+00	1	1225	2026-04-28	2050	2026-04-28	26
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."user_roles" ("id", "user_id", "role", "created_at") FROM stdin;
4d2ecb3b-6464-4501-88af-a512b5f95524	9110745a-3d71-49b9-b913-db9626e579d4	admin	2026-04-21 17:50:51.747002+00
a994c14a-fe3f-455c-96ae-78690eb50ba1	b2e3086e-a58f-4a8d-808c-61e38ee90b48	user	2026-04-21 17:50:51.747002+00
26d1b8e0-7f3b-4a9a-9e0e-ca727894599c	87367c74-b0dc-4d41-8763-53d1b975d58b	user	2026-04-21 17:55:12.523948+00
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_vectors" ("id", "type", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata", "metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."vector_indexes" ("id", "name", "bucket_id", "data_type", "dimension", "distance_metric", "metadata_configuration", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 204, true);


--
-- Name: app_user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."app_user_roles_id_seq"', 13, true);


--
-- Name: brand_customer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."brand_customer_id_seq"', 38, true);


--
-- Name: customer_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."customer_items_id_seq"', 170, true);


--
-- Name: formula_headers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."formula_headers_id_seq"', 27, true);


--
-- Name: formula_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."formula_lines_id_seq"', 89, true);


--
-- Name: invoice_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."invoice_definitions_id_seq"', 35, true);


--
-- Name: invoice_headers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."invoice_headers_id_seq"', 6, true);


--
-- Name: invoice_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."invoice_lines_id_seq"', 62, true);


--
-- Name: item_code_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."item_code_seq"', 1, false);


--
-- Name: packaging_definitions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."packaging_definitions_id_seq"', 58, true);


--
-- Name: packing_brand_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."packing_brand_id_seq"', 28, true);


--
-- Name: packing_master_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."packing_master_id_seq"', 17, true);


--
-- Name: packing_store_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."packing_store_stock_id_seq"', 1, false);


--
-- Name: pallet_data_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."pallet_data_id_seq"', 1, true);


--
-- Name: pdo_headers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."pdo_headers_id_seq"', 11, true);


--
-- Name: pdo_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."pdo_lines_id_seq"', 327, true);


--
-- Name: price_offer_headers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."price_offer_headers_id_seq"', 1, false);


--
-- Name: price_offer_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."price_offer_lines_id_seq"', 1, false);


--
-- Name: production_headers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."production_headers_id_seq"', 1, false);


--
-- Name: production_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."production_lines_id_seq"', 1, false);


--
-- Name: production_order_headers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."production_order_headers_id_seq"', 1, true);


--
-- Name: production_order_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."production_order_lines_id_seq"', 27, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict Jr7uNkM3cL83Z4rekyGlz1I8ieIeem0049whhLFDw4EZIOkAu19E3iNZ8B2qlI8

RESET ALL;
