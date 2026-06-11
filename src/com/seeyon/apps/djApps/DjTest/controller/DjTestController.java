package com.seeyon.apps.djApps.DjTest.controller;

import com.seeyon.ctp.common.controller.BaseController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.http.MediaType;

import java.io.FileOutputStream;
import java.util.HashMap;
import java.util.Map;
import DBstep.iMsgServer2000;

@Slf4j
@Controller
public class DjTestController extends BaseController {

    /**
     * Vue 升级版接口：供 Vue Dialog 页面调用
     * 返回欢迎信息和后端状态
     */
    @GetMapping(path = "/djs/vueHello.do", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> vueHello() {
        Map<String, Object> response = new HashMap<>();
        log.info("====== Vue Dialog 页面调用了后端接口 ======");

        response.put("success", true);
        response.put("message", "你好，vue升级成功！这是来自后端 Spring Controller 的响应。");
        response.put("serverTime", new java.util.Date().toString());
        response.put("framework", "Vue 2.6 + Element UI + Axios");
        response.put("backend", "Spring MVC + MyBatis (gjx)");

        return response;
    }

    @GetMapping(path = "/djs/extractGridFile.do", produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public Map<String, Object> extractGridFile() {
        Map<String, Object> response = new HashMap<>();
        log.info("====== 准备使用 ToDocument 剥离金格 DIRG 封装 ======");

        // 1. 替换为你在 Cache 或 base/upload 里那个 DIRG 文件的绝对路径
        String sourceFilePath = "C:/Users/GJX/Desktop/-2042930220394397510";
        // 2. 提取后的真实 Word 文件保存路径
        String targetFilePath = "C:/temp/extracted_true_body.docx";

        try {
            iMsgServer2000 msgObj = new iMsgServer2000();
            // 第一步：把包含 DIRG 头的物理文件加载到 msgObj 的内存中
            boolean isLoaded = msgObj.MsgFileLoad(sourceFilePath);

            if (isLoaded) {
                // 第二步：获取带壳的原始字节流
                byte[] rawBytes = msgObj.MsgFileBody();
                // 第三步：调用核心解包方法，剥离 DIRG，拿到纯净 Word 字节流
                byte[] realWordBytes = msgObj.ToDocument(rawBytes);

                if (realWordBytes != null && realWordBytes.length > 0) {
                    // 第四步：将纯净字节流写入本地磁盘
                    FileOutputStream fos = new FileOutputStream(targetFilePath);
                    fos.write(realWordBytes);
                    fos.flush();
                    fos.close();
                    response.put("success", true);
                    response.put("message", "解析成功，纯净版 Word 已保存至：" + targetFilePath);
                    log.info("完美提取！保存至: {}", targetFilePath);
                } else {
                    response.put("success", false);
                    response.put("message", "ToDocument 提取失败，返回了空流。");
                }
            } else {
                response.put("success", false);
                response.put("message", "MsgFileLoad 加载物理文件失败。");
            }
        } catch (Exception e) {
            log.error("金格文件解析异常", e);
            response.put("success", false);
            response.put("message", "代码执行异常: " + e.getMessage());
        }

        return response;
    }
}