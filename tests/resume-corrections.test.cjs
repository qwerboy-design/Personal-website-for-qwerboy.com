const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
test('resume reflects Mike-confirmed employers, senior role, and radiological degree', () => {
    const context = { window: {} };
    for (const file of ['content', 'translations']) vm.runInNewContext(fs.readFileSync(`js/${file}.js`, 'utf8'), context);
    const locales = context.window.QWEROS_RESUME_LOCALES;
    assert.equal(locales['zh-TW'].experience[0].company, '新光吳火獅紀念醫院');
    assert.equal(locales['zh-TW'].experience[1].role, '資深系統分析師');
    assert.equal(locales['zh-TW'].experience[2].company, '商之器科技');
    assert.equal(locales['zh-TW'].education, '中臺科技醫護大學 — 醫事放射技術系學士');
    assert.equal(locales.en.experience[0].company, 'Shin Kong Wu Ho-Su Memorial Hospital');
    assert.equal(locales.en.experience[1].role, 'Senior System Analyst');
    assert.equal(locales.en.experience[2].company, 'EBM Technologies Inc.');
    assert.equal(locales.en.education, 'Central Taiwan University of Science and Technology — Bachelor’s Degree in Radiological Technology');
});
