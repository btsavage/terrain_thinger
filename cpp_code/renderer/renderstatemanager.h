#ifndef __RENDERSTATEMANAGER_H__
#define __RENDERSTATEMANAGER_H__

#include "renderer/render_platform.h"

class ShaderOGL;

class RenderStateManager
{
public:
	RenderStateManager() {sm_pInstance = this;}
	~RenderStateManager() {sm_pInstance = NULL;}
	
	static void Init() {new RenderStateManager;}
	static void Terminate() {delete sm_pInstance;}
	static RenderStateManager *GetInstance() {return sm_pInstance;}
	
	void BindShader(ShaderOGL *p);
	
private:
	static RenderStateManager *sm_pInstance;
};

#define RSM RenderStateManager::GetInstance()

#endif