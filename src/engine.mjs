import * as THREE from "three";
import * as CANNON from "cannon-es";
import { createBall, ballMesh, ballBody, respawnAnimation, stopAnimation, resetBall} from "./ball.mjs";
import { detectionBodies, addToTotalScore, TotalScore } from "./detection_point.mjs";
import { createDetectionPoint, physicalBody } from "./detection_point.mjs"

let engine = {
    init: initEngine,     // function that initializes the engine
    // () is empty because this function takes no parameters (no input values)
    // =>  creates a function  
    // { } empty body of the function (placeholder)
    update: () => { },
    updateTime: 10,      // milliseconds between each `engine.update()` call, smaller = faster game logic updates, larger = slower updates
    scene: null,      //THREE.js scene  //we use null to say "empty for now" we will asign it later
    camera: null,    // THREE.js camera
    renderer: null,      // draws the scene with THREE.WebGLRenderer
    world: null,       // Cannon.es physics simulation
};

// sets up Three.js scene, camera, renderer, and Cannon.es physics
function initThreeAndPhysics() {
    engine.scene = new THREE.Scene(); // main container for all 3D objects

    engine.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 30000);
    //Renderer
    engine.renderer = new THREE.WebGLRenderer({ antialias: true });  // allows for the GPU to help with rendering
    engine.renderer.setSize(window.innerWidth, window.innerHeight);   // full window
    document.body.appendChild(engine.renderer.domElement); // // attach canvas to webpage


    engine.renderer.shadowMap.enabled = true; // Enable shadows
    engine.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // This sets the type of shadow mapping algorithm
    // Physics world
    engine.world = new CANNON.World();
    engine.world.gravity.set(0, -3, 0); // downward gravity
    /*
     SAPBroadphase(algorithm) is the first step of collision detection.
     the broadphase checks for which bodies might collide before doing precise calculations.
     it improves performence
    */
    engine.world.broadphase = new CANNON.SAPBroadphase(engine.world);

    // skybox code
    let materialArray = [];
    let texture_ft = new THREE.TextureLoader().load('images/zeus_ft.jpg');
    let texture_bk = new THREE.TextureLoader().load('images/zeus_bk.jpg');
    let texture_up = new THREE.TextureLoader().load('images/zeus_up.jpg');
    let texture_dn = new THREE.TextureLoader().load('images/zeus_dn.jpg');
    let texture_rt = new THREE.TextureLoader().load('images/zeus_rt.jpg');
    let texture_lf = new THREE.TextureLoader().load('images/zeus_lf.jpg');
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
    materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));
    for (let i = 0; i < 6; i++) {
        materialArray[i].side = THREE.BackSide;
    }
    let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);
    engine.scene.add(skybox);
}
let canTheGameReset=false;
let canThePlayerReset=false;

function colisionChecker(bodyA, bodyB, score = null) {
    // engine.world.contacts contains all the collisions detected(between 2 bodies) in a given frame
    // looping through world.contacts is necessary because Cannon does not provide a direct "are these two bodies colliding" query
    for (let i = 0; i < engine.world.contacts.length; i++) {
        // it retrieves a single collision record from the physics world
        // "engine.world.contacts" is a list of all collisions currently detected in this physics step.
        // "i" specifies spesific collision in the list that is wanted
        // the variable "contact" now represents that specific collision including the two bodies involved (bodyOne and bodyTwo)
        const contact = engine.world.contacts[i];
        // contact.bi = first body in the contact pair
        // contact.bj = second body in the contact pair
        // cannon-es assigns these arbitrarily meaning bj and bi are not guaranteed to be bi or bj; bi and bj are given to us by cannon es we cannot set out own names

        const a = contact.bi;
        const b = contact.bj;

        // Check if this contact involves exactly bodyA and bodyB
        // We check both orders because bi and bj can be assigned in either order by the engine
        //COLLISION CHECKER WORKS BY CHECKING COLLISIONS OF BALL AND PHYSICAL OBJECT WITH USERDATA(DETECTION POINTS)
        if (a == bodyA && b.userData) {
            if (b.userData.hit == false) {
                b.userData.hit = true;
                addToTotalScore(b.userData.score);
                console.log("You got", b.userData.score);
                console.log("Total Score:", TotalScore);
                canTheGameReset=true
            }
        }
        else if (b == bodyA && a.userData) {
            if (a.userData.hit == false) {
                a.userData.hit = true;
                addToTotalScore(a.userData.score);
                console.log("You got", a.userData.score);
                console.log("Total Score:", TotalScore);
                canTheGameReset=true
            }
        }
    }
}

function renderLoop() {
    engine.world.step(1 / 60);   // physics step at 60 Hz, it regulates how fast or slow everything is mooving
    colisionChecker(ballBody);
   // if(physicalBody.userData.hit==true ){
    respawnAnimation()
   // }

//console.log(canThePlayerReset)
  
window.addEventListener("keydown", event => {  //keydown is an already exsting event for when key is pressed down
//1. The browser receives system(keyboard) event.    
//2. The browser creates a JavaScript event object.
//3. That event object contains properties like: "key,code, etc." if .key name is changed in the code to somehting else the browser wont know
    if (event.code == "Enter") {
        resetBall();
    }
    if (event.code == "Space") {
        stopAnimation();
    }
});
    /*  
    traverse() is a built-in Three.js method, it recursively visits EVERY object in the entire 3D scene (ball, ground, cylinders, etc.) to sync the visual meshes with the physics bodies every frame
    object.userData.body -> if the object has a physics body associated
    position.copy() -> copies physics body position to the mesh
    quaternion.copy()-> copies physics body rotation to the mesh
   */
    engine.scene.traverse(object => {
        if (object.userData.body) {
            object.position.copy(object.userData.body.position);
            object.quaternion.copy(object.userData.body.quaternion);
        }
    });
    //Render Scene
    engine.renderer.render(engine.scene, engine.camera);     // Draws the scene from the perspective of the camera this sends commands to the GPU to render objects to the canvas
    /*
      requestAnimationFrame tells the browser:
      "Call this function before the next screen repaint"
      This makes rendering smooth and synced with monitor refresh rate (~60 FPS)
     */
    requestAnimationFrame(renderLoop);
}

//Initializes engine and starts render + update loops
function initEngine() {
    initThreeAndPhysics();   // creates scene, camera, renderer, physics world
    window.engine = engine;     //This allows the engine's variables to be used in other files or the console.
    renderLoop();           // start visual render loop z

    /*
 * Start the logic update loop
 * setInterval calls engine.update() every updateTime milliseconds
 * This loop handles game logic, physics adjustments, camera follow, etc.
 */
    setInterval(() => engine.update(), engine.updateTime);
}

export { engine, colisionChecker };