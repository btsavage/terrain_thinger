#ifdef __APPLE__
	#include <OpenGL/gl.h>
	#include <Glut/glut.h>
#else
	#include <GL/gl.h>
	#include <GL/glut.h>
#endif

#include <stdio.h>


#include "game/game.h"

static int windowWidth = 1024;
static int windowHeight = 768;


Game *pGameInst = NULL;

static void Reshape(int width, int height)
{
	windowWidth = width;
	windowHeight = height;
}

static void Draw()
{
	float elapsedSecondsFrame = 1/30.0f;
	float elapsedMS = 30.0f;

	pGameInst->Update();

	glClearColor(1.0f, 0.0f, 0.0f, 1.0f);
	glClear(GL_COLOR_BUFFER_BIT);
	
	pGameInst->Render();

	glutSwapBuffers();
}


static void Special(int special, int crap, int morecrap)
{
	/*
	 switch (special) {
	 case GLUT_KEY_LEFT:
	 view_rot[1] += 5.0;
	 break;
	 case GLUT_KEY_RIGHT:
	 view_rot[1] -= 5.0;
	 break;
	 case GLUT_KEY_UP:
	 view_rot[0] += 5.0;
	 break;
	 case GLUT_KEY_DOWN:
	 view_rot[0] -= 5.0;
	 break;
	 case GLUT_KEY_F11:
	 glutFullScreen();
	 break;
	 }
	 */
}

static void MouseButton(int button, int state, int x, int y)
{
//	float pos[2] = {float(x),float(y)};
//	
//	if(button == 0)
//	{
//		if(state == 0)
//			InputAdaptor_BeginMultiTouch( pos, 1 );
//		else
//			InputAdaptor_EndTouch( pos, 1 );
//	}
}

static void MouseMotion(int x, int y)
{
//	float pos[2] = {float(x),float(y)};
//	InputAdaptor_MoveMultiTouch(pos, 1);
}

static void MousePassiveMotion(int x, int y)
{
}

static void Idle()
{
	static double lastFrame = -100;
	double t = glutGet(GLUT_ELAPSED_TIME);
	
	int frameRate = 60;
	float frameTime = 1000.0f / frameRate;
	
	if(t - lastFrame > frameTime)
	{
		glutPostRedisplay();
		lastFrame = t;
	}
}

static void Init()
{
	pGameInst = new Game;
}


int main(int argc, char *argv[])
{
	glutInit(&argc, argv);
	glutInitWindowSize(windowWidth, windowHeight);
	glutInitDisplayMode(GLUT_DOUBLE | GLUT_RGB | GLUT_STENCIL | GLUT_DEPTH | GLUT_MULTISAMPLE);
	
	glutCreateWindow("Spaceport");
	
	glutIdleFunc (Idle);
	glutReshapeFunc(Reshape);
	glutDisplayFunc(Draw);
	glutSpecialFunc(Special);
	glutMouseFunc(MouseButton);
	glutMotionFunc(MouseMotion);
	glutPassiveMotionFunc(MousePassiveMotion);
	
	Init();
	
	glutMainLoop();
	
	return 0;
}