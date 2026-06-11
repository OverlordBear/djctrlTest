package com.seeyon.apps.djApps.DjTest.service.impl;
import com.seeyon.apps.djApps.DjTest.dao.DjTestDao;
import com.seeyon.apps.djApps.DjTest.service.DjTestService;
import com.seeyon.ctp.util.UUIDLong;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DjTestServiceImpl implements DjTestService {

    @Autowired
    private DjTestDao djTestDao;
    @Override
    public List<Map<String, Object>> testDbConnection() {
        log.info(">>> 开始测试数据库连接，正在查询表 formmain_0038 ...");
        try {
            // 1. 执行查询
            List<Map<String, Object>> result = djTestDao.selectAll();

            // 2. 打印日志确认
            if (result != null) {
                log.info(">>> 数据库连接成功！查询到 {} 条记录。", result.size());
                // 打印第一条数据看看内容（如果有的话）
                if (!result.isEmpty()) {
                    log.info(">>> 第一条数据示例: {}", result.get(0));
                }
            } else {
                log.warn(">>> 数据库连接看似成功，但返回结果为 null。");
            }
            return result;
        } catch (Exception e) {
            log.error(">>> 数据库连接测试失败！请检查配置。", e);
            throw e; // 抛出异常以触发事务回滚（虽然是查询，但保持习惯）
        }
    }
    @Override
    public int getDataCount() {
        log.info(">>> 正在执行 Count 查询...");
        int count = djTestDao.count();
        log.info(">>> Count 查询结果: {}", count);
        return count;
    }
    @Override
    @Transactional
    public void testTransactionRollback() {
        log.info(">>> [gjx666事务测试] 1. 开始执行，准备向 formmain_0022 插入测试数据...");

        // 构造测试数据
        Map<String, Object> map = new HashMap<>();
        long testId = UUIDLong.longUUID();
        map.put("id", testId);
        map.put("field0001", "我是本来应该被回滚掉的数据666"); // 对应你的 field0001 字段

        // A. 执行插入
        djTestDao.insertTest(map);
        log.info(">>> [事务测试] 2. 数据 insertTest 已执行 (ID={})，此时尚未提交事务", testId);

        // B. 强制抛出异常
        log.info(">>> [事务测试] 3. 准备抛出异常，强制触发回滚！");
        if (true) {
            log.info(">>> [事务测试] 4. 抛出异常成功！,这是故意的异常，请不要惊慌");
            throw new RuntimeException("===== gjx666事务回滚测试：这是故意的异常，请不要惊慌 =====");
        }

        // 这一行永远不会执行
        log.info(">>> [事务测试] 失败！如果不幸执行到这里，说明异常没抛出。");
    }
}