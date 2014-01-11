define([
	'goo/entities/components/Component'
], function(
	Component
) {
	function HealthComponent(hp) {
		this.type = "HealthComponent";
		this.hp = hp;
	}

	HealthComponent.prototype = Object.create(Component.prototype);

	return HealthComponent;
});