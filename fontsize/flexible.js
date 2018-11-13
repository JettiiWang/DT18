;(function(win, lib) {
  var doc = win.document; // 获取document
  var docEl = doc.documentElement; // 获取HTML
  var metaEl = doc.querySelector('meta[name="viewport"]'); // 获取到视口的meta标签
  var flexibleEl = doc.querySelector('meta[name="flexible"]'); 

  var dpr = 0; // 声明dpr初始为数字
  var scale = 0; // 声明缩放比为数字
  var tid; // 计时器
  var flexible = lib.flexible || (lib.flexible = {});
  
  if (metaEl) { // 判断页面中是否已经有视口meta
      console.warn('将根据已有的meta标签来设置缩放比例');
      var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/); // 利用正则表达式获取到事先设置在页面中的初始化缩放比
      if (match) { // 如果得到了结果
          scale = parseFloat(match[1]); // 将scale设置为对应的值
          dpr = parseInt(1 / scale); // 根据缩放比计算出dpr
      }
  } else if (flexibleEl) {
      var content = flexibleEl.getAttribute('content');
      if (content) {
          var initialDpr = content.match(/initial\-dpr=([\d\.]+)/);
          var maximumDpr = content.match(/maximum\-dpr=([\d\.]+)/);
          if (initialDpr) {
              dpr = parseFloat(initialDpr[1]);
              scale = parseFloat((1 / dpr).toFixed(2));    
          }
          if (maximumDpr) {
              dpr = parseFloat(maximumDpr[1]);
              scale = parseFloat((1 / dpr).toFixed(2));    
          }
      }
  }

  if (!dpr && !scale) { // 如果上面条件都不成立
      var isAndroid = win.navigator.appVersion.match(/android/gi); // 判断设备是否是安卓设备
      var isIPhone = win.navigator.appVersion.match(/iphone/gi); // 判断设备是否是苹果设备
      var devicePixelRatio = win.devicePixelRatio; // 通过js获取设备的dpr
      if (isIPhone) { // 判断设备是否是iphone
          // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
          if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {                
              dpr = 3; 
          } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
              dpr = 2;
          } else {
              dpr = 1;
          }
      } else {
          // 其他设备下，仍旧使用1倍的方案
          dpr = 1; // 就是我们的方案2
      }
      scale = 1 / dpr; // 根据dpr计算缩放比
  }

  docEl.setAttribute('data-dpr', dpr); // 给HTML设置一个属性data-dpr 为对应刚才计算出来的dpr
  if (!metaEl) { // 如果没有事先设置视口meta
      metaEl = doc.createElement('meta'); // 创建一个
      metaEl.setAttribute('name', 'viewport'); // 设置name属性为viewport
      metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no'); // 设置缩放比，为刚才计算的scale
      if (docEl.firstElementChild) {
          docEl.firstElementChild.appendChild(metaEl);
      } else {
          var wrap = doc.createElement('div');
          wrap.appendChild(metaEl);
          doc.write(wrap.innerHTML);
      }
      // 将创建meta添加到页面中
  }

  function refreshRem(){
      var width = docEl.getBoundingClientRect().width; // 获取视口宽度
      if (width / dpr > 540) { // 给字体大小一个上限
          width = 540 * dpr;
      }
      var rem = width / 10; // 计算字体大小
      docEl.style.fontSize = rem + 'px'; // 给html设置字体大小
      flexible.rem = win.rem = rem; // 
  }

  win.addEventListener('resize', function() {
      clearTimeout(tid);
      tid = setTimeout(refreshRem, 300);
  }, false);
  win.addEventListener('pageshow', function(e) {
      if (e.persisted) {
          clearTimeout(tid);
          tid = setTimeout(refreshRem, 300);
      }
  }, false);

  if (doc.readyState === 'complete') {
      doc.body.style.fontSize = 12 * dpr + 'px'; 
  } else {
      doc.addEventListener('DOMContentLoaded', function(e) {
          doc.body.style.fontSize = 12 * dpr + 'px';
      }, false);
  }
  

  refreshRem();

  flexible.dpr = win.dpr = dpr;
  flexible.refreshRem = refreshRem;
  flexible.rem2px = function(d) {
      var val = parseFloat(d) * this.rem;
      if (typeof d === 'string' && d.match(/rem$/)) {
          val += 'px';
      }
      return val;
  }
  flexible.px2rem = function(d) {
      var val = parseFloat(d) / this.rem;
      if (typeof d === 'string' && d.match(/px$/)) {
          val += 'rem';
      }
      return val;
  }

})(window, window['lib'] || (window['lib'] = {}));