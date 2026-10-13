// @ts-check
import { test, expect } from '@playwright/test';
import { escapeHtml, fillTemplate } from '../utils/template.js';

test.describe('template tests', () => {
  test('escapeHtml escapes HTML special characters', () => {
    expect(escapeHtml('<a href="x">Tom & Jerry\'s</a>')).toEqual(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;'
    );
  });

  test('escapeHtml converts non-string values to text', () => {
    expect(escapeHtml(42)).toEqual('42');
  });

  test('fillTemplate fills every placeholder with escaped values', () => {
    const template = '<p>{{name}}</p><p>{{name}} asked: {{question}}</p>';

    expect(
      fillTemplate(template, { name: 'Ann', question: '<b>size?</b>' })
    ).toEqual('<p>Ann</p><p>Ann asked: &lt;b&gt;size?&lt;/b&gt;</p>');
  });

  test('fillTemplate keeps $ patterns in values literal', () => {
    const template = '<p>{{password}}</p><p>after</p>';

    expect(fillTemplate(template, { password: "$'$&$1" })).toEqual(
      '<p>$&#39;$&amp;$1</p><p>after</p>'
    );
  });

  test('fillTemplate leaves placeholders without a value unchanged', () => {
    expect(fillTemplate('<p>{{missing}}</p>', {})).toEqual(
      '<p>{{missing}}</p>'
    );
  });
});
