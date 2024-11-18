// 点击扩展图标时直接执行排序
chrome.action.onClicked.addListener(async () => {
  try {
    // 获取当前窗口的所有标签页和群组
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const groups = await chrome.tabGroups.query({ windowId: chrome.windows.WINDOW_ID_CURRENT });
    
    // 记录使用域名命名的群组
    const domainGroups = new Map(); // 域名 -> 群组ID
    const otherGroups = new Set(); // 非域名群组的ID集合
    
    groups.forEach(group => {
      // 检查群组名是否是域名格式
      if (/^[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/.test(group.title)) {
        domainGroups.set(group.title, group.id);
      } else {
        otherGroups.add(group.id);
      }
    });
    
    // 获取规范化的域名（最多保留三级）
    const getNormalizedDomain = (hostname) => {
      const parts = hostname.split('.');
      if (parts.length > 3) {
        return parts.slice(-3).join('.');
      }
      return hostname;
    };
    
    // 域名处理函数：将域名转换为数组，并反转顺序以便排序
    const processDomain = (hostname) => {
      const parts = hostname.split('.');
      return parts.reverse();
    };
    
    // 域名比较函数
    const compareDomains = (a, b) => {
      const aParts = processDomain(a);
      const bParts = processDomain(b);
      
      // 比较每一层级的域名
      const minLength = Math.min(aParts.length, bParts.length);
      
      for (let i = 0; i < minLength; i++) {
        if (aParts[i] !== bParts[i]) {
          return aParts[i].localeCompare(bParts[i]);
        }
      }
      
      // 如果前面的层级都相同，域名层级少的排在前面
      return aParts.length - bParts.length;
    };
    
    // 标签页排序函数
    const compareTabs = (a, b) => {
      try {
        const domainA = getNormalizedDomain(new URL(a.url).hostname);
        const domainB = getNormalizedDomain(new URL(b.url).hostname);
        
        // 如果域名不同，按域名排序
        const domainCompare = compareDomains(domainA, domainB);
        if (domainCompare !== 0) {
          return domainCompare;
        }
        
        // 如果域名相同，按完整URL排序
        return a.url.localeCompare(b.url);
      } catch (e) {
        return 0;
      }
    };
    
    // 收集未分组的标签页
    const ungroupedTabs = new Map(); // 域名 -> 标签页数组
    const ungroupedTabsList = await chrome.tabs.query({ 
      currentWindow: true,
      groupId: chrome.tabGroups.TAB_GROUP_ID_NONE
    });
    
    // 按域名整理未分组的标签页
    ungroupedTabsList.forEach(tab => {
      try {
        const url = new URL(tab.url);
        const domain = getNormalizedDomain(url.hostname);
        
        if (!ungroupedTabs.has(domain)) {
          ungroupedTabs.set(domain, []);
        }
        ungroupedTabs.get(domain).push(tab);
      } catch (e) {
        console.log('跳过无效URL:', tab.url);
      }
    });
    
    // 处理未分组的标签页
    for (const [domain, domainTabs] of ungroupedTabs) {
      // 先按域名和favicon排序
      domainTabs.sort(compareTabs);
      
      // 检查是否存在相同域名的群组
      const existingGroupId = domainGroups.get(domain);
      
      if (existingGroupId) {
        // 将标签页添加到现有群组
        const tabIds = domainTabs.map(tab => tab.id);
        await chrome.tabs.group({ tabIds, groupId: existingGroupId });
      } else if (domainTabs.length >= 3) {
        // 创建新群组
        const tabIds = domainTabs.map(tab => tab.id);
        const group = await chrome.tabs.group({ tabIds });
        
        // 设置群组标题和颜色
        await chrome.tabGroups.update(group, {
          title: domain,
          color: ['blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'][
            domain.length % 8
          ],
          collapsed: true
        });
        
        // 记录新创建的域名群组
        domainGroups.set(domain, group);
      }
    }
    
    // 对所有群组内的标签页进行排序
    // 先处理域名群组
    for (const [domain, groupId] of domainGroups) {
      try {
        // 获取群组内的所有标签页
        const groupTabs = await chrome.tabs.query({ groupId });
        
        // 按域名和favicon排序
        groupTabs.sort(compareTabs);
        
        // 移动标签页到正确的位置
        let currentIndex = Math.min(...groupTabs.map(t => t.index));
        for (const tab of groupTabs) {
          await chrome.tabs.move(tab.id, { index: currentIndex });
          currentIndex++;
        }
        
        // 设置群组为收缩状态
        await chrome.tabGroups.update(groupId, { collapsed: true });
      } catch (e) {
        console.log(`排序群组 ${domain} 失败:`, e);
      }
    }
    
    // 再处理非域名群组
    for (const groupId of otherGroups) {
      try {
        // 获取群组内的所有标签页
        const groupTabs = await chrome.tabs.query({ groupId });
        
        // 按域名和favicon排序
        groupTabs.sort(compareTabs);
        
        // 移动标签页到正确的位置
        let currentIndex = Math.min(...groupTabs.map(t => t.index));
        for (const tab of groupTabs) {
          await chrome.tabs.move(tab.id, { index: currentIndex });
          currentIndex++;
        }
        
        // 设置群组为收缩状态
        await chrome.tabGroups.update(groupId, { collapsed: true });
      } catch (e) {
        console.log(`排序非域名群组 ${groupId} 失败:`, e);
      }
    }
  } catch (e) {
    console.error('发生错误:', e);
  }
}); 