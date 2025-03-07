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

## SSH连接问题排查指南

本文档提供关于排查和解决GitHub Actions中SSH连接问题的指南。

### 当前状态

目前我们在GitHub Actions工作流程中使用SSH部署时遇到了以下错误：

```
ssh: handshake failed: ssh: unable to authenticate, attempted methods [none publickey], no supported methods remain
```

这表明SSH握手失败，无法通过公钥认证。

### 可能的原因

SSH握手失败通常有以下几个常见原因：

1. **密钥格式问题**：GitHub Actions使用的SSH私钥格式可能不正确
2. **服务器配置问题**：服务器可能不接受公钥认证或公钥未正确配置
3. **密钥不匹配**：GitHub中存储的私钥与服务器上的公钥不匹配
4. **权限问题**：服务器上的.ssh目录或文件权限不正确
5. **SSH服务配置**：服务器上的SSH服务可能配置为拒绝某些认证方式

### 解决方案

#### 1. 切换到密码认证（暂时解决方案）

我们已经修改了GitHub Actions工作流，使用密码认证代替密钥认证：

```yaml
- name: Deploy to Production Server
  uses: appleboy/ssh-action@master
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USERNAME }}
    password: ${{ secrets.SERVER_PASSWORD }}
    port: 22
```

需要在GitHub仓库中添加`SERVER_PASSWORD`密钥。

#### 2. 使用SSH密钥准备工具

我们创建了`scripts/prepare_ssh_key.ps1`脚本，帮助准备正确格式的SSH密钥：

```powershell
# 在本地运行
.\scripts\prepare_ssh_key.ps1
```

这个脚本会：
- 读取SSH私钥
- 确保使用正确的格式（没有多余的空行或空格）
- 输出可以直接复制到GitHub Secrets的格式化密钥

#### 3. 检查服务器配置

在服务器上运行我们的`scripts/server-ssh-check.sh`脚本：

```bash
# 在服务器上运行
bash <(curl -s https://raw.githubusercontent.com/Albert-XY/video-player-app/master/scripts/server-ssh-check.sh)
```

这个脚本会检查：
- SSH服务配置是否允许公钥认证
- authorized_keys文件是否存在且权限正确
- 防火墙配置是否允许SSH连接

#### 4. 不使用SSH的替代部署方法

我们提供了几种不依赖SSH的部署替代方案：

##### a. 一键安装脚本

可以直接在服务器上执行的安装脚本：

```bash
# 在服务器上运行
curl -fsSL https://raw.githubusercontent.com/Albert-XY/video-player-app/master/scripts/install.sh | bash
```

##### b. 部署辅助脚本

可以在服务器上定期运行或使用cron任务的部署脚本：

```bash
# 在服务器上运行
curl -fsSL https://raw.githubusercontent.com/Albert-XY/video-player-app/master/scripts/deploy_helper.sh -o deploy_helper.sh
chmod +x deploy_helper.sh
./deploy_helper.sh
```

##### c. Webhook触发部署

可以设置一个简单的API端点，接收GitHub的webhook并触发部署。

## 测试SSH连接

我们创建了专门用于测试SSH连接的GitHub Actions工作流：

1. 在GitHub仓库页面，进入"Actions"标签
2. 从列表中选择"测试SSH连接"工作流
3. 点击"Run workflow"按钮
4. 检查输出日志，查看详细的连接信息和错误消息

## 附录：常用命令

### 生成新的SSH密钥对

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

### 在服务器上添加公钥

```bash
# 将公钥添加到authorized_keys文件
cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 测试SSH连接

```bash
# 测试SSH连接（详细模式）
ssh -v username@hostname
