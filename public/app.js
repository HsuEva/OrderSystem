// Global state
let currentSession = null;
let colleagues = [];
let sessions = [];
let lockedFormSessionId = null;

function clearPageState(targetViewName) {
  if (targetViewName !== 'sessions') {
    const creationPanel = document.getElementById('session-creation-panel');
    const configPanel = document.getElementById('session-config-panel');
    if (creationPanel) creationPanel.style.display = 'block';
    if (configPanel) configPanel.style.display = 'none';
    const sessionTitle = document.getElementById('session-config-title');
    if (sessionTitle) sessionTitle.textContent = '';
  }

  if (targetViewName !== 'form') {
    const formContent = document.getElementById('form-content');
    const sessionSelect = document.getElementById('session-selector');
    const colleagueSelect = document.getElementById('colleague-selector');
    const menuContainer = document.getElementById('menu-items-container');
    const formSessionName = document.getElementById('form-session-name');
    const formLimitsHint = document.getElementById('form-limits-hint');
    if (formContent) formContent.style.display = 'none';
    if (sessionSelect && !lockedFormSessionId) sessionSelect.value = '';
    if (colleagueSelect) colleagueSelect.innerHTML = '<option value="">選擇你的名字...</option>';
    if (menuContainer) menuContainer.innerHTML = '';
    if (formSessionName) formSessionName.textContent = '';
    if (formLimitsHint) formLimitsHint.textContent = '';
  }

  if (targetViewName !== 'stats') {
    const statsSelect = document.getElementById('stats-session-selector');
    const statsContent = document.getElementById('stats-content');
    const submissionStatusList = document.getElementById('submission-status-list');
    const foodSummaryList = document.getElementById('food-summary-list');
    const drinkSummaryList = document.getElementById('drink-summary-list');
    if (statsSelect) statsSelect.value = '';
    if (statsContent) statsContent.style.display = 'none';
    if (submissionStatusList) submissionStatusList.innerHTML = '';
    if (foodSummaryList) foodSummaryList.innerHTML = '';
    if (drinkSummaryList) drinkSummaryList.innerHTML = '';
  }
}

// View management
function showView(viewName) {
  clearPageState(viewName);
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(`${viewName}-view`).classList.remove('hidden');
  
  if (viewName === 'roster') loadRoster();
  if (viewName === 'sessions') loadSessions();
  if (viewName === 'form') loadFormSessions();
  if (viewName === 'stats') loadStatsSessions();
}

function getFormOnlyLink(sessionId) {
  const url = new URL(window.location.href);
  url.searchParams.set('mode', 'form');
  url.searchParams.set('session', sessionId);
  url.hash = 'form';
  return url.toString();
}

function updateFormLimitsHint(session) {
  const hint = document.getElementById('form-limits-hint');
  if (!hint || !session) return;
  const maxFood = session.max_food_items ?? 2;
  const maxDrink = session.max_drink_items ?? 1;
  hint.textContent = `本活動限制：食物最多 ${maxFood} 份，飲料最多 ${maxDrink} 杯`;
}

function applyFormOnlyModeIfNeeded() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') !== 'form') return;

  const nav = document.querySelector('.navbar ul');
  if (nav) nav.style.display = 'none';
  lockedFormSessionId = params.get('session') || null;
  showView('form');
}

// ===== Roster Views =====

async function loadRoster() {
  await loadColleagues();
}

async function loadColleagues() {
  try {
    colleagues = await getRosterColleagues();
    renderColleaguesList();
  } catch (err) {
    console.error('Error loading colleagues:', err);
  }
}

async function createColleague() {
  const name = document.getElementById('new-colleague-name').value.trim();
  const empId = document.getElementById('new-colleague-empid').value.trim();
  
  if (!name) return alert('請輸入人員姓名');
  
  try {
    await createRosterColleague(name, empId);
    document.getElementById('new-colleague-name').value = '';
    document.getElementById('new-colleague-empid').value = '';
    await loadColleagues();
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

async function deleteColleague(id) {
  if (!confirm('確定刪除此人員？')) return;
  try {
    await deleteRosterColleague(id);
    await loadColleagues();
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

function renderColleaguesList() {
  const list = document.getElementById('colleagues-list');
  list.innerHTML = colleagues.map(c => `
    <div class="list-item">
      <span>${c.name}${c.employee_id ? ` [${c.employee_id}]` : ''}</span>
      <button onclick="deleteColleague('${c.id}')" class="btn-danger">刪除</button>
    </div>
  `).join('');
}

// ===== Session Views =====

async function loadSessions() {
  try {
    sessions = await apiGetAllSessions();
    renderSessionsList();
  } catch (err) {
    console.error('Error loading sessions:', err);
  }
}

async function renderSessionsList() {
  const list = document.getElementById('sessions-list');
  if (!sessions || sessions.length === 0) {
    list.innerHTML = '<p style="color: #999;">尚無已建立的活動</p>';
    return;
  }
  
  list.innerHTML = sessions.map(s => `
    <div class="list-item">
      <span>${s.name}${s.submission_deadline ? ` (截止：${s.submission_deadline.replace('T', ' ')})` : ''}</span>
      <div style="display:flex; gap:0.5rem;">
        <button onclick="openExistingSessionConfig('${s.id}')" style="background: #3498db; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">設定</button>
        <button onclick="deleteSession('${s.id}', '${s.name}')" class="btn-danger">刪除</button>
      </div>
    </div>
  `).join('');
}

async function handleCreateSession() {
  const name = document.getElementById('new-session-name').value.trim();
  const deadline = document.getElementById('new-session-deadline').value;
  
  if (!name) return alert('請輸入活動名稱');
  
  try {
    const session = await apiCreateSession(name, deadline || null);
    currentSession = session;
    document.getElementById('new-session-name').value = '';
    document.getElementById('new-session-deadline').value = '';
    
    // Redirect to session config
    await openSessionConfig(session);
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

async function openSessionConfig(session) {
  currentSession = session;
  
  // Hide creation panel, show config panel
  document.getElementById('session-creation-panel').style.display = 'none';
  document.getElementById('session-config-panel').style.display = 'block';
  document.getElementById('session-config-title').textContent = `活動配置：${session.name}`;
  // Use submission_deadline directly as it's already in datetime-local format (YYYY-MM-DDTHH:mm)
  document.getElementById('edit-session-deadline').value = session.submission_deadline ? session.submission_deadline : '';
  document.getElementById('max-food-items').value = session.max_food_items ?? 2;
  document.getElementById('max-drink-items').value = session.max_drink_items ?? 1;
  const shareLinkHint = document.getElementById('share-link-hint');
  if (shareLinkHint) {
    shareLinkHint.textContent = `填單連結：${getFormOnlyLink(session.id)}`;
  }
  
  // Load colleagues
  await loadColleaguesForAssignment();
  await refreshMenuItemsList();
}

async function saveSessionDeadline() {
  if (!currentSession) return alert('請先選擇活動');
  try {
    const value = document.getElementById('edit-session-deadline').value;
    const updated = await updateSessionDeadline(currentSession.id, value || null);
    if (updated && updated.error) throw new Error(updated.error);
    currentSession = updated;
    alert('截止時間已更新');
    await loadSessions();
  } catch (err) {
    alert('更新截止時間失敗：' + err.message);
  }
}

async function clearSessionDeadline() {
  document.getElementById('edit-session-deadline').value = '';
  await saveSessionDeadline();
}

async function saveSessionSettings() {
  if (!currentSession) return alert('請先選擇活動');
  try {
    const submissionDeadline = document.getElementById('edit-session-deadline').value || null;
    const maxFoodItems = Number(document.getElementById('max-food-items').value || 0);
    const maxDrinkItems = Number(document.getElementById('max-drink-items').value || 0);
    const updated = await updateSessionSettings(currentSession.id, {
      submission_deadline: submissionDeadline,
      max_food_items: maxFoodItems,
      max_drink_items: maxDrinkItems
    });
    if (updated && updated.error) throw new Error(updated.error);
    currentSession = updated;
    document.getElementById('share-link-hint').textContent = `填單連結：${getFormOnlyLink(updated.id)}`;
    alert('活動設定已更新');
    await loadSessions();
  } catch (err) {
    alert('保存設定失敗：' + err.message);
  }
}

async function copyFormOnlyLink() {
  if (!currentSession) return alert('請先選擇活動');
  const link = getFormOnlyLink(currentSession.id);
  try {
    await navigator.clipboard.writeText(link);
    alert('已複製填單連結，可直接傳給同事');
  } catch (err) {
    alert('複製失敗，請手動複製：' + link);
  }
}

async function openExistingSessionConfig(sessionId) {
  try {
    const session = await getSession(sessionId);
    await openSessionConfig(session);
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

async function backToSessionList() {
  currentSession = null;
  document.getElementById('session-config-panel').style.display = 'none';
  document.getElementById('session-creation-panel').style.display = 'block';
  await loadSessions();
}

async function loadColleaguesForAssignment() {
  try {
    colleagues = await getRosterColleagues();
    const checkboxesDiv = document.getElementById('colleague-checkboxes');
    checkboxesDiv.innerHTML = colleagues.map(c => `
      <div style="margin-bottom: 0.5rem;">
        <input type="checkbox" id="colleague-${c.id}" value="${c.id}" />
        <label for="colleague-${c.id}" style="margin-left: 0.5rem;">${c.name}${c.employee_id ? ` [${c.employee_id}]` : ''}</label>
      </div>
    `).join('');
    const btn = document.getElementById('select-all-btn');
    if (btn) btn.textContent = '全選';
  } catch (err) {
    console.error('Error loading colleagues:', err);
  }
}

async function addFoodItem() {
  const name = document.getElementById('new-food-name').value.trim();
  if (!name) return alert('請輸入食物名稱');
  if (!currentSession) return alert('請先建立活動');
  
  try {
    await createMenuItem(currentSession.id, name, 'food');
    document.getElementById('new-food-name').value = '';
    await refreshMenuItemsList();
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

async function addDrinkItem() {
  const name = document.getElementById('new-drink-name').value.trim();
  if (!name) return alert('請輸入飲料名稱');
  if (!currentSession) return alert('請先建立活動');
  
  try {
    await createMenuItem(currentSession.id, name, 'drink');
    document.getElementById('new-drink-name').value = '';
    await refreshMenuItemsList();
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

async function refreshMenuItemsList() {
  if (!currentSession) return;
  
  try {
    const items = await getMenuItems(currentSession.id);
    const foodItems = items.filter(i => i.item_type === 'food');
    const drinkItems = items.filter(i => i.item_type === 'drink');
    
    const foodList = document.getElementById('food-items-list');
    foodList.innerHTML = foodItems.length ? foodItems.map(item => `
      <div class="list-item">
        <span>${item.name}</span>
        <button onclick="deleteMenuItem('${item.id}')" class="btn-danger">刪除</button>
      </div>
    `).join('') : '<p style="color: #999;">尚無食物項目</p>';
    
    const drinkList = document.getElementById('drink-items-list');
    drinkList.innerHTML = drinkItems.length ? drinkItems.map(item => `
      <div class="list-item">
        <span>${item.name}</span>
        <button onclick="deleteMenuItem('${item.id}')" class="btn-danger">刪除</button>
      </div>
    `).join('') : '<p style="color: #999;">尚無飲料項目</p>';
  } catch (err) {
    console.error('Error refreshing menu items:', err);
  }
}

async function deleteMenuItem(itemId) {
  if (!confirm('確定刪除此項目？')) return;
  try {
    await deleteMenuItemApi(itemId);
    await refreshMenuItemsList();
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

async function updateSweetnessOptions() {
  if (!currentSession) return alert('請先建立活動');
  
  const input = document.getElementById('sweetness-input').value.trim();
  if (!input) return alert('請輸入甜度選項');
  
  const levels = input.split(',').map(l => l.trim()).filter(l => l);
  
  try {
    // Delete existing sweetness levels
    const existing = await getSweetnessLevels(currentSession.id);
    for (const level of existing) {
      await deleteSweetness(level.id);
    }
    
    // Create new levels
    for (const level of levels) {
      await createSweetness(currentSession.id, level);
    }
    
    alert('甜度選項已保存');
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

async function updateIceOptions() {
  if (!currentSession) return alert('請先建立活動');
  
  const input = document.getElementById('ice-input').value.trim();
  if (!input) return alert('請輸入冰塊選項');
  
  const levels = input.split(',').map(l => l.trim()).filter(l => l);
  
  try {
    // Delete existing ice levels
    const existing = await getIceLevels(currentSession.id);
    for (const level of existing) {
      await deleteIce(level.id);
    }
    
    // Create new levels
    for (const level of levels) {
      await createIce(currentSession.id, level);
    }
    
    alert('冰塊選項已保存');
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

function toggleSelectAllColleagues() {
  const checkboxes = document.querySelectorAll('#colleague-checkboxes input[type="checkbox"]');
  const btn = document.getElementById('select-all-btn');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach(cb => { cb.checked = !allChecked; });
  btn.textContent = allChecked ? '全選' : '取消全選';
}

async function assignColleaguesToCurrentSession() {
  if (!currentSession) return alert('請先建立活動');
  
  const checkboxes = document.querySelectorAll('#colleague-checkboxes input[type="checkbox"]:checked');
  const selectedIds = Array.from(checkboxes).map(cb => cb.value);
  
  if (selectedIds.length === 0) return alert('請至少選擇一位人員');
  
  try {
    await assignColleaguesToSession(currentSession.id, selectedIds);
    alert(`已指派 ${selectedIds.length} 位人員至活動「${currentSession.name}」`);
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

// ===== Form Views =====

async function loadFormSessions() {
  try {
    const allSessions = await apiGetAllSessions();
    const now = Date.now();
    const activeSessions = allSessions.filter(s => {
      if (!s.submission_deadline) return true;
      const ts = new Date(s.submission_deadline).getTime();
      return Number.isFinite(ts) && ts > now;
    });
    const select = document.getElementById('session-selector');
    const sessionsForForm = lockedFormSessionId
      ? activeSessions.filter(s => s.id === lockedFormSessionId)
      : activeSessions;
    select.innerHTML = '<option value="">選擇訂餐活動...</option>' +
      sessionsForForm.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    select.disabled = Boolean(lockedFormSessionId);

    if (lockedFormSessionId && sessionsForForm.length > 0) {
      select.value = lockedFormSessionId;
      await loadFormForSession();
    }
  } catch (err) {
    console.error('Error loading sessions:', err);
  }
}

async function loadFormForSession() {
  const sessionId = document.getElementById('session-selector').value;
  if (!sessionId) {
    document.getElementById('form-content').style.display = 'none';
    return;
  }
  
  try {
    currentSession = await getSession(sessionId);
    if (currentSession.submission_deadline && new Date(currentSession.submission_deadline) <= new Date()) {
      document.getElementById('form-content').style.display = 'none';
      return alert('此活動已截止，請選擇其他活動');
    }
    document.getElementById('form-session-name').textContent = currentSession.name;
    await loadFormContent();
    document.getElementById('form-content').style.display = 'block';
  } catch (err) {
    alert('錯誤：' + err.message);
  }
}

function resetOrderInputs() {
  const itemInputs = document.querySelectorAll('#menu-items-container input[id^="item-"]');
  itemInputs.forEach(input => { input.value = '0'; });
  const selects = document.querySelectorAll('#menu-items-container select[id^="sweetness-"], #menu-items-container select[id^="ice-"]');
  selects.forEach(sel => { sel.value = ''; });
}

function handleColleagueChange() {
  resetOrderInputs();
}

async function loadFormContent() {
  // Load colleagues dropdown
  const colleagueSelect = document.getElementById('colleague-selector');
  const allColleagues = await getRosterColleagues();
  const availableColleagues = (currentSession.assigned_colleague_ids && currentSession.assigned_colleague_ids.length)
    ? allColleagues.filter(c => currentSession.assigned_colleague_ids.includes(c.id))
    : allColleagues;
  colleagueSelect.innerHTML = '<option value="">選擇你的名字...</option>' +
    availableColleagues.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  updateFormLimitsHint(currentSession);
  
  // Load menu items
  const items = await getMenuItems(currentSession.id);
  const sweetness = await getSweetnessLevels(currentSession.id);
  const ice = await getIceLevels(currentSession.id);
  
  const container = document.getElementById('menu-items-container');
  container.innerHTML = '';
  
  // Food items
  const foodItems = items.filter(i => i.item_type === 'food');
  if (foodItems.length) {
    container.innerHTML += '<h4>食物</h4>';
    foodItems.forEach(item => {
      container.innerHTML += `
        <div class="menu-item">
          <label>${item.name}</label>
          <input type="number" id="item-${item.id}" value="0" min="0">
        </div>
      `;
    });
  }
  
  // Drink items
  const drinkItems = items.filter(i => i.item_type === 'drink');
  if (drinkItems.length) {
    container.innerHTML += '<h4>飲料</h4>';
    drinkItems.forEach(item => {
      let drinkHtml = `<div class="menu-item"><label>${item.name}</label>`;
      drinkHtml += `<input type="number" id="item-${item.id}" value="0" min="0">`;
      
      if (sweetness.length) {
        drinkHtml += `<select id="sweetness-${item.id}">
          <option value="">選擇甜度</option>` +
          sweetness.map(s => `<option value="${s.id}">${s.level}</option>`).join('') +
          `</select>`;
      }
      
      if (ice.length) {
        drinkHtml += `<select id="ice-${item.id}">
          <option value="">選擇冰塊</option>` +
          ice.map(i => `<option value="${i.id}">${i.level}</option>`).join('') +
          `</select>`;
      }
      
      container.innerHTML += drinkHtml + '</div>';
    });
  }
}

function collectOrderItemsForSubmit() {
  if (!currentSession) return [];
  const items = [];
  const itemInputs = document.querySelectorAll('#menu-items-container input[id^="item-"]');

  itemInputs.forEach(input => {
    const quantity = Number(input.value || 0);
    if (!Number.isFinite(quantity) || quantity <= 0) return;

    const menuItemId = input.id.replace('item-', '');
    const sweetnessSelect = document.getElementById(`sweetness-${menuItemId}`);
    const iceSelect = document.getElementById(`ice-${menuItemId}`);

    items.push({
      menu_item_id: menuItemId,
      quantity,
      sweetness_id: sweetnessSelect && sweetnessSelect.value ? sweetnessSelect.value : null,
      ice_level_id: iceSelect && iceSelect.value ? iceSelect.value : null
    });
  });

  return items;
}

function validateOrderLimits(items) {
  const maxFood = Number(currentSession && currentSession.max_food_items != null ? currentSession.max_food_items : 2);
  const maxDrink = Number(currentSession && currentSession.max_drink_items != null ? currentSession.max_drink_items : 1);
  let foodTotal = 0;
  let drinkTotal = 0;

  items.forEach(item => {
    const input = document.getElementById(`item-${item.menu_item_id}`);
    if (!input) return;
    const row = input.closest('.menu-item');
    if (!row) return;
    const sectionTitle = row.parentElement && row.parentElement.previousSibling;
    const text = row.textContent || '';
    const isDrink = text.includes('選擇甜度') || text.includes('選擇冰塊') || document.getElementById(`sweetness-${item.menu_item_id}`) || document.getElementById(`ice-${item.menu_item_id}`);
    if (isDrink) {
      drinkTotal += Number(item.quantity || 0);
    } else {
      foodTotal += Number(item.quantity || 0);
    }
  });

  if (foodTotal > maxFood) {
    return `食物最多只能選 ${maxFood} 份`;
  }
  if (drinkTotal > maxDrink) {
    return `飲料最多只能選 ${maxDrink} 杯`;
  }
  return null;
}

async function handleOrderSubmit(event) {
  event.preventDefault();

  const sessionId = document.getElementById('session-selector').value;
  const colleagueId = document.getElementById('colleague-selector').value;
  if (!sessionId) return alert('請先選擇訂餐活動');
  if (!colleagueId) return alert('請先選擇人員');

  const items = collectOrderItemsForSubmit();
  if (items.length === 0) return alert('請至少填一項數量大於 0 的品項');
  const limitError = validateOrderLimits(items);
  if (limitError) return alert(limitError);

  const submitBtn = document.querySelector('#order-form button[type="submit"]');
  const prevText = submitBtn ? submitBtn.textContent : '';

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '提交中...';
    }

    const result = await submitOrder(sessionId, colleagueId, items);
    if (result && result.error) {
      throw new Error(result.error);
    }

    alert('提交成功');
    if (document.getElementById('stats-view') && !document.getElementById('stats-view').classList.contains('hidden')) {
      await loadStats();
    }
  } catch (err) {
    alert('提交失敗：' + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = prevText || '提交訂單';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyFormOnlyModeIfNeeded();
  if (!lockedFormSessionId) {
    showView('roster');
  }
  const form = document.getElementById('order-form');
  if (form) {
    form.addEventListener('submit', handleOrderSubmit);
  }
});

// ===== Session Delete =====

async function deleteSession(id, name) {
  if (!confirm(`確定刪除活動「${name}」？這將一並刪除全部訂單。`)) return;
  try {
    await apiDeleteSession(id);
    await loadSessions();
  } catch (err) {
    alert('刪除失敗：' + err.message);
  }
}

// ===== Statistics View =====

async function loadStatsSessions() {
  try {
    const allSessions = await apiGetAllSessions();
    const select = document.getElementById('stats-session-selector');
    select.innerHTML = '<option value="">選擇訂餐活動...</option>' +
      allSessions.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    document.getElementById('stats-content').style.display = 'none';
    if (allSessions.length === 0) {
      document.getElementById('stats-content').style.display = 'block';
      document.getElementById('submission-status-list').innerHTML = '<p style="color:#999">目前沒有活動，請先建立活動</p>';
      document.getElementById('food-summary-list').innerHTML = '<p style="color:#999">尚無資料</p>';
      document.getElementById('drink-summary-list').innerHTML = '<p style="color:#999">尚無資料</p>';
      return;
    }
  } catch (err) {
    console.error('Error loading stats sessions:', err);
  }
}

async function loadStats() {
  const sessionId = document.getElementById('stats-session-selector').value;
  if (!sessionId) {
    document.getElementById('stats-content').style.display = 'none';
    return;
  }

  try {
    const [session, submissions, colleagues, foodSummary, drinkSummary] = await Promise.all([
      getSession(sessionId),
      getSessionSubmissions(sessionId),
      getRosterColleagues(),
      getFoodSummary(sessionId),
      getDrinkSummary(sessionId)
    ]);

    document.getElementById('stats-content').style.display = 'block';

    // Submission status
    const assignedIds = session.assigned_colleague_ids || [];
    const submittedIds = submissions.map(s => s.colleague_id);
    const statusList = document.getElementById('submission-status-list');

    if (assignedIds.length === 0) {
      // Show all colleagues if no assignment info
      const allRows = colleagues.map(c => {
        const submitted = submittedIds.includes(c.id);
        const sub = submissions.find(s => s.colleague_id === c.id);
        return renderSubmissionRow(c, submitted, sub);
      });
      statusList.innerHTML = allRows.join('') || '<p style="color:#999">尚無資料</p>';
    } else {
      const rows = assignedIds.map(cid => {
        const c = colleagues.find(x => x.id === cid) || { id: cid, name: `人員${cid.slice(0,6)}` };
        const submitted = submittedIds.includes(cid);
        const sub = submissions.find(s => s.colleague_id === cid);
        return renderSubmissionRow(c, submitted, sub);
      });
      statusList.innerHTML = rows.join('');
    }

    // Food summary
    const foodList = document.getElementById('food-summary-list');
    foodList.innerHTML = foodSummary.length
      ? foodSummary.map(f => `
          <div class="list-item">
            <span>${f.name}</span>
            <strong>共 ${f.total_quantity} 份</strong>
          </div>`).join('')
      : '<p style="color:#999">尚無食物訂單</p>';

    // Drink summary
    const drinkList = document.getElementById('drink-summary-list');
    drinkList.innerHTML = drinkSummary.length
      ? drinkSummary.map(d => `
          <div class="list-item">
            <span>${d.name}${d.sweetness !== 'default' ? ` / ${d.sweetness}` : ''}${d.ice !== 'default' ? ` / ${d.ice}` : ''}</span>
            <strong>共 ${d.total_quantity} 杯</strong>
          </div>`).join('')
      : '<p style="color:#999">尚無飲料訂單</p>';

  } catch (err) {
    alert('載入統計失敗：' + err.message);
  }
}

function renderSubmissionRow(colleague, submitted, submission) {
  const status = submitted
    ? `<span style="color:#27ae60">✅ 已提交</span>`
    : `<span style="color:#e74c3c">❌ 未提交</span>`;
  const deleteBtn = submitted
    ? `<button onclick="deleteSubmission('${submission.id}')" class="btn-danger" style="padding:0.25rem 0.6rem; font-size:0.8rem">刪除訂單</button>`
    : '';
  return `
    <div class="list-item">
      <span>${colleague.name}</span>
      <div style="display:flex; align-items:center; gap:0.75rem;">${status}${deleteBtn}</div>
    </div>`;
}

async function deleteSubmission(submissionId) {
  if (!confirm('確定刪除此人的訂單？')) return;
  try {
    await apiDeleteSubmission(submissionId);
    await loadStats();
  } catch (err) {
    alert('刪除失敗：' + err.message);
  }
}

async function exportStatsCSV() {
  const sessionId = document.getElementById('stats-session-selector').value;
  if (!sessionId) return alert('請先選擇活動');
  exportStatistics(sessionId, 'csv');
}
