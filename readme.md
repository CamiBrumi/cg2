Project 2.
-- Camelia Daniela Brumar --

I have included three folders for this project:
1. standard_project_requirements folder
  - In this folder can be found the basic requirements of this project: translate, rotation and pulsing.
  - My code (.js file) has the following structure / functions:
    a) initializeVals() which initializes all the variables every time a new file is uploaded.
    b) setupFileReader() which sets the listener for the file upload. In this function we parse, we compute the triangles and its normals.
    c) main() is called when the window is loaded. In this function we basically initialize the shaders and the onkeypress listener.
    d) render() where we initialize the buffers and we create all the animations. We also set up the camera.
    e) newellMethod() is where we compute the normals of the triangles and we store them in a normals array.
    f) poly() computes the triangles.

2. extraCredit_rotation folder
  - contains a cool way to rotate objects.
  - to see the special rotation thing, press the 'r' key.

3. extraCredit_different_pulse
  - In this file I did the rotation in a different way, where the triangles remained sticked together.
  - to see the special pulse animation, keep pressed the 'p' key (it does not work as a toggle key).

Important note: I did the extra credit file in different folders because I had no more time to put it all together.
