define([
	'goo/entities/components/Component'
], function(
	Component
) {
	function CollisionComponent(entity, bounds) {
		this.type = "CollisionComponent";
		this.entity = entity;
		this.bounds = bounds;
	}
	CollisionComponent.prototype = Object.create(Component.prototype);

	return CollisionComponent;
});