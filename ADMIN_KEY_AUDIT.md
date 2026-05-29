# Admin Device Key Audit

Date: 2026-05-30

## 1. Admin 校验代码位置

Admin 设备密钥校验位于：

- `src/lib/admin/server.ts`
- `src/app/api/admin/verify/route.ts`
- `src/app/api/admin/debug/route.ts`
- `src/components/admin/AdminConsole.tsx`

核心服务端校验函数：

```ts
isAdminDeviceRequest(request)
```

## 2. 当前比较逻辑

当前比较逻辑是：

```ts
queryKey.trim() === process.env.ADMIN_DEVICE_KEY.trim()
```

更完整地说：

- 优先读取请求 header：`x-admin-device-key`
- 如果 header 不存在，则读取 URL query：`?key=...`
- 服务端读取环境变量：`process.env.ADMIN_DEVICE_KEY`
- 两侧都通过 `trim()` 去掉首尾空格后再比较

## 3. Cloudflare 实际读取的变量名

Cloudflare Workers runtime 读取的变量名是：

```txt
ADMIN_DEVICE_KEY
```

不是：

- `NEXT_PUBLIC_ADMIN_DEVICE_KEY`
- `NEXT_PUBLIC_ADMIN_WALLETS`
- `ADMIN_KEY`
- `DEVICE_KEY`

## 4. 是否存在默认值

运行时代码没有默认 admin key。

如果 `ADMIN_DEVICE_KEY` 缺失，代码会把它视为空字符串，Admin 校验一定失败。

`.env.example` 中有示例值 `change-me`，但它只是模板，不会作为运行时默认值使用。

## 5. 是否存在 hardcoded key

未发现业务代码中硬编码 admin key。

代码没有把 `myadmin2026` 写死在 `src/`、`package.json` 或 `wrangler.jsonc` 中。

本地 `.env.local` 中确实配置了 `ADMIN_DEVICE_KEY`，并且本地检查没有发现它与预期 key 不一致。线上 Cloudflare 是否一致，需要通过 `/api/admin/debug` 或 Cloudflare 环境变量面板确认。

## 6. 是否存在 localStorage 覆盖

存在 localStorage 缓存：

```txt
cybercharge_admin_device_key
```

位置：

```ts
src/components/admin/AdminConsole.tsx
```

逻辑：

1. 页面优先读取 URL 参数 `?key=...`
2. 如果 URL 没有 key，再读取 localStorage 中保存的 key
3. 如果校验失败，会删除 localStorage 中的旧 key

因此，如果以前输入过错误 key，访问 `/admin` 可能继续失败；访问 `/admin?key=正确key` 会覆盖旧缓存。

## 7. 新增调试输出

已新增：

```txt
/api/admin/debug
```

示例：

```txt
/api/admin/debug?key=你的key
```

返回：

```json
{
  "adminKeyConfigured": true,
  "receivedKey": true,
  "keyMatched": true
}
```

不会返回真实 key。

Admin 页面也新增了只读显示：

```txt
Configured: true/false
```

这个值只表示服务端是否读取到了 `ADMIN_DEVICE_KEY`，不会显示密钥内容。

## 8. 线上 Unauthorized 的最可能原因

如果线上 `/admin?key=xxx` 仍显示 Unauthorized，请访问：

```txt
https://tslcharge.cc/api/admin/debug?key=xxx
```

判断：

- `adminKeyConfigured: false`  
  Cloudflare Production 环境没有配置 `ADMIN_DEVICE_KEY`，或变量还没有随最新部署生效。

- `receivedKey: false`  
  URL 参数名不是 `key`，或请求中没有传 key。

- `keyMatched: false`  
  线上 `ADMIN_DEVICE_KEY` 与 URL 中传入的 key 不一致，或线上变量包含不可见字符。

## 9. 部署注意事项

Cloudflare 环境变量修改后需要重新部署 Worker 才能保证新变量进入运行时。

如果 Cloudflare Pages/Workers 分环境配置，请确认变量加在当前线上使用的环境中，而不是 Preview 或其他环境。
