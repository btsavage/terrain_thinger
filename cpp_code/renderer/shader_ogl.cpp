#include "renderer/render_platform.h"
#include "renderer/renderstatemanager.h"

#include <stdio.h>

#include "shader_ogl.h"

ShaderOGL::~ShaderOGL()
{
	glDetachShader(m_iShaderId, m_iFsId);
	glDetachShader(m_iShaderId, m_iVsId);
	glDeleteProgram(m_iShaderId);
	glDeleteShader(m_iShaderId);

}

void ShaderOGL::Load(const char *pVs, const char *pPs)
{
	m_iVsId = glCreateShader(GL_VERTEX_SHADER);
	glShaderSource(m_iVsId,1,(const char**)&pVs,(const int32_t*)0);
	glCompileShader(m_iVsId);
	
	{
		GLint iret;
		glGetShaderiv(m_iVsId,GL_COMPILE_STATUS,&iret);
		GLint infoLen=0;
		glGetShaderiv(m_iVsId,GL_INFO_LOG_LENGTH,&infoLen);
		if(infoLen>1)
		{
			char* infoLog = (char*) malloc( sizeof(char) * infoLen );
			glGetShaderInfoLog(m_iVsId, infoLen, NULL, infoLog );
			printf( "%s\n", infoLog );
			free( infoLog );
		}
	}
	
	m_iFsId = glCreateShader(GL_FRAGMENT_SHADER);
	glShaderSource(m_iFsId, 1, (const char**) &pPs, (const int32_t*)0);
	glCompileShader(m_iFsId);
	
	{
		int32_t iret;
		glGetShaderiv( m_iFsId, GL_COMPILE_STATUS, & iret );
		int32_t infoLen = 0;
		glGetShaderiv ( m_iFsId, GL_INFO_LOG_LENGTH, &infoLen );
		
		if( infoLen > 1 )
		{
			char* infoLog = (char*) malloc( sizeof(char) * infoLen );
			glGetShaderInfoLog( m_iFsId, infoLen, NULL, infoLog );
			printf( "%s\n", infoLog );
			free( infoLog );
		}
		
		assert( iret == GL_TRUE );
	}
	
	m_iShaderId = glCreateProgram();
	glAttachShader(m_iShaderId, m_iVsId);
	glAttachShader(m_iShaderId, m_iFsId);
	glLinkProgram(m_iShaderId);
	
	{
		int32_t iret;
		glGetProgramiv( m_iShaderId, GL_LINK_STATUS, &iret );
		
		if(iret == GL_FALSE)
		{
			char errbuf[1<<16];
			GLsizei iactlen;
			glGetProgramInfoLog(m_iShaderId, 1<<16, &iactlen, errbuf );
			printf( "%s\n", errbuf );
		}
		assert( iret == GL_TRUE );
	}
	
	RSM->BindShader(this);
	
	
	m_iVertPosAttrib = glGetAttribLocation(m_iShaderId, "a_position");
	m_iVertColorAttrib = glGetAttribLocation(m_iShaderId, "a_color");
	m_iVertTexCoordAttrib = glGetAttribLocation(m_iShaderId, "a_uv");
	
	m_iTextureUniform = glGetUniformLocation (m_iShaderId, "s_texture" );
	m_iProjMtxUniform = glGetUniformLocation (m_iShaderId, "u_projmvw_matrix" );
}


void ShaderOGL::SetProjMtx(const glm::mat4 &mtx)
{
	glUniformMatrix4fv(m_iProjMtxUniform, 1, GL_FALSE, (GLfloat *)&mtx);
}


