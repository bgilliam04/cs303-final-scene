"use strict";

var mountainExample = function(){
var canvas;
var gl;

var positionsArray = [];
var colorsArray = [];

var storePast = {};
    
var radius = 4;
var  fovy =65.0;  // Field-of-view in Y direction angle (in degrees)           
var  aspect;       // Viewport aspect ratio                                     
var eye;


    
var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;
var theta = 0;
    
const at = vec3(0.0, 1.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available" );



    const element = document.getElementById("getcount");
    element.onchange = function() {
        const divLevel = element.value;
    
        // storing my previous values so that it generates one image for each level
        // i had to look up how to do this and found a stack overflow post with slice()
        if (storePast[divLevel]) {
            positionsArray = storePast[divLevel].positions.slice();
            colorsArray = storePast[divLevel].colors.slice();
        } else {
            positionsArray = [];
            colorsArray = [];
            divideRectangles(80, 80, divLevel);
    
            storePast[divLevel] = {
                positions: positionsArray.slice(),
                colors: colorsArray.slice()
            };
        }
    
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
    };
    
    divideRectangles(80, 80, element.value); 
    
    drawBranch(0.0, 0.0, 0.0, 45, 7, 0.5);

    //divideTriangle( vertices[0], vertices[1], vertices[2], 1, element.value);
    

    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect =  canvas.width/canvas.height;

    gl.clearColor(0.529, 0.808, 0.980, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    render();
}

function divideRectangles(rows, cols, heightScale) {
    positionsArray = [];
    colorsArray = [];


    // generate a grid that can be changed based on the number of rows and cols
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            // determining the 4 corners of each rectangle in the grid
            var x0 = -1 + 2 * col / cols;
            var x1 = -1 + 2 * (col + 1) / cols;
            var z0 = -1 + 2 * row / rows;
            var z1 = -1 + 2 * (row + 1) / rows;

            // random heights for the grass
            let y00 = Math.random() * heightScale;
            let y10 = Math.random() * heightScale;
            let y01 = Math.random() * heightScale;
            let y11 = Math.random() * heightScale;

            // creating 2 triangles from each rectangle
            positionsArray.push(vec4(x0, y00, z0, 1));
            positionsArray.push(vec4(x1, y10, z0, 1));
            positionsArray.push(vec4(x1, y11, z1, 1));


            positionsArray.push(vec4(x0, y00, z0, 1));
            positionsArray.push(vec4(x1, y11, z1, 1));
            positionsArray.push(vec4(x0, y01, z1, 1));

            // color gradient added so that it gets brighter towards the top of the grass
            let colorA = vec4(0.2 + y00, 0.4 + y00, 0.2, 1.0);
            let colorB = vec4(0.2 + y10, 0.4 + y10, 0.2, 1.0);
            let colorC = vec4(0.2 + y11, 0.4 + y11, 0.2, 1.0);
            let colorD = vec4(0.2 +  y01, 0.4 + y01, 0.2, 1.0);

            colorsArray.push(colorA, colorB, colorC);
            colorsArray.push(colorA, colorC, colorD);
        }
    }
}

function drawBranch(x, y, z, angle, depth, length) {
    if (depth === 0) return;

    // Convert angle to radians
    let rad = angle * (Math.PI / 180);

    // Calculate the end point
    let newX = x + length * Math.cos(rad);
    let newY = y + length;
    let newZ = z + length * Math.sin(rad);

    // Line segment as a skinny triangle to simulate thickness
    let a = vec4(x, y, z, 1);
    let b = vec4(newX, newY, newZ, 1);
    let c = vec4(x + 0.009, y, z + 0.009, 1); // small offset to simulate width

    positionsArray.push(a, b, c);
    positionsArray.push(b, c, a); // second triangle for same branch

    // Brown color for tree
    let color = vec4(0.55, 0.27, 0.07, 1.0);
    colorsArray.push(color, color, color);
    colorsArray.push(color, color, color);

    // Recurse with shorter length and different angles
    let newLength = length * 0.7;
    let newDepth = depth - 1;

    drawBranch(newX, newY, newZ, angle + 25, newDepth, newLength); // left
    drawBranch(newX, newY, newZ, angle - 25, newDepth, newLength); // right
}




/*function triangle(a, b, c)
{
    var color = vec4(1.000, 0.922, 0.804, 1.0);
    var color2 = vec4(0.545, 0.271, 0.075, 1.0);
    positionsArray.push(a, b, c);
    colorsArray.push(color2, color2, color);
}*/
    
/*function divideTriangle(a, b, c, factor, count)
{

    // check for end of recursion                                               

    if ( count === 0 ) {
        triangle(a, b, c);
    }
    else {

	//find midpoint
	var midpoint = mix(c, mix( a, b, 0.72 ), 0.5);

	midpoint = add(midpoint, vec4(0, factor*Math.random(), 0, 0));
	
        // three new triangles                                                  
        --count;
	var newFactor = factor *.95;
        divideTriangle( a, b, midpoint, newFactor*0.9, count );
        divideTriangle( c, a, midpoint, newFactor, count );
        divideTriangle( b, c, midpoint, newFactor, count );
    }
}*/

// slight change
    
var render = function(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.cos(theta), 1, radius*Math.sin(theta));
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, 2, 10);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, positionsArray.length);
    theta += 0.002;
    requestAnimationFrame(render);
}

}
mountainExample();