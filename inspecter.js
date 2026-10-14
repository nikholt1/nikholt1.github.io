

export async function intializeInspecter() {
    const container = document.getElementById("inspector-container");

    if (!container) {
        console.error("Inspector container not found.");
        return;
    }

    container.innerHTML = `
    `;

    // 1. Initialize the viewer with CARTO Dark Matter imagery & transparency options
    const viewer = new Cesium.Viewer("cesiumContainer", {
      contextOptions: {
        webgl: {
          alpha: true // Enable alpha channel rendering for the WebGL canvas
        }
      },
      skyBox: false,         // Disable default skybox stars
      skyAtmosphere: false,  // Disable blue atmospheric haze (optional, looks cleaner when transparent)
      baseLayer: new Cesium.ImageryLayer(
        new Cesium.UrlTemplateImageryProvider({
          url: "https://{s}://{z}/{x}/{y}.png",
          credit: "© OpenStreetMap contributors, © CARTO",
          minimumLevel: 0,
          maximumLevel: 18
        })
      ),
      baseLayerPicker: false, 
      geocoder: false,
      navigationHelpButton: false,
      homeButton: false
    });

    // 2. Clear out background opaque default colors to fully transparent
    viewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;
    viewer.scene.globe.baseColor = Cesium.Color.TRANSPARENT;

    // 3. Copenhagen Coordinates (Longitude, Latitude)
    const cphLongitude = 12.5683;
    const cphLatitude = 55.6761;

    // 4. Create the Pin Entity
    const cphPin = viewer.entities.add({
      name: "Copenhagen (CPH)",
      position: Cesium.Cartesian3.fromDegrees(cphLongitude, cphLatitude),
      point: {
        pixelSize: 12,
        color: Cesium.Color.fromCssColorString("#ff3b30"), // Vibrant red pin
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      description: "A dark theme pin located at the center of Copenhagen, Denmark."
    });

    // 5. Fly the camera straight to the CPH Pin upon loading
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(cphLongitude, cphLatitude, 15000.0), // 15km altitude
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-60.0), // Angled look down
        roll: 0.0
      }
    });
}

