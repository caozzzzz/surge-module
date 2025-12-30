/**
 * ip信息面板_chizongzi
 */

const urls = {
  'GitHub': 'https://www.github.com',
  'Google': 'https://www.google.com/generate_204',
  'YouTube': 'https://www.youtube.com/generate_204'
};

!(async () => {
  const responses = await Promise.allSettled([
    getDetailedIP(),
    ...Object.keys(urls).map(name => http(name, urls[name]))
  ]);

  const results = responses.map(r => r.value);
  const ipPart = results[0];
  const latencyPart = results.slice(1).join('\n');

  $done({
    title: '网络状态监控',
    content: `${ipPart}\n\n${latencyPart}\n\n🕒 最后刷新: ${new Date().toLocaleTimeString('zh-CN', {hour12: false})}`,
    icon: 'bolt.horizontal.circle.fill',
    'icon-color': '#007AFF'
  });
})();

// IP 信息展示：含详细括号地址
async function getDetailedIP() {
  return new Promise((resolve) => {
    $httpClient.get('http://ip-api.com/json/?lang=zh-CN', (err, resp, data) => {
      if (err || !data) {
        resolve('🌐获取失败');
      } else {
        const i = JSON.parse(data);
        // 拼接详细地址格式：国家 · 城市 (省/州)
        const location = `${i.country} · ${i.city} (${i.regionName})`;
        resolve([
          `🌐 ${i.query}`,           
          `🌍 ${location}`, 
          `☁️ ${i.isp} (AS${i.as.split(' ')[0].replace('AS', '')})`
        ].join('\n'));
      }
    });
  });
}

// 测速函数：使用 ⏱️ 计时器图标，保持对齐逻辑
function http(name, url) {
  return new Promise((resolve) => {
    const start = Date.now();
    $httpClient.post({ url: url, headers: { 'Cache-Control': 'no-cache' } }, (err) => {
      const delay = Date.now() - start;
      const displayDelay = err ? 'Timeout' : `${delay} ms`;
      resolve(`⏱️ ${name}\xa0\xa0\xa0\t: ${displayDelay}`);
    });
  });
}
