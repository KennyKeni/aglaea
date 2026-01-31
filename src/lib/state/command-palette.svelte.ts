class CommandPalette {
	open = $state(false);

	toggle() {
		this.open = !this.open;
	}

	show() {
		this.open = true;
	}

	hide() {
		this.open = false;
	}
}

const instance = new CommandPalette();

export function createCommandPalette() {
	return instance;
}
