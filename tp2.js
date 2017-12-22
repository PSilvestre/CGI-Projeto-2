var gl;
var program;;

var currMproj = mat4();
var currMview = mat4();

var mNormalLoc;
var mProjLoc;
var mViewLoc;


var projectionDropdown;

var canvasWidth;
var canvasHeight;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    

    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    resizeWindow();

    cubeInit(gl);
    pyramidInit(gl);
    torusInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    coneInit(gl);

    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    	
	mViewLoc = gl.getUniformLocation(program, "mModelView");
	mProjLoc = gl.getUniformLocation(program, "mProjection");
    mNormalLoc = gl.getUniformLocation(program, "mNormals");

    var vertexInput = document.getElementById("vertSelect");
    var fragInput = document.getElementById("fragSelect");
    var shaderButton = document.getElementById("buttonShader");
    
    shaderButton.onclick = function(){
        fragmentShaderLocation = fragInput.value;
        vertexShaderLocation = vertexInput.value;
        program = initShaders(gl, vertexShaderLocation, fragmentShaderLocation);
        
        //obter loc das uniforms no novo programa
        mViewLoc = gl.getUniformLocation(program, "mModelView");
	    mProjLoc = gl.getUniformLocation(program, "mProjection");
        mNormalLoc = gl.getUniformLocation(program, "mNormals");
    }
    
    //culling toggle
    var cullCheckbox = document.getElementById("cullCheck");
    cullCheckbox.onchange = function (){
    if(cullCheckbox.checked)
        gl.enable(gl.CULL_FACE);
    else
        gl.disable(gl.CULL_FACE);
    }

    //Z buffer toggle
    var zBuffCheckbox = document.getElementById("zBuffCheck");
    zBuffCheckbox.onchange = function (){
    if(zBuffCheckbox.checked){
        gl.enable(gl.DEPTH_TEST);
    }
    else{
        gl.disable(gl.DEPTH_TEST);
    }
    }

    projectionDropdown = document.getElementById('selectProj');    
    document.getElementById("obliqua").style.display='none';
    document.getElementById("axonometrica").style.display='none';
    document.getElementById("perspetiva").style.display='none';
                          
    
    //Rezize da janela
    window.onresize = resizeWindow;

    function resizeWindow() {
        canvas.width = window.innerWidth * (2/3);
        canvas.height = window.innerHeight * (2/3);
        canvasWidth = canvas.width ;
        canvasHeight = canvas.height ;
        gl.viewport(0,0,canvasWidth,canvasHeight);
    }
    
    render();
}


//Funcao que escolhe a matriz de projecao correta.
function setProj(projN){
    var r = canvasWidth/canvasHeight;
    w = 1 + r;
    h = w/r;
    orthoOut =ortho( -w/2, w/2, -h/2, h/2,-1,1);
    if(projN <= 3.0)
        currMproj = orthoOut;
    else
        currMproj = mult(orthoOut,currMproj);
}

function show_hidden(projection) {
    document.getElementById("obliqua").style.display='none';
    document.getElementById("axonometrica").style.display='none';
    document.getElementById("perspetiva").style.display='none';
    if(projection == 3.0){
         //Projeção Axonométrica
        document.getElementById("axonometrica").style.display='block';
    }
    else if(projection == 4.0){
        //Projeção Oblíqua
        document.getElementById("obliqua").style.display='block';
    }
    else if(projection == 5.0){
        //Projeção Perspeti
        document.getElementById("perspetiva").style.display='block';
    }
}

function alcadoPrinc() {
    currMview = mat4();
}


function alcadoLEsq() {
    currMview = rotateY(90);
}

function planta() {
    currMview = rotateX(90);
}

function axonometrica(t, g) {
    currMview = mult(rotateX(g),rotateY(t));
}

//Projecoes
function obliqua(l, a) {
    currMview = mat4();
    currMproj = mat4(1.0, 0.0, -l * Math.cos(radians(a)), 0.0,
                    0.0, 1.0, -l * Math.sin(radians(a)), 0.0,
                    0.0, 0.0, 1.0, 0.0,
                    0.0, 0.0, 0.0, 1.0);
}

function perspetiva(d){
    currMview = mat4();
    currMproj = mat4(1.0, 0.0, 0.0, 0.0,
                     0.0, 1.0, 0.0, 0.0,
                     0.0, 0.0, 1.0, 0.0,
                     0.0, 0.0, -1.0/d, 1.0); 
}

function drawShape(shape){
    var render = document.querySelector('input[name=render]:checked').id;
    switch(shape) {
        case 'shapeCube':
            if(render == 'renderFill')
                cubeDrawFilled(gl, program);    
            else
                cubeDrawWireFrame(gl, program);
            break;
        case 'shapePyramid':
            if(render == 'renderFill')
                 pyramidDrawFilled(gl, program);
            else
                pyramidDrawWireFrame(gl, program);
            break;
        case 'shapeTorus':
            if(render == 'renderFill')
                torusDrawFilled(gl, program);    
            else
                torusDrawWireFrame(gl, program);
            break;
        case 'shapeCylinder':
            if(render == 'renderFill')
                cylinderDrawFilled(gl, program);
            else
                cylinderDrawWireFrame(gl, program);
            break;
        case 'shapeSphere':
            if(render == 'renderFill')
                sphereDrawFilled(gl, program);
            else
                sphereDrawWireFrame(gl, program);
            break;
        case 'shapeCone':
            if(render == 'renderFill')
                coneDrawFilled(gl, program);    
            else
                coneDrawWireFrame(gl, program);
    }
}

function chooseView() {
        var projection = parseFloat(projectionDropdown.value);
        switch(projection) {
            case 0.0:
                //Alçado Principal
                alcadoPrinc();
                break;
            case 1.0:
                //Alçado Lateral Esquerdo
                alcadoLEsq();          
                break;
            case 2.0: 
                //Planta
                planta();
                break;
            case 3.0: 
                //Projeção Axonométrica
                axonometrica(document.getElementById("axonometricaT").value,document.getElementById("axonometricaG").value);
                break;
            case 4.0:
                //Projeção Oblíqua
                obliqua(document.getElementById("obliquaL").value, document.getElementById("obliquaA").value);
                break;
            case 5.0:
                //Projeção Perspetiva
            perspetiva(document.getElementById("perspetivad").value);
        }
        setProj(projection);
        
        show_hidden(projection);
    }

function render() {
    if(document.getElementById("zBuffCheck").checked)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    else
        gl.clear(gl.COLOR_BUFFER_BIT);
    
    chooseView();

    var shape = document.querySelector('input[name=shape]:checked').id;
    drawShape(shape);
    
	gl.uniformMatrix4fv(mViewLoc,false,flatten(currMview)); 
    gl.uniformMatrix4fv(mProjLoc,false,flatten(currMproj));
    gl.uniformMatrix4fv(mNormalLoc,false,flatten(transpose(inverse(currMview))));
    
	requestAnimationFrame(render);
}
