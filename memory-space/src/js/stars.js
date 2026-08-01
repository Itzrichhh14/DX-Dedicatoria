import * as THREE from "three";

export function createStars() {

    const geometry = new THREE.BufferGeometry();

    const vertices = [];

    for (let i = 0; i < 12000; i++) {

        vertices.push(
            (Math.random() - 0.5) * 700,
            (Math.random() - 0.5) * 700,
            (Math.random() - 0.5) * 700
        );

    }

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
    );

    const material = new THREE.PointsMaterial({

        color: 0xffffff,

        size: 0.7,

        sizeAttenuation: true

    });

    return new THREE.Points(
        geometry,
        material
    );

}