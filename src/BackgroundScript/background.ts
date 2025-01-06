/**
 * 插件启动
 */
chrome.runtime.onStartup.addListener(async () => { });

/**
 * 安装事件
 */
chrome.runtime.onInstalled.addListener(async () => { });

/**
 * 新标签页创建事件
 */
chrome.tabs.onCreated.addListener(() => { });



// 监听扩展图标toggle切换侧边栏
let isOpen = false;

chrome.action.onClicked.addListener(async () => {
  isOpen = !isOpen;

  await chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: isOpen,
  });
});