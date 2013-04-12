#ifdef __APPLE__
	#include <OpenGL/gl.h>
	#include <Glut/glut.h>
#else
	#include <GL/gl.h>
	#include <GL/glut.h>
#endif

#include <cstdlib>

#define GLSL_PREFIX_PRECISION  "#version 120\n\
#define HIGHP\n\
#define MEDIUMP\n\
#define LOWP\n"



//#define GLM_PRECISION_HIGHP_FLOAT;
//#define GLM_FORCE_RADIANS
#include "glm/glm.hpp"
#include "glm/gtc/matrix_transform.hpp"