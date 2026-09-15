# Fixture cleanup review — 2026-09-15

READ-ONLY audit. Cleanup has NOT been executed. Every row below has an explicit UUID. Unclassified/repurposed records are preserved.

| Table | Current | Delete | Preserve |
|---|---:|---:|---:|
| schools | 20 | 16 | 4 |
| school_classes | 32 | 28 | 4 |
| students | 42 | 38 | 4 |
| homework_tasks | 13 | 8 | 5 |
| student_homework | 34 | 25 | 9 |
| dictation_tasks | 8 | 7 | 1 |
| student_dictation | 13 | 11 | 2 |
| daily_student_records | 27 | 21 | 6 |

## Confirmed fixtures proposed for deletion

### schools

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 04a0dae0-c992-416e-a20f-4f7e630986c1 | Test M4B School 04a0dae0 | Integration fixture name includes its own UUID prefix |
| 08ee3f6d-ff7b-41b5-8b03-097723ab3093 | Test Dictation School 08ee3f6d | Integration fixture name includes its own UUID prefix |
| 3b3f2e0a-478c-4e0c-b8f9-0eaf4ccfb4e2 | Test M4B School 3b3f2e0a | Integration fixture name includes its own UUID prefix |
| 3d7c8cfa-0f33-4b81-b560-8a251b8deca1 | Test M4A Renamed 3d7c8cfa | Integration fixture name includes its own UUID prefix |
| 5524df6c-6344-4be3-8886-7b22f7e7e3dc | Test M4A School 5524df6c | Integration fixture name includes its own UUID prefix |
| 6313ddae-1240-40e4-b2f5-197ccf214171 | Test M4A Renamed 6313ddae Inactive | Integration fixture name includes its own UUID prefix |
| 67f03858-86b9-4541-8827-22cd8ce1cd8a | Test Homework School 67f03858 | Integration fixture name includes its own UUID prefix |
| a541f182-0d1b-4d4f-a7be-11fae2ccafbf | Test M4B School a541f182 | Integration fixture name includes its own UUID prefix |
| ad04d09a-659f-4511-a54d-6fa96c0d263f | Test Homework School ad04d09a | Integration fixture name includes its own UUID prefix |
| ade66fa1-66d7-4391-90bf-f76d31047a07 | Test Care School Renamed | care.integration.ts rename; matching Test Care roster and immutable original school snapshot |
| c6b48845-3d06-473d-85a7-95ef12ad1943 | Test Care School c6b48845 | Integration fixture name includes its own UUID prefix |
| d81f3eeb-80bd-4ad6-a575-baf54e6dba58 | Test Homework School d81f3eeb | Integration fixture name includes its own UUID prefix |
| dacf75c7-481f-4a8c-89a2-c567b3bb06f3 | Test M4A Renamed dacf75c7 Inactive | Integration fixture name includes its own UUID prefix |
| e5b9bb84-e3df-423b-a204-da8d206ff89e | Test Dictation School e5b9bb84 | Integration fixture name includes its own UUID prefix |
| e80c3217-88c1-40f3-b923-8a054e638f54 | Test Format School e80c3217 | Integration fixture name includes its own UUID prefix |
| ed651026-ed54-4800-b7ab-dd92dd1c2ed0 | Test Homework School ed651026 | Integration fixture name includes its own UUID prefix |

### school_classes

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 201a3d5a-65b8-42a3-a844-60bf96849cb5 | Test Dictation 0; school=e5b9bb84-e3df-423b-a204-da8d206ff89e | Exact integration class label under confirmed Test school |
| 3ece12a9-3f89-414c-93d5-b36994130283 | Test Care Class 2; school=ade66fa1-66d7-4391-90bf-f76d31047a07 | Exact integration class label under confirmed Test school |
| 3f15ac5a-fd75-4159-92ed-3918b4f6f62e | Test Homework 3; school=d81f3eeb-80bd-4ad6-a575-baf54e6dba58 | Exact integration class label under confirmed Test school |
| 43dcac51-da1a-40be-b05b-afb44f734765 | Test Care Class 1; school=ade66fa1-66d7-4391-90bf-f76d31047a07 | Exact integration class label under confirmed Test school |
| 48b87df5-cf55-4f6e-8d7d-22885c83ab56 | Test Homework 4; school=ed651026-ed54-4800-b7ab-dd92dd1c2ed0 | Exact integration class label under confirmed Test school |
| 4e7801a3-d77f-4b31-b593-9f0c1ff25a22 | Test M4A Class; school=6313ddae-1240-40e4-b2f5-197ccf214171 | Exact integration class label under confirmed Test school |
| 4efc6dfb-c76b-48c9-878e-21966922abc4 | Test Homework 2; school=ed651026-ed54-4800-b7ab-dd92dd1c2ed0 | Exact integration class label under confirmed Test school |
| 506b6ae2-adda-4633-bfdc-3ae51d01962c | Test Dictation 4; school=e5b9bb84-e3df-423b-a204-da8d206ff89e | Exact integration class label under confirmed Test school |
| 5796a802-6c6e-4020-8453-6f98d98a3180 | Test M4A Class; school=dacf75c7-481f-4a8c-89a2-c567b3bb06f3 | Exact integration class label under confirmed Test school |
| 61c78fe6-f81d-40c7-8b27-801e1545f46d | Test Homework 1; school=67f03858-86b9-4541-8827-22cd8ce1cd8a | Exact integration class label under confirmed Test school |
| 6ef9b7de-b7c0-47af-b785-f0b8f0dcfb35 | Test Format Class; school=e80c3217-88c1-40f3-b923-8a054e638f54 | Exact integration class label under confirmed Test school |
| 747da31d-39f6-4aeb-801c-445c0f352176 | Test Dictation 2; school=e5b9bb84-e3df-423b-a204-da8d206ff89e | Exact integration class label under confirmed Test school |
| 7c460c0a-3ce1-4d9a-a2fd-36de34ff1867 | Test Homework 4; school=67f03858-86b9-4541-8827-22cd8ce1cd8a | Exact integration class label under confirmed Test school |
| 945981c5-2ff9-42b5-bda7-55f3e98fd55f | Test M4B Class; school=04a0dae0-c992-416e-a20f-4f7e630986c1 | Exact integration class label under confirmed Test school |
| 9694c09e-9ec9-4ed3-84dc-7378f9791726 | Test Homework 3; school=ad04d09a-659f-4511-a54d-6fa96c0d263f | Exact integration class label under confirmed Test school |
| a0ff66b3-bde8-4697-9eae-99f3a3a95314 | Test Today 1; school=f662ab04-48b3-4bcb-8476-e0a3e3b75526 | today.integration.ts class/task/roster pattern; renamed parent school preserved |
| a170d848-7fde-4be2-93ac-fd4b32e2a0f4 | Test Today 1; school=02f98164-6a90-43c8-9ad5-4171d4aacd92 | today.integration.ts class/task/roster pattern; renamed parent school preserved |
| a4134fa7-dcb5-4b1f-bf3e-41ac8b623e94 | Test Homework 0; school=67f03858-86b9-4541-8827-22cd8ce1cd8a | Exact integration class label under confirmed Test school |
| aa286314-7933-4202-8288-fb6896d7fd1b | Test Today 0; school=02f98164-6a90-43c8-9ad5-4171d4aacd92 | today.integration.ts class/task/roster pattern; renamed parent school preserved |
| ae2871de-3b00-4473-acac-acc8cd9150d2 | Test Homework 0; school=ed651026-ed54-4800-b7ab-dd92dd1c2ed0 | Exact integration class label under confirmed Test school |
| b0d85892-ffc7-44bf-a5d9-a256790afacf | Test Homework 2; school=67f03858-86b9-4541-8827-22cd8ce1cd8a | Exact integration class label under confirmed Test school |
| c263c908-b533-4b2f-806f-c5e3f1d8b44e | Test Dictation 3; school=08ee3f6d-ff7b-41b5-8b03-097723ab3093 | Exact integration class label under confirmed Test school |
| c4ecd0c2-7751-4bb0-8f26-5e7134edc55e | Test Care Renamed; school=ade66fa1-66d7-4391-90bf-f76d31047a07 | Exact integration class label under confirmed Test school |
| d59681ea-56b4-433e-b502-c1f056695f3e | Test M4B Inactive; school=04a0dae0-c992-416e-a20f-4f7e630986c1 | Exact integration class label under confirmed Test school |
| d6607ec6-59e2-4f8b-9fee-c7ba80312b06 | Test Care Class 3; school=c6b48845-3d06-473d-85a7-95ef12ad1943 | Exact integration class label under confirmed Test school |
| d78fff38-d534-4c99-ab35-757365d28969 | Test Dictation 1; school=e5b9bb84-e3df-423b-a204-da8d206ff89e | Exact integration class label under confirmed Test school |
| e4e9e1f0-fd2b-4c0d-882a-43c0d323d626 | Test Today 0; school=f662ab04-48b3-4bcb-8476-e0a3e3b75526 | today.integration.ts class/task/roster pattern; renamed parent school preserved |
| f6c8770f-39ae-498a-809e-3f7297933c9f | Test Homework 1; school=ed651026-ed54-4800-b7ab-dd92dd1c2ed0 | Exact integration class label under confirmed Test school |

### students

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 0ecc71f6-8379-427a-b313-daa96225bc42 | Test M3B Edited 0ecc71f6; class=a2c00000-0000-4000-8000-000000000102 | Exact integration name with own UUID prefix |
| 12a4627d-5f56-4b77-95df-bdf2d8a74442 | Test Today Student 3; class=a0ff66b3-bde8-4697-9eae-99f3a3a95314 | Exact fixture roster pattern and confirmed fixture class |
| 1393292c-d4ed-4cf5-b13f-c8debdbb2394 | Test Today Student 1; class=aa286314-7933-4202-8288-fb6896d7fd1b | Exact fixture roster pattern and confirmed fixture class |
| 21c0476b-f4f0-4a7d-ae74-f67e23c25d02 | Test Today Student 3; class=a170d848-7fde-4be2-93ac-fd4b32e2a0f4 | Exact fixture roster pattern and confirmed fixture class |
| 2ce4929f-7601-4932-b261-a978421c3c9e | Test Today Student 0; class=e4e9e1f0-fd2b-4c0d-882a-43c0d323d626 | Exact fixture roster pattern and confirmed fixture class |
| 3677f03c-0814-466b-806a-e09e41835db4 | Test M4B Student 3677f03c; class=d59681ea-56b4-433e-b502-c1f056695f3e | Exact integration name with own UUID prefix |
| 4b734419-0ea0-4382-9a7b-f5293e6139d5 | Test M3A Creation 4b734419; class=a2c00000-0000-4000-8000-000000000101 | Exact integration name with own UUID prefix |
| 50671116-c6a6-4df5-bdda-409f97776e8e | Test Care Student 0 50671116; class=43dcac51-da1a-40be-b05b-afb44f734765 | Exact fixture roster pattern and confirmed fixture class |
| 5ef24eed-99f0-489f-b929-d3bf17495e8c | Test Homework Student 3 5ef24eed; class=61c78fe6-f81d-40c7-8b27-801e1545f46d | Exact fixture roster pattern and confirmed fixture class |
| 64903eba-7f38-4b24-afd0-c4a847fdbecc | Test Today Student 1; class=e4e9e1f0-fd2b-4c0d-882a-43c0d323d626 | Exact fixture roster pattern and confirmed fixture class |
| 69812855-aad1-415c-80d1-81dd309f735c | Test Care Student 1 69812855; class=c4ecd0c2-7751-4bb0-8f26-5e7134edc55e | Exact fixture roster pattern and confirmed fixture class |
| 76fa28fa-c874-4998-b711-62ba6bf2ce42 | Test Care Student 2 76fa28fa; class=c4ecd0c2-7751-4bb0-8f26-5e7134edc55e | Exact fixture roster pattern and confirmed fixture class |
| 7c748457-4af6-477e-bed7-65a5f751d226 | Test Homework Student 2 7c748457; class=ae2871de-3b00-4473-acac-acc8cd9150d2 | Exact fixture roster pattern and confirmed fixture class |
| 838cfe5f-c81d-4859-8134-af72606e8f48 | Test M3B Edited 838cfe5f; class=a2c00000-0000-4000-8000-000000000102 | Exact integration name with own UUID prefix |
| 8a7fbde8-ad2b-4910-ba4d-0391a3f1d3ac | Test Homework Student 2 8a7fbde8; class=a4134fa7-dcb5-4b1f-bf3e-41ac8b623e94 | Exact fixture roster pattern and confirmed fixture class |
| 93958108-ae86-4f54-932b-ba5c39cff3ae | Test Homework Student 1 93958108; class=ae2871de-3b00-4473-acac-acc8cd9150d2 | Exact fixture roster pattern and confirmed fixture class |
| 94aac5f0-5b02-42cf-8b71-4dd2beceea28 | Test Care Student 4 94aac5f0; class=d6607ec6-59e2-4f8b-9fee-c7ba80312b06 | Exact fixture roster pattern and confirmed fixture class |
| 96f3c054-6ca5-4ad4-9a5d-377ed85b6841 | Test Today Student 2; class=e4e9e1f0-fd2b-4c0d-882a-43c0d323d626 | Exact fixture roster pattern and confirmed fixture class |
| 97b4264a-b248-4703-81f7-14a3a9242787 | Test M4A Student 97b4264a; class=5796a802-6c6e-4020-8453-6f98d98a3180 | Exact integration name with own UUID prefix |
| 9fb037a4-e0ed-48bb-bcf2-8d259117243e | Test Care Student 3 9fb037a4; class=3ece12a9-3f89-414c-93d5-b36994130283 | Exact fixture roster pattern and confirmed fixture class |
| a2c00000-0000-4000-8000-000000000202 | Test Ben Lim; class=a2c00000-0000-4000-8000-000000000101 | Exact db/seed.ts fixed UUID and unchanged fictional name |
| a2c00000-0000-4000-8000-000000000203 | Test Chloe Lee; class=a2c00000-0000-4000-8000-000000000101 | Exact db/seed.ts fixed UUID and unchanged fictional name |
| a2c00000-0000-4000-8000-000000000204 | Test Daniel Wong; class=a2c00000-0000-4000-8000-000000000102 | Exact db/seed.ts fixed UUID and unchanged fictional name |
| a2c00000-0000-4000-8000-000000000205 | Test Ella Ng; class=a2c00000-0000-4000-8000-000000000102 | Exact db/seed.ts fixed UUID and unchanged fictional name |
| a2c00000-0000-4000-8000-000000000206 | Test Finn Chan; class=a2c00000-0000-4000-8000-000000000102 | Exact db/seed.ts fixed UUID and unchanged fictional name |
| af2a31c3-b8d4-438b-8029-a85debb3acf9 | Test Homework Student 3 af2a31c3; class=f6c8770f-39ae-498a-809e-3f7297933c9f | Exact fixture roster pattern and confirmed fixture class |
| af573a03-9b37-4b80-860e-4af0b5b8d4bc | Test M4A Student af573a03; class=4e7801a3-d77f-4b31-b593-9f0c1ff25a22 | Exact integration name with own UUID prefix |
| afb413f4-5276-4e8d-8d2b-80f0c9548626 | Test Dictation Student 1 afb413f4; class=201a3d5a-65b8-42a3-a844-60bf96849cb5 | Exact fixture roster pattern and confirmed fixture class |
| c278b9d8-216b-4a8d-871a-76e732987773 | Test Today Student 2; class=aa286314-7933-4202-8288-fb6896d7fd1b | Exact fixture roster pattern and confirmed fixture class |
| c7a28247-b1f6-40a3-8d24-3c6e3c3f39f1 | Test Dictation Student 2 c7a28247; class=201a3d5a-65b8-42a3-a844-60bf96849cb5 | Exact fixture roster pattern and confirmed fixture class |
| c84aea67-1193-4fe9-9a6e-478b242d1308 | Test Homework Student 0 c84aea67; class=a4134fa7-dcb5-4b1f-bf3e-41ac8b623e94 | Exact fixture roster pattern and confirmed fixture class |
| c8b1521b-f551-401e-88e4-7d1618eac650 | Test Homework Student 0 c8b1521b; class=ae2871de-3b00-4473-acac-acc8cd9150d2 | Exact fixture roster pattern and confirmed fixture class |
| dfb0735b-adc7-48ee-bd8b-820143a7071f | Test M3B Edited dfb0735b; class=a2c00000-0000-4000-8000-000000000102 | Exact integration name with own UUID prefix |
| e25ca6d2-ec5a-4141-b0ef-657ddb7a59c1 | Test Dictation Format Student; class=6ef9b7de-b7c0-47af-b785-f0b8f0dcfb35 | Exact fixture roster pattern and confirmed fixture class |
| e266592b-23b3-4b1b-a17e-190731900c91 | Test Dictation Student 0 e266592b; class=201a3d5a-65b8-42a3-a844-60bf96849cb5 | Exact fixture roster pattern and confirmed fixture class |
| e3d8f594-f58b-43de-8f5e-6db1b5029e21 | Test Homework Student 1 e3d8f594; class=a4134fa7-dcb5-4b1f-bf3e-41ac8b623e94 | Exact fixture roster pattern and confirmed fixture class |
| e5096784-c8c5-446b-bb2a-8bc94ec53aeb | Test Dictation Student 3 e5096784; class=d78fff38-d534-4c99-ab35-757365d28969 | Exact fixture roster pattern and confirmed fixture class |
| f38d353a-8cf3-42b8-9e33-45eb153aad04 | Test Today Student 0; class=aa286314-7933-4202-8288-fb6896d7fd1b | Exact fixture roster pattern and confirmed fixture class |

### homework_tasks

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 1891f849-780b-4856-a3cc-13f5db412115 | Test Today Math; class=a170d848-7fde-4be2-93ac-fd4b32e2a0f4 | Exact integration definition under confirmed fixture class |
| 26baee33-2590-4459-94e2-c3b1e9710ed9 | Test Today Math; class=aa286314-7933-4202-8288-fb6896d7fd1b | Exact integration definition under confirmed fixture class |
| 62ee708d-ba0a-43f6-98d9-3748eb220304 | Test Today Math; class=aa286314-7933-4202-8288-fb6896d7fd1b | Exact integration definition under confirmed fixture class |
| 8cca07ff-cc3a-4ba2-b9fa-43bf9144d7b8 | Test Today Math; class=e4e9e1f0-fd2b-4c0d-882a-43c0d323d626 | Exact integration definition under confirmed fixture class |
| a1bab71d-190e-489a-b720-fec7273c6f1e | Test Math; class=a4134fa7-dcb5-4b1f-bf3e-41ac8b623e94 | Exact integration definition under confirmed fixture class |
| ccf42d66-9794-44f5-9c93-e93b55f0c65a | Test Math; class=ae2871de-3b00-4473-acac-acc8cd9150d2 | Exact integration definition under confirmed fixture class |
| e9e51904-88dd-491d-a42a-ec50fe7d8cc6 | Test Today Math; class=a0ff66b3-bde8-4697-9eae-99f3a3a95314 | Exact integration definition under confirmed fixture class |
| fcc2f6c3-cc31-468c-b3bc-94c10bc9de53 | Test Today Math; class=e4e9e1f0-fd2b-4c0d-882a-43c0d323d626 | Exact integration definition under confirmed fixture class |

### student_homework

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 1328b209-d573-4daf-be66-46001ef8ce52 | student=96f3c054-6ca5-4ad4-9a5d-377ed85b6841; task=8cca07ff-cc3a-4ba2-b9fa-43bf9144d7b8 | Dependent assignment of an explicitly identified fixture student/task |
| 16de1794-2f7b-4e51-b6a7-f91474626bf7 | student=4b734419-0ea0-4382-9a7b-f5293e6139d5; task=c0a1436c-0bde-4b76-b59d-d9a1e1b790a2 | Dependent assignment of an explicitly identified fixture student/task |
| 187f67ab-4b04-4706-8ce9-f46e58e45b6f | student=a2c00000-0000-4000-8000-000000000204; task=1ba742a9-7bb6-46ee-9ff6-7a3c966e5797 | Dependent assignment of an explicitly identified fixture student/task |
| 2c44edff-0636-4411-b631-60b9cc94f60f | student=e3d8f594-f58b-43de-8f5e-6db1b5029e21; task=a1bab71d-190e-489a-b720-fec7273c6f1e | Dependent assignment of an explicitly identified fixture student/task |
| 40dff20b-8c05-4d32-9ac6-105acb7bcc3b | student=a2c00000-0000-4000-8000-000000000202; task=8fa6be9b-15ae-4c5a-bf7d-bbea89f01324 | Dependent assignment of an explicitly identified fixture student/task |
| 4977a4e3-1e19-409c-bee9-4e775719db53 | student=a2c00000-0000-4000-8000-000000000203; task=c0a1436c-0bde-4b76-b59d-d9a1e1b790a2 | Dependent assignment of an explicitly identified fixture student/task |
| 5bba342e-1fd0-4777-bc77-05ba50ccdb65 | student=a2c00000-0000-4000-8000-000000000203; task=8fa6be9b-15ae-4c5a-bf7d-bbea89f01324 | Dependent assignment of an explicitly identified fixture student/task |
| 60d42e66-d0b8-4be4-9bf5-0d047e7cc75e | student=12a4627d-5f56-4b77-95df-bdf2d8a74442; task=e9e51904-88dd-491d-a42a-ec50fe7d8cc6 | Dependent assignment of an explicitly identified fixture student/task |
| 6635bf28-0aae-42b0-90e8-d780593a89dc | student=c278b9d8-216b-4a8d-871a-76e732987773; task=26baee33-2590-4459-94e2-c3b1e9710ed9 | Dependent assignment of an explicitly identified fixture student/task |
| 681e1370-dbeb-4ec0-ae53-a32cdef2daa9 | student=c8b1521b-f551-401e-88e4-7d1618eac650; task=ccf42d66-9794-44f5-9c93-e93b55f0c65a | Dependent assignment of an explicitly identified fixture student/task |
| 6e7380ca-e655-47c6-b42d-2a55a0cc793c | student=2ce4929f-7601-4932-b261-a978421c3c9e; task=fcc2f6c3-cc31-468c-b3bc-94c10bc9de53 | Dependent assignment of an explicitly identified fixture student/task |
| 6e802ddd-7244-4875-997d-83861584165a | student=f38d353a-8cf3-42b8-9e33-45eb153aad04; task=62ee708d-ba0a-43f6-98d9-3748eb220304 | Dependent assignment of an explicitly identified fixture student/task |
| 6ed366a8-a411-4cf4-8547-ba5557b52630 | student=a2c00000-0000-4000-8000-000000000203; task=4b423754-80ac-4e47-a1c9-8c1e63be7241 | Dependent assignment of an explicitly identified fixture student/task |
| 71e1b240-03b7-4976-8912-5138e8bfe13e | student=a2c00000-0000-4000-8000-000000000203; task=d7d2a39f-e251-4f63-9244-0c9a92a50d96 | Dependent assignment of an explicitly identified fixture student/task |
| 7f2a2504-e2dc-4af0-bacb-6cf83e829eda | student=4b734419-0ea0-4382-9a7b-f5293e6139d5; task=d7d2a39f-e251-4f63-9244-0c9a92a50d96 | Dependent assignment of an explicitly identified fixture student/task |
| 83770bc4-400b-4edc-b15c-d6388b42bfba | student=c84aea67-1193-4fe9-9a6e-478b242d1308; task=a1bab71d-190e-489a-b720-fec7273c6f1e | Dependent assignment of an explicitly identified fixture student/task |
| a2d1e90d-0c8e-4f22-94c2-17b9fb30f7f2 | student=64903eba-7f38-4b24-afd0-c4a847fdbecc; task=fcc2f6c3-cc31-468c-b3bc-94c10bc9de53 | Dependent assignment of an explicitly identified fixture student/task |
| b07ac011-cc03-42ef-b9d7-a495390a1cd8 | student=a2c00000-0000-4000-8000-000000000202; task=d7d2a39f-e251-4f63-9244-0c9a92a50d96 | Dependent assignment of an explicitly identified fixture student/task |
| e55e8235-7a7b-4fe3-be25-0d3840cae915 | student=a2c00000-0000-4000-8000-000000000202; task=4b423754-80ac-4e47-a1c9-8c1e63be7241 | Dependent assignment of an explicitly identified fixture student/task |
| eb93fe7d-593a-42ab-bc55-a8b685bc5b89 | student=93958108-ae86-4f54-932b-ba5c39cff3ae; task=ccf42d66-9794-44f5-9c93-e93b55f0c65a | Dependent assignment of an explicitly identified fixture student/task |
| ed530897-2bfe-47a8-abf7-23e7aefa9631 | student=4b734419-0ea0-4382-9a7b-f5293e6139d5; task=4b423754-80ac-4e47-a1c9-8c1e63be7241 | Dependent assignment of an explicitly identified fixture student/task |
| ed862ba8-aa40-4825-8cbe-c7369660f60f | student=a2c00000-0000-4000-8000-000000000202; task=c0a1436c-0bde-4b76-b59d-d9a1e1b790a2 | Dependent assignment of an explicitly identified fixture student/task |
| f3f8a10f-9e5c-430f-8dad-3d23356c3970 | student=4b734419-0ea0-4382-9a7b-f5293e6139d5; task=8fa6be9b-15ae-4c5a-bf7d-bbea89f01324 | Dependent assignment of an explicitly identified fixture student/task |
| f903e97a-c58b-4c7b-875f-7171f23c9c31 | student=1393292c-d4ed-4cf5-b13f-c8debdbb2394; task=62ee708d-ba0a-43f6-98d9-3748eb220304 | Dependent assignment of an explicitly identified fixture student/task |
| f9b035a6-7088-4c24-964f-9ab982752dfb | student=21c0476b-f4f0-4a7d-ae74-f67e23c25d02; task=1891f849-780b-4856-a3cc-13f5db412115 | Dependent assignment of an explicitly identified fixture student/task |

### dictation_tasks

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 20aac524-7153-421d-8c25-72efc269891c | Test Dictation af562c99-9be6-46c2-869f-3185b073ce03; class=d78fff38-d534-4c99-ab35-757365d28969 | Exact Dictation integration definition under confirmed fixture class |
| 9949c6aa-f7ff-4aa4-b123-20b7c83b8ec7 | Test Apple / Test School; class=6ef9b7de-b7c0-47af-b785-f0b8f0dcfb35 | Exact Dictation integration definition under confirmed fixture class |
| a454f4aa-7fec-4a0f-ba0b-168cbdb45e57 | Test Dictation af562c99-9be6-46c2-869f-3185b073ce03; class=d78fff38-d534-4c99-ab35-757365d28969 | Exact Dictation integration definition under confirmed fixture class |
| af562c99-9be6-46c2-869f-3185b073ce03 | Test Dictation af562c99-9be6-46c2-869f-3185b073ce03; class=201a3d5a-65b8-42a3-a844-60bf96849cb5 | Exact Dictation integration definition under confirmed fixture class |
| cc45e08e-0158-48e0-94e1-0750e990dbe5 | Test Dictation af562c99-9be6-46c2-869f-3185b073ce03; class=d78fff38-d534-4c99-ab35-757365d28969 | Exact Dictation integration definition under confirmed fixture class |
| f70d9138-a6dd-4988-8d43-1e1c81b57c47 | Test paragraph one. / Test paragraph two.; class=6ef9b7de-b7c0-47af-b785-f0b8f0dcfb35 | Exact Dictation integration definition under confirmed fixture class |
| f894d866-c7b5-471f-8e84-dc9603c7f005 | Test Dictation af562c99-9be6-46c2-869f-3185b073ce03; class=d78fff38-d534-4c99-ab35-757365d28969 | Exact Dictation integration definition under confirmed fixture class |

### student_dictation

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 080c3c57-1ab5-4fa2-bb8d-5fbe48112b7d | student=a2c00000-0000-4000-8000-000000000202; task=b1cdaed6-66ff-44a4-8f83-aad64693bb95 | Dependent assignment of an explicitly identified fixture student/task |
| 0b51fecf-0295-40fd-8d82-2eb3b59d8927 | student=a2c00000-0000-4000-8000-000000000203; task=b1cdaed6-66ff-44a4-8f83-aad64693bb95 | Dependent assignment of an explicitly identified fixture student/task |
| 13e4c7bf-9104-4059-a128-904ec6fe9b12 | student=4b734419-0ea0-4382-9a7b-f5293e6139d5; task=b1cdaed6-66ff-44a4-8f83-aad64693bb95 | Dependent assignment of an explicitly identified fixture student/task |
| 27609c34-9b80-4286-a2a1-1a0c8b24245e | student=e5096784-c8c5-446b-bb2a-8bc94ec53aeb; task=f894d866-c7b5-471f-8e84-dc9603c7f005 | Dependent assignment of an explicitly identified fixture student/task |
| 77ab98e2-f614-4fdf-b458-1cc6e1bffaaa | student=afb413f4-5276-4e8d-8d2b-80f0c9548626; task=af562c99-9be6-46c2-869f-3185b073ce03 | Dependent assignment of an explicitly identified fixture student/task |
| b0a0e741-72cf-4273-8d89-25b25f9f6faf | student=e5096784-c8c5-446b-bb2a-8bc94ec53aeb; task=20aac524-7153-421d-8c25-72efc269891c | Dependent assignment of an explicitly identified fixture student/task |
| b2851225-1e35-433e-b209-27cedcb61609 | student=e25ca6d2-ec5a-4141-b0ef-657ddb7a59c1; task=9949c6aa-f7ff-4aa4-b123-20b7c83b8ec7 | Dependent assignment of an explicitly identified fixture student/task |
| bb33109e-ffe0-4187-aab3-c0043fbc7b49 | student=e266592b-23b3-4b1b-a17e-190731900c91; task=af562c99-9be6-46c2-869f-3185b073ce03 | Dependent assignment of an explicitly identified fixture student/task |
| c2ed7fbe-4d61-4eed-a249-1c8b5a9f4ca0 | student=e5096784-c8c5-446b-bb2a-8bc94ec53aeb; task=cc45e08e-0158-48e0-94e1-0750e990dbe5 | Dependent assignment of an explicitly identified fixture student/task |
| f22e03ce-08b1-473d-a483-3998e9aa2a94 | student=e25ca6d2-ec5a-4141-b0ef-657ddb7a59c1; task=f70d9138-a6dd-4988-8d43-1e1c81b57c47 | Dependent assignment of an explicitly identified fixture student/task |
| fb6fa49c-0837-4d97-adca-b62806eea80f | student=e5096784-c8c5-446b-bb2a-8bc94ec53aeb; task=a454f4aa-7fec-4a0f-ba0b-168cbdb45e57 | Dependent assignment of an explicitly identified fixture student/task |

### daily_student_records

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 025099e9-4665-4877-8ad5-60244eef701b | Test Today 0; class=e4e9e1f0-fd2b-4c0d-882a-43c0d323d626; student=64903eba-7f38-4b24-afd0-c4a847fdbecc; 2026-09-13 | Daily record belonging to explicitly identified fixture student |
| 0e13c631-57a2-407f-83eb-3eaae0de20d3 | 1H; class=a2c00000-0000-4000-8000-000000000101; student=a2c00000-0000-4000-8000-000000000202; 2026-09-14 | Daily record belonging to explicitly identified fixture student |
| 135c98ff-d86b-40a9-89f2-c0994b82cd84 | Test Today 0; class=e4e9e1f0-fd2b-4c0d-882a-43c0d323d626; student=96f3c054-6ca5-4ad4-9a5d-377ed85b6841; 2026-09-13 | Daily record belonging to explicitly identified fixture student |
| 1d494ab6-13a4-4302-a8c3-38c15282edb5 | 2M; class=a2c00000-0000-4000-8000-000000000102; student=a2c00000-0000-4000-8000-000000000204; 2026-09-14 | Daily record belonging to explicitly identified fixture student |
| 56b7b188-7f05-4c24-baca-f4b6e0e0a4ac | Test Care Class 0; class=c4ecd0c2-7751-4bb0-8f26-5e7134edc55e; student=50671116-c6a6-4df5-bdda-409f97776e8e; 2026-09-13 | Daily record belonging to explicitly identified fixture student |
| 57652a88-10af-4f0d-af03-e2d6569cc43a | Test Today 0; class=e4e9e1f0-fd2b-4c0d-882a-43c0d323d626; student=2ce4929f-7601-4932-b261-a978421c3c9e; 2026-09-12 | Daily record belonging to explicitly identified fixture student |
| 5ff8b13f-fff7-4ada-ac32-410198b58960 | Test Today 0; class=aa286314-7933-4202-8288-fb6896d7fd1b; student=f38d353a-8cf3-42b8-9e33-45eb153aad04; 2026-09-14 | Daily record belonging to explicitly identified fixture student |
| 603886d1-7fc1-4271-9d47-69bbf9147f87 | 1H; class=a2c00000-0000-4000-8000-000000000101; student=a2c00000-0000-4000-8000-000000000203; 2026-09-14 | Daily record belonging to explicitly identified fixture student |
| 6437ec26-de43-4751-9bfe-83f9e9a13e3d | 1H; class=a2c00000-0000-4000-8000-000000000101; student=a2c00000-0000-4000-8000-000000000202; 2026-09-13 | Daily record belonging to explicitly identified fixture student |
| 755704e5-b744-4d30-a4a6-8e5f80fe10f7 | Test Today 0; class=aa286314-7933-4202-8288-fb6896d7fd1b; student=1393292c-d4ed-4cf5-b13f-c8debdbb2394; 2026-09-14 | Daily record belonging to explicitly identified fixture student |
| 828d66e6-7844-47d1-a47a-f87a3f3c532c | 1H; class=a2c00000-0000-4000-8000-000000000101; student=a2c00000-0000-4000-8000-000000000202; 2026-09-15 | Daily record belonging to explicitly identified fixture student |
| 866ec007-0c0b-4ab8-a25b-bfa3355f91b8 | Test Today 0; class=aa286314-7933-4202-8288-fb6896d7fd1b; student=c278b9d8-216b-4a8d-871a-76e732987773; 2026-09-14 | Daily record belonging to explicitly identified fixture student |
| 9027d179-e3ac-4e80-ae17-17911a37c7ed | 1H; class=a2c00000-0000-4000-8000-000000000101; student=a2c00000-0000-4000-8000-000000000203; 2026-09-15 | Daily record belonging to explicitly identified fixture student |
| a9d8d3ee-1c62-4a0f-8f47-b5b8f930de5a | Test Today 1; class=a0ff66b3-bde8-4697-9eae-99f3a3a95314; student=12a4627d-5f56-4b77-95df-bdf2d8a74442; 2026-09-13 | Daily record belonging to explicitly identified fixture student |
| b6c83c31-2a53-48d9-83b2-a6e2ad504316 | Test Today 1; class=a170d848-7fde-4be2-93ac-fd4b32e2a0f4; student=21c0476b-f4f0-4a7d-ae74-f67e23c25d02; 2026-09-14 | Daily record belonging to explicitly identified fixture student |
| c0778237-5d0c-47b3-9bb2-d78d8bbc746e | Test Today 0; class=aa286314-7933-4202-8288-fb6896d7fd1b; student=f38d353a-8cf3-42b8-9e33-45eb153aad04; 2026-09-13 | Daily record belonging to explicitly identified fixture student |
| c1de5bb7-9ef0-45c4-b667-731dd5109025 | Test Care Class 0; class=c4ecd0c2-7751-4bb0-8f26-5e7134edc55e; student=50671116-c6a6-4df5-bdda-409f97776e8e; 2026-09-12 | Daily record belonging to explicitly identified fixture student |
| c6463468-3b11-493e-b698-79405fd051ef | Test Format Class; class=6ef9b7de-b7c0-47af-b785-f0b8f0dcfb35; student=e25ca6d2-ec5a-4141-b0ef-657ddb7a59c1; 2026-09-14 | Daily record belonging to explicitly identified fixture student |
| ce82810b-1d1d-494a-ba9d-e4cbbf97c794 | 1H; class=a2c00000-0000-4000-8000-000000000101; student=4b734419-0ea0-4382-9a7b-f5293e6139d5; 2026-09-14 | Daily record belonging to explicitly identified fixture student |
| f8ab8ff0-300c-4c98-abc6-f593075224cb | Test Today 0; class=e4e9e1f0-fd2b-4c0d-882a-43c0d323d626; student=2ce4929f-7601-4932-b261-a978421c3c9e; 2026-09-13 | Daily record belonging to explicitly identified fixture student |
| fc4c9b96-5713-4be5-9410-82b0a588892d | 1H; class=a2c00000-0000-4000-8000-000000000101; student=4b734419-0ea0-4382-9a7b-f5293e6139d5; 2026-09-15 | Daily record belonging to explicitly identified fixture student |

## Preserved / uncertain records

### schools

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 02f98164-6a90-43c8-9ad5-4171d4aacd92 | 中化1B | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| 186a3e9d-411d-4eb6-b7bb-3341cab91477 | test | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| a2c00000-0000-4000-8000-000000000001 | 中化三小 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| f662ab04-48b3-4bcb-8476-e0a3e3b75526 | 中化1A | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |

### school_classes

| UUID | Name / context | Evidence / reason |
|---|---|---|
| a2c00000-0000-4000-8000-000000000101 | 1H; school=a2c00000-0000-4000-8000-000000000001 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| a2c00000-0000-4000-8000-000000000102 | 2M; school=a2c00000-0000-4000-8000-000000000001 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| a8eefe1b-db39-4a69-9629-f29668d26b7d | 1A; school=f662ab04-48b3-4bcb-8476-e0a3e3b75526 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| bfa3df4c-2a4b-451d-9d8f-af853ba433ce | 1B; school=a2c00000-0000-4000-8000-000000000001 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |

### students

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 451d1ecf-6a1e-41fe-844f-2a6b8be7f772 | 乌龟; class=a2c00000-0000-4000-8000-000000000102 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| a2c00000-0000-4000-8000-000000000201 | 王勇杰; class=a2c00000-0000-4000-8000-000000000101 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| a6222be0-a52e-4864-a188-0debf07484c0 | Test M3B Edited; class=a2c00000-0000-4000-8000-000000000101 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| ba2a08cb-14c1-4228-b260-cdd63b521584 | Tee Zi Qing; class=a2c00000-0000-4000-8000-000000000101 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |

### homework_tasks

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 1ba742a9-7bb6-46ee-9ff6-7a3c966e5797 | tulisan; class=a2c00000-0000-4000-8000-000000000102 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| 4b423754-80ac-4e47-a1c9-8c1e63be7241 | 华文; class=a2c00000-0000-4000-8000-000000000101 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| 8fa6be9b-15ae-4c5a-bf7d-bbea89f01324 | 听写订正; class=a2c00000-0000-4000-8000-000000000101 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| c0a1436c-0bde-4b76-b59d-d9a1e1b790a2 | 华文活动本; class=a2c00000-0000-4000-8000-000000000101 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| d7d2a39f-e251-4f63-9244-0c9a92a50d96 | 数学; class=a2c00000-0000-4000-8000-000000000101 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |

### student_homework

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 047f60e8-f53d-4398-8e34-c7454c655aa1 | student=a2c00000-0000-4000-8000-000000000201; task=c0a1436c-0bde-4b76-b59d-d9a1e1b790a2 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| 4eab5f40-bea5-4cf1-93fc-cde6431b7c6e | student=a2c00000-0000-4000-8000-000000000201; task=d7d2a39f-e251-4f63-9244-0c9a92a50d96 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| 5cce0394-a207-47d5-a1b6-b1449a8a2f02 | student=451d1ecf-6a1e-41fe-844f-2a6b8be7f772; task=1ba742a9-7bb6-46ee-9ff6-7a3c966e5797 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| 7548673c-60dd-4b93-8414-19ed88d7aea0 | student=ba2a08cb-14c1-4228-b260-cdd63b521584; task=c0a1436c-0bde-4b76-b59d-d9a1e1b790a2 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| 9bc6174c-5574-48ef-8a30-3aaa9f42fe2d | student=ba2a08cb-14c1-4228-b260-cdd63b521584; task=4b423754-80ac-4e47-a1c9-8c1e63be7241 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| 9f1deed4-cfef-402e-9e0a-438a32a4542c | student=a2c00000-0000-4000-8000-000000000201; task=8fa6be9b-15ae-4c5a-bf7d-bbea89f01324 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| af7b68a2-15a0-4762-b022-f57b9891d960 | student=ba2a08cb-14c1-4228-b260-cdd63b521584; task=d7d2a39f-e251-4f63-9244-0c9a92a50d96 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| c710c8ad-63e2-4ef1-9a85-0425b9650a7d | student=a2c00000-0000-4000-8000-000000000201; task=4b423754-80ac-4e47-a1c9-8c1e63be7241 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| f9b5aae0-3e8c-43f3-93dd-337ee0cac2ad | student=ba2a08cb-14c1-4228-b260-cdd63b521584; task=8fa6be9b-15ae-4c5a-bf7d-bbea89f01324 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |

### dictation_tasks

| UUID | Name / context | Evidence / reason |
|---|---|---|
| b1cdaed6-66ff-44a4-8f83-aad64693bb95 | 乌龟 / 还有 / 可怕 / 糟糕 / 历史 / 结构; class=a2c00000-0000-4000-8000-000000000101 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |

### student_dictation

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 26ec4e4b-a535-44de-8e4f-5c76de3ce6a3 | student=ba2a08cb-14c1-4228-b260-cdd63b521584; task=b1cdaed6-66ff-44a4-8f83-aad64693bb95 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| bdd4f518-f023-437b-8069-be02139630eb | student=a2c00000-0000-4000-8000-000000000201; task=b1cdaed6-66ff-44a4-8f83-aad64693bb95 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |

### daily_student_records

| UUID | Name / context | Evidence / reason |
|---|---|---|
| 06a45eb5-2cf4-4ab5-8f9a-a39bd48b798e | 1H; class=a2c00000-0000-4000-8000-000000000101; student=a2c00000-0000-4000-8000-000000000201; 2026-09-14 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| 80ccc3b6-66fa-4493-889e-28d1f7ae5e5e | 1H; class=a2c00000-0000-4000-8000-000000000101; student=a2c00000-0000-4000-8000-000000000201; 2026-09-15 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| 985fd3a6-364b-46c8-a2c6-abd1aeb185cd | 1H; class=a2c00000-0000-4000-8000-000000000101; student=ba2a08cb-14c1-4228-b260-cdd63b521584; 2026-09-15 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| b3ea6a98-4b5f-4bae-9a21-214d2d7ea11f | 1H; class=a2c00000-0000-4000-8000-000000000101; student=ba2a08cb-14c1-4228-b260-cdd63b521584; 2026-09-13 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| f5704b87-41cc-41bb-8a73-7c87dd392ad4 | 2M; class=a2c00000-0000-4000-8000-000000000102; student=451d1ecf-6a1e-41fe-844f-2a6b8be7f772; 2026-09-14 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
| ff94c82e-8ec0-447b-a137-c2f645d92d87 | 1H; class=a2c00000-0000-4000-8000-000000000101; student=ba2a08cb-14c1-4228-b260-cdd63b521584; 2026-09-14 | Not confidently attributable to current fixture code, renamed/possibly repurposed, or parent/dependent of retained records |
