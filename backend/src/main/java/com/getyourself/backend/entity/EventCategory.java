package com.getyourself.backend.entity;

/**
 * 事件分类枚举
 * 适配国内大学生实践场景
 *
 * @author Get Yourself Team
 */
public enum EventCategory {

    /**
     * 志愿公益
     * 志愿服务、公益活动、社区服务
     */
    PUBLIC_WELFARE("志愿公益", "志愿服务、公益活动"),

    /**
     * 企业实习
     * 企业实习、校招宣讲、职业体验
     */
    COMPANY("企业实习", "企业实习、校招、职业体验"),

    /**
     * 科研竞赛
     * 科研项目、学科竞赛、创新创业大赛
     */
    RESEARCH("科研竞赛", "科研项目、学科竞赛"),

    /**
     * 线上实践
     * 线上兼职、远程项目、自由职业
     */
    ONLINE("线上实践", "线上兼职、远程项目"),

    /**
     * 文体活动
     * 文化演出、体育赛事、艺术展览
     */
    CULTURE("文体活动", "文化、体育、艺术活动"),

    /**
     * 校内活动
     * 社团活动、学生会、校内讲座
     */
    CAMPUS("校内活动", "社团、学生会、校内讲座"),

    /**
     * 技能提升
     * 培训课程、考证备考、自学项目
     */
    SKILL("技能提升", "培训、考证、自学项目");

    private final String displayName;
    private final String description;

    EventCategory(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    /**
     * 获取显示名称
     *
     * @return 中文显示名称
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * 获取分类描述
     *
     * @return 分类描述
     */
    public String getDescription() {
        return description;
    }

    /**
     * 根据显示名称查找枚举
     *
     * @param displayName 中文显示名称
     * @return 对应的枚举值，未找到返回null
     */
    public static EventCategory fromDisplayName(String displayName) {
        for (EventCategory category : values()) {
            if (category.getDisplayName().equals(displayName)) {
                return category;
            }
        }
        return null;
    }

    /**
     * 根据code查找枚举
     *
     * @param code 枚举名称（如PUBLIC_WELFARE）
     * @return 对应的枚举值，未找到返回null
     */
    public static EventCategory fromCode(String code) {
        try {
            return valueOf(code);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
