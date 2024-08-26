import { Plugin } from "obsidian";
import { WeekReviewView, WEEK_REVIEW_TYPE } from "week-review-view";

export default class MyPlugin extends Plugin {
	override async onload() {
		this.registerView(WEEK_REVIEW_TYPE, (leaf) => new WeekReviewView(leaf));

		this.addRibbonIcon("calendar-range", "Activate view", () => {
			this.activateView();
		});
	}

	onunload() {}

	async saveSettings() {}

	async activateView() {
		const { workspace } = this.app;

		const leaf = workspace.getRightLeaf(false);
		await leaf?.setViewState({ type: WEEK_REVIEW_TYPE, active: true });

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf!);
	}
}
