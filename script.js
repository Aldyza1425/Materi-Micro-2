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


    /* ==========================================================================
       4. CONTROL STRUCTURES TABS & MINI ANIMATION
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.structure-tabs .tab-btn');
    const tabPanes = document.querySelectorAll('.structure-panes .tab-pane');
    let activeStructureTimers = [];

    // Interactive Selection choice state
    let currentSelectionChoice = 'yes';
    const btnSelYes = document.getElementById('btn-sel-yes');
    const btnSelNo = document.getElementById('btn-sel-no');

    if (btnSelYes && btnSelNo) {
        btnSelYes.addEventListener('click', () => {
            if (currentSelectionChoice === 'yes') return;
            currentSelectionChoice = 'yes';
            btnSelYes.classList.add('active');
            btnSelNo.classList.remove('active');
            resetStructureAnimations();
        });
        btnSelNo.addEventListener('click', () => {
            if (currentSelectionChoice === 'no') return;
            currentSelectionChoice = 'no';
            btnSelYes.classList.remove('active');
            btnSelNo.classList.add('active');
            resetStructureAnimations();
        });
    }

    function clearStructureHighlights(flowType) {
        let svgId = `svg-${flowType}`;
        let svg = document.getElementById(svgId);
        if (!svg) return;

        svg.querySelectorAll('.flowchart-node').forEach(node => {
            node.classList.remove('active');
        });
        svg.querySelectorAll('path').forEach(path => {
            path.classList.remove('active-path-seq');
            path.classList.remove('active-path-sel');
            path.classList.remove('active-path-loop');
        });
    }

    function resetStructureAnimations() {
        activeStructureTimers.forEach(clearTimeout);
        activeStructureTimers = [];
        
        // Re-enable all animate buttons
        document.querySelectorAll('.btn-animate-flow').forEach(btn => {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-play"></i> Simulasikan Alur ' + 
                (btn.dataset.flow === 'sequence' ? 'Runtunan' : 
                 btn.dataset.flow === 'selection' ? 'Percabangan' : 'Perulangan');
        });

        // Clear all highlights
        clearStructureHighlights('sequence');
        clearStructureHighlights('selection');
        clearStructureHighlights('looping');

        // Clear visual classes
        const visSeq = document.getElementById('visual-sequence');
        if (visSeq) visSeq.className = 'analogi-visual-box block-sequence';
        const txtSeq = document.getElementById('status-sequence');
        if (txtSeq) txtSeq.textContent = 'Status: Siap menyeduh';

        const visSel = document.getElementById('visual-selection');
        if (visSel) visSel.className = 'analogi-visual-box block-selection';
        const txtSel = document.getElementById('status-selection');
        if (txtSel) txtSel.textContent = 'Status: Bersiap berangkat';

        const student = document.getElementById('sel-student');
        if (student) {
            student.style.left = "";
            student.style.bottom = "";
        }
        const scooter = document.getElementById('sel-scooter');
        if (scooter) {
            scooter.style.left = "";
        }

        const visLoop = document.getElementById('visual-looping');
        if (visLoop) visLoop.className = 'analogi-visual-box block-looping';
        const txtLoop = document.getElementById('status-looping');
        if (txtLoop) txtLoop.textContent = 'Status: Bersiap mengisi ember';
        
        const wWater = document.getElementById('loop-bucket-water');
        if (wWater) wWater.style.height = '0%';
        const wFace = document.getElementById('loop-bucket-face');
        if (wFace) {
            wFace.textContent = '◕ ◕';
            wFace.style.color = '#334155';
        }
    }

    // Tab switcher
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('active')) return;

            // Reset current running animations
            resetStructureAnimations();

            // Set active button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show corresponding pane
            const targetTab = btn.dataset.tab;
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `pane-${targetTab}`) {
                    pane.classList.add('active');
                }
            });
        });
    });

    // Run Mini Simulations for Control Structures
    const animateButtons = document.querySelectorAll('.btn-animate-flow');
    
    animateButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const flowType = btn.dataset.flow;
            
            // Disable button during animation
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mensimulasikan...';

            // Reset highlights first
            clearStructureHighlights(flowType);
            activeStructureTimers.forEach(clearTimeout);
            activeStructureTimers = [];

            const delay = 1800; // slightly longer time between steps for animations to breathe
            
            if (flowType === 'sequence') {
                const visBox = document.getElementById('visual-sequence');
                const statusTxt = document.getElementById('status-sequence');

                // Steps for Sequence: Start -> step1 -> step2 -> End
                const steps = [
                    { 
                        node: 'seq-node-start', 
                        path: null, 
                        status: 'Status: Alur dimulai, gelas disiapkan.',
                        action: () => {
                            visBox.className = 'analogi-visual-box block-sequence';
                        }
                    },
                    { 
                        node: 'seq-node-step1', 
                        path: 'seq-path-1', 
                        status: 'Status: Memasukkan susu bubuk cokelat.',
                        action: () => {
                            visBox.classList.add('step-powder');
                        }
                    },
                    { 
                        node: 'seq-node-step2', 
                        path: 'seq-path-2', 
                        status: 'Status: Menuangkan air panas & mengaduk.',
                        action: () => {
                            visBox.classList.add('step-liquid', 'step-stir', 'step-pour');
                        }
                    },
                    { 
                        node: 'seq-node-end', 
                        path: 'seq-path-3', 
                        status: 'Status: Selesai! Susu hangat siap disajikan! ☕',
                        action: () => {
                            visBox.classList.remove('step-stir', 'step-pour');
                            visBox.classList.add('step-steam');
                        }
                    }
                ];

                steps.forEach((step, idx) => {
                    let timer = setTimeout(() => {
                        clearStructureHighlights('sequence');
                        
                        // Highlight node
                        const nodeEl = document.getElementById(step.node);
                        if (nodeEl) nodeEl.classList.add('active');
                        // Highlight path leading to it
                        if (step.path) {
                            const pathEl = document.getElementById(step.path);
                            if (pathEl) pathEl.classList.add('active-path-seq');
                        }

                        // Trigger visual illustration animation
                        if (step.action) step.action();
                        if (statusTxt) statusTxt.textContent = step.status;

                        if (idx === steps.length - 1) {
                            // Finish
                            setTimeout(() => {
                                btn.disabled = false;
                                btn.innerHTML = '<i class="fa-solid fa-play"></i> Simulasikan Alur Runtunan';
                            }, delay);
                        }
                    }, idx * delay);
                    activeStructureTimers.push(timer);
                });

            } else if (flowType === 'selection') {
                const visBox = document.getElementById('visual-selection');
                const statusTxt = document.getElementById('status-selection');
                let steps = [];

                if (currentSelectionChoice === 'yes') {
                    // YES: Start -> Decision -> ProcessYes -> End
                    steps = [
                        { 
                            node: 'sel-node-start', 
                            path: null, 
                            status: 'Status: Alur dimulai, bersiap jalan.',
                            action: () => {
                                visBox.className = 'analogi-visual-box block-selection';
                                const student = document.getElementById('sel-student');
                                if (student) { student.style.left = ""; student.style.bottom = ""; }
                                const scooter = document.getElementById('sel-scooter');
                                if (scooter) { scooter.style.left = ""; }
                            }
                        },
                        { 
                            node: 'sel-node-decision', 
                            path: 'sel-path-1', 
                            status: 'Status: Keputusan - Apakah naik motor? (Ya)',
                            action: () => {
                                visBox.classList.add('step-ask');
                            }
                        },
                        { 
                            node: 'sel-node-process-yes', 
                            path: 'sel-path-yes', 
                            status: 'Status: Proses - Menggunakan helm pengaman.',
                            action: () => {
                                visBox.classList.remove('step-ask');
                                visBox.classList.add('step-helmet-drop');
                                
                                let t1 = setTimeout(() => {
                                    visBox.classList.remove('step-helmet-drop');
                                    visBox.classList.add('step-worn', 'step-ride');
                                }, 600);
                                activeStructureTimers.push(t1);
                            }
                        },
                        { 
                            node: 'sel-node-end', 
                            path: ['sel-path-join', 'sel-path-end'], 
                            status: 'Status: Selesai! Berangkat naik motor dengan aman 🛵',
                            action: () => {
                                visBox.classList.add('step-drive-off');
                            }
                        }
                    ];
                } else {
                    // NO: Start -> Decision -> End
                    steps = [
                        { 
                            node: 'sel-node-start', 
                            path: null, 
                            status: 'Status: Alur dimulai, bersiap jalan.',
                            action: () => {
                                visBox.className = 'analogi-visual-box block-selection';
                                const student = document.getElementById('sel-student');
                                if (student) { student.style.left = ""; student.style.bottom = ""; }
                                const scooter = document.getElementById('sel-scooter');
                                if (scooter) { scooter.style.left = ""; }
                            }
                        },
                        { 
                            node: 'sel-node-decision', 
                            path: 'sel-path-1', 
                            status: 'Status: Keputusan - Apakah naik motor? (Tidak)',
                            action: () => {
                                visBox.classList.add('step-ask');
                            }
                        },
                        { 
                            node: 'sel-node-end', 
                            path: 'sel-path-no', 
                            status: 'Status: Selesai! Berangkat jalan kaki dengan aman 🚶',
                            action: () => {
                                visBox.classList.remove('step-ask');
                                visBox.classList.add('step-walk-off');
                            }
                        }
                    ];
                }

                steps.forEach((step, idx) => {
                    let timer = setTimeout(() => {
                        clearStructureHighlights('selection');
                        
                        const nodeEl = document.getElementById(step.node);
                        if (nodeEl) nodeEl.classList.add('active');
                        if (step.path) {
                            if (Array.isArray(step.path)) {
                                step.path.forEach(p => {
                                    const pathEl = document.getElementById(p);
                                    if (pathEl) pathEl.classList.add('active-path-sel');
                                });
                            } else {
                                const pathEl = document.getElementById(step.path);
                                if (pathEl) pathEl.classList.add('active-path-sel');
                            }
                        }

                        // Trigger visual illustration animation
                        if (step.action) step.action();
                        if (statusTxt) statusTxt.textContent = step.status;

                        if (idx === steps.length - 1) {
                            setTimeout(() => {
                                btn.disabled = false;
                                btn.innerHTML = '<i class="fa-solid fa-play"></i> Simulasikan Alur Percabangan';
                            }, delay);
                        }
                    }, idx * delay);
                    activeStructureTimers.push(timer);
                });

            } else if (flowType === 'looping') {
                const visBox = document.getElementById('visual-looping');
                const statusTxt = document.getElementById('status-looping');
                const wWater = document.getElementById('loop-bucket-water');
                const wFace = document.getElementById('loop-bucket-face');

                // Steps for Looping (Simulate start -> process -> decision --loop--> process -> decision --no--> end)
                const steps = [
                    { 
                        node: 'loop-node-start', 
                        path: null, 
                        status: 'Status: Alur dimulai, siapkan ember kosong.',
                        action: () => {
                            visBox.className = 'analogi-visual-box block-looping';
                            if (wWater) wWater.style.height = '0%';
                            if (wFace) { wFace.textContent = '◕ ◕'; wFace.style.color = '#334155'; }
                        }
                    },
                    { 
                        node: 'loop-node-process', 
                        path: 'loop-path-1', 
                        status: 'Status: Proses - Menuangkan air gayung ke-1 ke dalam ember.',
                        action: () => {
                            visBox.classList.add('water-flowing');
                            if (wWater) wWater.style.height = '33%';
                            let t = setTimeout(() => {
                                visBox.classList.remove('water-flowing');
                            }, 1000);
                            activeStructureTimers.push(t);
                        }
                    },
                    { 
                        node: 'loop-node-decision', 
                        path: 'loop-path-2', 
                        status: 'Status: Keputusan - Apakah ember penuh? (Belum, baru 33%)',
                        action: () => {
                            // No action needed here
                        }
                    },
                    // Loop back 1
                    { 
                        node: 'loop-node-process', 
                        path: 'loop-path-yes', 
                        status: 'Status: Perulangan - Menuangkan air gayung ke-2.',
                        action: () => {
                            visBox.classList.add('water-flowing');
                            if (wWater) wWater.style.height = '66%';
                            let t = setTimeout(() => {
                                visBox.classList.remove('water-flowing');
                            }, 1000);
                            activeStructureTimers.push(t);
                        }
                    },
                    { 
                        node: 'loop-node-decision', 
                        path: 'loop-path-2', 
                        status: 'Status: Keputusan - Apakah ember penuh? (Belum, baru 66%)',
                        action: () => {
                            // No action needed here
                        }
                    },
                    // Loop back 2
                    { 
                        node: 'loop-node-process', 
                        path: 'loop-path-yes', 
                        status: 'Status: Perulangan - Menuangkan air gayung ke-3.',
                        action: () => {
                            visBox.classList.add('water-flowing');
                            if (wWater) wWater.style.height = '100%';
                            let t = setTimeout(() => {
                                visBox.classList.remove('water-flowing');
                            }, 1000);
                            activeStructureTimers.push(t);
                        }
                    },
                    { 
                        node: 'loop-node-decision', 
                        path: 'loop-path-2', 
                        status: 'Status: Keputusan - Apakah ember penuh? (Ya, ember penuh!)',
                        action: () => {
                            // No action needed here
                        }
                    },
                    // Exit
                    { 
                        node: 'loop-node-end', 
                        path: 'loop-path-no', 
                        status: 'Status: Selesai! Ember penuh terisi air. Perulangan berakhir 🪣✨',
                        action: () => {
                            visBox.classList.add('water-full');
                            if (wFace) { wFace.textContent = '◠‿◠'; wFace.style.color = '#ffffff'; }
                        }
                    }
                ];

                steps.forEach((step, idx) => {
                    let timer = setTimeout(() => {
                        clearStructureHighlights('looping');
                        
                        const nodeEl = document.getElementById(step.node);
                        if (nodeEl) nodeEl.classList.add('active');
                        if (step.path) {
                            const pathEl = document.getElementById(step.path);
                            if (pathEl) pathEl.classList.add('active-path-loop');
                        }

                        // Trigger visual illustration animation
                        if (step.action) step.action();
                        if (statusTxt) statusTxt.textContent = step.status;

                        if (idx === steps.length - 1) {
                            setTimeout(() => {
                                btn.disabled = false;
                                btn.innerHTML = '<i class="fa-solid fa-play"></i> Simulasikan Alur Perulangan';
                            }, delay);
                        }
                    }, idx * delay);
                    activeStructureTimers.push(timer);
                });
            }
        });
    });
});


