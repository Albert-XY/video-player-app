# SSH 连接故障排除指南

## 常见 SSH 连接错误

### 错误："ssh: handshake failed: ssh: unable to authenticate, attempted methods [none publickey], no supported methods remain"

这个错误表明 SSH 无法使用任何可用的认证方法进行身份验证。

**可能的原因和解决方法：**

1. **SSH 密钥未正确设置**
   - 确保已生成 SSH 密钥：`ssh-keygen -t rsa -b 4096`
   - 确保公钥已添加到服务器的 `~/.ssh/authorized_keys` 文件中

2. **服务器未允许公钥认证**
   - 检查远程服务器上的 `/etc/ssh/sshd_config` 配置
   - 确保 `PubkeyAuthentication yes` 设置已启用
   - 确保 `AllowUsers` 或 `AllowGroups` 没有限制访问

3. **密钥权限问题**
   - SSH 对文件权限非常敏感
   - 本地私钥的权限应设置为 600 (`chmod 600 ~/.ssh/id_rsa`)
   - 远程服务器上的 `~/.ssh` 目录权限应为 700
   - 远程服务器上的 `~/.ssh/authorized_keys` 文件权限应为 600

4. **密钥格式不匹配**
   - 确保使用兼容的密钥格式
   - 尝试不同类型的密钥（如 Ed25519：`ssh-keygen -t ed25519`）

## Drone SSH 配置问题

对于 Drone SSH 插件，还需要检查以下内容：

1. **确保 Drone Secrets 正确设置**
   - `ssh_host`：服务器主机名或 IP 地址
   - `ssh_username`：SSH 用户名
   - `ssh_key`：私钥内容（不是文件路径）
   - `ssh_password`：如果使用密码认证（不推荐）

2. **私钥格式正确**
   - Drone SSH 插件需要私钥的完整内容，包括开头和结尾的行
   - 确保私钥没有被格式化或更改

## 测试 SSH 连接

使用以下命令测试连接，并查看详细日志：

```bash
ssh -v username@hostname
```

增加详细程度可以获取更多信息：

```bash
ssh -vvv username@hostname
```

## 服务器端日志

检查服务器上的 SSH 日志以获取更多信息：

```bash
sudo tail -f /var/log/auth.log    # Debian/Ubuntu
sudo tail -f /var/log/secure      # CentOS/RHEL
```

## 临时使用密码认证

如果无法使用密钥认证，可以临时启用密码认证：

1. 在服务器上编辑 `/etc/ssh/sshd_config`：
   ```
   PasswordAuthentication yes
   ```

2. 重启 SSH 服务：
   ```bash
   sudo systemctl restart sshd
   ```

3. 使用密码认证：
   ```bash
   ssh username@hostname
   ```

**注意：** 处理完问题后，建议重新禁用密码认证以提高安全性。
