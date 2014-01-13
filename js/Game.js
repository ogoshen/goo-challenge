define([
	'goo/math/MathUtils',
	'goo/math/Vector3',
	'goo/math/Vector4',
	'goo/math/Matrix3x3',
	'goo/math/Quaternion',
	'goo/math/Plane',
	'goo/math/Ray',
	'goo/entities/EntityUtils',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/entities/World',
	'goo/renderer/Material',
	'goo/renderer/Texture',
	'goo/renderer/TextureCreator',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/SpotLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/ShapeCreator',
	'js/Time',
	'js/Input',
	'js/KeyEvent',
	'goo/entities/components/ScriptComponent',
	'goo/entities/systems/PickingSystem',
	'goo/picking/PrimitivePickLogic',
	'goo/addons/water/FlatWaterRenderer',
	'goo/addons/howler/components/HowlerComponent',
	'goo/shapes/SimpleBox',
	'goo/entities/components/LightComponent',
	'goo/entities/components/LightDebugComponent',
	'goo/util/Grid',
	'goo/renderer/bounds/BoundingSphere',
	'goo/renderer/pass/Composer',
	'goo/renderer/pass/RenderPass',
	'goo/renderer/Util',
	'goo/renderer/pass/FullscreenPass',
	'goo/renderer/pass/BloomPass',
	'goo/renderer/pass/SSAOPass',
	'goo/util/ColorUtil',
	'js/Utils',
	'js/InventoryComponent',
	'js/CollisionSystem',
	'js/CollisionComponent',
	'js/DoorSystem',
	'js/DoorComponent',
	'js/rotatingBillboard',
	'js/Level',
	'js/Enemy',
	'js/EnemySystem',
	'js/HealthComponent'
], function(
	MathUtils,
	Vector3,
	Vector4,
	Matrix3x3,
	Quaternion,
	Plane,
	Ray,
	EntityUtils,
	Camera,
	CameraComponent,
	World,
	Material,
	Texture,
	TextureCreator,
	PointLight,
	SpotLight,
	DirectionalLight,
	ShaderLib,
	ShapeCreator,
	Time,
	Input,
	KeyEvent,
	ScriptComponent,
	PickingSystem,
	PrimitivePickLogic,
	FlatWaterRenderer,
	HowlerComponent,
	SimpleBox,
	LightComponent,
	LightDebugComponent,
	Grid,
	BoundingSphere,
	Composer,
	RenderPass,
	Util,
	FullscreenPass,
	BloomPass,
	SSAOPass,
	ColorUtil,
	Utils,
	InventoryComponent,
	CollisionSystem,
	CollisionComponent,
	DoorSystem,
	DoorComponent,
	rotatingBillboard,
	Level,
	Enemy,
	EnemySystem,
	HealthComponent
) {
	"use strict";

	var Game = {};
	window.Game = Game;

	Game.init = function(goo, loader) {

		// window.gui = new dat.GUI();
		// window.gui = null;

		Game.world = goo.world;
		window.world = goo.world;

		Input.init(goo);

		goo.world.setSystem(new CollisionSystem());
		goo.world.setSystem(new EnemySystem());

		var picking = new PickingSystem({
			pickLogic: new PrimitivePickLogic()
		});
		window.picking = picking;

		goo.world.setSystem(picking);

		// var ammoSystem = new AmmoSystem();
		// window.ammoSystem = ammoSystem;
		// goo.world.setSystem(ammoSystem);

		function initGameStates() {
			Game.States = {
				LEVEL_START: 1,
				LEVEL_READY: 2,
				LEVEL_END: 4,
			};
		}
		initGameStates();
		Game.state = Game.States.LEVEL_START;

		function initComposer() {
			var composer = new Composer();
			var renderPass = new RenderPass(goo.renderSystem.renderList);
			// renderPass.clearColor = new Vector4(1, 1, 1, 1);
			renderPass.clearColor = new Vector4(0, 0, 0, 0);
			// goo.renderer.setClearColor(0, 0, 0, 1);

			var ssaoPass = new SSAOPass(goo.renderSystem.renderList);
			// ssaoPass.depthTarget.width = 1600;
			// ssaoPass.depthTarget.height = 412;
			// ssaoPass.outPass.material.shader.uniforms.size = [1600, 412];
			ssaoPass.outPass.material.renderQueue = 4001;
			// ssaoPass.outPass.material.renderQueue = 1;
			// ssao.outPass.material.shader.uniforms.size = [goo.renderer.domElement.width, goo.renderer.domElement.height];

			// // Bloom
			var bloomPass = new BloomPass({
				sizeX: 256,
				sizeY: 256,
				strength: 0.4,
				sigma: 8
			});
			window.BloomPass = BloomPass;
			window.bloom = bloomPass;

			window.ssao = ssaoPass;
			window.ssaoShader = ShaderLib.ssao;
			ssao.depthPass.overrideMaterial.shader.renderQueue = 4000;

			var shader = Util.clone(ShaderLib.copy);
			var outPass = new FullscreenPass(shader);
			outPass.renderToScreen = true;

			var vignette = Util.clone(ShaderLib.vignette);
			vignette.uniforms.darkness = -0.2;

			window.ShaderLib = ShaderLib;

			composer.addPass(renderPass);
			// composer.addPass(new FullscreenPass(Util.clone(ShaderLib.vignette)));
			// composer.addPass(new FullscreenPass(Util.clone(ShaderLib.film)));
			composer.addPass(bloomPass);
			composer.addPass(new FullscreenPass(vignette));
			// composer.addPass(ssaoPass);
			// composer.addPass(filmPass);
			composer.addPass(outPass);

			goo.renderSystem.composers.push(composer);

		}
		initComposer();



		var YellowKey = loader.getCachedObjectForRef("key2/entities/RootNode.entity")
		var RedKey = loader.getCachedObjectForRef("key2/entities/RootNode_0.entity")
		var BlueKey = loader.getCachedObjectForRef("key2/entities/RootNode_1.entity")

		var LEVELS = [];

		var level1 = new Level();
		level1.num = 1;
		level1.name = "Keys to The Castle";
		level1.map = {
			width: 20,
			height: 10,
			data: [
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 9, 0, 1],
				[1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1],
				[1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
				[1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 1],
				[1, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
				[1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 1],
				[1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
			],
			items: [],
			properties: {
				"6, 5": {
					components: []
				}
			}
		};


		function step(t) {
			return 0 | (World.time - t < 0);
		}

		function sign(x) {
			return x / Math.abs(x);
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


		var axe = loader.getCachedObjectForRef("mini_knight_split/entities/axe_0.entity");
		axe.meshRendererComponent.hidden = true;
		window.axe = axe;

		level1.buildMap(goo, loader);
		level1.init(function initLevel1() {
			var key = this.createKey(goo, YellowKey, [-1, 1, 10]);
			key.tip = '<span class="lobster">Great you found a key!<span><br><span class="ruge">You should look around for a weapon...</span>';

			this.getBlock(5, 6).setComponent(new DoorComponent(key));
			this.getBlock(11, 5).setComponent(new DoorComponent(key));

			key = this.createKey(goo, YellowKey, [22, 1, 0]);
			this.getBlock(15, 7).setComponent(new DoorComponent(key));


			var axe2 = EntityUtils.clone(goo.world, axe);
			var sphereBounds = new BoundingSphere();
			sphereBounds.radius = 0.3;
			axe2.addToWorld();
			axe2.transformComponent.setTranslation(0.3, -0.5, 0.5)
			axe2.transformComponent.setRotation(-Math.PI / 2, 0, 0);


			var axeParent = EntityUtils.createTypicalEntity(goo.world);
			axeParent.transformComponent.attachChild(axe2.transformComponent);
			axeParent.setComponent(new ScriptComponent([new RotationScript(0, 3, 2)]));
			// axeParent.transformComponent.setTranslation(0, 1, 2);
			axeParent.transformComponent.setTranslation(5, 1, 12);
			axeParent.transformComponent.setScale(2, 2, 2);
			axeParent.addToWorld();

			axeParent.setComponent(new CollisionComponent(axeParent, sphereBounds));
			axeParent.tag = "weapon";

			Utils.addPointLight(goo, Vector3.ZERO, [0.3, 0, 0.9, 1], {
				range: 10,
				intensity: 2
			}, axeParent.transformComponent);
			Utils.addHalo(goo, 3, Vector3.ZERO, [0.3, 0.8, 0.9, 0.3], axeParent.transformComponent);
			window.axe2 = axe2;

			// this.getBlock(2, 3).setComponent(new ScriptComponent({
			// 	run: function(entity) {
			// 		entity.transformComponent.transform.translation.y = Math.sin(World.time);
			// 		entity.transformComponent.setUpdated();
			// 	}
			// }));
			var blocks = _.filter(this.blocks, function(b) {
				return b != null && (b.hitMask & 0x11) == 0x11;
			});
			console.log(blocks);
			_.each(blocks, function(block, i) {
				block.setComponent(new ScriptComponent({
					run: function(entity) {
						var y = sign(Math.sin(World.time + i));
						var t = entity.transformComponent.transform.translation;
						// entity.transformComponent.transform.translation.y = 1.5 * Math.sin(t) - 0.5;
						entity.transformComponent.transform.translation.y = 1.5 * y - 0.5;
						entity.transformComponent.setUpdated();
					}
				}));
			});

			// var b = this.getBlock(11, 4);
			// var b = this.getBlock(10, 3);
			var b = this.getBlock(6, 3);
			var p = b.transformComponent.transform.translation;
			var tree = loader.getCachedObjectForRef("tree/entities/RootNode.entity");
			tree.transformComponent.setScale(0.6, 0.6, 0.6);
			tree.transformComponent.transform.setRotationXYZ(0, Math.PI / 2, 0);
			tree.transformComponent.transform.translation = Vector3.add(p, new Vector3(0, 3, 0));
			tree.transformComponent.setUpdated();

			tree.setComponent(new ScriptComponent({
				run: function(entity) {
					// var r = entity.transformComponent.transform.rotation.toAngles();
					var x = 0.03 * Math.cos(goo.world.time);
					entity.transformComponent.transform.setRotationXYZ(x, -Math.PI / 2, 0);
					entity.transformComponent.setUpdated();
				}
			}));


			var material = Material.createMaterial(ShaderLib.uber);
			material.uniforms.materialAmbient = [0.05, 0.05, 0.1, 1.0];
			material.uniforms.materialDiffuse = [0.05, 0.1, 0.3, 1.0];
			material.uniforms.materialSpecular = [0.05, 0.1, 1, 1.0];
			material.cullState.enabled = false;
			var trunk = loader.getCachedObjectForRef("tree/entities/tree_treeMesh_TrunkMaterial_0.entity")
			trunk.meshRendererComponent.materials = [material];
			window.tree = tree;

			Utils.addPointLight(goo, Vector3.add(p, new Vector3(0, 4, 0)), [1, 0, 0, 1]);

			tree.transformComponent.setScale(0, 0, 0);
			new TWEEN.Tween({
				s: 0
			}).to({
				s: 0.3
			}, 2000).delay(4500)
				.easing(TWEEN.Easing.Elastic.Out)
				.onUpdate(function() {
					tree.transformComponent.setScale(this.s, this.s, this.s);
				})
				.onComplete(function() {})
				.start();

			this.showTitle();

			var level = this;
			setTimeout(function() {
				level.fadeLights(goo);
			}, 500);
			// this.fadeLights(goo);
		});

		LEVELS.push(level1);

		var level2 = new Level();
		level2.num = 2;
		level2.name = "The Arena";
		level2.map = {
			width: 20,
			height: 10,
			data: [
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 1, 1, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
				[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
			],
			items: [],
			properties: {
				"6, 5": {
					components: []
				}
			}
		};
		LEVELS.push(level2);

		window.level = LEVELS[0];


		function addSpotLight(pos, color) {
			var spotLight = new SpotLight();
			// spotLight.color.data[0] = 0.6;
			// spotLight.color.data[1] = 0.8;
			// spotLight.color.data[2] = 1.0;
			pos = pos || Vector3.ZERO;
			color = color || [0.5, 0.5, 0, 1];
			spotLight.color.data = color;
			spotLight.angle = 35;
			spotLight.penumbra = 10;
			spotLight.range = 15;
			spotLight.shadowCaster = false;
			// spotLight.shadowCaster = true;
			// spotLight.direction.set(0, -1, 0);

			var spotLightEntity = goo.world.createEntity('spotLight');
			spotLightEntity.setComponent(new LightComponent(spotLight));

			spotLightEntity.transformComponent.transform.translation.set(pos);
			spotLightEntity.transformComponent.transform.setRotationXYZ(-Math.PI / 2, 0, 0);

			spotLightEntity.addToWorld();

			if (false) {
				var spotLightGui = gui.addFolder('Spot Light');
				var data = {
					color: [spotLight.color.data[0] * 255, spotLight.color.data[1] * 255, spotLight.color.data[2] * 255]
				};
				var controller = spotLightGui.addColor(data, 'color');
				controller.onChange(function() {
					spotLight.color.seta(data.color).div(255);
					spotLight.changedColor = true;
				});
				var controller = spotLightGui.add(spotLight, 'angle', 0, 90);
				controller.onChange(function() {
					spotLight.changedProperties = true;
				});
				var controller = spotLightGui.add(spotLight, 'penumbra', 0, 90);
				controller.onChange(function() {
					spotLight.changedProperties = true;
				});
				var controller = spotLightGui.add(spotLight, 'intensity', 0, 2);
				controller.onChange(function() {
					spotLight.changedProperties = true;
				});
				var controller = spotLightGui.add(spotLight, 'range', 0, 50);
				controller.onChange(function() {
					spotLight.changedProperties = true;
				});
				spotLightGui.add(spotLight, 'shadowCaster');

				spotLightGui.open();
			}

			return spotLightEntity;
		}


		var castRay = picking.castRay = function(ray, mask, all) {
			picking.pickRay = ray;
			picking.mask = mask;
			picking.all = all;
			picking._process();
			return picking.hit;
		};

		// var castRay = _.debounce(_castRay, 30, true);

		var v1 = new Vector3();
		var v2 = new Vector3();
		var cross = new Vector3();
		var mrc;
		var hit;
		var distance;
		var hitElement = 0;
		var hitIndex = 0;


		picking.onPick = function(result) {
			hit = null;
			if (null != result) {
				if (result.length > 0) {
					hitIndex = -1;
					hitElement = -1;
					mrc = null;
					distance = typeof picking.pickRay.distance !== 'undefined' ? picking.pickRay.distance : Infinity;
					for (var i = 0, ilen = result.length; i < ilen; i++) {
						mrc = result[i].entity.meshRendererComponent;
						if (null == mrc) {
							console.log("entity.meshRenderComponent does not exist!");
						} else {
							if (null != result[i].entity.hitMask) {
								if ((result[i].entity.hitMask & picking.mask) != 0) {
									for (var j = 0, jlen = result[i].intersection.distances.length; j < jlen; j++) {
										if (result[i].intersection.distances[j] < distance) {
											if (picking.all) {} else {
												distance = result[i].intersection.distances[j];
												hitIndex = i;
												hitElement = j;
											}
										}
									}
								}
							}
						}
					}
					if (hitIndex != -1) {

						hit = {
							entity: result[hitIndex].entity,
							point: new Vector3().copy(result[hitIndex].intersection.points[hitElement]),
							// normal: new Vector3().copy(cross),
							normal: Vector3.mul(picking.pickRay.direction, -1),
							distance: result[hitIndex].intersection.distances[hitElement]
						}
					}
				}
			}
			picking.hit = hit;
		};


		var material = Material.createMaterial(ShaderLib.uber);



		// the floor
		// var planeEntity = createEntity(goo, ShapeCreator.createQuad(1000, 1000, 100, 100), {
		// 	mass: 0
		// }, [0, 0, 0]);
		// planeEntity.transformComponent.transform.setRotationXYZ(-Math.PI / 2, 0, 0);

		function createGrid() {
			var grid = new Grid(goo.world, {
				floor: true,
				width: level.map.width * 2,
				height: level.map.height * 2,
				surface: true,
				surfaceColor: [0.5, 0.5, 0.7, 1],
				grids: [{
					stepX: 2,
					stepY: 2,
					// color: [0.5, 0.5, 0.5, 1]
					color: [1, 1, 1, 1]
				}]
			});
			grid.addToWorld();
			grid.topEntity.transformComponent.setTranslation(level.map.width - 5, 1, level.map.height - 4);
			// grid.topEntity.transformComponent.transform.setRotationXYZ(-Math.PI / 2, 0, 0);
			window.grid = grid;
		}
		// createGrid();


		function createFloor() {
			// var normal = new TextureCreator().loadTexture2D('res/images/tile_nm2.jpg');

			// var quadEnt = EntityUtils.createTypicalEntity(goo.world, ShapeCreator.createQuad(1000, 1000, 100, 100));
			// var floorMat = Material.createMaterial(ShaderLib.simpleLit);
			var floorMat = Material.createMaterial(ShaderLib.uber);
			// floorMat.uniforms.materialAmbient = [0.05, 0.05, 0.08, 1.0];
			// floorMat.uniforms.materialDiffuse = [0.05, 0.1, 0.1, 1.0];
			// floorMat.uniforms.materialSpecular = [0.05, 0.1, 1, 1.0];
			// floorMat.uniforms.materialAmbient = [0.2, 0.2, 0.2, 1.0];
			// floorMat.uniforms.materialDiffuse = [0.2, 0.2, 0.2, 1.0];
			// floorMat.uniforms.materialSpecular = [1, 1, 1, 1.0];
			// floorMat.wireframe = true;
			// floorMat.cullState.enabled = false;
			// 
			// 
			// var colorInfo = new Uint8Array([255, 255, 255, 255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
			var colors = new Uint8Array([255, 255, 255, 255, 220, 220, 220, 255, 220, 220, 220, 255, 255, 255, 255, 255]);
			var texture = new Texture(colors, null, 2, 2);
			texture.repeat.set(2.5, 2.5);
			texture.offset.set(0.25, 0);
			window.texture = texture;
			texture.minFilter = 'NearestNeighborNoMipMaps';
			texture.magFilter = 'NearestNeighbor';
			texture.generateMipmaps = false;
			floorMat.setTexture('DIFFUSE_MAP', texture);
			// floorMat.setTexture('NORMAL_MAP', normal);

			window.material = material;
			var quadEnt = EntityUtils.createTypicalEntity(goo.world, ShapeCreator.createQuad(1000, 1000, 100, 100), floorMat, Vector3.ZERO);
			quadEnt.transformComponent.setTranslation(0, -0.001, 0);
			quadEnt.transformComponent.setRotation(-Math.PI / 2, 0, 0);
			quadEnt.addToWorld();


			var floorMat2 = Material.createMaterial(ShaderLib.uber);
			// var colors = new Uint8Array([255, 255, 255, 255, 128, 128, 128, 255, 128, 128, 128, 255, 255, 255, 255, 255]);
			texture = new Texture(colors, null, 2, 2);
			// texture.repeat.set(40, 20);
			texture.repeat.set(10, 5);
			texture.offset.set(0, 0);
			texture.minFilter = 'NearestNeighborNoMipMaps';
			texture.magFilter = 'NearestNeighbor';
			texture.generateMipmaps = false;
			floorMat2.setTexture('DIFFUSE_MAP', texture);

			// var colors = new Uint8Array([
			// 	128, 127, 255, 255,
			// 	128, 127, 128, 255,
			// 	128, 127, 128, 255,
			// 	128, 127, 255, 255
			// ]);
			// var normal = new Texture(colors, null, 2, 2);
			// normal.repeat.set(10, 5);
			// normal.offset.set(0, 0);			
			// normal.minFilter = 'NearestNeighborNoMipMaps';
			// normal.magFilter = 'NearestNeighbor';
			// normal.generateMipmaps = false;			
			// // floorMat2.setTexture('DIFFUSE_MAP', normal);

			// floorMat2.uniforms.materialAmbient = [0.05, 0.05, 0.1, 1.0];
			// floorMat2.uniforms.materialDiffuse = [0.05, 0.1, 0.3, 1.0];
			floorMat2.uniforms.materialDiffuse = [0.8, 0.8, 0.8, 1];
			// floorMat2.uniforms.materialSpecular = [0.05, 0.1, 1, 1.0];
			floorMat2.uniforms.materialSpecular = [0.05, 0.1, 1, 1.0];

			var c = ColorUtil.hexToArray(0xA67BB6);
			new TWEEN.Tween({
				r: floorMat2.uniforms.materialDiffuse[0],
				g: floorMat2.uniforms.materialDiffuse[1],
				b: floorMat2.uniforms.materialDiffuse[2]
			}).to({
				r: c[0],
				g: c[1],
				b: c[2]
			}, 2000).delay(3500)
			// .easing(TWEEN.Easing.Exponential.Out)
			.onUpdate(function() {
				floorMat2.uniforms.materialDiffuse = [this.r, this.g, this.b, 1];
			})
				.start();

			// floorMat2.setTexture('NORMAL_MAP', normal);

			window.texture = texture;
			window.mat = floorMat2;
			var mazeFloor = EntityUtils.createTypicalEntity(goo.world, ShapeCreator.createQuad(level.map.width * 2, level.map.height * 2, 1, 1), floorMat2, Vector3.ZERO);
			mazeFloor.transformComponent.setTranslation(level.map.width - 5, 0, level.map.height - 4);
			mazeFloor.transformComponent.setRotation(-Math.PI / 2, 0, 0);
			mazeFloor.addToWorld();
		}
		createFloor();


		// function initQuad() {
		// 	var quad = loader.getCachedObjectForRef("entities/Quad.entity");
		// 	quad.setComponent(new AmmoComponent({
		// 		mass: 0,
		// 		// 	useWorldTransform: true,
		// 		// 	// showBounds: true
		// 	}));
		// 	var localInertia = new Ammo.btVector3(0, 0, 0);
		// 	// if (isDynamic)
		// 	// shape.calculateLocalInertia(mass, localInertia);
		// 	var quadShape = new Ammo.btBoxShape(new btVector3(5000, 1, 5000));
		// 	var groundTransform = new Ammo.btTransform();
		// 	groundTransform.setIdentity();
		// 	var myMotionState = new Ammo.btDefaultMotionState(groundTransform);
		// 	var cInfo = new Ammo.btRigidBodyConstructionInfo(0, myMotionState, quadShape, localInertia);
		// 	// goo.world.process();
		// 	// quad.ammoComponent.body.setCollisionShape(quadShape);
		// 	quad.ammoComponent.body = new Ammo.btRigidBody(cInfo);
		// 	ammoSystem.ammoWorld.addRigidBody(quad.ammoComponent.body);

		// 	// quad.meshRendererComponent.hidden = true;
		// }


		// var cannonComponent = new CannonjsComponent(ShapeCreator.createQuad(1000, 1000, 100, 100), {
		// 	mass: 0
		// });
		// quad.setComponent(cannonComponent);


		// var meshData = ShapeCreator.createQuad(10000, 10000, 10, 10);
		// var waterEntity = EntityUtils.createTypicalEntity(goo.world, meshData);
		// waterEntity.meshRendererComponent.isPickable = false;
		// var material = Material.createMaterial(ShaderLib.simple, 'mat');
		// window.material = material;
		// waterEntity.meshRendererComponent.materials.push(material);
		// waterEntity.transformComponent.transform.setRotationXYZ(-Math.PI / 2, 0, 0);
		// waterEntity.transformComponent.transform.translation.set(0, 0.01, 0);
		// waterEntity.addToWorld();

		// var waterRenderer = new FlatWaterRenderer({
		// 	useRefraction: false
		// 	// normalsUrl: '../../resources/waternormals3.png'
		// });
		// goo.renderSystem.preRenderers.push(waterRenderer);
		// // waterRenderer.setWaterEntity(quad);
		// waterRenderer.setWaterEntity(waterEntity);

		var light = loader.getCachedObjectForRef("entities/DirectionalLight.entity");
		// light.setComponent(new LightDebugComponent());
		window.light = light;

		var orcEntity = loader.getCachedObjectForRef("mini_knight_split/entities/RootNode.entity")
		var orcMaterial = loader.getCachedObjectForRef("mini_knight_split/materials/unnamed.material");

		function addEnemy(pos, dir) {
			var orc = EntityUtils.clone(goo.world, orcEntity);
			orc.transformComponent.setTranslation(pos);
			// orc.transformComponent.setTranslation(13, 0, 9);
			// orc.transformComponent.setRotation(0, Math.PI / 2, 0);
			// orc.transformComponent.setRotation(0, -Math.PI / 2, 0);
			// 
			for (var i in orc.transformComponent.children) {
				var e = orc.transformComponent.children[i].entity;
				e.meshRendererComponent.materials = [orcMaterial];
			}

			var sphereBounds = new BoundingSphere();
			sphereBounds.radius = 1.2;
			orc.setComponent(new CollisionComponent(orc, sphereBounds));
			orc.setComponent(new Enemy(orc));
			if (dir)
				orc.enemy.direction.copy(dir);
			orc.setComponent(new HealthComponent(4));
			orc.addToWorld();
			orc.tag = "enemy";
			orc.hitMask = 1;

			return orc;
		}

		addEnemy(new Vector3(16, 0, 7), new Vector3(0, 0, 1));
		addEnemy(new Vector3(22, 0, 3), new Vector3(0, 0, -1));
		addEnemy(new Vector3(12, 0, 1), new Vector3(1, 0, 0));


		var knight = loader.getCachedObjectForRef("mini_knight_split/entities/RootNode.entity");
		knight.tag = "player";
		var sphereBounds = new BoundingSphere();
		// sphereBounds.radius = 2;
		sphereBounds.radius = 1;
		knight.setComponent(new CollisionComponent(knight, sphereBounds));

		var howlerComponent = new HowlerComponent();
		// howlerComponent.addSound(new window.Howl({urls: ['res/sounds/walk.wav']}));
		// howlerComponent.addSound(new window.Howl({urls: ['res/sounds/door.wav']}));
		// howlerComponent.addSound(new window.Howl({urls: ['res/sounds/key.wav']}));
		howlerComponent.sounds = {
			walk: new window.Howl({
				urls: ['res/audio/walk.wav']
			}),
			door: new window.Howl({
				urls: ['res/audio/door.wav']
			}),
			key: new window.Howl({
				urls: ['res/audio/key.wav']
			}),
			level: new window.Howl({
				urls: ['res/audio/level.wav']
			})
		}
		knight.setComponent(howlerComponent);

		// knight.transformComponent.setTranslation(31, 0, 5);

		knight.collisionComponent.onCollisionStay = function(other) {
			if (other.tag == "wall" || other.tag == "door") {
				var v = Vector3.sub(other.transformComponent.transform.translation, knight.transformComponent.transform.translation);
				v.y = 0;
				var d = v.length() - other.collisionComponent.bounds.radius - knight.collisionComponent.bounds.radius;
				// knight.transformComponent.transform.translation.add(v.mul(d));				
				knight.transformComponent.transform.translation.add(v.mul(d * World.tpf));
				// knight.transformComponent.transform.translation.add(v.mul(d));
				knight.transformComponent.setUpdated();
			}

			if (other.tag == "enemy") {
				var v = Vector3.sub(other.transformComponent.transform.translation, knight.transformComponent.transform.translation);
				v.y = 0;
				var d = v.length() - other.collisionComponent.bounds.radius - knight.collisionComponent.bounds.radius;
				knight.transformComponent.transform.translation.add(v.mul(d * World.tpf * Math.exp(1)));
				// knight.transformComponent.transform.translation.add(v.mul(d * World.tpf));				
				// knight.transformComponent.transform.translation.add(v.mul(d));
				knight.transformComponent.setUpdated();

				var s = knight.animationComponent.layers[0].getCurrentState();

				if (s && s.name == 'hit')
					s.onFinished = function() {
						console.log("finished");
						other.healthComponent.hp -= 1;
						if (other.healthComponent.hp > 0)
							other.animationComponent.transitionTo("hurt");
						knight.animationComponent.transitionTo("idle");
						knight.scriptComponent.scripts[0].lastAnim = 'idle';
						delete s.onFinished;
						return true;
					}

				// console.log(s);
				// if (s && s.name == "hit") {
				if (false) {
					other.healthComponent.hp -= 1;
					if (other.healthComponent.hp > 0)
						other.animationComponent.transitionTo("hurt");
				}
			}
		}

		knight.collisionComponent.onCollision = function(other) {
			if (other.tag == undefined) return;
			console.log(other.tag);

			if (other.tip) {
				if (false) {
					$("#tutorial p").html(other.tip);
					goo.doRender = goo.doProcess = false;
					_.delay(function() {
						goo.doRender = goo.doProcess = true;
					}, 3000);
					$("#tutorial").hide().fadeIn().delay(3250).fadeOut(750);
					$("#tutorial p").hide().delay(500).fadeIn().delay(2000).fadeOut(500);
				}
			}

			if (other.tag == "weapon") {
				other.removeFromWorld();
				axe.meshRendererComponent.hidden = false;
			}

			if (other.tag == "enemy") {
				// var v = Vector3.sub(other.transformComponent.transform.translation, knight.transformComponent.transform.translation);
				// var d = v.length() - other.collisionComponent.bounds.radius - knight.collisionComponent.bounds.radius;
				// console.log(d);
				// knight.transformComponent.transform.translation.add(v.mul(d));
				// knight.transformComponent.setUpdated();
				// knight.animationComponent.transitionTo("hurt");
				console.log("ouch!");
			}

			if (other.tag == "key") {
				console.log("found a key!");
				console.log(other);


				_.delay(function() {
					knight.howlerComponent.playSound('key');
				}, 250);

				var light = other.transformComponent.children[1].entity;
				new TWEEN.Tween(light.lightComponent.light).to({
					intensity: 0
				}, 250).start();

				new TWEEN.Tween(other.transformComponent.transform.scale).to({
					x: 0,
					y: 0,
					z: 0
				}, 250)
					.easing(TWEEN.Easing.Elastic.Out)
					.onComplete(function() {
						other.removeFromWorld(true);
					}).start();

				this.entity.inventoryComponent.items.push(other);
				// other.removeFromWorld(true);

				/*
			new TWEEN.Tween({
				s: 0.2
			}).to({
				s: 0
			}, 750).delay(200)
				.easing(TWEEN.Easing.Cubic.InOut)
				.onUpdate(function() {
					other.transformComponent.setScale(this.s, this.s, this.s);
				})
				.onComplete(function() {
					other.removeFromWorld(true);
				})
				.start();
				*/
			} else
			if (other.tag == "portal" && Game.state == Game.States.LEVEL_READY) {
				console.log("collision " + other.name);
				Game.state = Game.States.LEVEL_END;
				console.log(Game.state);

				knight.howlerComponent.playSound('level');

				_.each(level.blocks, function(b, i) {
					if (!b) return;
					(function(b, i) {
						new TWEEN.Tween({
							y: 1
						}).to({
							y: -1
						}, 500).delay(20 * i)
							.easing(TWEEN.Easing.Bounce.Out)
							.onUpdate(function() {
								b.transformComponent.transform.translation.y = this.y;
								b.transformComponent.setUpdated();
							}).onComplete(function() {
								b.removeFromWorld();
							})
							.start();
					})(b, i);
				});



				setTimeout(function() {
					console.log(Game.state);
					console.log("build level");
					level = LEVELS[1];
					level.buildMap(goo, loader);
					level.showTitle();

					// Game.state = Game.States.LEVEL_READY;
				}, 500 + 20 * level.blocks.length);
				delete other.tag;
			}



		};

		window.knight = knight;


		var knightTop = [
			loader.getCachedObjectForRef("mini_knight_split/entities/body_0.entity"),
			loader.getCachedObjectForRef("mini_knight_split/entities/axe_0.entity"),
			loader.getCachedObjectForRef("mini_knight_split/entities/back_0.entity"),
			loader.getCachedObjectForRef("mini_knight_split/entities/cap_0.entity")
		];

		var legs = loader.getCachedObjectForRef("mini_knight_split/entities/legs_0.entity");

		// var disk = loader.getCachedObjectForRef("entities/Disk_1.entity");
		// var pointLight = loader.getCachedObjectForRef("entities/PointLight_0.entity");

		knight.setComponent(new InventoryComponent());

		goo.world.setSystem(new DoorSystem(knight.inventoryComponent));

		var t = 0;


		function blink(entity) {
			var c = hit.entity.meshRendererComponent.materials[0].uniforms.materialDiffuse;
			new TWEEN.Tween({
				r: c[0],
				g: c[1],
				b: c[2]
			}).to({
				r: 1,
				g: 1,
				b: 1,
			}, 25)
				.easing(TWEEN.Easing.Sinusoidal.InOut)
				.onUpdate(function() {
					entity.meshRendererComponent.materials[0].uniforms.materialDiffuse = [this.r, this.g, this.b, 1];
				}).onComplete(function() {
					entity.meshRendererComponent.materials[0].uniforms.materialDiffuse = c;
				})
				.yoyo(true)
				.repeat(4)
				.start();
		}

		function openDoor(door) {
			if (door.doorComponent.opening) return;
			console.log("door");

			_.delay(function() {
				knight.howlerComponent.playSound('door');
			}, 750);

			door.doorComponent.opening = true;
			// new TWEEN.Tween(door.transformComponent.transform.translation).to({
			new TWEEN.Tween(door.transformComponent.transform.translation).to({
				y: -1.0001
			}, 900)
				.easing(TWEEN.Easing.Bounce.Out)
				.onUpdate(function() {
					// door.transformComponent.setTranslation(this);
					// door.transformComponent.transform.translation.y = this.y;
					door.transformComponent.setUpdated();
				})
				.onComplete(function() {
					door.doorComponent.open = true;
					door.hitMask = 0;
					// door.removeFromWorld();
				})
				.start();
		}


		knight.setComponent(new ScriptComponent({
			// forwardSpeed: 0.15,
			forwardSpeed: 0.075,
			// forwardSpeed: 0.05,
			runningSpeed: 1,
			rotationSpeed: 10,
			// accel: Math.exp(-0.5),
			// accel: 1,
			accel: 0.1,
			forward: new Vector3(),
			speed: 0,
			ray: new Ray(),
			lastStep: 0,
			lastAnim: '',
			run: function PlayerScript(entity) {
				if (!axe.meshRendererComponent.hidden && Input.keys[KeyEvent.DOM_VK_SPACE]) {
					knight.animationComponent.transitionTo("hit");
					// knight.animationComponent.layers[0].setCurrentStateByName("hit");
				}


				var dir = new Vector3();
				dir.z += Input.keys[87] ? -1 : 0;
				dir.z += Input.keys[83] ? 1 : 0;
				dir.x += Input.keys[65] ? -1 : 0;
				dir.x += Input.keys[68] ? 1 : 0;
				dir = dir.normalize();

				var currentState = entity.animationComponent.layers[0]._currentState;
				// console.log([currentState, currentState ? currentState.name : null]);
				// console.log(currentState ? currentState.name : null);
				// if (currentState != null && currentState.name != "hit") 

				// if(this.lastAnim != currentState.name)
				// console.log([this.lastAnim, currentState.name]);

				if (currentState && currentState.name == 'hit') {
					var clip = currentState._sourceTree._clipInstance;
					clip._loopCount = 1;
					this.lastAnim = 'hit';
				}

				// console.log([currentState ? currentState.name : currentState, this.lastAnim]);

				if (null == currentState) {
					entity.animationComponent.layers[0].setCurrentStateByName("hit");
					entity.animationComponent.transitionTo('idle');
					this.lastAnim = 'idle';
				}

				if (this.lastAnim != 'hit') {
					// var anim = currentState ? currentState.name : 'idle';
					// anim = dir.length() > 0 ? "walk" : anim;
					var anim = dir.length() > 0 ? "walk" : "idle";
					// anim = this.speed < -this.runningSpeed ? "run" : anim;


					entity.animationComponent.transitionTo(anim);
					// entity.animationComponent.layers[s0].setCurrentStateByName(anim);
					this.lastAnim = anim;
				} else {
					return;
				}

				var transform = entity.transformComponent.transform;
				var pos = transform.translation;

				var topDir = new Vector3();
				topDir.z += Input.keys[KeyEvent.DOM_VK_UP] ? -1 : 0;
				topDir.z += Input.keys[KeyEvent.DOM_VK_DOWN] ? 1 : 0;
				topDir.x += Input.keys[KeyEvent.DOM_VK_LEFT] ? -1 : 0;
				topDir.x += Input.keys[KeyEvent.DOM_VK_RIGHT] ? 1 : 0;
				topDir.normalize();

				// if(Input.keys[KeyEvent.DOM_VK_SHIFT])
				// dir = topDir;

				if (topDir.length() == 0)
					topDir = dir;

				var f = new Vector3();
				legs.transformComponent.transform.applyForwardVector(Vector3.UNIT_Z, f);
				f = f.mul(-1).lerp(dir, this.rotationSpeed * World.tpf);
				f = f.normalize();



				var topForward = new Vector3();
				knightTop[0].transformComponent.transform.applyForwardVector(Vector3.UNIT_Z, topForward);
				// topForward = topForward.mul(-1).lerp(topDir, this.rotationSpeed * World.tpf);
				topForward = topForward.mul(-1).lerp(topDir, 0.85 * this.rotationSpeed * World.tpf);
				topForward.normalize();

				if (Math.abs(this.speed) > 0.01 && (World.time - this.lastStep) > 0.6) {
					entity.howlerComponent.playSound('walk');
					this.lastStep = World.time;
				}
				// var p = new Vector3();
				// p.x = pos.x;
				// p.y = 0.5;
				// p.z = pos.z;
				// this.ray.origin.copy(p);
				// this.ray.origin = p;
				this.ray.origin.set(pos.x, 1, pos.z);
				// this.ray.origin.copy(transform.translation);
				// this.ray.origin.z += 1.0;
				// this.ray.direction = Vector3.UNIT_Z;
				// this.ray.direction = new Vector3(0, 0, -1);
				// this.ray.direction = Vector3.mul(topDir, -1);

				var rayDir = new Vector3();
				legs.transformComponent.transform.applyForwardVector(Vector3.UNIT_Z, rayDir);
				// rayDir = Vector3.mul(rayDir, -1);
				// this.ray.direction.copy(dir);
				this.ray.direction.copy(rayDir);
				this.ray.distance = 1;

				var rayDir = new Vector3();
				if (Input.keys[KeyEvent.DOM_VK_SHIFT])
					rayDir.copy(Vector3.mul(dir, -1));
				else
					legs.transformComponent.transform.applyForwardVector(Vector3.UNIT_Z, rayDir);

				this.ray.direction.copy(rayDir);
				this.ray.distance = 1;
				var hit = castRay(this.ray, 0x1);
				if (hit) {
					var n = new Vector3(hit.normal.x, 0, hit.normal.z);

					if ((hit.entity.hitMask & 3) == 3) {
						openDoor(hit.entity);
					}


					// console.log(hit);
					// console.log(hit.normal.toString());
					// var n = hit.normal.clone();

					// var p = new Plane(n);
					// var r = new Vector3();
					// p.reflectVector(f, r);
					// f.copy(r);
					// this.speed *= 0.5;

					if (hit.distance < this.ray.distance)
						pos.sub(Vector3.mul(n, hit.distance - this.ray.distance));

				}


				if (!Input.keys[KeyEvent.DOM_VK_SHIFT]) {
					for (var i in knightTop) {
						var kt = knightTop[i].transformComponent.transform;
						kt.lookAt(Vector3.add(kt.translation, topForward), Vector3.UNIT_Y);
						knightTop[i].transformComponent.setUpdated();
					}

					if (dir.length() != 0) {
						// transform.lookAt(Vector3.add(pos, dir), Vector3.UNIT_Y);
						// transform.lookAt(Vector3.add(pos, f), Vector3.UNIT_Y);
						// legs.transformComponent.transform.lookAt(Vector3.add(pos, f), Vector3.UNIT_Y);
						legs.transformComponent.transform.lookAt(f, Vector3.UNIT_Y);
						legs.transformComponent.setUpdated();
					}
				}

				if (dir.length() == 0)
					this.speed *= 1 - Math.exp(2) * World.tpf;
				else
				// this.speed = -this.forwardSpeed * World.tpf;			
					this.speed = Math.max(-this.forwardSpeed, this.speed - this.accel * World.tpf);

				// pos.add(dir.mul(this.speed))
				// pos.add(f.mul(this.speed));

				if (Input.keys[KeyEvent.DOM_VK_SHIFT]) {
					pos.add(dir.mul(this.speed));
				} else {
					pos.add(f.mul(this.speed));
				}
				entity.transformComponent.setUpdated();


				// var b = knight.transformComponent.children[0].entity.ammoComponent.body;
				// b.setLinearVelocity(new Ammo.btVector3(dir.x * this.speed, 0, dir.z * this.speed));

				// if (disk) {
				// 	disk.transformComponent.transform.translation = Vector3.add(pos, new Vector3(0, 0.01, 0));
				// 	// disk.transformComponent.transform.rotation.rotateZ(-World.tpf);
				// 	var m1 = new Matrix3x3();
				// 	// var euler = transform.rotation.toAngles();
				// 	var euler = knightTop[0].transformComponent.transform.rotation.toAngles();
				// 	m1.rotateX(-90 * MathUtils.DEG_TO_RAD);
				// 	m1.rotateZ(euler.y);
				// 	m1.rotateZ(transform.rotation.toAngles().z);
				// 	disk.transformComponent.transform.rotation = m1;
				// 	disk.transformComponent.setUpdated();
				// }

				// var pl = Vector3.add(pos, new Vector3(0, 45, 0));
				// // pointLight.transformComponent.transform.translation = Vector3.add(pos, new Vector3(r * Math.cos(t), 45, r * Math.sin(t) + r));
				// pointLight.transformComponent.transform.translation.lerp(pl, Math.exp(-1) * World.tpf);
				// pointLight.transformComponent.setUpdated();
				// 

			}
		}));



		var toolCam = loader.getCachedObjectForRef('entities/DefaultToolCamera.entity');
		if (toolCam)
			toolCam.removeFromWorld();

		var camEntity = loader.getCachedObjectForRef("entities/Camera.entity");
		window.cam = camEntity;



		function setupCamera() {
			var camSettings = {
				offset: new Vector3(0, 12, -12),
				smoothing: 0.1
			};

			var tween = new TWEEN.Tween(camSettings)
				.to({
					smoothing: 2
				}, 8000)
				.easing(TWEEN.Easing.Cubic.InOut)
				.start();

			/*
				var camGui = gui.addFolder('Camera');
				camGui.add(camSettings.offset, 'y', 0, 15);
				camGui.add(camSettings.offset, 'z', -15, 0);
				camGui.add(camSettings, 'smoothing', 0, 10);
				camGui.open();
			*/

			camEntity.transformComponent.setTranslation(0, 100, -100);

			// var camEntity = loader.getCachedObjectForRef("entities/Camera_0.entity");
			camEntity.setComponent(new ScriptComponent({
				target: knight,
				run: function(entity) {
					// if (!this.target) return;

					var pos = this.target.transformComponent.transform.translation.clone();
					// var cameraPos = entity.transformComponent.transform.translation;
					// cameraPos.x += (pos.x - cameraPos.x) * 0.2;
					// cameraPos.y += (pos.y - cameraPos.y) * 0.2 + 0.2; // have the camera 0.2 units above the cube
					// cameraPos.z += (pos.z - cameraPos.z) * 0.2 - 1;

					// var dir = pos.clone();
					// dir.sub(entity.transformComponent.transform.translation);

					// var p = new Vector3(0, 5, -7);
					// var p = new Vector3(0, 60, -75);
					// this.target.transformComponent.transform.applyForwardVector(p, p);

					var camPos = new Vector3(entity.transformComponent.transform.translation);
					var tpos = Vector3.add(pos, camSettings.offset);
					// entity.transformComponent.transform.translation = Vector3.add(pos, p);
					// entity.transformComponent.transform.translation = camPos.lerp(tpos, Math.exp(-1) * World.tpf);
					var d = Vector3.distance(camPos, pos) / camSettings.offset.length();
					// var d = 1;
					entity.transformComponent.transform.translation = camPos.lerp(tpos, d * camSettings.smoothing * World.tpf);
					// entity.transformComponent.transform.translation.copy(tpos);
					entity.transformComponent.transform.lookAt(pos, Vector3.UNIT_Y);

					entity.transformComponent.setUpdated();
				}
			}));
		}
		setupCamera();


		var spotLightEntity = loader.getCachedObjectForRef("entities/SpotLight.entity");
		spotLightEntity.setComponent(new ScriptComponent({
			run: function(entity) {
				var p = knight.transformComponent.transform.translation.clone();
				var camPos = camEntity.transformComponent.transform.translation.clone();

				var camForward = new Vector3();
				camEntity.transformComponent.transform.applyForwardVector(Vector3.UNIT_Z, camForward);
				var up = Vector3.cross(camForward, Vector3.UNIT_X);
				entity.transformComponent.transform.lookAt(p, up);

				var p = new Vector3().copy(camPos);
				p.z = -p.z;
				// entity.transformComponent.transform.translation.copy(p);
				entity.transformComponent.transform.translation.lerp(p, World.tpf * 0.5);
				entity.transformComponent.setUpdated();
			}
		}));


		function addDirectionalLight() {
			var directionalLight = new DirectionalLight();
			directionalLight.color.data[0] = 0.2;
			directionalLight.color.data[1] = 0.9;
			directionalLight.color.data[2] = 0.0;
			directionalLight.intensity = 0.25;
			directionalLight.shadowSettings.size = 10;
			// directionalLight.direction = new Vector3(0, -1, 0);
			// directionalLight.translation = new Vector3(0, 10, 0);
			directionalLight.shadowCaster = true;

			var directionalLightEntity = goo.world.createEntity('directionalLight');
			directionalLightEntity.setComponent(new LightComponent(directionalLight));

			directionalLightEntity.lightComponent.light.direction.set(0, -1, 0);
			// directionalLightEntity.lightComponent.light.translation.set(0, 10, 0);

			directionalLightEntity.addToWorld();
			window.directionalLight = directionalLightEntity;

			if (gui) {
				var directionallightGui = gui.addFolder('Directional Light');
				var data = {
					color: [directionalLight.color.data[0] * 255, directionalLight.color.data[1] * 255, directionalLight.color.data[2] * 255]
				};
				var controller = directionallightGui.addColor(data, 'color');
				controller.onChange(function() {
					directionalLight.color.seta(data.color).div(255);
					directionalLight.changedColor = true;
				});
				var controller = directionallightGui.add(directionalLight, 'intensity', 0, 1);
				controller.onChange(function() {
					directionalLight.changedProperties = true;
				});
				directionallightGui.add(directionalLight, 'shadowCaster');

				directionallightGui.open();
			}
		}
		// addDirectionalLight();



	}

	return Game;
});