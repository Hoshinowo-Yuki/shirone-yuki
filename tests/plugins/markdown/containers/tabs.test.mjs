import assert from "node:assert/strict";
import { test } from "node:test";

import { siteMarkdownProcessor } from "../../../../src/utils/markdown-processor.mjs";

const renderer = await siteMarkdownProcessor.createRenderer({});

async function render(markdown) {
	const { code } = await renderer.render(markdown);
	return code;
}

async function syntaxes(markdown) {
	const { metadata } = await renderer.render(markdown);
	return metadata.frontmatter.markdownSyntaxes.syntaxes;
}

const BASIC = ":::tabs\n::tab[One]\nFirst\n::tab[Two]\nSecond\n:::";

function groupNames(html) {
	return [...html.matchAll(/<input[^>]* name="([^"]+)"/g)].map(
		([, name]) => name,
	);
}

test("renders input, label and panel per tab with the first one checked", async () => {
	const html = await render(BASIC);

	assert.match(html, /^<div class="m3-tabs" data-tabs="">/);
	const inputs = [...html.matchAll(/<input [^>]*>/g)].map(([tag]) => tag);
	assert.equal(inputs.length, 2);
	assert.match(inputs[0], /type="radio"/);
	assert.match(inputs[0], / checked/);
	assert.doesNotMatch(inputs[1], / checked/);

	const [name] = groupNames(html);
	assert.match(name, /^shirone-tabs-[a-z0-9]+-1$/);
	assert.deepEqual(groupNames(html), [name, name]);
	assert.match(
		html,
		new RegExp(
			`<input [^>]*id="${name}-1"[^>]*><label class="m3-tabs__tab" for="${name}-1" id="${name}-1-tab">One</label><div class="m3-tabs__panel" id="${name}-1-panel" role="group" aria-labelledby="${name}-1-tab"><p>First</p></div>`,
		),
	);
	assert.doesNotMatch(html, /::tab|<tab/);
});

test("keeps inline Markdown in titles", async () => {
	const html = await render(
		":::tabs\n::tab[**Bold** and :red[red]]\nA\n::tab[`code`]\nB\n:::",
	);

	assert.match(
		html,
		/<label[^>]*><strong>Bold<\/strong> and <span class="m3-colored-text m3-colored-text--red">red<\/span><\/label>/,
	);
	assert.match(html, /<label[^>]*><code>code<\/code><\/label>/);
});

test("renders other Markdown syntax inside panels", async () => {
	const html = await render(
		[
			"::::tabs",
			"::tab[Text]",
			"- :red[red] ==mark== :keyboard[Esc] [漢字]{かんじ}",
			"::tab[Chat]",
			":::chat",
			"[Alice|10:00]",
			"Hello",
			":::",
			"::::",
		].join("\n"),
	);

	assert.match(html, /m3-colored-text--red/);
	assert.match(html, /<mark class="m3-marker/);
	assert.match(html, /<kbd class="m3-kbd">Esc<\/kbd>/);
	assert.match(html, /<ruby/);
	assert.match(html, /<ol class="m3-chat not-prose">/);
});

test("nests tab groups with distinct names", async () => {
	const html = await render(
		[
			"::::tabs",
			"::tab[Outer A]",
			":::tabs",
			"::tab[Inner A]",
			"a",
			"::tab[Inner B]",
			"b",
			":::",
			"::tab[Outer B]",
			"c",
			"::::",
		].join("\n"),
	);

	assert.equal(new Set(groupNames(html)).size, 2);
	assert.equal(html.match(/class="m3-tabs"/g)?.length, 2);
});

test("gives groups in different documents different names", async () => {
	const first = groupNames(await render(BASIC));
	const second = groupNames(
		await render(":::tabs\n::tab[One]\nOther\n::tab[Two]\nSecond\n:::"),
	);

	assert.notEqual(first[0], second[0]);
	assert.equal(first[0], groupNames(await render(BASIC))[0]);
});

test("leaves @tab blocks to option-groups", async () => {
	const markdown = "::: tabs\n\n@tab A\n\na\n\n@tab B\n\nb\n\n:::";

	assert.match(await render(markdown), /m3-option-group/);
	assert.deepEqual(await syntaxes(markdown), ["option-groups"]);
});

test("records only the tabs syntax for ::tab blocks", async () => {
	assert.deepEqual(await syntaxes(BASIC), ["tabs"]);
});

test("renders invalid blocks as plain Markdown", async () => {
	for (const markdown of [
		":::tabs\n::tab[Only]\nAlone\n:::",
		":::tabs\nIntro\n::tab[One]\nA\n::tab[Two]\nB\n:::",
		":::tabs\n::tab\nA\n::tab[Two]\nB\n:::",
	]) {
		const html = await render(markdown);
		assert.doesNotMatch(html, /m3-tabs|m3-option-group|<tab/);
		assert.match(html, /<p>::tab/);
		assert.deepEqual(await syntaxes(markdown), []);
	}
});

test("restores ::tab lines outside a tabs block", async () => {
	const html = await render("::tab[Stray]{x=1}\n\nText");

	assert.match(html, /<p>::tab\[Stray\]\{x=1\}<\/p>/);
	assert.doesNotMatch(html, /<tab/);
});

test("ignores ::tab inside code", async () => {
	const html = await render("```\n:::tabs\n::tab[One]\n:::\n```");

	assert.doesNotMatch(html, /m3-tabs/);
	assert.match(html, /::tab\[One\]/);
});
