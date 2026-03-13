/* --- Selectors --- */
const usersView = document.getElementById('users-view');
let userNodes = []; // Will be populated in init()
const introView = document.getElementById('intro-view');
const calendarView = document.getElementById('calendar-view');
const mindmapView = document.getElementById('mindmap-view');
const summaryView = document.getElementById('summary-view');
const backToUsersBtn = document.getElementById('back-to-users-btn');
const rajatAdminBtn = document.getElementById('rajat-admin-btn');
const backFromSummaryBtn = document.getElementById('back-from-summary-btn');
const summaryContentArea = document.getElementById('summary-content');

const adminCalendarView = document.getElementById('admin-calendar-view');
const adminCalendarGrid = document.getElementById('admin-calendar-grid');
const adminMonthYearDisplay = document.getElementById('admin-month-year-display');
const adminPrevMonthBtn = document.getElementById('admin-prev-month');
const adminNextMonthBtn = document.getElementById('admin-next-month');
const adminBackToUsersBtn = document.getElementById('admin-back-to-users-btn');

const passwordModal = document.getElementById('password-modal');
const passwordInput = document.getElementById('admin-password-input');
const passwordSubmitBtn = document.getElementById('password-submit-btn');
const passwordCancelBtn = document.getElementById('password-cancel-btn');
const passwordError = document.getElementById('password-error');

const monthYearDisplay = document.getElementById('month-year-display');
const calendarGrid = document.getElementById('calendar-grid');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

const board = document.getElementById('board');
const linesLayer = document.getElementById('lines-layer');
const clearBtn = document.getElementById('clearBtn');
const startUatBtn = document.getElementById('startUatBtn');
const backBtn = document.getElementById('back-btn');
const currentDateTitle = document.getElementById('current-date-title');


/* --- Global State --- */
let currentUser = null; // Currently selected user

/* --- Calendar State --- */
let currentDate = new Date(); // Month currently viewing
let selectedDateString = null; // Currently selected date (YYYY-MM-DD)
let adminCurrentDate = new Date(); // Month currently viewing in admin calendar

/* --- Mindmap State --- */
let activeInput = null;
let selectedNodes = new Set();
let nodes = new Map(); // id -> { id, element, x, y, text }
let edges = []; // { source: id, target: id, element: pathElement }

let isDraggingNode = false;
let draggedNodeId = null;
let dragStartX = 0;
let dragStartY = 0;
let nodeStartX = 0;
let nodeStartY = 0;

let isDrawingEdge = false;
let edgeSourceId = null;
let drawingEdgeElement = null;

let nodeIdCounter = 0;


function generateId() {
    return 'node-' + Date.now() + '-' + (++nodeIdCounter);
}

/* --- Initialization --- */
function init() {

    // Hide Rajat's button if it is not Friday
    if (new Date().getDay() !== 5 && rajatAdminBtn) {
        rajatAdminBtn.style.display = 'none';
        rajatAdminBtn.style.pointerEvents = 'none';
    }

    // Calendar Event Listeners
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    backBtn.addEventListener('click', closeMindMap);

    // Board Event Listeners
    board.addEventListener('dblclick', handleBoardDoubleClick);
    board.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    clearBtn.addEventListener('click', clearBoard);
    document.addEventListener('keydown', handleKeyDown);
    if (backToUsersBtn) backToUsersBtn.addEventListener('click', backToUsers);

    if (adminPrevMonthBtn) adminPrevMonthBtn.addEventListener('click', () => changeAdminMonth(-1));
    if (adminNextMonthBtn) adminNextMonthBtn.addEventListener('click', () => changeAdminMonth(1));
    if (adminBackToUsersBtn) adminBackToUsersBtn.addEventListener('click', backToUsersFromAdminCalendar);

    // Summary View (Rajat's Tool) Event Listeners
    if (rajatAdminBtn) {
        rajatAdminBtn.addEventListener('click', () => {
            passwordInput.value = '';
            passwordError.style.display = 'none';
            passwordModal.classList.add('active');
            requestAnimationFrame(() => passwordInput.focus());
        });
    }
    if (backFromSummaryBtn) {
        backFromSummaryBtn.addEventListener('click', hideSummaryView);
    }

    // Password Modal Listeners
    if (passwordCancelBtn) {
        passwordCancelBtn.addEventListener('click', () => {
            passwordModal.classList.remove('active');
            passwordInput.blur();
        });
    }
    if (passwordSubmitBtn) {
        passwordSubmitBtn.addEventListener('click', handleAdminLogin);
    }
    if (passwordInput) {
        passwordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAdminLogin();
            if (e.key === 'Escape') {
                passwordModal.classList.remove('active');
                passwordInput.blur();
            }
        });
    }

    window.addEventListener('resize', () => requestAnimationFrame(updateAllEdges));

    // Generate Circle Positions for Users
    userNodes = document.querySelectorAll('.user-node:not(.admin-node)');
    const radius = 220; // Slightly smaller radius to ensure buttons stay within the 600px container
    const totalNodes = userNodes.length;

    userNodes.forEach((btn, index) => {
        // Calculate angle for evenly spaced positioning (starting from top)
        const angle = (index / totalNodes) * (2 * Math.PI) - (Math.PI / 2);

        // Convert polar coordinates to cartesian Cartesian
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // CSS expects left/top percent or px from the 50% 50% mark
        // Calculating explicit left/top px values to ensure perfect absolute positioning
        // without relying on margins which can get crushed inside flex layouts
        const centerX = 300; // Half of .user-nodes-container flex width (600px)
        const centerY = 300;

        btn.style.left = `${centerX + x}px`;
        btn.style.top = `${centerY + y}px`;

        btn.addEventListener('click', (e) => {
            currentUser = btn.textContent.trim();
            startMilkyWaySequence();
        });
    });

    renderCalendar();
}

function startMilkyWaySequence() {
    if (usersView) {
        usersView.classList.add('zoom-in');
        usersView.classList.remove('active');

        // Immediately kick off the inner galaxy to make it look like continuous travel
        if (introView) {
            introView.classList.add('active');
            setTimeout(() => {
                introView.classList.add('zoom-in');
            }, 600); // Wait for the outer galaxy to clear space

            setTimeout(() => {
                calendarView.classList.add('active');
            }, 1800);
        } else {
            setTimeout(() => { calendarView.classList.add('active'); }, 1000);
        }
    } else if (introView) {
        introView.classList.add('zoom-in');
        setTimeout(() => { calendarView.classList.add('active'); }, 1200);
    } else {
        calendarView.classList.add('active');
    }
}

function backToUsers() {
    // Hide calendar
    calendarView.classList.remove('active');

    // Reset the galaxies perfectly to jump backwards
    if (introView) {
        introView.classList.remove('zoom-in');
        introView.classList.remove('active');
    }

    if (usersView) {
        usersView.classList.remove('zoom-in');
        usersView.classList.add('active');
    }
}

/* --- Rajat's Summary Logic --- */
function getTodayPassword() {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}${m}${y}`;
}

function handleAdminLogin() {
    const inputPass = passwordInput.value.trim();
    if (inputPass === getTodayPassword()) {
        passwordModal.classList.remove('active');
        passwordInput.blur();
        showAdminCalendarView();
    } else {
        passwordError.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function showAdminCalendarView() {
    if (usersView) {
        usersView.classList.remove('active');
        usersView.classList.add('zoom-in');
    }

    if (adminCalendarView) {
        renderAdminCalendar();
        setTimeout(() => {
            adminCalendarView.classList.add('active');
        }, 300);
    }
}

function backToUsersFromAdminCalendar() {
    if (adminCalendarView) {
        adminCalendarView.classList.remove('active');
    }
    if (usersView) {
        usersView.classList.remove('zoom-in');
        usersView.classList.add('active');
    }
}

function renderAdminCalendar() {
    if (!adminCalendarGrid) return;
    adminCalendarGrid.innerHTML = '';

    const year = adminCurrentDate.getFullYear();
    const month = adminCurrentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    if (adminMonthYearDisplay) adminMonthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        fragment.appendChild(emptyDiv);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;

        const dateObj = new Date(year, month, i);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            dayDiv.classList.add('today');
        }

        // Only allow clicking if it's a Friday
        if (dateObj.getDay() === 5) {
            dayDiv.addEventListener('click', () => showSummaryView(dateStr));
        } else {
            dayDiv.classList.add('disabled-day');
        }

        fragment.appendChild(dayDiv);
    }
    adminCalendarGrid.appendChild(fragment);
}

function changeAdminMonth(delta) {
    adminCurrentDate.setMonth(adminCurrentDate.getMonth() + delta);
    renderAdminCalendar();
}

function showSummaryView(fridayDateStr) {
    if (adminCalendarView) {
        adminCalendarView.classList.remove('active');
        adminCalendarView.classList.add('zoomed-in');
    }

    if (summaryView) {
        summaryContentArea.innerHTML = '';

        const end = new Date(fridayDateStr);
        const users = Array.from(userNodes).map(n => n.textContent.trim());

        const fragment = document.createDocumentFragment();
        let anyActivityFound = false;

        users.forEach(user => {
            const records = [];

            for (let i = 6; i >= 0; i--) {
                const target = new Date(end);
                target.setDate(end.getDate() - i);
                const y = target.getFullYear();
                const m = String(target.getMonth() + 1).padStart(2, '0');
                const d = String(target.getDate()).padStart(2, '0');
                const dateStr = `${y}-${m}-${d}`;

                const saved = localStorage.getItem(`mindmap_${user}_${dateStr}`);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        const meaningfulNodes = parsed.nodes.filter(n => n.text.trim().length > 0 && !n.text.includes("What are you working on today?"));

                        if (meaningfulNodes.length > 0) {
                            records.push({ dateStr, nodes: meaningfulNodes });
                        }
                    } catch (e) { }
                }
            }

            if (records.length > 0) {
                anyActivityFound = true;
                const card = document.createElement('div');
                card.className = 'summary-card';
                card.innerHTML = `<h3 style="color:var(--primary-color)">${user}'s Week ending on ${fridayDateStr}</h3><hr/>`;

                records.forEach(record => {
                    card.innerHTML += `<p><strong style="color:var(--text-muted); font-size: 0.8em; text-transform:uppercase; letter-spacing:1px">${record.dateStr}</strong></p>`;
                    record.nodes.forEach((n) => {
                        const p = document.createElement('p');
                        p.textContent = `• ${n.text}`;
                        card.appendChild(p);
                    });
                });
                fragment.appendChild(card);
            }
        });

        if (!anyActivityFound) {
            summaryContentArea.innerHTML = `<div class="summary-card"><p>No meaningful activity found for this week.</p></div>`;
        } else {
            summaryContentArea.appendChild(fragment);
        }

        setTimeout(() => {
            summaryView.classList.add('active');
        }, 300);
    }
}

function hideSummaryView() {
    if (summaryView) summaryView.classList.remove('active');
    if (adminCalendarView) {
        adminCalendarView.classList.remove('zoomed-in');
        adminCalendarView.classList.add('active');
    }
}

/* --- Calendar Logic --- */
function renderCalendar() {
    calendarGrid.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    // Fill empty days before 1st of month
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        fragment.appendChild(emptyDiv);
    }

    const today = new Date();

    // Fill days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = i;

        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        let isToday = false;
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            isToday = true;
            dayDiv.classList.add('today');
        }

        // Check if data exists
        if (localStorage.getItem(`mindmap_${currentUser}_${dateStr}`)) {
            const dot = document.createElement('div');
            dot.className = 'has-data-dot';
            dayDiv.appendChild(dot);
        }

        // Make non-today dates uneditable (disabled in calendar)
        if (isToday) {
            dayDiv.addEventListener('click', () => openMindMap(dateStr));
        } else {
            dayDiv.classList.add('disabled-day');
        }

        fragment.appendChild(dayDiv);
    }
    calendarGrid.appendChild(fragment);
}

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderCalendar();
}

/* --- Navigation --- */
function openMindMap(dateStr) {
    selectedDateString = dateStr;
    const dateObj = new Date(dateStr + 'T00:00:00'); // Parse local time properly
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    currentDateTitle.textContent = dateObj.toLocaleDateString(undefined, options);

    loadMindMapState(dateStr);

    calendarView.classList.remove('active');
    calendarView.classList.add('zoomed-in');
    mindmapView.classList.add('active');
}

function closeMindMap() {
    saveMindMapState(); // Save before leaving

    // Clear DOM state
    Array.from(nodes.keys()).forEach(id => removeNodeFromDOM(id));
    edges.forEach(e => e.element.remove());
    nodes.clear();
    edges = [];
    selectedNodes.clear();
    if (activeInput) {
        activeInput.remove();
        activeInput = null;
    }

    selectedDateString = null;

    mindmapView.classList.remove('active');
    calendarView.classList.remove('zoomed-in');
    calendarView.classList.add('active');
    renderCalendar(); // Re-render to show new dots if created
}

/* --- State Management --- */
function saveMindMapState() {
    if (!selectedDateString) return;

    // Only save if we actually have nodes, else remove item
    if (nodes.size === 0) {
        localStorage.removeItem(`mindmap_${currentUser}_${selectedDateString}`);
        return;
    }

    const state = {
        nodes: Array.from(nodes.values()).map(n => ({ id: n.id, text: n.text, x: n.x, y: n.y, isUAT: n.isUAT })),
        edges: edges.map(e => ({ source: e.source, target: e.target })),
        uatState: typeof uatState !== 'undefined' ? uatState : { mindfulness: 0, clarityLevel: 0, devQaLevel: 0, uatLevel: 0 }
    };

    localStorage.setItem(`mindmap_${currentUser}_${selectedDateString}`, JSON.stringify(state));
}

function loadMindMapState(dateStr) {
    const saved = localStorage.getItem(`mindmap_${currentUser}_${dateStr}`);

    if (saved) {
        try {
            const state = JSON.parse(saved);
            if (state.uatState) uatState = state.uatState;
            else resetUatState();

            // Filter out any nodes that were in UAT_FORM state (incomplete)
            // or label them better. User wants to "remove" them.
            state.nodes.forEach(n => {
                if (n.text !== 'UAT_FORM') {
                    createNode(n.text || 'FORM_BLANK', n.x, n.y, null, n.id);
                }
            });
            state.edges.forEach(e => {
                // Only create edge if both source and target exist
                if (nodes.has(e.source) && nodes.has(e.target)) {
                    createEdge(e.source, e.target);
                }
            });
        } catch (e) {
            console.error("Failed to load map state", e);
            setupNewMap();
        }
    } else {
        setupNewMap();
    }
}

function setupNewMap() {
    startUATWorkflow();
}

function removeNodeFromDOM(id) {
    const node = nodes.get(id);
    if (!node) return;
    node.element.remove();
}

/* --- MindMap Logic --- */
function handleBoardDoubleClick(e) {
    if (!mindmapView.classList.contains('active')) return;
    if (e.target === board || e.target === linesLayer) {
        createNewTextInput(e.clientX, e.clientY);
    }
}

function handlePointerDown(e) {
    if (!mindmapView.classList.contains('active')) return;
    const target = e.target;
    const x = e.clientX;
    const y = e.clientY;

    if (target.classList.contains('connector')) {
        isDrawingEdge = true;
        edgeSourceId = target.dataset.nodeId;

        drawingEdgeElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        drawingEdgeElement.classList.add('connection-line', 'drawing');
        linesLayer.appendChild(drawingEdgeElement);

        updateDrawingEdge(x, y);

        target.setPointerCapture(e.pointerId);
        e.stopPropagation();
        return;
    }

    const nodeEl = target.closest('.node');
    const isInteractive = ['INPUT', 'TEXTAREA', 'BUTTON', 'LABEL'].includes(target.tagName);
    if (nodeEl && !isInteractive) {
        const id = nodeEl.dataset.id;
        selectNode(id, e.shiftKey);

        isDraggingNode = true;
        draggedNodeId = id;
        dragStartX = x;
        dragStartY = y;

        const node = nodes.get(id);
        nodeStartX = node.x;
        nodeStartY = node.y;

        nodeEl.classList.add('dragging');
        nodeEl.setPointerCapture(e.pointerId);
        e.stopPropagation();
        return;
    }

    if (target === board || target === linesLayer) {
        clearSelection();
    }
}

function handlePointerMove(e) {
    if (!mindmapView.classList.contains('active')) return;
    const x = e.clientX;
    const y = e.clientY;

    if (isDraggingNode && draggedNodeId) {
        const node = nodes.get(draggedNodeId);
        const dx = x - dragStartX;
        const dy = y - dragStartY;

        node.x = nodeStartX + dx;
        node.y = nodeStartY + dy;

        updateNodePosition(node);
        updateEdgesForNode(draggedNodeId);
    } else if (isDrawingEdge) {
        updateDrawingEdge(x, y);
    }
}

function handlePointerUp(e) {
    if (!mindmapView.classList.contains('active')) return;
    const target = e.target;
    const x = e.clientX;
    const y = e.clientY;

    if (isDraggingNode && draggedNodeId) {
        const nodeEl = nodes.get(draggedNodeId).element;
        isDraggingNode = false;
        nodeEl.classList.remove('dragging');
        try { nodeEl.releasePointerCapture(e.pointerId); } catch (err) { }
        draggedNodeId = null;
        saveMindMapState(); // Save purely node dragging position changes.
    } else if (isDrawingEdge) {
        isDrawingEdge = false;

        drawingEdgeElement.style.display = 'none';
        const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
        drawingEdgeElement.style.display = 'block';

        let targetNodeEl = dropTarget ? dropTarget.closest('.node') : null;

        if (targetNodeEl) {
            const targetId = targetNodeEl.dataset.id;
            if (targetId !== edgeSourceId) {
                createEdge(edgeSourceId, targetId);
                saveMindMapState();
            }
        } else {
            const input = createNewTextInput(x, y);
            input.dataset.sourceId = edgeSourceId;
        }

        drawingEdgeElement.remove();
        drawingEdgeElement = null;
        edgeSourceId = null;

        try { target.releasePointerCapture(e.pointerId); } catch (err) { }
    }
}

function updateDrawingEdge(targetX, targetY) {
    if (!drawingEdgeElement || !edgeSourceId) return;
    const sourceNode = nodes.get(edgeSourceId);
    if (!sourceNode) return;

    const startX = sourceNode.x + (sourceNode.element.offsetWidth / 2);
    const startY = sourceNode.y;

    const curveDistance = Math.max(Math.abs(targetX - startX) * 0.5, 50);
    const path = `M ${startX} ${startY} C ${startX + curveDistance} ${startY}, ${targetX - curveDistance} ${targetY}, ${targetX} ${targetY}`;
    drawingEdgeElement.setAttribute('d', path);
}

function updateEdgesForNode(nodeId) {
    edges.forEach(edge => {
        if (edge.source === nodeId || edge.target === nodeId) {
            updateEdgePath(edge);
        }
    });
}

function updateAllEdges() {
    edges.forEach(updateEdgePath);
}

function updateEdgePath(edge) {
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    if (!source || !target) return;

    const sourceEl = source.element;
    const targetEl = target.element;

    let startX = source.x;
    let startY = source.y;
    let endX = target.x;
    let endY = target.y;

    if (endX > startX + sourceEl.offsetWidth / 2) {
        startX += sourceEl.offsetWidth / 2;
        endX -= targetEl.offsetWidth / 2;
    } else if (endX < startX - sourceEl.offsetWidth / 2) {
        startX -= sourceEl.offsetWidth / 2;
        endX += targetEl.offsetWidth / 2;
    } else {
        if (endY > startY) {
            startY += sourceEl.offsetHeight / 2;
            endY -= targetEl.offsetHeight / 2;
        } else {
            startY -= sourceEl.offsetHeight / 2;
            endY += targetEl.offsetHeight / 2;
        }
    }

    const dx = endX - startX;
    const dy = endY - startY;
    const controlDist = Math.max(Math.abs(dx) * 0.5, Math.abs(dy) * 0.5, 50);

    let ctrl1X = startX;
    let ctrl1Y = startY;
    let ctrl2X = endX;
    let ctrl2Y = endY;

    if (Math.abs(dx) > Math.abs(dy)) {
        ctrl1X += (dx > 0 ? controlDist : -controlDist);
        ctrl2X -= (dx > 0 ? controlDist : -controlDist);
    } else {
        ctrl1Y += (dy > 0 ? controlDist : -controlDist);
        ctrl2Y -= (dy > 0 ? controlDist : -controlDist);
    }

    edge.element.setAttribute('d', `M ${startX} ${startY} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${endX} ${endY}`);
}

function createEdge(sourceId, targetId) {
    if (edges.some(e => e.source === sourceId && e.target === targetId)) return;

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.classList.add('connection-line');
    linesLayer.appendChild(pathElement);

    const edge = { source: sourceId, target: targetId, element: pathElement };
    edges.push(edge);

    requestAnimationFrame(() => updateEdgePath(edge));
}

function removeEdgesForNode(nodeId) {
    edges = edges.filter(edge => {
        if (edge.source === nodeId || edge.target === nodeId) {
            edge.element.remove();
            return false;
        }
        return true;
    });
}

function updateNodePosition(node) {
    node.element.style.left = `${node.x}px`;
    node.element.style.top = `${node.y}px`;
}

function createNewTextInput(x, y, initialText = '', replaceNodeId = null) {
    if (activeInput) {
        finalizeInput(activeInput);
    }

    const input = document.createElement('div');
    input.contentEditable = "true";
    input.className = 'text-input';
    input.textContent = initialText;

    input.style.left = `${x}px`;
    input.style.top = `${y}px`;

    if (replaceNodeId) {
        input.dataset.replaceId = replaceNodeId;
    }

    input.addEventListener('blur', () => {
        finalizeInput(input);
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            input.blur();
        }
        if (e.key === 'Escape') {
            if (!replaceNodeId) input.textContent = '';
            input.blur();
        }
    });

    board.appendChild(input);

    requestAnimationFrame(() => {
        input.focus();
        if (initialText) {
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(input);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });

    activeInput = input;
    clearSelection();
    return input;
}

function finalizeInput(input) {
    if (!input || !input.parentNode) return;

    const text = input.textContent.trim();
    const x = parseFloat(input.style.left);
    const y = parseFloat(input.style.top);
    const replaceId = input.dataset.replaceId;
    const sourceId = input.dataset.sourceId;

    input.remove();
    if (activeInput === input) {
        activeInput = null;
    }

    if (text) {
        if (replaceId) {
            const node = nodes.get(replaceId);
            if (node) {
                Array.from(node.element.childNodes)
                    .filter(n => n.nodeType === Node.TEXT_NODE)
                    .forEach(n => n.remove());
                node.element.insertBefore(document.createTextNode(text), node.element.firstChild);
                node.text = text;
                requestAnimationFrame(() => updateEdgesForNode(replaceId));
                saveMindMapState();
            }
        } else {
            createNode(text, x, y, sourceId);
            saveMindMapState();
        }
    } else if (replaceId) {
        deleteNode(replaceId);
        saveMindMapState();
    }
}

function createNode(text, x, y, connectFromId = null, forcedId = null) {
    const id = forcedId || generateId();

    const el = document.createElement('div');
    el.className = 'node';
    el.dataset.id = id;

    el.appendChild(document.createTextNode(text));

    const connector = document.createElement('div');
    connector.className = 'connector';
    connector.innerHTML = '+';
    connector.dataset.nodeId = id;
    el.appendChild(connector);

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    el.addEventListener('dblclick', (e) => {
        if (e.target.classList.contains('connector')) return;

        const node = nodes.get(id);
        const currentText = node.text;

        createNewTextInput(node.x, node.y, currentText, id);
        e.stopPropagation();
    });

    board.appendChild(el);

    const node = { id, element: el, x, y, text };
    nodes.set(id, node);

    selectNode(id, false);

    if (connectFromId) {
        createEdge(connectFromId, id);
    }

    return id;
}

function selectNode(id, multi = false) {
    if (!multi) {
        clearSelection();
    }
    selectedNodes.add(id);
    const node = nodes.get(id);
    if (node) {
        node.element.classList.add('selected');
    }
}

function clearSelection() {
    selectedNodes.forEach(id => {
        const node = nodes.get(id);
        if (node) {
            node.element.classList.remove('selected');
        }
    });
    selectedNodes.clear();
}

function deleteNode(id) {
    const node = nodes.get(id);
    if (node) {
        removeEdgesForNode(id);
        node.element.remove();
        nodes.delete(id);
        selectedNodes.delete(id);
    }
}

function handleKeyDown(e) {
    if (!mindmapView.classList.contains('active')) return;
    
    // Don't trigger delete if user is typing in an input or textarea
    const isEditing = document.activeElement && 
                     (document.activeElement.tagName === 'INPUT' || 
                      document.activeElement.tagName === 'TEXTAREA' || 
                      document.activeElement.isContentEditable);
                      
    if ((e.key === 'Delete' || e.key === 'Backspace') && !activeInput && !isEditing && selectedNodes.size > 0) {
        selectedNodes.forEach(id => deleteNode(id));
        saveMindMapState();
        e.preventDefault();
    }
}

function clearBoard() {
    if (confirm('Clear the entire mindmap for this date?')) {
        Array.from(nodes.keys()).forEach(id => deleteNode(id));
        if (activeInput) {
            activeInput.remove();
            activeInput = null;
        }
        clearSelection();
        saveMindMapState();
    }
}



// --- UAT Logic ---
let uatState = { mindfulness: 0, clarityLevel: 0, devQaLevel: 0, uatLevel: 0 };
init();
const JARGON = ["api", "database", "endpoint", "refactor", "server", "json", "sql", "latency", "frontend", "backend", "deployment pipeline", "repo", "commit"];

function resetUatState() {
    uatState = { mindfulness: 0, clarityLevel: 0, devQaLevel: 0, uatLevel: 0 };
}

const UAT_STEPS = {
    'NODE_1': {
        question: "Define the scope: What are you working on? What is the feature? What does it do?",
        type: 'textarea',
        process: (text) => {
            const words = text.trim().split(/\s+/).length;
            const lowerText = text.toLowerCase();
            const jargonCount = JARGON.reduce((count, word) => count + (lowerText.includes(word) ? 1 : 0), 0);
            if (jargonCount >= 2) {
                uatState.devQaLevel += 1; uatState.clarityLevel -= 1; return 'NODE_1A';
            } else if (jargonCount <= 1 && words > 15) {
                uatState.clarityLevel += 1; uatState.uatLevel += 1; return 'NODE_2';
            } else {
                uatState.clarityLevel -= 1; return 'NODE_1B';
            }
        }
    },
    'NODE_1A': {
        question: "Error: High technical jargon detected. UAT is strictly for business processes. You are sounding like a developer. Rewrite your definition using only business terms.",
        type: 'textarea',
        process: (text) => UAT_STEPS['NODE_1'].process(text)
    },
    'NODE_1B': {
        question: "Error: Insufficient detail. Explain the feature thoroughly.",
        type: 'button',
        buttonText: "Acknowledge and Retry",
        process: () => 'NODE_1'
    },
    'NODE_2': {
        question: "How does this feature impact the business?",
        type: 'radio',
        options: [
            "It makes the system run faster or fixes a backend error.",
            "It changes a specific user workflow, saves time, or protects revenue.",
            "I am not sure / It does not directly impact the business."
        ],
        process: (idx) => {
            if (idx === 0) { uatState.devQaLevel += 2; uatState.mindfulness -= 1; return 'NODE_3'; }
            if (idx === 1) { uatState.uatLevel += 1; uatState.mindfulness += 1; uatState.clarityLevel += 1; return 'NODE_3'; }
            uatState.mindfulness -= 2; uatState.uatLevel -= 2; return 'NODE_2A';
        }
    },
    'NODE_2A': {
        question: "Hard Stop. If there is no measurable business impact, we do not spend payroll on UAT. Reject this ticket back to the Product Owner.",
        type: 'terminal'
    },
    'NODE_3': {
        question: "Risk Assessment: What happens if this fix is deployed? What happens if it is NOT deployed?",
        type: 'radio',
        options: [
            "Deployment: Code is cleaner. Non-deployment: Nothing changes for the end user.",
            "Deployment: User gets a new button. Non-deployment: User has to use a slight workaround.",
            "Deployment: A critical workflow is unlocked. Non-deployment: The business loses time, money, or data."
        ],
        process: (idx) => {
            if (idx === 0) { uatState.devQaLevel += 1; return 'NODE_2A'; }
            if (idx === 1) { return 'NODE_4'; } /* +0 mindfulness */
            uatState.mindfulness += 2; uatState.uatLevel += 1; return 'NODE_4';
        }
    },
    'NODE_4': {
        question: "What specific scenarios will you test?",
        type: 'radio',
        options: [
            "I will test valid and invalid inputs on the specific form fields.",
            "I will log in, click the new feature, verify it works, and log out.",
            "I will execute a full day-in-the-life workflow involving multiple steps, distractions, and hand-offs."
        ],
        process: (idx) => {
            if (idx === 0) { uatState.devQaLevel += 2; uatState.uatLevel -= 1; return 'NODE_4A'; }
            if (idx === 1) { uatState.devQaLevel += 1; uatState.uatLevel -= 1; return 'NODE_4A'; }
            uatState.uatLevel += 2; uatState.mindfulness += 1; return 'NODE_5';
        }
    },
    'NODE_4A': {
        question: "Warning: You are describing functional/unit testing. UAT requires testing the 'Human Path' (distractions, wrong clicks, system switching). Check the box below to commit to end-to-end workflows.",
        type: 'checkbox',
        options: ["I commit to end-to-end testing"],
        process: (checkedIndices) => {
            if (checkedIndices.length === 0) return 'NODE_4A';
            return 'NODE_5';
        }
    },
    'NODE_5': {
        question: "Are these test cases executed by Dev QA?",
        type: 'radio',
        options: [
            "Yes, Dev QA has passed all baseline functional checks.",
            "No, QA skipped this.",
            "I do not know what QA tested."
        ],
        process: (idx) => {
            if (idx === 0) { uatState.clarityLevel += 1; return 'NODE_6'; }
            uatState.mindfulness -= 2; return 'NODE_5A';
        }
    },
    'NODE_5A': {
        question: "Hard Stop. You cannot build UAT in a vacuum, and UAT is not a safety net for untested code. Retrieve the QA matrix, confirm the functional baseline, and restart this process.",
        type: 'terminal'
    },
    'NODE_6': {
        question: "Since Dev QA tested it, are you just duplicating work?",
        type: 'radio',
        options: [
            "Yes, I am double-checking their exact steps to be safe.",
            "No, I am testing entirely different behavioral aspects."
        ],
        process: (idx) => {
            if (idx === 0) { uatState.devQaLevel += 3; uatState.mindfulness -= 1; uatState.uatLevel -= 2; return 'NODE_6A'; }
            uatState.mindfulness += 1; uatState.uatLevel += 1; return 'NODE_7';
        }
    },
    'NODE_6A': {
        question: "Error: Duplication is a waste of company time. QA tested if the engine turns on. Your job is to test if the car drives in the snow. Do not repeat functional checks.",
        type: 'checkbox',
        options: ["I acknowledge I must elevate my scenarios"],
        process: (checkedIndices) => {
            if (checkedIndices.length === 0) return 'NODE_6A';
            return 'NODE_7';
        }
    },
    'NODE_7': {
        question: "Select the specific UAT-level scenarios you will execute. Select all that apply.",
        type: 'checkbox_multi',
        options: [
            "Testing with real, unstructured, or 'dirty' data.",
            "Testing user permissions and role restrictions.",
            "Testing the system's database schema.",
            "Testing API response codes.",
            "Testing hand-offs between two different departments."
        ],
        process: (checkedIndices) => {
            if (checkedIndices.length === 0) return 'NODE_7';
            let has3or4 = checkedIndices.includes(2) || checkedIndices.includes(3);
            let has12or5 = checkedIndices.includes(0) || checkedIndices.includes(1) || checkedIndices.includes(4);
            if (has3or4) {
                uatState.devQaLevel += 2; return 'NODE_7A';
            } else if (has12or5) {
                uatState.uatLevel += 2; uatState.mindfulness += 1; return 'NODE_8';
            }
            return 'NODE_7';
        }
    },
    'NODE_7A': {
        question: "Warning: Checking schemas and API codes is Dev QA work. You must focus strictly on the user interface and business process.",
        type: 'checkbox',
        options: ["I will drop the technical checks"],
        process: (checkedIndices) => {
            if (checkedIndices.length === 0) return 'NODE_7A';
            return 'NODE_8';
        }
    },
    'NODE_8': {
        question: "How can external factors impact this internal system?",
        type: 'radio',
        options: [
            "External factors do not apply; this is a closed system.",
            "External formatting pasted into text fields, browser caching issues, or third-party downtime."
        ],
        process: (idx) => {
            if (idx === 0) { uatState.mindfulness -= 1; return 'NODE_8A'; }
            uatState.mindfulness += 2; uatState.uatLevel += 1; return 'NODE_9';
        }
    },
    'NODE_8A': {
        question: "Error: Every system exists in an ecosystem. You must consider network drops, legacy timeouts, and user hardware limitations.",
        type: 'checkbox',
        options: ["I will account for external variables"],
        process: (checkedIndices) => {
            if (checkedIndices.length === 0) return 'NODE_8A';
            return 'NODE_9';
        }
    },
    'NODE_9': {
        question: "Calculation Engine Output",
        type: 'eval',
        process: () => {
            if (uatState.devQaLevel >= 4) {
                return "UAT Request Denied. Your approach is overwhelmingly technical. You are acting as a secondary QA team, not a business advocate. Rewrite your entire strategy.";
            } else if (uatState.mindfulness <= 1) {
                return "UAT Request Denied. You have not demonstrated a clear understanding of the business risk or the external environment. Speak with the Product Owner before proceeding.";
            } else if (uatState.clarityLevel <= 0) {
                return "UAT Request Denied. You cannot articulate the feature's value without relying on technical jargon. If you cannot explain it simply, you cannot test it from a user's perspective.";
            } else if (uatState.uatLevel >= 4 && uatState.mindfulness >= 3) {
                return "Testing Strategy Approved. You have successfully demonstrated a high UAT Level, focus on user workflow, business impact, and systemic risks. You are authorized to begin UAT Execution.";
            } else {
                return "UAT Request Pending. Your strategy is functional but lacks depth. Please review your scenarios with the UAT Lead for final sign-off.";
            }
        }
    }
};

function startUATWorkflow() {
    resetUatState();
    updateUatMetricsUI();
    const startX = window.innerWidth / 2 - 300 + (Math.random() * 50 - 25);
    const startY = window.innerHeight / 2 - 200 + (Math.random() * 50 - 25);
    createUATQuestionNode('NODE_1', startX, startY, null);
    saveMindMapState();
}

function updateUatMetricsUI() {
    const mindDisplay = document.getElementById('metric-mind');
    const clarityDisplay = document.getElementById('metric-clarity');
    const devDisplay = document.getElementById('metric-dev');
    const uatDisplay = document.getElementById('metric-uat');
    if (mindDisplay) mindDisplay.textContent = uatState.mindfulness;
    if (clarityDisplay) clarityDisplay.textContent = uatState.clarityLevel;
    if (devDisplay) devDisplay.textContent = uatState.devQaLevel;
    if (uatDisplay) uatDisplay.textContent = uatState.uatLevel;
}

function createUATQuestionNode(stepId, x, y, connectFromId) {
    const step = UAT_STEPS[stepId];
    const qText = step.question;
    const qNodeId = createNode(qText, x, y, connectFromId);

    // spawn answer node explicitly offset
    createUATAnswerNode(stepId, x + 350, y, qNodeId);
    return qNodeId;
}

function createUATAnswerNode(stepId, x, y, connectFromId) {
    const step = UAT_STEPS[stepId];
    const aNodeId = generateId();

    const el = document.createElement('div');
    el.className = 'node uat-answer-node';
    el.dataset.id = aNodeId;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    let answerContent = null;

    if (step.type === 'textarea') {
        const textarea = document.createElement('textarea');
        textarea.placeholder = "Enter your answer here...";
        const btn = document.createElement('button');
        btn.textContent = "Submit";
        btn.onclick = () => {
            if (textarea.value.trim() === '') return;
            submitUATAnswer(stepId, aNodeId, textarea.value);
        };
        el.appendChild(textarea);
        el.appendChild(btn);
        answerContent = textarea;
    } else if (step.type === 'radio') {
        step.options.forEach((opt, idx) => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `uat-radio-${aNodeId}`;
            radio.value = idx;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(opt));
            el.appendChild(label);
        });
        const btn = document.createElement('button');
        btn.textContent = "Submit";
        btn.className = "uat-btn";
        btn.onclick = () => {
            const selected = el.querySelector('input[type="radio"]:checked');
            if (selected) submitUATAnswer(stepId, aNodeId, parseInt(selected.value));
        };
        el.appendChild(btn);
    } else if (step.type === 'checkbox' || step.type === 'checkbox_multi') {
        step.options.forEach((opt, idx) => {
            const label = document.createElement('label');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = idx;
            label.appendChild(cb);
            label.appendChild(document.createTextNode(opt));
            el.appendChild(label);
        });
        const btn = document.createElement('button');
        btn.textContent = "Submit";
        btn.className = "uat-btn";
        btn.onclick = () => {
            const checked = Array.from(el.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
            if (checked.length > 0) submitUATAnswer(stepId, aNodeId, checked);
            else alert("Please select at least one option."); // User wants mandatory
        };
        el.appendChild(btn);
    } else if (step.type === 'button') {
        const btn = document.createElement('button');
        btn.textContent = step.buttonText;
        btn.className = "uat-btn";
        btn.onclick = () => submitUATAnswer(stepId, aNodeId, null);
        el.appendChild(btn);
    }

    const connector = document.createElement('div');
    connector.className = 'connector';
    connector.innerHTML = '+';
    connector.dataset.nodeId = aNodeId;
    el.appendChild(connector);

    board.appendChild(el);

    const node = { id: aNodeId, element: el, x, y, text: "UAT_FORM", isUAT: true };
    nodes.set(aNodeId, node);
    if (connectFromId) createEdge(connectFromId, aNodeId);

    if (answerContent && answerContent.focus) {
        setTimeout(() => answerContent.focus(), 100);
    }

    return aNodeId;
}

function submitUATAnswer(stepId, answerNodeId, value) {
    const step = UAT_STEPS[stepId];
    const nextStepId = step.process(value);

    const aNode = nodes.get(answerNodeId);

    aNode.element.innerHTML = '';
    aNode.element.classList.remove('uat-answer-node');

    let displayValue = '';
    if (step.type === 'textarea') displayValue = value;
    else if (step.type === 'radio') displayValue = step.options[value];
    else if (step.type === 'checkbox' || step.type === 'checkbox_multi') {
        displayValue = value.map(idx => step.options[idx]).join('\n');
    } else if (step.type === 'button') displayValue = "Acknowledged";

    aNode.element.appendChild(document.createTextNode(displayValue));
    aNode.text = displayValue;
    aNode.isUAT = false; // Freeze it

    const connector = document.createElement('div');
    connector.className = 'connector';
    connector.innerHTML = '+';
    connector.dataset.nodeId = answerNodeId;
    aNode.element.appendChild(connector);

    aNode.element.addEventListener('dblclick', (e) => {
        if (e.target.classList.contains('connector')) return;
        createNewTextInput(aNode.x, aNode.y, aNode.text, aNode.id);
        e.stopPropagation();
    });

    updateUatMetricsUI();
    saveMindMapState();

    const nextStep = UAT_STEPS[nextStepId];
    if (nextStep) {
        if (nextStep.type === 'terminal') {
            createNode(nextStep.question, aNode.x, aNode.y + 150, aNode.id);
        } else if (nextStep.type === 'eval') {
            createNode(nextStep.process(), aNode.x, aNode.y + 150, aNode.id);
        } else {
            createUATQuestionNode(nextStepId, aNode.x, aNode.y + 150, aNode.id);
        }
        saveMindMapState();
    }
}
