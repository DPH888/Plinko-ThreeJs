import * as THREE from "three";
import * as CANNON from "cannon-es";
import { engine } from "./engine.mjs";

let ballMesh;   // the visible red sphere on screen (Three.js)
let ballBody;   // the invisible physics sphere that falls, rolls, bounces (Cannon)

function createBall(x = 0, y = 0, z = 0) {
  // visual part - what the player actually sees
  const geometry = new THREE.SphereGeometry(2); // radius - 2 units
  const material = new THREE.MeshStandardMaterial({ // MeshStandardMaterial is a preset that comes with Three.js, it simulates real-world VISUAL materials
    color: 0xff0000,     //  red colour
  });

  ballMesh = new THREE.Mesh(geometry, material);
  ballMesh.position.set(x, y, z);        // starting position 
  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;

  engine.scene.add(ballMesh);            // Add to the 3D world so the camera can see it

  // physics part - invisible collision & movement
  const shape = new CANNON.Sphere(2);     // collision sphere with 2 units (same as visual)
  // everything inside { } is just a normal  object with properties.
  // CANNON.Body is a class that creates the object using blueprint
  ballBody = new CANNON.Body({
    mass: 1,
    //  why new CANNON.Vec3(x, y, z) and not just x, y, z?
    //  Cannon.es is very strict: it ONLY accepts its own vector type.
    //  you cannot write position: {x, y, z} or use THREE.Vector3 it will just break         
    position: new CANNON.Vec3(x, y, z),   // Same starting position as the visual mesh
    shape: shape,
  });

  engine.world.addBody(ballBody);      // Add to physics simulation (gravity now affects it)

  // every Three.js object has a small hidden storage space called .userData
  // we put the physics body inside this lable so the engine can find it later and unite the physical and visual ball
  ballMesh.userData.body = ballBody;
}
let isBallCreated = false;
let animationRunning = true;
let animationPhase = - 2;

const halfDistance = 9.70;
const phaseSpeed = 0.01;
function respawnAnimation() {

  if (isBallCreated == false) {
    createBall(0, 50, 0);
    isBallCreated = true;
  }
 // console.log(animationRunning)

  if (animationRunning == true) {
    //this makes our animation running the bigger the number the faster it runs
    animationPhase = animationPhase + phaseSpeed;
    //  Math.sin(animationPhase)  gives -1 to +1 wave
    //  Starting at -1 (z=0) and peaks at +1 (z=20)
    //   the +1 part is because Math.sin starts at -1 so this centers it to 0 to 2 from -1 to 1
    //  halfDistance stretches it from the raw 0 -2 into real distance 0-20 
    // sin() gives the position of a point moving around a circle, the height of that point changes slowly at the top and bottom, but quickly in the middle
    const z = (Math.sin(animationPhase) + 1) * halfDistance;
    ballBody.position.set(0, 50, z);
    ballBody.velocity.set(0, 0, 0);
  }
}

function resetBall() {
  animationPhase = -2;
  animationRunning = true;

  if (ballBody) {// This is important to prevent immediate re-collision with detection zones and moves back ball to starting position
    ballBody.position.set(0, 50, 0);
    ballBody.velocity.set(0, 0, 0);
  }

  // Reset all detection zones so they can award points again
  // Loop through all physics bodies manually
  for (let i = 0; i < engine.world.bodies.length; i++) {
    const body = engine.world.bodies[i];
    if (body.userData && body.userData.hit != undefined) { // checks if object has userData.hit
      body.userData.hit = false;
    }
  }
}
function stopAnimation() {
  animationRunning = false;
}


export { createBall, ballMesh, ballBody, respawnAnimation, resetBall, stopAnimation }; 