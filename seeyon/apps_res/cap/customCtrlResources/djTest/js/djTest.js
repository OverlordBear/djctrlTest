/**
 * PC端自定义控件 - 按钮触发Vue Dialog
 *
 * 职责边界：
 *   ① 注册 Seeyon 命名空间（框架约定，不可省略）
 *   ② 渲染一个渐变按钮
 *   ③ 点击 → 全屏 iframe 加载 Vue 页面
 *   ④ 监听 postMessage 关闭 iframe
 *
 * 所有业务逻辑、Dialog UI、后端交互 → 全部在 Vue 页面内完成。
 * Vue 可通过 window.top / window.parent 访问致远全局 API。
 */
(function(factory) {
    var nameSpace = 'field_20260331dj';
    if (!window[nameSpace]) {
        var Builder = factory();
        window[nameSpace] = {
            instance: {}
        };
        window[nameSpace].init = function(options) {
            window[nameSpace].instance[options.privateId] = new Builder(options);
        };
    }
})(function() {

    function App(options) {
        this._adaptation = options.adaptation;
        this._privateId = options.privateId;
        this._preUrl = options.url_prefix;
        this._messageObj = options.getData;

        this._loadCss(this._preUrl + 'css/formQueryBtn.css');
        this._renderBtn();
        this._listenDataChange();
    }

    App.prototype = {

        // ---- 加载按钮样式 ----
        _loadCss: function(path) {
            if (!path) return;
            var link = document.createElement('link');
            link.href = path;
            link.rel = 'stylesheet';
            link.type = 'text/css';
            document.head.appendChild(link);
        },

        // ---- 渲染按钮 ----
        _renderBtn: function() {
            var self = this;
            var displayText = (self._messageObj && self._messageObj.display)
                ? self._messageObj.display.escapeHTML()
                : 'Dj测试按钮';

            var html = '<section class="customButton_box_content">'
                + '<div class="customButton_class_box my-fancy-btn ' + self._privateId + '" '
                + 'title="' + displayText + '">'
                + displayText
                + '</div></section>';

            document.querySelector('#' + self._privateId).innerHTML = html;
            self._btnEl = document.querySelector('.' + self._privateId);

            if (self._btnEl) {
                self._btnEl.addEventListener('click', self._openVue.bind(self));
            }
        },

        // ---- 表单数据变化时重绘按钮 ----
        _listenDataChange: function() {
            var self = this;
            self._adaptation.ObserverEvent.listen('Event' + self._privateId, function() {
                self._messageObj = self._adaptation.childrenGetData(self._privateId);
                self._renderBtn();
            });
        },

        // ================================================================
        // 核心：打开 Vue 页面（全屏 iframe → Vue 自己画 Dialog）
        // ================================================================
        _openVue: function() {
            var ctxPath = (window.top && window.top._ctxPath) || '/seeyon';
            var url = ctxPath + '/apps_res/cap/customCtrlResources/djTest/vue3-app/dist/index.html';

            var iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;'
                + 'border:none;z-index:99999;';
            document.body.appendChild(iframe);

            // 监听 Vue 发来的关闭消息
            var handler = function(e) {
                if (e.data && e.data.type === 'vueDialogClose') {
                    iframe.remove();
                    window.removeEventListener('message', handler);
                    if (e.data.result && e.data.result.data) {
                        console.log('[DjTest] Vue返回:', e.data.result.data);
                    }
                }
            };
            window.addEventListener('message', handler);
        }
    };

    return App;
});
