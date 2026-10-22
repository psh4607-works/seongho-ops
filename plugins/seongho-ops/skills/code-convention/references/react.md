# React와 디자인 시스템

## 디자인 시스템 선택과 확장

1. 프로젝트의 디자인 시스템이 있으면 해당 컴포넌트·토큰·테마·variant·접근성 관례를 우선한다. 먼저 의존성, 공통 UI 디렉토리, 테마 설정과 사용 예시를 확인한다.
2. 없으면 **shadcn/ui를 기반으로 프로젝트 공통 UI 계층을 구성**한다. 프로젝트에서 선택한 headless primitive와 shadcn 컴포넌트 패턴을 바탕으로 상호작용을 구현하고, 스타일은 공통 토큰과 variant로 일관되게 제공한다. shadcn/ui 자체와 그 아래의 headless primitive 계층은 구분한다.
3. 화면에서는 공통 컴포넌트를 가져다 쓴다. 이미 있는 버튼·입력·다이얼로그 등을 화면마다 복제하거나 서로 다른 primitive/스타일 체계를 섞지 않는다.
4. 없는 기능은 기존 컴포넌트의 variant·조합을 먼저 검토하고, 부족하면 공통 UI 계층에 추가한다. 직접 구현하는 경우에도 동일한 토큰·상태·접근성 규약을 따른다.

리뷰만 요청받았다면 부재와 개선 방향을 보고하고 설치하지 않는다. 구현 요청에서 시스템이 없다면 기존 도구와 설치 버전 문서를 확인하여 **요청된 UI에 필요한 범위만** 구축한다. 이 규칙을 이유로 전체 디자인 시스템 구축, 라이브러리 교체, 무관한 화면 재작성을 시작하지 않는다.

### 일관성 기준

- 색상·타이포그래피·간격·radius·elevation을 프로젝트의 의미 있는 토큰으로 연결한다. 실제 토큰 이름과 경로를 확인하며 특정 회사 패키지나 토큰명을 가정하지 않는다.
- Tailwind 간격이 1단위=1px이라고 가정하지 않는다. 현재 테마와 spacing 스케일을 따른다.
- 버튼 등의 크기·강조도·disabled·loading·focus·error 상태는 공통 variant/상태 계약으로 정의한다. 화면별 className 덮어쓰기로 같은 컴포넌트가 다르게 보이게 하지 않는다.
- 화면 고유 레이아웃은 로컬 스타일로 표현할 수 있다. 반복되는 시각·상호작용 규칙을 공통 계층으로 모으고, 모든 여백 조합을 variant로 만들지는 않는다.
- 다크 모드 등 프로젝트의 테마 체계를 유지한다. headless primitive의 키보드 조작·포커스 관리·레이블·ARIA 계약을 래핑 과정에서 보존한다.
- 조건부 클래스와 variant는 프로젝트가 쓰는 유틸리티를 재사용한다. 새로운 유틸리티·라이브러리를 같은 목적으로 중복 도입하지 않는다.

## 컴포넌트 구조

- `'use client'`는 프레임워크의 클라이언트 경계 규약에 따라 필요한 위치에 둔다. Hook 사용만으로 모든 파일에 추가하지 않으며 프로젝트의 CSR/정적 배포 방침을 유지한다.
- 기본 순서: directive → imports → 순수함수/상수·타입 → export 컴포넌트 → 전용 데이터 레이어·fallback·하위 컴포넌트. 선언 의존성과 기존 파일 관례를 고려한다.
- 컴포넌트 안에서는 상태·Hook → 이벤트 핸들러 → JSX 흐름을 유지한다. 이를 표시하기 위한 상투적인 구획 주석을 강제하지 않는다.
- 일반 컴포넌트는 named export를 기본으로 하고 프레임워크가 요구하는 default export는 유지한다.
- Props는 구조분해와 매개변수 기본값을 사용한다. 공통 UI가 외부 레이아웃 확장을 필요로 하면 className을 지원하되 디자인 variant를 우회하는 수단으로 쓰지 않는다.
- export 컴포넌트에 주 JSX가 보이게 한다. 의미 없는 Content/Inner 래퍼만 남기지 않는다. 다만 Hook 호출 규칙이나 독립적인 책임 때문에 하위 컴포넌트가 필요한 경우에는 유지한다.

## 데이터 페칭과 RemoteLayer

- 프로젝트의 query key factory 또는 중앙 관리 체계를 재사용한다. 경로·클라이언트·query key를 화면에서 반복 하드코딩하지 않는다.
- 커스텀 query/mutation Hook은 파일당 하나를 기본으로 하되 기존 query-options factory 등의 일관된 모듈 구성을 임의로 쪼개지 않는다.
- 조건부 요청은 사용 중인 라이브러리·Hook이 실제 지원하는 방식으로 제어한다. 일반 query의 옵션을 suspense query에도 그대로 전달한다고 가정하지 않는다.
- Suspense 기반 페칭이 주 JSX를 가리거나 같은 컴포넌트 내부의 경계로 처리할 수 없는 경우, 페칭을 **render props 형태의 RemoteLayer**로 옮겨 경계 아래에서 실행한다.
- RemoteLayer는 페칭과 최소한의 데이터 변환을 담당한다. UI 상태·라우팅·이벤트 핸들러는 가능한 한 주 컴포넌트에 둔다.
- render prop 인자가 1–2개면 positional, 3개 이상이면 객체 전달을 기본으로 한다. 반환 타입은 ReactNode를 사용한다.
- render prop 콜백 안에서 Hook을 호출하지 않는다. 데이터에 의존하는 Hook이 있으면 Hook 규칙을 지키는 별도 컴포넌트 등 적절한 경계를 선택한다.
- 일반 useQuery 또는 순수 UI에 RemoteLayer·Suspense를 억지로 추가하지 않는다. mutation/이벤트의 오류가 렌더 오류 경계로 자동 처리된다고 가정하지 않는다.
- Suspense/ErrorBoundary fallback은 이름 있는 별도 컴포넌트로 두고 같은 파일에 모은다. ErrorBoundary의 prop 계약은 설치된 구현을 따른다.

구조 예시이며 query Hook·ErrorBoundary API·경로는 프로젝트에 맞춘다:

```tsx
export function UserTable() {
  return (
    <ErrorBoundary fallbackRender={UserTableErrorFallback}>
      <Suspense fallback={<UserTableSkeleton />}>
        <RemoteLayer>
          {(users) => <UsersGrid users={users} />}
        </RemoteLayer>
      </Suspense>
    </ErrorBoundary>
  );
}

function RemoteLayer({ children }: { children: (users: User[]) => ReactNode }) {
  const { data } = useUsersSuspenseQuery();
  return children(data);
}
```

예시의 UsersGrid처럼 의미 있는 UI 단위는 유지할 수 있다. 기존 주 JSX를 단순히 Content라는 이름으로 이동시켜 export 함수를 껍데기로 만드는 것이 목표가 아니다.

## Hook 리팩토링과 파일 분리

- state/ref/props에 직접 의존하지 않는 복잡한 계산은 명시적 인자를 받는 순수함수로 추출한다. 의미 있는 매직 넘버·설정값은 상수로 둔다.
- DOM 조작·리스너처럼 setup/teardown이 짝을 이루는 독립적인 부작용은 cleanup을 반환하는 함수로 캡슐화한다. effect 의존성·cleanup 순서·stale closure를 함께 확인한다.
- 상태와 effect가 강하게 결합되어 있으면 억지로 여러 커스텀 Hook으로 나누지 않는다. Hook 호출 순서와 참조 안정성에 영향을 주는 추출은 동작을 검증한다.
- 전용 순수함수·상수·RemoteLayer·fallback은 기본적으로 같은 파일에 둔다. 실제 외부 재사용 또는 독립적인 큰 책임이 있고 분리가 읽기를 개선할 때 파일을 나눈다.
- Hook 파일 약 200줄, 컴포넌트 파일 약 300줄은 검토 신호다. 강제 제한으로 사용하거나 소규모 헬퍼를 자동 분리하지 않는다.
