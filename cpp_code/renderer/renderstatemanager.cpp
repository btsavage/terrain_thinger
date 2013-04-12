#include "renderstatemanager.h"

#include "renderer/shader_ogl.h"

RenderStateManager *RenderStateManager::sm_pInstance = NULL;

void RenderStateManager::BindShader(ShaderOGL *p)
{
	if(p)
		glUseProgram(p->GetShaderHandle());
	else
		glUseProgram(0);
}