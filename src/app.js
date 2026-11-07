import { api } from "./api.js";

const $ = (selector) => document.querySelector(selector);
const authView = $("#auth-view");
const dashboard = $("#dashboard-view");
const loginForm = $("#login-form");
const loginButton = $("#login-button");
const message = $("#login-message");
const password = $("#password");
const pagePanel = $("#page-panel");
const homeContent = [...document.querySelector(".content-area").children].filter(el => el !== pagePanel);

function setMessage(text, kind = "error") {
  message.textContent = text;
  message.style.color = kind === "success" ? "#629b78" : "#b45b55";
}
function showDashboard(user = {}) {
  authView.classList.add("hidden");
  dashboard.classList.remove("hidden");
  const display = user.displayName || user.name || user.email || "bạn";
  $("#welcome-name").textContent = String(display).slice(0, 48);
  $("#user-avatar").textContent = (String(display).trim()[0] || "♡").toUpperCase();
  $("#today-label").textContent = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date());
}
function showAuth() {
  dashboard.classList.add("hidden");
  authView.classList.remove("hidden");
  loginForm.reset();
  setMessage("");
}
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");
  loginButton.disabled = true;
  loginButton.querySelector("span").textContent = "Đang xác thực...";
  const payload = {
    licenseCode: $("#license").value.trim(),
    email: $("#email").value.trim(),
    password: password.value
  };
  try {
    if (!payload.licenseCode || !payload.email || !payload.password) throw new Error("Vui lòng nhập đầy đủ thông tin.");
    const result = await api.login(payload);
    if (result.authenticated === false || result.success === false) throw new Error(result.message || "Thông tin đăng nhập không hợp lệ.");
    if (result.authenticated !== true && result.success !== true && !result.user) {
      throw new Error("API chưa trả về trạng thái đăng nhập hợp lệ. Hãy kiểm tra hợp đồng API.");
    }
    // Authentication state is held by the API server in a secure HttpOnly cookie.
    showDashboard(result.user || {});
  } catch (error) {
    setMessage(error.message || "Không thể kết nối API. Vui lòng thử lại.");
  } finally {
    loginButton.disabled = false;
    loginButton.querySelector("span").textContent = "Đăng nhập an toàn";
  }
});
$("#toggle-password").addEventListener("click", () => {
  const reveal = password.type === "password";
  password.type = reveal ? "text" : "password";
  $("#toggle-password").textContent = reveal ? "Ẩn" : "Hiện";
});
$("#help-link").addEventListener("click", (event) => {
  event.preventDefault();
  setMessage("Nếu mã khách hàng không hợp lệ, vui lòng liên hệ cửa hàng để kiểm tra license.");
});
$("#logout-button").addEventListener("click", async () => {
  try { await api.logout(); } catch (error) { console.warn("Logout API:", error.message); }
  showAuth();
});

function setPage(page) {
  document.querySelectorAll(".nav-item").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  const titles = {home:["YOUR SPACE","Tổng quan"],friends:["YOUR CIRCLE","Bạn bè"],history:["YOUR MEMORIES","Khoảnh khắc"],studio:["CREATE SOMETHING","Studio"],profile:["YOUR ACCOUNT","Hồ sơ"]};
  $("#page-kicker").textContent = titles[page]?.[0] || "YOUR SPACE";
  $("#page-title").textContent = titles[page]?.[1] || "Tổng quan";
  const isHome = page === "home";
  homeContent.forEach(el => el.classList.toggle("hidden", !isHome));
  pagePanel.classList.toggle("hidden", isHome);
  if (isHome) return;
  const panels = {
    friends: ["Bạn bè", "Danh sách bạn bè sẽ được tải từ API riêng sau khi cấu hình endpoint và schema phản hồi.", '<button data-load="friends">Tải danh sách bạn bè</button>'],
    history: ["Khoảnh khắc", "Lịch sử ảnh và video sẽ được tải từ API riêng.", '<button data-load="moments">Tải khoảnh khắc</button>'],
    studio: ["Tạo khoảnh khắc", "Chọn ảnh hoặc video để gửi lên API. Giới hạn và loại tệp phải được xác thực lại ở máy chủ.", '<label class="file-label">＋ Chọn ảnh hoặc video<input id="moment-file" type="file" accept="image/*,video/*"></label><input id="moment-caption" maxlength="500" placeholder="Viết chú thích (không bắt buộc)"><button id="upload-button">Tải lên</button><p id="studio-message" role="status"></p>'],
    profile: ["Hồ sơ", "Thông tin tài khoản được lấy từ API; không lưu mật khẩu hoặc token trong trình duyệt.", '<button data-load="profile">Tải hồ sơ</button>']
  };
  const [heading, description, action] = panels[page];
  pagePanel.innerHTML = `<h3>${heading}</h3><p>${description}</p>${action}<div id="api-result"></div>`;
}
document.querySelectorAll("[data-page]").forEach(button => button.addEventListener("click", () => setPage(button.dataset.page)));
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => setPage(button.dataset.go)));

pagePanel.addEventListener("click", async (event) => {
  const load = event.target.closest("[data-load]")?.dataset.load;
  if (load) {
    const output = $("#api-result");
    output.textContent = "Đang tải...";
    try {
      const data = await api[load]();
      const pre = document.createElement("pre");
      pre.textContent = JSON.stringify(data, null, 2).slice(0, 12000);
      output.replaceChildren(pre);
    } catch (error) { output.textContent = error.message; }
  }
  if (event.target.id === "upload-button") {
    const file = $("#moment-file").files[0];
    const status = $("#studio-message");
    if (!file) { status.textContent = "Vui lòng chọn tệp trước."; return; }
    if (file.size > 25 * 1024 * 1024) { status.textContent = "Tệp vượt giới hạn giao diện 25 MB."; return; }
    event.target.disabled = true;
    status.textContent = "Đang tải lên...";
    try {
      const result = await api.upload(file, $("#moment-caption").value.trim());
      status.textContent = result.message || "API đã tiếp nhận tệp.";
    } catch (error) { status.textContent = error.message; }
    finally { event.target.disabled = false; }
  }
});
