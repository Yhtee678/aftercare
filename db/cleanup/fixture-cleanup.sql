-- REVIEW ONLY: not executed. Do not run until the exact scope is approved.
-- Snapshot refreshed 2026-09-15 (Asia/Kuala_Lumpur). Abort if ANY audited row has changed or been added/removed.
-- No migration history, schema objects, application configuration or sequences are removed.
BEGIN;
SET LOCAL TIME ZONE 'UTC';
SET LOCAL lock_timeout = '5s';
LOCK TABLE public.schools, public.school_classes, public.students, public.homework_tasks, public.student_homework, public.dictation_tasks, public.student_dictation, public.daily_student_records IN SHARE ROW EXCLUSIVE MODE;

-- Session-local manifest; explicit IDs and row fingerprints, not name predicates.
CREATE TEMP TABLE fixture_cleanup_manifest (table_name text NOT NULL, id uuid NOT NULL, fingerprint text NOT NULL, delete_record boolean NOT NULL, PRIMARY KEY(table_name,id)) ON COMMIT DROP;
INSERT INTO fixture_cleanup_manifest (table_name,id,fingerprint,delete_record) VALUES
('schools', '02f98164-6a90-43c8-9ad5-4171d4aacd92', 'ee5c833c41b23cbcf7a8ccca1ddd71f2', false),
('schools', '04a0dae0-c992-416e-a20f-4f7e630986c1', '3be6009bbb197155ff60268ba742f45d', true),
('schools', '08ee3f6d-ff7b-41b5-8b03-097723ab3093', '7bf5389e9fab985b0d0cafebc65f9a16', true),
('schools', '186a3e9d-411d-4eb6-b7bb-3341cab91477', '3659e6fe63d8fac6ca0b08792ae181eb', false),
('schools', '3b3f2e0a-478c-4e0c-b8f9-0eaf4ccfb4e2', '22eccd6ea8023223e41d2655d55fd704', true),
('schools', '3d7c8cfa-0f33-4b81-b560-8a251b8deca1', '8e198fb51db842fe84ae2ec2b8091d92', true),
('schools', '5524df6c-6344-4be3-8886-7b22f7e7e3dc', '44f73536bcb16b2bb74520db56d81d2b', true),
('schools', '6313ddae-1240-40e4-b2f5-197ccf214171', '0e42ce6037c38e9c326be05af184b60a', true),
('schools', '67f03858-86b9-4541-8827-22cd8ce1cd8a', '31139b4747d4ba887de0de7be2c46166', true),
('schools', 'a2c00000-0000-4000-8000-000000000001', 'e5eefeef64031c59bcf725681eaa2359', false),
('schools', 'a541f182-0d1b-4d4f-a7be-11fae2ccafbf', '4dc8158a5a1faf8ffcee1007b3bdeda8', true),
('schools', 'ad04d09a-659f-4511-a54d-6fa96c0d263f', 'd5431adfa79f7a46433e77e1b840ebc8', true),
('schools', 'ade66fa1-66d7-4391-90bf-f76d31047a07', '6473881024c9d84d882ef85e417c729a', true),
('schools', 'c6b48845-3d06-473d-85a7-95ef12ad1943', 'f2662504c2984084e2f7c8c3ec0ae75c', true),
('schools', 'd81f3eeb-80bd-4ad6-a575-baf54e6dba58', '89b475ca085db3913cda39707a8f115a', true),
('schools', 'dacf75c7-481f-4a8c-89a2-c567b3bb06f3', 'bee536eabef5f523fec448cd43e59920', true),
('schools', 'e5b9bb84-e3df-423b-a204-da8d206ff89e', 'aa33581d9eca532ef65195587a02f2d1', true),
('schools', 'e80c3217-88c1-40f3-b923-8a054e638f54', 'd11267a9567cec516d0c7dbe0daaacf6', true),
('schools', 'ed651026-ed54-4800-b7ab-dd92dd1c2ed0', 'eee49ca87c234dbcfc9a7e10990768c4', true),
('schools', 'f662ab04-48b3-4bcb-8476-e0a3e3b75526', 'b50e16e007e888cd653b618d89af4391', false),
('school_classes', '201a3d5a-65b8-42a3-a844-60bf96849cb5', 'f6aa761562b247d7a71ebd499b8f2085', true),
('school_classes', '3ece12a9-3f89-414c-93d5-b36994130283', '038d10a8c7539c12a4b434f644d5b9ec', true),
('school_classes', '3f15ac5a-fd75-4159-92ed-3918b4f6f62e', 'f2ad4af4a04cb2e8823840c1abe8c0bf', true),
('school_classes', '43dcac51-da1a-40be-b05b-afb44f734765', '6c076fb8b1444dee0503f7fa0368cfff', true),
('school_classes', '48b87df5-cf55-4f6e-8d7d-22885c83ab56', 'b85a50574aa43093b1d4058541327ef1', true),
('school_classes', '4e7801a3-d77f-4b31-b593-9f0c1ff25a22', '3375f0e228247a3ef4673f9366efa075', true),
('school_classes', '4efc6dfb-c76b-48c9-878e-21966922abc4', 'd1f6770c038b7c70ee7cbde08f71151a', true),
('school_classes', '506b6ae2-adda-4633-bfdc-3ae51d01962c', '6c39b53fd4048f9946ab60302f49a547', true),
('school_classes', '5796a802-6c6e-4020-8453-6f98d98a3180', '89f7d9e06e3201c335d82c25eade456d', true),
('school_classes', '61c78fe6-f81d-40c7-8b27-801e1545f46d', 'ded29a180c4d2116d19c1db0e81f502e', true),
('school_classes', '6ef9b7de-b7c0-47af-b785-f0b8f0dcfb35', 'cdb4d20eacdc92e8d1cc82bd793830ec', true),
('school_classes', '747da31d-39f6-4aeb-801c-445c0f352176', '3f019f9cd0d583e88a834f33bd2bc283', true),
('school_classes', '7c460c0a-3ce1-4d9a-a2fd-36de34ff1867', 'daedb9c3d4e11f47508834d7897dec69', true),
('school_classes', '945981c5-2ff9-42b5-bda7-55f3e98fd55f', '7d9facc8ea52092c42dae303524b8192', true),
('school_classes', '9694c09e-9ec9-4ed3-84dc-7378f9791726', '61e4f9e51799489de80cef0a96e07347', true),
('school_classes', 'a0ff66b3-bde8-4697-9eae-99f3a3a95314', '17839d80bbf1d13a070b1d9d076c58f7', true),
('school_classes', 'a170d848-7fde-4be2-93ac-fd4b32e2a0f4', '1208164dc7120e11667fd56a0eb9dc0d', true),
('school_classes', 'a2c00000-0000-4000-8000-000000000101', 'c7864392c04edffbb9e7119c42c499b4', false),
('school_classes', 'a2c00000-0000-4000-8000-000000000102', '1947cfa48e9dee5d33451031c7ddbcf9', false),
('school_classes', 'a4134fa7-dcb5-4b1f-bf3e-41ac8b623e94', '55685978273e005ee1c26f67031902af', true),
('school_classes', 'a8eefe1b-db39-4a69-9629-f29668d26b7d', '96d836409b431aa3339d50aaa5bbbfa9', false),
('school_classes', 'aa286314-7933-4202-8288-fb6896d7fd1b', 'dacabc3b7c6789d5d8fff8fc03134a02', true),
('school_classes', 'ae2871de-3b00-4473-acac-acc8cd9150d2', '249d35d531fd057425f59f4888fa5379', true),
('school_classes', 'b0d85892-ffc7-44bf-a5d9-a256790afacf', 'f6ef4c6b330cc10f5d6f97a1b35b350f', true),
('school_classes', 'bfa3df4c-2a4b-451d-9d8f-af853ba433ce', 'a111743821fe33bebcd1c91471dc93f3', false),
('school_classes', 'c263c908-b533-4b2f-806f-c5e3f1d8b44e', 'a48a553fc18e83b476ea11875e62cbf0', true),
('school_classes', 'c4ecd0c2-7751-4bb0-8f26-5e7134edc55e', '435aea2b2b71c9f67c43af67e8b224f3', true),
('school_classes', 'd59681ea-56b4-433e-b502-c1f056695f3e', '7bbc953eee64b0ea1b181dd33c9f4885', true),
('school_classes', 'd6607ec6-59e2-4f8b-9fee-c7ba80312b06', '9007027cee719282ca8757e66704640a', true),
('school_classes', 'd78fff38-d534-4c99-ab35-757365d28969', 'bc05d5fe69ebb18feb7674244ea306e3', true),
('school_classes', 'e4e9e1f0-fd2b-4c0d-882a-43c0d323d626', 'e7b7d4baa55ba515c1d1abc31d39e726', true),
('school_classes', 'f6c8770f-39ae-498a-809e-3f7297933c9f', '584474ca610979af180be2e4576fdc3c', true),
('students', '0ecc71f6-8379-427a-b313-daa96225bc42', '0c666994522bad83421c2f12207130fd', true),
('students', '12a4627d-5f56-4b77-95df-bdf2d8a74442', 'aa33b764b9c92da1c3de89a4acd55a2f', true),
('students', '1393292c-d4ed-4cf5-b13f-c8debdbb2394', '969626fd03c5b76e2ea7e74d9824df50', true),
('students', '21c0476b-f4f0-4a7d-ae74-f67e23c25d02', '730355dc49d6b7b81562fba128f3660c', true),
('students', '2ce4929f-7601-4932-b261-a978421c3c9e', '1b981c6ea8ddd38a739352afcdffb800', true),
('students', '3677f03c-0814-466b-806a-e09e41835db4', '685fb428005b4712c6fc730de698985a', true),
('students', '451d1ecf-6a1e-41fe-844f-2a6b8be7f772', '3c72ac7d6eebf0b99bd76040838cbc47', false),
('students', '4b734419-0ea0-4382-9a7b-f5293e6139d5', '2dc04efcced4ac569a21073848deb1bf', true),
('students', '50671116-c6a6-4df5-bdda-409f97776e8e', '98c37c033243b1baf92b158108707887', true),
('students', '5ef24eed-99f0-489f-b929-d3bf17495e8c', '8112ed0ed9c92a6f7ee028eb8d5e94ba', true),
('students', '64903eba-7f38-4b24-afd0-c4a847fdbecc', '615062b1af42b077e4a0244c5b333bcf', true),
('students', '69812855-aad1-415c-80d1-81dd309f735c', 'dbb4c7f59710794b2568aba32ce04caa', true),
('students', '76fa28fa-c874-4998-b711-62ba6bf2ce42', '6fccaff644b7de68a230b647e3bacc69', true),
('students', '7c748457-4af6-477e-bed7-65a5f751d226', '5737490c8c4ed23ec2cfcece3760da83', true),
('students', '838cfe5f-c81d-4859-8134-af72606e8f48', '5e74188b9e786f93ca43b76591336401', true),
('students', '8a7fbde8-ad2b-4910-ba4d-0391a3f1d3ac', 'd97a53b0e1476d4566ab0bd4e976d7fa', true),
('students', '93958108-ae86-4f54-932b-ba5c39cff3ae', 'cb4d3ea9c3c59fbbb531d7ae04400e9c', true),
('students', '94aac5f0-5b02-42cf-8b71-4dd2beceea28', '5f7cbd8b99e0330ce8d258c02898ad1d', true),
('students', '96f3c054-6ca5-4ad4-9a5d-377ed85b6841', '1c33f80e66294ae6dcc8f296b7b8528c', true),
('students', '97b4264a-b248-4703-81f7-14a3a9242787', '888476b67de041282cae61bd9b463f79', true),
('students', '9fb037a4-e0ed-48bb-bcf2-8d259117243e', 'a39142e46b740705f11d95e7f1a04800', true),
('students', 'a2c00000-0000-4000-8000-000000000201', '9177adb6a9ad0bf92e90155987c76f50', false),
('students', 'a2c00000-0000-4000-8000-000000000202', '347a6020f5087842c26d60e1dd433de4', true),
('students', 'a2c00000-0000-4000-8000-000000000203', 'f4a131aab49881168501bc1ac0d6c1b6', true),
('students', 'a2c00000-0000-4000-8000-000000000204', '522d6920cdfb5c7752e61155637a0e2e', true),
('students', 'a2c00000-0000-4000-8000-000000000205', 'e1c9ac1ee41e084197a926b8a8082f03', true),
('students', 'a2c00000-0000-4000-8000-000000000206', '65b37b51deaa966cf92cd279437ff502', true),
('students', 'a6222be0-a52e-4864-a188-0debf07484c0', '44b36245abfa634d172d44b476ea1dd5', false),
('students', 'af2a31c3-b8d4-438b-8029-a85debb3acf9', '987fef7a8096a0935e76ef83ee0264d0', true),
('students', 'af573a03-9b37-4b80-860e-4af0b5b8d4bc', '80ada17bc49ad8ee053369197c62d72f', true),
('students', 'afb413f4-5276-4e8d-8d2b-80f0c9548626', '1b69ef248206e94706b6b71836e8080b', true),
('students', 'ba2a08cb-14c1-4228-b260-cdd63b521584', '80863d3b9b9f8603c1f4af4ac2c27b68', false),
('students', 'c278b9d8-216b-4a8d-871a-76e732987773', 'ddd1389745b8d9b54df9c82415b0b220', true),
('students', 'c7a28247-b1f6-40a3-8d24-3c6e3c3f39f1', '54170bafbd16749b5682e63a50e3640d', true),
('students', 'c84aea67-1193-4fe9-9a6e-478b242d1308', '1231f8518b1a86eceb018516fdc4d659', true),
('students', 'c8b1521b-f551-401e-88e4-7d1618eac650', '4910474635261e7904eff102441e91af', true),
('students', 'dfb0735b-adc7-48ee-bd8b-820143a7071f', '8e5affcbf47dab4286cce2a01c4cb142', true),
('students', 'e25ca6d2-ec5a-4141-b0ef-657ddb7a59c1', '493f386a49cf66800257240bc23ab719', true),
('students', 'e266592b-23b3-4b1b-a17e-190731900c91', '4549e18c56e85e3698a5af4fe85546c0', true),
('students', 'e3d8f594-f58b-43de-8f5e-6db1b5029e21', 'c34e7952a7eb491670c0bf65bbe9d015', true),
('students', 'e5096784-c8c5-446b-bb2a-8bc94ec53aeb', '3830a269c2c23f2fa77ce36fe1a24e7e', true),
('students', 'f38d353a-8cf3-42b8-9e33-45eb153aad04', '92858f8c1f121e08547a65b326c6dc31', true),
('homework_tasks', '1891f849-780b-4856-a3cc-13f5db412115', '7af816bac8cbb9bc4579a05c2aad0aef', true),
('homework_tasks', '1ba742a9-7bb6-46ee-9ff6-7a3c966e5797', 'f8c14436104e7035513f3430e31d1404', false),
('homework_tasks', '26baee33-2590-4459-94e2-c3b1e9710ed9', 'cc5858cbaebc2c9218105d3ff293ef45', true),
('homework_tasks', '4b423754-80ac-4e47-a1c9-8c1e63be7241', '6a23e036cf06019ab1d226bd7f642a45', false),
('homework_tasks', '62ee708d-ba0a-43f6-98d9-3748eb220304', '14138a9f952cdbd8c2d4d67f032c42bb', true),
('homework_tasks', '8cca07ff-cc3a-4ba2-b9fa-43bf9144d7b8', '972ae6f06eedfbb42b90aaf5ef7e811b', true),
('homework_tasks', '8fa6be9b-15ae-4c5a-bf7d-bbea89f01324', 'bf056fc6445314181d31a9d676e7efc1', false),
('homework_tasks', 'a1bab71d-190e-489a-b720-fec7273c6f1e', 'ca9d861fbced465f713c2062dedbf625', true),
('homework_tasks', 'c0a1436c-0bde-4b76-b59d-d9a1e1b790a2', 'edd1ca911a5b426d81b3440795cdce96', false),
('homework_tasks', 'ccf42d66-9794-44f5-9c93-e93b55f0c65a', '68b33f2679f83c97669d8ac2c26e1804', true),
('homework_tasks', 'd7d2a39f-e251-4f63-9244-0c9a92a50d96', '9872ca693b45956a3029676810365ad7', false),
('homework_tasks', 'e9e51904-88dd-491d-a42a-ec50fe7d8cc6', 'ffc7f23be4b647991ecaba32ec155a49', true),
('homework_tasks', 'fcc2f6c3-cc31-468c-b3bc-94c10bc9de53', '402cd00660b37d08b69c9b07c1119ada', true),
('student_homework', '047f60e8-f53d-4398-8e34-c7454c655aa1', '5cc52de50af6bd495f79e6af5edcd049', false),
('student_homework', '1328b209-d573-4daf-be66-46001ef8ce52', 'c8826af41ccb2ed9d2ac5adf53ed2087', true),
('student_homework', '16de1794-2f7b-4e51-b6a7-f91474626bf7', '4fdc1f117e5e023612fdd423fc893614', true),
('student_homework', '187f67ab-4b04-4706-8ce9-f46e58e45b6f', 'd5cab018c4120588206960d0983a6eb7', true),
('student_homework', '2c44edff-0636-4411-b631-60b9cc94f60f', 'cc60a151d7f8ed4b6b0b4d5640a1b8a4', true),
('student_homework', '40dff20b-8c05-4d32-9ac6-105acb7bcc3b', '77df62eaed65e359d2c245978d2129d9', true),
('student_homework', '4977a4e3-1e19-409c-bee9-4e775719db53', 'c12fc7333a8cd130aa5f006abacfe6df', true),
('student_homework', '4eab5f40-bea5-4cf1-93fc-cde6431b7c6e', '07d5b1338d5af638fdf1254f80620b77', false),
('student_homework', '5bba342e-1fd0-4777-bc77-05ba50ccdb65', '8eed19f670372e1755b3c70493984957', true),
('student_homework', '5cce0394-a207-47d5-a1b6-b1449a8a2f02', '6372c8ff4a7a4e147b6ac4709d9c83fc', false),
('student_homework', '60d42e66-d0b8-4be4-9bf5-0d047e7cc75e', '6eb054436b9a672b147ea3280c5b446f', true),
('student_homework', '6635bf28-0aae-42b0-90e8-d780593a89dc', '31d1b88633073257ae79f62b8a90c211', true),
('student_homework', '681e1370-dbeb-4ec0-ae53-a32cdef2daa9', '59d79466295dbe54056906f84e3f5b85', true),
('student_homework', '6e7380ca-e655-47c6-b42d-2a55a0cc793c', '5e02e4957a3a8b5c5fb85d6e77de699e', true),
('student_homework', '6e802ddd-7244-4875-997d-83861584165a', '8bde3543591cd2845d9d0eb5437963bf', true),
('student_homework', '6ed366a8-a411-4cf4-8547-ba5557b52630', 'b94fef30c6dedd30809ed230469a5673', true),
('student_homework', '71e1b240-03b7-4976-8912-5138e8bfe13e', '59e38f06a51cbdf8daea9f2386d002fc', true),
('student_homework', '7548673c-60dd-4b93-8414-19ed88d7aea0', 'efb74b7e07de67b99e5a06b62be30e8f', false),
('student_homework', '7f2a2504-e2dc-4af0-bacb-6cf83e829eda', '0621af55f16999dee09cc2756896bf2b', true),
('student_homework', '83770bc4-400b-4edc-b15c-d6388b42bfba', '2248191c5dba4560de0d307308e9126a', true),
('student_homework', '9bc6174c-5574-48ef-8a30-3aaa9f42fe2d', 'f0455e06fb26f2821c893551eaed9e79', false),
('student_homework', '9f1deed4-cfef-402e-9e0a-438a32a4542c', 'eaded01562d2c0166a721737e9df462b', false),
('student_homework', 'a2d1e90d-0c8e-4f22-94c2-17b9fb30f7f2', 'e159517ded148f2e59eb807501241d9c', true),
('student_homework', 'af7b68a2-15a0-4762-b022-f57b9891d960', '4b112564e6f72a9fbedc905a638d2ed3', false),
('student_homework', 'b07ac011-cc03-42ef-b9d7-a495390a1cd8', '8b9d429610ae2d103d0afc57604514a1', true),
('student_homework', 'c710c8ad-63e2-4ef1-9a85-0425b9650a7d', '63e0b378e11a1a4a106459abd756999d', false),
('student_homework', 'e55e8235-7a7b-4fe3-be25-0d3840cae915', '258b80bcc40eff17a48c55fe1801c3de', true),
('student_homework', 'eb93fe7d-593a-42ab-bc55-a8b685bc5b89', '7d38dd6aabb7c827687c7177ecea59e5', true),
('student_homework', 'ed530897-2bfe-47a8-abf7-23e7aefa9631', '8df7b0854637af1c040c3a49456c7895', true),
('student_homework', 'ed862ba8-aa40-4825-8cbe-c7369660f60f', '9e5adc31dc17eea32f493a5d351a17bc', true),
('student_homework', 'f3f8a10f-9e5c-430f-8dad-3d23356c3970', 'f89d342e95287468b61cdac248adc587', true),
('student_homework', 'f903e97a-c58b-4c7b-875f-7171f23c9c31', 'b2c2880f1d1642aa367f12166fabd97c', true),
('student_homework', 'f9b035a6-7088-4c24-964f-9ab982752dfb', '5f63499c04c8243aac0b725a9154ed9a', true),
('student_homework', 'f9b5aae0-3e8c-43f3-93dd-337ee0cac2ad', '10d5cc0bc3e8c4df6c78fad61b3b3a34', false),
('dictation_tasks', '20aac524-7153-421d-8c25-72efc269891c', '5b0f55a0c82b82353aeaeadd52b2cb2b', true),
('dictation_tasks', '9949c6aa-f7ff-4aa4-b123-20b7c83b8ec7', 'b92413de88fd6621924120f21b9f697d', true),
('dictation_tasks', 'a454f4aa-7fec-4a0f-ba0b-168cbdb45e57', '94154a882f34203863faabaeccc9a0ee', true),
('dictation_tasks', 'af562c99-9be6-46c2-869f-3185b073ce03', '25d750d311fb4a71e1ac11d5c172064e', true),
('dictation_tasks', 'b1cdaed6-66ff-44a4-8f83-aad64693bb95', 'e944e7b25da5bd649378d973f4624b47', false),
('dictation_tasks', 'cc45e08e-0158-48e0-94e1-0750e990dbe5', '9aa96085f26de16102fd86de78a3122a', true),
('dictation_tasks', 'f70d9138-a6dd-4988-8d43-1e1c81b57c47', '17fe753535df4ba9be1fd767049f6071', true),
('dictation_tasks', 'f894d866-c7b5-471f-8e84-dc9603c7f005', '08764574e4a8a058918f88fbe67be839', true),
('student_dictation', '080c3c57-1ab5-4fa2-bb8d-5fbe48112b7d', '1f2edca788f4754aaf27e52c1c3fd505', true),
('student_dictation', '0b51fecf-0295-40fd-8d82-2eb3b59d8927', '85d7e80d476cb712ba3c500a6199bf7c', true),
('student_dictation', '13e4c7bf-9104-4059-a128-904ec6fe9b12', '9d5740b2fb5dbab6591fa23b7afa83e8', true),
('student_dictation', '26ec4e4b-a535-44de-8e4f-5c76de3ce6a3', '3d36a8dada5bb0e12ddf0ca8be65e7b2', false),
('student_dictation', '27609c34-9b80-4286-a2a1-1a0c8b24245e', '87dfe6c15328f29d3baaa43df959db8a', true),
('student_dictation', '77ab98e2-f614-4fdf-b458-1cc6e1bffaaa', '9aa435cd9e78477cc4f41e65fbf9e1b1', true),
('student_dictation', 'b0a0e741-72cf-4273-8d89-25b25f9f6faf', '207e1e6df2422fad2350aaaf56ec25fe', true),
('student_dictation', 'b2851225-1e35-433e-b209-27cedcb61609', '9d62190de9ac9935cabe685c490a20ef', true),
('student_dictation', 'bb33109e-ffe0-4187-aab3-c0043fbc7b49', '05ea1301309f3f54982c63f08820d074', true),
('student_dictation', 'bdd4f518-f023-437b-8069-be02139630eb', 'affa37b7cf21c9be1b3bf4fed97b274f', false),
('student_dictation', 'c2ed7fbe-4d61-4eed-a249-1c8b5a9f4ca0', '792ff8f77700f733c9b2cf021519e897', true),
('student_dictation', 'f22e03ce-08b1-473d-a483-3998e9aa2a94', 'd2eda5da0a0a066bd1f99612d7009ed0', true),
('student_dictation', 'fb6fa49c-0837-4d97-adca-b62806eea80f', 'fb435f047a36049ecc21969bc59f4403', true),
('daily_student_records', '025099e9-4665-4877-8ad5-60244eef701b', '38913bc9a72f5f7440064e27b3c869bf', true),
('daily_student_records', '06a45eb5-2cf4-4ab5-8f9a-a39bd48b798e', '6d3fc5807ed779e7f8087bd29b52eb91', false),
('daily_student_records', '0e13c631-57a2-407f-83eb-3eaae0de20d3', '400dce21ab5c497323271d47a92d8c81', true),
('daily_student_records', '135c98ff-d86b-40a9-89f2-c0994b82cd84', '45d693882db64e4ab7e7aa5261bba78c', true),
('daily_student_records', '1d494ab6-13a4-4302-a8c3-38c15282edb5', '068590f0506c809af43df31a7ab2b189', true),
('daily_student_records', '56b7b188-7f05-4c24-baca-f4b6e0e0a4ac', '64d0d1b07514f29d435645d9a38e681f', true),
('daily_student_records', '57652a88-10af-4f0d-af03-e2d6569cc43a', 'adda2b7d794a807ddb9b36a8958983e6', true),
('daily_student_records', '5ff8b13f-fff7-4ada-ac32-410198b58960', 'ab080337ec716d37a7c82ae491e78c1b', true),
('daily_student_records', '603886d1-7fc1-4271-9d47-69bbf9147f87', 'df15c313ab398f77f3e1c34b12a5517b', true),
('daily_student_records', '6437ec26-de43-4751-9bfe-83f9e9a13e3d', '39a23fdd1403ec301a232eb696197161', true),
('daily_student_records', '755704e5-b744-4d30-a4a6-8e5f80fe10f7', '4906c5eb4c0dab4f406e5203f8b56aa8', true),
('daily_student_records', '80ccc3b6-66fa-4493-889e-28d1f7ae5e5e', '61a894a0bbfccf8f726b8ab99e026942', false),
('daily_student_records', '828d66e6-7844-47d1-a47a-f87a3f3c532c', '6e78e344883aeff7e2470140393a6b74', true),
('daily_student_records', '866ec007-0c0b-4ab8-a25b-bfa3355f91b8', '143a7418db4e39d3e7f43ec0a05115b2', true),
('daily_student_records', '9027d179-e3ac-4e80-ae17-17911a37c7ed', '0dee5f54372dcec0115625569f5d5c0b', true),
('daily_student_records', '985fd3a6-364b-46c8-a2c6-abd1aeb185cd', '66171e9a5bd568231ca1412f9db9750b', false),
('daily_student_records', 'a9d8d3ee-1c62-4a0f-8f47-b5b8f930de5a', '5c56aa6d8b1d9c5bfcab47add5f92031', true),
('daily_student_records', 'b3ea6a98-4b5f-4bae-9a21-214d2d7ea11f', '1bacd564be5ce1cec7a3960804903461', false),
('daily_student_records', 'b6c83c31-2a53-48d9-83b2-a6e2ad504316', '697811c3e4d32127200cd4a83280feab', true),
('daily_student_records', 'c0778237-5d0c-47b3-9bb2-d78d8bbc746e', '1018d4ec984473fd67c9f3ed40c6c3d9', true),
('daily_student_records', 'c1de5bb7-9ef0-45c4-b667-731dd5109025', '28861fdb5d68ac81b5d7dbe2af523c32', true),
('daily_student_records', 'c6463468-3b11-493e-b698-79405fd051ef', '690e9e6c970d82c9f51c62e989c1dbd9', true),
('daily_student_records', 'ce82810b-1d1d-494a-ba9d-e4cbbf97c794', '8c3ab29b2f441461293cc014c3ff81c7', true),
('daily_student_records', 'f5704b87-41cc-41bb-8a73-7c87dd392ad4', 'f6d0ed1223bc67201efea4966c3e398d', false),
('daily_student_records', 'f8ab8ff0-300c-4c98-abc6-f593075224cb', '9feefed4aad07a1d28d7b235e7ab513b', true),
('daily_student_records', 'fc4c9b96-5713-4be5-9410-82b0a588892d', '41af6bf56499d2a06ac64ddaa6cba1ca', true),
('daily_student_records', 'ff94c82e-8ec0-447b-a137-c2f645d92d87', '7ae625d7af534801ab0776c83832a2d5', false);

DO $verify$
DECLARE item record; differences bigint;
BEGIN
  FOR item IN SELECT DISTINCT table_name FROM pg_temp.fixture_cleanup_manifest LOOP
    EXECUTE format(
      'SELECT count(*) FROM (SELECT id, md5(to_jsonb(t)::text) AS fingerprint FROM public.%I t) actual FULL JOIN (SELECT id, fingerprint FROM pg_temp.fixture_cleanup_manifest WHERE table_name = %L ) expected USING (id) WHERE actual.id IS NULL OR expected.id IS NULL OR actual.fingerprint IS DISTINCT FROM expected.fingerprint',
      item.table_name, item.table_name) INTO differences;
    IF differences <> 0 THEN RAISE EXCEPTION 'Pre-cleanup snapshot verification failed for %, transaction must be rolled back', item.table_name; END IF;
  END LOOP;
END
$verify$;

-- FK-safe, explicit-ID deletes. Every FK was inspected: ON DELETE RESTRICT.
-- Exactly 25 approved fixture rows in student_homework.
DELETE FROM public.student_homework AS target USING pg_temp.fixture_cleanup_manifest AS fixture
WHERE fixture.table_name = 'student_homework' AND fixture.delete_record AND target.id = fixture.id;

-- Exactly 11 approved fixture rows in student_dictation.
DELETE FROM public.student_dictation AS target USING pg_temp.fixture_cleanup_manifest AS fixture
WHERE fixture.table_name = 'student_dictation' AND fixture.delete_record AND target.id = fixture.id;

-- Exactly 21 approved fixture rows in daily_student_records.
DELETE FROM public.daily_student_records AS target USING pg_temp.fixture_cleanup_manifest AS fixture
WHERE fixture.table_name = 'daily_student_records' AND fixture.delete_record AND target.id = fixture.id;

-- Exactly 8 approved fixture rows in homework_tasks.
DELETE FROM public.homework_tasks AS target USING pg_temp.fixture_cleanup_manifest AS fixture
WHERE fixture.table_name = 'homework_tasks' AND fixture.delete_record AND target.id = fixture.id;

-- Exactly 7 approved fixture rows in dictation_tasks.
DELETE FROM public.dictation_tasks AS target USING pg_temp.fixture_cleanup_manifest AS fixture
WHERE fixture.table_name = 'dictation_tasks' AND fixture.delete_record AND target.id = fixture.id;

-- Exactly 38 approved fixture rows in students.
DELETE FROM public.students AS target USING pg_temp.fixture_cleanup_manifest AS fixture
WHERE fixture.table_name = 'students' AND fixture.delete_record AND target.id = fixture.id;

-- Exactly 28 approved fixture rows in school_classes.
DELETE FROM public.school_classes AS target USING pg_temp.fixture_cleanup_manifest AS fixture
WHERE fixture.table_name = 'school_classes' AND fixture.delete_record AND target.id = fixture.id;

-- Exactly 16 approved fixture rows in schools.
DELETE FROM public.schools AS target USING pg_temp.fixture_cleanup_manifest AS fixture
WHERE fixture.table_name = 'schools' AND fixture.delete_record AND target.id = fixture.id;


DO $verify$
DECLARE item record; differences bigint;
BEGIN
  FOR item IN SELECT DISTINCT table_name FROM pg_temp.fixture_cleanup_manifest LOOP
    EXECUTE format(
      'SELECT count(*) FROM (SELECT id, md5(to_jsonb(t)::text) AS fingerprint FROM public.%I t) actual FULL JOIN (SELECT id, fingerprint FROM pg_temp.fixture_cleanup_manifest WHERE table_name = %L AND NOT delete_record) expected USING (id) WHERE actual.id IS NULL OR expected.id IS NULL OR actual.fingerprint IS DISTINCT FROM expected.fingerprint',
      item.table_name, item.table_name) INTO differences;
    IF differences <> 0 THEN RAISE EXCEPTION 'Post-cleanup preservation verification failed for %, transaction must be rolled back', item.table_name; END IF;
  END LOOP;
END
$verify$;

-- Expected counts after successful verification; any mismatch above aborts COMMIT.
SELECT table_name, count(*) AS before_count, count(*) FILTER (WHERE delete_record) AS deleted_count, count(*) FILTER (WHERE NOT delete_record) AS preserved_count
FROM pg_temp.fixture_cleanup_manifest GROUP BY table_name ORDER BY table_name;

COMMIT;
