import {
	ItemView,
	MarkdownRenderer,
	TAbstractFile,
	TFile,
	WorkspaceLeaf,
} from "obsidian";

export const WEEK_REVIEW_TYPE = "week-review-view";
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export class WeekReviewView extends ItemView {
	root: Element;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		this.icon = "calendar-range";
	}

	override getViewType() {
		return WEEK_REVIEW_TYPE;
	}

	override getDisplayText() {
		return "Week Review";
	}

	override async onOpen() {
		const container = this.containerEl.children[1];
		this.root = container;
		await this.render();
		this.registerEvent(
			this.app.vault.on("create", (file) => this.crudEvent(file)),
		);
		this.registerEvent(
			this.app.vault.on("modify", (file) => this.crudEvent(file)),
		);
		this.registerEvent(
			this.app.vault.on("delete", (file) => this.crudEvent(file)),
		);
		this.registerEvent(
			this.app.vault.on("rename", (file) => this.crudEvent(file)),
		);
	}

	crudEvent(file: TAbstractFile) {
		const fileDate = pathToDate(file);
		if (fileDate == null) {
			return;
		}
		const diff = Date.now() - fileDate.getTime();
		if (diff <= WEEK_IN_MS) {
			this.render();
		}
	}

	async render() {
		this.root.empty();

		const notes = this.getWeekNotes();
		for (const entry of notes) {
			this.root.createEl("h1", { text: entry.basename });
			const contents = await this.app.vault.cachedRead(entry);
			const container = this.root.createDiv();
			MarkdownRenderer.render(
				this.app,
				contents,
				container,
				entry.path,
				this,
			);
		}
	}

	override async onClose() {}

	getWeekNotes(): TFile[] {
		const entries: TFile[] = [];

		for (let i = 1; i <= 7; i += 1) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const path = dateToPath(date);
			const entry = this.app.vault.getFileByPath(path);
			if (entry != null) {
				entries.push(entry);
			}
		}

		return entries;
	}
}

function dateToPath(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const dateStr = String(date.getDate()).padStart(2, "0");
	return `diary/${year}-${month}-${dateStr}.md`;
}

function pathToDate(file: TAbstractFile): Date | null {
	if (!file.name.endsWith("md")) {
		return null;
	}
	const name = file.name.substring(0, file.name.length - ".md".length);
	const [year, month, date] = name.split("-");
	if (year == null || month == null || date == null) {
		return null;
	}
	return new Date(Number(year), Number(month) - 1, Number(date));
}
