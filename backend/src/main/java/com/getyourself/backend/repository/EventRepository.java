package com.getyourself.backend.repository;

import com.getyourself.backend.entity.Event;
import com.getyourself.backend.entity.Event.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 事件仓库接口
 *
 * @author Get Yourself Team
 */
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    /**
     * 根据分类查询已发布的事件
     *
     * @param categoryId 分类ID
     * @param pageable   分页参数
     * @return 事件列表
     */
    Page<Event> findByCategoryIdAndStatus(Long categoryId, EventStatus status, Pageable pageable);

    /**
     * 查询所有已发布的事件
     *
     * @param status   状态
     * @param pageable 分页参数
     * @return 事件列表
     */
    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    /**
     * 搜索事件（标题或描述包含关键词）
     *
     * @param keyword  关键词
     * @param status   状态
     * @param pageable 分页参数
     * @return 事件列表
     */
    @Query("SELECT e FROM Event e WHERE e.status = :status AND (e.title LIKE %:keyword% OR e.description LIKE %:keyword%)")
    Page<Event> searchByKeyword(@Param("keyword") String keyword, @Param("status") EventStatus status, Pageable pageable);

    /**
     * 查询推荐的事件（按创建时间倒序）
     *
     * @param status 状态
     * @param limit  数量限制
     * @return 事件列表
     */
    @Query("SELECT e FROM Event e WHERE e.status = :status ORDER BY e.createdAt DESC")
    List<Event> findTopEvents(@Param("status") EventStatus status, Pageable pageable);
}
