// 博客主脚本
document.addEventListener('DOMContentLoaded', function() {
    // 代码高亮初始化
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }
    
    // 添加代码复制功能
    addCodeCopyButtons();
    
    // 平滑滚动
    addSmoothScrolling();
    
    // TOC功能初始化
    initTableOfContents();
});

function addCodeCopyButtons() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(function(codeBlock) {
        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.textContent = '复制';
        button.addEventListener('click', function() {
            navigator.clipboard.writeText(codeBlock.textContent).then(function() {
                button.textContent = '已复制!';
                setTimeout(function() {
                    button.textContent = '复制';
                }, 2000);
            });
        });
        
        const pre = codeBlock.parentNode;
        pre.style.position = 'relative';
        pre.appendChild(button);
    });
}

function addSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // 暂时禁用Observer，避免冲突
                const observer = window.tocObserver;
                if (observer) {
                    observer.disconnect();
                }
                
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 高亮当前TOC链接
                highlightCurrentTocItem(this);
                
                // 滚动完成后重新启用Observer
                setTimeout(function() {
                    if (observer) {
                        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
                        headings.forEach(heading => observer.observe(heading));
                    }
                }, 1000);
            }
        });
    });
}

/**
 * 初始化目录功能
 */
function initTableOfContents() {
  const tocElement = document.getElementById('table-of-contents') || 
                     document.querySelector('.table-of-contents');
  
  if (!tocElement) return;

  // 为TOC链接添加平滑滚动
  addSmoothScrolling(tocElement);
  
  // 初始化滚动监听
  initScrollSpy();
  
  // 初始化浮动TOC控制
  initFloatingToc(tocElement);
}

/**
 * 初始化浮动TOC控制
 */
function initFloatingToc(tocElement) {
  // 创建书签切换按钮
  createTocToggle();
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleTocResize);
}

/**
 * 检测页面语言设置
 */
function detectLanguage() {
  // 检查HTML lang属性
  const htmlLang = document.documentElement.lang;
  if (htmlLang) {
    return htmlLang.toLowerCase();
  }
  
  // 检查meta标签中的语言设置
  const langMeta = document.querySelector('meta[name="language"]');
  if (langMeta) {
    return langMeta.content.toLowerCase();
  }
  
  // 检查页面内容中的中文字符
  const content = document.body.textContent;
  const chinesePattern = /[\u4e00-\u9fa5]/;
  if (chinesePattern.test(content)) {
    return 'zh-cn';
  }
  
  // 默认返回英文
  return 'en';
}

/**
 * 根据语言获取TOC标签文本
 */
function getTocLabel(lang) {
  // 简化：只支持中文和英文
  if (lang.startsWith('zh')) {
    return '目录';
  }
  return 'TOC';
}

/**
 * 创建TOC书签
 */
function createTocToggle() {
  const existingBookmark = document.querySelector('.toc-bookmark');
  if (existingBookmark) return;
  
  // 检测语言并设置相应的标签
  const lang = detectLanguage();
  const tocLabel = getTocLabel(lang);
  
  // 为body添加语言类，用于CSS样式
  if (lang.startsWith('en')) {
    document.body.classList.add('toc-lang-en');
  } else {
    document.body.classList.add('toc-lang-zh');
  }
  
  // 只创建书签，它将负责所有的切换功能
  const bookmark = document.createElement('button');
  bookmark.className = 'toc-bookmark';
  bookmark.innerHTML = tocLabel;
  bookmark.title = lang.startsWith('zh') ? '切换目录显示' : 'Toggle Table of Contents';
  bookmark.addEventListener('click', toggleToc);
  document.body.appendChild(bookmark);
}

/**
 * 切换TOC显示状态
 */
function toggleToc() {
  const tocElement = document.getElementById('table-of-contents') || 
                     document.querySelector('.table-of-contents');
  
  if (!tocElement) return;
  
  const isVisible = tocElement.classList.contains('toc-visible');
  
  if (isVisible) {
    hideToc();
  } else {
    showToc();
  }
}

/**
 * 创建TOC收起按钮
 */
function createTocCloseButton(tocElement) {
  const existingClose = tocElement.querySelector('.toc-close');
  if (existingClose) return;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toc-close';
  closeBtn.innerHTML = '◀';
  closeBtn.title = '收起目录';
  
  closeBtn.addEventListener('click', hideToc);
  
  tocElement.appendChild(closeBtn);
}



/**
 * 显示TOC
 */
function showToc() {
  const tocElement = document.getElementById('table-of-contents') || 
                     document.querySelector('.table-of-contents');
  
  if (!tocElement) return;
  
  tocElement.classList.add('toc-visible');
  document.body.classList.add('toc-active');
}

/**
 * 隐藏TOC
 */
function hideToc() {
  const tocElement = document.getElementById('table-of-contents') || 
                     document.querySelector('.table-of-contents');
  
  if (!tocElement) return;
  
  tocElement.classList.remove('toc-visible');
  document.body.classList.remove('toc-active');
}

/**
 * 处理窗口大小变化
 */
function handleTocResize() {
  const tocElement = document.getElementById('table-of-contents') || 
                     document.querySelector('.table-of-contents');
  
  if (!tocElement) return;
  
  // 在大屏幕上默认显示TOC
  if (window.innerWidth >= 1400) {
    showToc();
  } else if (window.innerWidth <= 768) {
    // 在移动设备上默认隐藏TOC
    hideToc();
  }
}

function initScrollSpy() {
    const tocLinks = document.querySelectorAll('#table-of-contents a, .table-of-contents a');
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    if (tocLinks.length === 0 || headings.length === 0) return;
    
    // 创建Intersection Observer
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                if (id) {
                    // 移除所有活动状态
                    tocLinks.forEach(link => link.classList.remove('active'));
                    
                    // 找到对应的TOC链接并激活
                    const activeLink = document.querySelector(
                        `#table-of-contents a[href="#${id}"], .table-of-contents a[href="#${id}"]`
                    );
                    if (activeLink) {
                        activeLink.classList.add('active');
                        // 不自动滚动TOC，避免影响用户的阅读体验
                    }
                }
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0.3
    });
    
    // 观察所有标题
    headings.forEach(heading => observer.observe(heading));
    
    // 保存Observer引用供其他函数使用
    window.tocObserver = observer;
}

function highlightCurrentTocItem(clickedLink) {
    // 移除所有TOC链接的活动状态
    const allTocLinks = document.querySelectorAll('#table-of-contents a, .table-of-contents a');
    allTocLinks.forEach(link => link.classList.remove('active'));
    
    // 激活点击的链接
    clickedLink.classList.add('active');
}

/**
 * 为TOC添加折叠按钮
 */
function addTocFoldButton(tocElement) {
  const foldBtn = document.createElement('button');
  foldBtn.className = 'toc-fold';
  foldBtn.innerHTML = '−';
  foldBtn.title = '折叠/展开';
  
  const h2 = tocElement.querySelector('h2');
  if (h2) {
    h2.appendChild(foldBtn);
    
    foldBtn.addEventListener('click', function() {
      const content = tocElement.querySelector('ul');
      if (content) {
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        foldBtn.innerHTML = isHidden ? '−' : '+';
        foldBtn.classList.toggle('folded', !isHidden);
      }
    });
  }
}

/**
 * 为TOC链接添加平滑滚动
 */
function addSmoothScrolling(tocElement) {
  const tocLinks = tocElement.querySelectorAll('a[href^="#"]');
  
  tocLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // 暂时断开Observer，避免滚动时频繁触发
        if (window.tocObserver) {
          window.tocObserver.disconnect();
        }
        
        // 高亮当前TOC项
        highlightCurrentTocItem(this);
        
        // 瞬间跳转到目标
        targetElement.scrollIntoView({
          behavior: 'instant',
          block: 'start'
        });
        
        // 短暂延迟重新连接Observer
        setTimeout(function() {
          if (window.tocObserver) {
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(heading => {
              if (window.tocObserver) {
                window.tocObserver.observe(heading);
              }
            });
          }
        }, 100);
        
        // 在移动端点击后立即隐藏TOC
        if (window.innerWidth <= 768) {
          hideToc();
        }
      }
    });
  });
}

/**
 * 初始化代码复制功能
 */
function initCodeCopy() {
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(function(codeBlock) {
    const pre = codeBlock.parentNode;
    
    // 创建复制按钮
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-code-btn';
    copyBtn.textContent = '复制';
    copyBtn.title = '复制代码到剪贴板';
    
    // 添加按钮到pre元素
    pre.style.position = 'relative';
    pre.appendChild(copyBtn);
    
    // 绑定复制事件
    copyBtn.addEventListener('click', function() {
      const code = codeBlock.textContent;
      
      navigator.clipboard.writeText(code).then(function() {
        copyBtn.textContent = '已复制!';
        copyBtn.style.backgroundColor = '#4CAF50';
        
        setTimeout(function() {
          copyBtn.textContent = '复制';
          copyBtn.style.backgroundColor = '';
        }, 2000);
      }).catch(function() {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        copyBtn.textContent = '已复制!';
        setTimeout(function() {
          copyBtn.textContent = '复制';
        }, 2000);
      });
    });
  });
}

/**
 * 页面加载完成后初始化所有功能
 */
document.addEventListener('DOMContentLoaded', function() {
  initTableOfContents();
  initCodeCopy();
  
  // 初始化TOC显示状态
  if (window.innerWidth >= 1400) {
    showToc();
  }
});