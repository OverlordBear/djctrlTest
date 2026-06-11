package com.seeyon.apps.djApps.DjTest.dao;
import com.gjx.hide.ibatis.annotations.Mapper;
import java.util.List;
import java.util.Map;

@Mapper
public interface DjTestDao {

    /**
     * 查询 formmain_0038 表的所有数据
     * @return 数据列表
     */
    List<Map<String, Object>> selectAll();

    /**
     * 统计表数据总量（作为额外的连通性测试）
     * @return 总数
     */
    int count();
    void insertTest(Map<String, Object> map);
}