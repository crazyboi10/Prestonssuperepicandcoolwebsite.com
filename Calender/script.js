const calendarGrid = document.querySelector('#calendarGrid');
const monthLabel = document.querySelector('#monthLabel');
const selectedDateLabel = document.querySelector('#selectedDateLabel');
const eventForm = document.querySelector('#eventForm');
const eventTitle = document.querySelector('#eventTitle');
const eventList = document.querySelector('#eventList');

const today = new Date();
let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = formatDate(today);
const events = JSON.parse(localStorage.getItem('prestonCalendarEvents') || '{}');

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    monthLabel.textContent = displayedMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    calendarGrid.innerHTML = '';

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    for (let cellIndex = 0; cellIndex < totalCells; cellIndex += 1) {
        const dayOffset = cellIndex - firstDay;
        const cellDate = new Date(year, month, dayOffset + 1);
        const dateKey = formatDate(cellDate);
        const dayButton = document.createElement('button');
        dayButton.type = 'button';
        dayButton.className = 'day';
        dayButton.setAttribute('role', 'gridcell');
        dayButton.setAttribute('aria-label', cellDate.toLocaleDateString(undefined, { dateStyle: 'full' }));

        if (dayOffset < 0) {
            cellDate.setDate(daysInPreviousMonth + dayOffset + 1);
            dayButton.classList.add('other-month');
        } else if (dayOffset >= daysInMonth) {
            dayButton.classList.add('other-month');
        }
        if (dateKey === formatDate(today)) dayButton.classList.add('today');
        if (dateKey === selectedDate) dayButton.classList.add('selected');

        dayButton.innerHTML = `<span class="day-number">${cellDate.getDate()}</span>`;
        if (events[dateKey]?.length) dayButton.innerHTML += '<span class="event-dot" aria-hidden="true"></span>';
        dayButton.addEventListener('click', () => {
            selectedDate = dateKey;
            displayedMonth = new Date(cellDate.getFullYear(), cellDate.getMonth(), 1);
            renderCalendar();
            renderEvents();
        });
        calendarGrid.appendChild(dayButton);
    }
}

function renderEvents() {
    const date = new Date(`${selectedDate}T12:00:00`);
    selectedDateLabel.textContent = date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    eventList.innerHTML = '';
    const dateEvents = events[selectedDate] || [];

    if (!dateEvents.length) {
        eventList.innerHTML = '<p class="empty-state">Nothing planned yet.</p>';
        return;
    }

    dateEvents.forEach((event, index) => {
        const item = document.createElement('div');
        item.className = 'event-item';
        item.innerHTML = `<span>${escapeHtml(event)}</span><button class="delete-event" type="button" aria-label="Delete ${escapeHtml(event)}">&times;</button>`;
        item.querySelector('.delete-event').addEventListener('click', () => {
            events[selectedDate].splice(index, 1);
            if (!events[selectedDate].length) delete events[selectedDate];
            saveEvents();
            renderCalendar();
            renderEvents();
        });
        eventList.appendChild(item);
    });
}

function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function saveEvents() {
    localStorage.setItem('prestonCalendarEvents', JSON.stringify(events));
}

document.querySelector('#previousMonth').addEventListener('click', () => {
    displayedMonth.setMonth(displayedMonth.getMonth() - 1);
    renderCalendar();
});

document.querySelector('#nextMonth').addEventListener('click', () => {
    displayedMonth.setMonth(displayedMonth.getMonth() + 1);
    renderCalendar();
});

document.querySelector('#todayButton').addEventListener('click', () => {
    displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedDate = formatDate(today);
    renderCalendar();
    renderEvents();
});

eventForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = eventTitle.value.trim();
    if (!title) return;
    if (!events[selectedDate]) events[selectedDate] = [];
    events[selectedDate].push(title);
    saveEvents();
    eventTitle.value = '';
    renderCalendar();
    renderEvents();
    eventTitle.focus();
});

renderCalendar();
renderEvents();