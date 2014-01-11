define([
	'goo/entities/components/Component'
], function(
	Component
) {
	function InventoryComponent() {
		this.type = "InventoryComponent";
		this.items = [];
	}
	InventoryComponent.prototype = Object.create(Component.prototype);

	return InventoryComponent;
});