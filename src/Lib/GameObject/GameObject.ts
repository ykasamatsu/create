export class GameObject {
	protected _elem: Element

	get elem() {
		return this._elem
	}
	set elem(value) {
		this._elem = value
	}

	addChild(child: GameObject) {
		this.elem.append(child.elem)
	}

	addClass(name: string) {
		this.elem.classList.add(name)
	}

	removeClass(name: string) {
		this.elem.classList.remove(name)
	}

	getAttribute(name: string) {
		return this.elem.getAttribute(name)
	}

	setAttribute(name: string, value: string = "") {
		this.elem.setAttribute(name, value)
	}

	toggleAttribute(name: string, flag: boolean) {
		if (flag) this.elem.setAttribute(name, "")
		else this.elem.removeAttribute(name)
	}

	removeAttribute(name: string) {
		this.elem.removeAttribute(name)
	}

	destroy() {
		this.elem.remove()
	}
}