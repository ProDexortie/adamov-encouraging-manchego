// Инициализация Bootstrap компонентов
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация всплывающих подсказок
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Инициализация календаря выбора даты
  $('.datepicker').datepicker({
    format: 'yyyy-mm-dd',
    language: 'ru',
    autoclose: true,
    todayHighlight: true
  });
  
  // Динамическое добавление полей для подзадач (цели)
  const addSubtaskBtn = document.getElementById('add-subtask');
  if (addSubtaskBtn) {
    addSubtaskBtn.addEventListener('click', function() {
      const subtasksContainer = document.getElementById('subtasks-container');
      const subtaskIndex = document.querySelectorAll('.subtask-item').length;
      
      const subtaskDiv = document.createElement('div');
      subtaskDiv.className = 'subtask-item input-group mb-2';
      
      subtaskDiv.innerHTML = `
        <input type="text" name="subTasks[]" class="form-control" placeholder="Название подзадачи">
        <button type="button" class="btn btn-outline-danger remove-subtask">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      subtasksContainer.appendChild(subtaskDiv);
      
      // Обработчик удаления подзадачи
      subtaskDiv.querySelector('.remove-subtask').addEventListener('click', function() {
        subtaskDiv.remove();
      });
    });
  }
  
  // Обработчики удаления существующих подзадач
  document.querySelectorAll('.remove-subtask').forEach(button => {
    button.addEventListener('click', function() {
      this.closest('.subtask-item').remove();
    });
  });
  
  // Динамическое добавление полей для пунктов плана
  const addPlanItemBtn = document.getElementById('add-plan-item');
  if (addPlanItemBtn) {
    addPlanItemBtn.addEventListener('click', function() {
      const itemsContainer = document.getElementById('plan-items-container');
      const itemIndex = document.querySelectorAll('.plan-item').length;
      
      const itemDiv = document.createElement('div');
      itemDiv.className = 'plan-item mb-2';
      
      itemDiv.innerHTML = `
        <div class="input-group">
          <input type="text" name="items[]" class="form-control" placeholder="Название пункта плана">
          <input type="time" name="times[]" class="form-control">
          <button type="button" class="btn btn-outline-danger remove-plan-item">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      itemsContainer.appendChild(itemDiv);
      
      // Обработчик удаления пункта плана
      itemDiv.querySelector('.remove-plan-item').addEventListener('click', function() {
        itemDiv.remove();
      });
    });
  }
  
  // Обработчики удаления существующих пунктов плана
  document.querySelectorAll('.remove-plan-item').forEach(button => {
    button.addEventListener('click', function() {
      this.closest('.plan-item').remove();
    });
  });
  
  // Обработка тегов в форме задач
  const tagsInput = document.getElementById('tags');
  if (tagsInput) {
    tagsInput.addEventListener('keydown', function(e) {
      if (e.key === ',' || e.key === 'Enter') {
        e.preventDefault();
        
        const tagText = this.value.trim();
        if (tagText) {
          addTag(tagText);
          this.value = '';
        }
      }
    });
    
    // Инициализация существующих тегов
    if (tagsInput.dataset.tags) {
      const existingTags = tagsInput.dataset.tags.split(',');
      existingTags.forEach(tag => {
        if (tag.trim()) {
          addTag(tag.trim());
        }
      });
    }
    
    // Функция добавления тега
    function addTag(text) {
      const tagsContainer = document.getElementById('tags-container');
      const hiddenInput = document.getElementById('tags-hidden');
      
      const tagSpan = document.createElement('span');
      tagSpan.className = 'tag me-2 mb-2 d-inline-block';
      tagSpan.innerHTML = `
        ${text}
        <button type="button" class="btn-close btn-close-white ms-1" aria-label="Close"></button>
      `;
      
      tagsContainer.appendChild(tagSpan);
      
      // Обновление скрытого поля
      const currentTags = hiddenInput.value ? hiddenInput.value.split(',') : [];
      currentTags.push(text);
      hiddenInput.value = currentTags.join(',');
      
      // Обработчик удаления тега
      tagSpan.querySelector('.btn-close').addEventListener('click', function() {
        const currentTags = hiddenInput.value.split(',');
        const index = currentTags.indexOf(text);
        
        if (index !== -1) {
          currentTags.splice(index, 1);
          hiddenInput.value = currentTags.join(',');
        }
        
        tagSpan.remove();
      });
    }
  }
  
  // Обновление прогресса цели на основе завершенных подзадач
  const subtaskCheckboxes = document.querySelectorAll('.subtask-checkbox');
  const progressInput = document.getElementById('progress');
  
  if (subtaskCheckboxes.length > 0 && progressInput) {
    subtaskCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', updateProgress);
    });
    
    function updateProgress() {
      const total = subtaskCheckboxes.length;
      const completed = document.querySelectorAll('.subtask-checkbox:checked').length;
      const progress = Math.round((completed / total) * 100);
      
      progressInput.value = progress;
      document.getElementById('progress-display').textContent = progress + '%';
      document.querySelector('.progress-bar').style.width = progress + '%';
    }
  }
  
  // Фильтрация и сортировка задач
  const taskFilterForm = document.getElementById('task-filter-form');
  if (taskFilterForm) {
    taskFilterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const status = document.getElementById('filter-status').value;
      const priority = document.getElementById('filter-priority').value;
      const category = document.getElementById('filter-category').value;
      const searchTerm = document.getElementById('search-term').value.toLowerCase();
      
      const taskItems = document.querySelectorAll('.task-item');
      
      taskItems.forEach(item => {
        const itemStatus = item.dataset.status;
        const itemPriority = item.dataset.priority;
        const itemCategory = item.dataset.category;
        const itemTitle = item.querySelector('.task-title').textContent.toLowerCase();
        
        let isVisible = true;
        
        if (status && status !== 'all' && itemStatus !== status) {
          isVisible = false;
        }
        
        if (priority && priority !== 'all' && itemPriority !== priority) {
          isVisible = false;
        }
        
        if (category && category !== 'all' && itemCategory !== category) {
          isVisible = false;
        }
        
        if (searchTerm && !itemTitle.includes(searchTerm)) {
          isVisible = false;
        }
        
        item.style.display = isVisible ? 'block' : 'none';
      });
    });
    
    // Сброс фильтров
    document.getElementById('reset-filters').addEventListener('click', function() {
      document.getElementById('filter-status').value = 'all';
      document.getElementById('filter-priority').value = 'all';
      document.getElementById('filter-category').value = 'all';
      document.getElementById('search-term').value = '';
      
      document.querySelectorAll('.task-item').forEach(item => {
        item.style.display = 'block';
      });
    });
  }
  
  // Календарь с датами планов
  const calendarEl = document.getElementById('plans-calendar');
  if (calendarEl && window.planDates) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    let calendarHTML = '<table class="table table-bordered text-center">';
    calendarHTML += '<thead><tr>';
    
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekdays.forEach(day => {
      calendarHTML += `<th>${day}</th>`;
    });
    
    calendarHTML += '</tr></thead><tbody><tr>';
    
    // Заполнение пустых ячеек в начале
    const firstDayOfWeek = firstDay.getDay() || 7; // Воскресенье - 0, переводим в 7
    for (let i = 1; i < firstDayOfWeek; i++) {
      calendarHTML += '<td></td>';
    }
    
    // Заполнение дней месяца
    let currentDay = 1;
    let dayOfWeek = firstDayOfWeek;
    
    while (currentDay <= lastDay.getDate()) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
      const hasPlan = window.planDates.includes(dateStr);
      
      const isToday = currentDay === currentDate.getDate();
      
      calendarHTML += `<td class="${isToday ? 'bg-light' : ''} ${hasPlan ? 'text-primary fw-bold' : ''}">`;
      
      if (hasPlan) {
        calendarHTML += `<a href="/plans/date/${dateStr}">${currentDay}</a>`;
      } else {
        calendarHTML += currentDay;
      }
      
      calendarHTML += '</td>';
      
      if (dayOfWeek === 7) {
        calendarHTML += '</tr><tr>';
        dayOfWeek = 1;
      } else {
        dayOfWeek++;
      }
      
      currentDay++;
    }
    
    // Заполнение пустых ячеек в конце
    while (dayOfWeek <= 7 && dayOfWeek > 1) {
      calendarHTML += '<td></td>';
      dayOfWeek++;
    }
    
    calendarHTML += '</tr></tbody></table>';
    
    calendarEl.innerHTML = calendarHTML;
  }
});