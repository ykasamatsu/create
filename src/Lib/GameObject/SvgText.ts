import { SvgObject } from "./SvgObject"

export class SvgText extends SvgObject {

	constructor() {
		super()
		this.createElement("text")
	}

	setText(text: string) {
		this.elem.innerHTML = text
	}

	setPosition(x: number, y: number) {
		this.elem.setAttribute("x", "" + x)
		this.elem.setAttribute("y", "" + y)
	}
}