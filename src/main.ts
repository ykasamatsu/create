import { Game } from "./Lib/Game";
import { InputMng } from "./Lib/InputMng";
import { Point } from "./Lib/Point";

document.addEventListener('DOMContentLoaded', (e) => {
	Point.init(30, 30)
	new Game()
	new InputMng()
});
