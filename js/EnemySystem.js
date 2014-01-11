define([
	'goo/entities/systems/System',
	'js/Enemy'
], function(
	System,
	Enemy
) {
	function EnemySystem(inventory) {
		System.call(this, 'EnemySystem', ['Enemy']);
	}
	EnemySystem.prototype = Object.create(System.prototype);

	EnemySystem.prototype.process = function(entities, tpf) {
		for (var i = 0; i < entities.length; i++) {
			var e = entities[i];
			e.enemy.update(e);
			if(e.healthComponent.hp <= 0) {
				// e.removeFromWorld();
				e.state = Enemy.States.DEAD;
			}
		}
	}

	return EnemySystem;
});