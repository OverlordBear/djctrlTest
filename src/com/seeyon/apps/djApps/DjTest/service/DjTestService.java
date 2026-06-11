package com.seeyon.apps.djApps.DjTest.service;


import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

public interface DjTestService {
    /**
     * 测试数据库连通性：获取所有表单数据
     */
    List<Map<String, Object>> testDbConnection();

    /**
     * 额外测试：获取数据总数
     */
    int getDataCount();

    void testTransactionRollback();
}