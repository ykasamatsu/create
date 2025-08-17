import { HtmlObject } from "./GameObject/HtmlObject"

export class Game extends HtmlObject {

	static I: Game

	constructor() {
		super()
		Game.I = this

		this.elem = document.querySelector("#game")

		this.elem.addEventListener("touchmove", (e) => {
			if (e.touches.length == 1) {
				e.preventDefault();
			}
		})
		this.elem.addEventListener("touchend", this.preventDefault)
		this.elem.addEventListener("touchcancel", this.preventDefault)
		this.elem.addEventListener("contextmenu", this.preventDefault)

	}

	preventDefault(e) {
		e.preventDefault();
	}

}