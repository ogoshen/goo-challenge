define([
		'goo/entities/EntityUtils',
		'goo/shapes/ShapeCreator',
		'goo/renderer/TextureCreator',
		'goo/renderer/light/PointLight',
		'goo/entities/components/LightComponent',
		'goo/renderer/Material',
		'goo/renderer/shaders/ShaderLib',
		'js/rotatingBillboard',
	],
	function(
		EntityUtils,
		ShapeCreator,
		TextureCreator,
		PointLight,
		LightComponent,
		Material,
		ShaderLib,
		rotatingBillboard
	) {

		return {
			addPointLight: function(goo, pos, color, settings, parent) {
				var pointLight = new PointLight();
				pointLight.color.data = color;
				pointLight.range = 10;
				pointLight.intensity = 2;

				if (settings != undefined) {
					pointLight.range = settings.range;
					pointLight.intensity = settings.intensity;
				}

				var pointLightEntity = goo.world.createEntity('pointLight');
				pointLightEntity.setComponent(new LightComponent(pointLight));
				pointLightEntity.transformComponent.transform.translation.set(pos);
				// pointLightEntity.transformComponent.parent = parent;
				if (parent) {
					parent.attachChild(pointLightEntity.transformComponent);
				}
				pointLightEntity.addToWorld();

				return pointLight;
			},


			addHalo: function(goo, size, pos, color, parent) {
				size = size || 3;
				pos = pos || Vector3.ZERO;
				color = color || [1.0, 1.0, 0.5, 0.6];

				var quadMeshData = ShapeCreator.createQuad(size, size);
				var quadMaterial = Material.createMaterial(rotatingBillboard, 'FlareMaterial');
				// var quadMaterial = Material.createMaterial(ShaderLib.billboard, 'mat');
				var quadTexture = new TextureCreator().loadTexture2D('res/images/flare.jpg');
				quadTexture.wrapS = quadTexture.wrapT = "EdgeClamp";
				quadMaterial.setTexture('DIFFUSE_MAP', quadTexture);
				// quadMaterial.blendState.blending = 'AlphaBlending';
				quadMaterial.depthState.enabled = true;
				quadMaterial.depthState.write = false;
				quadMaterial.blendState.blending = 'AdditiveBlending';
				quadMaterial.renderQueue = 2001;

				var quadEntity = EntityUtils.createTypicalEntity(goo.world, quadMeshData, quadMaterial);
				quadEntity.meshRendererComponent.castShadows = false;
				quadEntity.meshRendererComponent.receiveShadows = false;

				var m0 = quadEntity.meshRendererComponent.materials[0];
				_.extend(quadMaterial.uniforms, m0.uniforms);

				// quadEntity.meshRendererComponent.materials = [m];

				quadMaterial.uniforms.color = color;
				goo.callbacksPreRender.push(function(tpf) {
					quadMaterial.uniforms.time = goo.world.time;
				});


				if (parent)
					parent.attachChild(quadEntity.transformComponent);
				quadEntity.transformComponent.transform.translation.set(pos);
				quadEntity.addToWorld();

				return quadEntity;
			}

		}

	});