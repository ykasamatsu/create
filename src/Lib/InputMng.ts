export class InputMng {

	static isPointerDown: boolean = false

	constructor() {
		document.addEventListener("pointerdown", (e) => {
			InputMng.isPointerDown = true
		})
		document.addEventListener("pointerup", (e) => {
			InputMng.isPointerDown = false
		})
	}

}