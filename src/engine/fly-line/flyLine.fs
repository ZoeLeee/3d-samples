varying float vSize;
uniform vec3 uColor;

void main(){
    // 绘制点圆
    float d=distance(gl_PointCoord,vec2(.5));
    
    float strength=1.-(d*2.);
    
    if(d>.5){
        discard;
    }
    
    if(vSize>0.){
        gl_FragColor=vec4(uColor,strength);
    }
    else{
        gl_FragColor=vec4(0.);
    }
    
}

