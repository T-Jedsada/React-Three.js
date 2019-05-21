import React, { Component } from "react";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import { Content } from "./component/showroomcontent";
import WebVRPolyfill from "webvr-polyfill";
import {
  showroomsky,
  sphereAngle,
  sphereInside
} from "./component/ShowRoomSky";
import { circleframe, logo } from "./component/Showroomlogo";
import { config } from "./component/configWebVR";
import { contentIndex, NavigateButton } from "./component/NavigateButton";
import { Toolbar } from "./component/toolbar";
import { WEBVR } from "./resources/controls/WebVR";
import { DeviceOrientationControls } from "./resources/controls/DeviceOrientationControls";
import { Interaction } from "three.interaction";
import { Recenter } from "./component/Recenter";
import { rotationY } from "./RotationY";
import { scene, camera, raycaster } from "./component/sceneSetting";
import { rootContent } from "./component/RootContent";
var TWEEN = require("@tweenjs/tween.js");

class App extends Component {
  polyfill = new WebVRPolyfill(config);
  scene = new THREE.Scene();
  state = { controls: "", device: "" };

  componentDidMount() {
    this.sceneSetup();
    this.addCustomSceneObjects();
    window.addEventListener("resize", this.handleWindowResize);
  }

  componentDidUpdate() {
    document.body.appendChild(
      Recenter(this.renderer, this.state.controls, this.state.device)
    );
  }

  sceneSetup = async () => {
    this.scene = scene;
    this.camera = camera;
    this.raycaster = raycaster;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.domElement.style.display = "block";
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.mount.appendChild(this.renderer.domElement);
    document.body.appendChild(WEBVR.createButton(this.renderer));
    this.interaction = new Interaction(this.renderer, this.scene, this.camera);

    navigator.getVRDisplays().then(VRDisplay => {
      if (VRDisplay.length) {
        let vrDisplay = VRDisplay[0];
        this.renderer.vr.enabled = true;
        let controls = new DeviceOrientationControls(this.camera);
        this.setState({ controls: controls, device: "vr" });
        vrDisplay.requestAnimationFrame(this.animate);
        this.startAnimationLoop();
        rootContent.rotation.set(0, controls.object.rotation.y, 0, "XYZ");
        this.renderer.vr.enabled = true;
      } else {
        let controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.setState({ controls: controls, device: "desktop" });
        controls.enableZoom = false;
        controls.target.set(0, 1.6, -0.0001);
        requestAnimationFrame(this.animate);
        this.startAnimationLoop();
      }
    });
    this.renderer.setAnimationLoop(() => {
      this.renderer.render(this.scene, this.camera);
    });
  };

  addCustomSceneObjects = () => {
    // this.scene.add(showroomsky);
    sphereAngle.position.set(0, 1.6, 0);
    this.scene.add(sphereAngle.add(showroomsky, sphereInside));
    sphereInside.add(circleframe, NavigateButton, Toolbar, logo);
    // this.scene.add(rootContent);
    // this.scene.add(showroomsky.add(rootContent));
    Content(contentIndex).map(res => sphereInside.add(res));
  };
  lastTime = 0;
  ischeck;

  animate = time => {
    if (!time) {
      time = 0;
    }
    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;

    this.frameId = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
    this.state.controls.update();
    const rotSpeed = THREE.Math.degToRad(90) * deltaTime;
    const rotSpeedY = THREE.Math.degToRad(10) * deltaTime;

    // sphereAngle.rotateY( rotSpeedY)
    // showroomsky.rotateX( rotSpeed)
    // sphereAngle.rotation.setY(sphereAngle.rotation.y+ rotSpeed);
    // showroomsky.rotation.setX(showroomsky.rotation.x+ rotSpeed);
    console.log(sphereAngle.rotation);

    //console.log(this.rota);
    // showroomsky.rotation.setFromVector3(this.rota);

    TWEEN.update(time); //ใส่ update เพื่อให้ tween animation แสดงผล
    // this.setState({
    //   rotationx: (this.state.controls.object.rotation.x / Math.PI) * 180,
    //   rotationy: (this.state.controls.object.rotation.y / Math.PI) * 180,
    //   rotationz: (this.state.controls.object.rotation.z / Math.PI) * 180,
    //   skyX: (showroomsky.rotation.x / Math.PI) * 180, //   skyX: (showroomsky.rotation.x / Math.PI) * 180,
    //   skyy: (showroomsky.rotation.y / Math.PI) * 180, //   skyy: (showroomsky.rotation.y / Math.PI) * 180,
    //   skyz: (showroomsky.rotation.z / Math.PI) * 180 //   skyz: (showroomsky.rotation.z / Math.PI) * 180
    // });
  };

  startAnimationLoop = () => !this.frameId && this.animate();

  handleWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    const css = { color: "red", display: "block", position: "absolute" };

    return (
      <div ref={ref => (this.mount = ref)}>
        <div style={{ ...css, top: "0px" }}>{this.state.rotationx}</div>
        <div style={{ ...css, top: "15px" }}>{this.state.rotationy}</div>
        <div style={{ ...css, top: "30px" }}>{this.state.rotationz}</div>
        <div style={{ ...css, top: "45px" }}>{this.state.skyX}</div>
        <div style={{ ...css, top: "60px" }}>{this.state.skyy}</div>
        <div style={{ ...css, top: "75px" }}>{this.state.skyz}</div>
      </div>
    );
  }
}

export default App;
