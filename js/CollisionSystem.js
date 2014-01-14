define([
	'goo/entities/systems/System',
	'goo/math/Vector3'	
], function(
	System,
	Vector3
) {	
	function CollisionSystem() {
		// this.type = "CollisionSystem";
		// this.interests = ["CollisionComponent"];
		System.call(this, 'CollisionSystem', ['CollisionComponent']);
		// System.call(this, 'CollisionSystem', ['CollisionComponent', 'MeshRendererComponent']);
		// System.call(this, 'CollisionSystem', ['MeshRendererComponent']);
		this.collisions = {};

	}
	CollisionSystem.prototype = Object.create(System.prototype);

	CollisionSystem.prototype.process = function(entities, tpf) {
		for (var i = 0; i < entities.length; i++) {
			var e0 = entities[i];
			for (var j = 0; j < entities.length; j++) {
				var e1 = entities[j];
				if (e0 == e1)
					continue;

				var d = Vector3.distance(e0.transformComponent.transform.translation, e1.transformComponent.transform.translation);
				if(d > 10) continue;

				var b0 = e0.collisionComponent.bounds;
				var b1 = e1.collisionComponent.bounds;

				b0.center.copy(e0.transformComponent.transform.translation);
				b1.center.copy(e1.transformComponent.transform.translation);

				var k = [e0.id, e1.id];
				if (b0.intersects(b1)) {
					if (undefined === this.collisions[k]) {
						this.collisions[k] = true;
						// console.log([b0, b1]);
						if (e0.collisionComponent.onCollision != undefined)
							e0.collisionComponent.onCollision(e1);

						// if (e1.collisionComponent.onCollision != undefined)
						// e1.collisionComponent.onCollision(e0);
					} else {
						if (e0.collisionComponent.onCollisionStay != undefined)
							e0.collisionComponent.onCollisionStay(e1);
					}
				} else {
					delete this.collisions[k];
				}

				// entity.myComponent.doCoolStuff(entity, this.world.time);
			}
		}
	}

	return CollisionSystem;
});