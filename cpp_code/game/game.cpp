#include "game.h"


#include "renderer/shader_ogl.h"
#include "renderer/render_platform.h"
#include "renderer/math_helpers.h"

#include "renderer/renderstatemanager.h"



const char* test_fsh = GLSL_PREFIX_PRECISION "\n\
// pass through to fragment shader\n\
varying LOWP vec4 v_color;\n\
varying LOWP vec2 v_uv;\n\
\n\
void main()\n\
{\n\
gl_FragColor = v_color;\n\
}\n";

const char* test_vsh = GLSL_PREFIX_PRECISION "\n\
// vertex attributes\n\
attribute vec4 a_position;\n\
attribute vec4 a_color;\n\
\n\
// projection matrices\n\
uniform mat4 u_projmvw_matrix;\n\
uniform vec4 u_pick_color;\n\
\n\
// pass through to fragment shader\n\
varying  vec4 v_color;\n\
varying  vec2 v_uv;\n\
\n\
// render mode\n\
uniform int u_mode;\n\
const int VBO_RENDERMODE_COLORFILL = 1;\n\
const int VBO_RENDERMODE_TEXTURE = 2;\n\
const int VBO_RENDERMODE_PICK = 3;\n\
\n\
// color transform\n\
uniform bool u_has_color_xform;\n\
uniform bool u_has_color_add;\n\
uniform bool u_has_color_mul;\n\
uniform vec4 u_add_color;\n\
uniform vec4 u_mul_color;\n\
\n\
void main()\n\
{\n\
gl_Position	= u_projmvw_matrix * a_position;\n\
\n\
v_color = a_color;\n\
v_color.rgb *= min(v_color.a, 1.0);\n\
}\n";





struct testVert
{
	float x,y,z;
	unsigned int color;
};
testVert verts[3];

Game::Game()
{
	m_pTestShader = new ShaderOGL;
	m_pTestShader->Load(test_vsh, test_fsh);
	
	m_iScreenWidth = 0;
	m_iScreenHeight = 0;
	
	
	float size = 0.2f;
	
	verts[0].x = -size;
	verts[0].y = -size;
	verts[0].z = 0.0f;
	
	verts[1].x = size;
	verts[1].y = -size;
	verts[1].z = 0.0f;
	
	verts[2].x = 0.0f;
	verts[2].y = size;
	verts[2].z = 0.0f;
	
	verts[0].color = 0xff00ffff;
	verts[1].color = 0xffffff00;
	verts[2].color = 0xffff00ff;
	
	
	numTestVerts = 3;
	
	glGenBuffers(1, &testVbo);
	glBindBuffer(GL_ARRAY_BUFFER, testVbo);
	glBufferData(GL_ARRAY_BUFFER, numTestVerts * sizeof(testVert), verts, GL_STATIC_DRAW);
}

Game::~Game()
{
	delete m_pTestShader;
}

void Game::SetScreenSize(int w, int h)
{
	m_iScreenWidth = w;
	m_iScreenHeight = h;
}

void Game::Update()
{
	
}



void Game::Render()
{
	glClearColor(1.0f, 0.0f, 0.0f, 1.0f);
	glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

	static float rot;
	rot++;
	glm::mat4 proj = glm::perspective(60.0f, (float)m_iScreenWidth / m_iScreenHeight, 0.1f, 100.0f);
	glm::mat4 cam = glm::lookAt(glm::vec3(0.0f, 1.0f, -1.0f), glm::vec3(0.0f), glm::vec3(0.0f, 1.0f, 0.0f));
	glm::mat4 obj = glm::rotate(glm::mat4(), rot, glm::vec3(0.0f, 1.0f, 0.0f));
	
	glm::mat4 MVP = proj * cam * obj;
	
	RSM->BindShader(m_pTestShader);
	m_pTestShader->SetProjMtx(MVP);
	
	
	
	glBindBuffer(GL_ARRAY_BUFFER, testVbo);
	
	
	int vpos = m_pTestShader->GetVertPosAttrib();
	int vcolor = m_pTestShader->GetVertColorAttrib();

	glVertexAttribPointer ( vpos, 3, GL_FLOAT, GL_FALSE, sizeof(struct testVert), (void*)offsetof(struct testVert, x) );
	glEnableVertexAttribArray( vpos );

	glVertexAttribPointer ( vcolor, 4, GL_UNSIGNED_BYTE, GL_TRUE, sizeof(struct testVert), (void*)offsetof(struct testVert, color) );
	glEnableVertexAttribArray( vcolor );

	glDrawArrays(GL_TRIANGLES, 0, numTestVerts);
	

	glDisableVertexAttribArray(vpos);
	glDisableVertexAttribArray(vcolor);
}










