#ifndef __SHADER_OGLH__
#define __SHADER_OGL_H__

#include "renderer/render_platform.h"

class ShaderOGL
{
public:
	ShaderOGL()
	{
		m_iVsId = 0;
		m_iFsId = 0;
		m_iShaderId = 0;

		m_iVertPosAttrib = 0;
		m_iVertColorAttrib = 0;
		m_iVertTexCoordAttrib = 0;

		m_iTextureUniform = 0;
		m_iProjMtxUniform = 0;
	}
	
	virtual ~ShaderOGL();
	
	virtual void Load(const char *pVs, const char *pPs);
	
	void SetProjMtx(const glm::mat4 &mtx);
	
	int GetVertPosAttrib() {return m_iVertPosAttrib;}
	int GetVertColorAttrib() {return m_iVertColorAttrib;}
	int GetVertTexCoordAttrib() {return m_iVertTexCoordAttrib;}
	
	int GetProjMtxUniform() {return m_iProjMtxUniform;}
	int GetTextureUniform() {return m_iTextureUniform;}
	
	int GetShaderHandle() {return m_iShaderId;}
protected:
	int m_iVsId;
	int m_iFsId;
	int m_iShaderId;

	int m_iVertPosAttrib;
	int m_iVertColorAttrib;
	int m_iVertTexCoordAttrib;
	
	int m_iTextureUniform;
	int m_iProjMtxUniform;
};

#endif