

export class Util {

	//0:0,1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,
	//a:10,b:11,c:12,d:13,e:14,f:15,g:16,h:17,i:18,j:19,k:20,l:21,m:22,n:23,o:24,p:25,q:26,r:27,s:28,t:29,u:30,v:31,w:32,x:33,y:34,z:35,
	//A:36,B:37,C:38,D:39,E:40,F:41,G:42,H:43,I:44,J:45,K:46,L:47,M:48,N:49,O:50,P:51,Q:52,R:53,S:54,T:55,U:56,V:57,W:58,X:59,Y:60,Z:61,
	//-:62,.:63,
	static toNumber64(text: string): number[] {
		let result: number[] = []
		let length: number = text.length

		for (let i = 0; i < length; i++) {
			let charCode = text.charCodeAt(i)
			if (charCode < 48) {
				result.push(charCode + 17)
			} else if (charCode < 58) {
				result.push(charCode - 48)
			} else if (charCode < 91) {
				result.push(charCode - 29)
			} else {
				result.push(charCode - 87)
			}
		}
		return result
	}

	static toString64(...values: number[]): string {
		let s = ""
		for (let value of values) {
			if (value < 10) s += value
			else if (value < 36) s += String.fromCharCode(value + 87)
			else if (value < 62) s += String.fromCharCode(value + 29)
			else s += String.fromCharCode(value - 17)
		}
		return s
	}

	static getBitFlagString(...values: boolean[]): string {
		let bit = 0
		for (let i = 0; i < values.length; i++) {
			if (values[i]) bit += Math.pow(2, i)
		}
		return Util.toString64(bit)
	}

	static shuffle(array: Array<any>) {
		for (let i = array.length - 1; 0 < i; i--) {

			let r = Math.floor(Math.random() * (i + 1));

			let tmp = array[i];
			array[i] = array[r];
			array[r] = tmp;
		}
		return array;
	}

	static getRandom(array: Array<any>) {
		return array[Math.floor(Math.random() * array.length)]
	}

	static getShuffled(array: Array<any>): Array<any> {
		let shuffled = array.concat()
		for (let i = array.length - 1; 0 < i; i--) {

			let r = Math.floor(Math.random() * (i + 1));

			let tmp = shuffled[i];
			shuffled[i] = shuffled[r];
			shuffled[r] = tmp;
		}
		return shuffled;
	}

	static or(value: number, targets: number[]) {
		for (let target of targets) {
			if (value == target) return true
		}
		return false
	}

	static getUnion<T>(one: Set<T>, two: Set<T>) {
		return new Set([...one, ...two]);
	}

	static getIntersection<T>(one: Set<T>, two: Set<T>) {
		return new Set([...one].filter(x => two.has(x)));
	}

	static getDifference<T>(one: Set<T>, two: Set<T>) {
		return new Set([...one].filter(x => !two.has(x)));
	}

	static exceptWith<T>(one: Set<T>, two: Set<T>) {
		for (let item of two) {
			one.delete(item)
		}
	}

	static unionWith<T>(one: Set<T>, two: Set<T>) {
		for (let item of two) {
			one.add(item)
		}
	}


	static isSubset<T>(one: Set<T>, two: Set<T>) {
		for (let item of two) {
			if (!one.has(item)) return false
		}
		return true
	}

	static getCombination<T>(set: Set<T>) {
		let size = set.size
		let combinationList: [T, T][] = []
		let index = 0

		for (let item of set) {
			let start = index - 1
			for (let i = 0; i < index; i++) {
				combinationList[start][1] = item
				start += size - i - 2
			}
			index++
			for (let i = 0; i < size - index; i++)combinationList.push([item, null])
		}
		return combinationList
	}

	static sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms))
	}

}

