// how to make the drawing
/*
 * Some comments quoted from WebGL Programming Guide
 * by Matsuda and Lea, 1st edition.
 *
 * @author Joshua Cuneo
 */

var gl;
var program;
var canvas;

var theta = 0;
var alpha = 0;
var vertices = [];
var polygons = [];
var points = [];
var normals = [];
var colors = [];

//perspective stuff
var tp;
var bottom;
var r;
var l;
var near;
var far;
var p = 0;
var mode = {pulseMode:false, inwards:false, outwards:true, translateMode:false, xPosMode:false, xNegMode:false, yPosMode:false, yNegMode:false, zPosMode:false, zNegMode:false, rotMode:false};
const TRANSLATE_CONST = 0.05;
const PULSE_CONST = 0.01;
const ANGLE_CONST = 3;
const PULSE_LIMIT = 0.15;
var tx = 0;
var ty = 0;
var tz = 0;

function initializeVars() {

    vertices = [];
    colors = [];
    polygons = [];
    points = [];
    normals = [];
    p = 0;
    theta = 0;
    tx = 0;
    ty = 0;
    tz = 0;
    theta = 0;
    mode.pulseMode = false;
    mode.inwards = false;
    mode.outwards = true;
    mode.rotMode = false;
}

function setupFileReader() {
    // We process the data in the file
    var fileInput = document.getElementById('fileInput');
    var inputDiv = document.getElementById('inputDiv');
    fileInput.addEventListener('change', function (e) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        initializeVars();
        var file = fileInput.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = reader.result.split(/\r\n?|\n/);
            if (data[0] !== "ply") {
                alert('File does not contain "ply"');
            } else {

                // number of vertices
                var nrVerticesArr = data[2].match(/\d+/).map(function (v) {
                    return parseInt(v);
                });
                var nrVertices = nrVerticesArr[0];

                // number of polygons
                var nrPolygonsArr = data[6].match(/\d+/).map(function (v) {
                    return parseInt(v);
                });
                var nrPolygons = nrPolygonsArr[0];


                // what initial values
                var coords = data[9].split(" ");
                var x = parseFloat(coords[0]);
                var y = parseFloat(coords[1]);
                var z = parseFloat(coords[2]);
                vertices.push(vec4(x, y, z, 1.0));
                tp = x;
                bottom = x;
                r = y;
                l = y;
                far = z;
                near = z;

                var i = 0;
                for (i = 10; i < nrVertices + 9; i++) {
                    var coords = data[i].split(" ");
                    var x = parseFloat(coords[0]);
                    var y = parseFloat(coords[1]);
                    var z = parseFloat(coords[2]);
                    vertices.push(vec4(x, y, z, 1.0));

                    //now we we check for the max x, y and z in order to plug these values in the perspective function
                    //these are model coordinates, we have to pass them to eye coordinates
                    r = Math.max(x, r);
                    l = Math.min(x, l);

                    tp = Math.max(y, tp);
                    bottom = Math.min(y, bottom);

                    far = Math.min(z, far);
                    near = Math.max(z, near);


                }

                const j = i;
                for (i = j; i < nrPolygons + j; i++) {
                    var pols = data[i].split(" ");
                    //polygons.push(vec3( parseFloat(pols[0]), parseFloat(pols[1]),  parseFloat(pols[2])));
                    poly(parseFloat(pols[1]), parseFloat(pols[2]), parseFloat(pols[3]));
                    //console.log(pols[1] + " " + pols[2] + " " + pols[3]);
                }
                //console.log(normals);

                gl.enable(gl.DEPTH_TEST);

                // Clear the canvas AND the depth buffer.
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


            }


        };
        reader.readAsText(file);

    });
}

function main() {


    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = WebGLUtils.setupWebGL(canvas, undefined);
    if (!gl) {
        //console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Initialize shaders
    program = initShaders(gl, "vshader", "fshader");
    gl.useProgram(program);
    gl.viewport(0, 0, canvas.width, canvas.height);


    //this is the code that handles the event when a key is pressed
    window.onkeypress = function (event) {
        var key = event.key;
        switch (key) {
            case 'c': // Translate your wireframe in the negative x direction
                if (mode.translateMode) {
                    mode.translateMode = false;
                    mode.xNegMode = false;
                } else {
                    mode.translateMode = true;
                    mode.xNegMode = true;
                    mode.xPosMode = false;
                }
                break;
            case 'x': // Translate your wireframe in the positive x direction
                if (mode.translateMode) {
                    mode.translateMode = false;
                    mode.xPosMode = false;
                } else {
                    mode.translateMode = true;
                    mode.xNegMode = false;
                    mode.xPosMode = true;
                }
                break;
            case 'u': // Translate your wireframe in the negative y direction
                if (mode.translateMode) {
                    mode.translateMode = false;
                    mode.yNegMode = false;
                } else {
                    mode.translateMode = true;
                    mode.yNegMode = true;
                    mode.yPosMode = false;
                }
                break;
            case 'y': // Translate your wireframe in the positive y direction
                if (mode.translateMode) {
                    mode.translateMode = false;
                    mode.yPosMode = false;
                } else {
                    mode.translateMode = true;
                    mode.yNegMode = false;
                    mode.yPosMode = true;
                }
                break;
            case 'a': // Translate your wireframe in the negative z direction
                if (mode.translateMode) {
                    mode.translateMode = false;
                    mode.zNegMode = false;
                } else {
                    mode.translateMode = true;
                    mode.zNegMode = true;
                    mode.zPosMode = false;
                }
                break;
            case 'z': // Translate your wireframe in the positive z direction
                if (mode.translateMode) {
                    mode.translateMode = false;
                    mode.zPosMode = false;
                } else {
                    mode.translateMode = true;
                    mode.zNegMode = false;
                    mode.zPosMode = true;
                }
                break;
            case 'p':
                if (mode.pulseMode) {mode.pulseMode = false;}
                else {mode.pulseMode = true;}
                break;
            case 'r':
                if (mode.rotMode) {
                    mode.rotMode = false;
                } else {
                    mode.rotMode = true;
                }
                break;
        }

    };

    setupFileReader();
    render();





}

var id;

function render() {
    var xDist = Math.abs(r - l);
    var yDist = Math.abs(tp - bottom);
    var zDist = Math.abs(near - far);
    var maxDist = Math.max(xDist, yDist, zDist);
    var multiplier = 0.5;
    if (maxDist > 5) {
        multiplier = maxDist;
    }

    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //console.log(points.length);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var offsetLoc = gl.getUniformLocation(program, "vPointSize");
    gl.uniform1f(offsetLoc, 10.0);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    if (mode.translateMode) {
        if (mode.xPosMode) {
            tx += TRANSLATE_CONST;
        } else if (mode.xNegMode) {
            tx -= TRANSLATE_CONST;
        }

        if (mode.yPosMode) {
            ty += TRANSLATE_CONST;
        } else if (mode.yNegMode) {
            ty -= TRANSLATE_CONST;
        }

        if (mode.zPosMode) {
            tz += TRANSLATE_CONST;
        } else if (mode.zNegMode) {
            tz -= TRANSLATE_CONST;
        }
    }

    if (mode.pulseMode) {
        if (mode.outwards) {
            p += PULSE_CONST;
        } else if (mode.inwards) {
            p-= PULSE_CONST;
        }

        if (p > PULSE_LIMIT) {
            mode.inwards = true;
            mode.outwards = false;
        }
        if (p < 0) {
            mode.inwards = false;
            mode.outwards = true;
        }
    }

    if (mode.rotMode) {
        theta += ANGLE_CONST;
    }

    for (var i = 0; i < (points.length) / 3; i++) {
        var fovy = 30;

        var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        var thisProj = perspective(fovy, aspect, 0.1, 10000);

        var projMatrix = gl.getUniformLocation(program, 'projMatrix');
        gl.uniformMatrix4fv(projMatrix, false, flatten(thisProj));

        var rotMatrixX = rotateX(theta);

        //var translateMatrix = translate(p * (normals[i][0] * xdiff) + (xdiff * tx), p * (normals[i][1] * ydiff) + (ydiff * ty), p * (normals[i][2] * zdiff) + (zdiff * tz));
        var translateMatrix = translate(p * (normals[i][0]*multiplier) + (maxDist * tx), p * (normals[i][1]*multiplier) + (maxDist * ty), p * (normals[i][2]*multiplier) + (maxDist * tz));
        var ctMatrix = mult(translateMatrix, rotMatrixX);


        var at = vec3((r + l) / 2, (tp + bottom) / 2, 0); // should be out from the viewing frustum (near+far)/2
        var eye = vec3(at[0], at[1], Math.max(r - l, tp - bottom) * 2.5 + near); //eyeDist + near*2
        var up = vec3(0.0, 1.0, 0.0);
        var viewMatrix = lookAt(eye, at, up);

        var ctMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
        gl.uniformMatrix4fv(ctMatrixLoc, false, flatten(ctMatrix));

        var viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

        gl.drawArrays(gl.LINE_LOOP, i * 3, 3);

    }
    id = requestAnimationFrame(render);

}

//creates the normal vector of the triangle formed by the vertices a, b and c and adds it to the normals array
function newellMethod(a, b, c) {
    var nx = (a[1] - b[1]) * (a[2] + b[2]) + (b[1] - c[1]) * (b[2] + c[2]) + (c[1] - a[1]) * (c[2] + a[2]);
    var ny = (a[2] - b[2]) * (a[0] + b[0]) + (b[2] - c[2]) * (b[0] + c[0]) + (c[2] - a[2]) * (c[0] + a[0]);
    var nz = (a[0] - b[0]) * (a[1] + b[1]) + (b[0] - c[0]) * (b[1] + c[1]) + (c[0] - a[0]) * (c[1] + a[1]);

    var norm = Math.sqrt(nx*nx + ny*ny + nz*nz);

    normals.push(vec3(nx/norm, ny/norm, nz/norm)); // normalized normal vectors
}


function poly(a, b, c) {
    points.push(vertices[a], vertices[b], vertices[c]);
    colors.push(vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0), vec4(1.0, 1.0, 1.0, 1.0));
    newellMethod(vertices[a], vertices[b], vertices[c]);

}
