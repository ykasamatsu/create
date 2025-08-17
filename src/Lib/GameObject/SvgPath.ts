import { SvgObject } from "./SvgObject"

export class SvgPath extends SvgObject {

	d: string = ""

	constructor() {
		super()
		this.createElement("path")
	}

	draw() {
		this.elem.setAttribute('d', this.d)
	}
}
