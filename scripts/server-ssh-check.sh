#!/bin/bash
# 服务器SSH配置检查脚本
# 此脚本应在服务器上运行，用于验证SSH配置是否正确

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # 无颜色

echo -e "${GREEN}===== 服务器SSH配置检查工具 =====${NC}"

# 检查sshd配置
echo -e "${YELLOW}检查SSH服务配置...${NC}"
if [ -f /etc/ssh/sshd_config ]; then
    echo "sshd_config 文件存在"
    
    # 检查公钥认证设置
    pubkey_auth=$(grep -E "^PubkeyAuthentication" /etc/ssh/sshd_config | awk '{print $2}')
    if [ "$pubkey_auth" == "yes" ]; then
        echo -e "${GREEN}✓ 公钥认证已启用${NC}"
    else
        echo -e "${RED}✗ 公钥认证可能未启用${NC}"
        echo "建议在 /etc/ssh/sshd_config 中设置:"
        echo "PubkeyAuthentication yes"
    fi
    
    # 检查authorized_keys文件路径设置
    auth_keys_file=$(grep -E "^AuthorizedKeysFile" /etc/ssh/sshd_config | awk '{print $2}')
    if [ -n "$auth_keys_file" ]; then
        echo -e "${GREEN}✓ AuthorizedKeysFile 已设置为: $auth_keys_file${NC}"
    else
        echo -e "${YELLOW}! AuthorizedKeysFile 未明确设置，使用默认值${NC}"
    fi
    
    # 检查密码认证设置
    password_auth=$(grep -E "^PasswordAuthentication" /etc/ssh/sshd_config | awk '{print $2}')
    if [ "$password_auth" == "no" ]; then
        echo -e "${YELLOW}! 密码认证已禁用，仅使用密钥认证${NC}"
    else
        echo -e "${GREEN}✓ 密码认证已启用，可用作备用认证方法${NC}"
    fi
else
    echo -e "${RED}✗ 找不到 sshd_config 文件${NC}"
fi

# 检查当前用户的SSH目录
echo -e "\n${YELLOW}检查用户SSH配置...${NC}"
user_home=$(eval echo ~)
ssh_dir="$user_home/.ssh"

if [ -d "$ssh_dir" ]; then
    echo -e "${GREEN}✓ SSH目录存在: $ssh_dir${NC}"
    
    # 检查目录权限
    ssh_dir_perms=$(stat -c "%a" "$ssh_dir")
    if [ "$ssh_dir_perms" == "700" ]; then
        echo -e "${GREEN}✓ SSH目录权限正确 (700)${NC}"
    else
        echo -e "${RED}✗ SSH目录权限不正确: $ssh_dir_perms，应为 700${NC}"
        echo "运行: chmod 700 $ssh_dir"
    fi
    
    # 检查authorized_keys文件
    auth_keys="$ssh_dir/authorized_keys"
    if [ -f "$auth_keys" ]; then
        echo -e "${GREEN}✓ authorized_keys 文件存在${NC}"
        
        # 检查文件权限
        auth_keys_perms=$(stat -c "%a" "$auth_keys")
        if [ "$auth_keys_perms" == "600" ]; then
            echo -e "${GREEN}✓ authorized_keys 文件权限正确 (600)${NC}"
        else
            echo -e "${RED}✗ authorized_keys 文件权限不正确: $auth_keys_perms，应为 600${NC}"
            echo "运行: chmod 600 $auth_keys"
        fi
        
        # 检查内容
        auth_keys_count=$(grep -c "ssh-rsa\|ssh-ed25519" "$auth_keys")
        if [ $auth_keys_count -gt 0 ]; then
            echo -e "${GREEN}✓ authorized_keys 包含 $auth_keys_count 个公钥${NC}"
        else
            echo -e "${RED}✗ authorized_keys 不包含任何公钥${NC}"
        fi
    else
        echo -e "${RED}✗ authorized_keys 文件不存在${NC}"
        echo "需要创建 $auth_keys 文件并添加公钥"
    fi
else
    echo -e "${RED}✗ SSH目录不存在${NC}"
    echo "需要创建 $ssh_dir 目录"
fi

# 检查SSH服务状态
echo -e "\n${YELLOW}检查SSH服务状态...${NC}"
if command -v systemctl >/dev/null 2>&1; then
    ssh_status=$(systemctl is-active sshd)
    if [ "$ssh_status" == "active" ]; then
        echo -e "${GREEN}✓ SSH服务正在运行${NC}"
    else
        echo -e "${RED}✗ SSH服务未运行${NC}"
    fi
elif command -v service >/dev/null 2>&1; then
    ssh_status=$(service sshd status | grep -c "running")
    if [ $ssh_status -gt 0 ]; then
        echo -e "${GREEN}✓ SSH服务正在运行${NC}"
    else
        echo -e "${RED}✗ SSH服务未运行${NC}"
    fi
else
    echo -e "${YELLOW}! 无法检查SSH服务状态，不支持的系统${NC}"
fi

# 检查防火墙
echo -e "\n${YELLOW}检查防火墙配置...${NC}"
if command -v ufw >/dev/null 2>&1; then
    ufw_status=$(ufw status | grep -c "22")
    if [ $ufw_status -gt 0 ]; then
        echo -e "${GREEN}✓ UFW防火墙：SSH端口(22)已开放${NC}"
    else
        echo -e "${YELLOW}! UFW防火墙：未找到SSH端口规则，可能被阻止${NC}"
    fi
elif command -v firewall-cmd >/dev/null 2>&1; then
    fw_status=$(firewall-cmd --list-all | grep -c "22")
    if [ $fw_status -gt 0 ]; then
        echo -e "${GREEN}✓ Firewalld防火墙：SSH端口(22)已开放${NC}"
    else
        echo -e "${YELLOW}! Firewalld防火墙：未找到SSH端口规则，可能被阻止${NC}"
    fi
else
    echo -e "${YELLOW}! 无法检查防火墙规则，不支持的系统或未安装防火墙${NC}"
fi

# 提供最终建议
echo -e "\n${GREEN}===== 检查完成 =====${NC}"
echo -e "${YELLOW}如果遇到SSH连接问题，请确保:${NC}"
echo "1. SSH服务正在运行且配置正确"
echo "2. authorized_keys 文件包含正确的公钥"
echo "3. SSH目录和文件权限正确"
echo "4. 防火墙允许SSH连接"
echo "5. 公钥对应的私钥格式正确（不包含多余空格或换行）"

echo -e "\n${YELLOW}要添加新的公钥，请运行:${NC}"
echo "cat > ~/.ssh/temp_key.pub << EOF"
echo "[粘贴公钥内容]"
echo "EOF"
echo "cat ~/.ssh/temp_key.pub >> ~/.ssh/authorized_keys"
echo "chmod 600 ~/.ssh/authorized_keys"
