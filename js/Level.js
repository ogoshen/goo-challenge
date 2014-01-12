define([
	'goo/math/Vector3',
	'goo/entities/World',
	'goo/entities/EntityUtils',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/bounds/BoundingSphere',
	'goo/renderer/bounds/BoundingBox',
	'goo/shapes/ShapeCreator',
	'goo/renderer/Material',
	'goo/renderer/Util',
	'goo/renderer/shaders/ShaderLib',
	'js/CollisionComponent',
	'js/DoorComponent',
	'js/Utils'
], function(
	Vector3,
	World,
	EntityUtils,
	ScriptComponent,
	BoundingSphere,
	BoundingBox,
	ShapeCreator,
	Material,
	Util,
	ShaderLib,
	CollisionComponent,
	DoorComponent,
	Utils
) {
	'use strict';

	function Level() {
		this.num = 0;
		this.name = "Level" + this.num;
		this.blocks = [];
	}

	Level.prototype.init = function(f) {
		f.call(this);
	}

	Level.prototype.getBlock = function(x, y) {
		var idx = x + y * this.map.width;
		return this.blocks[idx];
	}

	Level.prototype.blockAtPos = function(x, y) {
		var bs = _.filter(this.blocks, function(b) {
			if (b == null) return false;
			var _x = ~~x,
				_y = ~~y;
			var p = b.transformComponent.transform.translation;
			return p.x == _x && p.z == _y;
		});
		return bs[0];
	}

	Level.prototype.indexOfBlock = function(b) {
		return this.blocks.indexOf(b);
	}

	Level.prototype.blockPos = function(b) {
		var i = this.indexOfBlock(b);
		return [i % this.map.width, ~~ (i / this.map.width)];
	}

	var RotationScript = function(x, y, z) {
		x = x == undefined ? 1 : x;
		y = y == undefined ? 1 : y;
		z = z == undefined ? 1 : z;
		return {
			run: function(entity) {
				entity.transformComponent.transform.rotation.rotateX(x * World.tpf);
				entity.transformComponent.transform.rotation.rotateY(y * World.tpf);
				entity.transformComponent.transform.rotation.rotateZ(z * World.tpf);
				entity.transformComponent.setUpdated();
			}
		}
	};



	Level.prototype.createKey = function(goo, originalKey, pos) {
		var key = EntityUtils.clone(goo.world, originalKey);
		var sphereBounds = new BoundingSphere();
		sphereBounds.radius = 0.2;
		key.setComponent(new CollisionComponent(key, sphereBounds));
		key.setComponent(new ScriptComponent([
			new RotationScript(4, 1, 1)
			// new RotationScript(4, 0, 0)
		]));
		key.addToWorld();
		key.transformComponent.setTranslation(pos);
		key.tag = "key";


		Utils.addPointLight(goo, new Vector3(0, 2, 0), [1.0, 0.9, 0, 1], {
			range: 10,
			intensity: 2
		}, key.transformComponent);
		Utils.addHalo(goo, 3, Vector3.ZERO, [0.9, 0.8, 0, 0.3], key.transformComponent);
 
		var up = new Vector3();
		key.transformComponent.transform.applyForwardVector(Vector3.UNIT_Z, up);
		/*
					for (var i = 0, nflares = 5; i <= nflares; i++) {
						var p = new Vector3(pos);
						// p.add(Vector3.mul(up, i));
						var flare = addHalo(1, p, [1.0, 1.0, 0.5, 0.5], key.transformComponent);
						flare.transformComponent.setTranslation(p);

						var script = (function(i) {
							var r = 10;
							var speed = 2;
							// var speed = 0.25;
							var offset = i * 2 * Math.PI / nflares;
							return {
								run: function(entity) {
									var t = goo.world.time * speed + offset;
									// entity.transformComponent.setTranslation(r * Math.cos(t), 0, r * Math.sin(t));
									// entity.transformComponent.setTranslation(0, r * Math.cos(t), r * Math.sin(t));
									// entity.transformComponent.setTranslation(r * Math.cos(t), 0, r * Math.sin(t));
									entity.transformComponent.setTranslation(r * Math.cos(t), r * Math.cos(t), r * Math.sin(t));
								}
							};
						})(i);

						flare.setComponent(new ScriptComponent(script));
					}
*/

		/*					
					key.transformComponent.setScale(0, 0, 0);
					var tween = new TWEEN.Tween({
						s: 0
					}).to({
						s: 0.2
					}, 1000).delay(3500)
						.easing(TWEEN.Easing.Back.Out)
						.onUpdate(function() {
							key.transformComponent.setScale(this.s, this.s, this.s);
						})
						.start();
*/
		return key;
	}



	Level.prototype.buildMap = function(goo, loader) {
		function initBlocks() {
			var material = Material.createMaterial(ShaderLib.uber);
			material.uniforms.materialAmbient = [0.05, 0.05, 0.1, 1.0];
			material.uniforms.materialDiffuse = [0.05, 0.1, 0.3, 1.0];
			material.uniforms.materialSpecular = [0.05, 0.1, 1, 1.0];

			window.material = material;

			var boxShape = ShapeCreator.createBox(2, 2, 2, 1, 1);

			var block = EntityUtils.createTypicalEntity(goo.world, boxShape, material, Vector3.ZERO);
			block.hitMask = 1;
			block.setComponent(new CollisionComponent(block, new BoundingSphere()));			
			block.tag = "wall";

			window.ent = block;
			this.map.entities = [0];
			this.map.entities.push(block);

			material = Material.createMaterial(ShaderLib.uber);
			material.uniforms.materialAmbient = [0.2, 0.1, 0.1, 1.0];
			material.uniforms.materialDiffuse = [0.5, 0.1, 0.1, 1.0];
			material.uniforms.materialSpecular = [0.5, 0.1, 0.1, 1.0];
			block = EntityUtils.createTypicalEntity(goo.world, boxShape, material, Vector3.ZERO);
			// block = EntityUtils.createTypicalEntity(goo.world, boxShape, material, Vector3.ZERO);
			block.hitMask = 1;
			block.tag = "door";
			this.map.entities.push(block);

			material = Material.createMaterial(ShaderLib.uber);
			material.uniforms.materialAmbient = [0.1, 0.2, 0.1, 1.0];
			material.uniforms.materialDiffuse = [0.1, 0.5, 0.1, 1.0];
			material.uniforms.materialSpecular = [0.1, 0.5, 0.1, 1.0];
			block = EntityUtils.createTypicalEntity(goo.world, boxShape, material, Vector3.ZERO);
			block.hitMask = 3;
			block.tag = "door";
			this.map.entities.push(block);


			material = Material.createMaterial(ShaderLib.uber);
			material.uniforms.materialAmbient = [0, 0, 0, 1];
			material.uniforms.materialDiffuse = [0, 0, 0, 1];
			material.uniforms.materialSpecular = [0, 0, 0, 1];
			block = EntityUtils.createTypicalEntity(goo.world, boxShape, material, Vector3.ZERO);
			block.hitMask = 0;
			// window.block=block;r
			// block.setComponent(new CollisionComponent(block, block.meshDataComponent.modelBound));
			block.setComponent(new CollisionComponent(block, new BoundingSphere()));
			// block.setComponent(new CollisionComponent(knight));
			block.tag = "portal";
			this.map.entities[9] = block;

			material = Material.createMaterial(ShaderLib.uber);
			block = EntityUtils.createTypicalEntity(goo.world, ShapeCreator.createBox(2, 2, 2, 1, 1), material, Vector3.ZERO);
			block.hitMask = 0x11;
			block.tag = "wall";
			this.map.entities[4] = block;

		}
		initBlocks.call(this);

		for (var i = 0; i < this.map.height; i++) {
			for (var j = 0; j < this.map.width; j++) {
				// if (map.data[i][j] == 0) continue;
				if (this.map.data[i][j] == 0) {
					this.blocks.push(null);
					continue;
				}
				var k = this.map.data[i][j];
				var ent = this.map.entities[k];
				if (!ent) continue;
				// var ent = loader.getCachedObjectForRef(map.refs[k]);
				var b = EntityUtils.clone(goo.world, ent);
				var m0 = ent.meshRendererComponent.materials[0];
				var m = Material.createMaterial(ShaderLib.uber);
				_.extend(m.uniforms, m0.uniforms);

				// if (k == 1) {
				// 	if (j % 2 == 0 || j % 2 == 0) {
				// 		m.uniforms.materialDiffuse = [0.5, 0.5, 0.5, 1];						
				// 	} else {
				// 		m.uniforms.materialDiffuse = [1, 1, 1, 1];
				// 	}
				// }
				b.meshRendererComponent.materials = [m];
				b.hitMask = ent.hitMask;
				b.tag = ent.tag;
				b.transformComponent.transform.translation.set(2 * j - 4, -1.01, 2 * i - 3);
				// b.transformComponent.transform.scale.set(10, 10, 10);
				// b.transformComponent.transform.rotation.fromAngles(Math.PI / 2, 0, 0);
				b.transformComponent.transform.rotation.fromAngles(Math.PI / 2, 0, Math.PI / 2);

				// var cannonComponent = new CannonjsComponent({mass: 0});
				// entity.setComponent(cannonComponent);

				if (k > 1) {
					var m = b.meshRendererComponent.materials[0];
					var c = m.uniforms.materialDiffuse;
					// addPointLight(new Vector3(2 * j - 5, 5, 2 * i - 3), c);
				}

				if (k == 3) {
					b.setComponent(new DoorComponent());
				}

				if (k == 4) {
					var sphereBounds = new BoundingSphere();
					sphereBounds.radius = 0.5;
					sphereBounds.center.copy(b.transformComponent.transform.translation);
					b.setComponent(new CollisionComponent(b, sphereBounds));
					b.collisionComponent.onCollision = function(other) {
						if (other.tag != "movable") return;
						console.log(this.entity);
						var idx = level.indexOfBlock(this.entity);
						this.entity.removeFromWorld();
					}
				}

				if (k == 5) {
					sphereBounds = new BoundingSphere();
					sphereBounds.radius = 1;
					sphereBounds.center.copy(b.transformComponent.transform.translation);
					b.setComponent(new CollisionComponent(b, sphereBounds));
				}

				// b.hitMask = 1;
				b.addToWorld();

				this.blocks.push(b);
			}
		}

		var blocks = this.blocks;
		_.each(this.blocks, function(b, i) {
			if (!b) return;
			var tween = new TWEEN.Tween({
				y: -1
			}).to({
				y: 1
			}, 750).delay(500 + 20 * (blocks.length - i))
				.easing(TWEEN.Easing.Elastic.Out)
				.onUpdate(function() {
					// b.transformComponent.transform.translation.set(0, this.y, 0);
					b.transformComponent.transform.translation.y = this.y;
					b.transformComponent.setUpdated();
				})
				.start();
		});

		setTimeout(function() {
			Game.state = Game.States.LEVEL_READY;
		}, 750 + 500 + 20 * this.blocks.length);

	}


	Level.prototype.showTitle = function() {
		// $("#level").delay(1000).fadeIn(1500).delay(2000).fadeOut();
		// $("#level").show();

		var levelTemplate = _.template('<h1><span class="lobster">Level <%= num %> - </span><span class="ruge"><%= name %></span></h1>');
		$("#level").html(levelTemplate(this));
		setTimeout(function() {
			$("#level").toggleClass("out in");
		}, 1000);
		setTimeout(function() {
			$("#level").toggleClass("out in");
		}, 5000);

	}

	Level.prototype.fadeLights = function(goo) {
		var mgr = goo.world.entityManager;
		var lights = _.filter(mgr.getEntities(), function(e) {
			return e.hasComponent("LightComponent");
		});

		_.each(lights, function(l, i) {
			var intensity = l.lightComponent.light.intensity;
			l.lightComponent.light.intensity = 0;
			new TWEEN.Tween({
				i: 0
			}).to({
				i: intensity
			}, 1000).delay(4000 + 500 * i)
				.onUpdate(function() {
					l.lightComponent.light.intensity = this.i;
				})
				.start();
		});

	}


	return Level;
});