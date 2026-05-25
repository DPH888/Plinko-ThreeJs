import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import * as THREE from 'three';
import { engine } from "./engine.mjs";
import * as ScoreModule from "./detection_point.mjs";
import HelvetikerFont from 'three/examples/fonts/helvetiker_regular.typeface.json';

let scoreMesh;
let font;
let lastScore = -1;

function createwords() {
  const loader = new FontLoader();
    // parse() converts raw JSON font data into a Three.js Font object
  font = loader.parse(HelvetikerFont);

  const material = new THREE.MeshLambertMaterial({ color: 0xff0000 }); //red colour

  scoreMesh = new THREE.Mesh(
    new TextGeometry("Score: 0", {
      font: font,
      size: 8,
      depth: 5,             // this makes it 3D
      curveSegments: 20,
      bevelEnabled: true,  // rounds edges
      bevelThickness: 1,
      bevelSize: .5,
      bevelSegments: 10
    }),
    material
  );

  scoreMesh.position.set(0, 60, -12);

  scoreMesh.rotation.z = Math.PI / 0.5;
  scoreMesh.rotation.y = Math.PI / 0.1335;  //rotates the score so its not upside down

  engine.scene.add(scoreMesh); // Add to the 3D world so the camera can see it
  // Hook the update function into Three.js render loop
  // onBeforeRender runs before every frame withought it "updateScoreDisplay" never will execute
  engine.scene.onBeforeRender = updateScoreDisplay;
}

function updateScoreDisplay() {
  const currentScore = ScoreModule.TotalScore;
  // only recreate geometry if the score has changed
  if (currentScore != lastScore) {
    // this frees GPU memory from the old geometry
    scoreMesh.geometry.dispose();
    // creates a new TextGeometry with the updated score value
    scoreMesh.geometry = new TextGeometry(
      "Score: " + currentScore, //this is the score that's being displayed to the player we have the text and next to it we say the current score
      {
        font: font,
        size: 8,
        depth: 5,
        curveSegments: 20,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: .5,
        bevelSegments: 10
      }
    );
    // syncs the score so we don't recreate geometry unnecessarily
    lastScore = currentScore;
  }
}

export { createwords };