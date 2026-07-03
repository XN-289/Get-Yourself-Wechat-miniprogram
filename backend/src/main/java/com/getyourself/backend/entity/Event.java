package com.getyourself.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 事件实体类
 * 对应数据库events表
 *
 * @author Get Yourself Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 事件标题
     */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /**
     * 分类ID
     */
    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    /**
     * 事件描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 地点
     */
    @Column(name = "location", length = 200)
    private String location;

    /**
     * 开始时间
     */
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    @Column(name = "end_time")
    private LocalDateTime endTime;

    /**
     * 最大参与人数
     */
    @Column(name = "max_participants")
    private Integer maxParticipants;

    /**
     * 当前参与人数
     */
    @Column(name = "current_participants")
    @Builder.Default
    private Integer currentParticipants = 0;

    /**
     * 状态：DRAFT, PUBLISHED, CANCELLED, COMPLETED
     */
    @Column(name = "status", length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * 事件状态枚举
     */
    public enum EventStatus {
        DRAFT,      // 草稿
        PUBLISHED,  // 已发布
        CANCELLED,  // 已取消
        COMPLETED   // 已完成
    }
}
