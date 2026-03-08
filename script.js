const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab";
let allIssues = [];       
let currentFilter = 'all';


const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = document.getElementById('username').value;
        const p = document.getElementById('password').value;
        
        if (u === 'admin' && p === 'admin123') {
            localStorage.setItem('isLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid Credentials');
        }
    });
}


async function initDashboard() {
    if (!document.getElementById('issuesGrid')) return;

    toggleLoader(true);
    try {
        const response = await fetch(`${API_BASE}/issues`);
        if (!response.ok) throw new Error("Failed to fetch issues");
        
        const json = await response.json();
        allIssues = Array.isArray(json) ? json : (json.data || []);
        
        updateUI('all');
        renderIssues(allIssues);
        
    } catch (error) {
        console.error("API Error:", error);
        document.getElementById('issuesGrid').innerHTML = 
            '<p class="col-span-4 text-center text-red-500 py-10">Failed to load issues from server.</p>';
    } finally {
        toggleLoader(false);
    }

    let searchTimer;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => handleSearch(e.target.value), 500);
    });
}


async function handleSearch(searchText) {
    toggleLoader(true);
    try {
        const response = await fetch(url);
        const json = await response.json();
         console.log("API Response:", json);
    } catch (error) {
        
        console.error("Search Error:", error);
    } finally {
        toggleLoader(false);
    }
}


function filterIssues(status) {
    currentFilter = status;
    updateUI(status);
    toggleLoader(true);

    setTimeout(() => {
        let filteredData = allIssues;
        if (status !== 'all') {
            filteredData = allIssues.filter(issue => 
                issue.status.toLowerCase() === status.toLowerCase()
            );
        }
        renderIssues(filteredData);
        toggleLoader(false);
    }, 300);
}


function renderIssues(issues) {
    const grid = document.getElementById('issuesGrid');
    updateCount(issues.length);
    grid.innerHTML = '';

    if (!issues || issues.length === 0) {
        grid.innerHTML = '<p class="col-span-4 text-center text-gray-400 py-10">No issues found.</p>';
        return;
    }


    issues.forEach(issue => {
        const isOpen = issue.status.toLowerCase() === 'open';

        const topBorder = isOpen ? 'border-t-[#22c55e]' : 'border-t-[#a855f7]';
        const iconBg = isOpen ? 'bg-green-50 text-[#22c55e]' : 'bg-purple-50 text-[#a855f7]';
        const iconClass = isOpen ? 'fa-regular fa-circle-dot' : 'fa-regular fa-circle-check';
        

        const prio = (issue.priority || 'Low').toUpperCase();
   
        const prioClass = "bg-gray-200 text-gray-600 font-bold px-4 py-1 rounded-full text-[11px] tracking-wide";

        const labels = Array.isArray(issue.labels) ? issue.labels : [];
        const labelsHtml = labels.map(label => {
            const l = label.toLowerCase();
            let style = "border-gray-200 text-gray-600 bg-gray-50";
            let icon = '<i class="fa-solid fa-tag"></i>';

            if (l.includes('bug')) {
                style = "border-red-200 text-red-500 bg-red-50";
                icon = '<i class="fa-solid fa-bug"></i>';
            } else if (l.includes('help') || l.includes('enhancement')) {
                style = "border-yellow-200 text-yellow-600 bg-yellow-50";
                icon = '<i class="fa-regular fa-life-ring"></i>';
            }

            return `<span class="flex items-center gap-1 text-[10px] px-2 py-1 rounded border ${style} font-bold uppercase whitespace-nowrap">${icon} ${label}</span>`;
        }).join('');



        const card = document.createElement('div');
        card.className = `bg-white rounded-lg shadow-sm border border-gray-200 border-t-4 ${topBorder} p-5 hover:shadow-md transition cursor-pointer flex flex-col h-full`;
        card.onclick = () => openModal(issue.id); 

        card.innerHTML = `
            <div class="flex justify-between items-center mb-3">
         
                <img src="${issue.status === 'Open' ? './assets/open.png' : './assets/closed.png'}" alt="${issue.status}" class="w-6 h-6 object-contain">

                <span class="${prioClass}">${prio}</span>
            </div>
            
            <h3 class="font-bold text-gray-800 text-sm mb-2 leading-tight line-clamp-2">${issue.title}</h3>
            <p class="text-gray-500 text-xs mb-4 line-clamp-2 leading-relaxed flex-grow">${issue.description}</p>
            
            <div class="flex gap-2 mb-4 flex-wrap">
                ${labelsHtml}
            </div>

            <div class="border-t border-gray-100 pt-3 mt-auto">
                <p class="text-[11px] text-gray-400">#${issue.id} by ${issue.author || issue.createdBy || 'Unknown'}</p>
                <p class="text-[11px] text-gray-400 mt-0.5">${new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}


async function openModal(id) {
    const modal = document.getElementById('issueModal');
    const content = document.getElementById('modalContent');
    
    modal.classList.remove('hidden');
    content.innerHTML = '<div class="p-10 flex justify-center"><div class="spinner"></div></div>';

    try {
        const response = await fetch(`${API_BASE}/issue/${id}`);
        const json = await response.json();
        const issue = json.data || json; 

        const isOpen = issue.status.toLowerCase() === 'open';
        const badge = isOpen 
            ? '<span class="bg-[#22c55e] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">OPEN</span>' 
            : '<span class="bg-[#a855f7] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">CLOSED</span>';
        

        const labels = Array.isArray(issue.labels) ? issue.labels : [];
        const labelsHtml = labels.map(label => {
            return `<span class="flex items-center gap-1 text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 font-bold uppercase bg-white">
                <i class="fa-solid fa-tag text-gray-400"></i> ${label}
            </span>`;
        }).join('');

        content.innerHTML = `
            <div class="p-8 relative">
                <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                <h2 class="text-2xl font-bold text-gray-900 mb-4 pr-8 leading-tight">${issue.title}</h2>
                
            
                <div class="flex items-center gap-2 text-sm text-gray-500 mb-5">
                    ${badge}
                    <span>• Opened by <span class="font-bold text-gray-800">${issue.author || issue.createdBy}</span> • ${new Date(issue.createdAt).toLocaleDateString()}</span>
                </div>

                <div class="flex gap-2 mb-6 flex-wrap">${labelsHtml}</div>
           
                <p class="text-gray-700 text-sm leading-7 mb-8">
                    ${issue.description}
                </p>
                
                <div class="bg-gray-50 rounded-lg p-5 border border-gray-100 flex justify-between items-center mb-8">
                    <div>
                        <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">ASSIGNEE</p>
                        <!-- FIX: Just the name, no highlighter/circle -->
                        <p class="text-sm font-bold text-gray-900">
                            ${issue.assignee || issue.author || 'Unassigned'}
                        </p>
                    </div>
                    <div>
                        <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">PRIORITY</p>
                        <span class="text-sm font-bold text-gray-900 uppercase">${issue.priority || 'Low'}</span>
                    </div>
                </div>

                <div class="flex justify-end">
                    <button onclick="closeModal()" class="bg-[#560df8] hover:bg-[#450ac4] text-white px-8 py-2.5 rounded-lg text-sm font-semibold shadow-md transition">
                        Close Details
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Modal Fetch Error:", error);
        content.innerHTML = '<p class="text-red-500 p-8 text-center">Failed to fetch issue details.</p>';
    }
}


function closeModal() {
    document.getElementById('issueModal').classList.add('hidden');
}


function updateCount(count) {
    const el = document.getElementById('issueCount');
    if (el) el.innerText = count;
}


function toggleLoader(show) {
    const loader = document.getElementById('loader');
    const grid = document.getElementById('issuesGrid');
    if (show) {
        loader.classList.remove('hidden');
        grid.classList.add('opacity-30', 'pointer-events-none');
    } else {
        loader.classList.add('hidden');
        grid.classList.remove('opacity-30', 'pointer-events-none');
    }
}


function updateUI(status) {
    ['tabAll', 'tabOpen', 'tabClosed'].forEach(id => {
        document.getElementById(id).className = 
            "px-8 py-2 rounded-md text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition";
    });
    
    const activeId = `tab${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const btn = document.getElementById(activeId);
    if (btn) {
        btn.className = "px-8 py-2 rounded-md text-sm font-medium bg-[#560df8] text-white shadow-md transition";
    }
}