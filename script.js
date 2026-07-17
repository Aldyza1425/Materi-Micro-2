/* ==========================================================================
   FLOWCHART ADVENTURE - JS INTERACTION & SIMULATION ENGINE
   Handles: Weather control, SVG Flowchart Animation, Character, Matching Game, & Quiz
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. STATE VARIABLES
       ========================================================================== */
    let currentWeather = 'sunny';
    let simActive = false;
    let simTimeouts = [];
    
    // Steps sequence configuration
    const stepsData = {
        sunny: [
            {
                node: 'node-start',
                path: null,
                title: 'Langkah 1: Mulai Alur',
                log: 'START: Alur logika program dimulai.',
                speech: 'Halo! Kita mulai petualangan logika kita dari simbol Start (Terminator berbentuk Oval).'
            },
            {
                node: 'node-check',
                path: 'path-start-check',
                title: 'Langkah 2: Input Kondisi Cuaca',
                log: 'INPUT: Mengamati cuaca di luar jendela.',
                speech: 'Di simbol Jajaran Genjang ini, kita menerima data (Input) dengan melihat keluar jendela. Cuaca hari ini adalah: CERAH.'
            },
            {
                node: 'node-decision',
                path: 'path-check-decision',
                title: 'Langkah 3: Mengambil Keputusan',
                log: 'DECISION: Mengecek apakah hari ini hujan.',
                speech: 'Di simbol Belah Ketupat (Decision), kita menguji logika: Apakah hari ini hujan? Jawabannya adalah TIDAK.'
            },
            {
                node: 'node-out-process',
                path: 'path-decision-no',
                title: 'Langkah 4: Proses Keluar Rumah',
                log: 'PROCESS: Bersiap dan melangkah keluar rumah.',
                speech: 'Karena TIDAK hujan, alur mengalir ke bawah. Kita memakai kacamata hitam dan langsung melangkah keluar rumah! Pintu terbuka.',
                action: (char, door, accessory) => {
                    accessory.className = 'avatar-accessory sunglasses';
                    door.classList.add('open');
                    setTimeout(() => {
                        char.style.transform = 'translateX(-70px) translateY(10px)';
                    }, 500);
                }
            },
            {
                node: 'node-end',
                path: 'path-join-end',
                title: 'Langkah 5: Selesai',
                log: 'END: Alur berakhir dengan aman.',
                speech: 'Hore! Alur logika berakhir di simbol End. Karakter kita telah berhasil keluar rumah saat hari cerah dengan bergaya!'
            }
        ],
        rainy: [
            {
                node: 'node-start',
                path: null,
                title: 'Langkah 1: Mulai Alur',
                log: 'START: Alur logika program dimulai.',
                speech: 'Halo! Kita mulai petualangan logika kita dari simbol Start (Terminator berbentuk Oval).'
            },
            {
                node: 'node-check',
                path: 'path-start-check',
                title: 'Langkah 2: Input Kondisi Cuaca',
                log: 'INPUT: Mengamati cuaca di luar jendela.',
                speech: 'Di simbol Jajaran Genjang ini, kita menerima data (Input) dengan melihat keluar jendela. Cuaca hari ini adalah: HUJAN.'
            },
            {
                node: 'node-decision',
                path: 'path-check-decision',
                title: 'Langkah 3: Mengambil Keputusan',
                log: 'DECISION: Mengecek apakah hari ini hujan.',
                speech: 'Di simbol Belah Ketupat (Decision), kita menguji logika: Apakah hari ini hujan? Jawabannya adalah YA.'
            },
            {
                node: 'node-yes-process',
                path: 'path-decision-yes',
                title: 'Langkah 4: Proses Membuka Payung',
                log: 'PROCESS: Mengambil dan membuka payung pelindung.',
                speech: 'Karena YA hujan, alur mengalir ke kanan. Kita melakukan Proses: mengambil dan membuka payung pelindung kita!',
                action: (char, door, accessory) => {
                    accessory.className = 'avatar-accessory umbrella';
                }
            },
            {
                node: 'node-out-process',
                path: 'path-yes-join',
                title: 'Langkah 5: Proses Keluar Rumah',
                log: 'PROCESS: Keluar rumah menggunakan payung.',
                speech: 'Sekarang alur berlanjut ke bawah. Kita aman melangkah keluar rumah karena sudah menggunakan payung sebagai pelindung hujan! Pintu terbuka.',
                action: (char, door, accessory) => {
                    door.classList.add('open');
                    setTimeout(() => {
                        char.style.transform = 'translateX(-70px) translateY(10px)';
                    }, 500);
                }
            },
            {
                node: 'node-end',
                path: 'path-join-end',
                title: 'Langkah 6: Selesai',
                log: 'END: Alur berakhir dengan aman.',
                speech: 'Hore! Alur logika berakhir di simbol End. Karakter kita telah berhasil keluar rumah dengan aman menggunakan payung!'
            }
        ]
    };

    /* ==========================================================================
       2. WEATHER & ENVIRONMENT CONTROLS
       ========================================================================== */
    const btnSunny = document.getElementById('btn-weather-sunny');
    const btnRainy = document.getElementById('btn-weather-rainy');
    const skyBg = document.querySelector('.sky-bg');
    const envBadge = document.getElementById('env-status-badge');
    const rainDropsContainer = document.getElementById('rain-drops');
    
    // Character Visuals
    const avatarCharacter = document.getElementById('avatar-character');
    const houseDoor = document.getElementById('house-door');
    const avatarAccessory = document.getElementById('avatar-accessory');

    // Speech & Simulator UI Elements
    const speechTitle = document.getElementById('speech-title');
    const speechText = document.getElementById('speech-text');
    const stepsTracker = document.getElementById('steps-tracker');
    const btnRunSim = document.getElementById('btn-run-sim');
    const btnResetSim = document.getElementById('btn-reset-sim');

    // Create rain drops dynamically for realistic rain effect
    function createRain() {
        rainDropsContainer.innerHTML = '';
        const numDrops = 40;
        for (let i = 0; i < numDrops; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.top = `${Math.random() * -20}px`;
            drop.style.animationDelay = `${Math.random() * 1}s`;
            drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
            rainDropsContainer.appendChild(drop);
        }
    }

    // Toggle Weather State
    function setWeather(weather) {
        if (simActive) return; // Prevent toggling mid-simulation
        
        currentWeather = weather;
        if (weather === 'sunny') {
            btnSunny.classList.add('active');
            btnRainy.classList.remove('active');
            skyBg.className = 'sky-bg day';
            envBadge.textContent = 'Cerah';
            envBadge.className = 'badge-env cerah';
            rainDropsContainer.innerHTML = '';
            
            // Adjust Subtitle on Keluar Rumah node in SVG for Sunny
            document.querySelector('#node-out-process .node-text-sub').textContent = 'Tanpa Payung';
        } else {
            btnSunny.classList.remove('active');
            btnRainy.classList.add('active');
            skyBg.className = 'sky-bg storm';
            envBadge.textContent = 'Hujan';
            envBadge.className = 'badge-env hujan';
            createRain();
            
            // Adjust Subtitle on Keluar Rumah node in SVG for Rainy
            document.querySelector('#node-out-process .node-text-sub').textContent = 'Membawa Payung';
        }
    }

    btnSunny.addEventListener('click', () => setWeather('sunny'));
    btnRainy.addEventListener('click', () => setWeather('rainy'));

    /* ==========================================================================
       3. SIMULATOR LOGIC EXECUTOR
       ========================================================================== */
    function clearHighlights() {
        document.querySelectorAll('.flowchart-node').forEach(node => {
            node.classList.remove('active');
        });
        document.querySelectorAll('path').forEach(path => {
            path.classList.remove('active-path');
        });
    }

    function resetSimulation() {
        // Clear all timers
        simTimeouts.forEach(clearTimeout);
        simTimeouts = [];
        
        simActive = false;
        clearHighlights();
        
        // Reset Avatar & Door animations
        avatarCharacter.style.transform = 'none';
        houseDoor.classList.remove('open');
        avatarAccessory.className = 'avatar-accessory';

        // Reset text boxes
        speechTitle.textContent = 'Instruksi Simulasi';
        speechText.innerHTML = 'Klik tombol <strong>"Jalankan Simulasi Alur"</strong> di atas untuk melihat bagaimana data dan keputusan mengalir di dalam flowchart!';
        stepsTracker.innerHTML = '';

        // Reset control state buttons
        btnRunSim.disabled = false;
        btnResetSim.disabled = true;
        btnSunny.disabled = false;
        btnRainy.disabled = false;
    }

    function runSimulation() {
        simActive = true;
        btnRunSim.disabled = true;
        btnResetSim.disabled = false;
        btnSunny.disabled = true;
        btnRainy.disabled = true;
        
        stepsTracker.innerHTML = '';
        clearHighlights();

        const currentSteps = stepsData[currentWeather];
        const stepDelay = 2200; // Duration of each step in milliseconds

        currentSteps.forEach((step, idx) => {
            const timeoutId = setTimeout(() => {
                // Clear previous highlight
                clearHighlights();

                // Highlight current node
                const nodeEl = document.getElementById(step.node);
                if (nodeEl) nodeEl.classList.add('active');

                // Highlight connection path to this node
                if (step.path) {
                    const pathEl = document.getElementById(step.path);
                    if (pathEl) pathEl.classList.add('active-path');
                    
                    // Highlight preceding path as well if connecting shapes need it
                    if (step.node === 'node-out-process' && currentWeather === 'rainy') {
                        document.getElementById('path-decision-yes').classList.add('active-path');
                    }
                }

                // Update Speech Bubble
                speechTitle.textContent = step.title;
                speechText.textContent = step.speech;

                // Add step to execution log tracker
                const logItem = document.createElement('div');
                logItem.className = 'step-log-item active';
                logItem.innerHTML = `<span class="step-num">> STEP ${idx + 1}:</span> <span class="step-text">${step.log}</span>`;
                stepsTracker.appendChild(logItem);
                
                // De-activate previous log entries text highlight style
                const childItems = stepsTracker.children;
                if (childItems.length > 1) {
                    childItems[childItems.length - 2].classList.remove('active');
                }
                
                // Scroll tracker log automatically
                stepsTracker.scrollTop = stepsTracker.scrollHeight;

                // Execute custom character movements
                if (step.action) {
                    step.action(avatarCharacter, houseDoor, avatarAccessory);
                }

                // If this is the last step, mark simulator as ended
                if (idx === currentSteps.length - 1) {
                    simActive = false;
                    btnResetSim.disabled = false;
                }

            }, idx * stepDelay);

            simTimeouts.push(timeoutId);
        });
    }

    btnRunSim.addEventListener('click', runSimulation);
    btnResetSim.addEventListener('click', resetSimulation);

    // Initialize environment weather on load
    setWeather('sunny');
});
