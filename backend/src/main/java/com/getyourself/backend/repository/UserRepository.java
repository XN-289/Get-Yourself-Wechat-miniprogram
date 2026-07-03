package com.getyourself.backend.repository;

import com.getyourself.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 用户仓库接口
 *
 * @author Get Yourself Team
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据openid查找用户
     *
     * @param openid 微信openid
     * @return 用户
     */
    Optional<User> findByOpenid(String openid);

    /**
     * 根据手机号查找用户
     *
     * @param phone 手机号
     * @return 用户
     */
    Optional<User> findByPhone(String phone);

    /**
     * 检查openid是否存在
     *
     * @param openid 微信openid
     * @return 是否存在
     */
    boolean existsByOpenid(String openid);
}
