# EASI Lab — Dong Hun Lee

서울대학교 이동훈 교수 연구실의 한·영 홈페이지입니다.

- 한국어: https://dhlmed.github.io/easi-lab/
- English: https://dhlmed.github.io/easi-lab/en/index.html
- Repository: https://github.com/dhlmed/easi-lab
- 콘텐츠 기준: 2026-10-12, EASI 홈페이지 버전 27

## 최근 반영 내용

- Experimental Dermatology 편집장(Editor-in-Chief, EIC) 약력에 Wiley 저널 홈페이지 링크를 추가했습니다.
- MBA를 동국대학교 경영전문대학원 의료기기혁신경영 MBA로 구체화하고, 학력·소개·의료기기 연구 분야에 반영했습니다. 영어 전공 표현은 공식 과정명이 아닌 설명식 번역입니다.

- 연구책임자를 상단 메뉴의 첫 항목으로, 공동연구를 마지막 항목으로 배치했습니다. 공동연구를 강조하고 연구 참여는 일반 메뉴로 표시합니다.
- EASI 바로 아래의 풀네임이 고정 배너에 남으며, 첫 글자 E·A·S·I는 밝은 라임색입니다. 배너 아래 풀네임은 구릿빛으로 표시합니다.
- MD, PhD, MBA 학위와 의료기기·EBD 연구 분야의 MBA 배경을 반영했습니다.
- 대한아토피피부염학회 국제이사 2023–현재, 대한접촉피부염·알레르기학회 대외협력이사 2025–현재, 대한화장품의학회 대외협력이사 2024–현재를 반영했습니다.

## 수정 및 배포

`main`에 변경 사항을 저장하면 `.github/workflows/pages.yml`의 **Deploy EASI Lab**이 빌드와 검사를 실행하고 GitHub Pages에 배포합니다. 실행 결과는 저장소의 **Actions**에서 확인합니다.

주요 편집 파일:

| 파일 | 역할 |
| --- | --- |
| `dist/assets/app.js` | 한·영 페이지 템플릿과 동작 |
| `dist/assets/site-content.json` | 연구실, 연구 분야, 프로필 등 콘텐츠 |
| `dist/assets/publications.json` | 논문 목록 |
| `dist/assets/typography.css` | 글자 크기와 상단 배너 스타일 |
| `build.mjs` | 정적 페이지, 메타데이터, sitemap 생성 |

Node.js 24에서 빌드와 검사를 실행합니다.

```sh
node build.mjs
node check.mjs
node check-discovery.mjs
```

배포 대상은 `dist/`입니다. GitHub Pages의 `/easi-lab/` 경로와 한·영 페이지 URL을 유지하세요. 자동 검사는 링크·콘텐츠·메타데이터를 확인하며, 브라우저의 시각 검수를 대신하지 않습니다.
