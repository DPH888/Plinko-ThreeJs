import * as THREE from "three";
import * as CANNON from "cannon-es";
import { engine } from "./engine.mjs";

let physicalBody;
let visualBody;
export let TotalScore = 0;

function createDetectionPoint(x, y, z, width, height, depth, Localscore) {
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // the material has no shadows and reflections, red color
    var groundMesh = new THREE.Mesh(geometry, material);
    groundMesh.position.set(x, y, z)// starting position
    engine.scene.add(groundMesh);// add to the 3D world so the camera can see it

    /*the reason for using Vec3 and dividing by 2
         CANNON.Box() expects the distance from center to edge, so the full size must be divided by 2
         CANNON.Box() only accepts a CANNON.Vec3 - nothing else works
      */
    visualBody = new CANNON.Box(
        new CANNON.Vec3(width / 2, height / 2, depth / 2)
    );
    physicalBody = new CANNON.Body({
        // Cannon-es only accepts its own CANNON.Vec3 for position, velocity, force, etc.
        position: new CANNON.Vec3(x, y, z),      // same starting position as the visual mesh
        shape: visualBody   // attach collision shape to the physics body
    });

    engine.world.addBody(physicalBody);
    // every Three.js object has a class called .userData
    // we put the physics body inside this label so the engine can find it later and unite the physical and visual ball
    groundMesh.userData.body = physicalBody;

    // Cannon-es bodies and Three.js meshes don't have built-in properties for custom game data.
    // .userData is the place to store anything extra (score, etc.)
    // this allows us to attach game-specific information directly to the physics body.
    physicalBody.userData = {
        score: Localscore,
        hit: false
    };

}

export function addToTotalScore(amount) {
    TotalScore = TotalScore + amount;
}

export { createDetectionPoint, physicalBody, visualBody };