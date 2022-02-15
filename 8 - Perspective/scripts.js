

function main() {
    var gl      = document.getElementById("c").getContext("webgl");
    var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader", "fragment-shader"]);

    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getAttribLocation(program, "a_color");

    // lookup uniforms
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer to put positions in
    var positionBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Put geometry data into buffer
    setGeometry(gl);

    // Create a buffer to put colors in
    var colorBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // Put geometry data into buffer
    setColors(gl);

    function radToDeg(r) {
      return r * 180 / Math.PI;
    }

    function degToRad(d) {
      return d * Math.PI / 180;
    }

    var translation = [-150, 0, -360];
    var rotation = [degToRad(190), degToRad(40), degToRad(320)];
    var scale = [1, 1, 1];
    var fieldOfViewRadians = degToRad(60);

    drawScene();

    // Setup a ui.
    webglLessonsUI.setupSlider("#fieldOfView", {value: radToDeg(fieldOfViewRadians), slide: updateFieldOfView, min: 1, max: 179});
    webglLessonsUI.setupSlider("#x", {value: translation[0], slide: updatePosition(0), min: -200, max: 200 });
    webglLessonsUI.setupSlider("#y", {value: translation[1], slide: updatePosition(1), min: -200, max: 200});
    webglLessonsUI.setupSlider("#z", {value: translation[2], slide: updatePosition(2), min: -1000, max: 0});
    webglLessonsUI.setupSlider("#angleX", {value: radToDeg(rotation[0]), slide: updateRotation(0), max: 360});
    webglLessonsUI.setupSlider("#angleY", {value: radToDeg(rotation[1]), slide: updateRotation(1), max: 360});
    webglLessonsUI.setupSlider("#angleZ", {value: radToDeg(rotation[2]), slide: updateRotation(2), max: 360});
    webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});
    webglLessonsUI.setupSlider("#scaleZ", {value: scale[2], slide: updateScale(2), min: -5, max: 5, step: 0.01, precision: 2});

    function updateFieldOfView(event, ui) {
      fieldOfViewRadians = degToRad(ui.value);
      drawScene();
    }

    function updatePosition(index) {
      return function(event, ui) {
        translation[index] = ui.value;
        drawScene();
      };
    }

    function updateRotation(index) {
      return function(event, ui) {
        var angleInDegrees = ui.value;
        var angleInRadians = angleInDegrees * Math.PI / 180;
        rotation[index] = angleInRadians;
        drawScene();
      };
    }

    function updateScale(index) {
      return function(event, ui) {
        scale[index] = ui.value;
        drawScene();
      };
    }

    // Draw the scene.
    function drawScene() {
      webglUtils.resizeCanvasToDisplaySize(gl.canvas);

      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear the canvas AND the depth buffer.
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // Turn on culling. By default backfacing triangles
      // will be culled.
      gl.enable(gl.CULL_FACE);

      // Enable the depth buffer
      gl.enable(gl.DEPTH_TEST);

      // Tell it to use our program (pair of shaders)
      gl.useProgram(program);

      // Turn on the position attribute
      gl.enableVertexAttribArray(positionLocation);

      // Bind the position buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
      var size = 3;          // 3 components per iteration
      var type = gl.FLOAT;   // the data is 32bit floats
      var normalize = false; // don't normalize the data
      var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(
          positionLocation, size, type, normalize, stride, offset);

      // Turn on the color attribute
      gl.enableVertexAttribArray(colorLocation);

      // Bind the color buffer.
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

      // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
      var size = 3;                 // 3 components per iteration
      var type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
      var normalize = true;         // normalize the data (convert from 0-255 to 0-1)
      var stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
      var offset = 0;               // start at the beginning of the buffer
      gl.vertexAttribPointer(
          colorLocation, size, type, normalize, stride, offset);

      // Compute the matrix
      var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
      var zNear = 1;
      var zFar = 2000;
      var matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
      matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
      matrix = m4.xRotate(matrix, rotation[0]);
      matrix = m4.yRotate(matrix, rotation[1]);
      matrix = m4.zRotate(matrix, rotation[2]);
      matrix = m4.scale(matrix, scale[0], scale[1], scale[2]);

      // Set the matrix.
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      // Draw the geometry.
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 16 * 6;
      gl.drawArrays(primitiveType, offset, count);
    }
}



main();
