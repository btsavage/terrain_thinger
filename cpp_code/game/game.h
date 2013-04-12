
class ShaderOGL;

class Game
{
public:
	Game();
	~Game();

	void SetScreenSize(int w, int h);
	
	void Update();
	void Render();

private:

	unsigned int testVbo;
	unsigned int numTestVerts;
	
	int m_iScreenWidth;
	int m_iScreenHeight;
	
	ShaderOGL *m_pTestShader;
};