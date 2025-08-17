import { GameObject } from "./GameObject"

export class HtmlObject extends GameObject {

	set elem(value) {
		this._elem = value
	}

	get elem(): HTMLElement {
		return <HTMLElement>this._elem
	}

	createElement(tagName: string) {
		this.elem = document.createElement(tagName)
	}
}