# EASI Lab — Dong Hun Lee

서울대학교 이동훈 교수 연구실의 한·영 홈페이지입니다.

- 공개 대상 주소: https://dhlmed.github.io/easi-lab/
- 영어 홈페이지: https://dhlmed.github.io/easi-lab/en/index.html
- 대상 저장소: https://github.com/dhlmed/easi-lab
- 준비 기준: 2026-10-11 EASI 홈페이지 최신 공개 버전 21
- 이 패키지는 GitHub 업로드용입니다. 업로드 및 원격 배포 성공을 의미하지 않습니다.

## 처음 게시하기 — 웹브라우저만 이용

1. ZIP 파일의 압축을 풉니다.
2. `easi-lab` 폴더를 엽니다. 안에 `dist`, `.github`, `build.mjs`, `README.md` 등이 있는지 확인합니다.
3. https://github.com/dhlmed/easi-lab 에 로그인한 상태로 접속합니다.
4. **Add file → Upload files**를 누르고, `easi-lab` 폴더 **안의 파일과 폴더 전체**를 끌어 넣습니다. ZIP 자체나 바깥쪽 `easi-lab` 폴더를 올리지 않습니다.
5. `.github/workflows/pages.yml`과 `dist/index.html`이 포함되었는지 확인하고, 기본 브랜치에 **Commit changes**합니다. 빈 저장소에서는 **uploading an existing file** 링크로 같은 작업을 할 수 있습니다.
6. https://github.com/dhlmed/easi-lab/settings/pages 에서 **Build and deployment → Source → GitHub Actions**를 선택합니다. 이 패키지에 workflow가 있으므로 별도의 템플릿을 추가할 필요가 없습니다.
7. https://github.com/dhlmed/easi-lab/actions 에서 **Deploy EASI Lab → Run workflow**를 실행합니다. 자동 실행이 성공했다면 다시 실행할 필요가 없습니다.
8. `build`와 `deploy`가 모두 초록색 성공 상태가 되면 https://dhlmed.github.io/easi-lab/ 을 엽니다.

기존 파일이 있는 저장소에서는 업로드 화면의 변경 목록을 확인합니다. 이 패키지는 이름이 같은 홈페이지 파일을 업데이트합니다.

## `.github` 폴더가 업로드되지 않았을 때

저장소에서 **Add file → Create new file**을 선택하고 파일 이름을 `.github/workflows/pages.yml`로 입력합니다. 패키지 안의 같은 파일을 메모장으로 열어 내용을 그대로 붙여 넣고 저장합니다.

## 포함한 내용

- 한·영 정적 페이지 30개와 이전 Research Story 주소용 이동 페이지 2개
- 논문 215편, Selected publications 15편, Research Stories 3편
- 실제 연구 이미지, PI 사진, 이미지로 표시한 이메일, 밝은 라임색 EASI 점
- `/easi-lab/`에 맞춘 메뉴·이미지·언어 전환·연구 제안·논문 필터 링크
- 새 주소의 canonical, hreflang, Open Graph, JSON-LD, sitemap
- 소스 수정 시 검증 후 게시하는 GitHub Actions 설정

이 홈페이지는 HTML/CSS/JavaScript로 동작하며 별도 데이터베이스나 서버 API가 필요하지 않습니다. 문의 기능은 방문자의 이메일 앱에서 초안을 엽니다.

## 이후 내용 수정

| 내용 | 파일 |
| --- | --- |
| 주요 문구, 연구 이야기, 연구 방법, 소속 및 역할 등 | `dist/assets/site-content.json`, `dist/assets/app.js` |
| 논문 목록 | `dist/assets/publications.json` |
| 연구 이미지 및 설명 | `dist/assets/research-slides.json`, `dist/assets/experiments/` |
| 색상과 레이아웃 | `dist/assets/*.css` |
| 홈페이지 주소 | `dist/assets/site-content.json`의 `origin`과 `basePath` |

소스 파일을 기본 브랜치에 저장하면 workflow가 페이지를 다시 생성해 게시합니다. 생성된 HTML 및 데이터 `.js` 파일만 직접 고치면 다음 빌드에서 덮어쓰이므로 원본 JSON이나 `app.js`를 수정합니다.

현재 설정은 `origin: https://dhlmed.github.io`, `basePath: /easi-lab`입니다. 독립 도메인으로 이전할 때는 해당 값과 GitHub Pages 도메인 설정을 함께 변경해야 합니다.

이 GitHub 저장소와 기존 Sites 홈페이지는 별도의 배포 대상입니다. 한쪽 수정이 다른 쪽으로 자동 동기화되지는 않습니다.

## 로컬 빌드 및 검증

Node.js 24를 사용하며 외부 npm 패키지 설치는 필요하지 않습니다.

```bash
node build.mjs
node check.mjs
node check-discovery.mjs
```

배포 폴더는 `dist`입니다. `qa`는 빌드 중 생성되는 확인용 파일이며 Git에 포함하지 않습니다.

패키지 준비 시 위 검증을 통과했습니다. 브라우저의 실제 화면과 GitHub 원격 배포는 준비 환경에서 확인하지 못했습니다. 검색엔진 등록·색인 완료를 의미하지 않습니다.

Sitemap 주소: https://dhlmed.github.io/easi-lab/sitemap.xml

프로젝트 사이트의 `/easi-lab/robots.txt`는 도메인 루트의 `/robots.txt`를 대체하지 않습니다. 검색엔진의 사이트 관리 도구에서는 위 sitemap 주소를 직접 제출할 수 있습니다.

## 연구 이미지 출처

논문 이미지의 출처·저작권·라이선스는 홈페이지의 이미지 설명과 About 페이지에 유지되어 있습니다. 저장소 공개가 제3자 이미지의 추가 이용 권한을 부여하지는 않습니다.

## GitHub 공식 안내

- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
