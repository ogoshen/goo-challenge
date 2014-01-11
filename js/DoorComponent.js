define([
	'goo/entities/components/Component'
], function(
	Component
) {
	function DoorComponent(key, enemy) {
		this.type = "DoorComponent";
		this.key = key;
		this.enemy = enemy;
		this.open = false;
		this.openning = false;
	}

	DoorComponent.prototype = Object.create(Component.prototype);

	return DoorComponent;
});