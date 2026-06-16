



export function renderWheel() {
    const wheelSpinContainer = document.getElementById("wheelSpinContainer");
    wheelSpinContainer.innerHTML = `
        <div class="wheel-container">
            <div class="pointer"></div>
            <div class="wheel" id="wheel"></div>
        </div>
    `;

    const wheel = document.getElementById("wheel");

    let rotation = 0;
    let spinning = false;

    wheel.addEventListener("click", () => {
        if (spinning) return;

        spinning = true;

        const spins = Math.floor(Math.random() * 5) + 5;
        const extraDeg = Math.floor(Math.random() * 360);

        rotation += spins * 360 + extraDeg;
        wheel.style.transform = `rotate(${rotation}deg)`;

        setTimeout(() => {
            spinning = false;
        }, 4000);
    });
}