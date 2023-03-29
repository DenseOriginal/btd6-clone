import { Enemy } from './enemyClass';
import { GatlingProjectile } from './gatlingProjectile';



export class Quadtree {
	public objects: Enemy[] = [];
	public nodes: Quadtree[] | null[] = [];
	constructor(public x: number, public y: number, public width: number, public height: number, public maxObjects: number, public maxLevels: number, public level: number) {
		this.level = level || 0;
	}

	clear() {
		this.objects = [];
		for (let i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i]) {
				this.nodes[i]?.clear();
				this.nodes[i] = null;
			}
		}
		this.nodes = [];
	}

	split1() {
		const subWidth = this.width / 2;
		const subHeight = this.height / 2;
		const { x } = this;
		const { y } = this;

		this.nodes[0] = new Quadtree(
			x + subWidth,
			y,
			subWidth,
			subHeight,
			this.maxObjects,
			this.maxLevels,
			this.level + 1,
		);
		this.nodes[1] = new Quadtree(
			x,
			y,
			subWidth,
			subHeight,
			this.maxObjects,
			this.maxLevels,
			this.level + 1,
		);
		this.nodes[2] = new Quadtree(
			x,
			y + subHeight,
			subWidth,
			subHeight,
			this.maxObjects,
			this.maxLevels,
			this.level + 1,
		);
		this.nodes[3] = new Quadtree(
			x + subWidth,
			y + subHeight,
			subWidth,
			subHeight,
			this.maxObjects,
			this.maxLevels,
			this.level + 1,
		);
	}

	getIndex(object: Enemy | GatlingProjectile) {
		if (object != undefined) {
			let index = -1;
			const verticalMidpoint = this.x + this.width / 2;
			const horizontalMidpoint = this.y + this.height / 2;

			const topQuadrant = object.position.y < horizontalMidpoint && object.position.y + object.height < horizontalMidpoint;
			const bottomQuadrant = object.position.y > horizontalMidpoint;

			if (
				object.position.x < verticalMidpoint
                && object.position.x + object.width < verticalMidpoint
			) {
				if (topQuadrant) {
					index = 1;
				} else if (bottomQuadrant) {
					index = 2;
				}
			} else if (object.position.x > verticalMidpoint) {
				if (topQuadrant) {
					index = 0;
				} else if (bottomQuadrant) {
					index = 3;
				}
			}

			return index;
		}
	}

	insert(object: Enemy) {
		if (this.nodes.length > 0) {
			const index = this.getIndex(object);
			if (index !== -1 && index) {
				this.nodes[index]?.insert(object);
				return;
			}
		}

		this.objects.push(object);

		if (this.objects.length > this.maxObjects && this.nodes.length === 0) {
			this.split1();
			let i = 0;
			while (i < this.objects.length) {
				const index = this.getIndex(this.objects[i]);
				if (index !== -1 && index) {
					this.nodes[index]?.insert(this.objects.splice(i, 1)[0]);
				} else {
					i++;
				}
			}
		}
	}
	retrieve(object: GatlingProjectile) {
		if (object != undefined) {
			const index = this.getIndex(object);
			let returnObjects = this.objects;
			if (this.nodes.length > 0) {
				if (index !== -1 && index) {
					const foundObject = this.nodes[index]?.retrieve(object);
					if (foundObject) returnObjects = returnObjects.concat(foundObject);
				} else {
					for (let i = 0; i < this.nodes.length; i++) {
						const foundObject = this.nodes[i]?.retrieve(object);
						if (foundObject) returnObjects = returnObjects.concat(foundObject);
					}
				}
			}
			return returnObjects;
		}
	}

	draw() {
		push();
		noFill();
		stroke(120);
		rect(this.x, this.y, this.width, this.height);
		pop();
		for (let i = 0; i < this.nodes.length; i++) {
			this.nodes[i]?.draw();
		}
	}
	remove(object: Enemy) {
		const index = this.getIndex(object);
		if (index !== -1 && index && this.nodes.length > 0) {
			this.nodes[index]?.remove(object);
			return;
		}
		const i = this.objects.indexOf(object);
		if (i !== -1) {
			this.objects.splice(i, 1);
		}
	}
}
