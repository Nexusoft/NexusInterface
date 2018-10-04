
export default function aadas(whichone) 
{ 
    if (whichone == 1){
    return `
        #ifdef GL_ES
        precision highp float;
        #endif

        uniform sampler2D _texture;
        uniform vec4 colorMod;

        varying vec2 vUv;

        void main(void)
        {
            vec3 c;
            //vec3 ghfb = vUv;
            vec4 Ca = texture2D(_texture, vUv);
            c = Ca.rgb * colorMod.rgb;
            
            float newR = Ca.r * 1.0;
            float newG = Ca.g * 0.2;
            float newB = Ca.b * 0.3;
            vec4 newVec = vec4(newR,newG,newB,1.0);
            gl_FragColor= Ca * colorMod;
        }
    `
    }
    else
    {
        return `varying vec2 vUv;

        void main()
        {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_Position = projectionMatrix * mvPosition;
        }`
    }
}