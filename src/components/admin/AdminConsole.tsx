"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CircleDollarSign,
  Copy,
  Gift,
  ReceiptText,
  Search,
  UsersRound,
} from "lucide-react";
import type {
  AllocationRecord,
  RewardRecord,
  TransactionRecord,
  UserRecord,
  WithdrawalRequestRecord,
} from "@/lib/supabase";

type AdminTab = "overview" | "customers" | "transactions" | "rewards" | "withdrawals";

type OverviewStats = {
  totalCustomers: number;
  totalRechargeVolume: number;
  totalAllocations: number;
  totalRewards: number;
  pendingRewards: number;
  paidRewards: number;
  pendingWithdrawals: number;
};

type CustomerSummary = UserRecord & {
  total_recharge: number;
  total_allocation: number;
  total_rewards: number;
};

type TransactionRow = TransactionRecord & {
  wallet_address: string;
  ip_address: string;
  ip_country: string;
  explorer_link: string;
};

type WithdrawalRow = WithdrawalRequestRecord;

type CustomerDetail = {
  customer: UserRecord;
  transactions: TransactionRecord[];
  allocations: AllocationRecord[];
  rewards: RewardRecord[];
};

type AdminDebugState = {
  adminKeyConfigured: boolean;
  receivedKey: boolean;
  keyMatched: boolean;
};

type CustomerAdminStatus = "normal" | "vip" | "risk" | "frozen";

const sidebarItems: Array<{ id: AdminTab; label: string }> = [
  { id: "overview", label: "总览" },
  { id: "customers", label: "客户列表" },
  { id: "transactions", label: "充值记录" },
  { id: "rewards", label: "奖励管理" },
  { id: "withdrawals", label: "提现管理" },
];

const emptyStats: OverviewStats = {
  totalCustomers: 0,
  totalRechargeVolume: 0,
  totalAllocations: 0,
  totalRewards: 0,
  pendingRewards: 0,
  paidRewards: 0,
  pendingWithdrawals: 0,
};

export function AdminConsole() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [deviceKey, setDeviceKey] = useState("");
  const [pendingKey, setPendingKey] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [adminKeyConfigured, setAdminKeyConfigured] = useState<boolean | null>(null);
  const [overview, setOverview] = useState<OverviewStats>(emptyStats);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    void loadAdminDebugState();

    const urlKey = new URLSearchParams(window.location.search).get("key");
    const savedKey = window.localStorage.getItem("cybercharge_admin_device_key");
    const nextKey = urlKey ?? savedKey ?? "";

    if (!nextKey) {
      setAuthChecked(true);
      return;
    }

    void verifyKey(nextKey);
  }, []);

  async function loadAdminDebugState() {
    try {
      const response = await fetch("/api/admin/debug", { cache: "no-store" });
      const data = (await response.json()) as AdminDebugState;
      setAdminKeyConfigured(data.adminKeyConfigured);
    } catch {
      setAdminKeyConfigured(false);
    }
  }

  useEffect(() => {
    if (!isAuthorized || !deviceKey) return;
    void loadAdminData(deviceKey);
  }, [deviceKey, isAuthorized]);

  useEffect(() => {
    if (!selectedCustomerId || !deviceKey) {
      setCustomerDetail(null);
      return;
    }

    void adminFetch<{ customer: UserRecord; transactions: TransactionRecord[]; allocations: AllocationRecord[]; rewards: RewardRecord[] }>(
      `/api/admin/customers/${selectedCustomerId}`,
      deviceKey,
    ).then(setCustomerDetail);
  }, [deviceKey, selectedCustomerId]);

  async function verifyKey(key: string) {
    setAuthError("");
    const response = await fetch(`/api/admin/verify?key=${encodeURIComponent(key)}`, {
      cache: "no-store",
    });
    const data = (await response.json()) as { authorized?: boolean };

    if (data.authorized) {
      window.localStorage.setItem("cybercharge_admin_device_key", key);
      setDeviceKey(key);
      setIsAuthorized(true);
    } else {
      window.localStorage.removeItem("cybercharge_admin_device_key");
      setAuthError("无权访问");
      setIsAuthorized(false);
    }

    setAuthChecked(true);
  }

  async function loadAdminData(key: string) {
    setIsLoading(true);
    setNotice("");

    try {
      const [overviewData, customersData, transactionsData, rewardsData, withdrawalsData] = await Promise.all([
        adminFetch<OverviewStats>("/api/admin/overview", key),
        adminFetch<{ customers: CustomerSummary[] }>("/api/admin/customers", key),
        adminFetch<{ transactions: TransactionRow[] }>("/api/admin/transactions", key),
        adminFetch<{ rewards: RewardRecord[] }>("/api/admin/rewards", key),
        adminFetch<{ withdrawals: WithdrawalRow[] }>("/api/admin/withdrawals", key),
      ]);

      setOverview(overviewData);
      setCustomers(customersData.customers);
      setTransactions(transactionsData.transactions);
      setRewards(rewardsData.rewards);
      setWithdrawals(withdrawalsData.withdrawals);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "无法加载后台数据。");
    } finally {
      setIsLoading(false);
    }
  }

  async function createReward(formData: FormData) {
    setNotice("");

    try {
      await adminFetch<{ reward: RewardRecord }>("/api/admin/rewards", deviceKey, {
        method: "POST",
        body: JSON.stringify({
          wallet_address: String(formData.get("wallet_address") ?? ""),
          reward_type: String(formData.get("reward_type") ?? ""),
          amount: Number(formData.get("amount") ?? 0),
          asset: String(formData.get("asset") ?? "USDT"),
          note: String(formData.get("note") ?? ""),
        }),
      });
      setNotice("奖励记录已创建。");
      await loadAdminData(deviceKey);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "无法创建奖励记录。");
    }
  }

  async function updateRewardStatus(id: string, status: "approved" | "paid" | "rejected") {
    setNotice("");

    try {
      await adminFetch<{ reward: RewardRecord }>(`/api/admin/rewards/${id}`, deviceKey, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setNotice(`奖励状态已更新为：${translateRewardStatus(status)}。`);
      await loadAdminData(deviceKey);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "无法更新奖励状态。");
    }
  }

  async function updateWithdrawalStatus(
    id: string,
    payload: { admin_note?: string; payout_tx_hash?: string; status: "approved" | "paid" | "rejected" },
  ) {
    setNotice("");

    try {
      await adminFetch<{ withdrawal: WithdrawalRow }>(`/api/admin/withdrawals/${id}`, deviceKey, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      setNotice(`提现状态已更新为：${translateStatus(payload.status)}。`);
      await loadAdminData(deviceKey);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "无法更新提现状态。");
    }
  }

  async function updateCustomer(id: string, payload: { admin_note?: string; admin_status?: string }) {
    setNotice("");

    try {
      const result = await adminFetch<{ customer: UserRecord }>(
        `/api/admin/customers/${id}`,
        deviceKey,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
      );
      setNotice("客户信息已更新。");
      setCustomers((items) =>
        items.map((item) =>
          item.id === id ? ({ ...item, ...result.customer } as CustomerSummary) : item,
        ),
      );
      setCustomerDetail((detail) =>
        detail && detail.customer.id === id
          ? { ...detail, customer: { ...detail.customer, ...result.customer } }
          : detail,
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "无法更新客户信息。");
    }
  }

  if (!authChecked) {
    return (
      <AdminAccessShell title="正在校验设备访问权限...">
        <AdminKeyConfigured configured={adminKeyConfigured} />
      </AdminAccessShell>
    );
  }

  if (!isAuthorized) {
    return (
      <AdminAccessShell title="无权访问">
        <AdminKeyConfigured configured={adminKeyConfigured} />
        <p className="mt-3 text-sm leading-6 text-zinc-500">
          请使用设备密钥访问：/admin?key=你的设备密钥
        </p>
        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void verifyKey(pendingKey);
          }}
        >
          <input
            value={pendingKey}
            onChange={(event) => setPendingKey(event.target.value)}
            placeholder="请输入设备密钥"
            className="h-11 flex-1 border border-zinc-200 px-3 text-sm outline-none focus:border-zinc-950"
          />
          <button className="h-11 bg-zinc-950 px-5 text-sm font-semibold text-white">
            解锁后台
          </button>
        </form>
        {authError && <p className="mt-4 text-sm font-medium text-red-600">{authError}</p>}
      </AdminAccessShell>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-950 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-zinc-200 px-4 py-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-6 lg:py-8">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-red-600">
          CyberCharge
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">后台管理</h1>
        <AdminKeyConfigured configured={adminKeyConfigured} compact />
        <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`h-11 shrink-0 px-4 text-left text-sm font-medium transition ${
                activeTab === item.id
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="min-w-0 px-4 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 border-b border-zinc-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
              设备密钥保护控制台
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">
              {sidebarItems.find((item) => item.id === activeTab)?.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void loadAdminData(deviceKey)}
            className="h-11 border border-zinc-200 px-4 text-sm font-semibold transition hover:border-zinc-400"
          >
            刷新数据
          </button>
        </div>

        {notice && <p className="mt-5 text-sm font-medium text-red-600">{notice}</p>}
        {isLoading && <p className="mt-5 text-sm text-zinc-500">正在加载后台数据...</p>}

        {activeTab === "overview" && <OverviewPanel stats={overview} />}
        {activeTab === "customers" && (
          <CustomersPanel
            customers={customers}
            detail={customerDetail}
            onCreateReward={createReward}
            onSelectCustomer={setSelectedCustomerId}
            onUpdateCustomer={updateCustomer}
            selectedCustomerId={selectedCustomerId}
          />
        )}
        {activeTab === "transactions" && <TransactionsPanel transactions={transactions} />}
        {activeTab === "rewards" && (
          <RewardsPanel
            customers={customers}
            onCreateReward={createReward}
            onUpdateStatus={updateRewardStatus}
            rewards={rewards}
          />
        )}
        {activeTab === "withdrawals" && (
          <WithdrawalsPanel
            onUpdateStatus={updateWithdrawalStatus}
            withdrawals={withdrawals}
          />
        )}
      </section>
    </main>
  );
}

function OverviewPanel({ stats }: { stats: OverviewStats }) {
  const cards = [
    { label: "客户总数", value: stats.totalCustomers, icon: UsersRound },
    { label: "总充值金额", value: formatAmount(stats.totalRechargeVolume), icon: CircleDollarSign },
    { label: "投资分配总数", value: stats.totalAllocations, icon: ReceiptText },
    { label: "奖励总额", value: formatAmount(stats.totalRewards), icon: Gift },
    { label: "待审核奖励", value: stats.pendingRewards, icon: Activity },
    { label: "已发放奖励", value: stats.paidRewards, icon: Activity },
    { label: "待处理提现", value: stats.pendingWithdrawals, icon: Activity },
  ];

  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.label} className="border-t border-zinc-200 pt-5">
            <Icon size={20} className="text-red-600" />
            <p className="mt-7 text-4xl font-semibold tracking-tight">{card.value}</p>
            <p className="mt-2 text-sm text-zinc-500">{card.label}</p>
          </article>
        );
      })}
    </div>
  );
}

function CustomersPanel({
  customers,
  detail,
  onCreateReward,
  onSelectCustomer,
  onUpdateCustomer,
  selectedCustomerId,
}: {
  customers: CustomerSummary[];
  detail: CustomerDetail | null;
  onCreateReward: (formData: FormData) => void;
  onSelectCustomer: (id: string | null) => void;
  onUpdateCustomer: (id: string, payload: { admin_note?: string; admin_status?: string }) => void;
  selectedCustomerId: string | null;
}) {
  const [countryFilter, setCountryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const countries = useMemo(() => {
    return Array.from(
      new Set(customers.map((customer) => customer.ip_country).filter(Boolean) as string[]),
    ).sort((a, b) => a.localeCompare(b));
  }, [customers]);
  const filteredCustomers = customers.filter((customer) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const searchTarget = [
      customer.wallet_address,
      customer.ip_address,
      customer.ip_country,
      customer.ip_city,
      customer.ip_region,
      customer.ip_org,
      customer.admin_note,
      translateCustomerStatus(customer.admin_status ?? "normal"),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      (!countryFilter || customer.ip_country === countryFilter) &&
      (!normalizedSearch || searchTarget.includes(normalizedSearch))
    );
  });

  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_420px]">
      <TableShell title="客户列表">
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_260px]">
          <FilterInput
            label="客户搜索"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="钱包 / IP / 国家 / 城市"
          />
          <FilterSelect
            label="国家筛选"
            value={countryFilter}
            onChange={setCountryFilter}
            options={countries}
            emptyLabel="全部国家"
          />
        </div>
        <table className="w-full min-w-[1280px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              {["钱包地址", "首次访问", "最近活动", "IP 地址", "位置", "累计充值", "累计份额", "累计奖励", "客户状态", "备注"].map((item) => (
                <th key={item} className="py-3 pr-5 font-medium">{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr
                key={customer.id}
                onClick={() => onSelectCustomer(customer.id)}
                className={`cursor-pointer border-b border-zinc-100 ${
                  selectedCustomerId === customer.id ? "bg-zinc-50" : ""
                }`}
              >
                <td className="py-4 pr-5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{shorten(customer.wallet_address)}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void navigator.clipboard.writeText(customer.wallet_address);
                      }}
                      className="text-zinc-400 transition hover:text-zinc-950"
                      title="复制钱包地址"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </td>
                <td className="py-4 pr-5 text-zinc-500">{formatDate(customer.created_at)}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatDate(customer.last_activity_at)}</td>
                <td className="py-4 pr-5 text-zinc-500">{customer.ip_address ?? "-"}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatLocation(customer)}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatAmount(customer.total_recharge)}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatAmount(customer.total_allocation)}%</td>
                <td className="py-4 pr-5 text-zinc-500">{formatAmount(customer.total_rewards)}</td>
                <td className="py-4 pr-5"><CustomerStatusBadge status={customer.admin_status ?? "normal"} /></td>
                <td className="max-w-44 truncate py-4 pr-5 text-zinc-500">{customer.admin_note ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
      <CustomerDetailPanel
        detail={detail}
        onClose={() => onSelectCustomer(null)}
        onCreateReward={onCreateReward}
        onUpdateCustomer={onUpdateCustomer}
      />
    </div>
  );
}

function CustomerDetailPanel({
  detail,
  onCreateReward,
  onClose,
  onUpdateCustomer,
}: {
  detail: CustomerDetail | null;
  onCreateReward: (formData: FormData) => void;
  onClose: () => void;
  onUpdateCustomer: (id: string, payload: { admin_note?: string; admin_status?: string }) => void;
}) {
  if (!detail) {
    return (
      <aside className="border border-zinc-200 p-5">
        <p className="text-sm text-zinc-500">请选择一个客户，查看充值、投资份额和奖励记录。</p>
      </aside>
    );
  }

  const { customer } = detail;

  return (
    <aside className="border border-zinc-200 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight">客户详情</h3>
          <p className="mt-2 break-all font-mono text-xs text-zinc-500">{customer.wallet_address}</p>
        </div>
        <button type="button" onClick={onClose} className="text-sm font-medium text-zinc-500">
          关闭
        </button>
      </div>
      <div className="mt-6 space-y-3 text-sm">
        <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
          运营信息
        </h4>
        <label className="block">
          <span className="text-zinc-500">客户状态</span>
          <select
            value={customer.admin_status ?? "normal"}
            onChange={(event) =>
              onUpdateCustomer(customer.id, {
                admin_status: event.target.value,
              })
            }
            className="mt-2 h-10 w-full border border-zinc-200 px-3 text-sm"
          >
            <option value="normal">正常</option>
            <option value="vip">VIP</option>
            <option value="risk">风险</option>
            <option value="frozen">冻结</option>
          </select>
        </label>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onUpdateCustomer(customer.id, {
              admin_note: String(formData.get("admin_note") ?? ""),
            });
          }}
        >
          <label className="block">
            <span className="text-zinc-500">客户备注</span>
            <textarea
              name="admin_note"
              defaultValue={customer.admin_note ?? ""}
              className="mt-2 min-h-24 w-full border border-zinc-200 p-3 text-sm outline-none focus:border-zinc-950"
              placeholder="添加客户备注"
            />
          </label>
          <button className="h-10 w-full bg-zinc-950 px-4 text-sm font-semibold text-white">
            保存备注
          </button>
        </form>
        <form action={onCreateReward} className="border-t border-zinc-200 pt-5">
          <input type="hidden" name="wallet_address" value={customer.wallet_address} />
          <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
            给客户创建奖励
          </h4>
          <div className="mt-3 grid gap-3">
            <select name="reward_type" className="h-10 border border-zinc-200 px-3 text-sm">
              <option value="referral">邀请奖励</option>
              <option value="revenue_share">收益分成</option>
              <option value="manual_bonus">手动奖励</option>
            </select>
            <input
              name="amount"
              type="number"
              step="0.000001"
              className="h-10 border border-zinc-200 px-3 text-sm"
              placeholder="奖励金额"
            />
            <select name="asset" className="h-10 border border-zinc-200 px-3 text-sm">
              <option value="USDT">USDT</option>
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
            </select>
            <textarea
              name="note"
              className="min-h-20 border border-zinc-200 p-3 text-sm"
              placeholder="奖励备注"
            />
            <button className="h-10 border border-zinc-950 px-4 text-sm font-semibold">
              创建奖励记录
            </button>
          </div>
        </form>
      </div>
      <div className="mt-8 space-y-3 text-sm">
        <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">
          网络信息
        </h4>
        <DetailRow label="IP 地址" value={customer.ip_address ?? "-"} />
        <DetailRow label="国家" value={customer.ip_country ?? "-"} />
        <DetailRow label="地区" value={customer.ip_region ?? "-"} />
        <DetailRow label="城市" value={customer.ip_city ?? "-"} />
        <DetailRow label="时区" value={customer.ip_timezone ?? "-"} />
        <DetailRow label="网络运营商" value={customer.ip_org ?? "-"} />
        <DetailRow label="创建时间" value={formatDate(customer.created_at)} />
        <DetailRow label="最近活动" value={formatDate(customer.last_activity_at)} />
        <DetailRow label="客户状态" value={translateCustomerStatus(customer.admin_status ?? "normal")} />
      </div>
      <MiniRecordList title="充值数据" rows={detail.transactions} fields={["tx_hash", "amount", "asset", "network", "status", "created_at", "confirmation_time"]} />
      <MiniRecordList title="投资份额" rows={detail.allocations} fields={["allocation_percent", "purchase_value", "asset", "network", "status", "created_at"]} />
      <MiniRecordList title="返利 / 奖励" rows={detail.rewards} fields={["reward_type", "amount", "asset", "status", "note", "created_at", "paid_at"]} />
    </aside>
  );
}

function TransactionsPanel({ transactions }: { transactions: TransactionRow[] }) {
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [network, setNetwork] = useState("");
  const [asset, setAsset] = useState("");
  const filteredTransactions = transactions.filter((item) => {
    return (
      item.wallet_address.toLowerCase().includes(wallet.toLowerCase()) &&
      (!status || item.status === status) &&
      (!network || item.network === network) &&
      (!asset || item.asset === asset)
    );
  });

  return (
    <div className="mt-8">
      <div className="grid gap-3 md:grid-cols-4">
        <FilterInput label="钱包" value={wallet} onChange={setWallet} />
        <FilterSelect label="状态" value={status} onChange={setStatus} options={["pending", "confirmed", "failed"]} />
        <FilterSelect label="网络" value={network} onChange={setNetwork} options={["Ethereum", "Base", "Polygon", "BSC"]} />
        <FilterSelect label="币种" value={asset} onChange={setAsset} options={["ETH", "USDT", "USDC"]} />
      </div>
      <TableShell title="充值交易记录">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              {["钱包地址", "交易哈希", "金额", "币种", "网络", "支付类型", "状态", "IP 地址", "创建时间", "确认时间", "区块浏览器"].map((item) => (
                <th key={item} className="py-3 pr-5 font-medium">{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-4 pr-5 font-mono text-xs">{shorten(item.wallet_address)}</td>
                <td className="py-4 pr-5 font-mono text-xs">{shorten(item.tx_hash)}</td>
                <td className="py-4 pr-5 text-zinc-500">{item.amount}</td>
                <td className="py-4 pr-5 text-zinc-500">{item.asset}</td>
                <td className="py-4 pr-5 text-zinc-500">{item.network}</td>
                <td className="py-4 pr-5 text-zinc-500">{item.payment_type ?? "native"}</td>
                <td className="py-4 pr-5"><RewardStatusBadge status={item.status} /></td>
                <td className="py-4 pr-5 text-zinc-500">{item.ip_address}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatDate(item.created_at)}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatDate(item.confirmation_time)}</td>
                <td className="py-4 pr-5">
                  {item.explorer_link ? (
                    <a className="font-medium underline underline-offset-4" href={item.explorer_link} target="_blank" rel="noreferrer">
                      查看
                    </a>
                  ) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

function RewardsPanel({
  customers,
  onCreateReward,
  onUpdateStatus,
  rewards,
}: {
  customers: CustomerSummary[];
  onCreateReward: (formData: FormData) => void;
  onUpdateStatus: (id: string, status: "approved" | "paid" | "rejected") => void;
  rewards: RewardRecord[];
}) {
  return (
    <div className="mt-8 grid gap-5 xl:grid-cols-[360px_1fr]">
      <form action={onCreateReward} className="border border-zinc-200 p-5">
        <h3 className="text-2xl font-semibold tracking-tight">新增奖励</h3>
        <label className="mt-5 block text-sm font-medium text-zinc-500">客户钱包</label>
        <select name="wallet_address" className="mt-2 h-11 w-full border border-zinc-200 px-3 text-sm">
          {customers.map((customer) => (
            <option key={customer.id} value={customer.wallet_address}>
              {customer.wallet_address}
            </option>
          ))}
        </select>
        <label className="mt-4 block text-sm font-medium text-zinc-500">奖励类型</label>
        <select name="reward_type" className="mt-2 h-11 w-full border border-zinc-200 px-3 text-sm">
          <option value="referral">邀请奖励</option>
          <option value="revenue_share">收益分成</option>
          <option value="manual_bonus">手动奖励</option>
        </select>
        <label className="mt-4 block text-sm font-medium text-zinc-500">金额</label>
        <input name="amount" type="number" step="0.000001" className="mt-2 h-11 w-full border border-zinc-200 px-3 text-sm" />
        <label className="mt-4 block text-sm font-medium text-zinc-500">币种</label>
        <select name="asset" className="mt-2 h-11 w-full border border-zinc-200 px-3 text-sm">
          <option value="USDT">USDT</option>
          <option value="USDC">USDC</option>
          <option value="ETH">ETH</option>
        </select>
        <label className="mt-4 block text-sm font-medium text-zinc-500">备注</label>
        <textarea name="note" className="mt-2 min-h-24 w-full border border-zinc-200 p-3 text-sm" />
        <button className="mt-5 h-11 w-full bg-zinc-950 px-4 text-sm font-semibold text-white">
          创建奖励
        </button>
        <p className="mt-4 text-xs leading-5 text-zinc-500">
          奖励仅作为后台运营记录，不会触发真实链上发放。
        </p>
      </form>

      <TableShell title="奖励状态管理">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              {["钱包", "类型", "金额", "币种", "状态", "备注", "创建时间", "发放时间", "操作"].map((item) => (
                <th key={item} className="py-3 pr-5 font-medium">{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rewards.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-4 pr-5 font-mono text-xs">{shorten(item.wallet_address)}</td>
                <td className="py-4 pr-5 text-zinc-500">{translateRewardType(item.reward_type)}</td>
                <td className="py-4 pr-5 text-zinc-500">{item.amount}</td>
                <td className="py-4 pr-5 text-zinc-500">{item.asset}</td>
                <td className="py-4 pr-5"><StatusBadge status={item.status} /></td>
                <td className="py-4 pr-5 text-zinc-500">{item.note ?? "-"}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatDate(item.created_at)}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatDate(item.paid_at)}</td>
                <td className="py-4 pr-5">
                  <div className="flex gap-2">
                    {(["approved", "paid", "rejected"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => onUpdateStatus(item.id, status)}
                        className="border border-zinc-200 px-2 py-1 text-xs font-medium hover:border-zinc-400"
                      >
                        {translateRewardStatus(status)}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

function WithdrawalsPanel({
  onUpdateStatus,
  withdrawals,
}: {
  onUpdateStatus: (
    id: string,
    payload: { admin_note?: string; payout_tx_hash?: string; status: "approved" | "paid" | "rejected" },
  ) => void;
  withdrawals: WithdrawalRow[];
}) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [txHashes, setTxHashes] = useState<Record<string, string>>({});

  return (
    <div className="mt-8">
      <TableShell title="提现申请管理">
        <table className="w-full min-w-[1320px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              {[
                "钱包",
                "金额",
                "币种",
                "网络",
                "状态",
                "申请时间",
                "审核时间",
                "支付时间",
                "Tx Hash",
                "备注",
                "操作",
              ].map((item) => (
                <th key={item} className="py-3 pr-5 font-medium">{item}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100 align-top">
                <td className="py-4 pr-5 font-mono text-xs">{shorten(item.wallet_address)}</td>
                <td className="py-4 pr-5 text-zinc-500">{item.amount}</td>
                <td className="py-4 pr-5 text-zinc-500">{item.asset}</td>
                <td className="py-4 pr-5 text-zinc-500">{item.network}</td>
                <td className="py-4 pr-5"><StatusBadge status={item.status} /></td>
                <td className="py-4 pr-5 text-zinc-500">{formatDate(item.requested_at)}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatDate(item.reviewed_at)}</td>
                <td className="py-4 pr-5 text-zinc-500">{formatDate(item.paid_at)}</td>
                <td className="py-4 pr-5 font-mono text-xs">{shorten(item.payout_tx_hash)}</td>
                <td className="py-4 pr-5 text-zinc-500">{item.admin_note ?? "-"}</td>
                <td className="py-4 pr-5">
                  <div className="grid min-w-80 gap-2">
                    <textarea
                      value={notes[item.id] ?? ""}
                      onChange={(event) =>
                        setNotes((current) => ({ ...current, [item.id]: event.target.value }))
                      }
                      placeholder="审核备注，可选"
                      className="min-h-16 border border-zinc-200 p-2 text-xs outline-none focus:border-zinc-950"
                    />
                    <input
                      value={txHashes[item.id] ?? ""}
                      onChange={(event) =>
                        setTxHashes((current) => ({ ...current, [item.id]: event.target.value }))
                      }
                      placeholder="Payout tx hash，标记已支付时必填"
                      className="h-9 border border-zinc-200 px-2 font-mono text-xs outline-none focus:border-zinc-950"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStatus(item.id, {
                            admin_note: notes[item.id],
                            status: "approved",
                          })
                        }
                        className="border border-zinc-200 px-2 py-1 text-xs font-medium hover:border-zinc-400"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStatus(item.id, {
                            admin_note: notes[item.id],
                            status: "rejected",
                          })
                        }
                        className="border border-zinc-200 px-2 py-1 text-xs font-medium hover:border-zinc-400"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateStatus(item.id, {
                            admin_note: notes[item.id],
                            payout_tx_hash: txHashes[item.id],
                            status: "paid",
                          })
                        }
                        className="bg-zinc-950 px-2 py-1 text-xs font-medium text-white"
                      >
                        Mark as Paid
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {withdrawals.length === 0 && <p className="mt-5 text-sm text-zinc-500">暂无提现申请。</p>}
      </TableShell>
      <p className="mt-4 text-xs leading-5 text-zinc-500">
        后台不会自动链上转账。请人工完成转账后填写 payout tx hash，再标记为已支付。
      </p>
    </div>
  );
}

function AdminAccessShell({
  children,
  title,
}: {
  children?: React.ReactNode;
  title: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-4 text-zinc-950">
      <section className="w-full max-w-xl border border-zinc-200 p-8">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-600">
          CyberCharge Admin
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
        {children}
      </section>
    </main>
  );
}

function AdminKeyConfigured({
  compact = false,
  configured,
}: {
  compact?: boolean;
  configured: boolean | null;
}) {
  const value = configured === null ? "checking" : String(configured);

  return (
    <p
      className={`mt-4 text-xs font-medium uppercase tracking-[0.18em] ${
        configured ? "text-zinc-500" : "text-red-600"
      } ${compact ? "lg:mt-6" : ""}`}
    >
      Configured: {value}
    </p>
  );
}

function TableShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="mt-5 min-w-0 border border-zinc-200 bg-white p-5">
      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
      <div className="mt-5 overflow-x-auto">{children}</div>
    </section>
  );
}

function FilterInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <span className="mt-2 flex h-11 items-center border border-zinc-200 px-3">
        <Search size={15} className="text-zinc-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="ml-2 min-w-0 flex-1 text-sm outline-none"
        />
      </span>
    </label>
  );
}

function FilterSelect({
  emptyLabel = "全部",
  label,
  onChange,
  options,
  value,
}: {
  emptyLabel?: string;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full border border-zinc-200 px-3 text-sm"
      >
        <option value="">{emptyLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2">
      <span className="text-zinc-500">{label}</span>
      <span className="break-all text-right font-medium">{value}</span>
    </div>
  );
}

function MiniRecordList({
  fields,
  rows,
  title,
}: {
  fields: string[];
  rows: Array<Record<string, unknown>>;
  title: string;
}) {
  return (
    <div className="mt-8">
      <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-500">{title}</h4>
      <div className="mt-3 space-y-3">
        {rows.length === 0 && <p className="text-sm text-zinc-500">暂无记录。</p>}
        {rows.map((row, index) => (
          <div key={String(row.id ?? index)} className="border-t border-zinc-200 pt-3 text-xs">
            {fields.map((field) => (
              <DetailRow key={field} label={translateField(field)} value={formatUnknown(row[field], field)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex h-7 items-center px-3 text-xs font-medium capitalize ${
        status === "confirmed" || status === "active" || status === "paid"
          ? "bg-zinc-950 text-white"
          : "bg-zinc-100 text-zinc-500"
      }`}
    >
      {translateStatus(status)}
    </span>
  );
}

function CustomerStatusBadge({ status }: { status: string }) {
  const isAttention = status === "risk" || status === "frozen";

  return (
    <span
      className={`inline-flex h-7 items-center px-3 text-xs font-medium ${
        isAttention ? "bg-red-50 text-red-700" : "bg-zinc-950 text-white"
      }`}
    >
      {translateCustomerStatus(status)}
    </span>
  );
}

function RewardStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex h-7 items-center px-3 text-xs font-medium ${
        status === "paid"
          ? "bg-zinc-950 text-white"
          : status === "rejected"
            ? "bg-red-50 text-red-700"
            : "bg-zinc-100 text-zinc-500"
      }`}
    >
      {translateRewardStatus(status)}
    </span>
  );
}

async function adminFetch<T>(url: string, key: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      "x-admin-device-key": key,
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json();

  if (!response.ok) {
    console.error("Admin API error detail", data);
    throw new Error(formatAdminApiError(data));
  }

  return data as T;
}

function formatAdminApiError(data: {
  error?: string;
  detail?: { code?: string; message?: string; details?: string; hint?: string };
}) {
  const detail = data.detail;

  if (!detail) {
    return data.error ?? "后台请求失败。";
  }

  return [
    data.error ?? detail.message ?? "后台请求失败。",
    detail.code ? `code: ${detail.code}` : "",
    detail.details ? `details: ${detail.details}` : "",
    detail.hint ? `hint: ${detail.hint}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

function shorten(value?: string | null) {
  if (!value || value === "-") return "-";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
}

function formatUnknown(value: unknown, field?: string) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return formatAmount(value);
  if (field === "status" && typeof value === "string") return translateStatus(value);
  if (field === "reward_type" && typeof value === "string") return translateRewardType(value);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return formatDate(value);
  }
  return String(value);
}

function translateStatus(status: string) {
  const labels: Record<string, string> = {
    active: "正常",
    pending: "待处理",
    confirmed: "已确认",
    failed: "失败",
    approved: "已批准",
    paid: "已发放",
    rejected: "已拒绝",
  };

  return labels[status] ?? status;
}

function translateCustomerStatus(status: string) {
  const labels: Record<string, string> = {
    normal: "正常",
    vip: "VIP",
    risk: "风险",
    frozen: "冻结",
    active: "正常",
  };

  return labels[status] ?? status;
}

function translateRewardStatus(status: string) {
  const labels: Record<string, string> = {
    pending: "待审核",
    approved: "已批准",
    paid: "已发放",
    rejected: "已拒绝",
  };

  return labels[status] ?? status;
}

function translateRewardType(type: string) {
  const labels: Record<string, string> = {
    referral: "邀请奖励",
    revenue_share: "收益分成",
    manual_bonus: "手动奖励",
  };

  return labels[type] ?? type;
}

function translateField(field: string) {
  const labels: Record<string, string> = {
    tx_hash: "交易哈希",
    amount: "金额",
    asset: "币种",
    network: "网络",
    status: "状态",
    created_at: "创建时间",
    confirmation_time: "确认时间",
    allocation_percent: "投资份额",
    purchase_value: "购买金额",
    reward_type: "奖励类型",
    note: "备注",
    paid_at: "发放时间",
  };

  return labels[field] ?? field;
}

function formatLocation(customer: UserRecord) {
  if (
    customer.ip_country === "本地开发环境" ||
    customer.ip_city === "本地开发环境" ||
    customer.ip_address === "127.0.0.1" ||
    customer.ip_address === "::1"
  ) {
    return "本地开发环境";
  }

  return [customer.ip_city, customer.ip_country].filter(Boolean).join(", ") || "-";
}
