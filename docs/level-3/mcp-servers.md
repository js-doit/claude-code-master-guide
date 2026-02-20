---
sidebar_position: 3
title: MCP 서버 연결
description: Model Context Protocol(MCP)로 Claude Code에 외부 도구와 데이터 소스를 연결하는 방법을 배웁니다.
---

# MCP 서버 연결

MCP(Model Context Protocol)는 Claude Code가 외부 도구, 데이터베이스, API와 표준화된 방식으로 통신할 수 있게 해주는 프로토콜입니다. MCP 서버를 연결하면 Claude Code의 기본 능력을 크게 확장할 수 있습니다.

## MCP란 무엇인가

기본적으로 Claude Code는 파일 시스템, 터미널, 웹 검색 정도만 다룰 수 있습니다. MCP 서버를 연결하면:

- **데이터베이스** — PostgreSQL, MySQL, SQLite 직접 쿼리
- **외부 서비스** — GitHub, Slack, Jira, Notion 연동
- **로컬 도구** — 브라우저 자동화, 이미지 처리, 파일 변환
- **커스텀 도구** — 직접 만든 내부 시스템 연결

이 모든 것이 Claude와 자연어 대화로 이루어집니다.

## MCP 서버 추가 방법

### CLI로 추가 (권장)

```bash
# 전역으로 추가
claude mcp add <서버명> -- <실행 명령>

# 예시: Node.js MCP 서버
claude mcp add my-server -- node /path/to/server.js

# 프로젝트별로 추가
claude mcp add <서버명> --scope project -- <실행 명령>
```

### settings.json으로 추가

`~/.claude/settings.json` (전역) 또는 `.claude/settings.json` (프로젝트):

```json
{
  "mcpServers": {
    "서버명": {
      "command": "node",
      "args": ["/path/to/mcp-server.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

## 인기 MCP 서버

### GitHub MCP 서버

```bash
npm install -g @modelcontextprotocol/server-github
claude mcp add github -- npx @modelcontextprotocol/server-github
```

설정:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxx"
      }
    }
  }
}
```

연결 후 사용 예시:
```
> 이 저장소의 열린 이슈 목록 보여줘
> PR #42에 코드 리뷰 코멘트 달아줘
> main 브랜치의 최근 커밋 10개 요약해줘
```

### PostgreSQL MCP 서버

```bash
npm install -g @modelcontextprotocol/server-postgres
```

설정:
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/mydb"
      }
    }
  }
}
```

연결 후 사용 예시:
```
> users 테이블 스키마 보여줘
> 지난 30일 동안 가입한 사용자 수 쿼리해줘
> 주문 테이블과 상품 테이블 조인해서 매출 상위 10개 상품 알려줘
```

### 파일시스템 MCP 서버

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/projects",
        "/Users/username/documents"
      ]
    }
  }
}
```

특정 디렉토리에만 접근을 허용합니다.

### SQLite MCP 서버

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-sqlite", "--db-path", "./database.db"]
    }
  }
}
```

### Slack MCP 서버

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-xxxx",
        "SLACK_TEAM_ID": "T0xxxx"
      }
    }
  }
}
```

## MCP 서버 관리 명령어

```bash
# 등록된 서버 목록 확인
claude mcp list

# 특정 서버 상태 확인
claude mcp get <서버명>

# 서버 제거
claude mcp remove <서버명>
```

## 커스텀 MCP 서버 만들기

내부 시스템이나 커스텀 도구를 MCP 서버로 만들 수 있습니다.

### 기본 구조 (Node.js)

```javascript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'my-custom-server', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// 도구 목록 정의
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_product_info',
      description: '상품 ID로 내부 DB에서 상품 정보를 조회합니다',
      inputSchema: {
        type: 'object',
        properties: {
          product_id: { type: 'string', description: '상품 ID' }
        },
        required: ['product_id']
      }
    }
  ]
}));

// 도구 실행 처리
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'get_product_info') {
    const { product_id } = request.params.arguments;
    // 실제 DB 조회 로직
    const product = await fetchProductFromDB(product_id);
    return {
      content: [{ type: 'text', text: JSON.stringify(product) }]
    };
  }
});

// 서버 시작
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Python으로 만들기

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import mcp.types as types

server = Server("my-python-server")

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="query_analytics",
            description="내부 분석 시스템에서 데이터를 조회합니다",
            inputSchema={
                "type": "object",
                "properties": {
                    "metric": {"type": "string"},
                    "date_range": {"type": "string"}
                },
                "required": ["metric"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "query_analytics":
        result = await query_analytics_system(arguments)
        return [TextContent(type="text", text=str(result))]

async def main():
    async with stdio_server() as streams:
        await server.run(streams[0], streams[1], server.create_initialization_options())

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

## MCP와 함께하는 실전 워크플로우

### 예시: DB 연동 개발

```
> users 테이블에 last_login 컬럼 추가하는 마이그레이션 작성해줘
  (MCP가 현재 스키마를 자동으로 읽어 올바른 마이그레이션 생성)

> 지난 주에 로그인한 적 없는 사용자에게 이메일 보내는 스크립트 작성해줘
  (MCP가 실제 데이터 구조를 파악해 쿼리 자동 최적화)
```

### 예시: GitHub 연동 개발

```
> 이번 스프린트에서 해결할 이슈 목록 가져와서 우선순위 분석해줘
> 오늘 머지된 PR들 요약해서 릴리즈 노트 초안 작성해줘
> 이슈 #123 기반으로 새 브랜치 만들고 기본 구조 작성해줘
```

## 보안 고려사항

:::warning MCP 서버 권한 관리
MCP 서버는 Claude Code를 통해 데이터베이스나 외부 서비스에 접근합니다. 반드시:
- 읽기 전용 계정을 사용하거나, 최소 권한 원칙을 적용하세요
- API 토큰은 환경변수로 관리하고, `settings.json`에 직접 하드코딩하지 마세요
- `.gitignore`에 민감한 정보가 담긴 settings 파일을 추가하세요
:::

```bash
# 환경변수로 분리
export GITHUB_TOKEN=ghp_xxxx
export DB_CONNECTION=postgresql://...
```

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

---

다음 챕터: [멀티 모델 전략 →](/docs/level-3/multi-model-strategy)
