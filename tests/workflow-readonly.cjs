// Run with the production server on port 3100. GET requests only; never submits mutations.
const assert = require('node:assert/strict');
const get = async path => { const response = await fetch('http://localhost:3100' + path); assert.equal(response.status, 200, path); const html = await response.text(); assert.ok(!html.includes('暂时无法加载'), path + ' data read'); return html.replace(/<!--[\s\S]*?-->/g, ''); };
(async () => {
  const today = await get('/today');
  for (let grade = 1; grade <= 6; grade++) assert.ok(today.includes('/today/grades/' + grade));
  assert.ok(!today.includes('data-attention-id='));
  await get('/today/grades/1');
  assert.ok((await get('/students')).includes('student-search'));
  const homework = await get('/homework/new');
  for (const option of ['华文','国文','数学','设计与工艺','3M报','其他']) assert.ok(homework.includes(option));
  const dictation = await get('/dictation/new');
  for (const option of ['NUMBERED','PLAIN','Spelling','Ejaan','默写','Rencana']) assert.ok(dictation.includes(option));
  const care = await get('/care');
  const id = care.match(/href="\/care\/classes\/([0-9a-f-]{36})"/)?.[1];
  assert.ok(id, 'An existing active class is needed for read-only smoke testing');
  assert.ok((await get('/care/classes/' + id)).includes('打印今日表'));
  const sheet = await get('/care/classes/' + id + '/print');
  assert.ok(sheet.includes('需订正X') && sheet.includes('all done'));
  await get('/today/classes/' + id);
  console.log('Read-only production smoke passed: Today/grades/class, student search, creation options, Care and printable sheet. No writes invoked.');
})().catch(() => { console.error('Read-only production smoke failed; no database details printed.'); process.exitCode = 1; });
