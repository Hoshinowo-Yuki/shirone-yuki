import { h } from "hastscript";

function childElements(node, tagName) {
	return (node?.children ?? []).filter(
		(child) => child.type === "element" && child.tagName === tagName,
	);
}

/**
 * Renders a `tab-set` from remarkTabs. Each tab is emitted as input, label,
 * panel in that order so `:checked + label + panel` can switch any number of
 * tabs with CSS alone; the radios also give native arrow-key switching. With
 * CSS unavailable, every title and panel still reads in source order.
 */
export function TabsComponent(properties, children = []) {
	const groupId = String(properties?.id ?? "shirone-tabs");
	const items = children.filter(
		(child) => child.type === "element" && child.tagName === "tab-item",
	);

	return h(
		"div",
		{ className: ["m3-tabs"], dataTabs: "" },
		items.flatMap((item, index) => {
			const [title] = childElements(item, "tab-title");
			const [body] = childElements(item, "tab-body");
			const id = `${groupId}-${index + 1}`;
			return [
				h("input", {
					className: ["m3-tabs__input"],
					type: "radio",
					name: groupId,
					id,
					checked: index === 0,
					ariaControls: `${id}-panel`,
				}),
				h(
					"label",
					{ className: ["m3-tabs__tab"], htmlFor: id, id: `${id}-tab` },
					title?.children ?? [],
				),
				h(
					"div",
					{
						className: ["m3-tabs__panel"],
						id: `${id}-panel`,
						role: "group",
						ariaLabelledBy: `${id}-tab`,
					},
					body?.children ?? [],
				),
			];
		}),
	);
}
