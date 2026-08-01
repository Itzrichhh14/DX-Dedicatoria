import * as THREE from "three";

export function createOrbitalCamera(camera, target, options = {}) {
  const settings = {
    radius: 26,
    angleX: 0.55,
    angleY: 0.8,
    ...options,
  };

  return {
    radius: settings.radius,
    angleX: settings.angleX,
    angleY: settings.angleY,
    target,
    update() {
      const x = Math.sin(this.angleY) * this.radius * Math.cos(this.angleX);
      const z = Math.cos(this.angleY) * this.radius * Math.cos(this.angleX);
      const y = Math.sin(this.angleX) * this.radius;
      camera.position.set(x, y + 1.8, z);
      camera.lookAt(this.target);
    },
  };
}
