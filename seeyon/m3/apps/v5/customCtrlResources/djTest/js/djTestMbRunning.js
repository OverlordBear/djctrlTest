/**
 * 移动端自定义控件 - 按钮触发Vue Dialog
 *
 * 职责边界：与 PC 端 djTest.js 一致
 *   ① 注册 M3 命名空间
 *   ② 渲染按钮（轻表单/非轻表单双模式）
 *   ③ 点击 → 全屏 iframe 加载 Vue 页面
 *   ④ 监听 postMessage 关闭 iframe
 *
 * 所有业务逻辑、Dialog UI → 全部在 Vue 页面内完成。
 * Vue 可通过 window.top 访问 csdk / cmp 等致远全局 API。
 */
(function() {
    var scopeName = 'field_20260331dj';

    if (window[scopeName]) return; // 防止重复注册

    // ---- 主题获取 ----
    var theme = {
        fieldBg: '#FFF',
        fieldLine: '1px solid #EEE',
        fieldTitleDefaultColor: '#4A4A4A',
        fieldValueDefaultColor: '#000',
        isNotNullBg: '#FFF3D4'
    };
    try {
        if (typeof csdk !== 'undefined' && csdk.core && csdk.core.isLightForm() === true) {
            theme = csdk.core.getTheme();
        }
    } catch (e) { /* 非轻表单模式 */ }

    // ---- Widget 实现 ----
    var MyWidgetImpl = function(options) {
        this.customWidgetType = scopeName;
        this._create(options);
    };

    MyWidgetImpl.prototype = {

        _create: function(options) {
            this._widgetProxy = options.adaptation;
            this._widgetId = options.privateId;
            this._formMessage = options.formMessage;

            this._wrapper = document.getElementById(this._widgetId);
            if (!this._wrapper) return;

            this._field = this._widgetProxy.childrenGetData(this._widgetId);
            this._tunnelId = 'Event' + this._widgetId;
            this._update();
        },

        _update: function() {
            this._destroy();
            this._buildRendering();
            this._postCreate();
            try {
                if (typeof csdk !== 'undefined' && csdk.core && csdk.core.relayout) {
                    csdk.core.relayout();
                }
            } catch (e) {}
        },

        // ---- 渲染按钮（保留双模式） ----
        _buildRendering: function() {
            var self = this;

            // 隐藏态
            if (self._field.auth === 'hide') {
                try {
                    if (typeof csdk === 'undefined' || csdk.core.isLightForm() !== false) {
                        self._wrapper.innerHTML = '';
                        return;
                    }
                } catch (e) { self._wrapper.innerHTML = ''; return; }
            }

            var displayText = (self._field && self._field.display) || 'Dj测试按钮';

            try {
                if (typeof csdk !== 'undefined' && csdk.core.isLightForm() === false) {
                    // ===== 非轻表单模式 =====
                    var btnStyle = 'background:linear-gradient(45deg,#03a9f4,#f441a5,#ffeb3b,#03a9f4);'
                        + 'background-size:300% 300%;color:#fff;font-size:14px;font-weight:bold;'
                        + 'padding:6px 16px;border:none;border-radius:4px;cursor:pointer;'
                        + 'min-width:80px;';
                    self._wrapper.innerHTML = '<section style="padding:8px 0;">'
                        + '<button style="' + btnStyle + '" class="dj-mb-btn">'
                        + displayText + '</button></section>';
                    self._btnEl = self._wrapper.querySelector('.dj-mb-btn');
                    return;
                }
            } catch (e) {}

            // ===== 轻表单模式 =====
            var labelStyle = 'display:inline-block;width:90px;margin-right:5px;padding-top:6px;'
                + 'font-size:16px;color:' + theme.fieldTitleDefaultColor + ';word-break:break-all;';
            var btn2Style = 'background:linear-gradient(45deg,#03a9f4,#f441a5);color:#fff;'
                + 'font-size:14px;font-weight:bold;padding:8px 16px;border:none;'
                + 'border-radius:6px;vertical-align:top;margin-top:2px;';
            var line = '<div style="position:absolute;bottom:0;left:20px;right:0;height:1px;'
                + 'border-top:' + theme.fieldLine + ';"></div>';

            self._wrapper.innerHTML = '<section style="position:relative;padding:8px 10px 8px 20px;'
                + 'background:' + theme.fieldBg + ';">'
                + '<span style="' + labelStyle + '">' + displayText + '</span>'
                + '<button style="' + btn2Style + '" class="dj-mb-btn">' + displayText + '</button>'
                + line + '</section>';
            self._btnEl = self._wrapper.querySelector('.dj-mb-btn');
        },

        // ---- 绑定事件 ----
        _postCreate: function() {
            var self = this;
            if (self._btnEl) {
                self._btnEl.addEventListener('click', self._openVue.bind(self), false);
            }
            self._widgetProxy.ObserverEvent.listen(self._tunnelId, self._update.bind(self));
        },

        _destroy: function() {
            this._btnEl = null;
        },

        // ================================================================
        // 核心：打开 Vue 页面
        //   M3 App 环境 → cmp.dialog.custom（原生容器，WebView 兼容）
        //   浏览器开发   → 全屏 iframe（降级方案）
        // ================================================================
        _openVue: function() {
            var self = this;
            if (self._field && self._field.auth === 'hide') return;

            // 构造 Vue 页面 URL（M3 优先用 cmp.seeyonbasepath）
            var ctxPath = (typeof cmp !== 'undefined' && cmp && cmp.seeyonbasepath)
                       || (window.top && window.top._ctxPath)
                       || '/seeyon';
            var url = ctxPath + '/apps_res/cap/customCtrlResources/djTest/vue3-app/dist/index.html';

            // ---- 方式一：CMP 原生 Dialog（M3 App 必须走这条路） ----
            if (typeof cmp !== 'undefined' && cmp && cmp.dialog) {
                try {
                    var content = '<div style="width:100%;height:100%;padding:0;margin:0;">'
                        + '<iframe src="' + url + '" '
                        + 'style="width:100%;height:420px;border:none;" frameborder="0"></iframe>'
                        + '</div>';
                    cmp.dialog.custom({
                        title: 'Vue 3 演示',
                        content: content,
                        buttons: [{
                            text: '关闭',
                            style: 'color:#3AADFB;',
                            onClick: function() { cmp.dialog.close(); }
                        }]
                    });
                    return;
                } catch (e) {
                    // cmp.dialog 失败 → 走降级方案
                }
            }

            // ---- 方式二：全屏 iframe（浏览器开发 / 降级兜底） ----
            var iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;'
                + 'border:none;z-index:99999;';
            document.body.appendChild(iframe);

            var handler = function(e) {
                if (e.data && e.data.type === 'vueDialogClose') {
                    iframe.remove();
                    window.removeEventListener('message', handler);
                }
            };
            window.addEventListener('message', handler);
        }
    };

    // ---- 静态 init / destroy（M3 框架约定） ----
    var myWidgets = {};
    MyWidgetImpl.init = function(options) {
        var widget = new MyWidgetImpl(options);
        myWidgets[widget._widgetId] = widget;
    };
    MyWidgetImpl.destroy = function(widgetId) {
        var widget = myWidgets[widgetId];
        if (widget) widget._destroy();
        delete myWidgets[widgetId];
    };

    window[scopeName] = MyWidgetImpl;
})();
