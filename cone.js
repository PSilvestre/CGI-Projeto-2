var cone_vertice = vec3(+0.0, +0.5, +0.0);

var cone_points = [];
var cone_normals = [];
var cone_faces = [];
var cone_edges = [];

var cone_points_buffer;
var cone_normals_buffer;
var cone_faces_buffer;
var cone_edges_buffer;

var CONE_N = 20;

function coneInit(gl) {
	coneBuild();
	coneUploadData(gl);
}

function coneBuild() {
	coneBuildVertices();
	coneBuildFaces();
	coneBuildEdges();
}

function coneUploadData(gl) {
    cone_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cone_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cone_points), gl.STATIC_DRAW);    
    
    cone_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cone_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cone_normals), gl.STATIC_DRAW);
    
    cone_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cone_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cone_faces), gl.STATIC_DRAW);
    
    cone_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cone_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cone_edges), gl.STATIC_DRAW);
}

function coneBuildCircle(offset) {//GOOD
	var o = 0;
	for (var i = 1; i < CONE_N; i++) {
		o = offset + i;
		
		coneAddTriangle( o + 1,offset, o);
	}

	coneAddTriangle( offset + 1 ,offset, o + 1);
}

function coneBuildEdges() {
	
	//radiais
	for (var i = 1; i <= CONE_N; i++) {
		coneAddEdge(0, i);
	}

	//circulo
	for (var i = 1; i < CONE_N; i++) {
		coneAddEdge(i, i + 1);
	}
	coneAddEdge(CONE_N, 1);


	//circulo mas com pontos da face
	for(var i = CONE_N + 1; i < 2 * CONE_N; i ++) {
		coneAddEdge(i, i+1);
	}
	coneAddEdge(2 * CONE_N, CONE_N + 1);

	//edges que sobem o cone, da "direita" e "esquerda" de cada face
	for(var i = CONE_N+1+1; i <= CONE_N*2; i++){
		coneAddEdge(i, i+CONE_N);
		coneAddEdge(i, i+CONE_N-1);
	}
	coneAddEdge(CONE_N+1,  CONE_N*2+1);
	coneAddEdge(CONE_N+1, 3*CONE_N);
	
}

function coneBuildFaces() {//GOOD
	coneBuildCircle(0);
	coneBuildSurface(CONE_N+1);
}

function coneBuildSurface(offset){
	for(var i = 0; i < CONE_N-1; i++){
		coneAddTriangle(i + offset +1,i + offset , 2*CONE_N + i + 1);
	}
	coneAddTriangle(offset, 2*CONE_N,  3*CONE_N);
}

function coneAddEdge(a, b) {//GOOD
	cone_edges.push(a);
	cone_edges.push(b);
}

function coneAddTriangle(a, b, c) {//GOOD
	cone_faces.push(a);
	cone_faces.push(b);
	cone_faces.push(c);
}



function coneBuildVertices() {
	
	var up = vec3(0, 1, 0);
	var down = vec3(0, -1, 0);
	
	var bottom = [];
	var face = [];
	var top = [];

	var bottom_normals = [];
	var face_normals = [];
	var top_normals = [];

    bottom.push(vec3(0, -0.5, 0));	

	bottom_normals.push(down);

    var segment = Math.PI * 2 / CONE_N;
    
    for (var i = 1; i <= CONE_N; i++) {
		  var x = Math.cos(i * segment) * 0.5;
		  var z = Math.sin(i * segment) * 0.5;
		  var p1 = vec3(x,-0.5, z);

		  var xn = Math.cos((i+1) * segment) * 0.5;
		  var zn = Math.sin((i+1) * segment) * 0.5;
		  var p2 = vec3(xn,-0.5, zn);

		  var xb = Math.cos((i-1) * segment) * 0.5;
		  var zb = Math.sin((i-1) * segment) * 0.5;
		  var p3 = vec3(xb,-0.5, zb);

		  bottom.push(p1);
		  bottom_normals.push(down);

		  var u = subtract(p2, p1);
		  var v = subtract(cone_vertice, p1);
		  var k = subtract(p3,p1);
		
		  var normal = cross(v,u);
		  var normalb = cross(k,v);
		


		  var pointNormal = add(normal, normalb);

		  //tornar unitário
		  var pointNormalAbs = Math.sqrt(Math.pow(pointNormal[0],2) +Math.pow(pointNormal[1],2) + Math.pow(pointNormal[2],2));
		  pointNormal[0] = pointNormal[0] / pointNormalAbs;
		  pointNormal[1] = pointNormal[1] / pointNormalAbs;
		  pointNormal[2] = pointNormal[2] / pointNormalAbs;

		 
		  face.push(p1);
		  face_normals.push(pointNormal);

		  top.push(cone_vertice);
		  top_normals.push(normal);
	}

	cone_points = bottom.concat(face).concat(top);
	cone_normals = bottom_normals.concat(face_normals).concat(top_normals);
}

function coneDrawFilled(gl, program) {
	gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, cone_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cone_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cone_faces_buffer);
    gl.drawElements(gl.TRIANGLES, cone_faces.length, gl.UNSIGNED_SHORT, 0);
}

function coneDrawWireFrame(gl, program) { 
	gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cone_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cone_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cone_edges_buffer);
    gl.drawElements(gl.LINES, cone_edges.length, gl.UNSIGNED_SHORT, 0);   
}