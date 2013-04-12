{
	"targets": [
		{
			"target_name": "terrainthinger",
			"product_name": "terrainthinger",
			"type": "executable",

			"sources": [
				"cpp_code/glut_client/main.cpp",
				"cpp_code/game/game.cpp",
				"cpp_code/game/game.h",
			],

			"include_dirs": [
				"cpp_code",
				"cpp_code/glm",
			],
			
			'link_settings': {
				'libraries': [
					'$(SDKROOT)/System/Library/Frameworks/OpenGL.framework',
					'$(SDKROOT)/System/Library/Frameworks/GLUT.framework',
				],
			},
		}
	]
}

