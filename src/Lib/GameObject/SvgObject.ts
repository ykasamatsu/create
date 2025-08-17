import { GameObject } from "./GameObject"

export class SvgObject extends GameObject {

	set elem(value) {
		this._elem = value
	}

	get elem(): SVGElement {
		return <SVGElement>this._elem
	}

	createElement(tagName: string) {
		this.elem = document.createElementNS("http://www.w3.org/2000/svg", tagName)
	}
}