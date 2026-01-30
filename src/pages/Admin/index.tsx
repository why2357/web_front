// 管理后台页面
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminTransactions, AdminTransactionItem, getAdminUsers, AdminUserItem, updateUserStatus, rechargeCredits, getInviteCodes, generateInviteCode, InviteCodeItem } from '../../api/admin';
import { getCurrentUser, UserInfo } from '../../api/user';
import { logout } from '../../api/auth';
import { Modal, Button } from '../../components/ui';
import './index.css';

type MenuKey = 'users' | 'transactions' | 'inviteCodes';

function Admin() {
  const navigate = useNavigate();
  
  // 当前菜单
  const [activeMenu, setActiveMenu] = useState<MenuKey>('transactions');
  
  // 用户信息
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // 流水记录数据
  const [transactions, setTransactions] = useState<AdminTransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  // 筛选条件（流水）
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState('');
  const [filterType, setFilterType] = useState('');
  
  // 用户管理数据
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(0);
  const [userKeyword, setUserKeyword] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');
  
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 用户操作：修改状态中、状态确认弹窗、充值弹窗
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [statusConfirmUser, setStatusConfirmUser] = useState<AdminUserItem | null>(null);
  const [statusConfirmNextStatus, setStatusConfirmNextStatus] = useState<'active' | 'frozen' | null>(null);
  const [statusConfirmSubmitting, setStatusConfirmSubmitting] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [rechargeUser, setRechargeUser] = useState<AdminUserItem | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeValidityDays, setRechargeValidityDays] = useState('365');
  const [rechargeDesc, setRechargeDesc] = useState('管理员充值');
  const [rechargeSubmitting, setRechargeSubmitting] = useState(false);

  // 邀请码管理
  const [inviteCodes, setInviteCodes] = useState<InviteCodeItem[]>([]);
  const [inviteCodesLoading, setInviteCodesLoading] = useState(false);
  const [inviteCodesPage, setInviteCodesPage] = useState(1);
  const [inviteCodesHasMore, setInviteCodesHasMore] = useState(false);
  const [generateCodeLoading, setGenerateCodeLoading] = useState(false);
  const [inviteCodeMessage, setInviteCodeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const inviteCodesPageSize = 10;

  useEffect(() => {
    loadUserInfo();
  }, []);

  useEffect(() => {
    if (activeMenu === 'transactions') loadTransactions();
  }, [activeMenu, page, pageSize]);

  useEffect(() => {
    if (activeMenu === 'users') loadUsers();
  }, [activeMenu, userPage, userKeyword, userStatusFilter]);

  useEffect(() => {
    if (activeMenu === 'inviteCodes') loadInviteCodes();
  }, [activeMenu, inviteCodesPage]);

  const loadUserInfo = async () => {
    try {
      const data = await getCurrentUser();
      setUserInfo(data);
      
      // 检查是否是管理员
      if (data.role !== 'admin') {
        alert('权限不足，请使用管理员账号登录');
        navigate('/user');
      }
    } catch (error) {
      console.error('获取用户信息失败', error);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      // 后端要求 start_date/end_date 格式为 YYYY/MM/DD；前端 date 输入为 YYYY-MM-DD
      const start_date = startDate ? startDate.replace(/-/g, '/') : undefined;
      const end_date = endDate ? endDate.replace(/-/g, '/') : undefined;
      // 交易类型与后端一致：synthesis, admin_recharge, refund, invite_code
      const data = await getAdminTransactions({
        page,
        size: pageSize,
        keyword: userId.trim() || undefined,
        transaction_type: filterType || undefined,
        start_date,
        end_date,
      });
      if (data && data.items) {
        setTransactions(data.items);
        setTotal(data.total);
        setTotalPages(data.total_pages);
      } else {
        setTransactions([]);
        setTotal(0);
        setTotalPages(0);
      }
    } catch (error: any) {
      alert(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadTransactions();
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers({
        page: userPage,
        size: pageSize,
        keyword: userKeyword.trim() || undefined,
        status_filter: userStatusFilter || undefined,
      });
      if (data && data.items) {
        setUsers(data.items);
        setUserTotal(data.total);
        setUserTotalPages(data.total_pages);
      } else {
        setUsers([]);
        setUserTotal(0);
        setUserTotalPages(0);
      }
    } catch (error: any) {
      alert(error.message || '加载用户失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = () => {
    setUserPage(1);
    loadUsers();
  };

  const loadInviteCodes = async (pageOverride?: number) => {
    const p = pageOverride ?? inviteCodesPage;
    try {
      setInviteCodesLoading(true);
      const skip = (p - 1) * inviteCodesPageSize;
      const list = await getInviteCodes({ limit: inviteCodesPageSize, skip });
      setInviteCodes(list || []);
      setInviteCodesHasMore((list?.length ?? 0) >= inviteCodesPageSize);
      if (pageOverride != null) setInviteCodesPage(pageOverride);
    } catch (err: any) {
      alert(err?.message || '加载邀请码记录失败');
      setInviteCodes([]);
    } finally {
      setInviteCodesLoading(false);
    }
  };

  const handleGenerateInviteCode = async () => {
    try {
      setGenerateCodeLoading(true);
      await generateInviteCode();
      await loadInviteCodes(1);
      setInviteCodeMessage({ type: 'success', text: '邀请码已生成，已刷新列表' });
    } catch (err: any) {
      setInviteCodeMessage({ type: 'error', text: err?.message || '生成失败' });
    } finally {
      setGenerateCodeLoading(false);
    }
  };

  /** 打开冻结/解冻确认弹窗 */
  const openStatusConfirmModal = (u: AdminUserItem) => {
    const nextStatus = u.status === 'active' ? 'frozen' : 'active';
    setStatusConfirmUser(u);
    setStatusConfirmNextStatus(nextStatus);
    setStatusConfirmOpen(true);
  };

  const closeStatusConfirmModal = () => {
    setStatusConfirmOpen(false);
    setStatusConfirmUser(null);
    setStatusConfirmNextStatus(null);
  };

  /** 确认冻结/解冻 */
  const handleConfirmStatusChange = async () => {
    if (!statusConfirmUser || !statusConfirmNextStatus) return;
    try {
      setStatusConfirmSubmitting(true);
      setStatusUpdatingId(statusConfirmUser.id);
      await updateUserStatus(statusConfirmUser.id, statusConfirmNextStatus);
      closeStatusConfirmModal();
      await loadUsers();
    } catch (err: any) {
      alert(err?.message || '操作失败');
    } finally {
      setStatusUpdatingId(null);
      setStatusConfirmSubmitting(false);
    }
  };

  /** 打开充值弹窗 */
  const openRechargeModal = (u: AdminUserItem) => {
    setRechargeUser(u);
    setRechargeAmount('');
    setRechargeValidityDays('365');
    setRechargeDesc('管理员充值');
    setRechargeModalOpen(true);
  };

  const closeRechargeModal = () => {
    setRechargeModalOpen(false);
    setRechargeUser(null);
  };

  /** 提交充值（优先使用 uuid，无则用 id） */
  const handleRechargeSubmit = async () => {
    if (!rechargeUser) return;
    const amount = Number(rechargeAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      alert('请输入正整数积分');
      return;
    }
    try {
      setRechargeSubmitting(true);
      await rechargeCredits({
        ...(rechargeUser.uuid ? { user_uuid: rechargeUser.uuid } : { user_id: rechargeUser.id }),
        amount,
        validity_days: rechargeValidityDays ? Number(rechargeValidityDays) : undefined,
        description: rechargeDesc || undefined,
      });
      closeRechargeModal();
      await loadUsers();
      alert('充值成功');
    } catch (err: any) {
      alert(err?.message || '充值失败');
    } finally {
      setRechargeSubmitting(false);
    }
  };



  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('access_token');
      localStorage.removeItem('access_token_expires_at');
      navigate('/login');
    } catch (error) {
      console.error('退出失败', error);
    }
  };

  const renderTransactions = () => {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>全站流水明细</h2>

        </div>

        {/* 筛选区域 */}
        <div className="filter-section">
          <div className="filter-group">
            <input
              type="date"
              className="filter-input date-input"
              placeholder="年/月/日"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="filter-separator">至</span>
            <input
              type="date"
              className="filter-input date-input"
              placeholder="年/月/日"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <input
            type="text"
            className="filter-input"
            placeholder="UID 或手机号"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            title="支持按用户 UID 或手机号查询"
          />
          
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">所有类型</option>
            <option value="synthesis">语音生成</option>
            <option value="admin_recharge">后台充值</option>
            <option value="refund">退款</option>
            <option value="invite_code">邀请注册</option>
          </select>
          
          <button className="search-btn" onClick={handleSearch}>
            查询
          </button>
        </div>

        {/* 数据表格 */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>交易时间</th>
                <th>UID</th>
                <th>手机号</th>
                <th>交易原因</th>
                <th>积分变动</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center">加载中...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">暂无数据</td>
                </tr>
              ) : (
                transactions.map((item, index) => (
                  <tr key={`${item.created_at}-${item.user_id}-${index}`}>
                    <td>{item.created_at}</td>
                    <td>{item.uid}</td>
                    <td>{item.phone ?? item.username ?? '-'}</td>
                    <td>{item.description}</td>
                    <td className={item.credits_change.startsWith('+') ? 'positive' : 'negative'}>
                      {item.credits_change}
                    </td>
                    <td>
                      <span className="status-badge completed">{item.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="pagination">
          <div className="pagination-info">
            共 {total} 条，每页 {pageSize} 条
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`page-btn ${page === pageNum ? 'active' : ''}`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {totalPages > 5 && <span>...</span>}
            
            {totalPages > 5 && (
              <button
                className={`page-btn ${page === totalPages ? 'active' : ''}`}
                onClick={() => setPage(totalPages)}
              >
                {totalPages}
              </button>
            )}
            
            <button
              className="page-btn"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </button>
            
            <span className="page-jump">
              前往 
              <input
                type="number"
                min="1"
                max={totalPages}
                className="page-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const value = parseInt((e.target as HTMLInputElement).value);
                    if (value >= 1 && value <= totalPages) {
                      setPage(value);
                    }
                  }
                }}
              />
              页
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>用户列表</h2>
        </div>

        {/* 筛选 */}
        <div className="filter-section">
          <input
            type="text"
            className="filter-input"
            placeholder="UID 或手机号"
            value={userKeyword}
            onChange={(e) => setUserKeyword(e.target.value)}
          />
          <select
            className="filter-select"
            value={userStatusFilter}
            onChange={(e) => setUserStatusFilter(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="active">正常</option>
            <option value="frozen">已冻结</option>
          </select>
          <button className="search-btn" onClick={handleUserSearch}>
            查询
          </button>
        </div>

        {/* 表格 */}
        <div className="table-container">
          <table className="data-table data-table--users">
            <thead>
              <tr>
                <th>UID</th>
                <th>手机号</th>
                <th>用户名</th>
                <th>状态</th>
                <th>积分</th>
                <th>积分到期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center">加载中...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">暂无用户</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.uid}</td>
                    <td>{u.phone}</td>
                    <td>{u.username || '-'}</td>
                    <td>
                      <span className={`status-badge ${u.status === 'active' ? 'completed' : 'failed'}`}>
                        {u.status === 'active' ? '正常' : '已冻结'}
                      </span>
                    </td>
                    <td>{u.credits}</td>
                    <td>{u.credits_expire_at || '-'}</td>
                    <td className="admin-user-actions">
                      <Button
                        variant="ghost"
                        className="action-btn action-btn--status"
                        disabled={statusUpdatingId === u.id}
                        onClick={() => openStatusConfirmModal(u)}
                      >
                        {statusUpdatingId === u.id ? '处理中...' : u.status === 'active' ? '冻结' : '解冻'}
                      </Button>
                      <Button
                        variant="primary"
                        className="action-btn action-btn--recharge"
                        onClick={() => openRechargeModal(u)}
                      >
                        充值
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="pagination">
          <div className="pagination-info">
            共 {userTotal} 条，每页 {pageSize} 条
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={userPage === 1}
              onClick={() => setUserPage(userPage - 1)}
            >
              上一页
            </button>
            {Array.from({ length: Math.min(userTotalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`page-btn ${userPage === pageNum ? 'active' : ''}`}
                  onClick={() => setUserPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            {userTotalPages > 5 && <span>...</span>}
            {userTotalPages > 5 && (
              <button
                className={`page-btn ${userPage === userTotalPages ? 'active' : ''}`}
                onClick={() => setUserPage(userTotalPages)}
              >
                {userTotalPages}
              </button>
            )}
            <button
              className="page-btn"
              disabled={userPage === userTotalPages}
              onClick={() => setUserPage(userPage + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInviteCodes = () => {
    return (
      <div className="content-section">
        <div className="section-header">
          <h2>邀请码管理</h2>
        </div>
        <div className="filter-section invite-code-toolbar">
          <button
            type="button"
            className="search-btn"
            onClick={handleGenerateInviteCode}
            disabled={generateCodeLoading}
          >
            {generateCodeLoading ? '生成中...' : '生成邀请码'}
          </button>
        </div>
        <div className="table-container">
          <table className="data-table data-table--invite-codes">
            <thead>
              <tr>
                <th>邀请码</th>
                <th>状态</th>
                <th>积分</th>
                <th>创建时间</th>
                <th>使用时间</th>
                <th>使用者</th>
              </tr>
            </thead>
            <tbody>
              {inviteCodesLoading ? (
                <tr>
                  <td colSpan={6} className="text-center">加载中...</td>
                </tr>
              ) : inviteCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">暂无邀请码记录</td>
                </tr>
              ) : (
                inviteCodes.map((item) => (
                  <tr key={item.code}>
                    <td className="invite-code-cell">{item.code}</td>
                    <td>
                      <span className={`status-badge ${item.status === 'used' ? 'completed' : 'pending'}`}>
                        {item.status === 'used' ? '已使用' : '未使用'}
                      </span>
                    </td>
                    <td>{item.credits_amount}</td>
                    <td>{item.created_at}</td>
                    <td>{item.used_at ?? '-'}</td>
                    <td>{item.used_by_id != null ? `ID ${item.used_by_id}` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页（与流水/用户管理一致，无 total 时用“本页 N 条”） */}
        <div className="pagination">
          <div className="pagination-info">
            第 {inviteCodesPage} 页，本页 {inviteCodes.length} 条，每页 {inviteCodesPageSize} 条
            {inviteCodesHasMore && '，可翻页查看更多'}
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={inviteCodesPage <= 1}
              onClick={() => setInviteCodesPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </button>
            {Array.from(
              {
                length: Math.min(
                  inviteCodesHasMore ? inviteCodesPage + 1 : inviteCodesPage,
                  5
                ),
              },
              (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    className={`page-btn ${inviteCodesPage === pageNum ? 'active' : ''}`}
                    onClick={() => setInviteCodesPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              }
            )}
            <button
              className="page-btn"
              disabled={!inviteCodesHasMore}
              onClick={() => setInviteCodesPage((p) => p + 1)}
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-container">
      {/* 左侧菜单 */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="logo-text">Crea Vedio Admin</span>
        </div>
        
        <nav className="admin-menu">
          <div
            className={`menu-item ${activeMenu === 'users' ? 'active' : ''}`}
            onClick={() => setActiveMenu('users')}
          >
            <span className="menu-icon">👥</span>
            <span className="menu-text">用户管理</span>
          </div>
          
          <div
            className={`menu-item ${activeMenu === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveMenu('transactions')}
          >
            <span className="menu-icon">💰</span>
            <span className="menu-text">流水记录</span>
          </div>
          
          <div
            className={`menu-item ${activeMenu === 'inviteCodes' ? 'active' : ''}`}
            onClick={() => setActiveMenu('inviteCodes')}
          >
            <span className="menu-icon">🔑</span>
            <span className="menu-text">邀请码管理</span>
          </div>
        </nav>
      </aside>

      {/* 右侧内容区 */}
      <div className="admin-main">
        {/* 顶部导航栏 */}
        <header className="admin-header">
          <h1 className="page-title">
            {activeMenu === 'users' && '用户管理'}
            {activeMenu === 'transactions' && '流水记录'}
            {activeMenu === 'inviteCodes' && '邀请码管理'}
          </h1>
          
          <div className="header-right">
            <span className="admin-badge">管理员</span>
            <span className="username">{userInfo?.nickname || userInfo?.phone}</span>
            <button className="logout-btn" onClick={handleLogout}>
              退出
            </button>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="admin-content">
          {activeMenu === 'transactions' && renderTransactions()}
          {activeMenu === 'users' && renderUsers()}
          {activeMenu === 'inviteCodes' && renderInviteCodes()}
        </main>
      </div>

      {/* 冻结/解冻确认弹窗 */}
      <Modal
        open={statusConfirmOpen}
        onClose={closeStatusConfirmModal}
        title={statusConfirmNextStatus === 'frozen' ? '冻结用户' : '解冻用户'}
        width={400}
        footer={
          <>
            <Button variant="cancel" onClick={closeStatusConfirmModal}>取消</Button>
            <Button
              variant={statusConfirmNextStatus === 'frozen' ? 'danger' : 'primary'}
              onClick={handleConfirmStatusChange}
              loading={statusConfirmSubmitting}
              disabled={statusConfirmSubmitting}
            >
              {statusConfirmSubmitting ? '处理中...' : '确定'}
            </Button>
          </>
        }
      >
        {statusConfirmUser && (
          <p className="admin-modal-desc">
            确定{statusConfirmNextStatus === 'frozen' ? '冻结' : '解冻'}用户 <strong>{statusConfirmUser.phone}</strong>
            {statusConfirmUser.username ? `（${statusConfirmUser.username}）` : ''} 吗？
          </p>
        )}
      </Modal>

      {/* 充值弹窗 */}
      <Modal
        open={rechargeModalOpen}
        onClose={closeRechargeModal}
        title="为用户充值"
        width={420}
        footer={
          <>
            <Button variant="cancel" onClick={closeRechargeModal}>取消</Button>
            <Button variant="primary" onClick={handleRechargeSubmit} loading={rechargeSubmitting} disabled={rechargeSubmitting}>
              {rechargeSubmitting ? '提交中...' : '确定充值'}
            </Button>
          </>
        }
      >
        {rechargeUser && (
          <div className="admin-recharge-modal">
            <div className="admin-recharge-user">
              <div className="admin-recharge-user__label">当前用户</div>
              <div className="admin-recharge-user__uuid" title={rechargeUser.uuid || String(rechargeUser.id)}>
                {rechargeUser.uuid ? (
                  <>UUID：<code>{rechargeUser.uuid}</code></>
                ) : (
                  <>UID：<code>{rechargeUser.uid}</code></>
                )}
              </div>
              <div className="admin-recharge-user__meta">
                <span>{rechargeUser.phone}</span>
                {rechargeUser.username && <span>· {rechargeUser.username}</span>}
              </div>
            </div>
            <div className="admin-recharge-form">
              <div className="admin-recharge-row">
                <label>积分数量 <span className="required">*</span></label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="modal-input"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="请输入正整数"
                  autoFocus
                />
              </div>
              <div className="admin-recharge-row">
                <label>有效天数</label>
                <input
                  type="number"
                  min="1"
                  className="modal-input"
                  value={rechargeValidityDays}
                  onChange={(e) => setRechargeValidityDays(e.target.value)}
                  placeholder="默认 365"
                />
              </div>
              <div className="admin-recharge-row">
                <label>备注</label>
                <input
                  type="text"
                  className="modal-input"
                  value={rechargeDesc}
                  onChange={(e) => setRechargeDesc(e.target.value)}
                  placeholder="如：管理员充值"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 邀请码操作结果提示 */}
      <Modal
        open={!!inviteCodeMessage}
        onClose={() => setInviteCodeMessage(null)}
        title={inviteCodeMessage?.type === 'success' ? '邀请码已生成' : '提示'}
        width={360}
        footer={
          <Button variant="primary" onClick={() => setInviteCodeMessage(null)}>
            确定
          </Button>
        }
      >
        {inviteCodeMessage && (
          <div className={`admin-message-modal admin-message-modal--${inviteCodeMessage.type}`}>
            <span className="admin-message-modal__icon" aria-hidden>
              {inviteCodeMessage.type === 'success' ? '✓' : '!'}
            </span>
            <p className="admin-message-modal__text">{inviteCodeMessage.text}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Admin;
