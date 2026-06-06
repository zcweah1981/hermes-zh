# SEO 平台客户端与密钥契约

## 目标

Hermes 中文站 V3 的 SEO/GEO 自动化只从固定本地密钥文件读取运行时凭据，不把任何 token、private key、client email 完整值写入仓库、日志或报告。

## 唯一密钥来源

- 固定 env 文件：`/root/.hermes/secrets/hermes-zh-v3.env`
- GSC 主凭据变量：`GSC_SERVICE_ACCOUNT_JSON`
- `GOOGLE_APPLICATION_CREDENTIALS` 仅作为外部 Google SDK 兼容路径记录；本站客户端优先读取 `GSC_SERVICE_ACCOUNT_JSON`，禁止从仓库读取服务账号 JSON。

## 必需变量

| 平台 | 变量 | 说明 |
| --- | --- | --- |
| Google Search Console | `GSC_SERVICE_ACCOUNT_JSON` | service account JSON 或本地 JSON 文件路径；inline JSON 建议单行，`private_key` 使用 `\n` 表示换行。 |
| Google SDK 兼容 | `GOOGLE_APPLICATION_CREDENTIALS` | 可选文件路径，仅允许指向 `/root/.hermes/secrets/` 下的本地文件。 |
| Bing Webmaster | `BING_WEBMASTER_API_KEY` | Bing Webmaster API key。 |
| Baidu URL Push | `BAIDU_PUSH_TOKEN` | 百度 URL 推送 token。 |
| Baidu URL Push | `BAIDU_PUSH_ENDPOINT` | 完整 URL push endpoint，可包含 site 与 token 查询参数。 |
| IndexNow | `INDEXNOW_KEY` | 32 位小写 hex key。 |
| IndexNow | `INDEXNOW_KEY_LOCATION` | 站点根路径下 key 文件 URL，例如 `https://hermes-zh.com/<key>.txt`。 |

示例占位文件见：`docs/ops/seo-platform.env.example`。该文件只允许提交变量名和占位符，不得提交真实密钥。

## Redaction 规则

所有平台 smoke、日志与报告必须调用 `redactSeoSecrets` 或输出结构化安全字段：

允许输出：
- 平台状态：`readable` / `submitted` / `blocked` / `missing_secret` / `error`
- 站点、URL、提交数量、剩余额度
- blocker 类型，例如 `baidu_quota`、`indexnow_key_location_403`
- `sha256:<12hex>` masked fingerprint

禁止输出完整值：
- `token`
- `private_key`
- `client_email`
- `BING_WEBMASTER_API_KEY`
- `BAIDU_PUSH_TOKEN`
- `INDEXNOW_KEY`
- Google OAuth access token，例如 `ya29.*`

## 平台 smoke 预期

- GSC：service account 可获取 token 且 sites API 可读，报告为 `readable`。
- Bing：Webmaster API 可读站点信息，报告为 `readable`。
- Baidu：若 API 返回 over quota / 配额耗尽，报告为 `blocked` + `baidu_quota`，这是 quota blocker，不视为代码失败。
- IndexNow：若 `INDEXNOW_KEY_LOCATION` 返回 403，报告为 `blocked` + `indexnow_key_location_403`，这是可修复 blocker（通常需要检查 public key 文件、CDN 或访问控制）。

## 仓库约束

- 禁止提交真实 `.env`、service account JSON、token、private key。
- 新增平台客户端只允许读取 `/root/.hermes/secrets/hermes-zh-v3.env` 和其中的 `GSC_SERVICE_ACCOUNT_JSON`。
- CI / 本地报告只保留 masked fingerprint 与 blocker 分类。
