import { visit } from "unist-util-visit";

import { getNodeSource } from "./core/directive-source.mjs";

function isTabMarker(node) {
	return node?.type === "leafDirective" && node.name === "tab";
}

/** Short, stable FNV-1a hash; keeps group ids unique across documents. */
function hash(value) {
	let result = 0x811c9dc5;
	for (let index = 0; index < value.length; index += 1) {
		result ^= value.charCodeAt(index);
		result = Math.imul(result, 0x01000193);
	}
	return (result >>> 0).toString(36);
}

/** A stray or rejected `::tab[...]` line becomes the paragraph the author wrote. */
function literalParagraph(node, file) {
	return {
		type: "paragraph",
		children: [
			{
				type: "text",
				value: getNodeSource(node, file) ?? "::tab",
			},
		],
		position: node.position,
	};
}

function parseTabs(children) {
	const tabs = [];
	for (const child of children) {
		if (isTabMarker(child)) {
			if (!child.children?.length) return null;
			tabs.push({ title: child.children, body: [] });
			continue;
		}
		// Content before the first ::tab has no tab to belong to.
		if (!tabs.length) return null;
		tabs.at(-1).body.push(child);
	}
	return tabs.length >= 2 ? tabs : null;
}

/**
 * Rebuilds `:::tabs` blocks written with `::tab[Title]` lines as a `tab-set`
 * directive, one `tab-item` (title + body) per tab. Blocks without `::tab`
 * stay `tabs` for option-groups. Invalid blocks are unwrapped into plain
 * Markdown with a build warning, and `::tab` lines outside a valid block are
 * restored to their source text.
 */
export function remarkTabs() {
	return (tree, file) => {
		let groupIndex = 0;

		visit(tree, (node, index, parent) => {
			if (!parent || index === undefined) return;

			if (isTabMarker(node)) {
				parent.children[index] = literalParagraph(node, file);
				return;
			}

			if (
				node.type !== "containerDirective" ||
				node.name !== "tabs" ||
				!node.children?.some(isTabMarker)
			) {
				return;
			}

			const tabs = parseTabs(node.children);
			if (!tabs) {
				file.message(
					"Tabs need at least two ::tab[Title] lines, with nothing before the first one; rendering the block as plain Markdown.",
					node,
				);
				parent.children.splice(
					index,
					1,
					...node.children.map((child) =>
						isTabMarker(child) ? literalParagraph(child, file) : child,
					),
				);
				return index;
			}

			groupIndex += 1;
			const seed = `${file.path ?? ""}\n${getNodeSource(node, file) ?? ""}`;
			node.name = "tab-set";
			node.attributes = { id: `shirone-tabs-${hash(seed)}-${groupIndex}` };
			node.children = tabs.map(({ title, body }) => ({
				type: "containerDirective",
				name: "tab-item",
				attributes: {},
				children: [
					{ type: "paragraph", data: { hName: "tab-title" }, children: title },
					{
						type: "containerDirective",
						name: "tab-body",
						attributes: {},
						children: body,
					},
				],
			}));
		});
	};
}
