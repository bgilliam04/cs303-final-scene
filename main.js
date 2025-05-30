"use strict";
//https://lautarolobo.xyz/blog/use-javascript-and-html5-to-code-a-fractal-tree/
// used as a reference for an example of a fractal tree
//https://stackoverflow.com/questions/58354311/recursive-fractal-2d-tree-drawing-in-webgl
//https://stackoverflow.com/questions/13133574/creating-a-fractal-tree-in-opengl/13134379#13134379
//more explaination of how to draw a fractal tree in webgl
var mountainExample = function(){
var canvas;
var gl;

var positionsArray = [];
var colorsArray = [];

var radius = 4;
var  fovy =45.0;  // Field-of-view in Y direction angle (in degrees)           
var  aspect;       // Viewport aspect ratio                                     
var eye;

var grassVertexCount = 0;
var treeVertexCount = 0;

var brown = vec4(0.26275, 0.14902, 0.08627, 1.0);
var green = vec4(0.333, 0.420, 0.184, 1.0);
var color = vec4(0.2, 0.8, 0.2, 1.0); // Grass color
    
var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;
var theta = 0;
    
const at = vec3(0.0, 1.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available" );

        divideRectangles(80, 80, 0.1); 
    //addStonePath();
    addFlowers(80); // you can make this higher or lower!
  
    grassVertexCount = positionsArray.length;
    for (let i = 0; i < 12; i++) {
        drawRotatedTree(i * 15); // every 45 degrees
    }
    treeVertexCount = positionsArray.length - grassVertexCount;    

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

            // 4 different random heights to choose from for the grass
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

function drawBranch(x, y, z, angle, depth, lengthScale, width) {
    

  
    // Calculate end point of the branch
    let len = 0.2 * lengthScale;
    let rad = angle * Math.PI / 180;

    if (depth === 0) {
    // Draw a leaf at the end of this branch
    let leafSize = 0.3;

    
    // Tip of the final branch
    let leafX = x + 0.05 * lengthScale * Math.sin(rad);
    let leafY = y + 0.05 * lengthScale * Math.cos(rad);
    let leafZ = z;

    if (leafY < 0.7) {
        return; 
    }// skip this leaf if it's too low



    for (let i = 0; i < 5; i++) {
        let dx = (Math.random() - 0.5) * leafSize;
        let dy = (Math.random() - 0.5) * leafSize;
        let dz = (Math.random() - 0.5) * leafSize;

        let a = vec4(leafX, leafY, leafZ, 1.0);
        let b = vec4(leafX + dx, leafY + dy, leafZ + dz, 1.0);
        let c = vec4(leafX - dx, leafY + dy, leafZ - dz, 1.0);

        positionsArray.push(a, b, c);
        colorsArray.push(green, green, green);
        positionsArray.push(a, c, b);
        colorsArray.push(vec4(0.420, 0.557, 0.137,1), vec4(0.420, 0.557, 0.137,1), vec4(0.420, 0.557, 0.137,1));
    }

    return;
}


    let newX = x + len * Math.sin(rad);
    let newY = y + len * Math.cos(rad);

    // Add the branch line (as 2 points)
    positionsArray.push(vec4(x, y, z, 1));
    positionsArray.push(vec4(newX, newY, z, 1));

    colorsArray.push(brown, brown);

    // Recursive branches
    drawBranch(newX, newY, z, angle - 20, depth - 1, lengthScale * 0.8, width * 0.8);
    drawBranch(newX, newY, z, angle + 20, depth - 1, lengthScale * 0.8, width * 0.8);
// red or whatever color you want
}

function drawRotatedTree(rotationDegrees) {
    // Make a matrix that turns the tree around the Y axis
    let rotation = rotateY(rotationDegrees);

    // Save how many points are already in your array
    let start = positionsArray.length;

    // Draw one normal tree at the origin
    drawTriangleTrunk(0.0, 0.0, 0.0, 0.9, 0.15, 4);
    positionsArray.push(vec4(0,0,0,1));
    colorsArray.push(vec4(0.26275, 0.14902, 0.08627, 1.0));
    drawBranch(0.0, 0.0, 0.0, 0, 10, 2.0, 0.005);
    
    

    // After it's drawn, apply the rotation to the *new* points
    for (let i = start; i < positionsArray.length; i++) {
        positionsArray[i] = mult(rotation, positionsArray[i]);
    }
}

function drawTriangleTrunk(x, y, z, height, width, divisions) {
    let baseLeft = vec4(x - width, y, z, 1.0);
    let baseRight = vec4(x + width, y, z, 1.0);
    let top = vec4(x, y + height, z, 1.0);

    divideTriangle(baseLeft, baseRight, top, 0.2, divisions);
}

function addFlowers(count) {
    const petalColors = [
        vec4(1.0, 0.6, 0.8, 1.0), // pink
        vec4(1.0, 1.0, 0.5, 1.0), // yellow
        vec4(0.6, 0.6, 1.0, 1.0), // purple
        vec4(1.0, 0.7, 0.3, 1.0)  // orange
    ];

    const centerColor = vec4(1.0, 0.9, 0.2, 1.0); // gold/yellow center

    for (let i = 0; i < count; i++) {
        let x = -1 + 2 * Math.random();
        let z = -1 + 2 * Math.random();
        let y = 0.08;

        let petalCount = 6;
        let radius = 0.025;

        let petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];

        for (let j = 0; j < petalCount; j++) {
            let angle = (2 * Math.PI / petalCount) * j;
            let angleOffset = (Math.PI / 8) * Math.random(); // small jitter
            let rad = angle + angleOffset;

            // Triangle petal around the center
            let cx = x + radius * Math.cos(rad);
            let cz = z + radius * Math.sin(rad);

            let tip = vec4(cx, y + 0.01, cz, 1.0);
            let left = vec4(x + radius * Math.cos(rad - 0.2), y, z + radius * Math.sin(rad - 0.2), 1.0);
            let right = vec4(x + radius * Math.cos(rad + 0.2), y, z + radius * Math.sin(rad + 0.2), 1.0);

            positionsArray.push(tip, left, right);
            colorsArray.push(petalColor, petalColor, petalColor);
        }

        // Draw the center of the flower as a tiny triangle
        let c1 = vec4(x, y + 0.005, z, 1.0);
        let c2 = vec4(x + 0.01, y + 0.005, z, 1.0);
        let c3 = vec4(x, y + 0.005, z + 0.01, 1.0);

        positionsArray.push(c1, c2, c3);
        colorsArray.push(centerColor, centerColor, centerColor);
    }
}


function quad(a, b, c, d, color) {
    positionsArray.push(a);
    colorsArray.push(color);

    positionsArray.push(b);
    colorsArray.push(color);

    positionsArray.push(c);
    colorsArray.push(color);

    positionsArray.push(a);
    colorsArray.push(color);

    positionsArray.push(c);
    colorsArray.push(color);

    positionsArray.push(d);
    colorsArray.push(color);
}


function triangle(a, b, c)
{
    positionsArray.push(a, b, c);
    colorsArray.push(vec4(0.545, 0.271, 0.075, 1.0), // brown
                    vec4(0.26275, 0.14902, 0.08627, 1.0), // brown
                    vec4(0.26275, 0.14902, 0.08627, 1.0)); // light brown
}
    
function divideTriangle(a, b, c, factor, count)
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
}

// slight change
    
var render = function(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.cos(theta), 1, radius*Math.sin(theta));
    modelViewMatrix = lookAt(eye, at, up);
    projectionMatrix = perspective(fovy, aspect, 2, 10);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, grassVertexCount);
    gl.drawArrays(gl.LINES, grassVertexCount, treeVertexCount);

    theta += 0.0018;
    requestAnimationFrame(render);
}

}
mountainExample();