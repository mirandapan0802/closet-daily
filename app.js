const wardrobeSeed = [
  {
    id: 1,
    name: "白色基础 T 恤",
    category: "T 恤",
    color: "白色",
    weight: "薄",
    style: "日常",
    temp: "22-30°C",
    wears: 18,
    lastWornDays: 2,
    condition: "良好",
    bg: "16% 25%",
  },
  {
    id: 2,
    name: "浅蓝棉衬衫",
    category: "衬衫",
    color: "蓝色",
    weight: "薄",
    style: "日常/通勤",
    temp: "16-26°C",
    wears: 9,
    lastWornDays: 12,
    condition: "良好",
    bg: "50% 26%",
  },
  {
    id: 3,
    name: "灰色轻薄外套",
    category: "外套",
    color: "灰色",
    weight: "中等",
    style: "日常",
    temp: "14-22°C",
    wears: 6,
    lastWornDays: 40,
    condition: "良好",
    bg: "86% 24%",
  },
  {
    id: 4,
    name: "深色直筒长裤",
    category: "裤子",
    color: "黑色",
    weight: "中等",
    style: "日常/通勤",
    temp: "10-26°C",
    wears: 22,
    lastWornDays: 5,
    condition: "良好",
    bg: "12% 78%",
  },
  {
    id: 5,
    name: "黑色半身裙",
    category: "裙子",
    color: "黑色",
    weight: "中等",
    style: "日常/约会",
    temp: "16-28°C",
    wears: 3,
    lastWornDays: 210,
    condition: "良好",
    bg: "52% 78%",
  },
  {
    id: 6,
    name: "白色休闲鞋",
    category: "鞋子",
    color: "白色",
    weight: "中等",
    style: "日常",
    temp: "12-30°C",
    wears: 28,
    lastWornDays: 1,
    condition: "磨损",
    bg: "90% 82%",
  },
];

let wardrobe = JSON.parse(localStorage.getItem("closetMvpWardrobe") || "null") || wardrobeSeed;
let activeCategory = "全部";
let recommendationCursor = 0;
let weather = JSON.parse(localStorage.getItem("closetMvpWeather") || "null") || {
  place: "上海",
  temp: 24,
  high: 26,
  low: 21,
  rain: 62,
  code: 61,
  live: false,
};

const screens = document.querySelectorAll(".screen");
const tabs = document.querySelectorAll(".tab");
const screenTitle = document.getElementById("screenTitle");
const toast = document.getElementById("toast");
const weatherCodeText = {
  0: "晴",
  1: "少云",
  2: "多云",
  3: "阴",
  45: "有雾",
  48: "有雾",
  51: "小雨",
  53: "小雨",
  55: "小雨",
  61: "有小雨",
  63: "有雨",
  65: "大雨",
  80: "阵雨",
  81: "阵雨",
  82: "强阵雨",
  95: "雷雨",
  96: "雷雨",
  99: "雷雨",
};

function saveWardrobe() {
  localStorage.setItem("closetMvpWardrobe", JSON.stringify(wardrobe));
}

function saveWeather() {
  localStorage.setItem("closetMvpWeather", JSON.stringify(weather));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function switchScreen(screenId, title) {
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === screenId));
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.screen === screenId));
  screenTitle.textContent = title;
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => switchScreen(tab.dataset.screen, tab.dataset.title));
});

function thumbStyle(item) {
  if (item.photo) {
    return `background-image:url('${item.photo}');background-size:cover;background-position:center;`;
  }
  return `background-position:${item.bg};`;
}

function getDecision(item) {
  if (item.condition === "损坏" || item.condition === "磨损") return ["丢弃", "discard"];
  if (item.lastWornDays > 180 && item.wears < 5) return ["捐赠", "donate"];
  if (item.lastWornDays > 90) return ["观察", "watch"];
  return ["保留", "keep"];
}

function weatherLabel() {
  return weatherCodeText[weather.code] || (weather.rain >= 45 ? "有雨" : "多云");
}

function weatherIcon() {
  if (weather.rain >= 45 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.code)) return "☂";
  if ([0, 1].includes(weather.code)) return "☼";
  if ([45, 48].includes(weather.code)) return "≋";
  return "☁";
}

function renderCloset() {
  const categories = ["全部", ...new Set(wardrobe.map((item) => item.category))];
  document.getElementById("categoryFilters").innerHTML = categories
    .map(
      (category) =>
        `<button class="filter ${category === activeCategory ? "active" : ""}" data-category="${category}" type="button">${category}</button>`,
    )
    .join("");

  document.querySelectorAll(".filter").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderCloset();
    });
  });

  const filtered =
    activeCategory === "全部" ? wardrobe : wardrobe.filter((item) => item.category === activeCategory);
  const categoryCounts = wardrobe.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  document.getElementById("totalCount").textContent = wardrobe.length;
  document.getElementById("lowUseCount").textContent = wardrobe.filter((item) => item.wears < 5).length;
  document.getElementById("duplicateCount").textContent = Object.values(categoryCounts).filter((count) => count >= 3).length;

  document.getElementById("closetGrid").innerHTML = filtered
    .map(
      (item) => `
        <article class="closet-card">
          <div class="thumb" style="${thumbStyle(item)}"></div>
          <div class="closet-info">
            <p class="item-title">${item.name}</p>
            <p class="item-meta">${item.color} · ${item.temp} · 已穿 ${item.wears} 次</p>
            <div class="tag-row">
              <span class="tag">${item.category}</span>
              <span class="tag">${item.weight}</span>
              <span class="tag">${getDecision(item)[0]}</span>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function buildOutfit() {
  const chilly = weather.temp <= 21;
  const hot = weather.temp >= 28;
  const tops = wardrobe.filter((item) =>
    ["T 恤", "衬衫"].includes(item.category) && (hot ? item.weight === "薄" : true),
  );
  const bottoms = wardrobe.filter((item) => ["裤子", "裙子"].includes(item.category));
  const layers = wardrobe.filter((item) => item.category === "外套" && chilly);
  const shoes = wardrobe.filter((item) => item.category === "鞋子");
  const pick = (items, offset = 0) => items[(recommendationCursor + offset) % Math.max(items.length, 1)];
  return [pick(tops), pick(bottoms, 1), pick(layers), pick(shoes)].filter(Boolean);
}

function renderToday() {
  const outfit = buildOutfit();
  const rainy = weather.rain >= 45 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weather.code);
  document.getElementById("weatherPlace").textContent = `${weather.place} · 今日日常`;
  document.getElementById("weatherNow").textContent = `${Math.round(weather.temp)}°C ${weatherLabel()}，${Math.round(weather.low)}-${Math.round(weather.high)}°C`;
  document.getElementById("weatherRefreshBtn").textContent = weatherIcon();
  document.getElementById("weatherSource").textContent = weather.live ? "已关联实时天气" : "当前使用示例天气";
  document.getElementById("recommendReasons").innerHTML = [
    weather.temp >= 28
      ? `${Math.round(weather.temp)}°C 偏热，优先薄上衣和透气下装。`
      : weather.temp <= 18
        ? `${Math.round(weather.temp)}°C 偏凉，需要外套或更厚内搭。`
        : `${Math.round(weather.temp)}°C 温和，薄衬衫和轻外套更灵活。`,
    rainy ? "今天有降水可能，优先深色、易清洁、防泼水单品。" : "今天降水风险较低，可以选择浅色或更轻便的组合。",
    "最近穿过的单品会降低优先级，长期闲置但适合天气的衣服会被重新带入推荐。",
  ]
    .map((reason) => `<li>${reason}</li>`)
    .join("");

  document.getElementById("outfitList").innerHTML = outfit
    .map(
      (item) => `
        <article class="outfit-item">
          <div class="thumb" style="${thumbStyle(item)}"></div>
          <div>
            <p class="item-title">${item.name}</p>
            <p class="item-meta">${item.category} · ${item.weight} · 最近 ${item.lastWornDays} 天前穿过</p>
          </div>
        </article>
      `,
    )
    .join("");
}

async function fetchWeatherByPosition(position) {
  const { latitude, longitude } = position.coords;
  const params = new URLSearchParams({
    latitude: latitude.toFixed(4),
    longitude: longitude.toFixed(4),
    current: "temperature_2m,weather_code,precipitation",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "1",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) throw new Error("天气服务暂时不可用");
  const data = await response.json();
  weather = {
    place: "当前位置",
    temp: data.current?.temperature_2m ?? weather.temp,
    high: data.daily?.temperature_2m_max?.[0] ?? weather.high,
    low: data.daily?.temperature_2m_min?.[0] ?? weather.low,
    rain: data.daily?.precipitation_probability_max?.[0] ?? Math.min(100, (data.current?.precipitation || 0) * 35),
    code: data.current?.weather_code ?? weather.code,
    live: true,
  };
  saveWeather();
  renderToday();
  showToast("已关联当前位置天气");
}

function requestLiveWeather() {
  if (!("geolocation" in navigator)) {
    showToast("当前浏览器不支持定位，先使用示例天气");
    return;
  }
  showToast("正在请求定位天气");
  navigator.geolocation.getCurrentPosition(fetchWeatherByPosition, () => {
    weather.live = false;
    saveWeather();
    renderToday();
    showToast("没有拿到定位，继续使用示例天气");
  }, {
    enableHighAccuracy: false,
    maximumAge: 30 * 60 * 1000,
    timeout: 9000,
  });
}

function renderDeclutter() {
  const sorted = [...wardrobe].sort((a, b) => b.lastWornDays - a.lastWornDays);
  document.getElementById("decisionList").innerHTML = sorted
    .map((item) => {
      const [label, className] = getDecision(item);
      return `
        <article class="decision-item">
          <div>
            <p class="item-title">${item.name}</p>
            <p class="item-meta">${item.category} · 已 ${item.lastWornDays} 天没穿 · 状态：${item.condition}</p>
          </div>
          <span class="decision-pill ${className}">${label}</span>
        </article>
      `;
    })
    .join("");
}

function renderShopping() {
  const coats = wardrobe.filter((item) => item.category === "外套");
  const shoeQuality = wardrobe.filter((item) => item.category === "鞋子" && item.condition !== "磨损");
  const blackTops = wardrobe.filter((item) => item.color === "黑色" && ["T 恤", "衬衫"].includes(item.category));

  const suggestions = [
    {
      title: "中性色防雨轻外套",
      priority: coats.length < 2 ? "高优先级" : "中优先级",
      reason: "覆盖 14-22°C 和小雨日常场景，可以搭配大多数深色下装。",
    },
    {
      title: "可步行通勤鞋",
      priority: shoeQuality.length < 1 ? "高优先级" : "低优先级",
      reason: "当前鞋类磨损偏高，若每天走路较多，这一件比新增上衣更值得。",
    },
    {
      title: "四季基础内搭",
      priority: "中优先级",
      reason: "选择白、灰或蓝，避免继续增加黑色重复款。",
    },
  ];

  document.getElementById("shoppingList").innerHTML = suggestions
    .map(
      (item) => `
        <article class="shopping-item">
          <div>
            <strong>${item.title} <span class="priority">${item.priority}</span></strong>
            <p class="item-meta">${item.reason}</p>
          </div>
        </article>
      `,
    )
    .join("");

  document.getElementById("avoidList").innerHTML = ["黑色 T 恤", "相似半身裙", "只适合单一场景的外套"]
    .concat(blackTops.length >= 3 ? ["黑色上衣"] : [])
    .map((label) => `<span class="avoid-chip">${label}</span>`)
    .join("");
}

document.getElementById("shuffleBtn").addEventListener("click", () => {
  recommendationCursor += 1;
  renderToday();
  showToast("已换一套更偏日常的组合");
});

document.getElementById("wornBtn").addEventListener("click", () => {
  buildOutfit().forEach((chosen) => {
    const item = wardrobe.find((candidate) => candidate.id === chosen.id);
    if (item) {
      item.wears += 1;
      item.lastWornDays = 0;
    }
  });
  saveWardrobe();
  renderAll();
  showToast("已记录今天穿着，利用率更新了");
});

document.getElementById("notifyBtn").addEventListener("click", () => {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      showToast(permission === "granted" ? "已允许提醒；真实每日推送需要部署 HTTPS" : "提醒权限未开启");
    });
    return;
  }
  showToast("安卓 PWA 可做推送；需要 HTTPS 和后端定时任务");
});

document.getElementById("locationBtn").addEventListener("click", requestLiveWeather);
document.getElementById("weatherRefreshBtn").addEventListener("click", requestLiveWeather);

const photoInput = document.getElementById("photoInput");
const draftPanel = document.getElementById("draftPanel");
const draftImage = document.getElementById("draftImage");
let draftPhoto = "";

photoInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    draftPhoto = reader.result;
    draftImage.style.backgroundImage = `url('${draftPhoto}')`;
    draftPanel.classList.add("visible");
    const categoryGuess = ["T 恤", "衬衫", "裤子", "裙子", "外套"][Math.floor(Math.random() * 5)];
    document.getElementById("itemCategory").value = categoryGuess;
    document.getElementById("itemName").value = `${categoryGuess} · 待命名`;
    showToast("AI 已生成标签草稿，可以手动修正");
  };
  reader.readAsDataURL(file);
});

document.getElementById("saveDraftBtn").addEventListener("click", () => {
  const category = document.getElementById("itemCategory").value;
  wardrobe.unshift({
    id: Date.now(),
    name: document.getElementById("itemName").value || "新上传单品",
    category,
    color: "待确认",
    weight: document.getElementById("itemWeight").value,
    style: "日常",
    temp: document.getElementById("itemTemp").value,
    wears: 0,
    lastWornDays: 999,
    condition: "良好",
    photo: draftPhoto,
    bg: "50% 50%",
  });
  saveWardrobe();
  renderAll();
  draftPanel.classList.remove("visible");
  photoInput.value = "";
  switchScreen("closetScreen", "衣橱");
  showToast("已加入衣橱，并进入 30 天观察");
});

function renderAll() {
  renderCloset();
  renderToday();
  renderDeclutter();
  renderShopping();
}

renderAll();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {
    showToast("离线缓存注册失败，不影响当前使用");
  });
}
