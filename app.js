/**
 * 학급 경제 & 게이미피케이션 학급관리 웹 애플리케이션
 * JavaScript Core Logic
 */

// Initial Mock Data Generator (27 Students)
const INITIAL_STUDENT_NAMES = [
  "김민준", "이서연", "박도윤", "최지우", "정하은", "강현우", "조서준", "윤아린", "장민서",
  "임주원", "한예준", "오시우", "서유나", "신지호", "권다은", "황지후", "안소율", "송우진",
  "전채원", "홍건우", "고서현", "문준영", "양하윤", "손승우", "배지유", "백로운", "허은채"
];

const DEFAULT_ROLES = [
  { id: 1, name: "주번 (학급 정돈)", salary: 50, task: "교탁 정리 및 칠판 청소하기" },
  { id: 2, name: "우유 도우미", salary: 60, task: "아침 우유 상자 수령 및 배분" },
  { id: 3, name: "환경 도우미", salary: 50, task: "분리수거함 및 교실 창문 환기" },
  { id: 4, name: "급식 도우미", salary: 70, task: "점심시간 줄서기 지도 및 식탁 닦기" },
  { id: 5, name: "정보 도우미", salary: 60, task: "TV/컴퓨터 켜고 끄기 및 선 정리" },
  { id: 6, name: "도서 도우미", salary: 50, task: "학급 문고 책장 정돈 및 대여 관리" },
  { id: 7, name: "체육 도우미", salary: 60, task: "체육 기구 준비 및 정리" },
  { id: 8, name: "에너지 도우미", salary: 40, task: "이동수업 시 전등 및 에어컨 끄기" }
];

const DEFAULT_SHOP_ITEMS = [
  { id: 1, icon: "fa-chair", title: "1일 자리 선택권", desc: "하루 동안 내가 원하는 모둠 자리를 직접 선택할 수 있습니다.", price: 150 },
  { id: 2, icon: "fa-utensils", title: "급식 우선권", desc: "점심시간에 줄을 서지 않고 가장 먼저 급식을 받습니다.", price: 100 },
  { id: 3, icon: "fa-gamepad", title: "보드게임 15분 이용권", desc: "자율시간에 친구와 원하는 보드게임을 이용할 수 있습니다.", price: 120 },
  { id: 4, icon: "fa-pen-nib", title: "예쁜 학용품 교환권", desc: "선생님 보물상자에서 고급 볼펜/수첩 중 1개를 선택합니다.", price: 200 },
  { id: 5, icon: "fa-crown", title: "하루 1일 교대장 혜택", desc: "하루 동안 줄서기 신호 및 학급 인사 반장을 수행합니다.", price: 300 }
];

class ClassManagementApp {
  constructor() {
    this.students = [];
    this.roles = DEFAULT_ROLES;
    this.shopItems = [];
    this.inventory = [];
    this.settings = { currencyName: "골드", baseXP: 100 };
    this.currentMode = "teacher"; // 'teacher' | 'student'
    this.currentStudentId = 1;
    this.selectedStudentIds = new Set();
    
    this.init();
  }

  init() {
    this.loadState();
    this.setupEventListeners();
    this.render();
  }

  // Load state from localStorage or initialize with defaults
  loadState() {
    const savedData = localStorage.getItem("class_management_app_data_v1");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        this.students = parsed.students || [];
        this.roles = parsed.roles || DEFAULT_ROLES;
        this.shopItems = parsed.shopItems || DEFAULT_SHOP_ITEMS;
        this.inventory = parsed.inventory || [];
        this.settings = parsed.settings || { currencyName: "골드", baseXP: 100 };
      } catch (e) {
        console.error("Failed to parse localStorage data", e);
        this.initDefaultData();
      }
    } else {
      this.initDefaultData();
    }
  }

  initDefaultData() {
    this.roles = DEFAULT_ROLES;
    this.shopItems = DEFAULT_SHOP_ITEMS;
    this.settings = { currencyName: "골드", baseXP: 100 };
    this.inventory = [];
    
    // Create 27 students with evenly distributed roles
    this.students = INITIAL_STUDENT_NAMES.map((name, idx) => {
      const roleObj = this.roles[idx % this.roles.length];
      return {
        id: idx + 1,
        name: name,
        level: 1,
        xp: 20,
        balance: 100,
        roleId: roleObj.id,
        tasksCompletedToday: false,
        history: [
          { date: this.getFormattedDate(), desc: "신학기 초기 화폐 및 XP 지급", change: 100, isXP: false }
        ]
      };
    });

    this.saveState();
  }

  saveState() {
    const dataToSave = {
      students: this.students,
      roles: this.roles,
      shopItems: this.shopItems,
      inventory: this.inventory,
      settings: this.settings
    };
    localStorage.setItem("class_management_app_data_v1", JSON.stringify(dataToSave));
  }

  getFormattedDate() {
    const now = new Date();
    return `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  setupEventListeners() {
    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
      }
    });
  }

  // Set active mode (Teacher / Student)
  setMode(mode) {
    this.currentMode = mode;
    const btnTeacher = document.getElementById("btn-mode-teacher");
    const btnStudent = document.getElementById("btn-mode-student");
    const selectWrapper = document.getElementById("student-select-container");
    
    const teacherView = document.getElementById("teacher-view");
    const studentView = document.getElementById("student-view");

    if (mode === "teacher") {
      btnTeacher.classList.add("active");
      btnStudent.classList.remove("active");
      selectWrapper.style.display = "none";
      
      teacherView.classList.add("active");
      studentView.classList.remove("active");
    } else {
      btnStudent.classList.add("active");
      btnTeacher.classList.remove("active");
      selectWrapper.style.display = "flex";

      studentView.classList.add("active");
      teacherView.classList.remove("active");
    }

    this.render();
  }

  switchStudent(studentId) {
    this.currentStudentId = parseInt(studentId, 10);
    this.renderStudentView();
  }

  refreshCurrentView() {
    this.render();
  }

  // Core Render Router
  render() {
    this.updateCurrencyLabels();
    this.populateStudentSelect();

    if (this.currentMode === "teacher") {
      this.renderTeacherView();
    } else {
      this.renderStudentView();
    }
  }

  updateCurrencyLabels() {
    document.querySelectorAll(".currency-unit-label").forEach(el => {
      el.textContent = this.settings.currencyName;
    });
  }

  populateStudentSelect() {
    const select = document.getElementById("student-select");
    select.innerHTML = this.students.map(s => 
      `<option value="${s.id}" ${s.id === this.currentStudentId ? 'selected' : ''}>${s.id}번 ${s.name}</option>`
    ).join('');
  }

  // =========================================================================
  // STUDENT VIEW RENDERING & ACTIONS
  // =========================================================================
  renderStudentView() {
    const student = this.students.find(s => s.id === this.currentStudentId);
    if (!student) return;

    const role = this.roles.find(r => r.id === student.roleId) || { name: "미배정", task: "담당 역할 없음", salary: 0 };
    const nextLevelXP = student.level * this.settings.baseXP;
    const xpPercent = Math.min(100, Math.round((student.xp / nextLevelXP) * 100));

    // Profile Header
    document.getElementById("st-avatar-text").textContent = student.name.charAt(0);
    document.getElementById("st-name-val").textContent = `${student.id}번 ${student.name}`;
    document.getElementById("st-role-val").textContent = `1인 1역: ${role.name}`;
    document.getElementById("st-level-val").textContent = student.level;
    document.getElementById("st-current-xp").textContent = student.xp;
    document.getElementById("st-next-xp").textContent = nextLevelXP;
    document.getElementById("st-xp-bar").style.width = `${xpPercent}%`;
    document.getElementById("st-balance-val").textContent = student.balance.toLocaleString();

    // Today's Tasks
    const taskContainer = document.getElementById("student-task-list");
    taskContainer.innerHTML = `
      <div class="task-item">
        <div class="task-info">
          <div class="task-checkbox ${student.tasksCompletedToday ? 'checked' : ''}" onclick="app.toggleStudentTask(${student.id})">
            <i class="fa-solid fa-check"></i>
          </div>
          <div>
            <div class="task-name">${role.name} (${role.task})</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">오늘의 역할 수행하기</div>
          </div>
        </div>
        <div class="task-reward">
          <i class="fa-solid fa-coins"></i> +${role.salary} ${this.settings.currencyName}
        </div>
      </div>
    `;

    // My Inventory (Purchased Coupons)
    const invContainer = document.getElementById("student-inventory-list");
    const myItems = this.inventory.filter(inv => inv.studentId === student.id);

    if (myItems.length === 0) {
      invContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">보유한 쿠폰이 없습니다. 상점에서 쿠폰을 구매해 보세요!</div>`;
    } else {
      invContainer.innerHTML = myItems.map(inv => {
        let statusBadge = inv.status === 'pending_use' 
          ? `<span class="badge badge-pending"><i class="fa-solid fa-hourglass-half"></i> 사용 승인 대기중</span>`
          : `<span class="badge badge-completed"><i class="fa-solid fa-check-double"></i> 사용 완료</span>`;

        let actionBtn = inv.status === 'unused'
          ? `<button class="btn btn-primary btn-sm" onclick="app.requestUseCoupon(${inv.id})">사용 신청</button>`
          : '';

        return `
          <div class="task-item">
            <div class="task-info">
              <div class="shop-icon" style="width: 36px; height: 36px; font-size: 1rem; margin-bottom: 0;">
                <i class="fa-solid ${inv.icon || 'fa-ticket'}"></i>
              </div>
              <div>
                <div class="task-name">${inv.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">구매일: ${inv.boughtAt}</div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              ${statusBadge}
              ${actionBtn}
            </div>
          </div>
        `;
      }).join('');
    }

    // Shop Grid for Students
    const shopContainer = document.getElementById("student-shop-grid");
    shopContainer.innerHTML = this.shopItems.map(item => `
      <div class="shop-card">
        <div class="shop-icon">
          <i class="fa-solid ${item.icon}"></i>
        </div>
        <div class="shop-title">${item.title}</div>
        <div class="shop-desc">${item.desc}</div>
        <div class="shop-footer">
          <div class="shop-price">
            <i class="fa-solid fa-coins"></i> ${item.price}
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.buyShopItem(${item.id})">
            구매하기
          </button>
        </div>
      </div>
    `).join('');

    // History List
    const historyContainer = document.getElementById("student-history-list");
    if (student.history.length === 0) {
      historyContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1rem 0;">변동 내역이 없습니다.</div>`;
    } else {
      historyContainer.innerHTML = student.history.slice().reverse().map(h => `
        <div class="history-item">
          <div>
            <div class="history-desc">${h.desc}</div>
            <div class="history-date">${h.date}</div>
          </div>
          <div class="history-change ${h.change >= 0 ? 'positive' : 'negative'}">
            ${h.change >= 0 ? '+' : ''}${h.change} ${h.isXP ? 'XP' : this.settings.currencyName}
          </div>
        </div>
      `).join('');
    }
  }

  toggleStudentTask(studentId) {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return;

    const role = this.roles.find(r => r.id === student.roleId);
    const reward = role ? role.salary : 50;

    student.tasksCompletedToday = !student.tasksCompletedToday;
    if (student.tasksCompletedToday) {
      student.balance += reward;
      student.xp += 30;
      student.history.push({
        date: this.getFormattedDate(),
        desc: `[오늘 할 일] ${role ? role.name : '역할'} 완료 보상`,
        change: reward,
        isXP: false
      });
      this.checkLevelUp(student);
    } else {
      student.balance = Math.max(0, student.balance - reward);
    }

    this.saveState();
    this.render();
  }

  buyShopItem(itemId) {
    const student = this.students.find(s => s.id === this.currentStudentId);
    const item = this.shopItems.find(i => i.id === itemId);
    if (!student || !item) return;

    if (student.balance < item.price) {
      alert(`보유 화폐가 부족합니다! (필요: ${item.price} ${this.settings.currencyName}, 현재: ${student.balance} ${this.settings.currencyName})`);
      return;
    }

    if (confirm(`'${item.title}'을(를) ${item.price} ${this.settings.currencyName}에 구매하시겠습니까?`)) {
      student.balance -= item.price;
      student.history.push({
        date: this.getFormattedDate(),
        desc: `[상점 구매] ${item.title}`,
        change: -item.price,
        isXP: false
      });

      this.inventory.push({
        id: Date.now(),
        studentId: student.id,
        shopItemId: item.id,
        title: item.title,
        icon: item.icon,
        status: 'unused', // 'unused' | 'pending_use' | 'completed'
        boughtAt: this.getFormattedDate()
      });

      this.saveState();
      this.render();
      alert(`🎉 '${item.title}' 구매가 완료되었습니다! '내 쿠폰함'에서 사용 신청할 수 있습니다.`);
    }
  }

  requestUseCoupon(inventoryId) {
    const inv = this.inventory.find(i => i.id === inventoryId);
    if (!inv) return;

    if (confirm(`'${inv.title}' 쿠폰 사용을 신청하시겠습니까?\n선생님이 승인 후 사용 처리됩니다.`)) {
      inv.status = 'pending_use';
      this.saveState();
      this.render();
    }
  }

  // =========================================================================
  // TEACHER VIEW RENDERING & ACTIONS
  // =========================================================================
  renderTeacherView() {
    // Stats Summary
    const totalStudents = this.students.length;
    const totalCurrency = this.students.reduce((acc, s) => acc + s.balance, 0);
    const avgLevel = (this.students.reduce((acc, s) => acc + s.level, 0) / (totalStudents || 1)).toFixed(1);
    const pendingCoupons = this.inventory.filter(i => i.status === 'pending_use').length;

    document.getElementById("tc-stat-students").textContent = `${totalStudents}명`;
    document.getElementById("tc-stat-currency").textContent = `${totalCurrency.toLocaleString()} ${this.settings.currencyName}`;
    document.getElementById("tc-stat-avglevel").textContent = `Lv.${avgLevel}`;
    document.getElementById("tc-stat-pending-coupons").textContent = `${pendingCoupons}개`;

    // Render Student Management Table
    const tbody = document.getElementById("teacher-student-tbody");
    tbody.innerHTML = this.students.map(s => {
      const role = this.roles.find(r => r.id === s.roleId) || { name: '미배정' };
      const isChecked = this.selectedStudentIds.has(s.id);

      return `
        <tr>
          <td style="text-align: center;">
            <input type="checkbox" class="chk-student-item" data-id="${s.id}" ${isChecked ? 'checked' : ''} onchange="app.toggleSelectStudent(${s.id}, this.checked)">
          </td>
          <td>
            <div class="student-table-profile">
              <div class="small-avatar">${s.name.charAt(0)}</div>
              <div>${s.id}번 ${s.name}</div>
            </div>
          </td>
          <td>
            <span class="badge" style="background: rgba(99,102,241,0.2); color: #a5b4fc;">Lv.${s.level}</span>
            <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 4px;">(${s.xp} XP)</span>
          </td>
          <td>
            <strong style="color: var(--accent-amber); font-family: 'Outfit'; font-size: 1.05rem;">
              <i class="fa-solid fa-coins"></i> ${s.balance.toLocaleString()}
            </strong>
          </td>
          <td>
            <span class="role-badge">${role.name}</span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="app.openSinglePayModal(${s.id})">
              <i class="fa-solid fa-coins"></i> 지급/차감
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Render Roles Assignment Table
    const rolesTbody = document.getElementById("teacher-roles-tbody");
    rolesTbody.innerHTML = this.students.map(s => {
      const currentRole = this.roles.find(r => r.id === s.roleId) || { id: 0, name: '미배정', salary: 0 };
      const roleOptions = this.roles.map(r => `<option value="${r.id}" ${r.id === s.roleId ? 'selected' : ''}>${r.name} (${r.salary} ${this.settings.currencyName})</option>`).join('');

      return `
        <tr>
          <td><strong>${s.id}번 ${s.name}</strong></td>
          <td><span class="role-badge">${currentRole.name}</span></td>
          <td style="color: var(--accent-amber); font-weight: 700;">+${currentRole.salary} ${this.settings.currencyName} / 주</td>
          <td>
            ${s.tasksCompletedToday 
              ? `<span class="badge badge-completed"><i class="fa-solid fa-check"></i> 오늘 완료</span>` 
              : `<span class="badge badge-pending"><i class="fa-solid fa-clock"></i> 미완료</span>`}
          </td>
          <td style="text-align: right;">
            <select class="form-select" style="width: auto; padding: 0.3rem 0.6rem; font-size: 0.85rem;" onchange="app.changeStudentRole(${s.id}, this.value)">
              ${roleOptions}
            </select>
          </td>
        </tr>
      `;
    }).join('');

    // Render Pending Coupon Requests Queue
    const reqContainer = document.getElementById("teacher-coupon-requests");
    const pendingList = this.inventory.filter(i => i.status === 'pending_use');

    if (pendingList.length === 0) {
      reqContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem 0;">현재 사용 신청 대기 중인 쿠폰이 없습니다.</div>`;
    } else {
      reqContainer.innerHTML = pendingList.map(inv => {
        const student = this.students.find(s => s.id === inv.studentId);
        return `
          <div class="task-item">
            <div class="task-info">
              <div class="shop-icon" style="width: 40px; height: 40px; font-size: 1.1rem; margin-bottom: 0;">
                <i class="fa-solid ${inv.icon || 'fa-ticket'}"></i>
              </div>
              <div>
                <div class="task-name">${student ? student.name : '학생'} - <strong>[${inv.title}]</strong> 사용 신청</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">신청일: ${inv.boughtAt}</div>
              </div>
            </div>
            <button class="btn btn-success btn-sm" onclick="app.approveCouponUse(${inv.id})">
              <i class="fa-solid fa-check"></i> 사용 승인하기
            </button>
          </div>
        `;
      }).join('');
    }

    // Render Teacher Shop Admin Cards
    const teacherShopGrid = document.getElementById("teacher-shop-grid");
    teacherShopGrid.innerHTML = this.shopItems.map(item => `
      <div class="shop-card">
        <div class="shop-icon">
          <i class="fa-solid ${item.icon}"></i>
        </div>
        <div class="shop-title">${item.title}</div>
        <div class="shop-desc">${item.desc}</div>
        <div class="shop-footer">
          <div class="shop-price">
            <i class="fa-solid fa-coins"></i> ${item.price}
          </div>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm" onclick="app.openEditProductModal(${item.id})">수정</button>
            <button class="btn btn-danger btn-sm" onclick="app.deleteShopItem(${item.id})">삭제</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Teacher Tab Switching
  switchTeacherTab(tabName) {
    document.querySelectorAll(".teacher-tab-content").forEach(el => el.style.display = "none");
    document.querySelectorAll("#teacher-view .btn-secondary").forEach(el => el.classList.remove("active"));

    document.getElementById(`tc-tab-${tabName}`).style.display = "block";
    document.getElementById(`tab-btn-${tabName}`).classList.add("active");
  }

  // Student Selection Logic
  toggleSelectStudent(id, checked) {
    if (checked) {
      this.selectedStudentIds.add(id);
    } else {
      this.selectedStudentIds.delete(id);
    }
  }

  toggleSelectAllStudents(forceChecked) {
    const chkAll = document.getElementById("chk-all-students");
    const shouldCheck = forceChecked !== undefined ? forceChecked : !chkAll.checked;
    chkAll.checked = shouldCheck;

    this.selectedStudentIds.clear();
    if (shouldCheck) {
      this.students.forEach(s => this.selectedStudentIds.add(s.id));
    }
    this.renderTeacherView();
  }

  filterStudentTable(query) {
    const q = query.trim().toLowerCase();
    const rows = document.querySelectorAll("#teacher-student-tbody tr");
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(q) ? "" : "none";
    });
  }

  // One-click Weekly Salary Payment
  payAllWeeklySalaries() {
    if (confirm(`전체 27명 학생에게 1인 1역 주급 수당을 일괄 지급하시겠습니까?`)) {
      this.students.forEach(s => {
        const role = this.roles.find(r => r.id === s.roleId);
        const salary = role ? role.salary : 50;
        s.balance += salary;
        s.xp += 50;
        s.history.push({
          date: this.getFormattedDate(),
          desc: `[주급 지급] 1인 1역(${role ? role.name : '역할'}) 수당`,
          change: salary,
          isXP: false
        });
        this.checkLevelUp(s);
      });

      this.saveState();
      this.render();
      alert(`✨ 전체 학생 27명에게 1인 1역 주급 수당이 모두 지급되었습니다!`);
    }
  }

  changeStudentRole(studentId, roleId) {
    const student = this.students.find(s => s.id === studentId);
    if (student) {
      student.roleId = parseInt(roleId, 10);
      this.saveState();
      this.render();
    }
  }

  approveCouponUse(inventoryId) {
    const inv = this.inventory.find(i => i.id === inventoryId);
    if (!inv) return;

    inv.status = 'completed';
    this.saveState();
    this.render();
    alert(`👍 쿠폰 사용 승인이 완료되었습니다.`);
  }

  // Check and trigger Level Up
  checkLevelUp(student) {
    const requiredXP = student.level * this.settings.baseXP;
    if (student.xp >= requiredXP) {
      student.level += 1;
      student.xp -= requiredXP;
      this.triggerConfetti();
      alert(`🎉 축하합니다! ${student.name} 학생이 Level ${student.level}(으)로 레벨업 하였습니다! 🚀`);
    }
  }

  // =========================================================================
  // MODALS HANDLERS
  // =========================================================================
  openSinglePayModal(studentId) {
    this.selectedStudentIds.clear();
    this.selectedStudentIds.add(studentId);
    this.openPayModalUI();
  }

  openBatchPayModal() {
    if (this.selectedStudentIds.size === 0) {
      alert("지급 대상 학생을 1명 이상 선택해 주세요!");
      return;
    }
    this.openPayModalUI();
  }

  openPayModalUI() {
    const targets = Array.from(this.selectedStudentIds)
      .map(id => this.students.find(s => s.id === id))
      .filter(Boolean);

    document.getElementById("modal-pay-target-names").textContent = targets.map(s => `${s.id}번 ${s.name}`).join(", ");
    document.getElementById("modal-pay").classList.add("active");
  }

  handlePaySubmit(event) {
    event.preventDefault();
    const type = document.getElementById("modal-pay-type").value;
    const amount = parseInt(document.getElementById("modal-pay-amount").value, 10) || 0;
    const xp = parseInt(document.getElementById("modal-pay-xp").value, 10) || 0;
    const reason = document.getElementById("modal-pay-reason").value.trim();

    this.selectedStudentIds.forEach(id => {
      const student = this.students.find(s => s.id === id);
      if (student) {
        if (type === "give") {
          student.balance += amount;
          student.xp += xp;
          student.history.push({
            date: this.getFormattedDate(),
            desc: `[교사 지급] ${reason}`,
            change: amount,
            isXP: false
          });
          this.checkLevelUp(student);
        } else {
          student.balance = Math.max(0, student.balance - amount);
          student.history.push({
            date: this.getFormattedDate(),
            desc: `[교사 차감] ${reason}`,
            change: -amount,
            isXP: false
          });
        }
      }
    });

    this.saveState();
    this.closeModal("modal-pay");
    this.render();
    alert(`완료되었습니다.`);
  }

  openAddProductModal() {
    document.getElementById("modal-shop-id").value = "";
    document.getElementById("modal-shop-title").value = "";
    document.getElementById("modal-shop-desc").value = "";
    document.getElementById("modal-shop-price").value = "100";
    document.getElementById("modal-shop-item").classList.add("active");
  }

  openEditProductModal(itemId) {
    const item = this.shopItems.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById("modal-shop-id").value = item.id;
    document.getElementById("modal-shop-icon").value = item.icon;
    document.getElementById("modal-shop-title").value = item.title;
    document.getElementById("modal-shop-desc").value = item.desc;
    document.getElementById("modal-shop-price").value = item.price;
    document.getElementById("modal-shop-item").classList.add("active");
  }

  handleSaveShopItem(event) {
    event.preventDefault();
    const id = document.getElementById("modal-shop-id").value;
    const icon = document.getElementById("modal-shop-icon").value;
    const title = document.getElementById("modal-shop-title").value.trim();
    const desc = document.getElementById("modal-shop-desc").value.trim();
    const price = parseInt(document.getElementById("modal-shop-price").value, 10) || 100;

    if (id) {
      // Edit existing
      const item = this.shopItems.find(i => i.id === parseInt(id, 10));
      if (item) {
        item.icon = icon;
        item.title = title;
        item.desc = desc;
        item.price = price;
      }
    } else {
      // Add new
      this.shopItems.push({
        id: Date.now(),
        icon,
        title,
        desc,
        price
      });
    }

    this.saveState();
    this.closeModal("modal-shop-item");
    this.render();
  }

  deleteShopItem(itemId) {
    if (confirm("정말 이 상점 상품을 삭제하시겠습니까?")) {
      this.shopItems = this.shopItems.filter(i => i.id !== itemId);
      this.saveState();
      this.render();
    }
  }

  openSettingsModal() {
    document.getElementById("setting-currency-name").value = this.settings.currencyName;
    document.getElementById("setting-base-xp").value = this.settings.baseXP;
    document.getElementById("modal-settings").classList.add("active");
  }

  handleSaveSettings(event) {
    event.preventDefault();
    const currencyName = document.getElementById("setting-currency-name").value.trim();
    const baseXP = parseInt(document.getElementById("setting-base-xp").value, 10) || 100;

    this.settings.currencyName = currencyName || "골드";
    this.settings.baseXP = baseXP;

    this.saveState();
    this.closeModal("modal-settings");
    this.render();
    alert("학급 설정이 완료되었습니다.");
  }

  resetAllData() {
    if (confirm("⚠️ 경고: 모든 학생 데이터, 화폐 잔액, 거래 내역이 초기화됩니다.\n정말 진행하시겠습니까?")) {
      localStorage.removeItem("class_management_app_data_v1");
      this.initDefaultData();
      this.closeModal("modal-settings");
      this.render();
      alert("데이터가 기본 상태로 초기화되었습니다.");
    }
  }

  closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
  }

  // Particle Confetti Effect
  triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 8 + 4,
      color: ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"][Math.floor(Math.random() * 5)],
      speedY: Math.random() * 5 + 3,
      speedX: Math.random() * 2 - 1
    }));

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      frame++;
      if (frame < 120) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  }
}

// Global App Instance
let app;
window.addEventListener("DOMContentLoaded", () => {
  app = new ClassManagementApp();
});
