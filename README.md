# 춘의역탑부동산공인중개사사무소 홈페이지

부천시 원미구 춘의동 123-56 1층 · 춘의역(7호선) 6번 출구 도보 1분 · ☎ 032-683-5949

- 홈페이지: https://chunui-top-realestate.vercel.app (main 브랜치에 올리면 Vercel이 자동 배포)

## 폴더 구성

| 경로 | 내용 |
|---|---|
| `website/` | 배포되는 홈페이지 (Vercel 출력 폴더) |
| `website/assets/` | 대표 사진, 약도, 챗봇(`chatbot.js`, `chatbot.css`, `faq-data.js`) |
| `company-profile.md` | 회사 소개서 |
| `service-policy.md` | 서비스 · 계약/정산 정책 |
| `faq.md` | 자주 묻는 질문 100개 (챗봇 지식) |
| `site-design.md` | 홈페이지 설계서 |
| `DESIGN.md`, `code.html`, `screen.png` | 디자인 원본 |
| `build-faq.py` | `faq.md` → 챗봇 데이터 변환 스크립트 |

## 수정 방법

- FAQ를 고친 뒤 `python build-faq.py`를 실행하면 챗봇 답변이 바뀝니다.
- `main` 브랜치에 올리면 Vercel이 자동으로 다시 배포합니다.
- 정보 입력이 끝나면 `website/index.html`의 `<meta name="robots" ...>` 줄과 `vercel.json`의 `X-Robots-Tag` 항목을 지워 검색엔진 노출을 켜세요.
- 아직 채워야 할 곳은 `[입력` 으로 검색하면 찾을 수 있습니다.
