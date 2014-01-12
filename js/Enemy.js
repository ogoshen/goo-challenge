define([
	'goo/entities/components/Component',
	'goo/entities/World',
	'goo/math/Vector3',
	'goo/math/Ray'
], function(
	Component,
	World,
	Vector3,
	Ray
) {
	function Enemy(entity) {
		this.type = "Enemy";
		this.entity = entity;
		this.direction = new Vector3(0, 0, 1);
		this.speed = 0.03;
		this.ray = new Ray();
		this.state = 0;
		this.target = null;
		this.entity.collisionComponent.onCollision = this.onCollision;

		Enemy.States = {
			IDLE: 0,
			WALK: 1,
			HIT: 2,
			DEAD: 3
		}
	}
	Enemy.prototype = Object.create(Component.prototype);

	Enemy.prototype.onCollision = function(other) {
		if (other.tag != "player") return;
		this.entity.enemy.target = other;
		if (this.entity.enemy.state == Enemy.States.DEAD)
			return;
		this.entity.enemy.state = 2;
	}

	Enemy.prototype.update = function(entity) {
		if (this.state && entity.healthComponent.hp <= 0)
			this.state = Enemy.States.DEAD;

		switch (this.state) {
			case Enemy.States.IDLE:
				entity.animationComponent.transitionTo("idle");
				_.delay(function() {
					entity.enemy.state = Enemy.States.WALK;
				}, 2000);
				break;

			case Enemy.States.WALK:
				var transform = entity.transformComponent.transform;

				// this.ray.origin.copy(transform.translation);
				this.ray.origin.set(transform.translation.x, 1, transform.translation.z);

				this.ray.direction.copy(this.direction);
				this.ray.distance = 1;
				var hit = picking.castRay(this.ray, 1);
				if (hit) {
					// this.direction.copy(hit.normal);
					// this.direction = hit.normal.clone();
					this.direction.set(hit.normal.x, 0, hit.normal.z);
				}

				transform.lookAt(Vector3.sub(transform.translation, this.direction), Vector3.UNIT_Y);
				/*
				var f = new Vector3();
				transform.applyForwardVector(Vector3.UNIT_Z, f);
				f.lerp(this.direction, 10 * World.tpf).normalize();
				transform.lookAt(Vector3.sub(transform.translation, f), Vector3.UNIT_Y);

				var d = Vector3.dot(f, this.direction);

				var s = 0;
				if (d == 1)
					s = this.speed;
				var v = Vector3.mul(this.direction, s);
*/
				var v = Vector3.mul(this.direction, this.speed);
				transform.translation.add(v);


				var anim = this.speed > 0 ? "walk" : "idle";
				// var anim = s > 0 ? "walk" : "idle";
				entity.animationComponent.transitionTo(anim);

				entity.transformComponent.setUpdated();

				break;

			case Enemy.States.HIT:
				var transform = entity.transformComponent.transform;
				// var d = this.target.transformComponent.transform.translation.clone();
				var d = new Vector3().copy(this.target.transformComponent.transform.translation);
				d = Vector3.sub(transform.translation, d);
				if (d.length() > 3) {
					entity.enemy.state = 0;
					break;
				}

				// transform.lookAt(Vector3.add(transform.translation, d.normalize()), Vector3.UNIT_Y);

				var f = new Vector3();
				transform.applyForwardVector(Vector3.UNIT_Z, f);
				f.lerp(d.mul(-1).normalize(), 5 * World.tpf).normalize();
				transform.lookAt(Vector3.sub(transform.translation, f), Vector3.UNIT_Y);


				entity.transformComponent.setUpdated();
				entity.animationComponent.transitionTo("hit");
				// _.delay(function() {
				// entity.enemy.state = 0;
				// }, 500);			
				break;

			case Enemy.States.DEAD:
				// this.state = -1;

				entity.animationComponent.transitionTo("die");

				// entity.animationComponent.transitionTo("idle");
				console.log("dead");
				new TWEEN.Tween({
					y: 0
				}).to({
					y: -1
				}, 4000).delay(750)
					.easing(TWEEN.Easing.Exponential.In)
					.onStart(function() {
						// var s = entity.animationComponent.layers[0]._currentState;
						// s._sourceTree._clipInstance._loopCount = 1;
						// entity.animationComponent.paused = true;
					})
					.onUpdate(function() {
						entity.transformComponent.transform.translation.y = this.y;
						entity.transformComponent.setUpdated();
					}).
				onComplete(function() {
					entity.removeFromWorld();
				})
					.start();

				delete this.onCollision;
				delete this.state;

				break;
			default:
				break;
		}
	}

	return Enemy;
});