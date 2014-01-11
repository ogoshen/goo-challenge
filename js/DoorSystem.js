define([
	'goo/entities/systems/System',
	'goo/renderer/shaders/ShaderLib',
	'goo/renderer/Material'
], function(
	System,
	ShaderLib,
	Material
) {
	function DoorSystem(inventory) {
		System.call(this, 'DoorSystem', ['DoorComponent']);
		this.inventory = inventory;
	}
	DoorSystem.prototype = Object.create(System.prototype);

	DoorSystem.prototype.process = function(entities, tpf) {
		if (this.inventory.items.length == 0) return;
		for (var i = 0; i < entities.length; i++) {
			var door = entities[i];
			var key = door.doorComponent.key;
			if (_.contains(this.inventory.items, key) && !door.doorComponent.open) {
				door.doorComponent.open = true;
				// door.transformComponent.setScale(0, 0, 0);

				var material = Material.createMaterial(ShaderLib.uber);
				material.uniforms.materialAmbient = [0.1, 0.2, 0.1, 1.0];
				material.uniforms.materialDiffuse = [0.1, 0.5, 0.1, 1.0];
				material.uniforms.materialSpecular = [0.1, 0.5, 0.1, 1.0];
				door.meshRendererComponent.materials = [material];
				door.hitMask = 3;
			}
		}
	}

	return DoorSystem;
});