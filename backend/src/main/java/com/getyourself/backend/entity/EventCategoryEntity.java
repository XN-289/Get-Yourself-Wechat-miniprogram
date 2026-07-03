package com.getyourself.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 事件分类实体类
 * 对应数据库event_categories表
 *
 * @author Get Yourself Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "event_categories")
public class EventCategoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 分类名称（中文）
     */
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    /**
     * 分类代码（英文）
     */
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    /**
     * 分类描述
     */
    @Column(name = "description", length = 200)
    private String description;

    /**
     * 排序顺序
     */
    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

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
}
