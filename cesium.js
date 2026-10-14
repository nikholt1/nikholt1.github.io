
const CONFIG = {
    containerId: "cesium-globe",

    initialAltitude: 22000000,
    initialLongitude: 10,
    initialLatitude: 15,

    background: "#080d16",

    rotationSpeed: 1.5, // Degrees per second
    resumeRotationDelay: 1500,

    markerSize: 5,
    markerColor: "#5eff99",
    markerOpacity: 0.65
};

const LOCATIONS = [
    { name: "Austria", longitude: 14.55, latitude: 47.52 },
    { name: "Belgium", longitude: 4.47, latitude: 50.50 },
    { name: "Denmark", longitude: 9.5018, latitude: 56.2639 },
    { name: "Faroe Islands", longitude: -6.91, latitude: 61.89 },
    { name: "Greenland", longitude: -42.0, latitude: 72.0 },
    { name: "France", longitude: 2.21, latitude: 46.23 },
    { name: "Germany", longitude: 10.45, latitude: 51.17 },
    { name: "Greece", longitude: 21.82, latitude: 39.07 },
    { name: "Iceland", longitude: -19.02, latitude: 64.96 },
    { name: "Ireland", longitude: -8.24, latitude: 53.41 },
    { name: "Italy", longitude: 12.57, latitude: 41.87 },
    { name: "Kosovo", longitude: 20.90, latitude: 42.60 },
    { name: "Netherlands", longitude: 5.29, latitude: 52.13 },
    { name: "Norway", longitude: 8.47, latitude: 60.47 },
    { name: "Svalbard", longitude: 20.0, latitude: 78.0 },
    { name: "Poland", longitude: 19.15, latitude: 51.92 },
    { name: "Portugal", longitude: -8.22, latitude: 39.40 },
    { name: "Romania", longitude: 24.97, latitude: 45.94 },
    { name: "Serbia", longitude: 21.01, latitude: 44.02 },
    { name: "Spain", longitude: -3.75, latitude: 40.46 },
    { name: "Sweden", longitude: 18.64, latitude: 60.13 },
    { name: "Turkey", longitude: 35.24, latitude: 38.96 },
    { name: "United Kingdom", longitude: -3.44, latitude: 55.38 },
    { name: "England", longitude: -1.17, latitude: 52.36 },
    { name: "Scotland", longitude: -4.20, latitude: 56.49 },
    { name: "Canada", longitude: -106.35, latitude: 56.13 }
];



export function initializeCesium() {
    const container = document.getElementById(CONFIG.containerId);

    if (!container || typeof Cesium === "undefined") {
        console.error("Cesium container or CesiumJS not found.");
        return null;
    }

    if (
        container.cesiumViewer &&
        !container.cesiumViewer.isDestroyed()
    ) {
        container.cesiumViewer.resize();
        return container.cesiumViewer;
    }

    const backgroundColor = Cesium.Color.fromCssColorString(
        CONFIG.background
    );

    const viewer = new Cesium.Viewer(container, {
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        navigationHelpButton: false,
        sceneModePicker: false,
        selectionIndicator: false,
        timeline: false,
        vrButton: false,

        baseLayer: false,
        skyBox: false,

        shouldAnimate: true,
        requestRenderMode: false
    });

    container.cesiumViewer = viewer;

    const scene = viewer.scene;
    const cameraController = scene.screenSpaceCameraController;
    const eventHandler = viewer.screenSpaceEventHandler;

    scene.backgroundColor = backgroundColor;
    scene.globe.baseColor = backgroundColor;
    scene.globe.enableLighting = false;



    const imageryProvider = new Cesium.SingleTileImageryProvider({
        url: new URL("./images/map.png", import.meta.url).href
    });

    viewer.imageryLayers.removeAll();
    viewer.imageryLayers.addImageryProvider(imageryProvider);



    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
            CONFIG.initialLongitude,
            CONFIG.initialLatitude,
            CONFIG.initialAltitude
        ),

        orientation: {
            heading: 0,
            pitch: Cesium.Math.toRadians(-90),
            roll: 0
        }
    });


    cameraController.enableZoom = false;
    cameraController.enableRotate = true;
    cameraController.enableTilt = false;
    cameraController.enableLook = false;
    cameraController.enableTranslate = false;

    eventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );



    const markerColor = Cesium.Color
        .fromCssColorString(CONFIG.markerColor)
        .withAlpha(CONFIG.markerOpacity);

        LOCATIONS.forEach((location) => {
            // Randomly vary the radius while keeping markers consistent
            const sizeVariation = 1 + Math.random() * 1.0;

            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(
                    location.longitude,
                    location.latitude
                ),

                point: {
                    pixelSize: CONFIG.markerSize * sizeVariation,
                    color: markerColor,
                    outlineWidth: 0,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            });
        });


    let isDragging = false;
    let lastInteractionTime = performance.now();
    let previousFrameTime = performance.now();

    const markInteraction = () => {
        lastInteractionTime = performance.now();
    };

    const onLeftDown = () => {
        isDragging = true;
        markInteraction();
    };

    const onLeftUp = () => {
        isDragging = false;
        markInteraction();
    };

    const onMouseMove = () => {
        if (isDragging) {
            markInteraction();
        }
    };

    eventHandler.setInputAction(
        onLeftDown,
        Cesium.ScreenSpaceEventType.LEFT_DOWN
    );

    eventHandler.setInputAction(
        onLeftUp,
        Cesium.ScreenSpaceEventType.LEFT_UP
    );

    eventHandler.setInputAction(
        onMouseMove,
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );

    const removeRotationListener = scene.preUpdate.addEventListener(() => {
        const now = performance.now();


        const deltaSeconds = Math.min(
            (now - previousFrameTime) / 1000,
            0.05
        );

        previousFrameTime = now;

        if (isDragging) {
            return;
        }

        if (
            now - lastInteractionTime <
            CONFIG.resumeRotationDelay
        ) {
            return;
        }

        const rotation = Cesium.Math.toRadians(
            CONFIG.rotationSpeed
        ) * deltaSeconds;

        viewer.camera.rotate(
            Cesium.Cartesian3.UNIT_Z,
            rotation
        );
    });



    container.cesiumCleanup = () => {
        removeRotationListener();

        if (!eventHandler.isDestroyed()) {
            eventHandler.removeInputAction(
                Cesium.ScreenSpaceEventType.LEFT_DOWN
            );

            eventHandler.removeInputAction(
                Cesium.ScreenSpaceEventType.LEFT_UP
            );

            eventHandler.removeInputAction(
                Cesium.ScreenSpaceEventType.MOUSE_MOVE
            );
        }
    };

    viewer.resize();

    return viewer;
}

export function destroyCesium() {
    const container = document.getElementById(CONFIG.containerId);

    if (!container) {
        return;
    }

    if (typeof container.cesiumCleanup === "function") {
        container.cesiumCleanup();
        delete container.cesiumCleanup;
    }

    const viewer = container.cesiumViewer;

    if (viewer && !viewer.isDestroyed()) {
        viewer.destroy();
    }

    delete container.cesiumViewer;
}
