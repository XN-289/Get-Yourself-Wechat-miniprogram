package com.getyourself.backend.repository;

import com.getyourself.backend.entity.EventCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 事件分类仓库接口
 *
 * @author Get Yourself Team
 */
@Repository
public interface EventCategoryRepository extends JpaRepository<EventCategoryEntity, Long> {

    /**
     * 根据code查找分类
     *
     * @param code 分类代码
     * @return 分类
     */
    Optional<EventCategoryEntity> findByCode(String code);

    /**
     * 按排序顺序查询所有分类
     *
     * @return 分类列表
     */
    List<EventCategoryEntity> findAllByOrderBySortOrderAsc();

    /**
     * 检查code是否存在
     *
     * @param code 分类代码
     * @return 是否存在
     */
    boolean existsByCode(String code);
}
