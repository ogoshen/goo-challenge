define([
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/shaders/ShaderFragment'
], function(
	MeshData,
	Shader,
	ShaderFragment
) {
	return {
		attributes : {
			vertexPosition : MeshData.POSITION,
			vertexUV0 : MeshData.TEXCOORD0
		},
		uniforms : {
			viewProjectionMatrix : Shader.VIEW_PROJECTION_MATRIX,
			projectionMatrix: Shader.PROJECTION_MATRIX,
			worldMatrix : Shader.WORLD_MATRIX,
			diffuseMap : Shader.DIFFUSE_MAP,
			color: [1.0, 1.0, 1.0, 1.0],
			time: 0,
			speed: 0.5
		},
		vshader : [ //
		'attribute vec3 vertexPosition;', //
		'attribute vec2 vertexUV0;', //

		'uniform mat4 viewProjectionMatrix;',
		'uniform mat4 projectionMatrix;',
		'uniform mat4 worldMatrix;',//

		'uniform float time;',//
		'uniform float speed;',//

		'varying vec2 texCoord0;',//

		'void main(void) {', //
		'	texCoord0 = vertexUV0 - 0.5;',//
		'	float t = -time * speed;', //
		'	mat2 rot = mat2(', //
		'		cos(t), -sin(t),',//
		'		sin(t), cos(t)',//
		'	);', //
		'	texCoord0 = rot * texCoord0 + 0.5;', //
		'	gl_Position = viewProjectionMatrix * worldMatrix * vec4(0.0, 0.0, 0.0, 1.0) + projectionMatrix * vec4(vertexPosition.x, vertexPosition.y, 0.0, 0.0);', //
		'}'//
		].join('\n'),
		fshader : [//
		'precision mediump float;',//

		'uniform sampler2D diffuseMap;',//
		'uniform vec4 color;',//

		'varying vec2 texCoord0;',//

		'void main(void)',//
		'{',//
		' gl_FragColor = color * texture2D(diffuseMap, texCoord0);',
		'}'//
		].join('\n')
	};
});